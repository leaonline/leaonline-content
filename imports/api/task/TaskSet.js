import { TaskSet } from 'meteor/leaonline:interfaces/TaskSet'
import { onServer } from '../../utils/arch'

/**
 * This is an in-memory cache for al task sets to reduce DB access.
 * It will be set to null on every method activity.
 */

let _cachedTaskSet

TaskSet.methods = TaskSet.methods || {}

TaskSet.methods.update = {
  name: 'taskSet.methods.update',
  schema: Object.assign({}, TaskSet.schema, {
    _id: {
      type: String,
      optional: true
    }
  }),
  isPublic: true, // FIXME
  numRequests: 1,
  timeInterval: 250,
  run: onServer(function ({ _id, dimension, level, tasks }) {
    _cachedTaskSet = null
    const TaskSetCollection = TaskSet.collection()
    const taskSetDoc = TaskSetCollection.findOne(_id)
    if (!taskSetDoc) {
      return TaskSetCollection.insert({ dimension, level, tasks })
    } else {
      return TaskSetCollection.update(_id, {
        $set: { dimension, level, tasks }
      })
    }
  })
}

TaskSet.methods.remove = {
  name: 'taskSet.methods.remove',
  schema: {
    _id: String
  },
  isPublic: true, // FIXME
  numRequests: 1,
  timeInterval: 1000,
  run: onServer(function ({ _id }) {
    _cachedTaskSet = null
    return TaskSet.collection().remove(_id)
  })
}

TaskSet.publications = TaskSet.publications || {}

TaskSet.publications.byDimension = {
  name: 'taskSet.publications.byDimension',
  schema: {
    dimension: {
      type: String,
      optional: true
    },
    level: {
      type: String,
      optional: true
    }
  },
  projection: {},
  numRequests: 1,
  timeInterval: 250,
  isPublic: true, // FIXME
  run: onServer(function ({ dimension, level } = {}) {
    return TaskSet.collection().find()
  })
}

TaskSet.httpRoutes.all.run = onServer(function () {
  if (!_cachedTaskSet) {
    _cachedTaskSet = TaskSet.find().fetch()
  }
  return _cachedTaskSet
})

export { TaskSet }