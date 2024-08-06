import { Thresholds } from 'meteor/leaonline:corelib/contexts/Thresholds'
import { onServer } from '../utils/arch'

Thresholds.routes.all.run = async function () {
  return Thresholds.collection().findOneAsync()
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
  run: onServer(async function () {
    return Thresholds.collection().findOneAsync()
  })
}

Thresholds.methods.update = {
  name: 'thresholds.methods.update',
  schema: Thresholds.schema,
  numRequests: 1,
  timeInterval: 250,
  run: onServer(async function (updateDoc) {
    const doc = await Thresholds.collection().Async()

    if (!doc) {
      return Thresholds.collection().insertAsync(updateDoc)
    }

    return Thresholds.collection().updateAsync(doc._id, {
      $set: updateDoc
    })
  })
}

export { Thresholds }
