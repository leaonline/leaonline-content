import { TaskSet } from 'meteor/leaonline:interfaces/TaskSet'
import { onServer } from '../../utils/arch'

TaskSet.methods = TaskSet.methods || {}

TaskSet.methods.update = TaskSet.methods.update = {
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

export { TaskSet }