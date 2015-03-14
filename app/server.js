var Logger  = require('basic-logger')

var customConfig = {
    showMillis: false,
    showTimestamp: true
}
var log = new Logger(customConfig)
var express    = require('express')
var app        = require('express')()
var server     = require('http').Server(app)
var io         = require('socket.io')(server)
var bodyParser = require('body-parser')
var multer     = require('multer')
var swig       = require('swig')
var http_req   = require('sync-request')
var sqlite3    = require('sqlite3').verbose();
var db         = new sqlite3.Database('mtg.db');

db.run("CREATE TABLE if not exists nfc(tag TEXT, data TEXT, action TEXT)")
db.run("CREATE TABLE if not exists log(position NUM, life NUM, name TEXT, commander TEXT, active NUM, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)")
db.run("CREATE TABLE if not exists turn_log(position NUM, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)")

var players    = {}
var active     = 0;

function getCardInfo(card){
  var url = 'http://api.mtgapi.com/v2/cards?name=' + card
  var mtgResponse = JSON.parse(http_req('GET', url).getBody())
  if(mtgResponse.cards != null){
    for(i in mtgResponse.cards){
      if(mtgResponse.cards[i].multiverseid > 0){
        return mtgResponse.cards[i]
      }
    }
  } else {
    return false;
  }
}

app.use(bodyParser.json()) 

app.engine('html', swig.renderFile)

app.set('view engine', 'html')
app.set('views', __dirname + '/templates')

app.set('view cache', false)
swig.setDefaults({ cache: false })

/*

  Template routes / Static
  
*/

app.use('/static', express.static(__dirname + '/static'))

app.get('/', function (req, res) {
  log.info('Viewing index')
  res.render('index')
})

app.get('/manage', function(req, res){
  log.info('Viewing game manager')
  res.render('manage')
})

app.get('/game', function(req, res){
  log.info('Viewing game state')
  res.render('game')
})

/*

  Read Calls

*/


// View Player JSON or Player Nametag
app.get('/player/:position/:view?', function(req, res){
  var position = req.params.position
  if(position in players){
    var player = players[req.params.position]
  } else {
    var player = {'position': position, 'blank': true, commander: {'manaIcon': 'none.png'}}
  }

  if(req.params.view && req.params.view == "json"){
    res.json(player)
    log.info('Player ' + req.params.position + ' json')
  } else {
    if(req.query.rotate){
      player['rotate'] = req.query.rotate
    }
    player['active'] = active;
    res.render('player', player)
    log.info('Player ' + req.params.position + ' card')
  }
})

//View all player JSON
app.get('/player/', function(req, res){
    log.info('Outputting all player info')
    res.json(players)
})

//View active player
app.get('/active', function(req, res){
  res.json({'position':active})
})

/*
  
  Write / Event calls

*/

//Update player state
app.get('/update', function(req, res) {
    var reqObject = req.query
    var position  = reqObject.position

    if(!(position in players)){
      log.info('Initializing player ' + position)
      players[position] = {}
    }

    for(i in reqObject){

      if(i == 'commander' && reqObject[i] != players[position][i]){
        players[position]['commanderInfo'] = {}
        players[position]['commander'] = reqObject[i]
        var commanderName = reqObject[i].replace(' ', '%20')
        var commander     = getCardInfo(commanderName)
        if(commander){
          players[position]['commanderInfo']['multiverseId'] = commander.multiverseid
          players[position]['commanderInfo']['image'] = 'http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=' + commander.multiverseid + '&type=card'
          if(commander.colors != null){
            players[position]['commanderInfo']['colors'] = commander.colors
            players[position]['commanderInfo']['manaIcon'] = commander.colors.sort().join('').toLowerCase() + '.png'
          } else {
            players[position]['commanderInfo']['colors'] = ["Colorless"]
            players[position]['commanderInfo']['manaIcon'] = 'none.png'
          }
        }
      }
      players[position][i] = reqObject[i]

    }

    log.info('Updated player info for ' + position + ': ' + reqObject)
    res.json(players[position])
    io.sockets.emit('players', players)
    if(players[position] != null){
      player = players[position]
    } else {
      player = {
        'position':position,
        'life':null,
        'name':null,
        'commander':null,
        'active':null
      }
    }
    db.run("INSERT INTO log(position, life, name, commander) VALUES (?,?,?,?)",
      position,
      player.life,
      player.name,
      player.commander
    )

})

//Player leaves action
app.get('/leave/:position', function(req, res){
  var newPlayerObject = {}
  for(i in players){
    if(req.params.position != players[i].position){
      newPlayerObject[i] = players[i]
    }
  }
  if(req.params.position == active){
    active = 0
  }
  players = newPlayerObject
  res.json(players)
  io.sockets.emit('players', players)
  log.info('Player ' + req.params.position + ' has left the game!')
})

//Reset entire gamestate (players, active)
app.get('/reset', function(req, res) {
  players = {}
  active  = 0
  log.info('Game has been reset!')
  res.json(players)
  io.sockets.emit('players', players)
})

//Look up NFC chip in database, do action based on entry
app.get('/nfc', function(req, res){
  console.log(req.query);
  res.json(req.query);
   db.each("SELECT * from nfc where tag=?", req.query.tag, function(err, row) {
      if(row.action == "card"){
        var card = getCardInfo(row.data)
        res.json(card)
        io.sockets.emit('card', card)
      } else if(row.action == "active") {
        res.json(row)
      } else if(row.action == "position") {
        res.json(row)
      } else {
        res.json(req.query)
        console.log('nfc wut?')
      }
  });
});

//Look up card based on Name or multiverseid
//Send card event 
app.get('/card', function(req, res){
  if(req.query.card){
    console.log(req.query.card)
    var card = getCardInfo(req.query.card)
    res.json(card)
    io.sockets.emit('card', card)
  } else if (req.query.multiverseid){
    io.sockets.emit('card', {'multiverseid':req.query.multiverseid})
    res.json({'multiverseid':req.query.multiverseid})
  }
})

//Send on screen message event
app.get('/message', function(req, res){
  io.sockets.emit('message', {'message':req.query.message})
  res.json({'message':req.query.message})
})

//Send active player event
//Update db with active player
app.get('/active/update', function(req, res){
  console.log('Active!')
  console.log(req.query)
  active = req.query.position
  io.sockets.emit('active', {'position':req.query.position})
  res.json({'position':req.query.position})
  db.run("INSERT INTO turn_log(position) VALUES (?)",
    req.query.position
  )
})

/*

  Websocket event handlers

*/

//Initial event, does nothing
io.on('connection', function (socket) {
  socket.emit('yay', { hello: 'world' })
  socket.on('my other event', function (data) {
    console.log(data)
  })
})


server.listen('9090')
