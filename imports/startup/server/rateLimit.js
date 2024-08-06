import { Meteor } from 'meteor/meteor'
import { runRateLimiter } from '../../api/factories/rateLimit'
import { notifyAboutError } from '../../api/errors/notifyAboutError'

Meteor.startup(() => {
  runRateLimiter(async function callback (reply, input) {
    if (!reply.allowed) {
      console.error('[RateLimiter]: rate limit exceeded')
      const data = { ...reply, ...input }
      console.debug(data)

      const user = data.userId && await Meteor.users.findOneAsync(data.userId)
      data.userName = user && user.services?.lea?.username

      const isMethod = data.name.includes('methods')
      const reason = isMethod
        ? 'rateLimit.method.tooManyRequests'
        : 'rateLimit.publication.tooManyRequests'
      notifyAboutError({
        error: new Meteor.Error('rateLimit.exceeded', reason, data),
        userId: data.userId
      })
    }
  })
})
