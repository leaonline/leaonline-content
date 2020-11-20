import { Meteor } from 'meteor/meteor'
import { createGridFilesFactory } from 'meteor/leaonline:grid-factory'
import { createBucket } from '../grid/createBucket'
import { createObjectId } from '../grid/createObjectId'
import fs from 'fs'

const i18nFactory = x => x // TODO

export const createFilesCollection = createGridFilesFactory({
  i18nFactory: i18nFactory,
  bucketFactory: createBucket,
  defaultBucket: Meteor.settings.files.bucketName,
  createObjectId: createObjectId,
  fs: fs,
  debug: true
})
