import { Meteor } from 'meteor/meteor'

export const Log = {}

Log.debug = function (...args) {
  if (Meteor.isDevelopment) {
    console.log(...args)
  }
}

Log.error = function (...args) {
  if (Meteor.isDevelopment) {
    console.error(...args)
  }
  // TODO add to error log
}
