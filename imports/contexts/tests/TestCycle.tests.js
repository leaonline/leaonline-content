/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import sinon from 'sinon'
import { TestCycle } from '../TestCycle'
import { UnitSet } from '../UnitSet'

const testCycleDocument = ({ _id = Random.id(), unitSets = [] } = {}) => ({
  _id,
  status: 1,
  title: `TestCycle ${_id}`,
  unitSets,
  shortCode: `CYCLE_${_id}`,
  dimension: Random.id(),
  field: Random.id(),
  level: Random.id()
})

describe(TestCycle.name, function () {
  let TestCycleCollection
  let UnitSetCollection

  const cleanCollections = () => Promise.all([
    TestCycleCollection.removeAsync({}),
    UnitSetCollection.removeAsync({})
  ])

  before(function () {
    // Use the app-test collections so their installed hooks run.
    TestCycleCollection = TestCycle.collection()
    UnitSetCollection = UnitSet.collection()
  })

  beforeEach(cleanCollections)

  afterEach(async function () {
    sinon.restore()
    await cleanCollections()
  })

  describe(TestCycle.routes.all.path, function () {
    const handler = TestCycle.routes.all.run

    it('builds the supported field and legacy filters', async function () {
      const expected = [{ _id: 'cycle' }]
      const fetchAsync = sinon.stub().resolves(expected)
      const find = sinon.stub(TestCycleCollection, 'find').returns({ fetchAsync })

      const result = await handler.call({
        data: () => ({ field: 'field-id', isLegacy: 'true' }),
        error: expect.fail
      })

      expect(result).to.equal(expected)
      expect(find.calledOnceWithExactly({
        isLegacy: true,
        field: 'field-id'
      })).to.equal(true)
      expect(fetchAsync.calledOnce).to.equal(true)
    })

    it('rejects an empty query with the route error contract', async function () {
      const failure = new Error('route rejected')
      const error = sinon.stub().throws(failure)

      try {
        await handler.call({
          data: () => ({ isLegacy: 'false' }),
          error
        })
        expect.fail('Expected empty query to reject')
      }
      catch (actual) {
        expect(actual).to.equal(failure)
      }
      expect(error.calledOnceWithExactly({
        code: 500,
        title: 'routes.queryFailed',
        description: 'routes.emptyQueryNotSupported',
        info: JSON.stringify({ query: {} })
      })).to.equal(true)
    })
  })

  describe('progress hooks', function () {
    it('computes progress after inserting a linked cycle', async function () {
      await UnitSetCollection.rawCollection().insertMany([
        { _id: 'set-a', progress: 2 },
        { _id: 'set-b', progress: 3 }
      ])

      await TestCycleCollection.insertAsync(testCycleDocument({
        _id: 'cycle',
        unitSets: ['set-a', 'set-b']
      }))

      expect((await TestCycleCollection.findOneAsync('cycle')).progress).to.equal(5)
    })

    it('does not recompute progress after inserting an empty cycle', async function () {
      const update = sinon.spy(TestCycleCollection, 'updateAsync')

      await TestCycleCollection.insertAsync(testCycleDocument({
        _id: 'empty-cycle',
        unitSets: []
      }))

      expect(update.called).to.equal(false)
      expect((await TestCycleCollection.findOneAsync('empty-cycle')).progress).to.equal(0)
    })

    it('normalizes null UnitSets and recomputes progress', async function () {
      await UnitSetCollection.rawCollection().insertOne({ _id: 'set', progress: 4 })
      await TestCycleCollection.insertAsync(testCycleDocument({
        _id: 'cycle',
        unitSets: ['set']
      }))

      await TestCycleCollection.updateAsync('cycle', {
        $set: { unitSets: null }
      })

      const cycle = await TestCycleCollection.findOneAsync('cycle')
      expect(cycle.unitSets).to.deep.equal([])
      expect(cycle.progress).to.equal(0)
    })

    it('recomputes only when the linked UnitSet list changes', async function () {
      await UnitSetCollection.rawCollection().insertMany([
        { _id: 'set-a', progress: 2 },
        { _id: 'set-b', progress: 5 }
      ])
      await TestCycleCollection.insertAsync(testCycleDocument({
        _id: 'cycle',
        unitSets: ['set-a']
      }))
      expect((await TestCycleCollection.findOneAsync('cycle')).progress).to.equal(2)

      const update = sinon.spy(TestCycleCollection, 'updateAsync')
      await TestCycleCollection.updateAsync('cycle', {
        $set: { selfAssessment: 'Still the same UnitSet list' }
      })
      expect(update.callCount).to.equal(1)

      await TestCycleCollection.updateAsync('cycle', {
        $set: { unitSets: ['set-b'] }
      })
      expect(update.callCount).to.equal(3)
      expect((await TestCycleCollection.findOneAsync('cycle')).progress).to.equal(5)
    })
  })
})
