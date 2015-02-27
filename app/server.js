var express = require('express')
var fs = require('fs')
var app = express()

var app = require('express')()
var bodyParser = require('body-parser')
var multer = require('multer') 

app.use(bodyParser.json()) // for parsing application/json

app.get('/', function (req, res) {
  res.send('<h1>BY AJANI\'S WHISKER!</h1>You shouldn\'t be here.')
})

app.post('/', function(req, res) {
    console.log(req.body.life)
    fs.writeFile('data/'+req.body.position+'.txt', req.body.life, function (err) {
      if (err) throw err
      console.log('Updated player '+req.body.position+' life to ' + req.body.life)
      res.json({})
    })
})

var server = app.listen(9090, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})