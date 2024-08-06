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
export const unitProgressChanged = async ({ unitId, debug = () => {} }) => {
  debug('(unitProgressChanged):', unitId)
  await UnitSet
    .collection()
    .find({ units: unitId })
    .forEach(unitSetDoc => updateUnitSetProgress({ unitSetDoc, debug }))
}

/**
 * by -> UnitSet.units changed
 * do -> update this unitSet progress
 */
export const unitSetOrderChanged = async ({ unitSetId, debug = () => {} }) => {
  debug('(unitOrderChanged):', unitSetId)
  const unitSetDoc = await UnitSet.collection().findOneAsync(unitSetId)
  return updateUnitSetProgress({ unitSetDoc, debug })
}

const updateUnitSetProgress = async ({ unitSetDoc, debug }) => {
  debug('(updateUnitSetProgress)')
  let progress = 0

  await Unit
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

  await UnitSet
    .collection()
    .updateAsync(unitSetDoc._id, { $set: { progress } })
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
export const testCycleOrderChanged = async ({ testCycleId, debug = () => {} }) => {
  debug('(unitSetOrderChanged):', testCycleId)
  const testCycleDoc = await TestCycle.collection().findOneAsync(testCycleId)
  return updateTestCycleDoc({ testCycleDoc, debug })
}

const updateTestCycleDoc = async ({ testCycleDoc, debug }) => {
  debug('(updateTestCycleDoc)')
  let progress = 0
  await UnitSet
    .collection()
    .find({
      _id: {
        $in: (testCycleDoc.unitSets || [])
      }
    })
    .forEach(unitSetDoc => {
      progress += (unitSetDoc.progress || 0)
    })
  return TestCycle
    .collection()
    .updateAsync(testCycleDoc._id, { $set: { progress } })
}
