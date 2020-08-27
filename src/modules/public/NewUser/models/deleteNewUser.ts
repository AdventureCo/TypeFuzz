import { MongoHelper } from 'MongoHelper'
import { Db } from 'mongodb'

/**
 * Delete new user from DB
 *
 * @param {String} userId the userId
 */
export async function deleteNewUser (userId: string): Promise<any> {
  const mongo: Db = MongoHelper.getDatabase()
  const dbObj = await mongo.collection('newUsers').deleteOne({ userId: userId })

  return dbObj
}
