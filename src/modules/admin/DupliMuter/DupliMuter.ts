import { ModuleInterface } from 'modules'
import { logger } from 'utility/logger'
import PubSub from 'pubsub-js'
import Discord from 'discord.js'
import * as difflib from 'difflib'
import { fetchNewUserMessages } from './models/fetchNewUserMessages'
import { insertNewUserMessage } from './models/insertNewUserMessage'
import { CronJob } from 'cron'
import { fetchAllNewUserMessages } from './models/fetchAllNewUserMessages'
import { deleteNewUserMessages } from './models/deleteNewUserMessages'

export class DupliMuter implements ModuleInterface {
  private constructor () {}

  public apply (): void {
    this.messageEvent()
    this.removeRecordCron()
  }

  /**
   * The message event and data processor
   */
  private messageEvent (): void {
    const self = this

    PubSub.subscribe('event_message', async function (_event: String, msg: Discord.Message) {
      try {
        const message = msg.content
        const split = message.match(/.{1,10}/g)
        const userId = msg.author.id

        if ('member' in msg && 'joinedAt' in msg.member) {
          const joinedAt = new Date(msg.member.joinedAt)
          const hoursInGuild = self.getHoursBetweenDates(joinedAt, new Date())
          let hourThreshold = process.env.HOUR_THRESHOLD ?? 36
          hourThreshold = Number(hourThreshold)

          if (hoursInGuild < hourThreshold && split != null && message.length > 24) {
            self.checkMessage(split, msg)
          }

          try {
            const pastMessages = await fetchNewUserMessages(userId)
            pastMessages.push(message)

            // we want a baseline of X messages to run our checks against
            if (hoursInGuild < hourThreshold && pastMessages.length > 2) {
              self.checkMessage(pastMessages, msg)
            }
          } catch (e) {
            logger.log('error', e.message, ...[e.data])
          }

          insertNewUserMessage(userId, message, joinedAt).catch(e => {
            logger.log('error', e.message, ...[e.data])
          })
        }
      } catch (e) {
        logger.log('error', e.message, ...[e])
      }
    })
  }

  /**
   * Checks message(s) for duplication
   *
   * @param array array of messages to check
   * @param msg discord message object
   */
  private checkMessage (array: any[], msg: Discord.Message): void {
    const muteRole = process.env.ROLE_MUTE ?? undefined
    const scores: any[] = []

    array.forEach((chunk: string, index: number) => {
      array.forEach((chunk2: string, index2: number) => {
        if (index !== index2) {
          const s = new difflib.SequenceMatcher(null, chunk, chunk2)
          scores.push(s.ratio())
        }
      })
    })

    const score = Number((this.average(scores) * 100).toFixed())

    if (score >= 51) {
      if (muteRole !== '' && muteRole !== undefined) {
        msg.member.addRole(muteRole).catch(e => {
          logger.log('error', e.message, ...[e.data])
        })
      } else {
        logger.log('info', `Wanted to mute ${msg.author.username}#${msg.author.discriminator}(${msg.author.id}) but missing mute role!`)
      }

      PubSub.publish('module_metaLog', {
        module: 'DupliMuter',
        message: `User ${msg.author} has been muted because their message(s) are too duplicated`,
        extra: `Users current message and or recent messages are estimated ${score}% duplicated`
      })
    }
  }

  /**
   * Removes new user message history after threshold
   */
  private removeRecordCron (): void {
    const self = this
    const cron = new CronJob('0 0 0 */1 * *', function () {
      fetchAllNewUserMessages().then(messageObjs => {
        messageObjs.forEach((obj: { join: Date, _id: string }) => {
          const hourThreshold = process.env.HOUR_THRESHOLD ?? 36
          const hourDiff = self.getHoursBetweenDates(new Date(obj.join), new Date())
          if (hourDiff >= hourThreshold) {
            deleteNewUserMessages(obj._id).catch(e => {
              logger.log('error', e.message, ...[e.data])
            })
          }
        })
      }).catch(e => {
        logger.log('error', e.message, ...[e.data])
      })
    })

    cron.start()
  }

  /**
   * Get average from array
   *
   * @param array array to average
   */
  private average (array: any[]): number {
    const total = array.reduce((acc: number, c: number) => acc + c, 0)
    return total / array.length
  }

  private getHoursBetweenDates (older: Date, newer: Date): number {
    const difference = Math.abs(older.getTime() - newer.getTime())
    const hourDifference = difference / 1000 / 3600

    return hourDifference
  }
}
