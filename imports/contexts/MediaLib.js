import { Meteor } from 'meteor/meteor'
import { MediaLib } from 'meteor/leaonline:corelib/contexts/MediaLib'

MediaLib.routes.mediaUrl.run = function (req, res, next) {
  const { _id } = this.data()
  const filesDoc = MediaLib.collection().findOne(_id)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return MediaLib.filesCollection().link(filesDoc)
}

MediaLib.methods.remove.run = function ({ _id }) {
  const filesCollection = MediaLib.collection().filesCollection
  return filesCollection.remove({ _id })
}

MediaLib.maxSize = Meteor.settings.files.maxSize

export { MediaLib }
