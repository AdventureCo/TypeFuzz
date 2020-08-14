import { MongoHelper } from 'MongoHelper'
import { Db } from 'mongodb'

/**
 * Deletes message via roleID
 *
 * @param roleId role ID
 */
export async function deleteMessageByRole (roleId: string): Promise<any> {
  const mongo: Db = MongoHelper.getDatabase()
  const message = await mongo.collection('roleMessages').deleteOne({ role: roleId })

  if (message === null || message === undefined) {
    throw new Error('Message not found')
  }

  return true
}
