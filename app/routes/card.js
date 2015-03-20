var cards = require('../lib/cards')

exports.index = function(req, res){
  var log      = req.app.get('logger')
  var game     = req.app.get('state')
  var http_req = req.app.get('http_req')
  if(req.query.card){
      var card = cards.getCardInfo(req.query.card, http_req)
      res.json({'card':card, 'action':'show'})
      game.io.sockets.emit('card', {'card':card, 'action':'show'})
      game.cardScreen = {'card':card, 'action':'show'}
      req.app.set('state', game)
  } else if (req.query.multiverseid){
      game.io.sockets.emit('card', {'multiverseid':req.query.multiverseid, 'action':'show'})
      res.json({'multiverseid':req.query.multiverseid, 'action':'show'})
      game.cardScreen = {'multiverseid':req.query.multiverseid, 'action':'show'}
      req.app.set('state', game)
  } else {
      game.io.sockets.emit('card', {'action':'hide'})
      res.json({'action':'hide'})
      game.cardScreen = ""
      req.app.set('state', game)
  }
}
