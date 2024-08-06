import { onServer } from '../../utils/arch'
import { notifyAboutError } from '../errors/notifyAboutError'
import { ContextRegistry } from '../config/ContextRegistry'

const defineInsertMethod = ({ name, schema, numRequests, timeInterval, run, debug = false }) => {
  // TODO check args
  const methodName = `${name}.methods.insert`
  const runFct = run || async function (insertDoc) {
    const Collection = collectionByName({
      name,
      methodName,
      userId: this.userId
    })
    return Collection.insertAsync(insertDoc)
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
  const runFct = run || async function (updateDoc) {
    const Collection = collectionByName({
      name,
      methodName,
      userId: this.userId
    })

    const { _id } = updateDoc
    const document = await Collection.findOneAsync(_id)

    if (!document) {
      const error = new Error(`Expected document by _id <${_id}>`)
      notifyAboutError({ error, userId: this.userId, methodName })
      throw error
    }

    delete updateDoc._id
    return Collection.updateAsync(_id, { $set: updateDoc })
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
  const runFct = run || async function ({ _id } = {}) {
    const Collection = collectionByName({
      name,
      methodName,
      userId: this.userId
    })

    return Collection.removeAsync(_id)
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
    return Collection.findOneAsync(_id)
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
    run: onServer(run || async function ({ skip, dependencies, isLegacy } = {}) {
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
      const docs = await Collection.find(query, { fields }).fetchAsync()
      const all = { [name]: docs }

      if (dependencies) {
        for (const dependency of dependencies) {
          const DepCollection = collectionByName({
            name: dependency.name,
            methodName,
            userId: this.userId
          })

          const depQuery = {}

          if (dependency.skip?.length) {
            depQuery._id = { $nin: dependency.skip }
          }

          all[dependency.name] = await DepCollection.find(depQuery, { fields }).fetchAsync()
        }
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

      return Collection.find(query).fetchAsync()
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
