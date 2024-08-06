import { UnitSet } from '../../contexts/UnitSet'
import { TestCycle } from '../../contexts/TestCycle'
import { testCycleOrderChanged, unitSetOrderChanged } from '../progress/calculateProgress'

export const recomputeProgress = async function () {
  const debug = (...args) => console.debug('[recomputeProgress]:', ...args)

  await UnitSet.collection().find().forEachAsync(async unitSetDoc => {
    await unitSetOrderChanged({ unitSetId: unitSetDoc._id, debug })
  })

  await TestCycle.collection().find().forEachAsync(async testCycleDoc => {
    await testCycleOrderChanged({ testCycleId: testCycleDoc._id, debug })
  })
}
