import { Meteor } from 'meteor/meteor'
import { Task } from 'meteor/leaonline:interfaces/Task'
import { MediaLib } from '../mediaLib/MediaLib'
import { onServer } from '../../utils/arch'
import { defineRemoveMethod, defineUpdateMethod } from '../factories/defineCRUDMethods'

// decorate schema with custom AutoForm
const settings = Meteor.settings.hosts.items
const h5pCreateUrl = `${settings.url}${settings.create}`
const h5pEditUrl = `${settings.url}${settings.edit}`
const h5pPlayUrl = `${settings.url}${settings.play}`
const h5pListUrl = `${settings.url}${settings.list}`

const taskContent = {
  type: 'leaTaskContent',
  imagesCollection: MediaLib.name,
  imagesUriBase: Meteor.absoluteUrl(),
  imagesVersion: 'original', // TODO change to thumbnail when implemented,
  h5p: {
    createUrl: h5pCreateUrl,
    editUrl: h5pEditUrl,
    listUrl: h5pListUrl,
    playUrl: h5pPlayUrl
  }
}

Task.schema.story.autoform = taskContent
Task.schema.stimuli.autoform = taskContent
Task.schema.instructions.autoform = taskContent
Task.schema['pages.$'].autoform = taskContent

Task.methods.update = defineUpdateMethod({ name: Task.name, schema: Task.schema })
Task.methods.remove = defineRemoveMethod({ name: Task.name })

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
      return Task.collection().find()
    }
    return Task.collection().find({ dimension }, { sort: { level: 1, taskId: 1 } })
  })
}

Task.httpRoutes.byTaskId.run = onServer(function ({ taskId }) {
  return Task.collection().findOne(taskId)
})

export { Task }
