import { ModuleInterface } from 'modules'
import { DiscordServer } from 'DiscordServer'
import { logger } from 'utility/logger'
import PubSub from 'pubsub-js'
import Discord from 'discord.js'

export class ServerCloser implements ModuleInterface {
  private readonly server: DiscordServer
  private readonly channel: Discord.TextChannel

  private constructor () {
    this.server = DiscordServer.getInstance()
    this.channel = this.server.getChannel('CHANNEL_MUTE')
  }

  public apply (): void {
    this.checkStatusOnJoin()
  }

  /**
   * Checks server open status on new member join
   */
  private checkStatusOnJoin (): void {
    const muteRole = process.env.ROLE_MUTE ?? undefined
    const muteChannel = this.channel

    PubSub.subscribe('event_guildMemberAdd', function (_event: String, user: Discord.GuildMember) {
      const openHour = process.env.SERVER_OPEN
      const closeHour = process.env.SERVER_CLOSE
      const currentHour = new Date().getHours()

      if (openHour !== undefined && closeHour !== undefined) {
        if (currentHour < Number(openHour) || currentHour > Number(closeHour)) {
          if (muteRole !== '' && muteRole !== undefined) {
            user.addRole(muteRole).catch(e => {
              logger.log('error', e.message, ...[e.data])
            })

            muteChannel.send(`Howdy ${user.user}! All new users are muted on join during the night ( EST ) to help limit late-night raiders!`).catch(e => {
              logger.log('error', e.message)
            })
          } else {
            logger.log('info', `Wanted to mute ${user.user.username}#${user.user.discriminator}(${user.user.id}) but missing mute role!`)
          }
        }
      }
    })
  }
}
