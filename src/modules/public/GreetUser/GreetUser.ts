import { ModuleInterface } from 'modules'
import { DiscordServer } from 'DiscordServer'
import { logger } from 'utility/logger'
import PubSub from 'pubsub-js'
import Discord from 'discord.js'

export class GreetUser implements ModuleInterface {
  private readonly server: DiscordServer

  private constructor () {
    this.server = DiscordServer.getInstance()
  }

  public apply (): void {
    const welcomeChannel = this.server.getChannel('CHANNEL_WELCOME')
    const loungeChannel = this.server.getChannel('CHANNEL_LOUNGE')

    PubSub.subscribe('event_guildMemberAdd', async function (_event: String, user: Discord.UserProfile) {
      const greetMessage = `Welcome to the server, ${user.user}! Please checkout our <#490979425358446603> and come say henlo in <#528076335818735636>! We have a role system setup in <#624045743870705673>, so feel free to grab all the ones you like uwu \nSee you around the server <:catHi:670697661535617046>`
      const loungeMessage = `Welcome to FuzzSpot ${user.user} <:doggoHi:623972092387524624>`

      try {
        await welcomeChannel.send(greetMessage)
        await loungeChannel.send(loungeMessage)
      } catch (e) {
        logger.log('error', e.message, ...[e])
      }
    })
  }
}
