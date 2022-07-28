/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { initCollection } from '../initCollection'
import { CollectionTimeStamp } from '../../collection/CollectionTimeStamp'
import { stub, overrideStub, restoreAll } from '../../../../tests/helpers/testHelpers'

describe(initCollection.name, function () {
  let name

  beforeEach(function () {
    name = Random.id()
    stub(CollectionTimeStamp, 'register', () => {})
  })

  afterEach(function () {
    restoreAll()
  })

  it('creates a new Mongo.Collection with schema attached', function () {
    let registered = false
    overrideStub(CollectionTimeStamp, 'register', () => { registered = true })

    const schema = { title: String }
    const context = { name, schema }
    initCollection(context)

    const collection = context.collection()
    expect(registered).to.equal(true)
    expect(() => collection.insert({}))
      .to.throw(`Title is required in ${name} insert`)
  })
  it('has default hooks added to the collection', function () {
    const schema = { title: String }
    const context = { name, schema }
    initCollection(context)

    const title = Random.id()
    const collection = context.collection()
    const insertDocId = collection.insert({ title })
    expect(collection.findOne().title).to.equal(title)
    collection.update(insertDocId, { $set: { title: 'foo' }})


    const { meta, ...doc } = collection.findOne(insertDocId)
    expect(doc).to.deep.equal({ _id: insertDocId, title: 'foo' })
    expect(meta.createdAt).to.be.instanceOf(Date)
    expect(meta.updatedAt).to.be.instanceOf(Date)

    collection.remove(insertDocId)
  })
  it('has custom hooks added to the collection', function () {
    let afterInsertCalled = false
    let beforeUpdateCalled = false
    let afterUpdateCalled = false

    const afterInsert = () => { afterInsertCalled = true }
    const beforeUpdate = () => { beforeUpdateCalled = true }
    const afterUpdate = () => { afterUpdateCalled = true }

    const title = Random.id()
    const schema = { title: String }
    const context = { name, schema, afterInsert, beforeUpdate, afterUpdate }
    initCollection(context)

    const collection = context.collection()
    const insertDocId = collection.insert({ title })
    collection.update(insertDocId, { $set: { title: 'foo' }})

    expect(afterUpdateCalled).to.equal(true)
    expect(beforeUpdateCalled).to.equal(true)
    expect(afterUpdateCalled).to.equal(true)
  })
  it('creates a new FilesCollection if the context is flagged respectively', function () {
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
