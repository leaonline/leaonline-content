import { createMethod } from '../../api/factories/createMethods'
import { onServer } from '../../utils/arch'
// import { createToken } from '../../api/crypto/createToken'

createMethod({
  name: 'contentServer.methods.requestToken',
  isPublic: true,
  schema: {},
  run: onServer(function () {
    console.debug(this)
  })
})
