import { Task } from 'meteor/leaonline:interfaces/Task'
import { onServer } from '../../utils/arch'

Task.methods.update = {
  name: 'task.methods.update',
  schema: Object.assign({}, Task.schema, {
    _id: {
      type: String,
      optional: true
    }
  }),
  isPublic: true,
  numRequests: 1,
  timeInterval: 250,
  run: onServer(function ({ _id, taskId, dimension, level, story, stimuli, instructions, pages }) {
    const TaskCollection = Task.collection()
    const taskDoc = TaskCollection.findOne(_id)
    if (!taskDoc) {
      return TaskCollection.insert({ taskId, dimension, level, story, stimuli, instructions, pages })
    } else {
      return TaskCollection.update(_id, {
        $set: { taskId, dimension, level, story, stimuli, instructions, pages }
      })
    }
  })
}

Task.methods.remove = {
  name: 'task.methods.remove',
  schema: {
    _id: String
  },
  isPublic: true, // FIXME
  numRequests: 1,
  timeInterval: 1000,
  run: onServer(function ({ _id }) {
    return Task.collection().remove(_id)
  })
}

Task.publications.byDimension = {
  name: 'task.publications.byDimension',
  schema: {
    dimension: {
      type: String,
      optional: true
    }
  },
  projection: {},
  numRequests: 1,
  timeInterval: 250,
  isPublic: true, // FIXME
  run: onServer(function ({ dimension } = {}) {
    if (!dimension) {
      return
    }
    return Task.collection().find({ dimension }, { sort: { level: 1, taskId: 1 } })
  })
}

export { Task }