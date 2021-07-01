import { TestCycle } from 'meteor/leaonline:corelib/contexts/TestCycle'
import { listsAreEqual } from '../api/progress/listsAreEqual'
import {
  testCycleOrderChanged
} from '../api/progress/calculateProgress'
import { createLog } from '../utils/log'

const debug = createLog(TestCycle.name)

TestCycle.routes.all.run = function () {
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

  api.log(query, TestCycle.collection().find(query).count())
  return TestCycle.collection().find(query).fetch()
}

TestCycle.afterInsert = function (userId, doc) {
  if (doc.unitSets?.length) {
    testCycleOrderChanged({ testCycleId: doc._id, debug })
  }
}

TestCycle.beforeUpdate = function (userId, doc, fieldNames, modifier /*, options */) {
  if (modifier.$set.unitSets === null) {
    debug('modifier.$set.unitSets is null, fallback to  []')
    modifier.$set.unitSets = []
  }
}

TestCycle.afterUpdate = function (userId, doc) {
  const { previous } = this

  if (!listsAreEqual(previous.unitSets, doc.unitSets)) {
    return testCycleOrderChanged({ testCycleId: doc._id, debug })
  }
}

export { TestCycle }
