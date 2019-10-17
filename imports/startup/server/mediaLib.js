import { MediaLib } from '../../api/mediaLib/MediaLib'
import { createFilesCollection } from '../../api/factories/createFilesCollection'
import { createPublications } from '../../api/factories/createPublication'
import { createMethods } from '../../api/factories/createMethods'
import { rateLimitMethods, rateLimitPublications } from '../../api/factories/rateLimit'
import { Log } from '../../utils/log'
import { BackendConfig } from '../../api/config/BackendConfig'

const allowedOrigins = new RegExp(Meteor.settings.hosts.backend.urlRegEx)

// { type, name, label, description, schema, content }
BackendConfig.add({
  name: MediaLib.name,
  label: MediaLib.label,
  icon: MediaLib.icon,
  type: 'list',
  fields: {
    name: 1,
    size: 1
  },
  actions: {
    upload: {
      schema: {
        fileId: {
          type: 'String',
          autoform: {
            type: 'fileUpload',
            collection: MediaLib.name,
            accept: 'image/*'
          }
        }
      },
      accept: 'image/*'
    },
    remove: {
      method: MediaLib.methods.remove.name,
      schema: { _id: 'String' }
    }
  },
  roles: ['CRUDMediaLib'], // TODO put in Roles
  group: 'editors', // TODO put in Groups,
  isFilesCollection: MediaLib.isFilesCollection,
  mainCollection: MediaLib.name,
  collections: [
    MediaLib.name
  ],
  publications: [{
    name: MediaLib.publications.all.name,
    schema: MediaLib.publications.all.schema
  }]
})

const onAfterUpload = function (file) {
  // TODO move to gridFs
  // TODO use leaonline:gridfs
}

createFilesCollection({ name: MediaLib.name, allowedOrigins, debug: true, onAfterUpload })

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
    if (!_id|| _id.length === 0) {
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