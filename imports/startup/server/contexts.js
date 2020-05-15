// loading all contexts
import { Dimension } from '../../contexts/Dimension'
import { Competency } from '../../contexts/Competency'
import { Field } from '../../contexts/Field'
import { UnitSet } from '../../contexts/UnitSet'
import { Unit } from '../../contexts/Unit'

// decorators
import { defineInsertMethod, defineRemoveMethod, defineUpdateMethod } from '../../api/factories/defineCRUDMethods'
import { defineAllPublication } from '../../api/factories/definePublication'

// factories
import { createCollection } from '../../api/factories/createCollection'
import { createMethods } from '../../api/factories/createMethods'
import { rateLimitMethods, rateLimitPublications } from '../../api/factories/rateLimit'
import { createPublications } from '../../api/factories/createPublication'
import { createRoutes } from '../../api/factories/createRoute'

// service arch
import { ServiceRegistry } from '../../api/config/ServiceRegistry'

function register (context) {
  context.methods = context.methods || {}
  context.methods.insert = defineInsertMethod({ name: context.name, schema: context.schema })
  context.methods.update = defineUpdateMethod({ name: context.name, schema: context.schema })
  context.methods.remove = defineRemoveMethod({ name: context.name })

  console.log(context.methods.insert)

  context.publications = context.publications || {}
  context.publications.all = defineAllPublication({ name: context.name })

  context.routes = context.routes || {}

  const collection = createCollection(context)

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

[Field, Dimension, Competency, UnitSet, Unit].forEach(register)
