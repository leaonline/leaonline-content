import { Meteor } from 'meteor/meteor'
import { Competency } from 'meteor/leaonline:corelib/contexts/Competency'

const settings = Meteor.settings.competencies
const competenciesUrl = settings.url

Competency.httpRoutes = Competency.httpRoutes || {}
Competency.httpRoutes.byId = {
  path: competenciesUrl,
  method: 'get',
  schema: {
    ids: {
      type: Array,
      min: 0,
      max: 100
    },
    'ids.$': {
      type: String,
      optional: true
    }
  },
  run: function ({ ids }) {
    // TODO denormalize category
    const cleanedIds = ids.filter(entry => typeof entry === 'string')
    const CompetencyCollection = Competency.collection()
    return CompetencyCollection.find({ competencyId: { $in: cleanedIds } }).fetch()
  }
}

export { Competency }
