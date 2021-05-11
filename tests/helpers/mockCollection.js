import { Mongo } from 'meteor/mongo'

const originals = new Map()

export const mockCollection = (context, collectionFn = context.collection) => {
  originals.set(context.name, context.collection)
  const collection = new Mongo.Collection(null)
  context.collection = collectionFn || (() => collection)
}

export const restoreCollection = context => {
  context.collection = originals.get(context.name)
  originals.delete(context.name)
}
