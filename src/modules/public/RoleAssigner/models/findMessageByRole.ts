import { MongoHelper } from 'MongoHelper'
import { Db } from 'mongodb'

/**
 * Finds message via role ID
 *
 * @param roleId role ID
 */
export async function findMessageByRole (roleId: string): Promise<any> {
  const mongo: Db = MongoHelper.getDatabase()
  const message = await mongo.collection('roleMessages').findOne({ role: roleId }, {
    fields: {
      role: 1,
      message: 1
    }
  })

  if (message === null || message === undefined) {
    throw new Error('Message not found')
  }

  return message.message
}
