import { Schema } from '../schema/Schema'
import { getCreateRoutes } from 'meteor/leaonline:factories/routes/createRoute'

export const createRoutes = getCreateRoutes(Schema.create)
