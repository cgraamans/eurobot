# Eurobot

Eurobot is a discord.js bot which provides news, calendar and routing functions to the Forum Gotterfunken Discord server.

## Commands

### Setup
```bash
npm i
npm i -g typescript pm2
```

Must be in posession of:  
- MySQL installed with the database imported from `./sql/init.sql`  
- Google calendar json export  
- Reddit API keys  
- Twitter API keys  
- Mastodon token  
- Telegram token

### Build
```bash
npm run build
```

Note: can run on a raspberry pi but can't be built on on

### Watch
```bash
npm start
```

### Daemonize
```bash
cd dist
pm2 start eurobot.js
```

### Update Discord Commands List

```bash
cd dist
node deploy-commands.js
```

## Environmental variables

```bash
#
# Eurobot
#

# Mysql
export EUROBOT_DB_USERNAME=""
export EUROBOT_DB_PASSWD=""
export EUROBOT_DB=""

# Discord
export EUROBOT_DISCORD=""

# Mastodon
export EUROBOT_MASTO=""

# Reddit
export EUROBOT_REDDIT_CLIENT_ID=""
export EUROBOT_REDDIT_CLIENT_SECRET=""
export EUROBOT_REDDIT_REFRESHTOKEN=""

# Telegram
export EUROBOT_TELEGRAM_TOKEN=""

# Twitter
export EUROBOT_TWITTER_CONSUMER_KEY=""
export EUROBOT_TWITTER_CONSUMER_SECRET=""
export EUROBOT_TWITTER_TOKEN_KEY=""
export EUROBOT_TWITTER_TOKEN_SECRET=""

#Bluesky
export EUROBOT_BLUESKY_KEY=""

```