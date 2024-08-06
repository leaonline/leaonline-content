import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'
import { EJSON } from 'meteor/ejson'

const { appName, notify, replyTo, from } = Meteor.settings.email

/**
 * Notifies externals about the error. Implementations can vary from email
 * to sending the error to an APM agent or both etc.
 * @param error
 * @param userId
 * @param args
 */
export const notifyAboutError = ({ error, userId, ...args }) => {
  if (!notify?.length || !error) {
    return
  }

  Meteor.defer(async () => {
    const serializableError = {
      name: error.error || error.name || 'Error',
      type: error.type || 'native',
      message: error.message,
      reason: error.reason,
      details: error.details,
      createdAt: new Date(),
      createdBy: userId,
      stack: error.stack,
      ...args
    }

    const title = serializableError.message || serializableError.name

    return Promise.all(notify.map(address => {
      return Email.sendAsync({
        to: address,
        subject: `${appName} [error]: ${serializableError.type} - ${title}`,
        replyTo: replyTo,
        from: from,
        text: EJSON.stringify(serializableError, 2)
      })
    }))
  })
}
