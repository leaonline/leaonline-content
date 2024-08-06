import { Level } from 'meteor/leaonline:corelib/contexts/Level'

Level.routes.all.run = async function () {
  return Level.collection().find().fetchAsync()
}

export { Level }
