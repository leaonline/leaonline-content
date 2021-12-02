import { Meteor } from 'meteor/meteor'
import { Assets } from 'meteor/leaonline:corelib/contexts/Assets'

Assets.routes.assetUrl.run = function (req, res, next) {
  const { _id } = this.data()
  const filesDoc = Assets.collection().findOne(_id)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return Assets.filesCollection().link(filesDoc)
}

Assets.methods.remove.run = function ({ _id }) {
  const filesCollection = Assets.collection().filesCollection
  return filesCollection.remove({ _id })
}

Assets.maxSize = Meteor.settings.files.maxSize

export { Assets }
