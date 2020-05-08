import { Tracker } from 'meteor/tracker'
import SimpleSchema from 'simpl-schema'
import { onClient } from '../../utils/arch'
import { SchemaOptions } from 'meteor/leaonline:interfaces/SchemaOptions'

const schemaOptions = Object.keys(SchemaOptions)
SimpleSchema.extendOptions(schemaOptions)

export const Schema = {}

Schema.create = function (schemaDefinition, options) {
  return new SimpleSchema(schemaDefinition, Object.assign({}, options, onClient({ tracker: Tracker })))
}
