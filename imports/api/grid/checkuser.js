import {check} from 'meteor/check'

function loggedIn () {
  if (!this.userId) return false
  const user = this.user()
  return user && user._id
}

export const getUserCheck = function ({ roles, group }) {
  check(roles, [ String ])
  check(group, String)

  return function checkUser (uploadedFile) {
    const self = this
    const userId = loggedIn.call(self)
    return userId && Roles.userIsInRole(userId, roles, group)
  }
}