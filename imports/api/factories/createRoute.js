import { Meteor } from 'meteor/meteor'
import { Schema } from '../schema/Schema'
import { getCreateRoutes } from 'meteor/leaonline:factories/routes/createRoute'

const allowedOrigins = Meteor.settings.hosts.allowedOrigins

export const createRoutes = getCreateRoutes(Schema.create, allowedOrigins)
