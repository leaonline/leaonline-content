import { onServer } from '../../utils/arch'
import { getCollection } from '../../utils/collection'
import { notifyAboutError } from '../errors/notifyAboutError'

export const defineInsertMethod = ({ name, schema, numRequests, timeInterval, run, debug = false }) => {
  const methodName = `${name}.methods.insert`
  const runFct = run || function (insertDoc) {
    console.info(`[${name}]: insert`, { userId: this.userId })
    const Collection = getCollection(name)
    if (!Collection) {
      const error = new Error(`Expected collection by name <${name}>`)
      notifyAboutError({ error, userId: this.userId, methodName })
      throw error
    }

    return Collection.insert(insertDoc)
  }

  return {
    name: methodName,
    schema: Object.assign({}, schema),
    numRequests: numRequests || 1,
    timeInterval: timeInterval || 250,
    run: onServer(runFct)
  }
}

export const defineUpdateMethod = ({ name, schema, timeInterval, numRequests, run, debug = false }) => {
  const methodName = `${name}.methods.update`
  const runFct = run || function (updateDoc) {
    console.info(`[${name}]: update`, { userId: this.userId }, arguments)
    const Collection = getCollection(name)
    if (!Collection) {
      const error = new Error(`Expected collection by name <${name}>`)
      notifyAboutError({ error })
      throw error
    }

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
    numRequests: numRequests || 1,
    timeInterval: timeInterval || 250,
    run: onServer(runFct)
  }
}

export const defineRemoveMethod = ({ name, isPublic, roles, group, timeInterval, numRequests, run, debug = false }) => {
  const methodName = `${name}.methods.remove`
  const runFct = run || function ({ _id }) {
    console.info(`[${name}]: remove`, { userId: this.userId, _id })

    const Collection = getCollection(name)
    if (!Collection) {
      const error = new Error(`Expected collection by name <${name}>`)
      notifyAboutError({ error, userId: this.userId, methodName })
      throw error
    }

    return Collection.remove(_id)
  }

  return {
    name: methodName,
    schema: {
      _id: String
    },
    numRequests: numRequests || 1,
    timeInterval: timeInterval || 1000,
    run: onServer(runFct)
  }
}

export const defineGetOneMethod = ({ name, isPublic, roles, group, timeInterval, numRequests, run, debug = false }) => {
  const methodName = `${name}.methods.getOne`
  const runFct = run || function ({ _id }) {
    console.info(`[${name}]: get one`, { userId: this.userId, _id })
    const Collection = getCollection(name)
    if (!Collection) {
      const error = new Error(`[${name}]: Expected collection by name <${name}>`)
      notifyAboutError({ error, userId: this.userId, methodName })
      throw error
    }

    return Collection.findOne(_id)
  }

  return {
    name: methodName,
    schema: {
      _id: String
    },
    numRequests: numRequests || 1,
    timeInterval: timeInterval || 1000,
    run: onServer(runFct)
  }
}

export const defineGetAllMethod = ({ name, isPublic, roles, group, timeInterval, numRequests, run, debug = false }) => {
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
      }
    },
    numRequests: numRequests || 1,
    timeInterval: timeInterval || 1000,
    run: onServer(run || function ({ dependencies, isLegacy }) {
      console.info(`[${name}]: get all`, {
        userId: this.userId,
        dependencies,
        isLegacy
      })

      const Collection = getCollection(name)
      if (!Collection) {
        const error = new Error(`[${name}]: Expected collection by name <${name}>`)
        notifyAboutError({ error, userId: this.userId })
        throw error
      }

      const query = {}

      if (isLegacy === true) {
        query.isLegacy = true
      }

      const fields = {}
      const docs = Collection.find(query, { fields }).fetch()
      const all = { [name]: docs }

      if (dependencies) {
        dependencies.forEach(dependency => {
          const DepCollection = getCollection(dependency.name)
          if (!DepCollection) {
            const error = new Error(`[${name}]: Expected collection by name <${dependency.name}>`)
            notifyAboutError({ error, userId: this.userId, methodName })
            throw error
          }

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

export const defineAllMethod = ({ name, isPublic, roles, group, timeInterval, numRequests }) => {
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
    numRequests: numRequests || 1,
    timeInterval: timeInterval || 1000,
    run: onServer(function ({ ids, isLegacy }) {
      const Collection = getCollection(name)
      if (!Collection) {
        const error = new Error(`[${name}]: Expected collection by name <${name}>`)
        notifyAboutError({ error, userId: this.userId, methodName })
        throw error
      }

      const query = {}
      if (ids) {
        query._id = { $in: ids }
      }

      if (typeof isLegacy === 'boolean') {
        query.isLegacy = isLegacy
      }

      return Collection.find(query).fetch()
    })
  }
}
