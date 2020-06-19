import { onServer } from '../../utils/arch'
import { getCollection } from '../../utils/collection'

export const defineInsertMethod = ({ name, schema, numRequests, timeInterval, run }) => {
  const log = (...args) => Meteor.isDevelopment && debug && console.info.apply(null, args)
  const runFct = run || function (insertDoc) {
    const Collection = getCollection(name)
    if (!Collection) throw new Error(`Expected collection by name <${name}>`)

    const insertId = Collection.insert(insertDoc)
    log(`[${name}]: created ${insertId}`)
    return insertId
  }

  return {
    name: `${name}.methods.insert`,
    schema: Object.assign({}, schema),
    numRequests: numRequests || 1,
    timeInterval: timeInterval || 250,
    run: onServer(runFct)
  }
}

export const defineUpdateMethod = ({ name, schema, timeInterval, numRequests, run, debug }) => {
  const log = (...args) => Meteor.isDevelopment && debug && console.info.apply(null, args)
  const runFct = run || function (updateDoc) {
    const Collection = getCollection(name)
    if (!Collection) throw new Error(`Expected collection by name <${name}>`)

    const { _id } = updateDoc
    const document = Collection.findOne(_id)
    if (!document) {
      throw new Error(`Expected document by _id <${_id}>`)
    }

    delete updateDoc._id
    const updated = Collection.update(_id, { $set: updateDoc })
    log(`[${name}]: updated ${_id} ${updated}`)
    return updated
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

export const defineRemoveMethod = ({ name, isPublic, roles, group, timeInterval, numRequests, run, debug }) => {
  const log = (...args) => Meteor.isDevelopment && debug && console.info.apply(null, args)
  const runFct = run || function ({ _id }) {
    const Collection = getCollection(name)
    if (!Collection) throw new Error(`Expected collection by name <${name}>`)
    const removed = Collection.remove(_id)
    log(`[${name}]: removed ${_id} ${removed}`)
    return removed
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
