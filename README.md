#MTG EDH Life Counter Server
##Dependencies
* docker (*wow that's it? YES*)

##What Do?
* Find your IP Address
* Configure MTG EDH Android App to use http:// **YOUR_IP**:9090
* Run `bin/run.sh`
* Get wrecked by your friends because your deck sucks

##Routes?

| URI | Description | Example |
|--------|--------|
| / | By Ajani's Whisker! |
| /game | Stream game view |
| /game/manage | Game manager form |
| /game/reset | Resets current game state |
| /game/message | Updates on screen message |
| /game/nfc | Updates on screen message |
| /player/ | Return all players |
| /player/get/:position/:view | Return specific player (json or card) |/player/get/1/json
| /player/active/:action | Look up or update active | /player/active/update?position=1
| /player/leave/:position | Leave | /player/leave/3
| /player/random | Get Random player |
| /player/update | Update player info |
| /nfc/read | Performs action based on NFC card read | ?tag=uuid
| /nfc/entry | Sends card ID to entry form | ?tag=uuid
| /nfc/write | Updates NFC table with info | ?tag=uuid&action=update&data=wut
| /nfc/lookup | / Just looks up in db | ?tag=uuid
| /card/ | Sends or hides card info | ?card=cardname or ?multiverseid=1234 |