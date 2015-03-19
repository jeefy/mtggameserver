exports.index = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    log.info('Viewing index')
    res.render('index')
}

exports.game = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    log.info('Viewing game state')
    res.render('game', game)
}

exports.nfc = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    log.info('Viewing nfc form')
    res.render('nfc', game)
}

exports.manage = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    log.info('Viewing game manager')
    res.render('manage', game)
}

exports.reset = function(req, res) {
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    game.players = {}
    game.active  = 0
    req.app.set('state', game)
    log.info('Game has been reset!')
    res.json(game.players)
    game.io.sockets.emit('players', game.players)
}

exports.message = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    game.io.sockets.emit('message', {'message':req.query.message})
    res.json({'message':req.query.message})
    game.msgScreen = req.query.message
    req.app.set('state', game)
}