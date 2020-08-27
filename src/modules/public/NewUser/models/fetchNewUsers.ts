import { MongoHelper } from 'MongoHelper'
import { Db } from 'mongodb'

/**
 * Fetches all new users with role
 */
export async function fetchNewUsers (): Promise<any> {
  const mongo: Db = MongoHelper.getDatabase()
  const dbObj = await mongo.collection('newUsers').find().toArray()

  if (dbObj === null || dbObj === undefined) {
    throw new Error('Message not found')
  }

  return dbObj
}
