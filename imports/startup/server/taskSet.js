import { TaskSet } from '../../contexts/TaskSet'
import { Task } from '../../contexts/Task'
import { createCollection } from '../../api/factories/createCollection'
import { createMethods } from '../../api/factories/createMethods'
import { rateLimitMethods, rateLimitPublications } from '../../api/factories/rateLimit'
import { createPublications } from '../../api/factories/createPublication'
import { ServiceRegistry } from '../../api/config/ServiceRegistry'
import { Dimensions } from '../../contexts/Dimensions'
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
  schema: JSON.stringify(TaskSet.schema, ServiceRegistry.replacer)
}

ServiceRegistry.add({
  name: TaskSet.name,
  label: TaskSet.label,
  icon: TaskSet.icon,
  type: ServiceRegistry.types.list,
  fields: {
    dimension: {
      label: Dimensions.label,
      type: ServiceRegistry.fieldTypes.context,
      context: Dimensions.name
    },
    level: {
      label: Task.label
    },
    tasks: {
      label: Task.label,
      type: ServiceRegistry.fieldTypes.collection,
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
