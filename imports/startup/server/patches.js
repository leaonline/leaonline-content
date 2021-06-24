import { Meteor } from 'meteor/meteor'

const { patches } = Meteor.settings

if (patches?.clozeScoringSchema) {
  (function () {
    import { updateClozeScoringSchema } from '../../api/patches/upateClozeScoringSchema'
    updateClozeScoringSchema()
  })()
}

if (patches?.recomputeProgress) {
  (function () {
    import { recomputeProgress } from '../../api/patches/recomputeProgress'
    recomputeProgress()
  })()
}

if (patches?.linkAlphaLevel) {
  (function () {
    import { linkAlphaLevel } from '../../api/patches/linkAlphaLevel'
    linkAlphaLevel()
  })()
}
