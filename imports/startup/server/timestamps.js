import { CollectionTimeStamp } from '../../api/collection/CollectionTimeStamp'
import { createMethods } from '../../api/factories/createMethods'
import { rateLimitMethods } from '../../api/factories/rateLimit'

const methods = Object.values(CollectionTimeStamp.methods)
createMethods(methods)
rateLimitMethods(methods)
