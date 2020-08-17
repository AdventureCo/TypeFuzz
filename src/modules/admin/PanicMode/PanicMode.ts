import { ModuleInterface } from 'modules'
import { DiscordServer } from 'DiscordServer'
import { logger } from 'utility/logger'
import PubSub from 'pubsub-js'
import Discord from 'discord.js'
import { insertModuleConfig } from './models/insertModuleConfig'
import { findModuleConfig } from './models/findModuleConfig'

export class PanicMode implements ModuleInterface {
  private readonly server: DiscordServer

  private constructor () {
    this.server = DiscordServer.getInstance()
  }

  public apply (): void {
    this.checkStatusOnJoin()
    this.setModuleStatus()
  }

  /**
   * Checks module status on new member join
   */
  private checkStatusOnJoin (): void {
    const muteRole = process.env.ROLE_MUTE ?? undefined

    PubSub.subscribe('event_guildMemberAdd', async function (_event: String, user: Discord.GuildMember) {
      try {
        const status = await findModuleConfig('PanicMode')

        if (status === true && muteRole !== undefined) {
          user.addRole(muteRole).catch(e => {
            logger.log('error', e.message, ...[e.data])
          })
        }
      } catch (e) {
        logger.log('error', e.message, ...[e.data])
      }
    })
  }

  private setModuleStatus (): void {
    PubSub.subscribe('msg_panicMode', async function (_event: String, data: any[]) {
      const message: Discord.Message = data[0]
      const status = data[1][0] ?? ''

      if ((status != null && status !== undefined) && (status === 'on' || status === 'off')) {
        try {
          const config = status === 'on'
          await insertModuleConfig(config)

          message.reply(`module has been set to: ${status}`).catch(e => {
            logger.log('error', e.message, ...[e.data])
          })
        } catch (e) {
          message.reply('Unable to save config! Please check logs').catch(e => {
            logger.log('error', e.message, ...[e.data])
          })

          logger.log('error', e, message, ...[e.data])
        }
      } else {
        try {
          const status = await findModuleConfig('PanicMode')
          const config = status === true ? 'on' : 'off'

          message.reply(`module is set to: ${config}`).catch(e => {
            logger.log('error', e.message, ...[e.data])
          })
        } catch (e) {
          logger.log('error', e.message, ...[e.data])
        }
      }
    })
  }
}
