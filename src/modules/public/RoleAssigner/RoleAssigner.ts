import { ModuleInterface } from 'modules'
import { DiscordServer } from 'DiscordServer'
import Discord, { RichEmbed, Client } from 'discord.js'
import { logger } from 'utility/logger'
import PubSub from 'pubsub-js'
import { findMessageByRole } from './models/findMessageByRole'
import { insertRoleMessage } from './models/insertRoleMessage'
import { deleteMessageByRole } from './models/deleteMessageByRole'
import { findRoleByMessage } from './models/findRoleByMessage'

export class RoleAssigner implements ModuleInterface {
  private readonly server: DiscordServer
  private readonly channel: Discord.TextChannel
  private readonly guild: Discord.Guild | undefined
  private readonly client: Discord.Client

  private constructor () {
    this.server = DiscordServer.getInstance()
    this.channel = this.server.getChannel('CHANNEL_ROLES')
    this.guild = this.server.getGuild()
    this.client = this.server.getClient()
  }

  public apply (): void {
    this.addRoleMessage()
    this.removeRoleMessage()
    this.updateRoleMessage()
    this.updateUserRoles()
  }

  /**
   * Add new role message to server
   */
  private addRoleMessage (): void {
    const guild = this.guild
    const roleChannel = this.channel
    const server = this.server
    const self = this

    PubSub.subscribe('msg_addRole', async function (_event: String, data: any[]) {
      const react = self.randomAnimal()
      const message: Discord.Message = data[0]
      const roleId: string = String(data[1])
      const userRoles = guild?.members.get(message.author.id)?.roles

      if (userRoles == null || userRoles === undefined || !server.isUserStaff(userRoles)) {
        message.reply('looks like you\'re missing staff perms!').catch(e => {
          logger.log('error', e.message)
        })

        return
      }

      try {
        await findMessageByRole(roleId)
        message.reply('A message for this role already exists').catch(e => {
          logger.log('error', e.message)
        })
      } catch {
        const role: Discord.Role | undefined = await guild?.roles.find(obj => obj.id === roleId) ?? undefined
        const botRole: Discord.Role | undefined = await guild?.roles.find(obj => obj.id === process.env.ROLE_BOT ?? '') ?? undefined

        if (botRole !== undefined && role !== undefined && botRole.position > role.position) {
          const embed = new RichEmbed()
            .setTitle(role.name)
            .setColor(role.color)
            .setDescription(`React below if you'd like the ${role} role`)

          roleChannel.send(embed).then(msg => {
            msg.react(react).catch(e => {
              logger.log('error', e.message, ...[e])
            })
            insertRoleMessage(roleId, msg.id).then(() => {
              message.reply('role added to tracker').catch(e => {
                logger.log('error', e.message)
              })
            }).catch(() => {
              message.reply('something went wrong inserting into the DB!').catch(e => {
                logger.log('error', e.message)
                msg.delete().catch(() => {
                  message.reply('OMG! We couldn\'t delete the message either! FIRE!! Please manually delete it! AHHH!').catch(e => {
                    logger.log('error', e.message)
                  })
                })
              })
            })
          }).catch(e => {
            logger.log('error', e.message)
          })
        } else {
          message.reply('I am unable to find that role in this server or the role is too high').catch(e => {
            logger.log('error', e.message)
          })
        }
      }
    })
  }

  /**
   * Remove role message from server
   */
  private removeRoleMessage (): void {
    const roleChannel = this.channel
    const server = this.server
    const guild = this.guild

    PubSub.subscribe('msg_removeRole', async function (_event: String, data: any[]) {
      const message: Discord.Message = data[0]
      const role: string = String(data[1])
      const userRoles = guild?.members.get(message.author.id)?.roles

      if (userRoles == null || userRoles === undefined || !server.isUserStaff(userRoles)) {
        message.reply('looks like you\'re missing staff perms!').catch(e => {
          logger.log('error', e.message)
        })

        return
      }

      try {
        const msg = await findMessageByRole(role)
        ;(await roleChannel.fetchMessage(msg)).delete().then(() => {
          deleteMessageByRole(role).then(() => {
            message.reply('no longer tracking role').catch(e => {
              logger.log('error', e.message)
            })
          }).catch(() => {
            message.reply('something went wrong in the DB! Please ping Adventure to manually fix entry for this role!').catch(e => {
              logger.log('error', e.message)
            })
          })
        }).catch(e => {
          logger.log('error', e.message)
        })
      } catch (e) {
        logger.log('error', e.message)
      }
    })
  }

  /**
   * Update role message on role update
   */
  private updateRoleMessage (): void {
    const roleChannel = this.channel
    const guild = this.guild

    PubSub.subscribe('event_roleUpdate', async function (_event: String, data: {oldRole: Discord.Role, newRole: Discord.Role}) {
      const roleId: string = String(data.newRole.id)
      const role: Discord.Role | undefined = await guild?.roles.find(obj => obj.id === roleId) ?? undefined
      if (role !== undefined) {
        try {
          const msgId = await findMessageByRole(roleId)
          const msg = await roleChannel.fetchMessage(msgId)

          msg.embeds[0].title = role.name
          msg.embeds[0].description = `React below if you'd like the ${role} role`
          msg.embeds[0].color = role.color

          msg.edit(new Discord.RichEmbed(msg.embeds[0])).catch(e => {
            logger.log('error', e.message)
          })
        } catch (e) {
          logger.log('error', e.message)
        }
      }
    })
  }

  /**
   * Update user role based on reaction
   */
  private updateUserRoles (): void {
    const guild = this.guild
    const client = this.client
    const roleHandler = this.roleHandler

    PubSub.subscribe('raw_MESSAGE_REACTION_ADD', function (_event: String, data: { d: any }) {
      roleHandler(data, false, guild, client).catch(e => {
        logger.log('error', e.message)
      })
    })

    PubSub.subscribe('raw_MESSAGE_REACTION_REMOVE', function (_event: String, data: { d: any }) {
      roleHandler(data, true, guild, client).catch(e => {
        logger.log('error', e.message)
      })
    })
  }

  /**
   * Help function for role assignment
   *
   * @param data packet data
   * @param remove bool to check if we want to remove a role
   * @param guild guild object
   * @param client client object
   */
  private async roleHandler (data: { d: any }, remove: boolean, guild: Discord.Guild | undefined, client: Discord.Client): Promise<any> {
    const eventData = data.d
    const userId = eventData.user_id

    if (userId === client.user.id) return
    const user = guild?.members.find(user => user.id === userId)

    const roleId = await findRoleByMessage(eventData.message_id)
    const role = guild?.roles.find(guildRole => guildRole.id === roleId)
    const hasRole = user?.roles.find(userRoles => userRoles.id === roleId)

    if (hasRole !== undefined && role !== undefined) {
      if (remove) {
        user?.removeRole(role).catch(e => {
          logger.log('error', e.message)
        })
      } else {
        user?.addRole(role).catch(e => {
          logger.log('error', e.message)
        })
      }
    }
  }

  /**
   * Get a random animal emoji
   */
  private randomAnimal (): string {
    const animalArray: any[] = ['🐶', '🐸', '🦊', '🦉', '🦄', '🐍', '🐧', '🐳', '🦜']
    const randomElement = animalArray[Math.floor(Math.random() * animalArray.length)]

    return String(randomElement)
  }
}
