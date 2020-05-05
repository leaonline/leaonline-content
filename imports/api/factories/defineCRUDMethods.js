import { onServer } from '../../utils/arch'
import { getCollection } from '../../utils/collection'

export const defineUpdateMethod = ({ name, schema, roles, group, isPublic, timeInterval, numRequests, run }) => {
  const runFct = run || function (updateDoc) {
    const Collection = getCollection(name)
    if (!Collection) throw new Error(`Expected collection by name <${name}>`)

    const { _id } = updateDoc
    const document = Collection.findOne(_id)
    if (!document) {
      return Collection.insert(updateDoc)
    } else {
      delete updateDoc._id
      return Collection.update(_id, { $set: updateDoc })
    }
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
