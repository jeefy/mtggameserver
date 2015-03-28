var Logger  = require('basic-logger')

var customConfig = {
    showMillis: false,
    showTimestamp: true
}
var log = new Logger(customConfig)
var http_req   = require('sync-request')
var express    = require('express')
var app        = require('express')()
var server     = require('http').Server(app)
var io         = require('socket.io')(server)
var bodyParser = require('body-parser')
var multer     = require('multer')
var swig       = require('swig')
var sqlite3    = require('sqlite3').verbose()
var db         = new sqlite3.Database('mtg.db')

db.run("CREATE TABLE if not exists nfc(tag TEXT, data TEXT, action TEXT)", function(){
  db.run("CREATE UNIQUE INDEX IF NOT EXISTS nfc_tag_idx on nfc(tag)")
})
db.run("CREATE TABLE if not exists log(tableid TEXT, phoneid TEXT,  position  NUM, life NUM, name TEXT, commander TEXT, active NUM, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)")
db.run("CREATE TABLE if not exists game_state(tableid TEXT, active NUM, cardScreen TEXT, msgScreen  TEXT, timestamp  DATETIME DEFAULT CURRENT_TIMESTAMP)", function(){
  db.run("CREATE UNIQUE INDEX IF NOT EXISTS game_state_idx on game_state(tableid)")
})
db.run("CREATE TABLE if not exists player_state(phoneid TEXT, tableid TEXT, position TEXT, state TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)", function(){
  db.run("CREATE INDEX IF NOT EXISTS player_state_table on player_state(tableid)")
  db.run("CREATE UNIQUE INDEX IF NOT EXISTS player_state_idx on player_state(phoneid)")
  db.run("CREATE UNIQUE INDEX IF NOT EXISTS player_state_table_position on player_state(tableid,position)")
})

app.set('http_req', http_req)
app.set('logger', log)
app.set('state', {
  players: {},
  active: 0,
  cardScreen: "",
  msgScreen: "",
  db: db,
  io: io
})

var game       = require('./routes/game')
var card       = require('./routes/card')
var player     = require('./routes/player')
var nfc        = require('./routes/nfc')
var gameSocket = require('./routes/socket')

app.use(bodyParser.json()) 

app.engine('html', swig.renderFile)

app.set('view engine', 'html')
app.set('views', __dirname + '/templates')

app.set('view cache', false)
swig.setDefaults({ cache: false })

/*

  Express events
  
*/

app.use('/static', express.static(__dirname + '/static'))

app.get('/', game.index) // By Ajani's Whisker!
app.get('/game/', game.game) // Stream game view
app.get('/game/monitor', game.monitor) // Real time game stats
app.get('/game/manage', game.manage) // Game manager form
app.get('/game/reset', game.reset) // Resets current game state
app.get('/game/message', game.message) // Updates on screen message
app.get('/game/nfc', game.nfc) // Updates on screen message

//app.get('/player/get/?', player.index) // Return all players for a table
app.get('/player/get', player.get) // Return specific player (?view=json or ?view=card)
app.get('/player/active', player.active) // Look up or update active
app.get('/player/leave', player.leave) // Leave 
app.get('/player/random', player.random) // Get Random player
app.get('/player/update', player.update) // Update player info


app.get('/nfc/read', nfc.read) // Performs action based on NFC card read
app.get('/nfc/entry', nfc.entry) // Sends card ID to entry form
app.get('/nfc/write', nfc.write) // Updates NFC table with info
app.get('/nfc/lookup', nfc.lookup) // Just looks up in db

app.get('/card/', card.index) // Sends or hides card info

/*

  Websocket events

*/

io.on('connection', gameSocket.connection)


server.listen('9090')