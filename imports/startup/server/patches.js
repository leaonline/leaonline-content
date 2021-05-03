import { Meteor } from 'meteor/meteor'
import { updateClozeScoringSchema } from '../../api/patches/upateClozeScoringSchema'

if (Meteor.settings.patches?.clozeScoringSchema) {
  updateClozeScoringSchema()
}
