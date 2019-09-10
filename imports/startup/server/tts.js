import { WebApp } from 'meteor/webapp'
import { TTSFiles } from '../../api/tts/TTSFiles'
import { TTSBackend } from '../../api/tts/TTSEngine'
import { createFilesCollection } from '../../utils/collection'

const TTSFilesCollection = createFilesCollection(TTSFiles)

WebApp.connectHandlers.use('/tts', Meteor.bindEnvironment(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  try {
    const { text } = req.body
    console.log(req.method, req.body, req.query)
    if (!text || text.length === 0) {
      res.writeHead(404)
      return res.end()
    }
    const filesDoc = TTSBackend.get({ text })
    console.log(filesDoc)
    const url = TTSFilesCollection.link(filesDoc)
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ url }))
  } catch (error) {
    console.error(error)
    res.writeHead(500)
    res.end('internal server error during request')
  }
}))