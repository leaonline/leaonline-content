import { tokens } from './tokens'

export const tokenIsValid = ({ client, token }) => {
  const data = tokens.get(client)

  return data && data.token === token && Date.now() < token.expires
}
