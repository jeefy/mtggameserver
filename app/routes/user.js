var cards = require('../lib/cards')
var state = require('../lib/state')

exports.index = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    log.info('Outputting all player info')
    console.log(req.query.phoneid)
    game.db.all("select * from log where phoneid=? order by timestamp desc;", req.query.phoneid, function(err, rows){
        res.json(rows)
    })
}