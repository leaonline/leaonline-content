export const CollectionTimeStamp = {}

const timeStamps = new Map()
const streams = new Map()

CollectionTimeStamp.register = (name, collection) => {
  if (streams.has(name)) return
  if (!collection) throw new Error(`Expected collection for ${name}`)

  // the initial -1 entry indicates a registered context but no timestamp yet
  timeStamps.set(name, -1)

  const updateTimeStamp = () => timeStamps.set(name, Date.now())

  collection.after.insert(updateTimeStamp)
  collection.after.update(updateTimeStamp)
  collection.after.remove(updateTimeStamp)
}

CollectionTimeStamp.get = name => {
  if (!timeStamps.has(name)) {
    throw new Error(`No timestamp for ${name} registered`)
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