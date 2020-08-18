import { MongoHelper } from 'MongoHelper'
import { Db } from 'mongodb'

/**
 * Fetches all new user messages by userId
 *
 * @param {String} userId userId
 */
export async function fetchNewUserMessages (userId: string): Promise<any> {
  const mongo: Db = MongoHelper.getDatabase()
  const userObj = await mongo.collection('newUserMessages').findOne({ user: userId }, {
    fields: {
      messages: 1
    }
  })

  if (userObj === null || userObj === undefined) {
    throw new Error('Message not found')
  }

  return userObj.messages
}
