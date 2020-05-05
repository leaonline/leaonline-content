import { createMethodFactory } from 'meteor/leaonline:method-factory'
import { checkPermissions } from '../mixins/checkPermissions'
import { Schema } from '../schema/Schema'

export const createMethod = createMethodFactory({
  schemaFactory: Schema.create,
  mixins: [ checkPermissions ]
})

export const createMethods = methods => methods.forEach(createMethod)
