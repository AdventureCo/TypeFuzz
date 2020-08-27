import { ModuleInterface } from 'modules'
import { DiscordServer } from 'DiscordServer'
import { logger } from 'utility/logger'
import PubSub from 'pubsub-js'
import Discord from 'discord.js'
import { CronJob } from 'cron'
import { insertNewUsers } from './models/insertNewUser'
import { fetchNewUsers } from './models/fetchNewUsers'
import { deleteNewUser } from './models/deleteNewUser'

export class NewUser implements ModuleInterface {
  private readonly server: DiscordServer
  private readonly channel: Discord.TextChannel
  private readonly guild: Discord.Guild|undefined

  private constructor () {
    this.server = DiscordServer.getInstance()
    this.channel = this.server.getChannel('CHANNEL_MUTE')
    this.guild = this.server.getGuild()
  }

  public apply (): void {
    this.addOnJoin()
    this.removeNewRole()
  }

  /**
   * Adds `new user` role on join
   */
  private addOnJoin (): void {
    PubSub.subscribe('event_guildMemberAdd', function (_event: String, user: Discord.GuildMember) {
      const newRole = process.env.ROLE_NEWUSER ?? undefined

      if (newRole !== undefined) {
        user.addRole(newRole).catch(e => {
          logger.log('error', e.message, ...[e.data])
        })

        insertNewUsers(user.id, new Date()).catch(e => {
          logger.log('error', e.message, ...[e.data])
        })
      }
    })
  }

  /**
   * Cron to delete new users
   */
  private removeNewRole (): void {
    const self = this
    const removeAfter = process.env.REMOVE_NEW_AFTER ?? 36
    const newRole = process.env.ROLE_NEWUSER ?? undefined
    const guild = this.guild

    const cron = new CronJob('0 0 0 * * *', function () {
      fetchNewUsers().then(docs => {
        docs.forEach((doc: { added: Date, userId: string }) => {
          const hourDiff = self.getHoursBetweenDates(doc.added, new Date())

          if (hourDiff > removeAfter) {
            if (newRole !== undefined) {
              const user = guild?.members.get(doc.userId)
              user?.removeRole(newRole).catch(e => {
                logger.log('error', e.message, ...[e.data])
              })
            }

            deleteNewUser(doc.userId).catch(e => {
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

  private getHoursBetweenDates (older: Date, newer: Date): number {
    const difference = Math.abs(older.getTime() - newer.getTime())
    const hourDifference = difference / 1000 / 3600

    return hourDifference
  }
}
