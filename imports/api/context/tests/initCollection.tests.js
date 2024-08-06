/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { initCollection } from '../initCollection'
import { CollectionTimeStamp } from '../../collection/CollectionTimeStamp'
import { stub, restoreAll } from '../../../../tests/helpers/testHelpers'
import { expectThrow } from '../../../../tests/helpers/expectThrow'

describe(initCollection.name, async function () {
  let name
  let timeStampStub

  beforeEach(function () {
    name = Random.id()
    timeStampStub = stub(CollectionTimeStamp, 'register', () => {})
  })

  afterEach(function () {
    restoreAll()
  })

  it('creates a new Mongo.Collection with schema attached', async function () {
    const schema = { title: String }
    const context = { name, schema }
    initCollection(context)
    expect(timeStampStub.calledOnce).to.equal(true)
    const collection = context.collection()
    await expectThrow({
      fn: () => collection.insertAsync({}),
      message: `Title is required in ${name} insertAsync`
    })
  })
  it('has default hooks added to the collection', async function () {
    const schema = { title: String }
    const context = { name, schema }
    initCollection(context)

    const title = Random.id()
    const collection = context.collection()
    const insertDocId = await collection.insertAsync({ title })
    expect(insertDocId).to.be.a('string')
    const insertDoc = await collection.findOneAsync(insertDocId)
    expect(insertDoc.title).to.equal(title)
    await collection.updateAsync(insertDocId, { $set: { title: 'foo' } })

    const { meta, ...doc } = await collection.findOneAsync(insertDocId)
    expect(doc).to.deep.equal({ _id: insertDocId, title: 'foo' })
    expect(meta.createdAt).to.be.instanceOf(Date)
    expect(meta.updatedAt).to.be.instanceOf(Date)

    await collection.removeAsync(insertDocId)
  })
  it('has custom hooks added to the collection', async function () {
    let afterInsertCalled = false
    let beforeUpdateCalled = false
    let afterUpdateCalled = false

    const afterInsert = () => {
      afterInsertCalled = true
    }
    const beforeUpdate = () => {
      beforeUpdateCalled = true
    }
    const afterUpdate = () => {
      afterUpdateCalled = true
    }

    const title = Random.id()
    const schema = { title: String }
    const context = { name, schema, afterInsert, beforeUpdate, afterUpdate }
    initCollection(context)

    const collection = context.collection()
    const insertDocId = await collection.insertAsync({ title })
    await collection.updateAsync(insertDocId, { $set: { title: 'foo' } })

    expect(afterInsertCalled).to.equal(true)
    expect(beforeUpdateCalled).to.equal(true)
    expect(afterUpdateCalled).to.equal(true)
  })
  it('creates a new FilesCollection if the context is flagged respectively', async function () {
    const schema = {}
    const context = {
      collectionName: name,
      schema,
      isFilesCollection: true,
      maxSize: 10000,
      extension: ['.foo']
    }
    initCollection(context)

    const filesCollection = context.collection()
    expect(filesCollection.collection._name).to.equal(name)
  })
})
