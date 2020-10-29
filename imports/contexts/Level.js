import { Level } from 'meteor/leaonline:corelib/contexts/Level'

Level.routes.all.run = function () {
  return Level.collection().find().fetch()
}

export { Level }
