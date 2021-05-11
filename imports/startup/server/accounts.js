/* global ServiceConfiguration */
import { Meteor } from 'meteor/meteor'
import { registerOAuthDDPLoginHandler } from 'meteor/leaonline:ddp-login-handler'

Meteor.startup(() => {
  setupOAuth()
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
