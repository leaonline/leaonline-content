import { Meteor } from 'meteor/meteor'

const name = 'errors.permissionDenied'

export class PermissionDeniedError extends Meteor.Error {
  static get name () {
    return name
  }

  constructor (reason, details) {
    super(name, reason, details)
  }
}
