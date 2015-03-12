#MTG EDH Life Counter Server
##Dependencies
* docker (*wow that's it? YES*)

##What Do?
* Find your IP Address
* Configure MTG EDH Android App to use http:// **YOUR_IP**:9090
* Run `bin/run.sh`
* Get wrecked by your friends because your deck sucks

##Routes?
| Method  | URI  | Effect  | 
|---|---|---|
| GET  | /player  | Returns all players in JSON  |
| GET  | /player:position  | Returns player nametag  |
| GET  | /player:position/json  | Returns player-specific JSON  |
| GET  | /game  | Returns game monitor page (Card popups)  |
| POST  | /player  | Updates player information |
| POST  | /reset  | Clears all player information  |
| POST  | /leave/:position  | Clears player information for specified position  |