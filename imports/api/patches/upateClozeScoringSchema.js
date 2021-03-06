import { Unit } from '../../contexts/Unit'
import { setProperty } from '../../utils/setProperty'

export const updateClozeScoringSchema = () => {
  console.debug('[patch]: updateClozeScoringSchema')
  const collection = Unit.collection()
  collection.find().forEach(unitDoc => {
    (unitDoc.pages || []).forEach((page, pageIndex) => {
      (page.content || []).forEach((entry, contentIndex) => {
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
            collection.update(unitDoc._id, { $set: updatedScoring })
          }
        }
      })
    })
  })
}
