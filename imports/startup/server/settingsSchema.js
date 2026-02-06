import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import validateSettings from '../../../.settingsschema'

validateSettings(SimpleSchema, Meteor.settings)
