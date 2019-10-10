import { WebApp } from 'meteor/webapp'
import { TTSFiles } from '../../api/tts/TTSFiles'
import { TTSBackend } from '../../api/tts/TTSEngine'
import { createFilesCollection } from '../../utils/collection'
import { Log } from '../../utils/log'

const TTSFilesCollection = createFilesCollection(TTSFiles)

WebApp.connectHandlers.use('/tts', Meteor.bindEnvironment(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

  try {
    const { text } = req.body
    Log.debug(req.method, req.body, req.query)
    if (!text || text.length === 0) {
      res.writeHead(404)
      return res.end()
    }
    const filesDoc = TTSBackend.get({ text })
    const url = TTSFilesCollection.link(filesDoc)
    Log.debug(url)
    res.setHeader('Content-Type', 'application/json;UTF-8')
    res.end(JSON.stringify({ url }))
  } catch (error) {
    Log.error(error)
    res.writeHead(500)
    res.end('internal server error during request')
  }
}))