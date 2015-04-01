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
                log.info('NFC Card tag scanned ' + req.query.tag)
                req.query.card = row.data
                cardRoute.index(req, res)
                game.io.sockets.emit('card', card)
            } else if(row.action == "active") {
                log.info('NFC Active tag scanned ' + req.query.tag)
                req.query.action  = "update"
                req.query.tableid = row.data
                players.active(req, res)
            } else if(row.action == "position") {
                log.info('NFC Position tag scanned ' + req.query.tag)
                var tableid  = row.data.split('|')[0]
                var position = row.data.split('|')[1]
                res.json({'phoneAction':'update', 'position':position,'tableid':tableid})
            } else {
                res.json({'error':'Unknown method!','query':req.query})
                log.info('NFC Unhandled action scanned ' + req.query.tag)
            }
        } else {
            res.json({'error':'Unknown tag!','query':req.query})
            log.info('NFC Unknown tag scanned ' + req.query.tag)
        }
    })
}

exports.lookup = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    game.db.all("SELECT * from nfc where tag=?", req.query.tag, function(err, rows) {
        if(rows.length > 0){
            res.json(rows[0])
            log.info('Tag lookup for ' + req.query.tag)
        } else {
            log.info('Tag lookup not found for ' + req.query.tag)
            res.json({'error':'Tag not found'})
        }

    })
}

exports.entry = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    var obj  = {'tag':req.query.tag} 
    game.io.sockets.emit('nfc', obj)
    res.json(obj)
    log.info('Tag entry scanned for ' + req.query.tag)
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
    log.info('Tag info updated for ' + req.query.tag)
}