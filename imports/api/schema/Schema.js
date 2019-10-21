import { Tracker } from 'meteor/tracker'
import SimpleSchema from 'simpl-schema'
import { onClient } from '../../utils/arch'

SimpleSchema.extendOptions([ 'autoform' ])

export const Schema = {}

Schema.create = function (schemaDefinition, options) {
  return new SimpleSchema(schemaDefinition, Object.assign({}, options, onClient({ tracker: Tracker })))
}
