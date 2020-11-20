import { Meteor } from 'meteor/meteor'

function userExists (userId) {
  return !!(userId && Meteor.users.find(userId).count() > 0)
}

export const getUserCheck = function () {
  return function validateUser (userId, file, type) {
    if (type === 'download') {
      return true
    }
    return userExists(userId)
  }
}
