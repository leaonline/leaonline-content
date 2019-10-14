import { getCreateMethods } from 'meteor/leaonline:factories/method/createMethods'
import { Schema } from '../schema/Schema'

export const createMethods = getCreateMethods(Schema.create)
