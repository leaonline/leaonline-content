import { Meteor } from "meteor/meteor"
import cors from 'cors'
import { notifyAboutError } from '../../errors/notifyAboutError'
import { createLog } from '../../../utils/log'

const debug = createLog('CORS')
const allowedOrigins = Object
  .values(Meteor.settings.hosts)
  .map(host => host.url)

const corsImpl = cors({
  origin: function (origin, callback) {
    if (!origin) {
      callback(null, true)
      return
    }

    const parsedOrigin = origin.charAt(origin.length - 1) === '/'
      ? origin.substring(0, origin.length - 1)
      : origin

    if (allowedOrigins.includes(parsedOrigin)) {
      callback(null, true)
      return
    }

    const error = new Error(`[HTTP]: ${parsedOrigin} is not allowed by CORS`)

    // we only notify if origin contains useful info, since
    // we can't get something out of undefined origin
    if (parsedOrigin && parsedOrigin !== 'undefined') {
      notifyAboutError({ error, origin: parsedOrigin })
    }

    callback(error)
  }
})

/**
 * Returns a ready-to-use cors middleware
 */
export const getCors = () => function(req, res, next) {
  if (!req.headers?.origin) {
    debug('request from', req.headers)
  }
  else {
    debug('request from', req.headers.origin)
  }
  return corsImpl.call(this, req, res, next)
}

/*
cors: function (req, res, next) {
  const url = req.url || ''

  if (url.startsWith('/cdn/storage/')) {
    const split = url.split('/')
    const contextName = split[0] === ''
      ? split[3]
      : split[2]

    const ctx = ContextRegistry.get(contextName)

    if (ctx?.isPublic) {
      console.debug('[CORS]: skip cors on public', contextName)
      // return next()
    }
  }

  return corsImpl(req, res, next)
},
*/