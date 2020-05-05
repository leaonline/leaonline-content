import { Meteor } from 'meteor/meteor'

export const checkPermissions = function (options) {
  const exception = options.isPublic || (options.permission && options.permission(...args))
  if (exception) return options

  const runFct = options.run
  options.run = function run (...args) {
    console.log('checkPermissions', this.userId, Meteor.user())
    // user level permission
    let userId = this.userId
    if (!userId) {
      const user = Meteor.user()
      userId = user && userId._id
    }

    if (!userId || !Meteor.users.findOne(userId)) {
      throw new Meteor.Error('errors.permissionDenied')
    }

    return runFct.call(this, ...args)
  }

  return options
}