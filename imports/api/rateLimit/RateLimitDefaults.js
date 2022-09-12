import { Meteor } from 'meteor/meteor'
import { getProperty } from '../../utils/getProperty'

const { methods } = Meteor.settings.rateLimit

export const RateLimitDefaults = {}

RateLimitDefaults.methods = {}

const method = name => {
  if (!(name in methods)) {
    throw new Error(`Expected ${name} in Meteor.settings.rateLimit.methods`)
  }
  const [numRequests, timeInterval] = getProperty(methods, name)
  return { numRequests, timeInterval }
}

RateLimitDefaults.methods.get = () => method('get')
RateLimitDefaults.methods.all = () => method('all')
RateLimitDefaults.methods.insert = () => method('insert')
RateLimitDefaults.methods.update = () => method('update')
RateLimitDefaults.methods.remove = () => method('remove')
