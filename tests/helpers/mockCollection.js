import { Mongo } from 'meteor/mongo'
import { Schema } from '../../imports/api/schema/Schema'

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

export const attachSchema = (collection, schema) => {
  const instance = Schema.create(schema)
  collection.attachSchema(instance)
}
