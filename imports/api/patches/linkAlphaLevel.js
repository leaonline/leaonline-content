import { Competency } from '../../contexts/Competency'
import { AlphaLevel } from '../../contexts/AlphaLevel'

export const linkAlphaLevel = function () {
  const AlphaLevelCollection = AlphaLevel.collection()
  const CompetencyCollection = Competency.collection()
  CompetencyCollection.find().forEach(function (competencyDoc) {
    const { dimension, level } = competencyDoc
    if (typeof level !== 'number') return

    const alphaLevelDoc = AlphaLevelCollection.findOne({ dimension, level })
    if (!alphaLevelDoc) return

    console.debug(`[linkAlphaLevel]: connect competency (${competencyDoc._id}) with alphalevel (${alphaLevelDoc._id})`)
    CompetencyCollection.update(competencyDoc._id, { $set: { level: alphaLevelDoc._id } })
  })
}
