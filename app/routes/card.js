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
  } else if (req.query.multiverseid){
      game.io.of(req.query.tableid).emit('card', {'card':{'multiverseid':req.query.multiverseid}, 'action':'show'})
      res.json({'card':{'multiverseid':req.query.multiverseid}, 'action':'show'})
      cardScreen = {'card':{'multiverseid':req.query.multiverseid}, 'action':'show'}
  } else {
      game.io.of(req.query.tableid).emit('card', {'action':'hide'})
      res.json({'action':'hide'})
      cardScreen = ""
  }
  state.setGameState(game.db, {'tableid':req.query.tableid, 'cardScreen':JSON.stringify(cardScreen)}, function(gameObj){
    console.log("Game updated with cardScreen")
  })

}
