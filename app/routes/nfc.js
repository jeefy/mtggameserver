var cards     = require('../lib/cards')
var cardRoute = require('../routes/card')
var players   = require('../routes/player')

exports.read = function(req, res){
    var log      = req.app.get('logger')
    var game     = req.app.get('state')
    var http_req = req.app.get('http_req')
    game.db.all("SELECT * from nfc where tag=?", req.query.tag, function(err, rows) {
        if(rows && rows.length > 0){
            var row = rows[0]
            if(row.action == "card"){
                req.query.card = row.data
                cardRoute.index(req, res)
                game.io.sockets.emit('card', card)
            } else if(row.action == "active") {
                req.params.action = "update"
                req.query.tableid = row.data
                players.active(req, res)
            } else if(row.action == "position") {
                var tableid  = row.data.split('|')[0]
                var position = row.data.split('|')[1]
                res.json({'phoneAction':'update', 'position':position,'tableid':tableid})
            } else {
                res.json({'error':'Unknown method!','query':req.query})
                console.log('nfc wut?')
            }
        } else {
            res.json({'error':'Unknown tag!','query':req.query})
            console.log('nfc huh?')
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