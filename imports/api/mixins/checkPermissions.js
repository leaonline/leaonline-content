import { Meteor } from 'meteor/meteor'
import { notifyAboutError } from '../errors/notifyAboutError'
import { PermissionDeniedError } from '../errors/PermissionDeniedError'
import { createJWTValidator } from 'meteor/leaonline:jwt'

export const checkPermissions = function (options) {
  const exception = !!options.isPublic
  if (exception) return options

  const name = options.name
  const runFct = options.run

  // only if we set token to true we allow for this method
  // a jwt token as authentication method, which makes it
  // easy to authenticate two apps without the need for
  // a user-account
  const allowToken = !!options.token

  options.run = function run (...args) {
    const environment = this

    // to ease up content access we allow JWT in case there is no authenticated
    // call but we do this only if the Method is flagged as { token: true }
    if (!environment.userId) {
      if (!allowToken) {
        const error = new PermissionDeniedError('notLoggedIn', { name })
        notifyAboutError({ error, userId: environment.userId })
        throw error
      }

      const token = args[0]?.token
      console.debug('check token for', name, 'token:', token)
      const { valid, reason } = tokenIsValid(token, name)

      if (!valid) {
        const error = new PermissionDeniedError('tokenInvalid', {
          name,
          reason,
          token
        })
        notifyAboutError({ error })
        throw error
      }

      // remove token to pass on to call with clean args
      delete args[0].token
    }

    return runFct.call(environment, ...args)
  }

  return options
}

/// /////////////////////////////////////////////////////////////////////////////
//
//  INTERNAL
//
/// /////////////////////////////////////////////////////////////////////////////


/**
 * Creates a module-internal function that checks a given JWT against
 * a given set of jwt-values from settings.
 * @private
 */
const tokenIsValid = createJWTValidator({
  key: Meteor.settings.jwt.key,
  positives: Object.values(Meteor.settings.hosts),
  negatives: [],
  debug: console.debug
})
