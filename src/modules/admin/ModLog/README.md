## ModLog module
Logs the following events to the console:
- New join, logs:
-- Name
-- Join date
-- Invite used
-- Bot status
- Leave, logs:
-- Kick or user leave
-- If kick, user who kicked
- Bans, logs
-- Banned user
-- User who banned
- Message edit, logs:
-- User
-- Channel
-- Old content
-- New content
- Message delete, logs:
-- User
-- Channel
-- Message
- User name change, logs:
-- User
-- Old name
-- New name

### Environment variables
- `CHANNEL_LOG` log channel ID 
