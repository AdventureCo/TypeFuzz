import { MongoHelper } from 'MongoHelper'
import { Db } from 'mongodb'

/**
 * Finds role via message ID
 *
 * @param messageId message id
 */
export async function findModuleConfig (config: string): Promise<any> {
  const mongo: Db = MongoHelper.getDatabase()
  const configStatus = await mongo.collection('moduleConfig').findOne({ config: config }, {
    fields: {
      enabled: 1
    }
  })

  if (configStatus === null || configStatus === undefined) {
    throw new Error('Message not found')
  }

  return configStatus.enabled
}
