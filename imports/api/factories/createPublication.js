import { createPublicationFactory } from 'meteor/leaonline:publication-factory'
import { Schema } from '../schema/Schema'

export const createPublication = createPublicationFactory({
  schemaFactory: Schema.create
})

export const createPublications = publications => publications.forEach(createPublication)
