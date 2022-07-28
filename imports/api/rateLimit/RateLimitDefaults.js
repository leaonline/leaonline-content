import { Meteor } from "meteor/meteor"

const { methods } = Meteor.settings.rateLimit

export const RateLimitDefaults = {}

RateLimitDefaults.methods = {}

const method = name => {
  if (!methods[name]) {
    throw new Error(`Expected ${name} in Meteor.settings.rateLimit.methods`)
  }
  return {
    numRequests: methods[name][0],
    timeInterval: methods[name][1]
  }
}

RateLimitDefaults.methods.get = () => method('get')
RateLimitDefaults.methods.all = () => method('all')
RateLimitDefaults.methods.insert = () => method('insert')
RateLimitDefaults.methods.update = () => method('update')
RateLimitDefaults.methods.remove = () => method('remove')