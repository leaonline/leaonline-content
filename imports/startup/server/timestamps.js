import { CollectionTimeStamp } from '../../api/collection/CollectionTimeStamp'
import { createRoutes } from '../../api/factories/createRoute'

const methods = Object.values(CollectionTimeStamp.routes)
createRoutes(methods)
