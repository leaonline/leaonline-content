import { TestCycle } from 'meteor/leaonline:corelib/contexts/TestCycle'

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

export { TestCycle }
