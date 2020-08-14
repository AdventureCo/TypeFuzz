## MuteUser module
Mutes users if they fail any of the following conditions on join:
- Name contains symbol known to be used for hate
- Name contains hate speech
- User account is less than X days old

If mute channel exists and is setup via environment variable, sends a message.

### Environment variables
- `CHANNEL_MUTE` mute channel ID 
- `ROLE_MUTE` mute role ID