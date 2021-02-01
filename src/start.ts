import { MongoHelper } from 'MongoHelper'
import { logger } from 'utility/logger'
import { DiscordServer } from 'DiscordServer'

// Connect to MongoDB Database
MongoHelper.getInstance().connect().then(() => {
  const startTime: Date = new Date()
  logger.log('info', `Successful startup at ${startTime}`)

  // init our server singleton
  DiscordServer.getInstance()
}).catch(error => {
  logger.log('error', error)
})
