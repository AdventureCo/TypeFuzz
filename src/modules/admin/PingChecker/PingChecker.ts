import { ModuleInterface } from 'modules'
import { DiscordServer } from 'DiscordServer'
import { logger } from 'utility/logger'
import PubSub from 'pubsub-js'
import Discord from 'discord.js'

export class PingChecker implements ModuleInterface {
  private readonly server: DiscordServer

  private constructor () {
    this.server = DiscordServer.getInstance()
  }

  public apply (): void {
    this.messageEvent()
  }

  /**
   * Listens for events and logs 'em
   */
  private messageEvent (): void {
    const newUserRole = process.env.ROLE_NEWUSER ?? undefined
    const muteRole = process.env.ROLE_MUTE ?? undefined
    const mentionThreshold = process.env.PING_THRESHOLD ?? 3

    PubSub.subscribe('event_message', function (_event: String, msg: Discord.Message) {
      try {
        if (msg.member.roles.find(role => role.id === newUserRole) !== null) {
          const totalMentions = msg.mentions.roles.size + msg.mentions.users.size

          if (totalMentions >= mentionThreshold) {
            if (muteRole !== '' && muteRole !== undefined) {
              msg.member.addRole(muteRole).catch(e => {
                logger.log('error', e.message, ...[e.data])
              })

              PubSub.publish('module_metaLog', {
                module: 'PingChecker',
                message: `User ${msg.author} has been muted because they are very new and mentioned too many roles / users`,
                extra: `User has a total of ${totalMentions} mentions in offending message`
              })
            }
          }
        }
      } catch (e) {
        logger.log('error', e.message, ...[e])
      }
    })
  }
}
