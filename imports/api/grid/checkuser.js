import { Meteor } from 'meteor/meteor'

const userExists = async (userId) => {
  return userId && await Meteor.users.findOneAsync({ _id: userId })
}

export const getUserCheck = function getUserCheck ({ debug = () => {} } = {}) {
  return async function validateUser (userOrId, file, type) {
    const userId = typeof userOrId === 'object'
      ? userOrId._id
      : userOrId
    const fileId = file?._id
    debug('validateUser', { userId, fileId, type })

    if (type === 'download') {
      debug('pass for download')
      return true
    }
    const exists = await userExists(userId)
    debug('userExists?', { userId, exists })
    if (!exists) {
      debug('users', await Meteor.users.find().fetchAsync())
    }
    return !!exists
  }
}
