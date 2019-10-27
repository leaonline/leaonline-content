import { TaskSet } from '../../api/task/TaskSet'
import { Task } from '../../api/task/Task'
import { createCollection } from '../../api/factories/createCollection'
import { createMethods } from '../../api/factories/createMethods'
import { rateLimitMethods, rateLimitPublications } from '../../api/factories/rateLimit'
import { createPublications } from '../../api/factories/createPublication'
import { BackendConfig } from '../../api/config/BackendConfig'

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
    dimension: 1,
    level: 1,
    tasks: 1
  },
  actions: {
    insert: insertUpdate,
    update: insertUpdate,
    remove: {
      method: TaskSet.methods.remove.name,
      schema: { _id: String }
    }
  },
  filter: [ {
    type: 'publication',
    options: [],
    target: TaskSet.publications.byDimension.name
  } ],
  roles: [ 'editTaskSet' ], // TODO put in Roles
  group: 'editors', // TODO put in Groups,
  isFilesCollection: false,
  mainCollection: TaskSet.name,
  collections: [
    TaskSet.name,
    Task.name
  ],
  publications: [ {
    name: Task.publications.byDimension.name,
    schema: Task.publications.byDimension.schema
  }, {
    name: TaskSet.publications.byDimension.name,
    schema: Task.publications.byDimension.schema
  } ]
})
