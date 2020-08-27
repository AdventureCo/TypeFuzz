import { ModuleInterface } from 'modules'
import { DiscordServer } from 'DiscordServer'
import { logger } from 'utility/logger'
import PubSub from 'pubsub-js'
import Discord, { RichEmbed } from 'discord.js'

interface InviteObject {
  [key: string]: any
}

export class ModLog implements ModuleInterface {
  private readonly server: DiscordServer
  private readonly channel: Discord.TextChannel
  private readonly guild: Discord.Guild | undefined

  private constructor () {
    this.server = DiscordServer.getInstance()
    this.channel = this.server.getChannel('CHANNEL_LOG')
    this.guild = this.server.getGuild()
  }

  public apply (): void {
    this.logJoin()
    this.logLeave()
    this.logBan()
    this.logEdit()
    this.logDelete()
    this.logNameChange()
  }

  /**
   * Logs user joins
   */
  private logJoin (): void {
    const logChannel = this.channel
    const client = this.server.getClient()
    const invites: InviteObject = {}
    const wait = require('util').promisify(setTimeout)

    client.on('ready', () => {
      wait(1000)

      client.guilds.forEach(g => {
        g.fetchInvites().then(guildInvites => {
          invites[g.id] = guildInvites
        }).catch(e => {
          logger.log('error', e.message)
        })
      })
    })

    PubSub.subscribe('event_guildMemberAdd', async function (_event: String, user: Discord.GuildMember) {
      const embed = new RichEmbed()
        .setTitle('Member Joined')
        .setAuthor(user.user.username, user.user.avatarURL)
        .setColor('GREEN')
        .setThumbnail(user.user.avatarURL)
        .setDescription(`New member ${user.user} joined`)

      try {
        const guildInvites = await user.guild.fetchInvites()
        const ei = invites[user.guild.id]
        invites[user.guild.id] = guildInvites
        const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses)
        const inviter = invite.inviter

        if (Object.keys(invite).length !== 0) {
          embed.addField('Invite Code:', invite.code, true)
          embed.addField('Invite Uses:', invite.uses, true)
        }

        if (inviter.id != null) {
          embed.addField('Invite Creator:', `${inviter}\n${inviter.username}#${inviter.discriminator}(${inviter.id})`)
        }
      } catch (e) {
        logger.log('error', e.message, ...[e.data])
      }

      embed.addField('Bot Account:', user.user.bot)
        .addField('Account Created:', user.user.createdAt)
        .setFooter(`ID: ${user.user.id}`)

      logChannel.send(embed).catch(e => {
        logger.log('error', e.message, ...[e.data])
      })
    })
  }

  /**
   * Logs user leaves ( or kicks! )
   */
  private logLeave (): void {
    const logChannel = this.channel
    const guild = this.guild
    const self = this

    PubSub.subscribe('event_guildMemberRemove', function (_event: String, user: Discord.GuildMember) {
      if (guild === undefined) {
        logger.log('info', 'Not showing leave log due to missing guild param')
        return
      }

      guild.fetchAuditLogs({ type: 20 }).then((logs: Discord.GuildAuditLogs) => {
        const auditLogs = logs.entries.find('target', user.user)
        let minutesSinceCreation = 5

        const embed = new RichEmbed()
          .setColor('ORANGE')
          .setAuthor(`${user.user.username}#${user.user.discriminator} (${user.user.id})`, user.user.displayAvatarURL)
          .setThumbnail(user.user.displayAvatarURL)

        if (auditLogs != null) {
          const createdAt = auditLogs.createdAt
          minutesSinceCreation = self.getMinutesBetweenDates(new Date(createdAt), new Date())
        }

        if (auditLogs != null && minutesSinceCreation < 3) {
          // kicked
          embed.setTitle('User Kicked').setDescription(`User ${user.user} has been kicked by ${auditLogs.executor}`)
        } else {
          // left
          embed.setTitle('User Left').setDescription(`User ${user.user} has left`)
        }

        logChannel.send(embed).catch(e => {
          logger.log('error', e.message, ...[e.data])
        })
      }).catch(e => {
        logger.log('error', e.message, ...[e.data])
      })
    })
  }

  /**
   * Log user bans
   */
  private logBan (): void {
    const logChannel = this.channel
    const self = this

    PubSub.subscribe('event_guildMemberRemove', function (_event: String, user: Discord.GuildMember) {
      const guild: Discord.Guild = user.guild
      let minutesSinceCreation = 5

      guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD' }).then((logs: Discord.GuildAuditLogs) => {
        const auditLogs = logs.entries.find('target', user.user)

        if (auditLogs != null) {
          const createdAt = auditLogs.createdAt
          minutesSinceCreation = self.getMinutesBetweenDates(new Date(createdAt), new Date())
        }

        if (auditLogs != null && minutesSinceCreation < 3) {
          var log = logs.entries.find('target', user.user)
          const embed = new RichEmbed()
            .setColor('RED')
            .setAuthor(`${user.user.username}#${user.user.discriminator} (${user.user.id})`, user.user.displayAvatarURL)
            .setTitle('User Banned')
            .setThumbnail(user.user.displayAvatarURL)
            .setDescription(`User ${user.user} has been banned by ${log.executor}`)

          logChannel.send(embed).catch(e => {
            logger.log('error', e.message, ...[e])
          })
        }
      }).catch(e => {
        logger.log('error', e.message)
      })
    })
  }

  /**
   * Log message edits
   */
  private logEdit (): void {
    const logChannel = this.channel
    PubSub.subscribe('event_messageUpdate', function (_event: String, data: { oldMessage: Discord.Message, newMessage: Discord.Message }) {
      const old = data.oldMessage
      const updated = data.newMessage
      const channel = data.oldMessage.channel

      if ((channel instanceof Discord.TextChannel && !channel.nsfw) && data.newMessage.content !== data.oldMessage.content) {
        const embed = new RichEmbed()
          .setColor('PURPLE')
          .setAuthor(`${old.author.username}#${old.author.discriminator} (${old.author.id})`, old.author.displayAvatarURL)
          .setTitle('Message Edited')
          .setDescription(`Message edited by ${old.author} in ${old.channel}`)
          .addField('Old message', old.content)
          .addField('New message', updated.content)

        logChannel.send(embed).catch(e => {
          logger.log('error', e.message, ...[e])
        })
      }
    })
  }

  /**
   * Log message deletions
   */
  private logDelete (): void {
    const logChannel = this.channel

    PubSub.subscribe('event_messageDelete', function (_event: String, data: Discord.Message) {
      const msg = data
      const channel = msg.channel

      if (channel instanceof Discord.TextChannel && !channel.nsfw) {
        msg.guild.fetchAuditLogs({ type: 'MESSAGE_DELETE' }).then(audit => {
          const entry: any = audit.entries.first()
          let user: any

          // from https://anidiots.guide/coding-guides/using-audit-logs
          if (entry !== undefined && entry.extra.channel.id === msg.channel.id && (entry.target.id === msg.author.id) && (entry.createdTimestamp > (Date.now() - 5000)) && (entry.extra.count >= 1)) {
            user = entry.executor
          } else {
            user = 'Unknown'
          }

          const embed = new RichEmbed()
            .setTitle('Message Deleted')
            .setAuthor(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`, msg.author.displayAvatarURL)
            .setColor('PURPLE')
            .setDescription(`Message By ${msg.author} deleted in ${msg.channel}`)
            .addField('Message Content', msg.content)
            .addField('Deleted By', user)

          logChannel.send(embed).catch(e => {
            logger.log('error', e.message, ...[e])
          })
        }).catch(e => {
          logger.log('error', e.message)
        })
      }
    })
  }

  /**
   * Log name changes
   */
  private logNameChange (): void {
    const logChannel = this.channel

    PubSub.subscribe('event_guildMemberUpdate', function (_event: String, data: { oldMember: Discord.UserProfile, newMember: Discord.UserProfile }) {
      const curUsername = data.oldMember.user.username
      const oldUsername = data.newMember.user.username
      const user = data.newMember.user

      if (oldUsername !== curUsername) {
        console.log('firing')
        const embed = new RichEmbed()
          .setColor('PURPLE')
          .setAuthor(`${curUsername}#${user.discriminator} (${user.id})`, user.displayAvatarURL)
          .setTitle('Username Change')
          .setDescription(`Username changed for ${user}`)
          .addField('Old Username', oldUsername)
          .addField('New Username', curUsername)

        logChannel.send(embed).catch(e => {
          logger.log('error', e.message, ...[e])
        })
      }
    })
  }

  private getMinutesBetweenDates (older: Date, newer: Date): number {
    var difference = Math.abs(older.getTime() - newer.getTime())
    var minuteDifference = difference / 1000 / 60

    return minuteDifference
  }
}
