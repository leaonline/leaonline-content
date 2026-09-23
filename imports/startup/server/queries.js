import { createMethod } from '../../api/factories/createMethods'
import { createCorpusQuery } from '../../../queries/textCorpus'

if (Meteor.isServer && Meteor.isDevelopment) {
  // for now we create our corpus query method
  // only for dev mode; future we me might want this to be called from backend
  createMethod({
    name: 'query.methods.createCorpus',
    schema: {
      format: String,
      type: String,
      path: String,
      isLegacy: {
        type: Boolean,
        optional: true
      }
    },
    isPublic: true,
    run: createCorpusQuery
  })
}