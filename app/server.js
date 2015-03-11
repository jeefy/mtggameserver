var express = require('express')
var fs      = require('fs')
var app     = express()
var swig    = require('swig')
var Logger  = require('basic-logger')

var customConfig = {
    showMillis: false,
    showTimestamp: true
}
var log = new Logger(customConfig)

var app = require('express')()
var bodyParser = require('body-parser')
var multer = require('multer')
var players = {'1':{
    name: 'Player Name',
    color: '#000000',
    commander: 'Krenko, Mob Boss',
    life: 40,
    commander_damage: {
      '1':8,
      '2':0,
      '3':0,
      '4':0,
    }
  }
}

app.use(bodyParser.json()) 

app.engine('html', swig.renderFile)

app.set('view engine', 'html')
app.set('views', __dirname + '/templates')

app.set('view cache', false)
swig.setDefaults({ cache: false })

app.get('/', function (req, res) {
  res.send('<h1>BY AJANI\'S WHISKER!</h1>You shouldn\'t be here.')
})

app.get('/player/:position/:view?', function(req, res){
  if(req.params.view && req.params.view == "json"){
    res.json(players[req.params.position])
    log.info('Player ' + req.params.position + ' json')
  } else {
    res.render('player', players[req.params.position])
    log.info('Player ' + req.params.position + ' card')
  }
})

app.get('/player/', function(req, res){
    log.info('Outputting all player info')
    res.json(players)
})

app.post('leave/:position', function(req, res){
  var newPlayerObject = {}
  for(i in players){
    if(req.params.position != i){
      newPlayerObject[i] = players[i]
    }
  }
  players = newPlayerObject
  res.json(players)
  log.info('Player ' + req.params.position + ' has left the game!')
})

app.post('/reset', function(req, res) {
  players = {}
  log.info('Game has been reset!');
  res.json(players);
})

app.post('/', function(req, res) {
    for(i in req.body){
      if(i != position){
        players[req.body.position][i] = req.body[i]
      }
    }
    log.info('Updated player info: ' + req.body)
    res.json(players[req.body.position])

    /*fs.writeFile('data/'+req.body.position+'.txt', req.body.life, function (err) {
      if (err) throw err
      res.json({})
    })*/
})

var server = app.listen(9090, function () {

  var host = server.address().address
  var port = server.address().port

  log.info('Example app listening at http://%s:%s', host, port)

})