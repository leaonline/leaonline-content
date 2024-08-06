/* global ServiceConfiguration */
import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { fetch } from 'meteor/fetch'
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
Meteor.startup(async () => {
  const { oauth } = Meteor.settings

  await ServiceConfiguration.configurations.upsertAsync(
    { service: 'lea' },
    {
      $set: {
        loginStyle: 'popup',
        clientId: oauth.clientId,
        secret: oauth.secret,
        dialogUrl: oauth.dialogUrl,
        accessTokenUrl: oauth.accessTokenUrl,
        identityUrl: oauth.identityUrl,
        redirectUrl: oauth.redirectUrl,
        debug: oauth.debug
      }
    }
  )

  Accounts.registerLoginHandler(defaultDDPLoginName, getOAuthDDPLoginHandler({
    identityUrl: oauth.identityUrl,
    httpGet: async (url, requestOptions) => {
      console.debug('getOAuthDDPLoginHandler: httpGet', url, requestOptions)
      const response = await fetch(url, requestOptions)
      const data = await response.json()
      return { data, status: response.status }
    },
    debug: console.debug
  }))
})
