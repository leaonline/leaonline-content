/* global ServiceConfiguration */
import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { HTTP } from 'meteor/jkuester:http'
import {
  defaultDDPLoginName,
  getOAuthDDPLoginHandler
} from 'meteor/leaonline:ddp-login-handler'
import { rateLimitAccounts } from '../../api/factories/rateLimit'

//  //////////////////////////////////////////////////////////
//  RATE LIMIT BUILTIN ACCOUNTS
//  //////////////////////////////////////////////////////////
rateLimitAccounts()

//  //////////////////////////////////////////////////////////
//  OAUTH2 SETUP
//  //////////////////////////////////////////////////////////
Meteor.startup(() => {
  setupOAuth()
})

function setupOAuth () {
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

  const loginHandler = getOAuthDDPLoginHandler({
    identityUrl: oauth.identityUrl,
    httpGet: (url, requestOptions) => HTTP.get(url, requestOptions),
    debug: console.debug
  })

  Accounts.registerLoginHandler(defaultDDPLoginName, loginHandler)
}
