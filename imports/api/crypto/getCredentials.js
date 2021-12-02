import { Meteor } from 'meteor/meteor'
import { createHash } from '../crypto/createHash'

const { hosts,  } = Meteor.settings
const credentials = new Map()

Object.entries(hosts).forEach(([name, host]) => {
  const { secret, expires } = host

  if (secret) {
    const hash = createHash(secret)
    credentials.set(name, { hash, expires })
  }
})

export const getCredentials = ({ client, hash }) => {
  const credentials = getCredentials.get(client)

  if (!credentials || credentials.hash !== hash) {
    return null
  }

  return {
    client,
    expires: credentials.expires
  }
}
