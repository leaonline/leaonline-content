import { Unit } from 'meteor/leaonline:corelib/contexts/Unit'
import { UnitSet } from './UnitSet'
import { unitProgressChanged } from '../api/progress/calculateProgress'

Unit.routes.all.run = function () {
  const { unitSet, ids } = this.data()

  if (ids?.length) {
    return Unit.collection().find({ _id: { $in: ids } }).fetch()
  }

  if (!unitSet) return []

  if (UnitSet.collection().find(unitSet).count() > 1) {
    throw new Error(`Doc not found for ${UnitSet.name} by id ${unitSet}`)
  }

  return Unit.collection().find({ unitSet }).map(doc => doc._id)
}

Unit.afterInsert = function (userId, doc) {
  unitProgressChanged({ unitId: doc._id })
}

Unit.afterUpdate = function (userId, doc) {
  const { previous } = this

  if (previous.pages?.length === doc.pages?.length) {
    return console.debug('[Unit](afterUpdate): skip progress counting')
  }

  unitProgressChanged({ unitId: doc._id })
}

export { Unit }
