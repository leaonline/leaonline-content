import { Meteor } from 'meteor/meteor'
import { notifyAboutError } from '../errors/notifyAboutError'

class PermissionDeniedError extends Meteor.Error {
  constructor (reason, details) {
    super('errors.permissionDenied', reason, details)
  }
}

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
const tokenIsValid = (function () {
  const nJwt = require('njwt')
  const { jwt } = Meteor.settings
  const hosts = Object.values(Meteor.settings.hosts)
  const signingKey = jwt.key

  return (token, name) => {
    if (!token) {
      return { valid: false, reason: 'no token' }
    }
    let verifiedJwt

    try {
      verifiedJwt = nJwt.verify(token, signingKey)
    }
    catch (e) {
      console.error(e.message) // todo log incident
      return { valid: false, reason: e.message }
    }

    const { body } = verifiedJwt

    // if the jwt was issued for another method this or
    // the claimed host is not the actual host this
    // should already fail at this point
    if (body.scope !== name) {
      return {
        valid: false,
        reason: `invalid scope: ${name} !== ${body.scope}`
      }
    }

    // now let's check our hosts if this one is inside there
    const hasHost = hosts.some(host =>
      body.iss === host.url &&
      body.sub === host.sub)

    if (!hasHost) {
      return {
        valid: false,
        reason: `host ${verifiedJwt.body.iss} has invalid url or sub`
      }
    }

    return { valid: true }
  }
})()
