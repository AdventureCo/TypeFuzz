# Core setup
export BOT_TOKEN=''
export DB_HOST=127.0.0.1
export DB_PORT=27017
export DB_NAME='fuzzbot'

# Channels
export CHANNEL_WELCOME=''
export CHANNEL_ADMIN=''
export CHANNEL_PUBLIC=''
export CHANNEL_LOG=''
export CHANNEL_ROLES=''
export CHANNEL_LOUNGE=''
export CHANNEL_MUTE=''
export CHANNEL_METALOG=''

# Roles
export ROLE_BOT=''
export ROLE_MUTE=''
export ROLE_STAFF_MOD=''
export ROLE_STAFF_ADMIN=''
export ROLE_STAFF_SUPPORT=''

# Messages
export MUTE_MESSAGE="You're muted right now @user, but a member of staff should be here shortly help out!"
export LOUNGE_MESSAGE="Welcome @user!"
export GREET_MESSAGE="Welcome to the server, @user!"

# Utils
export GUILD=''
export MUTE_BEFORE='3'

# Other
export BOT_ACTIVITY=''
export HOUR_THRESHOLD=36
export SERVER_OPEN=8
export SERVER_CLOSE=22

npm run devel
