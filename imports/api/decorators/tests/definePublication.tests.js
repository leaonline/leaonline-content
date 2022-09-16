/* eslint-env mocha */
import { Mongo } from 'meteor/mongo'
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Publications } from '../definePublications'
import { ContextRegistry } from '../../config/ContextRegistry'

describe(Publications.name, function () {
  describe(Publications.defineAllPublication.name, function () {
    it('creates a publication that throws if collection is not found', function () {
      const context = {
        name: Random.id(),
        collection: () => null
      }
      const getAll = Publications.defineAllPublication(context)

      ContextRegistry.add(context)
      expect(() => getAll.run()).to.throw(`Expected collection by name <${context.name}>`)
    })
    it('returns all docs from a collection', function () {
      const collection = new Mongo.Collection(null)
      const context = {
        name: Random.id(),
        collection: () => collection
      }
      const getAll = Publications.defineAllPublication(context)
      collection.insert({})
      collection.insert({})
      collection.insert({})

      const allDocs = collection.find().fetch()
      ContextRegistry.add(context)
      expect(getAll.run().fetch()).to.deep.equal(allDocs)
    })
  })
})
