import { Dimension } from 'meteor/leaonline:corelib/contexts/Dimension'

Dimension.routes.all.run = function () {
  return Dimension.collection().find().fetch()
}

export { Dimension }
