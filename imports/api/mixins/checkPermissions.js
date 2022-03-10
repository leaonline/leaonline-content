import { Meteor } from 'meteor/meteor'

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

    // to ease up content access
    if (!environment.userId) {
      if (!allowToken || !args[0] || !tokenIsValid(args[0].token, name)) {
        throw new Meteor.Error('errors.permissionDenied')
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
    let verifiedJwt

    try {
      verifiedJwt = nJwt.verify(token, signingKey)
    }
    catch (e) {
      console.error(e.message) // todo log incident
      return false
    }

    // if the jwt was issued for another method this or
    // the claimed host is not the actual host this
    // should already fail at this point
    if (verifiedJwt.body.scope !== name) {
      return false
    }

    // now let's check our hosts if this one is inside there
    return hosts.some(host => {
      return verifiedJwt.body.iss === host.url && host.sub === verifiedJwt.body.sub
    })
  }
})()
