import { Meteor } from 'meteor/meteor'
import { MediaLib } from 'meteor/leaonline:corelib/contexts/MediaLib'
import { notifyAboutError } from '../api/errors/notifyAboutError'

// Media Lib is explicitly public so any app can access them
MediaLib.isPublic = true

MediaLib.routes.mediaUrl.run = function (req, res, next) {
  const { _id } = this.data()
  const filesDoc = MediaLib.collection().findOne(_id)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return MediaLib.filesCollection().link(filesDoc)
}

MediaLib.methods.remove.run = async function ({ _id }) {
  const filesCollection = MediaLib.collection()
  const mediaDoc = filesCollection.findOne(_id)

  if (!mediaDoc) {
    const error = new Meteor.Error('errors.docNotFound', 'mediaLib.noDocById', { _id })
    notifyAboutError({ error })
    throw error
  }

  console.debug('file found, remove', mediaDoc._id, mediaDoc.name)
  const remove = () => new Promise((resolve, reject) => {
    mediaDoc.remove(error => {
      if (error) return reject(error)
      resolve(true)
    })
  })

  return await remove()
}

MediaLib.maxSize = Meteor.settings.files.maxSize

delete MediaLib.publications.all

export { MediaLib }
