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


var players    = {}

app.use(bodyParser.json()) 

app.engine('html', swig.renderFile)

app.set('view engine', 'html')
app.set('views', __dirname + '/templates')

app.set('view cache', false)
swig.setDefaults({ cache: false })

app.get('/', function (req, res) {
  res.send('<h1>BY AJANI\'S WHISKER!</h1>You shouldn\'t be here.')
})

app.use('/static', express.static(__dirname + '/static'))

app.get('/player/:position/:view?', function(req, res){
  var position = req.params.position;
  if(position in players){
    var player = players[req.params.position]
  } else {
    var player = {'position': position, 'blank': true}
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

app.post('/', function(req, res) {
    //http://api.mtgapi.com/v2/cards?name=Krenko,%20Mob%20Boss
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
        var url = 'http://api.mtgapi.com/v2/cards?name=' + commanderName
        var commanderInfo = JSON.parse(http_req('GET', url).getBody())
        if(commanderInfo.cards != null){
          var commander = commanderInfo.cards[0]
          players[position]['commanderInfo']['multiverseId'] = commander.multiverseid
          players[position]['commanderInfo']['image'] = commander.images.gatherer
          players[position]['commanderInfo']['colors'] = commander.colors
          players[position]['commanderInfo']['manaIcon'] = commander.colors.sort().join('').toLowerCase() + '.png'
        }
      }
      players[position][i] = reqObject[i]
    }

    log.info('Updated player info for ' + position + ': ' + reqObject)
    res.json(players[reqObject.position])
    io.sockets.emit('players', players)
})

app.post('/leave/:position', function(req, res){
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

app.post('/reset', function(req, res) {
  players = {}
  log.info('Game has been reset!')
  res.json(players)
  io.sockets.emit('players', players)
})


io.on('connection', function (socket) {
  socket.emit('yay', { hello: 'world' })
  socket.on('my other event', function (data) {
    console.log(data)
  })
})


server.listen('9090')
