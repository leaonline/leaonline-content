import { createPublicationFactory } from 'meteor/leaonline:publication-factory'
import { checkPermissions } from '../mixins/checkPermissions'
import { Schema } from '../schema/Schema'

export const createPublication = createPublicationFactory({
  schemaFactory: Schema.create,
  mixins: [ checkPermissions ]
})

export const createPublications = publications => publications.forEach(createPublication)
