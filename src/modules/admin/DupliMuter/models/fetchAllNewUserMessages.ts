import { MongoHelper } from 'MongoHelper'
import { Db } from 'mongodb'

/**
 * Fetches all new user messages by userId
 *
 * @param {String} userId userId
 */
export async function fetchAllNewUserMessages (): Promise<any> {
  const mongo: Db = MongoHelper.getDatabase()
  const msgObj = await mongo.collection('newUserMessages').find({}, {
    fields: {
      _id: 1,
      messages: 1,
      join: 1
    }
  })

  if (msgObj === null || msgObj === undefined) {
    throw new Error('Message not found')
  }

  return msgObj
}
