import { Meteor } from 'meteor/meteor'
import { Magic, MAGIC_MIME_TYPE } from 'mmmagic'
import mime from 'mime-types'

export const getCheckMime = i18nFactory => (uploadedFile) => {
  const magic = new Magic(MAGIC_MIME_TYPE)
  return new Promise((resolve, reject) => {
    magic.detectFile(uploadedFile.path, Meteor.bindEnvironment((err, mimeType) => {
      const lookup = mime.lookup(uploadedFile.path)
      if (err) {
        reject(err)
      }
      else if (!lookup || lookup.indexOf(mimeType) === -1) {
        const errorMessage = i18nFactory('filesCollection.mimeError', { expected: lookup, got: mimeType })
        reject(new Error(errorMessage))
      }
      else {
        resolve(true)
      }
    }))
  })
}
