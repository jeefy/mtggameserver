
exports.getCardInfo = function (card, http_req){
  var url = 'https://api.mtgapi.com/v2/cards?name=' + card
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