import { Thresholds } from 'meteor/leaonline:corelib/contexts/Thresholds'
import { onServer } from '../utils/arch'

Thresholds.routes.all.run = function () {
  return Thresholds.collection().findOne()
}

Thresholds.methods.getOne = {
  name: 'thresholds.methods.getOne',
  schema: {
    _id: {
      type: String,
      optional: true
    }
  },
  numRequests: 1,
  timeInterval: 250,
  run: onServer(function () {
    return Thresholds.collection().findOne()
  })
}

Thresholds.methods.update = {
  name: 'thresholds.methods.update',
  schema: Thresholds.schema,
  numRequests: 1,
  timeInterval: 250,
  run: onServer(function (updateDoc) {
    const doc = Thresholds.collection().findOne()

    if (!doc) {
      return Thresholds.collection().insert(updateDoc)
    }

    return Thresholds.collection().update(doc._id, {
      $set: updateDoc
    })
  })
}

export { Thresholds }
