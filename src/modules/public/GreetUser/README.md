## GreetUser module
Sends a greeting to the user on join. 

Sends an in-depth greeting to a `welcome channel` and a quick greeting in the servers general / lounge channel

### Environment variables
- `CHANNEL_WELCOME` welcome channel ID
- `CHANNEL_LOUNGE` general / lounge channel id
- `ROLE_MUTE` the mute role ( used to prevent greeting muted users )
- `LOUNGE_MESSAGE` the message to send in the lounge channel ( use @user to ping user )
- `GREET_MESSAGE` the message to send in the welcome channel ( use @user to ping user )
