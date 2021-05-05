/* global ServiceConfiguration */
import { Meteor } from 'meteor/meteor'
import { registerOAuthDDPLoginHandler } from 'meteor/leaonline:ddp-login-handler'

Meteor.startup(() => {
  setupOAuth()
  setupDDP()
})

function setupOAuth() {
  const { oauth } = Meteor.settings
  ServiceConfiguration.configurations.upsert(
    { service: 'lea' },
    {
      $set: {
        loginStyle: 'popup',
        clientId: oauth.clientId,
        secret: oauth.secret,
        dialogUrl: oauth.dialogUrl,
        accessTokenUrl: oauth.accessTokenUrl,
        identityUrl: oauth.identityUrl,
        redirectUrl: oauth.redirectUrl
      }
    }
  )

  registerOAuthDDPLoginHandler({ identityUrl: oauth.identityUrl })
}

function setupDDP () {
  Object.values(Meteor.settings.hosts).forEach(host => {
    const { username, password } = host
    if (username && !Accounts.findUserByUsername(username)) {
      console.log('[Accounts]: create new ddp user', username)
      const userId = Accounts.createUser({ username, password })
      console.log('[Accounts]: => ', userId)
    }
  })
}
