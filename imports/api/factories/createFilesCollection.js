import { Meteor } from 'meteor/meteor'
import { createFilesCollectionFactory } from 'meteor/leaonline:files-collection-factory'
import { createBucket } from '../grid/createBucket'
import { createObjectId } from '../grid/createObjectId'
import fs from 'fs'

const i18nFactory = x => x // TODO
const bucketFactory = createBucket
const defaultBucket = Meteor.settings.files.bucketName

export const createFilesCollection = createFilesCollectionFactory({
  i18nFactory,
  bucketFactory,
  defaultBucket,
  createObjectId,
  fs
})
