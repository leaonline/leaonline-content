import { Tracker } from 'meteor/tracker'
import { ServiceRegistry } from '../config/ServiceRegistry'
import { onClient } from '../../utils/arch'
import SimpleSchema from 'simpl-schema'

const schemaOptions = Object.keys(ServiceRegistry.schemaOptions)
SimpleSchema.extendOptions(schemaOptions)

export const Schema = {}

Schema.create = function (schemaDefinition, options) {
  return new SimpleSchema(schemaDefinition, Object.assign({}, options, onClient({ tracker: Tracker })))
}
