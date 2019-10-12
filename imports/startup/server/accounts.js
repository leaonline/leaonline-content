import { Meteor } from 'meteor/meteor'
import { OAuth } from 'meteor/oauth'
import { HTTP } from 'meteor/http'

let userAgent = 'Meteor'
if (Meteor.release) {
  userAgent += `/${Meteor.release}`
}

Meteor.startup(() => {
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

  Accounts.registerLoginHandler('loginWithLea', function (options) {
    if (!options || !options.lea) return

    const { accessToken } = options

    let response
    const requestOptions = {
      headers: { Accept: 'application/json', 'User-Agent': userAgent, Authorization: `Bearer ${accessToken}` },
    }

    try {
      response = HTTP.get(oauth.identityUrl, requestOptions)
    } catch (err) {
      throw new Error(`Failed to fetch identity from lea. ${err.message}`), { response: err.response }
    }

    const { data } = response
    if (!data.id || !data.login) {
      throw new Error('unecpected data result')
    }

    let userDoc = Meteor.users.findOne({ 'services.lea.id': data.id })
    if (!userDoc) {
      const userId = Meteor.users.insert({
        createdAt: new Date(),
        services: {
          lea: {
            id: data.id,
            accessToken: accessToken,
            username: data.login
          }
        }
      })

      userDoc = Meteor.users.findOne(userId)
    }

    return {userId: userDoc._id}
  })
})