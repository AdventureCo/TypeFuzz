import Discord, { Collection } from 'discord.js'
import { logger } from 'utility/logger'
import PubSub from 'pubsub-js'
import * as modules from 'modules'

interface ChannelObject {
  [key: string]: any
}

export class DiscordServer {
  private static instance: DiscordServer
  private readonly client: Discord.Client
  private readonly prefix: string
  private readonly channels: ChannelObject
  private guild: Discord.Guild | undefined
  private readonly staffRoles: any[]

  private constructor () {
    this.client = new Discord.Client()
    this.prefix = process.env.BOT_PREFIX ?? '??'
    this.channels = {}
    this.staffRoles = []

    this.login()
  }

  /**
   * Return our class for singleton init
   */
  public static getInstance (): DiscordServer {
    if (DiscordServer.instance == null) {
      DiscordServer.instance = new DiscordServer()
    }

    return DiscordServer.instance
  }

  /**
   * Login to discord bot
   */
  private login (): void {
    this.client.login(process.env.BOT_TOKEN).then(() => {
      this.catchError()
      this.messageListener()
      this.eventListeners()
      this.rawEventListner()
      this.linkChannels()
      this.linkGuild()
      this.loadStaffRoles()
      this.loadModules()
    }).catch(e => {
      logger.log('error', e.message)
    })
  }

  /**
   * Listen for message and send event down pipe
   */
  private messageListener (): void {
    this.client.on('message', msg => {
      const content = msg.content

      if (!content.startsWith(this.prefix)) return false

      const command = content.split(' ')[0].split(this.prefix)[1]
      const data = content.split(this.prefix + command)[1].trim().split(' ')

      PubSub.publish(`msg_${command}`, [msg, data])

      return true
    })
  }

  /**
   * Converts all events to pubsub
   *
   * The reasoning here is to have a consistent
   * interface in which you access discord from
   * in the modules. This has the added benefit
   * that if the API changes, we can account for
   * it here and avoid breaking our modules
   *
   * The downside is that you must type each object
   */
  private eventListeners (): void {
    this.client.on('message', (message) =>
      PubSub.publish('event_message', message))
    this.client.on('channelCreate', (channel) =>
      PubSub.publish('event_channelCreate', channel))
    this.client.on('channelDelete', (channel) =>
      PubSub.publish('event_channelDelete', channel))
    this.client.on('channelPinsUpdate', (channel, time) =>
      PubSub.publish('event_channelPinsUpdate', { channel: channel, time: time }))
    this.client.on('channelUpdate', (oldChannel, newChannel) =>
      PubSub.publish('event_channelUpdate', { oldChannel: oldChannel, newChannel: newChannel }))
    this.client.on('emojiCreate', (emoji) =>
      PubSub.publish('event_emojiCreate', emoji))
    this.client.on('emojiDelete', (emoji) =>
      PubSub.publish('event_emojiDelete', emoji))
    this.client.on('emojiUpdate', (oldEmoji, newEmoji) =>
      PubSub.publish('event_emojiUpdate', { oldEmoji: oldEmoji, newEmoji: newEmoji }))
    this.client.on('guildBanAdd', (guild, user) =>
      PubSub.publish('event_guildBanAdd', { guild: guild, user: user }))
    this.client.on('guildBanRemove', (guild, user) =>
      PubSub.publish('event_guildBanRemove', { guild: guild, user: user }))
    this.client.on('guildUnavailable', (guild) =>
      PubSub.publish('event_guildUnavailable', guild))
    this.client.on('guildIntegrationsUpdate', (guild) =>
      PubSub.publish('event_guildIntegrationsUpdate', guild))
    this.client.on('guildMemberAdd', (member) =>
      PubSub.publish('event_guildMemberAdd', member))
    this.client.on('guildMemberAvailable', (member) =>
      PubSub.publish('event_guildMemberAvailable', member))
    this.client.on('guildMemberRemove', (member) =>
      PubSub.publish('event_guildMemberRemove', member))
    this.client.on('guildMemberSpeaking', (member, speaking) =>
      PubSub.publish('event_guildMemberSpeaking', { member: member, speaking: speaking }))
    this.client.on('guildMemberUpdate', (oldMember, newMember) =>
      PubSub.publish('event_guildMemberUpdate', { oldMember: oldMember, newMember: newMember }))
    this.client.on('guildUpdate', (oldGuild, newGuild) =>
      PubSub.publish('event_guildUpdate', { oldGuild: oldGuild, newGuild: newGuild }))
    this.client.on('inviteCreate', (invite) =>
      PubSub.publish('event_inviteCreate', invite))
    this.client.on('inviteDelete', (invite) =>
      PubSub.publish('event_inviteDelete', invite))
    this.client.on('messageDelete', (message) =>
      PubSub.publish('event_messageDelete', message))
    this.client.on('messageReactionRemoveAll', (message) =>
      PubSub.publish('event_messageReactionRemoveAll', message))
    this.client.on('messageReactionRemoveEmoji', (reaction) =>
      PubSub.publish('event_messageReactionRemoveEmoji', reaction))
    this.client.on('messageReactionAdd', (messageReaction, user) =>
      PubSub.publish('event_messageReactionAdd', { messageReaction: messageReaction, user: user }))
    this.client.on('messageReactionRemove', (messageReaction, user) =>
      PubSub.publish('event_messageReactionRemove', { messageReaction: messageReaction, user: user }))
    this.client.on('messageUpdate', (oldMessage, newMessage) =>
      PubSub.publish('event_messageUpdate', { oldMessage: oldMessage, newMessage: newMessage }))
    this.client.on('presenceUpdate', (oldPresence, newPresence) =>
      PubSub.publish('event_presenceUpdate', { oldPresence: oldPresence, newPresence: newPresence }))
    this.client.on('roleCreate', (role) =>
      PubSub.publish('event_roleCreate', role))
    this.client.on('roleDelete', (role) =>
      PubSub.publish('event_roleDelete', role))
    this.client.on('roleUpdate', (oldRole, newRole) =>
      PubSub.publish('event_roleUpdate', { oldRole: oldRole, newRole: newRole }))
    this.client.on('typingStart', (channel, user) =>
      PubSub.publish('event_typingStart', { channel: channel, user: user }))
    this.client.on('userUpdate', (oldUser, newUser) =>
      PubSub.publish('event_userUpdate', { oldUser: oldUser, newUser: newUser }))
    this.client.on('webhookUpdate', (channel) =>
      PubSub.publish('event_webhookUpdate', channel))
  }

