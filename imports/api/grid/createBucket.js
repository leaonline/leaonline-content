import { MongoInternals } from 'meteor/mongo'

export const createBucket = bucketName => {
  const options = bucketName ? { bucketName } : undefined
  return new MongoInternals.NpmModule.GridFSBucket(MongoInternals.defaultRemoteCollectionDriver().mongo.db, options)
}
