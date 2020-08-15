import { ModuleInterface } from 'modules'
import { DiscordServer } from 'DiscordServer'
import { logger } from 'utility/logger'
import PubSub from 'pubsub-js'
import Discord from 'discord.js'
import * as difflib from 'difflib'

export class DupliMuter implements ModuleInterface {
  private readonly server: DiscordServer

  private constructor () {
    this.server = DiscordServer.getInstance()
  }

  public apply (): void {
    this.checkMessage()
  }

  /**
   * Checks message for duplicated content
   */
  private checkMessage (): void {
    const muteRole = process.env.ROLE_MUTE ?? undefined
    const self = this

    PubSub.subscribe('event_message', function (_event: String, msg: Discord.Message) {
      const message = msg.content
      const scores: any[] = []
      const split = message.match(/\b[\w']+(?:[^\w\n]+[\w']+){0,4}\b/g)

      if (split != null) {
        split.forEach((chunk, index) => {
          split.forEach((chunk2, index2) => {
            if (index !== index2) {
              const s = new difflib.SequenceMatcher(null, chunk, chunk2)
              scores.push(s.ratio())
            }
          })
        })

        const score = Number((self.average(scores) * 100).toFixed())
        console.log(score)
        if (score > 51) {
          if (muteRole !== '' && muteRole !== undefined) {
            msg.member.addRole(muteRole).catch(e => {
              logger.log('error', e.message, ...[e.data])
            })
          } else {
            logger.log('info', `Wanted to mute ${msg.author.username}#${msg.author.discriminator}(${msg.author.id}) but missing mute role!`)
          }
        }
      }
    })
  }

  /**
   * Get average from array
   *
   * @param array array to average
   */
  private average (array: any[]): number {
    const total = array.reduce((acc: number, c: number) => acc + c, 0)
    return total / array.length
  }
}
