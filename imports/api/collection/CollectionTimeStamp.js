import { notifyAboutError } from '../errors/notifyAboutError'

/**
 * Registers hooks on a Collection to automatically track the timestamp
 * of a collection's latest updates.
 *
 * Enables the timestamp for a given collection to be retrieved by
 * GET route.
 *
 * All works in-memory, so no persistence involved.
 */
export const CollectionTimeStamp = {
  name: 'CollectionTimeStamp'
}

const timeStamps = new Map()
const streams = new Map()

/**
 * Registers a collection for update tracking.
 * Uses collection hooks for insert/update/remove to
 * update the timestamp.
 * @param name {string} ctx name
 * @param collection {Mongo.Collection}
 */
CollectionTimeStamp.register = (name, collection) => {
  if (streams.has(name)) { return }
  if (!collection) {
    const error = new Error(`Expected collection for ${name}`)
    notifyAboutError({ error })
    throw error
  }

  // the initial -1 entry indicates a registered context but no timestamp yet
  timeStamps.set(name, -1)

  const updateTimeStamp = () => timeStamps.set(name, Date.now())

  collection.after.insert(updateTimeStamp)
  collection.after.update(updateTimeStamp)
  collection.after.remove(updateTimeStamp)
  streams.set(name, collection)
}

/**
 * Get the timestamp for a given ctx name
 * @param name {string} ctx name
 * @return {Number}
 */
CollectionTimeStamp.get = name => {
  if (!timeStamps.has(name)) {
    const error = new Error(`No collection for ${name} registered`)
    notifyAboutError({ error })
    throw error
  }

  const current = timeStamps.get(name)

  if (current === -1) {
    timeStamps.set(name, Date.now())
  }

  return timeStamps.get(name)
}

CollectionTimeStamp.routes = {}

CollectionTimeStamp.routes.get = {
  path: '/timestamp/get',
  method: 'get',
  schema: {
    context: String
  },
  run: function () {
    const { context } = this.data()
    return CollectionTimeStamp.get(context)
  }
}
