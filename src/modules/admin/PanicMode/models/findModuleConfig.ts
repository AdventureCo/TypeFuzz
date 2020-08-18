import { MongoHelper } from 'MongoHelper'
import { Db } from 'mongodb'

/**
 * Finds module config via config ID
 *
 * @param config config name
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
