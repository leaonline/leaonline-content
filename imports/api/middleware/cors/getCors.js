import cors from 'cors'
import { notifyAboutError } from '../../errors/notifyAboutError'
import { createLog } from '../../../utils/log'
import { getAllowedOrigins } from '../../origins/getAllowedOrigins'

const debug = createLog('CORS')
const allowedOrigins = getAllowedOrigins()

const corsImpl = cors({
  origin: function (origin, callback) {
    if (!origin) {
      callback(null, true)
      return
    }

    const parsedOrigin = origin.charAt(origin.length - 1) === '/'
      ? origin.substring(0, origin.length - 1)
      : origin

    if (allowedOrigins.urls.includes(parsedOrigin)) {
      callback(null, true)
      return
    }

    const error = new Error(`[HTTP]: ${parsedOrigin} is not allowed by CORS policy`)

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
export const getCors = () => function (req, res, next) {
  if (!req.headers?.origin) {
    debug('request from', req.headers)
  }
  else {
    debug('request from', req.headers.origin)
  }

  return corsImpl.call(this, req, res, next)
}
