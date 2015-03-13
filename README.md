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
| GET  | /player:position  | Returns player nametag sideways  | /player/1?rotate=1 (or 2) |
| GET  | /player:position/json  | Returns player-specific JSON  | /player/1/json |
| GET  | /game  | Returns game monitor page (Card/message popups)  | /game |
| GET  | /update  | Updates player information | /update?position=1&name=jeef111x&commander=Sen Triplets&life=40 |
| GET  | /reset  | Clears all player information  | /reset |
| GET  | /leave/:position  | Clears player information for specified position  | /leave/1 |
| GET  | /nfc | Loads NFC Data (eventually!) | /nfc?tag=:uuid |
| GET  | /manage | Loads card/message entry screen | /manage |
| GET  | /active/update | Updates current active player | /active/update?position=1 |
| GET  | /active | Returns current active player | /active |
| GET  | /message | Sets current on-screen message | /message?message=OH SNAP GURRRL |

