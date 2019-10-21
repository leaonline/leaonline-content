import { Task } from '../../api/task/Task'
import { createCollection } from '../../api/factories/createCollection'
import { createMethods } from '../../api/factories/createMethods'
import { rateLimitMethods, rateLimitPublications } from '../../api/factories/rateLimit'
import { createPublications } from '../../api/factories/createPublication'
import { BackendConfig } from '../../api/config/BackendConfig'
import { MediaLib } from '../../api/mediaLib/MediaLib'

const TaskCollection = createCollection(Task)

Task.collection = function () {
  return TaskCollection
}

const methods = Object.values(Task.methods)
createMethods(methods)
rateLimitMethods(methods)

const publications = Object.values(Task.publications)
createPublications(publications)
rateLimitPublications(publications)

BackendConfig.add({
  name: Task.name,
  label: Task.label,
  icon: Task.icon,
  type: BackendConfig.types.list,
  fields: {
    level: 1,
    taskId: 1
  },
  actions: {
    insert: {
      method: Task.methods.update.name,
      schema: JSON.stringify(Task.schema, BackendConfig.replacer)
    },
    update: {
      method: Task.methods.update.name,
      schema: {}
    },
    remove: {
      method: Task.methods.remove.name,
      schema: { _id: String }
    }
  },
  filter: [ {
    type: 'publication',
    options: [],
    target: Task.publications.byDimension.name
  } ],
  roles: [ 'editTask' ], // TODO put in Roles
  group: 'editors', // TODO put in Groups,
  isFilesCollection: false,
  mainCollection: Task.name,
  collections: [
    Task.name,
    MediaLib.name
  ],
  publications: [ {
    name: MediaLib.publications.all.name,
    schema: MediaLib.publications.all.schema
  }, {
    name: Task.publications.byDimension.name,
    schema: Task.publications.byDimension.schema
  } ]
})
