import { createCollectionFactory } from 'meteor/leaonline:collection-factory'
import { Schema } from '../schema/Schema'

export const createCollection = createCollectionFactory({
  schemaFactory: Schema.create
})
