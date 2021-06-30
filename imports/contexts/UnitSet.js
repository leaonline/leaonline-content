import { UnitSet } from 'meteor/leaonline:corelib/contexts/UnitSet'
import {
  unitSetOrderChanged,
  unitSetProgressChanged
} from '../api/progress/calculateProgress'
import { listsAreEqual } from '../api/progress/listsAreEqual'
import { createLog } from '../utils/log'

const debug = createLog(UnitSet.name)

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

UnitSet.beforeUpdate = function (userId, doc, fieldNames, modifier /*, options */) {
  if (!modifier.$set.units === null) {
    modifier.$set.units = []
  }
}

UnitSet.afterInsert = function (userId, doc) {
  if (doc.units?.length) {
    unitSetOrderChanged({ unitSetId: doc._id, debug })
  }
}

UnitSet.afterUpdate = function (userId, doc) {
  const { previous } = this

  if (previous.progress !== doc.progress) {
    return unitSetProgressChanged({ unitSetId: doc._id, debug })
  }

  if (!listsAreEqual(previous.units, doc.units)) {
    return unitSetOrderChanged({ unitSetId: doc._id, debug })
  }
}

export { UnitSet }
