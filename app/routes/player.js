var cards = require('../lib/cards');

exports.index = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    log.info('Outputting all player info')
    res.json(game.players)
}

exports.get = function(req, res){
    var log      = req.app.get('logger')
    var game     = req.app.get('state')
    var position = req.params.position

    if(position in game.players){
        var player = game.players[req.params.position]
    } else {
        var player = {'position': position, 'blank': true, commander: {'manaIcon': 'none.png'}}
    }

    if(req.params.view && req.params.view == "json"){
        res.json(player)
        log.info('Player ' + req.params.position + ' json')
    } else {
        if(req.query.rotate){
            player['rotate'] = req.query.rotate
        }
        player['active'] = game.active
        res.render('player', player)
        log.info('Player ' + req.params.position + ' card')
    }
}

exports.leave = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')

    var newPlayerObject = {}
    for(i in players){
        if(req.params.position != players[i].position){
            newPlayerObject[i] = players[i]
        }
    }
    if(req.params.position == game.active){
        game.active = 0
    }
    game.players = newPlayerObject
    res.json(game.players)
    game.io.sockets.emit('players', game.players)
    log.info('Player ' + req.params.position + ' has left the game!')
    req.app.set('state', game)
}

exports.update = function(req, res) {
    var log       = req.app.get('logger')
    var game      = req.app.get('state')
    var reqObject = req.query
    var position  = reqObject.position
    var players   = game.players

    if(!(position in players)){
        log.info('Initializing player ' + position)
        players[position] = {}
    }

    for(i in reqObject){

        if(i == 'commander' && reqObject[i] != players[position][i]){
            players[position]['commanderInfo'] = {}
            players[position]['commander'] = reqObject[i]
            var commanderName = reqObject[i].replace(' ', '%20')
            var commander         = cards.getCardInfo(commanderName)
            if(commander){
                players[position]['commanderInfo']['multiverseId'] = commander.multiverseid
                players[position]['commanderInfo']['image'] = 'http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=' + commander.multiverseid + '&type=card'
                if(commander.colors != null){
                    players[position]['commanderInfo']['colors'] = commander.colors
                    players[position]['commanderInfo']['manaIcon'] = commander.colors.sort().join('').toLowerCase() + '.png'
                } else {
                    players[position]['commanderInfo']['colors'] = ["Colorless"]
                    players[position]['commanderInfo']['manaIcon'] = 'none.png'
                }
            }
        }
        players[position][i] = reqObject[i]

    }

    log.info('Updated player info for ' + position + ': ' + reqObject)
    res.json(players[position])
    game.io.sockets.emit('players', players)
    if(players[position] != null){
        player = players[position]
    } else {
        player = {
            'position':position,
            'life':null,
            'name':null,
            'commander':null,
            'active':null
        }
    }
    game.db.run("INSERT INTO log(position, life, name, commander) VALUES (?,?,?,?)",
        position,
        player.life,
        player.name,
        player.commander
    )
    game.players = players;
    req.app.set('state', game)

}

exports.random = function(req, res){
    var log    = req.app.get('logger')
    var game   = req.app.get('state')
    var random = false;
    while(random == false){
        var player = Math.floor(Math.random() * 6) + 1
        if(player in game.players){
            random = true
        }
    }
    game.io.sockets.emit('gameMessage', {'message': game.players[player].name})
    res.json(game.players[player])
}

exports.active = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')

    if(req.params.action == "get"){
        res.json({'position':game.active})
    } else if(req.params.action == "update"){
        console.log('Active!')
        console.log(req.query)
        game.active = req.query.position
        game.io.sockets.emit('active', {'position':req.query.position})
        res.json({'position':req.query.position})
        req.app.set('state', game)
        game.db.run("INSERT INTO turn_log(position) VALUES (?)",
            req.query.position
        )
    } else {
        res.json({'error':'Invalid call'})
    }

}