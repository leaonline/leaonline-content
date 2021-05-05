export const CollectionTimeStamp = {}

const timeStamps = new Map()
const streams = new Map()
CollectionTimeStamp.register = (name, collection) => {
  if (streams.has(name)) return
  if (!collection) throw new Error(`Expected collection for ${name}`)

  // the initial -1 entry indicates a registered context but no timestamp yet
  timeStamps.set(name, -1)

  const rawCollection = collection.rawCollection()
  const stream = rawCollection.watch()
  stream.on('changed', () => timeStamps.set(name, Date.now()))
  streams.set(name, stream)
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

CollectionTimeStamp.methods = {}

CollectionTimeStamp.methods.get = {
  name: 'collectionTimeStamp.methods.get',
  schema: {
    context: String
  },
  run: function ({ context }) {
    return CollectionTimeStamp.get(context)
  }
}