import { ModuleInterface } from 'modules'
import { DiscordServer } from 'DiscordServer'
import { logger } from 'utility/logger'
import PubSub from 'pubsub-js'
import Discord from 'discord.js'

export class PublicModLog implements ModuleInterface {
  private readonly server: DiscordServer
  private readonly channel: Discord.TextChannel

  private constructor () {
    this.server = DiscordServer.getInstance()
    this.channel = this.server.getChannel('CHANNEL_PUBLIC_MOD_LOG')
  }

  public apply (): void {
    this.listenAndLog()
  }

  /**
   * Listens for events and logs 'em
   */
  private listenAndLog (): void {
    const channel = this.channel

    PubSub.subscribe('module_publicLog', function (_event: String, data: { message: string }) {
      channel.send(data.message).catch(e => {
        logger.log('error', e.message, ...[e.data])
      })
    })
  }
}
