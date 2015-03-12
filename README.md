#MTG EDH Life Counter Server
##Dependencies
* docker (*wow that's it? YES*)

##What Do?
* Find your IP Address
* Configure MTG EDH Android App to use http:// **YOUR_IP**:9090
* Run `bin/run.sh`
* Get wrecked by your friends because your deck sucks

##Routes?
| Method  | URI  | Effect  | Example |
|---|---|---|---|
| GET  | /player  | Returns all players in JSON  | /player |
| GET  | /player:position  | Returns player nametag  | /player/1 |
| GET  | /player:position/json  | Returns player-specific JSON  | /player/1/json |
| GET  | /game  | Returns game monitor page (Card popups)  | /game |
| GET  | /update  | Updates player information | /update?position=1&name=jeef111x&commander=Sen Triplets&life=40 |
| GET  | /reset  | Clears all player information  | /reset |
| GET  | /leave/:position  | Clears player information for specified position  | /leave/1 |
