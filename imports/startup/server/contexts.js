// loading all contexts
import { AlphaLevel } from '../../contexts/AlphaLevel'
import { Dimension } from '../../contexts/Dimension'
import { Level } from '../../contexts/Level'
import { CompetencyCategory } from '../../contexts/CompetencyCategory'
import { Competency } from '../../contexts/Competency'
import { Field } from '../../contexts/Field'
import { UnitSet } from '../../contexts/UnitSet'
import { Unit } from '../../contexts/Unit'
import { MediaLib } from '../../contexts/MediaLib'
import { TestCycle } from '../../contexts/TestCycle'
import { Thresholds } from '../../contexts/Thresholds'

// decorators
import {
  defineInsertMethod,
  defineRemoveMethod,
  defineUpdateMethod,
  defineGetAllMethod, defineGetOneMethod, defineAllMethod
} from '../../api/decorators/defineCRUDMethods'
import { defineAllPublication } from '../../api/decorators/definePublication'

// factories
import { createCollection } from '../../api/factories/createCollection'
import { createFilesCollection } from '../../api/factories/createFilesCollection'
import { createMethods } from '../../api/factories/createMethods'
import {
  rateLimitMethods,
  rateLimitPublications
} from '../../api/factories/rateLimit'
import { createPublications } from '../../api/factories/createPublication'
import { createRoutes } from '../../api/factories/createRoute'

// service arch
import { ServiceRegistry } from '../../api/config/ServiceRegistry'
import { getUserCheck } from '../../api/grid/checkuser'
import { getCheckMime } from '../../api/grid/checkMime'
import { Meteor } from 'meteor/meteor'
import { implementGetByIdRoute } from '../../api/decorators/implementGetByIdRoute'
import { metaSchema } from '../../api/schema/metaSchema'
import { CollectionTimeStamp } from '../../api/collection/CollectionTimeStamp'

const i18nFactory = x => x
const validateUser = getUserCheck()
const validateMime = getCheckMime(i18nFactory)
const allowedOrigins = Object
  .values(Meteor.settings.hosts)
  .map(host => host.url)
console.info('FS ALLOWED ORIGINS', allowedOrigins)

function register (context) {
  console.info(`[${context.name}]: start create context pipeline`)
  context.methods = context.methods || {}

  context.methods.insert = context.methods.insert || defineInsertMethod({ name: context.name, schema: context.schema })
  context.methods.update = context.methods.update || defineUpdateMethod({ name: context.name, schema: context.schema })
  context.methods.remove = context.methods.remove || defineRemoveMethod({ name: context.name })
  context.methods.getAll = context.methods.getAll || defineGetAllMethod({ name: context.name })
  context.methods.getOne = context.methods.getOne || defineGetOneMethod({ name: context.name })
  context.methods.all = context.methods.all || defineAllMethod({ name: context.name })

  context.publications = context.publications || {}
  context.publications.all = defineAllPublication({ name: context.name })

  context.routes = context.routes || {}
  implementGetByIdRoute(context)

  let collection

  if (context.isFilesCollection) {
    collection = createFilesCollection({
      collectionName: MediaLib.name,
      allowedOrigins,
      debug: Meteor.isDevelopment,
      validateUser,
      validateMime,
      maxSize: context.maxSize,
      extensions: context.extensions
    })
  }
  else {
    collection = createCollection({
      name: context.name,
      schema: Object.assign({}, context.schema, metaSchema),
      attachSchema: true
    })

    // we always want to track who created a document
    collection.before.insert(function (userId, doc) {
      console.info(context.name, 'insert', { userId }, doc)
      doc.meta = {
        createdBy: userId,
        createdAt: new Date(),
        history: []
      }
    })

    // we also want to know who updated a document
    collection.before.update(function (userId, doc, fieldNames, modifier /*, options */) {
      console.info(context.name, 'update', { userId, doc: doc._id }, modifier)

      modifier.$set = modifier.$set || {}
      // last updates
      modifier.$set['meta.updatedAt'] = new Date()
      modifier.$set['meta.updatedBy'] = userId
    })

    if (context.afterInsert) {
      collection.after.insert(context.afterInsert)
      delete context.afterInsert
    }

    if (context.afterUpdate) {
      collection.after.update(context.afterUpdate)
      delete context.afterUpdate
    }

    collection.before.remove(function (userId, doc) {
      console.info(context.name, 'remove', { userId }, doc._id)
    })
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

  context.collection = () => collection

  CollectionTimeStamp.register(context.name, context.isFilesCollection
    ? collection.collection
    : collection)
}

// editable contexts will be decorated,
// punched through the factories
// and then added to the ServiceRegistry
[
  AlphaLevel,
  MediaLib,
  Field,
  Dimension,
  Level,
  CompetencyCategory,
  Competency,
  UnitSet,
  Unit,
  TestCycle,
  Thresholds
].forEach(register)
