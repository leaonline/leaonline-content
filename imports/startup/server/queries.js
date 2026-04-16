import { Meteor } from 'meteor/meteor'
import { createMethod } from '../../api/factories/createMethods'
import { createCorpusQuery } from '../../../queries/textCorpus'
import { competencyListQuery } from "../../../queries/competencyList";

createMethod({
  name: 'query.methods.createCorpus',
  schema: {
    format: String,
    type: String,
    path: String
  },
  isPublic: Meteor.isDevelopment,
  run: createCorpusQuery
})

createMethod({
    name: 'query.methods.competencyList',
    schema: {
        query: {
            type: Object,
            blackbox: true,
            optional: true,
        },
        format: String,
        type: String,
        path: String
    },
    isPublic: Meteor.isDevelopment,
    run: competencyListQuery
})
