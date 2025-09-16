import { createMethodFactory } from 'meteor/leaonline:method-factory'
import { checkPermissions } from '../mixins/checkPermissions'
import { environmentExtensionMixin } from '../mixins/environmentExtensionMixin'
import { createMixin } from 'meteor/leaonline:health'
import { Schema } from '../schema/Schema'

export const createMethod = createMethodFactory({
  schemaFactory: Schema.create,
  mixins: [
    environmentExtensionMixin,
    checkPermissions,
    createMixin({ type: 'method' })
  ]
})

export const createMethods = methods => methods.forEach(def => {
  console.info('[createMethod]:', def.name)
  createMethod(def)
})
