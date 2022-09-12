import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'

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

  Meteor.defer(() => {
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

    notify.forEach(address => {
      Email.send({
        to: address,
        subject: `${appName} [error]: ${serializableError.type} - ${title}`,
        replyTo: replyTo,
        from: from,
        text: JSON.stringify(serializableError, 2)
      })
    })
  })
}
