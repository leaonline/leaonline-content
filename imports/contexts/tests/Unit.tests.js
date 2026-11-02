/* eslint-env mocha */
import { Email } from 'meteor/email'
import { expect } from 'chai'
import { Random } from 'meteor/random'
import sinon from 'sinon'
import { Unit } from '../Unit'
import { UnitSet } from '../UnitSet'

const unitDocument = ({ _id = Random.id(), pages = [{}] } = {}) => ({
  _id,
  status: 1,
  title: `Unit ${_id}`,
  unitSet: Random.id(),
  shortCode: `UNIT_${_id}`,
  pages
})

const captureNotification = () => {
  let resolveNotification
  const notification = new Promise(resolve => {
    resolveNotification = resolve
  })
  sinon.stub(Email, 'sendAsync').callsFake(async data => resolveNotification(data))
  return notification
}

describe(Unit.name, function () {
  let UnitCollection
  let UnitSetCollection

  const cleanCollections = () => Promise.all([
    UnitCollection.removeAsync({}),
    UnitSetCollection.removeAsync({})
  ])

  before(function () {
    // Use the app-test collections so their installed hooks run.
    UnitCollection = Unit.collection()
    UnitSetCollection = UnitSet.collection()
  })

  beforeEach(cleanCollections)

  afterEach(async function () {
    sinon.restore()
    await cleanCollections()
  })

  describe(Unit.routes.all.path, function () {
    const handler = Unit.routes.all.run

    it('returns documents selected by ids', async function () {
      await UnitCollection.rawCollection().insertMany([
        { _id: 'unit-a', title: 'A', pages: [] },
        { _id: 'unit-b', title: 'B', pages: [] },
        { _id: 'unit-c', title: 'C', pages: [] }
      ])

      const result = await handler.call({
        data: () => ({ ids: ['unit-a', 'unit-c'] })
      })

      expect(result.map(doc => doc._id).sort()).to.deep.equal(['unit-a', 'unit-c'])
    })

    it('returns an empty list when neither ids nor a UnitSet is provided', async function () {
      expect(await handler.call({ data: () => ({}) })).to.deep.equal([])
    })

    it('returns ids selected by UnitSet', async function () {
      await UnitSetCollection.rawCollection().insertOne({ _id: 'set' })
      await UnitCollection.rawCollection().insertMany([
        { _id: 'unit-a', unitSet: 'set', pages: [] },
        { _id: 'unit-b', unitSet: 'other', pages: [] }
      ])

      const result = await handler.call({
        data: () => ({ unitSet: 'set' })
      })

      expect(result).to.deep.equal(['unit-a'])
    })

    it('notifies and rejects when the UnitSet lookup is ambiguous', async function () {
      const notification = captureNotification()
      sinon.stub(UnitSetCollection, 'countDocuments').resolves(2)

      try {
        await handler.call({ data: () => ({ unitSet: 'ambiguous' }) })
        expect.fail('Expected ambiguous UnitSet to reject')
      }
      catch (error) {
        expect(error.message).to.equal('Doc not found for unitSet by id ambiguous')
      }
      expect(await notification).to.have.property('text')
    })
  })

  describe('progress hooks', function () {
    it('recomputes linked UnitSets after insert', async function () {
      const unitId = Random.id()
      await UnitSetCollection.rawCollection().insertOne({
        _id: 'set',
        units: [unitId]
      })

      await UnitCollection.insertAsync(unitDocument({
        _id: unitId,
        pages: [{}, {}, {}]
      }))

      expect((await UnitSetCollection.findOneAsync('set')).progress).to.equal(3)
    })

    it('recomputes linked UnitSets only when the page count changes', async function () {
      const unitId = Random.id()
      await UnitSetCollection.rawCollection().insertOne({
        _id: 'set',
        units: [unitId]
      })
      await UnitCollection.insertAsync(unitDocument({ _id: unitId, pages: [{}] }))
      expect((await UnitSetCollection.findOneAsync('set')).progress).to.equal(1)

      const updateUnitSet = sinon.spy(UnitSetCollection, 'updateAsync')
      await UnitCollection.updateAsync(unitId, { $set: { title: 'Renamed unit' } })
      expect(updateUnitSet.called).to.equal(false)
      expect((await UnitSetCollection.findOneAsync('set')).progress).to.equal(1)

      await UnitCollection.updateAsync(unitId, { $set: { pages: [{}, {}, {}] } })
      expect(updateUnitSet.calledOnce).to.equal(true)
      expect((await UnitSetCollection.findOneAsync('set')).progress).to.equal(3)
    })
  })
})
