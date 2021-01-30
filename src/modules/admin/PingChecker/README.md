## PingChecker module
Checks to see how many pings are in new users message. If greater than threshold, mute our user

### Environment variables
- `ROLE_MUTE` mute role
- `CHANNEL_MUTE` metalog channel ID 
- `PING_THRESHOLD` how many ping in one message trigger an action. Defaults to 3
- `ROLE_NEWUSER` the new user role
