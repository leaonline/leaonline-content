/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Mongo } from 'meteor/mongo'
import { CRUDMethods } from '../defineCRUDMethods'
import { ContextRegistry } from '../../config/ContextRegistry'

const {
  defineInsertMethod,
  defineRemoveMethod,
  defineUpdateMethod,
  defineGetAllMethod,
  defineGetOneMethod,
  defineAllMethod
} = CRUDMethods

describe('CRUDMethods', function () {
  let ctx
  let name
  let collection

  beforeEach(function () {
    name = Random.id()
    collection = new Mongo.Collection(null)
    ctx = { name, collection: () => collection }
  })

  const assertThrows = (factory) => {
    it(`${factory.name} throws if the collection does not exist`, function () {
      const method = factory({ name: ctx.name, schema: ctx.schema })
      expect(() => method.run({})).to.throw(`[${method.name}]: Expected collection by name <${ctx.name}>`)
    })
  }

  describe('all', function () {
    [defineInsertMethod,
      defineRemoveMethod,
      defineUpdateMethod,
      defineGetAllMethod,
      defineGetOneMethod,
      defineAllMethod].forEach(assertThrows)
  })

  describe(defineGetOneMethod.name, function () {
    it('creates a method to get one doc', function () {
      ContextRegistry.add(ctx)
      const getOne = defineGetOneMethod({
        name: ctx.name
      })
      const insertDocId = collection.insert({ foo: 'bar' })
      const insertDoc = collection.findOne(insertDocId)
      expect(getOne.run({ _id: insertDocId })).to.deep.equal(insertDoc)
    })
  })
  describe(defineAllMethod.name, function () {
    it('creates a method to get all docs', function () {
      ContextRegistry.add(ctx)
      const getOne = defineAllMethod({
        name: ctx.name
      })
      collection.insert({ foo: 'bar' })
      const allDOcs = collection.find().fetch()
      expect(getOne.run()).to.deep.equal(allDOcs)
    })
    it('allows to filter by ids', function () {
      ContextRegistry.add(ctx)
      const getOne = defineAllMethod({
        name: ctx.name
      })
      const id1 = collection.insert({ foo: 'bar' })
      const id2 = collection.insert({ foo: 'bar' })
      const doc1 = collection.findOne(id1)
      const doc2 = collection.findOne(id2)
      expect(getOne.run({ ids: [id1] })).to.deep.equal([doc1])
      expect(getOne.run({ ids: [id2] })).to.deep.equal([doc2])
      expect(getOne.run({ ids: [id1, id2, Random.id()] })).to.deep.equal([doc1, doc2])
    })
    it('allows to filter by isLegacy', function () {
      ContextRegistry.add(ctx)
      const getAll = defineAllMethod({
        name: ctx.name
      })
      const id1 = collection.insert({ isLegacy: true })
      const id2 = collection.insert({})
      const id3 = collection.insert({ isLegacy: false })
      const doc1 = collection.findOne(id1)
      const doc2 = collection.findOne(id2)
      const doc3 = collection.findOne(id3)
      expect(getAll.run({ isLegacy: true })).to.deep.equal([doc1])
      expect(getAll.run({ isLegacy: false })).to.deep.equal([doc2, doc3])
      expect(getAll.run({})).to.deep.equal([doc1, doc2, doc3])
    })
  })
  describe(defineGetAllMethod.name, function () {
    it('creates a method to get all docs', function () {
      ContextRegistry.add(ctx)
      const getAll = defineGetAllMethod({
        name: ctx.name
      })
      collection.insert({ foo: 'bar' })
      const allDOcs = collection.find().fetch()
      expect(getAll.run()).to.deep.equal({ [name]: allDOcs })
    })
    it('allows to filter by isLegacy', function () {
      ContextRegistry.add(ctx)
      const getAll = defineGetAllMethod({
        name: ctx.name
      })
      const id1 = collection.insert({ isLegacy: true })
      const id2 = collection.insert({})
      const id3 = collection.insert({ isLegacy: false })
      const doc1 = collection.findOne(id1)
      const doc2 = collection.findOne(id2)
      const doc3 = collection.findOne(id3)
      expect(getAll.run({ isLegacy: true })).to.deep.equal({ [name]: [doc1] })
      expect(getAll.run({ isLegacy: false })).to.deep.equal({ [name]: [doc2, doc3] })
      expect(getAll.run({})).to.deep.equal({ [name]: [doc1, doc2, doc3] })
    })
    it('allows to pull dependencies', function () {
      const depsCollection = new Mongo.Collection(null)
      const dep = { name: Random.id(), collection: () => depsCollection }
      const depId = depsCollection.insert({ dep: 'foo' })

      ContextRegistry.add(dep)
      ContextRegistry.add(ctx)

      const getAll = defineGetAllMethod({
        name: ctx.name
      })

      collection.insert({ foo: 'bar' })
      const allDocs = collection.find().fetch()
      const depDocs = depsCollection.find().fetch()

      // ensure deps must exist
      const fakeId = Random.id()
      expect(() => getAll.run({ dependencies: [{ name: fakeId}]}))
        .to.throw(`[${getAll.name}]: Expected collection by name <${fakeId}>`)


      expect(getAll.run({ dependencies: [dep]})).to.deep.equal({
        [name]: allDocs,
        [dep.name]: depDocs
      })

      // with skip
      expect(getAll.run({ dependencies: [{ name: dep.name, skip: [depId]}]}))
        .to.deep.equal({
          [name]: allDocs,
          [dep.name]: []
        })
    })
  })
  describe(defineInsertMethod.name, function () {
    it('create a method to insert docs', function () {
      ContextRegistry.add(ctx)
      const insert = defineInsertMethod({
        name: ctx.name
      })
      expect(collection.find().count()).to.equal(0)
      const insertDocId = insert.run({ foo: 'bar' })
      expect(collection.find().count()).to.equal(1)
      const insertDoc = collection.findOne(insertDocId)
      expect(insertDoc).to.deep.equal({ _id: insertDocId, foo: 'bar' })
    })
  })
  describe(defineUpdateMethod.name, function () {
    it('creates a method to update a doc', function () {
      ContextRegistry.add(ctx)
      const update = defineUpdateMethod({
        name: ctx.name
      })

      const fakeId = Random.id()
      expect(() => update.run({ _id: fakeId }))
        .to.throw(`Expected document by _id <${fakeId}>`)

      const insertDocId = collection.insert({ foo: 'bar' })
      const originalDoc = collection.findOne(insertDocId)
      update.run({ _id: insertDocId, foo: 'baz' })

      const updatedDoc = collection.findOne(insertDocId)
      expect(updatedDoc).to.not.deep.equal(originalDoc)
      expect(updatedDoc).to.deep.equal({ _id: insertDocId, foo: 'baz' })
    })
  })
  describe(defineRemoveMethod.name, function () {
    it('creates a method to remove a doc', function () {
      ContextRegistry.add(ctx)
      const remove = defineRemoveMethod({
        name: ctx.name
      })
      const insertDocId = collection.insert({ foo: 'bar' })
      expect(remove.run({ _id: insertDocId })).to.equal(1)
      expect(collection.findOne()).to.equal(undefined)
    })
  })
})