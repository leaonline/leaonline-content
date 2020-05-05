import { Meteor } from 'meteor/meteor'

function userExists (userId) {
  return !!(userId && Meteor.users.findOne(userId))
}

export const getUserCheck = function () {
  return function validateUser (user) {
    return userExists(user && user._id)
  }
}
