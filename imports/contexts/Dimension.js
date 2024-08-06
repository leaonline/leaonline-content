import { Dimension } from 'meteor/leaonline:corelib/contexts/Dimension'

Dimension.routes.all.run = async function () {
  return Dimension.collection().find().fetchAsync()
}

export { Dimension }
