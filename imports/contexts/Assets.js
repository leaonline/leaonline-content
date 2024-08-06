import { Meteor } from 'meteor/meteor'
import { Assets } from 'meteor/leaonline:corelib/contexts/Assets'
import { notifyAboutError } from '../api/errors/notifyAboutError'
import { createLog } from '../utils/log'

const log = createLog(Assets.name)

Assets.routes.assetUrl.run = async function (req, res, next) {
  const { _id } = this.data()
  const filesDoc = await Assets.collection().findOneAsync(_id)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return Assets.filesCollection().link(filesDoc)
}

Assets.methods.remove.run = async function ({ _id }) {
  const filesCollection = Assets.collection()
  const assetDoc = await filesCollection.findOneAsync(_id)

  if (!assetDoc) {
    const error = new Meteor.Error('errors.docNotFound', 'assets.noDocById', { _id })
    notifyAboutError({ error })
    throw error
  }

  log('file found, remove', assetDoc._id, assetDoc.name)
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
