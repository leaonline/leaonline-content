import { Unit } from '../../contexts/Unit'
import { setProperty } from '../../utils/setProperty'

export const updateClozeScoringSchema = async () => {
  console.debug('[patch]: updateClozeScoringSchema')
  const collection = Unit.collection()
  await collection.find().forEachAsync(async unitDoc => {
    for (const [pageIndex, page] of (unitDoc.pages || []).entries()) {
      for (const [contentIndex, entry] of (page.content || []).entries()) {
        if (entry.subtype === 'cloze') {
          let updateRequired = false
          const updatedScoring = {}

          ;(entry?.value?.scoring || []).forEach((scoring, scoringIndex) => {
            if (typeof scoring.competency === 'string') {
              const key = `pages.${pageIndex}.content.${contentIndex}.value.scoring.${scoringIndex}.competency`
              setProperty(updatedScoring, key, [scoring.competency], {
                enumerable: true,
                configurable: true,
                writable: true
              })
              updateRequired = true
            }
          })

          if (updateRequired) {
            console.debug('[patch]:', unitDoc._id, 'found cloze with deprecated scoring schema =>')
            console.debug('[patch]:', updatedScoring)
            await collection.updateAsync(unitDoc._id, { $set: updatedScoring })
          }
        }
      }
    }
  })
}
