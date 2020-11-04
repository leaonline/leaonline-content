import { Meteor } from 'meteor/meteor'
import { createHTTPFactory } from 'meteor/leaonline:http-factory'
import { Schema } from '../schema/Schema'
import cors from 'cors'

const allowedOrigins = (Meteor.settings.hosts.allowedOrigins).map(s => new RegExp(s))
console.log('[HTTP]: allowed origins', allowedOrigins)

const corsOptions = {
  origin: function (origin, callback) {
    if (origin && allowedOrigins.some(pattern => pattern.test(origin))) {
      callback(null, true)
    } else {
      callback(new Error(`${origin} is not allowed by CORS`))
    }
  }
}

export const createRoute = createHTTPFactory({
  schemaFactory: Schema.create,
  cors: cors(corsOptions)
})

export const createRoutes = routes => routes.forEach(createRoute)
