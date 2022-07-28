import { createMethodFactory } from 'meteor/leaonline:method-factory'
import { checkPermissions } from '../mixins/checkPermissions'
import { environmentExtensionMixin } from '../mixins/environmentExtensionMixin'
import { Schema } from '../schema/Schema'

export const createMethod = createMethodFactory({
  schemaFactory: Schema.create,
  mixins: [environmentExtensionMixin, checkPermissions]
})

export const createMethods = methods => methods.forEach(def => {
  console.info('[createMethod]:', def.name)
  createMethod(def)
})
