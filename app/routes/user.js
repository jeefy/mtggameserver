var cards = require('../lib/cards')
var state = require('../lib/state')

exports.index = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    log.info('Outputting player history for ' + req.query.phoneid)
    state.getLogs(game.db, req.query, function(logs, query){
        res.json(logs)
    })
}