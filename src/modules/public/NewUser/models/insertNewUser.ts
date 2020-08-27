import { MongoHelper } from 'MongoHelper'
import { Db } from 'mongodb'

/**
 * Insert new user into database
 *
 * @param {String} userId the userId
 * @param {Date} added the date the role was aded
 */
export async function insertNewUsers (userId: string, added: Date): Promise<any> {
  const mongo: Db = MongoHelper.getDatabase()
  const dbObj = await mongo.collection('newUsers').insertOne({ userId: userId, added: added })

  return dbObj
}