  /**
   * Publish raw events down the chain
   */
  private rawEventListner (): void {
    this.client.on('raw', (event: any) => {
      PubSub.publish(`raw_${event.t}`, event)
    })
  }

  /**
   * Link all channels to a DiscordChannel
   * object for use in our modules
   */
  private linkChannels (): void {
    for (const property in process.env) {
      if (property.includes('CHANNEL')) {
        const channelId = process.env[property] ?? ''
        this.channels[property] = this.client.channels.get(channelId)
      }
    }
  }

  /**
   * Link our guild
   */
  private linkGuild (): void {
    const guildId = process.env.GUILD ?? ''
    this.guild = this.client.guilds.get(guildId)
  }

  /**
   * Catches and logs discordjs errors
   */
  private catchError (): void {
    this.client.on('error', function (error) {
      logger.log('error', error.message, ...[error])
    })
  }

  /**
   * Loads our modules
   */
  private loadModules (): void {
    for (const name of Object.keys(modules)) {
      const Module = (modules as any)[name]
      if (typeof Module === 'function') {
        try {
          new Module().apply()
        } catch (e) {
          logger.log('error', e.message)
        }
      }
    }
  }

  /**
   * Loads our staff roles into singleton
   */
  private loadStaffRoles (): void {
    for (const property in process.env) {
      const role = process.env[property]
      if (property.includes('ROLE_STAFF') && role !== null && role !== undefined) {
        this.staffRoles.push(role)
      }
    }
  }

  /**
   * Checks user roles against known staff
   *
   * Checks to see if a user has a staff role
   * and returns a bool for the result
   *
   * @param roles list of user roles
   * @returns {boolean} result of staff check
   */
  public isUserStaff (roles: Collection<any, any>|undefined): boolean {
    let auth = false

    if (roles !== undefined) {
      roles.forEach((roleObj: Discord.Role) => {
        if (this.staffRoles.includes(roleObj.id)) {
          auth = true
        }
      })
    }

    return auth
  }

  /**
   * Returns the channel object your requested
   * channel
   *
   * @param channel requested channel from env var declaration
   */
  public getChannel (channel: string): Discord.TextChannel {
    return this.channels[channel]
  }

  /**
   * Return our guild
   */
  public getGuild (): Discord.Guild | undefined {
    return this.guild
  }

  /**
   * Return our client
   */
  public getClient (): Discord.Client {
    return this.client
  }
}
