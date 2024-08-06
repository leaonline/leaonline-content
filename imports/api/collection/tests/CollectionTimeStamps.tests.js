/* eslint-env mocha */
import { Email } from 'meteor/email'
import { Mongo } from 'meteor/mongo'
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { CollectionTimeStamp } from '../CollectionTimeStamp'
import { asyncTimeout } from '../../../utils/asyncTimeout'
import { stub, restoreAll } from '../../../../tests/helpers/testHelpers'

describe(CollectionTimeStamp.name, function () {
  const collection = new Mongo.Collection(null)
  const name = Random.id()
  let mailStub
  beforeEach(() => {
    mailStub = stub(Email, 'sendAsync', () => {})
  })

  afterEach(function () {
    restoreAll()
  })
  it('returns a fallback if no timestamp is added yet', async function () {
    CollectionTimeStamp.register(name, collection)
    const now = Date.now()
    await asyncTimeout(50)
    expect(CollectionTimeStamp.get(name)).to.be.above(now)
  })
  it('registers timestamps for insert, update and remove', async function () {
    let now = Date.now()

    // insert
    await asyncTimeout(50)
    const insertDocId = await collection.insertAsync({})
    const afterInsert = CollectionTimeStamp.get(name)
    expect(afterInsert).to.be.above(now)
    now = afterInsert

    // update
    await asyncTimeout(50)
    // should still be equal
    expect(CollectionTimeStamp.get(name)).to.equal(now)
    await collection.updateAsync(insertDocId, { $set: { foo: 'bar' } })
    const afterUpdate = CollectionTimeStamp.get(name)
    expect(afterUpdate).to.be.above(now)
    now = afterUpdate

    // remove
    await asyncTimeout(50)
    // should still be equal
    expect(CollectionTimeStamp.get(name)).to.equal(now)
    await collection.removeAsync(insertDocId)
    const afterRemove = CollectionTimeStamp.get(name)
    expect(afterRemove).to.be.above(now)
  })
  it('throws if the collection does not exist', async function () {
    const unknown = Random.id()

    expect(() => CollectionTimeStamp.register(unknown))
      .to.throw(`Expected collection for ${unknown}`)
    await asyncTimeout(50) // email send is deferred
    expect(mailStub.calledOnce).to.equal(true)
  })
  it('throws on access to unregistered collection', async function () {
    const unknown = Random.id()
    expect(() => CollectionTimeStamp.get(unknown))
      .to.throw(`No collection for ${unknown} registered`)
    await asyncTimeout(50) // email send is deferred
    expect(mailStub.calledOnce).to.equal(true)
  })
  it('provides a route for accessing the timestamp', async function () {
    const now = Date.now()
    const env = {
      data: () => ({
        context: name
      })
    }
    await asyncTimeout(50)
    const lastUpdate = await CollectionTimeStamp.routes.get.run.call(env)
    expect(lastUpdate).to.be.below(now)
  })
  it('ignores already registered collections', function () {
    for (let i = 0; i < 10; i++) {
      expect(CollectionTimeStamp.register(name, collection)).to.equal(undefined)
    }
  })
})
