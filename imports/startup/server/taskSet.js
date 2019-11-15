import { TaskSet } from '../../api/task/TaskSet'
import { Task } from '../../api/task/Task'
import { createCollection } from '../../api/factories/createCollection'
import { createMethods } from '../../api/factories/createMethods'
import { rateLimitMethods, rateLimitPublications } from '../../api/factories/rateLimit'
import { createPublications } from '../../api/factories/createPublication'
import { BackendConfig } from '../../api/config/BackendConfig'
import { Dimensions } from '../../api/dimensions/Dimensions'
import { Levels } from '../../api/levels/Levels'
import { createRoutes } from '../../api/factories/createRoute'

const TaskSetCollection = createCollection(TaskSet)

TaskSet.collection = function () {
  return TaskSetCollection
}

const methods = Object.values(TaskSet.methods)
createMethods(methods)
rateLimitMethods(methods)

const publications = Object.values(TaskSet.publications)
createPublications(publications)
rateLimitPublications(publications)

const routes = Object.values(TaskSet.httpRoutes)
createRoutes(routes)

const insertUpdate = {
  method: TaskSet.methods.update.name,
  schema: JSON.stringify(TaskSet.schema, BackendConfig.replacer)
}

BackendConfig.add({
  name: TaskSet.name,
  label: TaskSet.label,
  icon: TaskSet.icon,
  type: BackendConfig.types.list,
  fields: {
    dimension: {
      label: Dimensions.label,
      type: BackendConfig.fieldTypes.context,
      context: Dimensions.name
    },
    level: {
      label: Levels.label,
      type: BackendConfig.fieldTypes.context,
      context: Levels.name
    },
    tasks: {
      label: Task.label,
      type: BackendConfig.fieldTypes.collection,
      collection: Task.name,
      field: Task.schema.taskId.name
    }
  },
  actions: {
    insert: insertUpdate,
    update: insertUpdate,
    remove: {
      method: TaskSet.methods.remove.name,
      schema: { _id: String }
    }
  },
  filter: [{
    type: 'publication',
    options: [],
    target: TaskSet.publications.byDimension.name
  }],
  roles: ['editTaskSet'], // TODO put in Roles
  group: 'editors', // TODO put in Groups,
  isFilesCollection: false,
  mainCollection: TaskSet.name,
  collections: [
    TaskSet.name,
    Task.name
  ],
  publications: [{
    name: Task.publications.byDimension.name,
    schema: Task.publications.byDimension.schema
  }, {
    name: TaskSet.publications.byDimension.name,
    schema: Task.publications.byDimension.schema
  }]
})
