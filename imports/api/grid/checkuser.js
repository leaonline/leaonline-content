import { Meteor } from 'meteor/meteor'

const userExists = function (userId) {
  return !!(userId && Meteor.users.find(userId).count() > 0)
}

export const getUserCheck = function getUserCheck () {
  return function validateUser (userId, file, type) {
    if (type === 'download') {
      return true
    }
    return userExists(userId)
  }
}
