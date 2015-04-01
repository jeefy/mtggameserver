var cards      = require('../lib/cards')
var http_req   = require('sync-request')

exports.getGameState = function(db, gameObj, cb){
    var sql = "SELECT * from game_state where tableid=?"
    //console.log(sql)
    db.all(sql, gameObj.tableid, function(err, rows) {
        if(rows && rows.length == 1){
            cb(rows[0], gameObj)
        } else {
            var newGame = {
                'tableid': gameObj.tableid,
                'cardScreen':JSON.stringify({}),
                'msgScreen':'',
                'active':0
            }
            cb(newGame, gameObj)
        }
    })
}

exports.setGameState = function(db, gameObj, cb){
    var sql = "INSERT OR REPLACE INTO game_state(tableid, active, cardScreen, msgScreen) VALUES (?,?,?,?)"
    //console.log(sql)
    db.run(sql,
        gameObj.tableid,
        gameObj.active,
        JSON.stringify(gameObj.cardScreen),
        gameObj.msgScreen,
        cb(gameObj)
    )
}

exports.getPlayerState = function(db, player, cb){
    //console.log(player)
    if('phoneid' in player){
        var sql = "SELECT * from player_state where phoneid=?"
        //console.log(sql)
        db.all(sql, player.phoneid, function(err, rows) {
            if(rows.length == 1){
                cb(rows[0], player)
            } else {
                cb(false, player)
            }
        })
    }
    else if('tableid' in player){
        if('position' in player){
            var sql = "SELECT * from player_state where tableid=? and position=?"
            //console.log(sql)
            db.all(sql, player.tableid, player.position, function(err, rows) {
                if(rows.length == 1){
                    cb(rows[0], player)
                } else {
                    cb(false, player)
                }
            }) 
        } else {
            var sql = "SELECT * from player_state where tableid=?"
            //console.log(sql)
            db.all(sql, player.tableid, function(err, rows) {
                cb(rows, player)
            })
        }
    }
    else {
        cb(false, false)
    }
}

exports.setPlayerState = function(db, player, cb){
    exports.getPlayerState(db, player, function(playerObj, query){

        if(playerObj != false){
            playerObj = JSON.parse(playerObj.state)
        } else {
            playerObj = {}
        }

        var sql = "INSERT OR REPLACE INTO player_state(phoneid, tableid, position, state) VALUES (?,?,?,?)"
        
        if(('commander' in playerObj && playerObj.commander != player.commander) || !('commander' in playerObj)){
            player['commanderInfo'] = {}
            var commander = false
            if(player.commander){
                var commanderName = player.commander.replace(' ', '%20')
                var commander     = cards.getCardInfo(commanderName, http_req)
            }
            if(commander){
                player['commanderInfo']['multiverseId'] = commander.multiverseid
                player['commanderInfo']['image'] = 'http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=' + commander.multiverseid + '&type=card'
                if(commander.colors != null){
                    player['commanderInfo']['colors'] = commander.colors
                    player['commanderInfo']['manaIcon'] = commander.colors.sort().join('').toLowerCase() + '.png'
                } else {
                    player['commanderInfo']['colors'] = ["Colorless"]
                    player['commanderInfo']['manaIcon'] = 'none.png'
                }
            }
        }

        for(i in player){
            playerObj[i] = player[i]
        }
        player = playerObj

        //console.log(sql)
        db.run(sql,
            player.phoneid,
            player.tableid,
            player.position,
            JSON.stringify(player),
            cb(player, playerObj)
        )
    })
}

//phoneid TEXT, tableid TEXT, event TEXT, data TEXT, timestamp DATETIME
exports.saveEvent = function(db, event, cb){
    var sql = "INSERT INTO events(phoneid, tableid, event, data) values(?, ?, ?, ?);";
    db.run(sql, 
        event.phoneid,
        event.tableid,
        event.event,
        event.data,
        cb(event)
    )
}

exports.getEvents = function(db, event, cb){
    var sql = "SELECT * from events where "
    for(i in event){
        if(i == "stime"){
            sql += "timestamp >= ? and "
        } else if(i == "etime"){
            sql += "timestamp <= ? and "
        } else {
            sql += i + "=? and "
        }
    }
    sql = sql.substr(0, sql.length - 4) + ';'
    //console.log(sql)
    db.all(sql, event, function(err, rows) {
        if(rows.length >= 1){
            cb(rows, event)
        } else {
            cb(false, event)
        }
    })
}

exports.getLogs = function(db, log, cb){
    var sql = "SELECT * from log where "
    var values = Array();
    for(i in log){
        if(i == "sdate"){
            sql += "timestamp >= ? and "
        } else if(i == "edate"){
            sql += "timestamp <= ? and "
        } else {
            sql += i + "=? and "
        }
        values.push(log[i]);
    }
    sql = sql.substr(0, sql.length - 4) + ';'
    console.log(sql)
    db.all(sql, values, function(err, rows) {
        if(err){
            console.log(err);
        }
        if(rows){
            if(rows.length >= 1){
                cb(rows, log)
            } else {
                cb(false, log)
            }
        } else {
            cb(false, log)
        }
    })
}

exports.convertPlayerArray = function(players, cb){
    var PlayersObj = {}
    for(i in players){
        PlayersObj[players[i]['position']] = JSON.parse(players[i]['state'])
    }
    cb(PlayersObj)
}