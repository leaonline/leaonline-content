import { Unit } from 'meteor/leaonline:corelib/contexts/Unit'
import { UnitSet } from './UnitSet'

Unit.routes.all.run = function ({ unitSet }) {
  if (!unitSet) return []

  if (UnitSet.collection().find(unitSet).count() > 1) {
    throw new Error(`Doc not found for ${UnitSet.name} by id ${unitSet}`)
  }

  return Unit.collection().find({ unitSet }).map(doc => doc._id)
}

export { Unit }
