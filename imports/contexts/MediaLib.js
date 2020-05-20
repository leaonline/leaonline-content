import { Meteor } from 'meteor/meteor'
import { MediaLib } from 'meteor/leaonline:interfaces/contexts/MediaLib'

MediaLib.routes.mediaUrl.run = function (req, res, next) {
  const { _id } = this.data()
  const filesDoc = MediaLib.collection().findOne(_id)
  return MediaLib.filesCollection().link(filesDoc)
}

MediaLib.maxSize = Meteor.settings.files.maxSize

export { MediaLib }
