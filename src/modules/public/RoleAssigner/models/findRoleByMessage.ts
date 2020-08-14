import { MongoHelper } from 'MongoHelper'
import { Db } from 'mongodb'

/**
 * Finds role via message ID
 *
 * @param messageId message id
 */
export async function findRoleByMessage (messageId: string): Promise<any> {
  const mongo: Db = MongoHelper.getDatabase()
  const roleId = await mongo.collection('roleMessages').findOne({ message: messageId }, {
    fields: {
      role: 1
    }
  })

  if (roleId === null || roleId === undefined) {
    throw new Error('Message not found')
  }

  return roleId.role
}
