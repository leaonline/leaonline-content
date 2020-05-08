import { Competency } from 'meteor/leaonline:interfaces/Competency'
const settings = Meteor.settings.competencies
const competenciesUrl = settings.url

Competency.httpRoutes = Competency.httpRoutes || {}
Competency.httpRoutes.byId = {
  path: competenciesUrl, // TODO from settings
  method: 'post',
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
    const cleanedIds = ids.filter(entry => typeof entry === 'string')
    const CompetencyCollection = Competency.collection()
    return CompetencyCollection.find({ competencyId: { $in: cleanedIds } }).fetch()
  }
}

export { Competency }
