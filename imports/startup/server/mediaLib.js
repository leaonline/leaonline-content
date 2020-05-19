import { Meteor } from 'meteor/meteor'
import { WebApp } from 'meteor/webapp'
import { MediaLib } from '../../contexts/MediaLib'

import { createFilesCollection } from '../../api/factories/createFilesCollection'
import { createPublications } from '../../api/factories/createPublication'
import { createMethods } from '../../api/factories/createMethods'
import { rateLimitMethods, rateLimitPublications } from '../../api/factories/rateLimit'
import { Log } from '../../utils/log'
import { ServiceRegistry } from '../../api/config/ServiceRegistry'

// after upload validation
import { getUserCheck } from '../../api/grid/checkuser'
import { getCheckMime } from '../../api/grid/checkMime'

ServiceRegistry.register(MediaLib)



const FilesCollection = createFilesCollection({
  collectionName: MediaLib.name,
  allowedOrigins,
  debug: true,
  validateUser,
  validateMime
})

MediaLib.filesCollection = () => FilesCollection
MediaLib.collection = () => FilesCollection.collection

const publications = Object.values(MediaLib.publications)
createPublications(publications)
rateLimitPublications(publications)

const methods = Object.values(MediaLib.methods)
createMethods(methods)
rateLimitMethods(methods)

// TODO put in WebAppFactory method
WebApp.connectHandlers.use(MediaLib.routes.mediaUrl.path, Meteor.bindEnvironment(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Methods', MediaLib.routes.mediaUrl.methods.join(', '))

  try {
    const { _id } = req.query
    Log.debug(req.method, req.query)
    if (!_id || _id.length === 0) {
      res.writeHead(404)
      return res.end()
    }

    const filesDoc = MediaLib.collection().findOne(_id)
    const url = MediaLib.filesCollection().link(filesDoc)
    Log.debug(url)
    res.setHeader('Content-Type', MediaLib.routes.mediaUrl.returns.contentType)
    res.end(JSON.stringify({ url }))
  } catch (error) {
    Log.error(error)
    res.writeHead(500)
    res.end('internal server error during request')
  }
}))
