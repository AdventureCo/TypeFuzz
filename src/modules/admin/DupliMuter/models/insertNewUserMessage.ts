import { MongoHelper } from 'MongoHelper'
import { Db } from 'mongodb'

/**
 * Insert config into database
 *
 * @param {Boolean} status the configs status
 */
export async function insertNewUserMessage (userId: string, message: string, joinDate: Date): Promise<any> {
  const mongo: Db = MongoHelper.getDatabase()
  const userObj = await mongo.collection('newUserMessages').updateOne({ user: userId }, { $push: { messages: message }, $set: { join: joinDate } }, { upsert: true })

  return userObj
}
