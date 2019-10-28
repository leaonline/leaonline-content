import { Task } from '../../api/task/Task'
import { createCollection } from '../../api/factories/createCollection'
import { createMethods } from '../../api/factories/createMethods'
import { rateLimitMethods, rateLimitPublications } from '../../api/factories/rateLimit'
import { createPublications } from '../../api/factories/createPublication'
import { BackendConfig } from '../../api/config/BackendConfig'
import { MediaLib } from '../../api/mediaLib/MediaLib'
import { Dimensions } from '../../api/dimensions/Dimensions'
import { Levels } from '../../api/levels/Levels'

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

const insertUpdate = {
  method: Task.methods.update.name,
  schema: JSON.stringify(Task.schema, BackendConfig.replacer)
}

BackendConfig.add({
  name: Task.name,
  label: Task.label,
  icon: Task.icon,
  type: BackendConfig.types.list,
  fields: {
    taskId: {
      label: Task.schema.taskId.label
    },
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
    description: {
      label: Task.schema.description.label
    }
  },
  actions: {
    insert: insertUpdate,
    update: insertUpdate,
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
    { name: MediaLib.name, isFilesCollection: true }
  ],
  publications: [ {
    name: MediaLib.publications.all.name,
    schema: MediaLib.publications.all.schema
  }, {
    name: Task.publications.byDimension.name,
    schema: Task.publications.byDimension.schema
  } ]
})
