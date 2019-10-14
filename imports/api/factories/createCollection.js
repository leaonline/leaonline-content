import { getCreateCollection } from 'meteor/leaonline:factories/collection/createCollection'
import { Schema } from '../schema/Schema'

export const createCollection = getCreateCollection(Schema.create)
