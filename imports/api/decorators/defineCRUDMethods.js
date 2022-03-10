import { onServer } from '../../utils/arch'
import { getCollection } from '../../utils/collection'

export const defineInsertMethod = ({ name, schema, numRequests, timeInterval, run, debug = false }) => {
  const runFct = run || function (insertDoc) {
    console.info(`[${name}]: insert`, { userId: this.userId })
    const Collection = getCollection(name)
    if (!Collection) throw new Error(`Expected collection by name <${name}>`)

    return Collection.insert(insertDoc)
  }

  return {
    name: `${name}.methods.insert`,
    schema: Object.assign({}, schema),
    numRequests: numRequests || 1,
    timeInterval: timeInterval || 250,
    run: onServer(runFct)
  }
}

export const defineUpdateMethod = ({ name, schema, timeInterval, numRequests, run, debug = false }) => {
  const runFct = run || function (updateDoc) {
    console.info(`[${name}]: update`, { userId: this.userId }, arguments)
    const Collection = getCollection(name)
    if (!Collection) throw new Error(`Expected collection by name <${name}>`)

    const { _id } = updateDoc
    const document = Collection.findOne(_id)
    if (!document) {
      throw new Error(`Expected document by _id <${_id}>`)
    }

    delete updateDoc._id
    return Collection.update(_id, { $set: updateDoc })
  }

  return {
    name: `${name}.methods.update`,
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
  const runFct = run || function ({ _id }) {
    console.info(`[${name}]: remove`, { userId: this.userId, _id })
    const Collection = getCollection(name)
    if (!Collection) throw new Error(`Expected collection by name <${name}>`)
    return Collection.remove(_id)
  }

  return {
    name: `${name}.methods.remove`,
    schema: {
      _id: String
    },
    numRequests: numRequests || 1,
    timeInterval: timeInterval || 1000,
    run: onServer(runFct)
  }
}

export const defineGetOneMethod = ({ name, isPublic, roles, group, timeInterval, numRequests, run, debug = false }) => {
  const runFct = run || function ({ _id }) {
    console.info(`[${name}]: get one`, { userId: this.userId, _id })
    const Collection = getCollection(name)
    if (!Collection) throw new Error(`[${name}]: Expected collection by name <${name}>`)

    return Collection.findOne(_id)
  }

  return {
    name: `${name}.methods.getOne`,
    schema: {
      _id: String
    },
    numRequests: numRequests || 1,
    timeInterval: timeInterval || 1000,
    run: onServer(runFct)
  }
}

export const defineGetAllMethod = ({ name, isPublic, roles, group, timeInterval, numRequests, run, debug = false }) => {
  return {
    name: `${name}.methods.getAll`,
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
      console.info(`[${name}]: get all`, { userId: this.userId, dependencies, isLegacy })

      const Collection = getCollection(name)
      if (!Collection) throw new Error(`[${name}]: Expected collection by name <${name}>`)

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
          if (!DepCollection) throw new Error(`[${name}]: Expected collection by name <${dependency.name}>`)

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
  return {
    name: `${name}.methods.all`,
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
      if (!Collection) throw new Error(`[${name}]: Expected collection by name <${name}>`)

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
