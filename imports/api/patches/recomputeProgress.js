import { UnitSet } from '../../contexts/UnitSet'
import { unitSetOrderChanged } from '../progress/calculateProgress'

export const recomputeProgress = function () {
  const debug = (...args) => console.debug('[recomputeProgress]:', ...args)
  UnitSet.collection().find().forEach(unitSetDoc => {
    unitSetOrderChanged({ unitSetId: unitSetDoc._id, debug })
  })
}
