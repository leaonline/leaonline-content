import { Meteor } from 'meteor/meteor'
import { updateClozeScoringSchema } from '../../api/patches/upateClozeScoringSchema'
import { recomputeProgress } from '../../api/patches/recomputeProgress'
import { linkAlphaLevel } from '../../api/patches/linkAlphaLevel'
import { removeImageOrigin } from '../../api/patches/removeImageOrigin'

const { patches = {} } = Meteor.settings
const applyPathes = async (flag, fn) => {
  if (!flag) return
  try {
    await fn()
  }
  catch (e) {
    console.error(e)
  }
}

await applyPathes(patches.clozeScoringSchema, updateClozeScoringSchema)
await applyPathes(patches.recomputeProgress, recomputeProgress)
await applyPathes(patches.linkAlphaLevel, linkAlphaLevel)
await applyPathes(patches.removeImageOrigin, removeImageOrigin)
