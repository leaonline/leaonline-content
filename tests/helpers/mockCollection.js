import { Mongo } from 'meteor/mongo'
import { Random } from 'meteor/random'
import { Schema } from '../../imports/api/schema/Schema'

const originals = new Map()

/**
 * Enables to run insert/update/remove test data without affecting
 * our development database.
 * Since all collections are accessed via context.collection(),
 * this is an easy alternative to stubbing out collection behavior in unit tests
 * and to make integration tests much more close production.
 * @param context {object}
 * @param collectionFn {function():Mongo.Collection}
 * @return {Mongo.Collection}
 */
export const mockCollection = (context, collectionFn) => {
  if (originals.has(context)) {
    throw new Error(`Collection already mocked for ${context.name}`)
  }

  originals.set(context, context.collection)
  const collection = collectionFn
    ? collectionFn()
    : new Mongo.Collection(`test_${context.name}_${Random.id()}`)
  context.collection = () => collection
  return collection
}

/**
 * Restores the original collection function on the given context.
 * @param context {object}
 */
export const restoreCollection = context => {
  const original = originals.get(context)
  if (!original) {
    throw new Error(`Collection is not mocked for ${context.name}`)
  }

  context.collection = original
  originals.delete(context)
}

/**
 * Attaches a schema to the given collection.
 * @param collection
 * @param schema
 */
export const attachSchema = (collection, schema) => {
  const instance = Schema.create(schema)
  collection.attachSchema(instance)
}
