import { BackendConfig } from '../../api/config/BackendConfig'
import { createMethods } from '../../api/factories/createMethods'
import { rateLimitMethods } from '../../api/factories/rateLimit'

const methods = Object.values(BackendConfig.methods)
createMethods(methods)
rateLimitMethods(methods)
