import { Meteor } from 'meteor/meteor'

export const checkPermissions = function (options) {
  const exception = !!options.isPublic
  if (exception) return options

  const runFct = options.run
  options.run = function run (...args) {
    const environment = this

    if (!environment.userId) {
      throw new Meteor.Error('errors.permissionDenied')
    }

    return runFct.call(environment, ...args)
  }

  return options
}
