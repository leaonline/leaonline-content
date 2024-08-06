/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Mongo } from 'meteor/mongo'
import { CRUDMethods } from '../defineCRUDMethods'
import { ContextRegistry } from '../../config/ContextRegistry'
import { expectThrow } from '../../../../tests/helpers/expectThrow'
import { restoreAll, stub } from '../../../../tests/helpers/testHelpers'
import { Email } from 'meteor/email'
import { asyncTimeout } from '../../../utils/asyncTimeout'

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
  let mailStub

  beforeEach(function () {
    name = Random.id()
    mailStub = stub(Email, 'sendAsync', () => {})
    collection = new Mongo.Collection(null)
    ctx = { name, collection: () => collection }
  })

  afterEach(() => restoreAll())

  const assertThrows = (factory) => {
    it(`${factory.name} throws if the collection does not exist`, async function () {
      const method = factory({ name: ctx.name, schema: ctx.schema })
      await expectThrow({
        fn: () => method.run({}),
        message: `[${method.name}]: Expected collection by name <${ctx.name}>`
      })

      await asyncTimeout(10)
      expect(mailStub.calledOnce).to.equal(true)
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
    it('creates a method to get one doc', async function () {
      ContextRegistry.add(ctx)
      const getOne = defineGetOneMethod({ name: ctx.name })
      const insertDocId = await collection.insertAsync({ foo: 'bar' })
      const insertDoc = await collection.findOneAsync(insertDocId)
      expect(await getOne.run({ _id: insertDocId })).to.deep.equal(insertDoc)
      expect(mailStub.calledOnce).to.equal(false)
    })
  })
  describe(defineAllMethod.name, function () {
    it('creates a method to get all docs', async function () {
      ContextRegistry.add(ctx)
      const getOne = defineAllMethod({ name: ctx.name })
      await collection.insertAsync({ foo: 'bar' })
      const allDOcs = await collection.find().fetchAsync()
      expect(await getOne.run()).to.deep.equal(allDOcs)
      expect(mailStub.calledOnce).to.equal(false)
    })
    it('allows to filter by ids', async function () {
      ContextRegistry.add(ctx)
      const getOne = defineAllMethod({ name: ctx.name })
      const id1 = await collection.insertAsync({ foo: 'bar' })
      const id2 = await collection.insertAsync({ foo: 'bar' })
      const doc1 = await collection.findOneAsync(id1)
      const doc2 = await collection.findOneAsync(id2)
      expect(await getOne.run({ ids: [id1] })).to.deep.equal([doc1])
      expect(await getOne.run({ ids: [id2] })).to.deep.equal([doc2])
      expect(await getOne.run({ ids: [id1, id2, Random.id()] })).to.deep.equal([doc1, doc2])
      expect(mailStub.calledOnce).to.equal(false)
    })
    it('allows to filter by isLegacy', async function () {
      ContextRegistry.add(ctx)
      const getAll = defineAllMethod({ name: ctx.name })
      const id1 = await collection.insertAsync({ isLegacy: true })
      const id2 = await collection.insertAsync({})
      const id3 = await collection.insertAsync({ isLegacy: false })
      const doc1 = await collection.findOneAsync(id1)
      const doc2 = await collection.findOneAsync(id2)
      const doc3 = await collection.findOneAsync(id3)
      expect(await getAll.run({ isLegacy: true })).to.deep.equal([doc1])
      expect(await getAll.run({ isLegacy: false })).to.deep.equal([doc2, doc3])
      expect(await getAll.run({})).to.deep.equal([doc1, doc2, doc3])
      expect(mailStub.calledOnce).to.equal(false)
    })
  })
  describe(defineGetAllMethod.name, function () {
    it('creates a method to get all docs', async function () {
      ContextRegistry.add(ctx)
      const getAll = defineGetAllMethod({ name: ctx.name })
      await collection.insertAsync({ foo: 'bar' })
      const allDOcs = await collection.find().fetchAsync()
      expect(await getAll.run()).to.deep.equal({ [name]: allDOcs })
      expect(mailStub.calledOnce).to.equal(false)
    })
    it('allows to filter by isLegacy', async function () {
      ContextRegistry.add(ctx)
      const getAll = defineGetAllMethod({ name: ctx.name })
      const id1 = await collection.insertAsync({ isLegacy: true })
      const id2 = await collection.insertAsync({})
      const id3 = await collection.insertAsync({ isLegacy: false })
      const doc1 = await collection.findOneAsync(id1)
      const doc2 = await collection.findOneAsync(id2)
      const doc3 = await collection.findOneAsync(id3)
      expect(await getAll.run({ isLegacy: true })).to.deep.equal({ [name]: [doc1] })
      expect(await getAll.run({ isLegacy: false })).to.deep.equal({ [name]: [doc2, doc3] })
      expect(await getAll.run({})).to.deep.equal({ [name]: [doc1, doc2, doc3] })
      expect(mailStub.calledOnce).to.equal(false)
    })
    it('allows to pull dependencies', async function () {
      const depsCollection = new Mongo.Collection(null)
      const dep = { name: Random.id(), collection: () => depsCollection }
      const depId = await depsCollection.insertAsync({ dep: 'foo' })

      ContextRegistry.add(dep)
      ContextRegistry.add(ctx)

      const getAll = defineGetAllMethod({ name: ctx.name })
      await collection.insertAsync({ foo: 'bar' })
      const allDocs = await collection.find().fetchAsync()
      const depDocs = await depsCollection.find().fetchAsync()

      // ensure deps must exist
      const fakeId = Random.id()
      await expectThrow({
        fn: () => getAll.run({ dependencies: [{ name: fakeId }] }),
        message: `[${getAll.name}]: Expected collection by name <${fakeId}>`
      })

      expect(await getAll.run({ dependencies: [dep] })).to.deep.equal({
        [name]: allDocs,
        [dep.name]: depDocs
      })

      // with skip
      expect(await getAll.run({ dependencies: [{ name: dep.name, skip: [depId] }] }))
        .to.deep.equal({
          [name]: allDocs,
          [dep.name]: []
        })

      await asyncTimeout(10)
      expect(mailStub.calledOnce).to.equal(true)
    })
  })
  describe(defineInsertMethod.name, function () {
    it('create a method to insert docs', async function () {
      ContextRegistry.add(ctx)
      const insert = defineInsertMethod({ name: ctx.name })
      expect(await collection.estimatedDocumentCount()).to.equal(0)
      const insertDocId = await insert.run({ foo: 'bar' })
      expect(await collection.estimatedDocumentCount()).to.equal(1)
      const insertDoc = await collection.findOneAsync(insertDocId)
      expect(insertDoc).to.deep.equal({ _id: insertDocId, foo: 'bar' })
      expect(mailStub.calledOnce).to.equal(false)
    })
  })
  describe(defineUpdateMethod.name, function () {
    it('creates a method to update a doc', async function () {
      ContextRegistry.add(ctx)
      const update = defineUpdateMethod({ name: ctx.name })
      const fakeId = Random.id()
      await expectThrow({
        fn: () => update.run({ _id: fakeId }),
        message: `Expected document by _id <${fakeId}>`
      })

      const insertDocId = await collection.insertAsync({ foo: 'bar' })
      const originalDoc = await collection.findOneAsync(insertDocId)
      await update.run({ _id: insertDocId, foo: 'baz' })

      const updatedDoc = await collection.findOneAsync(insertDocId)
      expect(updatedDoc).to.not.deep.equal(originalDoc)
      expect(updatedDoc).to.deep.equal({ _id: insertDocId, foo: 'baz' })

      await asyncTimeout(10)
      expect(mailStub.calledOnce).to.equal(true)
    })
  })
  describe(defineRemoveMethod.name, function () {
    it('creates a method to remove a doc', async function () {
      ContextRegistry.add(ctx)
      const remove = defineRemoveMethod({ name: ctx.name })
      const insertDocId = await collection.insertAsync({ foo: 'bar' })
      expect(await remove.run({ _id: insertDocId })).to.equal(1)
      expect(await collection.findOneAsync()).to.equal(undefined)
      expect(mailStub.calledOnce).to.equal(false)
    })
  })
})
