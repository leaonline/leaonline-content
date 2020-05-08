import { onServer } from '../../utils/arch'
import { getCollection } from '../../utils/collection'

export const defineInsertMethod = ({ name, schema, numRequests, timeInterval, run }) => {
  const runFct = run || function (insertDoc) {
    console.log('insert', name, insertDoc)
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

export const defineUpdateMethod = ({ name, schema, timeInterval, numRequests, run }) => {
  const runFct = run || function (updateDoc) {
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

export const defineRemoveMethod = ({ name, isPublic, roles, group, timeInterval, numRequests, run }) => {
  const runFct = run || function ({ _id }) {
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
