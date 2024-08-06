import { UnitSet } from 'meteor/leaonline:corelib/contexts/UnitSet'
import {
  unitSetOrderChanged,
  unitSetProgressChanged
} from '../api/progress/calculateProgress'
import { listsAreEqual } from '../api/progress/listsAreEqual'
import { createLog } from '../utils/log'

const debug = createLog(UnitSet.name)

UnitSet.routes.all.run = async function () {
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

  return UnitSet.collection().find(query).fetchAsync()
}

UnitSet.beforeUpdate = async function (userId, doc, fieldNames, modifier /*, options */) {
  if (modifier.$set.units === null) {
    debug('modifier.$set.units is null, fallback to  []')
    modifier.$set.units = []
  }
}

UnitSet.afterInsert = async function (userId, doc) {
  if (doc.units?.length) {
    await unitSetOrderChanged({ unitSetId: doc._id, debug })
  }
}

UnitSet.afterUpdate = async function (userId, doc) {
  const { previous } = this

  if (previous.progress !== doc.progress) {
    return unitSetProgressChanged({ unitSetId: doc._id, debug })
  }

  if (!listsAreEqual(previous.units, doc.units)) {
    return unitSetOrderChanged({ unitSetId: doc._id, debug })
  }
}

export { UnitSet }
