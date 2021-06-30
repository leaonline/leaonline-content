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
export const unitProgressChanged = ({ unitId, debug = () => {} }) => {
  debug('(unitProgressChanged):', unitId)
  UnitSet
    .collection()
    .find({ units: unitId })
    .forEach(unitSetDoc => updateUnitSetProgress({ unitSetDoc, debug }))
}

/**
 * by -> UnitSet.units changed
 * do -> update this unitSet progress
 */
export const unitSetOrderChanged = ({ unitSetId, debug = () => {} }) => {
  debug('(unitOrderChanged):', unitSetId)
  const unitSetDoc = UnitSet.collection().findOne(unitSetId)
  updateUnitSetProgress({ unitSetDoc, debug })
}

const updateUnitSetProgress = ({ unitSetDoc, debug }) => {
  debug('(updateUnitSetProgress)')
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
export const unitSetProgressChanged = ({ unitSetId, debug = () => {} }) => {
  debug('(unitSetProgressChanged):', unitSetId)
  TestCycle
    .collection()
    .find({ unitSets: unitSetId })
    .forEach(testCycleDoc => updateTestCycleDoc({ testCycleDoc, debug }))
}

/**
 * by -> testCycle.unitSets changed
 * do -> get { progress } from unitSets and update
 */
export const testCycleOrderChanged = ({ testCycleId, debug = () => {} }) => {
  debug('(unitSetOrderChanged):', testCycleId)
  const testCycleDoc = TestCycle.collection().findOne(testCycleId)
  updateTestCycleDoc({ testCycleDoc, debug })
}

const updateTestCycleDoc = ({ testCycleDoc, debug }) => {
  debug('(updateTestCycleDoc)')
  let progress = 0
  UnitSet
    .collection()
    .find({
      _id: {
        $in: (testCycleDoc.unitSets || [])
      }
    })
    .forEach(unitSetDoc => {
      progress += (unitSetDoc.progress || 0)
    })
  TestCycle
    .collection()
    .update(testCycleDoc._id, { $set: { progress } })
}
