/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Mongo } from 'meteor/mongo'
import { createGetByCodeRoute } from '../createGetByCodeRoute'

describe(createGetByCodeRoute.name, () => {
  const collection = new Mongo.Collection(null)
  const ctx = { name: Random.id(), collection: () => collection }

  it('creates a route handler to get documents by shortCode', async () => {
    const route = createGetByCodeRoute(ctx)
    const data = { foo: 'baz', shortCode: 'moo' }
    const docId = await collection.insertAsync(data)
    const env = { data: () => ({ shortCode: 'moo' }) }
    const document = await route.call(env)
    expect(document).to.deep.equal({ _id: docId, ...data })
  })
})
