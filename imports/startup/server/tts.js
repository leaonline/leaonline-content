import { Meteor } from 'meteor/meteor'
import { WebApp } from 'meteor/webapp'
import { TTSFiles } from '../../api/tts/TTSFiles'
import { TTSBackend } from '../../api/tts/TTSEngine'
import { createFilesCollection } from '../../api/factories/createFilesCollection'
import { Log } from '../../utils/log'

const app = WebApp.connectHandlers

const TTSFilesCollection = createFilesCollection(TTSFiles)

const { allowedOrigins } = Meteor.settings.tts
const { maxChars } = Meteor.settings.tts

app.use('/tts', Meteor.bindEnvironment(function (req, res, next) {
  const { origin } = req.headers
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  next()
}))

app.use('/tts', Meteor.bindEnvironment(function (req, res, next) {
  if (req.body.text && req.body.text.length > maxChars) {
    res.writeHead(400)
    res.end('Bad request. Max size exceeded.')
  }
  else {
    next()
  }
}))

app.use('/tts', Meteor.bindEnvironment(function (req, res, next) {
  try {
    const { text } = req.body
    Log.debug(req.method, req.body, req.query)
    if (!text || text.length === 0) {
      res.writeHead(404)
      return res.end()
    }
    const filesDoc = TTSBackend.get({ text })
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const url = TTSFilesCollection.link(filesDoc)
    Log.debug(url)
    res.setHeader('Content-Type', 'application/json;UTF-8')
    res.end(JSON.stringify({ url }))
  }
  catch (error) {
    Log.error(error)
    res.writeHead(500)
    res.end('internal server error during request')
  }
}))
