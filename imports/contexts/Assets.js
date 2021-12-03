import { Meteor } from 'meteor/meteor'
import { Assets } from 'meteor/leaonline:corelib/contexts/Assets'

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
    throw new Meteor.Error('errors.docNotFound', 'assets.noDocById', { _id })
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

Assets.validateMime = function ({ extension, mime, file }) {
  // TODO are there any specific validations we need for assets?
  return true
}

export { Assets }
