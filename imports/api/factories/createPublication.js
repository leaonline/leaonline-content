import { getCreatePublications } from 'meteor/leaonline:factories/publication/createPublication'
import { Schema } from '../schema/Schema'

export const createPublications = getCreatePublications(Schema.create)
