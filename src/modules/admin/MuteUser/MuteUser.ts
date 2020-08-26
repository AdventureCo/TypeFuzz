import { ModuleInterface } from 'modules'
import { DiscordServer } from 'DiscordServer'
import { logger } from 'utility/logger'
import PubSub from 'pubsub-js'
import Discord from 'discord.js'
import vader from 'vader-sentiment'
import { CronJob } from 'cron'

const muteSymbols = ['卐', '卍', '✠']

export class MuteUser implements ModuleInterface {
  private readonly server: DiscordServer
  private readonly channel: Discord.TextChannel
  private readonly guild: Discord.Guild|undefined

  private constructor () {
    this.server = DiscordServer.getInstance()
    this.channel = this.server.getChannel('CHANNEL_MUTE')
    this.guild = this.server.getGuild()
  }

  public apply (): void {
    this.muteOnJoin()
    this.userMuted()
    this.wipeServerCron()
  }

  /**
   * Mutes user if they're really new
   */
  private muteOnJoin (): void {
    const muteBeforeVar = Number(process.env.MUTE_BEFORE) ?? 3
    const guild = this.guild
    const self = this

    PubSub.subscribe('event_guildMemberAdd', async function (_event: String, user: Discord.GuildMember) {
      const member = user.user
      const userCreated = member.createdAt
      const muteBefore = new Date(userCreated.setDate(new Date().getDate() + muteBeforeVar))
      const muteRole = process.env.ROLE_MUTE ?? undefined
      const guildMember = guild?.member(user)
      const nickname = guildMember != null ? guildMember.displayName : ''

      if (
        (new Date() < muteBefore && muteRole !== undefined) ||
        (self.isTextExcessivelyNegative(member.username) || self.isTextExcessivelyNegative(nickname)) ||
        (muteSymbols.some(sym => member.username.includes(sym)) || muteSymbols.some(sym => nickname.includes(sym)))
      ) {
        if (muteRole != null) {
          try {
            await user.addRole(muteRole)
          } catch (e) {
            logger.log('error', e.message, ...[e.data])
          }
        }
      }
    })
  }

  /**
   * Sends mute user when user gets muted
   */
  private userMuted (): void {
    const muteChannel = this.channel

    PubSub.subscribe('event_guildMemberUpdate', function (_event: String, data: { oldMember: Discord.GuildMember, newMember: Discord.GuildMember }) {
      const existing = data.oldMember.roles.find(role => role.name === 'Muted')
      const role = data.newMember.roles.find(role => role.name === 'Muted')

      if (existing === null && role !== null) {
        const muteMessage = `You're muted right now ${data.oldMember.user}, but a member of staff should be here shortly help out! <@&740060446182080583>`

        muteChannel.send(muteMessage).catch(e => {
          logger.log('error', e.message)
        })
      }
    })
  }

  /**
   * Check text against VADER
   *
   * @param input text to check
   */
  private isTextExcessivelyNegative (input: string): boolean {
    const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(input)
    return intensity.compound < -0.3
  }

  /**
   * CRON that deletes messages every X ( time )
   */
  private wipeServerCron (): void {
    const wipeFreq = process.env.CHANNEL_MUTE_WIP_FREQ ?? 24
    const self = this

    const cron = new CronJob(`0 0 */${wipeFreq} * * *`, function () {
      self.deleteMessages()
    })

    cron.start()
  }

  /**
   * Deletes all messages in channel
   *
   * @param before message to use as lookup
   */
  private deleteMessages (before?: string): string|void {
    const muteRoom = this.channel
    const self = this

    muteRoom.fetchMessages({ limit: 100, before: before }).then((messages: { map: (arg0: (message: Discord.Message) => void) => void, size: number }) => {
      let count = 0

      messages.map((message: Discord.Message) => {
        message.delete().catch(e => {
          logger.log('error', e.message, ...[e.data])
        })

        count++

        if (count === messages.size) {
          self.deleteMessages(message.id)
        }
      })
    }).catch(e => {
      logger.log('error', e.message, ...[e.data])
    })
  }
}
