import { UnitSet } from '../../contexts/UnitSet'
import { TestCycle } from '../../contexts/TestCycle'
import { testCycleOrderChanged, unitSetOrderChanged } from '../progress/calculateProgress'

export const recomputeProgress = function () {
  const debug = (...args) => console.debug('[recomputeProgress]:', ...args)

  UnitSet.collection().find().forEach(unitSetDoc => {
    unitSetOrderChanged({ unitSetId: unitSetDoc._id, debug })
  })

  TestCycle.collection().find().forEach(testCycleDoc => {
    testCycleOrderChanged({ testCycleId: testCycleDoc._id, debug })
  })
}
