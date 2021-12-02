import { getCredentials } from './getCredentials'
import { tokens } from './tokens'

export const createToken = ({ client, hash }) => {
  const credentials = getCredentials({ client, hash})

  if (!credentials) {
    throw new Meteor.Error('403', 'errors.permissionDenied', { client, hash })
  }

  const token = Random.secret(64)
  const expiresTime = credentials.expires
  const expires = Date.now() + expiresTime

  tokens.set(client, { token, expires })

  return tokens.get(client)
}
