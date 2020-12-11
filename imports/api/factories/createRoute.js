import { Meteor } from 'meteor/meteor'
import { createHTTPFactory } from 'meteor/leaonline:http-factory'
import { Schema } from '../schema/Schema'
import cors from 'cors'

const allowedOrigins = Object
  .values(Meteor.settings.hosts)
  .map(host => host.url)
console.log('[HTTP]: allowed origins', allowedOrigins)

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      callback(new Error(`${origin} is not allowed by CORS`))
    }

    const parsedOrigin = origin.charAt(origin.length - 1) === '/'
      ? origin.substring(0, origin.length - 1)
      : origin

    if (allowedOrigins.includes(parsedOrigin)) {
      callback(null, true)
    }

    else {
      callback(new Error(`${parsedOrigin} is not allowed by CORS`))
    }
  }
}

export const createRoute = createHTTPFactory({
  schemaFactory: Schema.create,
  cors: cors(corsOptions)
})

export const createRoutes = routes => routes.forEach(route => {
  return createRoute(route)
})
