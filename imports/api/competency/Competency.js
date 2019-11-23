import { Competency } from 'meteor/leaonline:interfaces/Competency'
import { defineRemoveMethod, defineUpdateMethod } from '../factories/defineCRUDMethods'
import { defineAllPublication } from '../factories/definePublication'
import { onServer } from '../../utils/arch'

Competency.methods.update = defineUpdateMethod({ name: Competency.name, schema: Competency.schema })
Competency.methods.remove = defineRemoveMethod({ name: Competency.name })
Competency.publications.all = defineAllPublication({ name: Competency.name })

Competency.httpRoutes = Competency.httpRoutes || {}
Competency.httpRoutes.byId = {
  path: '/competency', // TODO from settings
  name: 'competency.httpRoutes.byTaskId',
  method: 'get',
  schema: {
    ids: Array,
    'ids.$': String
  },
  projection: {},
  numRequests: 10,
  timeInterval: 1000,
  run: onServer(function ({ ids }) {
    const CompetencyCollection = Competency.collection()
    return CompetencyCollection.find({ _id: { $in: ids }}).fetch()
  })
}

export { Competency }
