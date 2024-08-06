import { TestCycle } from 'meteor/leaonline:corelib/contexts/TestCycle'
import { listsAreEqual } from '../api/progress/listsAreEqual'
import {
  testCycleOrderChanged
} from '../api/progress/calculateProgress'
import { createLog } from '../utils/log'

const debug = createLog(TestCycle.name)

TestCycle.routes.all.run = async function () {
  const api = this
  const { field, isLegacy } = api.data()
  const query = {}

  if (isLegacy === 'true') {
    query.isLegacy = true
  }

  if (field) {
    query.field = field
  }

  if (Object.keys(query).length === 0) {
    this.error({
      code: 500,
      title: 'routes.queryFailed',
      description: 'routes.emptyQueryNotSupported',
      info: JSON.stringify({ query })
    })
  }

  return TestCycle.collection().find(query).fetchAsync()
}

TestCycle.afterInsert = async function (userId, doc) {
  if (doc.unitSets?.length) {
    await testCycleOrderChanged({ testCycleId: doc._id, debug })
  }
}

TestCycle.beforeUpdate = async function (userId, doc, fieldNames, modifier /*, options */) {
  if (modifier.$set.unitSets === null) {
    debug('modifier.$set.unitSets is null, fallback to  []')
    modifier.$set.unitSets = []
  }
}

TestCycle.afterUpdate = async function (userId, doc) {
  const { previous } = this

  if (!listsAreEqual(previous.unitSets, doc.unitSets)) {
    return testCycleOrderChanged({ testCycleId: doc._id, debug })
  }
}

export { TestCycle }
