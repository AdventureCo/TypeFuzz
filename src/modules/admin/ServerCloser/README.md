## ServerCloser module
Closes the server to new joins between X times. If a new user joins when the server is 'closed', they will be muted until a staff member un-mutes them. 

Uses server time.

### Environment variables
- `ROLE_MUTE` mute role ID
- `SERVER_OPEN` the hour to open the server in 24 hour format, ex: `8` for 8am
- `SERVER_CLOSE` the hour to close the server in 24 hour format, ex `22` for 10PM
- `CHANNEL_MUTE` the mute room to send a closed server message