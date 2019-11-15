import { Meteor } from 'meteor/meteor'
import { MongoInternals } from 'meteor/mongo'
import { getCreateFilesCollection } from 'meteor/leaonline:factories/collection/createFilesCollection'
import fs from 'fs'

const i18n = { get (x) { return x } }
const { bucketName } = Meteor.settings
const bucket = new MongoInternals.NpmModule.GridFSBucket(MongoInternals.defaultRemoteCollectionDriver().mongo.db, { bucketName })
const createObjectId = ({ gridFsFileId }) => new MongoInternals.NpmModule.ObjectID(gridFsFileId)

export const createFilesCollection = getCreateFilesCollection({ i18n, fs, bucket, createObjectId })
