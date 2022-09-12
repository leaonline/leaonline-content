import { onServer } from '../../utils/arch'
import { notifyAboutError } from '../errors/notifyAboutError'
import { ContextRegistry } from '../config/ContextRegistry'

const defineInsertMethod = ({ name, schema, numRequests, timeInterval, run, debug = false }) => {
  // TODO check args
  const methodName = `${name}.methods.insert`
  const runFct = run || function (insertDoc) {
    const Collection = collectionByName({
      name,
      methodName,
      userId: this.userId
    })
    return Collection.insert(insertDoc)
  }

  return {
    name: methodName,
    schema: Object.assign({}, schema),
    numRequests: numRequests,
    timeInterval: timeInterval,
    run: onServer(runFct)
  }
}

const defineUpdateMethod = ({ name, schema, timeInterval, numRequests, run, debug = false }) => {
  // TODO check args
  const methodName = `${name}.methods.update`
  const runFct = run || function (updateDoc) {
    const Collection = collectionByName({
      name,
      methodName,
      userId: this.userId
    })

    const { _id } = updateDoc
    const document = Collection.findOne(_id)

    if (!document) {
      const error = new Error(`Expected document by _id <${_id}>`)
      notifyAboutError({ error, userId: this.userId, methodName })
      throw error
    }

    delete updateDoc._id
    return Collection.update(_id, { $set: updateDoc })
  }

  return {
    name: methodName,
    schema: Object.assign({}, schema, {
      _id: {
        type: String,
        optional: true
      }
    }),
    numRequests: numRequests,
    timeInterval: timeInterval,
    run: onServer(runFct)
  }
}

const defineRemoveMethod = ({ name, isPublic, roles, group, timeInterval, numRequests, run, debug = false }) => {
  // TODO check args
  const methodName = `${name}.methods.remove`
  const runFct = run || function ({ _id } = {}) {
    const Collection = collectionByName({
      name,
      methodName,
      userId: this.userId
    })

    return Collection.remove(_id)
  }

  return {
    name: methodName,
    schema: {
      _id: String
    },
    numRequests: numRequests,
    timeInterval: timeInterval,
    run: onServer(runFct)
  }
}

const defineGetOneMethod = ({ name, isPublic, roles, group, timeInterval, numRequests, run, debug = false }) => {
  // TODO check args
  const methodName = `${name}.methods.getOne`
  const runFct = run || function ({ _id } = {}) {
    const Collection = collectionByName({
      name,
      methodName,
      userId: this.userId
    })
    return Collection.findOne(_id)
  }

  return {
    name: methodName,
    schema: {
      _id: String
    },
    numRequests: numRequests,
    timeInterval: timeInterval,
    run: onServer(runFct)
  }
}

const defineGetAllMethod = ({ name, isPublic, roles, group, timeInterval, numRequests, run, debug = false }) => {
  // TODO check args
  const methodName = `${name}.methods.getAll`

  return {
    name: methodName,
    token: true,
    schema: {
      dependencies: {
        type: Array,
        optional: true
      },
      'dependencies.$': Object,
      'dependencies.$.name': String,
      'dependencies.$.skip': {
        type: Array,
        optional: true
      },
      'dependencies.$.skip.$': String,
      token: {
        type: String,
        optional: true
      },
      isLegacy: {
        type: Boolean,
        optional: true
      },
      skip: {
        type: Array,
        optional: true
      },
      'skip.$': {
        type: String
      }
    },
    numRequests: numRequests,
    timeInterval: timeInterval,
    run: onServer(run || function ({ skip, dependencies, isLegacy } = {}) {
      const Collection = collectionByName({
        name,
        methodName,
        userId: this.userId
      })

      const query = {}

      if (Array.isArray(skip) && skip.length > 0) {
        query._id = { $nin: skip }
      }

      if (typeof isLegacy === 'boolean') {
        query.isLegacy = isLegacy
          ? true
          : { $in: [null, undefined, false] }
      }

      const fields = {}
      const docs = Collection.find(query, { fields }).fetch()
      const all = { [name]: docs }

      if (dependencies) {
        dependencies.forEach(dependency => {
          const DepCollection = collectionByName({
            name: dependency.name,
            methodName,
            userId: this.userId
          })

          const depQuery = {}

          if (dependency.skip?.length) {
            depQuery._id = { $nin: dependency.skip }
          }

          all[dependency.name] = DepCollection.find(depQuery, { fields }).fetch()
        })
      }

      return all
    })
  }
}

const defineAllMethod = ({ name, isPublic, roles, group, timeInterval, numRequests }) => {
  // TODO check args
  const methodName = `${name}.methods.all`

  return {
    name: methodName,
    schema: {
      ids: {
        type: Array,
        optional: true
      },
      'ids.$': String,
      isLegacy: {
        type: Boolean,
        optional: true
      }
    },
    numRequests: numRequests,
    timeInterval: timeInterval,
    run: onServer(function ({ ids, isLegacy } = {}) {
      const Collection = collectionByName({
        name,
        methodName,
        userId: this.userId
      })

      const query = {}
      if (ids) {
        query._id = { $in: ids }
      }

      if (typeof isLegacy === 'boolean') {
        query.isLegacy = isLegacy
          ? true
          : { $in: [null, undefined, false] }
      }

      return Collection.find(query).fetch()
    })
  }
}

const collectionByName = ({ name, methodName, userId }) => {
  const ctx = ContextRegistry.get(name)
  const collection = ctx && ctx.collection()

  if (!collection) {
    const error = new Error(`[${methodName}]: Expected collection by name <${name}>`)
    notifyAboutError({ error, userId, methodName })
    throw error
  }

  return collection
}

export const CRUDMethods = {
  defineGetOneMethod,
  defineGetAllMethod,
  defineInsertMethod,
  defineUpdateMethod,
  defineRemoveMethod,
  defineAllMethod
}
