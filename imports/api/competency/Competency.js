import { Competency } from 'meteor/leaonline:interfaces/Competency'
import { defineRemoveMethod, defineUpdateMethod } from '../factories/defineCRUDMethods'
import { defineAllPublication } from '../factories/definePublication'
import { onServer } from '../../utils/arch'

const settings = Meteor.settings.competencies
const competenciesUrl = settings.url

Competency.methods.update = defineUpdateMethod({ name: Competency.name, schema: Competency.schema })
Competency.methods.remove = defineRemoveMethod({ name: Competency.name })
Competency.publications.all = defineAllPublication({ name: Competency.name })

Competency.httpRoutes = Competency.httpRoutes || {}
Competency.httpRoutes.byId = {
  path: competenciesUrl, // TODO from settings
  name: 'competency.httpRoutes.byTaskId',
  method: 'post',
  schema: {
    ids: Array,
    'ids.$': String
  },
  projection: {},
  numRequests: 10,
  timeInterval: 1000,
  run: onServer(function ({ ids }) {
    const CompetencyCollection = Competency.collection()
    return CompetencyCollection.find({ competencyId: { $in: ids }}).fetch()
  })
}

export { Competency }
