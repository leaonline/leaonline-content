import { AlphaLevel } from 'meteor/leaonline:corelib/contexts/AlphaLevel'

AlphaLevel.routes.all.run = async function ({ ids, dimension, level }) {
  const query = {}
  if (ids?.length) {
    query.$in = { _id: ids }
  }

  if (dimension) {
    query.dimension = dimension
  }

  if (level) {
    query.level = level
  }

  return AlphaLevel.collection().find(query).fetchAsync()
}

export { AlphaLevel }
