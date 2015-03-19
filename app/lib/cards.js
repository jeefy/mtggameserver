var http_req   = require('sync-request')

exports.getCardInfo = function (card){
  var url = 'http://api.mtgapi.com/v2/cards?name=' + card
  var mtgResponse = JSON.parse(http_req('GET', url).getBody())
  if(mtgResponse.cards != null){
    for(i in mtgResponse.cards){
      if(mtgResponse.cards[i].multiverseid > 0){
        return mtgResponse.cards[i]
      }
    }
  } else {
    return false
  }
}