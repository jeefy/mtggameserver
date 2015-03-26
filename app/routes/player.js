var cards = require('../lib/cards')
var state = require('../lib/state')

/*exports.index = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')
    log.info('Outputting all player info')
    state.getPlayerState(game.db, req.params.tableid, function(players){
        res.json(players)
    })
}*/

exports.get = function(req, res){
    var log      = req.app.get('logger')
    var game     = req.app.get('state')
    state.getPlayerState(game.db, req.query, function(player, query){
        if(!player){
            // Stub out a blank player
            var state  = {'position': query.position, 'tableid':query.tableid, 'phoneid':'none','blank': true, commander: {'manaIcon': 'none.png'}}
            var player = {'position': query.position, 'tableid':query.tableid, 'phoneid':'none', 'state':JSON.stringify(state)}
        } 

        if('state' in player){
            var playerInfo = JSON.parse(player['state'])
        } else {
            //Haphazardly assuming this is multi-record
            var playerInfo = {}
            for(i in player){
                playerInfo[player[i].position] = JSON.parse(player[i].state)
            }
        }
        

        if(!query){
            res.json({'error':'Something seriously broke! Good job!'})
        } else {
            if((query.view && query.view == "json") || ('tableid' in query && !('position' in query))) {
                res.json(playerInfo)
                if(!('state' in player)){
                    log.info('All players for ' + query.tableid + ' in json')
                } else {
                    log.info('Player ' + query.position + ' json')
                }
            } else {
                if(query.rotate){
                    player['rotate'] = query.rotate
                }
                res.render('player', playerInfo)
                log.info('Player ' + query.position + ' card')
            }
        }
    })
}

exports.leave = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')

    state.getPlayerState(game.db, req.query, function(player){
        if(!player){
            res.json({'error':'Player does not exist!'})
            return true
        } else {
            game.db.run('delete from player_state where phoneid=?', player.phoneid, function(){
                player = JSON.parse(player.state)
                player.action = "leave"
                res.json(player)
                game.io.of(req.query.tableid).emit('players', player)
                log.info('Player ' + player.position + ' has left the game at table ' + player.tableid + '!')
            })
        }
    })
}

exports.update = function(req, res) {
    var log    = req.app.get('logger')
    var game   = req.app.get('state')
    state.setPlayerState(game.db, req.query, function(player, oldPlayer){
        log.info('Updated player info for ' + player.position + ' at table ' + player.tableid)
        if(oldPlayer.position != player.position){
            oldPlayer.action = "leave"
            game.io.of(oldPlayer.tableid).emit('players', oldPlayer)
        }
        game.io.of(player.tableid).emit('players', player)
        game.db.run("INSERT INTO log(tableid, phoneid, position, life, name, commander) VALUES (?,?,?,?,?,?)",
            player.tableid,
            player.phoneid,
            player.position,
            player.life,
            player.name,
            player.commander
        )
        res.json(player)
    })
}

exports.random = function(req, res){
    var log    = req.app.get('logger')
    var game   = req.app.get('state')

    game.db.all("select * from player_state where tableid=? order by RANDOM() LIMIT 1;", req.query.tableid, function(data){
        game.io.of(req.query.tableid).emit('gameMessage', {'message': data[0]['name']})
        res.json(data[0])
    })
}

exports.active = function(req, res){
    var log  = req.app.get('logger')
    var game = req.app.get('state')

    if(req.query.action == "get"){
        state.getGameState(game.db, req.query, function(game){
            if(game){
                res.json({'position':game['active']})    
            } else {
                res.json({'position':0})    
            }
            
        })
    } else if(req.query.action == "update"){
        state.getGameState(game.db, req.query, function(gameObj){
            state.setGameState(game.db, gameObj, function(newGameObj){
                game.io.of(req.query.tableid).emit('active', {'position':req.query.position})
                res.json({'position':req.query.position})
            })
        })
    } else {
        res.json({'error':'Invalid call'})
    }

}