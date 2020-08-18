import { MongoHelper } from 'MongoHelper'
import { Db } from 'mongodb'

/**
 * Deletes messages in DB via db obj ID
 *
 * @param objId object ID
 */
export async function deleteNewUserMessages (objId: string): Promise<any> {
  const mongo: Db = MongoHelper.getDatabase()
  const obj = await mongo.collection('newUserMessages').deleteOne({ _id: objId })

  if (obj === null || obj === undefined) {
    throw new Error('New user message object not found')
  }

  return true
}
