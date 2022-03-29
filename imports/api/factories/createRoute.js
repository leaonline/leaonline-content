import { Meteor } from 'meteor/meteor'
import { createHTTPFactory } from 'meteor/leaonline:http-factory'
import { Schema } from '../schema/Schema'
import cors from 'cors'
import { notifyAboutError } from '../errors/notifyAboutError'

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
    notifyAboutError({ error, origin: parsedOrigin })
    callback(error)
  }
})

export const createRoute = createHTTPFactory({
  schemaFactory: Schema.create,
  cors: function(req, res, next) {
    if (!req.headers?.origin) {
      console.debug('[CORS]: request from', req.headers)
    }
    else {
      console.debug('[CORS]: request from', req.headers.origin)
    }
    return corsImpl.call(this, req, res, next)
  },
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
  onError (error, method, path) {
    notifyAboutError({ error, method, path })
  },
  debug: function (req, res, next) {
    console.debug('debug', req.method, req.url)
    next()
  }
})

export const createRoutes = routes => routes.forEach(route => {
  console.debug('[createRoute]: ', route.path)
  return createRoute(route)
})
