import { MongoHelper } from 'MongoHelper'
import { Db } from 'mongodb'

/**
 * Insert message into Database
 *
 * @param {String} roleId the roleID
 * @param {String} messageId the messageId
 */
export async function insertRoleMessage (roleId: string, messageId: string): Promise<any> {
  const mongo: Db = MongoHelper.getDatabase()
  const userObj = await mongo.collection('roleMessages').insertOne({
    message: messageId,
    role: roleId
  })

  return userObj
}
