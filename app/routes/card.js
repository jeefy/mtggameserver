var cards = require('../lib/cards')
var state = require('../lib/state')

exports.index = function(req, res){
  var log        = req.app.get('logger')
  var game       = req.app.get('state')
  var http_req   = req.app.get('http_req')
  var cardScreen = null;
  if(req.query.card){
      var card = cards.getCardInfo(req.query.card, http_req)
      res.json({'card':card, 'action':'show'})
      game.io.of(req.query.tableid).emit('card', {'card':card, 'action':'show'})
      cardScreen = {'card':card, 'action':'show'}
      log.info('Card name passed to table ' + req.query.tableid + 'for card ' + req.query.card)
  } else if (req.query.multiverseid){
      game.io.of(req.query.tableid).emit('card', {'card':{'multiverseid':req.query.multiverseid}, 'action':'show'})
      res.json({'card':{'multiverseid':req.query.multiverseid}, 'action':'show'})
      cardScreen = {'card':{'multiverseid':req.query.multiverseid}, 'action':'show'}
      log.info('Card multiverseid passed to table ' + req.query.tableid + ' for card ' + req.query.multiverseid)
  } else {
      game.io.of(req.query.tableid).emit('card', {'action':'hide'})
      res.json({'action':'hide'})
      log.info('Card hidden on screen for table ' + req.query.tableid)
      cardScreen = ""
  }
  state.setGameState(game.db, {'tableid':req.query.tableid, 'cardScreen':cardScreen}, function(gameObj){
    log.info("Game updated with cardScreen")
  })

}
