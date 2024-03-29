import { Meteor } from 'meteor/meteor'
import { Assets } from 'meteor/leaonline:corelib/contexts/Assets'
import { notifyAboutError } from '../api/errors/notifyAboutError'

Assets.routes.assetUrl.run = function (req, res, next) {
  const { _id } = this.data()
  const filesDoc = Assets.collection().findOne(_id)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return Assets.filesCollection().link(filesDoc)
}

Assets.methods.remove.run = async function ({ _id }) {
  const filesCollection = Assets.collection()
  const assetDoc = filesCollection.findOne(_id)

  if (!assetDoc) {
    const error = new Meteor.Error('errors.docNotFound', 'assets.noDocById', { _id })
    notifyAboutError({ error })
    throw error
  }

  console.debug('file found, remove', assetDoc._id, assetDoc.name)
  const remove = () => new Promise((resolve, reject) => {
    assetDoc.remove(error => {
      if (error) return reject(error)
      resolve(true)
    })
  })

  return await remove()
}

Assets.maxSize = Meteor.settings.files.maxSize

Assets.validateMime = function validateMime ({ extension, mime, file }) {
  // TODO are there any specific validations we need for assets?
  return true
}

delete Assets.publications.all

export { Assets }
