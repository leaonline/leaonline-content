/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Mongo } from 'meteor/mongo'
import { createGetByIdRoute } from '../createGetByIdRoute'

describe(createGetByIdRoute.name, function () {
  const collection = new Mongo.Collection(null)
  const ctx = { name: Random.id(), collection: () => collection }

  it('creates a run function for a given ctx', function () {
    const run = createGetByIdRoute(ctx)
    const _id = collection.insert({})
    const env = { data: () => ({ _id }) }
    expect(run.call(env)).to.deep.equal({ _id })
  })
})
