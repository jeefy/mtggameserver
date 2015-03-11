var express = require('express')
var fs      = require('fs')
var app     = express()
var swig    = require('swig')

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
  } else {
    res.render('player', players[req.params.position])
  }
})

app.get('/player/', function(req, res){
    res.json(players)
})

app.post('/', function(req, res) {
    for(i in req.body){
      if(i != position){
        players[req.body.position][i] = req.body[i]
      }
    }

    res.json(players[req.body.position])
    /*fs.writeFile('data/'+req.body.position+'.txt', req.body.life, function (err) {
      if (err) throw err
      console.log('Updated player '+req.body.position+' life to ' + req.body.life)
      res.json({})
    })*/
})

var server = app.listen(9090, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})