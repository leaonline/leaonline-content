// loading all contexts
import { Dimension } from '../../contexts/Dimension'
import { Competency } from '../../contexts/Competency'
import { Field } from '../../contexts/Field'
import { UnitSet } from '../../contexts/UnitSet'
import { Unit } from '../../contexts/Unit'
import { MediaLib } from '../../contexts/MediaLib'

// decorators
import { defineInsertMethod, defineRemoveMethod, defineUpdateMethod } from '../../api/factories/defineCRUDMethods'
import { defineAllPublication } from '../../api/factories/definePublication'

// factories
import { createCollection } from '../../api/factories/createCollection'
import { createFilesCollection } from '../../api/factories/createFilesCollection'
import { createMethods } from '../../api/factories/createMethods'
import { rateLimitMethods, rateLimitPublications } from '../../api/factories/rateLimit'
import { createPublications } from '../../api/factories/createPublication'
import { createRoutes } from '../../api/factories/createRoute'

// service arch
import { ServiceRegistry } from '../../api/config/ServiceRegistry'
import { getUserCheck } from '../../api/grid/checkuser'
import { getCheckMime } from '../../api/grid/checkMime'
import { Meteor } from "meteor/meteor"

const i18nFactory = x => x
const validateUser = getUserCheck()
const validateMime = getCheckMime(i18nFactory)
const allowedOrigins = new RegExp(Meteor.settings.hosts.backend.urlRegEx)

function register (context) {
  context.methods = context.methods || {}
  context.methods.insert = defineInsertMethod({ name: context.name, schema: context.schema })
  context.methods.update = defineUpdateMethod({ name: context.name, schema: context.schema })
  context.methods.remove = defineRemoveMethod({ name: context.name })

  context.publications = context.publications || {}
  context.publications.all = defineAllPublication({ name: context.name })

  context.routes = context.routes || {}


  if (context.isFilesCollection) {
    createFilesCollection({
      collectionName: MediaLib.name,
      allowedOrigins,
      debug: true,
      validateUser,
      validateMime,
      maxSize: context.maxSize,
      extensions: context.extensions
    })
  } else {
    createCollection(context)
  }


  const methods = Object.values(context.methods)
  createMethods(methods)
  rateLimitMethods(methods)

  const publications = Object.values(context.publications)
  createPublications(publications)
  rateLimitPublications(publications)

  const routes = Object.values(context.routes)
  createRoutes(routes)

  ServiceRegistry.register(context)
}

[MediaLib, Field, Dimension, Competency, UnitSet, Unit].forEach(register)
