import { createHTTPFactory } from 'meteor/leaonline:http-factory'
import { Schema } from '../schema/Schema'
import { notifyAboutError } from '../errors/notifyAboutError'
import { getCors } from '../middleware/cors/getCors'
import { getCacheControl } from '../middleware/cacheControl/getCacheControl'



export const createRoute = createHTTPFactory({
  schemaFactory: Schema.create,
  cors: getCors(),
  onError (error, method, path) {
    notifyAboutError({ error, method, path })
  },
  debug: function (req, res, next) {
    console.debug('debug', req.method, req.url)
    next()
  },
  cacheControl: getCacheControl()
})

export const createRoutes = routes => routes.forEach(route => {
  console.debug('[createRoute]: ', route.path)
  return createRoute(route)
})
