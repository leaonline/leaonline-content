import { WebApp } from 'meteor/webapp'

const bodyParser = Npm.require('body-parser')
const _app = WebApp.rawConnectHandlers

_app.use(bodyParser.urlencoded({ limit: '100kb', extended: false }))

_app.use(bodyParser.json({ limit: '100kb' }))

_app.use(function (req, res, next) {
  if (req.method.toLowerCase() === 'post') {
    if (req.headers[ 'content-type' ] !== 'application/x-www-form-urlencoded') {
      // Transforms requests which are POST and aren't "x-www-form-urlencoded" content type
      // and they pass the required information as query strings
      console.log('[CONNECT]', 'Transforming a request to form-urlencoded with the query going to the body.')
      req.headers[ 'content-type' ] = 'application/x-www-form-urlencoded'
      req.body = Object.assign({}, req.body, req.query)
    }
    next()
  } else {
    next()
  }
})
