import { ModuleInterface } from 'modules'
import { DiscordServer } from 'DiscordServer'
import { logger } from 'utility/logger'
import PubSub from 'pubsub-js'
import Discord, { RichEmbed } from 'discord.js'

export class MetaLog implements ModuleInterface {
  private readonly server: DiscordServer
  private readonly channel: Discord.TextChannel

  private constructor () {
    this.server = DiscordServer.getInstance()
    this.channel = this.server.getChannel('CHANNEL_METALOG')
  }

  public apply (): void {
    this.listenAndLog()
  }

  /**
   * Listens for events and logs 'em
   */
  private listenAndLog (): void {
    const channel = this.channel

    PubSub.subscribe('module_metaLog', function (_event: String, data: { module: string, message: string, extra?: string }) {
      if (!('module' in data) || !('message' in data)) {
        return
      }

      const embed = new RichEmbed()
        .setTitle(`Module: ${data.module}`)
        .setColor('GREEN')
        .setDescription(data.message)

      if ('extra' in data) {
        embed.addField('Additional', data.extra)
      }

      PubSub.publish('module_publicLog', {
        message: embed
      })

      channel.send(embed).catch(e => {
        logger.log('error', e.message, ...[e.data])
      })
    })
  }
}
