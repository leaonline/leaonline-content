/* eslint-env mocha */
import { Mongo } from 'meteor/mongo'
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Publications } from '../definePublications'
import { ContextRegistry } from '../../config/ContextRegistry'
import { expectThrow } from '../../../../tests/helpers/expectThrow'
import { Email } from 'meteor/email'
import { stub, restoreAll } from '../../../../tests/helpers/testHelpers'
import { asyncTimeout } from '../../../utils/asyncTimeout'

describe(Publications.name, function () {
  afterEach(() => restoreAll())
  describe(Publications.defineAllPublication.name, function () {
    it('creates a publication that throws if collection is not found', async function () {
      const mailStub = stub(Email, 'sendAsync', () => {})
      const context = {
        name: Random.id(),
        collection: () => null
      }
      const getAll = Publications.defineAllPublication(context)

      ContextRegistry.add(context)
      await expectThrow({
        fn: () => getAll.run(),
        message: `Expected collection by name <${context.name}>`
      })
      await asyncTimeout(10)
      expect(mailStub.calledOnce).to.equal(true)
    })
    it('returns all docs from a collection', async function () {
      const collection = new Mongo.Collection(null)
      const context = {
        name: Random.id(),
        collection: () => collection
      }
      const getAll = Publications.defineAllPublication(context)
      await collection.insertAsync({})
      await collection.insertAsync({})
      await collection.insertAsync({})

      const allDocs = await collection.find().fetchAsync()
      ContextRegistry.add(context)
      expect(await getAll.run().fetchAsync()).to.deep.equal(allDocs)
    })
  })
})
