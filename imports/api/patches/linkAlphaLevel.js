import { Competency } from '../../contexts/Competency'
import { AlphaLevel } from '../../contexts/AlphaLevel'

/**
 * Patch function!
 * Connects competencies with respective alpha levels.
 * It looks for an alpha level doc that matches the same difficulty-level
 * and replaces the level value in the competency doc with the alpha level _id
 * @return {Promise<void>}
 */
export const linkAlphaLevel = async function () {
  const AlphaLevelCollection = AlphaLevel.collection()
  const CompetencyCollection = Competency.collection()
  await CompetencyCollection.find().forEachAsync(async function (competencyDoc) {
    const { dimension, level } = competencyDoc
    if (typeof level !== 'number') return

    const alphaLevelDoc = await AlphaLevelCollection.findOneAsync({ dimension, level })
    if (!alphaLevelDoc) return

    console.debug(`[linkAlphaLevel]: connect competency (${competencyDoc._id}) with alphalevel (${alphaLevelDoc._id})`)
    await CompetencyCollection.updateAsync(competencyDoc._id, { $set: { level: alphaLevelDoc._id } })
  })
}
