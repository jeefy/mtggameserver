var state = require('../lib/state')

exports.index = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    log.info('Viewing index')
    res.render('index')
}

exports.monitor = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    log.info('Viewing index')
    res.render('monitor', req.query)
}

exports.game = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    state.getGameState(game.db, req.query, function(gameObj){
        gameObj.cardScreen = JSON.parse(gameObj.cardScreen)

        if("view" in req.query && req.query.view == "json"){
            res.json(gameObj)
        } else {
            log.info('Viewing game state for table ' + gameObj.tableid)
            res.render('game', gameObj)
        }
    })
}

exports.nfc = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    state.getGameState(game.db, req.query, function(gameObj){
        gameObj.cardScreen = JSON.parse(gameObj.cardScreen)
        log.info('Viewing nfc form')
        res.render('nfc', gameObj)
    })
}

exports.manage = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    state.getGameState(game.db, req.query, function(gameObj){
        gameObj.cardScreen = JSON.parse(gameObj.cardScreen)
        log.info('Viewing game manager')
        res.render('manage', game)
    })
}

exports.reset = function(req, res) {
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    game.db.run("delete from player_state where tableid=?", req.query.tableid, function(){
        game.db.run("delete from game_state where tableid=?", req.query.tableid, function(){
            log.info('Game has been reset!')
            res.json({})
            game.io.of(req.query.tableid).emit('players', {})
        })
    })
}

exports.message = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    state.setGameState(game.db, req.query, function(gameObj){
        console.log(gameObj)
        game.io.of(gameObj.tableid).emit('message', {'message':gameObj.msgScreen})
        res.json({'message':gameObj.msgScreen})
    })
}