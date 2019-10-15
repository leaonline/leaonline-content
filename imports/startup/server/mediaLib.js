import { MediaLib } from '../../api/mediaLib/MediaLib'
import { createFilesCollection } from '../../api/factories/createFilesCollection'
import { createPublications } from '../../api/factories/createPublication'
import { Log } from '../../utils/log'

const allowedOrigins = new RegExp(Meteor.settings.hosts.backend.urlRegEx)

const onAfterUpload = function (file) {
  // TODO move to gridFs
  // TODO use leaonline:gridfs
}

createFilesCollection({ name: MediaLib.name, allowedOrigins, debug: true, onAfterUpload })

const publications = Object.values(MediaLib.publications)
createPublications(publications)

WebApp.connectHandlers.use('/media', Meteor.bindEnvironment(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  try {
    const { _id } = req.query
    Log.debug(req.method, req.query)
    if (!_id|| _id.length === 0) {
      res.writeHead(404)
      return res.end()
    }

    const filesDoc = MediaLib.collection().findOne(_id)
    const url = MediaLib.filesCollection().link(filesDoc)
    Log.debug(url)
    res.setHeader('Content-Type', 'application/json;UTF-8')
    res.end(JSON.stringify({ url }))
  } catch (error) {
    Log.error(error)
    res.writeHead(500)
    res.end('internal server error during request')
  }
}))