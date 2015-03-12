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
db.run("CREATE TABLE if not exists log(position NUM, life NUM, name TEXT, commander TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)")

var players    = {}

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

app.get('/', function (req, res) {
  res.send('<h1>BY AJANI\'S WHISKER!</h1><p>You shouldn\'t be here.</p><p>Go play with <a href="/card/entry">Card Entry</a>.')
})

app.use('/static', express.static(__dirname + '/static'))

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
    res.render('player', player)
    log.info('Player ' + req.params.position + ' card')
  }
})

app.get('/player/', function(req, res){
    log.info('Outputting all player info')
    res.json(players)
})

app.get('/game', function(req, res){
  log.info('Viewing game state')
  res.render('game')
})

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
        var commanderName = reqObject[i].replace(' ', '%20')
        var commander     = getCardInfo(commanderName);
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
        'commander':null
      }
    }
    db.run("INSERT INTO log(position, life, name, commander) VALUES (?,?,?,?)",
      position,
      player.life,
      player.name,
      player.commander
    )

})

app.get('/leave/:position', function(req, res){
  var newPlayerObject = {}
  for(i in players){
    if(req.params.position != players[i].position){
      newPlayerObject[i] = players[i]
    }
  }
  players = newPlayerObject
  res.json(players)
  io.sockets.emit('players', players)
  log.info('Player ' + req.params.position + ' has left the game!')
})

app.get('/reset', function(req, res) {
  players = {}
  log.info('Game has been reset!')
  res.json(players)
  io.sockets.emit('players', players)
})

app.get('/nfc', function(req, res){
  console.log(req.query);
  res.json(req.query);
   db.each("SELECT * from nfc where tag=?", req.query.tag, function(err, row) {
      if(row.action == "card"){
        var card = getCardInfo(row.data)
        res.json(card)
        io.sockets.emit('card', card)
      } else if(row.action == "position") {
        res.json(row)
      } else {
        res.json(req.query)
        console.log('nfc wut?')
      }
  });
});

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
app.get('/message', function(req, res){
  io.sockets.emit('message', {'message':req.query.message})
  res.json({'message':req.query.message})
})

app.get('/card/entry', function(req, res){
  res.render('card')
})


io.on('connection', function (socket) {
  socket.emit('yay', { hello: 'world' })
  socket.on('my other event', function (data) {
    console.log(data)
  })
})


server.listen('9090')
