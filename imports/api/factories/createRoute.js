import { Meteor } from 'meteor/meteor'
import { Schema } from '../schema/Schema'
import { createHTTPFactory } from 'meteor/leaonline:http-factory'

const allowedOrigins = Meteor.settings.hosts.allowedOrigins

export const createRoute = createHTTPFactory({
  schemaFactory: Schema.create
})

export const createRoutes = routes => routes.forEach(createRoute)
