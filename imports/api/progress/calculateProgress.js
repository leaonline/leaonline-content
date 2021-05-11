import { UnitSet } from '../../contexts/UnitSet'
import { Unit } from '../../contexts/Unit'
import { TestCycle } from '../../contexts/TestCycle'

// Wording
// by: triggered by
// do: what to do
// to: what to inform

/**
 * by -> Unit pages (length) changes
 * do -> update all UnitSets, that contain this unit
 */
export const unitProgressChanged = ({ unitId }) => {
  console.debug('[Unit](unitProgressChanged):', unitId, UnitSet.collection().find({ units: unitId }).count())
  UnitSet
    .collection()
    .find({ units: unitId })
    .forEach(updateUnitSetProgress)
}

/**
 * by -> UnitSet.units changed
 * do -> update this unitSet progress
 */
export const unitSetOrderChanged = ({ unitSetId }) => {
  console.debug('[UnitSet](unitOrderChanged):', unitSetId)
  const unitSetDoc = UnitSet.collection().findOne(unitSetId)
  updateUnitSetProgress(unitSetDoc)
}

const updateUnitSetProgress = unitSetDoc => {
  console.debug('[UnitSet](updateUnitSetProgress)')
  let progress = 0

  Unit
    .collection()
    .find({
      _id: {
        $in: (unitSetDoc.units || [])
      }
    })
    .forEach(unitDoc => {
      const pages = unitDoc.pages?.length
      progress += (pages || 0)
    })

  UnitSet
    .collection()
    .update(unitSetDoc._id, { $set: { progress } })
}

/**
 * by -> unitSet { progress } changed
 * do -> update all linking TestCycles
 */
export const unitSetProgressChanged = ({ unitSetId }) => {
  console.debug('[TestCycle](unitSetProgressChanged):', unitSetId)
  TestCycle
    .collection()
    .find({ unitSets: unitSetId })
    .forEach(updateTestCycleProgress)
}

/**
 * by -> testCycle.unitSets changed
 * do -> get { progress } from unitSets and update
 */
export const testCycleOrderChanged = ({ testCycleId }) => {
  console.debug('[TestCycle](unitSetOrderChanged):', testCycleId)
  const testCycleDoc = TestCycle.collection().findOne(testCycleId)
  updateTestCycleProgress(testCycleDoc)
}

const updateTestCycleProgress = testCycleDoc => {
  let progress = 0
  UnitSet
    .collection()
    .find({
      _id: {
        $in: testCycleDoc.unitSets
      }
    })
    .forEach(unitSetDoc => {
      progress += (unitSetDoc.progress || 0)
    })
  TestCycle
    .collection()
    .update(testCycleDoc._id, { $set: { progress } })
}
