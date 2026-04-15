import { createMethod } from '../../api/factories/createMethods'
import { createCorpusQuery } from '../../../queries/textCorpus'

createMethod({
  name: 'query.methods.createCorpus',
  schema: {
    format: String,
    type: String,
    path: String
  },
  isPublic: true,
  run: createCorpusQuery
})
