import { MongoHelper } from 'MongoHelper'
import { Db } from 'mongodb'

/**
 * Insert config into database
 *
 * @param {Boolean} status the configs status
 */
export async function insertModuleConfig (status: boolean): Promise<any> {
  const mongo: Db = MongoHelper.getDatabase()
  const userObj = await mongo.collection('moduleConfig').update({ config: 'PanicMode' }, { $set: { enabled: status } }, { upsert: true })

  return userObj
}
