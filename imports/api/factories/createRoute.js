import { Meteor } from 'meteor/meteor'
import { createHTTPFactory } from 'meteor/leaonline:http-factory'
import { Schema } from '../schema/Schema'
import { ContextRegistry } from '../config/ContextRegistry'
import cors from 'cors'

const allowedOrigins = Object
  .values(Meteor.settings.hosts)
  .map(host => host.url)

const corsImpl = cors({
  origin: function (origin, callback) {
    console.debug('[CORS]: request from', origin)

    if (!origin) {
      callback(new Error(`${origin} is not allowed by CORS`))
      return
    }

    const parsedOrigin = origin.charAt(origin.length - 1) === '/'
      ? origin.substring(0, origin.length - 1)
      : origin

    if (allowedOrigins.includes(parsedOrigin)) {
      callback(null, true)
      return
    }

    callback(new Error(`[HTTP]: ${parsedOrigin} is not allowed by CORS`))
  }
})

export const createRoute = createHTTPFactory({
  schemaFactory: Schema.create,
  cors: corsImpl,
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
  debug: function (req, res, next) {
    console.debug(req.method, req.url)
    next()
  }
})

export const createRoutes = routes => routes.forEach(route => {
  console.debug('[createRoute]: ', route.path)
  return createRoute(route)
})
