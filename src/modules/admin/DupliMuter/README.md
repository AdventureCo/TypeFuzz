## DupliMuter module
Mutes users if their message is over X% duplicated content

### Environment variables
- `CHANNEL_MUTE` mute channel ID 
- `ROLE_MUTE` mute role ID
- `HOUR_THRESHOLD` threshold in hours that the user has been in the guild. If user has been here less than this number, we check their messages