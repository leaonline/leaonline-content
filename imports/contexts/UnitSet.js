import { UnitSet } from 'meteor/leaonline:corelib/contexts/UnitSet'

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

export { UnitSet }
