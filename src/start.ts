import { MongoHelper } from 'MongoHelper'
import { logger } from 'utility/logger'
import * as cronJobs from 'jobs'
import { DiscordServer } from 'DiscordServer'

// Connect to MongoDB Database
MongoHelper.getInstance().connect().then(() => {
  const startTime: Date = new Date()
  logger.log('info', `Successful startup at ${startTime}`)

  // init our server singleton
  DiscordServer.getInstance()

  // init all our cron jobs
  for (const name of Object.keys(cronJobs)) {
    const job = (cronJobs as any)[name]
    if (typeof job === 'object') {
      job.start()
    }
  }
}).catch(error => {
  logger.log('error', error)
})
