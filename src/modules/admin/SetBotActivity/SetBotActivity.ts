import { ModuleInterface } from 'modules'
import { DiscordServer } from 'DiscordServer'
import { logger } from 'utility/logger'

export class SetBotActivity implements ModuleInterface {
  private readonly server: DiscordServer

  private constructor () {
    this.server = DiscordServer.getInstance()
  }

  public apply (): void {
    const client = this.server.getClient()
    const activity = process.env.BOT_ACTIVITY ?? ''

    if (activity !== '') {
      client.user.setActivity(`${activity}`).catch(e => {
        logger.log('error', e)
      })
    }
  }
}
