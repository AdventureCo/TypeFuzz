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
    const muteRole = process.env.ROLE_MUTE ?? undefined
    const wait = require('util').promisify(setTimeout)
    const loungeMessageRaw = process.env.LOUNGE_MESSAGE ?? 'Welcome to the server, @user!'
    const greetMessageRaw = process.env.GREET_MESSAGE ?? 'Welcome to the server, @user!'

    PubSub.subscribe('event_guildMemberAdd', async function (_event: String, user: Discord.GuildMember) {
      const greetMessage = greetMessageRaw.replace('@user', `<@${user.user.id}>`)
      const loungeMessage = loungeMessageRaw.replace('@user', `<@${user.user.id}>`)

      wait(5000)

      try {
        await welcomeChannel.send(greetMessage)

        if ((muteRole !== undefined && !user.roles.has(muteRole)) || muteRole === undefined) {
          await loungeChannel.send(loungeMessage)
        }
      } catch (e) {
        logger.log('error', e.message, ...[e])
      }
    })
  }
}
