var cards   = require('../lib/cards')
var players = require('../routes/player.js')
exports.read = function(req, res){
    var log    = req.app.get('logger')
    var game = req.app.get('state')
    res.json(req.query)
    game.db.each("SELECT * from nfc where tag=?", req.query.tag, function(err, row) {
        if(row.action == "card"){
            var card = cards.getCardInfo(row.data)
            res.json(card)
            game.io.sockets.emit('card', card)
        } else if(row.action == "active") {
            req.params.action  = "update"
            players.active(req, res)
        } else if(row.action == "position") {
            res.json({'phoneAction':'update', 'data':row})
        } else {
            res.json({'error':'Unknown method!','query':req.query})
            console.log('nfc wut?')
        }
    })
}

exports.lookup = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    game.db.each("SELECT * from nfc where tag=?", req.query.tag, function(err, row) {
        res.json(row)
    })
}

exports.entry = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    var obj  = {'tag':req.query.tag} 
    game.io.sockets.emit('nfc', obj)
    res.json(obj)
}

exports.write = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    game.db.run("INSERT or replace into nfc(tag, data, action) VALUES (?, ?, ?)",
        req.query.tag,
        req.query.data,
        req.query.action
    )
    res.json({'action':'write'})
}