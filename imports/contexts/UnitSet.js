import { UnitSet } from 'meteor/leaonline:corelib/contexts/UnitSet'
import {
  unitSetOrderChanged,
  unitSetProgressChanged
} from '../api/progress/calculateProgress'
import { listsAreEqual } from '../api/progress/listsAreEqual'

UnitSet.routes.all.run = function () {
  const api = this
  const { field, job, isLegacy } = api.data()
  const query = {}

  if (isLegacy === 'true') {
    query.isLegacy = true
  }

  if (field) {
    query.field = field
  }

  if (job) {
    query.job = job
  }

  if (Object.keys(query).length === 0) {
    this.error({
      code: 500,
      title: 'routes.queryFailed',
      description: 'routes.emptyQueryNotSupported',
      info: JSON.stringify({ query })
    })
  }

  api.log(query, UnitSet.collection().find(query).count())
  return UnitSet.collection().find(query).fetch()
}

UnitSet.afterInsert = function (userId, doc) {
  if (doc.units?.length) {
    unitSetOrderChanged({ unitSetId: doc._id })
  }
}

UnitSet.afterUpdate = function (userId, doc) {
  const { previous } = this

  if (previous.progress !== doc.progress) {
    return unitSetProgressChanged({ unitSetId: doc._id })
  }

  if (!listsAreEqual(previous.units, doc.units)) {
    return unitSetOrderChanged({ unitSetId: doc._id })
  }
}

export { UnitSet }
