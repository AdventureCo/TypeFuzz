import { MongoHelper } from 'MongoHelper'
import { Db } from 'mongodb'

/**
 * Insert message into Database
 *
 * @param {String} roleId the roleID
 * @param {String} messageId the messageId
 */
export async function insertModuleConfig (status: boolean): Promise<any> {
  const mongo: Db = MongoHelper.getDatabase()
  const userObj = await mongo.collection('moduleConfig').update({ config: 'PanicMode' }, { $set: { enabled: status } }, { upsert: true })

  return userObj
}
