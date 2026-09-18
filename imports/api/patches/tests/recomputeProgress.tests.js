/* eslint-env mocha */
import { expect } from 'chai'
import sinon from 'sinon'
import { recomputeProgress } from '../recomputeProgress'
import { Unit } from '../../../contexts/Unit'
import { UnitSet } from '../../../contexts/UnitSet'
import { TestCycle } from '../../../contexts/TestCycle'
import { mockCollection, restoreCollection } from '../../../../tests/helpers/mockCollection'

describe(recomputeProgress.name, function () {
  let UnitCollection
  let UnitSetCollection
  let TestCycleCollection

  before(function () {
    UnitCollection = mockCollection(Unit)
    UnitSetCollection = mockCollection(UnitSet)
    TestCycleCollection = mockCollection(TestCycle)
  })

  beforeEach(async function () {
    await Promise.all([
      UnitCollection.removeAsync({}),
      UnitSetCollection.removeAsync({}),
      TestCycleCollection.removeAsync({})
    ])
  })

  afterEach(function () {
    sinon.restore()
  })

  after(async function () {
    await Promise.all([
      UnitCollection.removeAsync({}),
      UnitSetCollection.removeAsync({}),
      TestCycleCollection.removeAsync({})
    ])
    restoreCollection(Unit)
    restoreCollection(UnitSet)
    restoreCollection(TestCycle)
  })

  it('visits and awaits every UnitSet before every TestCycle', async function () {
    await UnitCollection.insertAsync({ _id: 'unit-a', pages: [{}, {}] })
    await UnitCollection.insertAsync({ _id: 'unit-b', pages: [{}] })
    await UnitSetCollection.insertAsync({ _id: 'set-a', units: ['unit-a'] })
    await UnitSetCollection.insertAsync({ _id: 'set-b', units: ['unit-b'] })
    await TestCycleCollection.insertAsync({ _id: 'cycle-a', unitSets: ['set-a', 'set-b'] })
    await TestCycleCollection.insertAsync({ _id: 'cycle-b', unitSets: ['set-b'] })
    const updateUnitSet = sinon.spy(UnitSetCollection, 'updateAsync')
    const updateTestCycle = sinon.spy(TestCycleCollection, 'updateAsync')

    await recomputeProgress()

    expect(updateUnitSet.callCount).to.equal(2)
    expect(updateUnitSet.calledWith('set-a', { $set: { progress: 2 } })).to.equal(true)
    expect(updateUnitSet.calledWith('set-b', { $set: { progress: 1 } })).to.equal(true)
    expect(updateTestCycle.callCount).to.equal(2)
    expect(updateTestCycle.calledWith('cycle-a', { $set: { progress: 3 } })).to.equal(true)
    expect(updateTestCycle.calledWith('cycle-b', { $set: { progress: 1 } })).to.equal(true)
  })

  it('completes without writes for empty collections', async function () {
    const updateUnitSet = sinon.spy(UnitSetCollection, 'updateAsync')
    const updateTestCycle = sinon.spy(TestCycleCollection, 'updateAsync')

    await recomputeProgress()

    expect(updateUnitSet.called).to.equal(false)
    expect(updateTestCycle.called).to.equal(false)
  })

  it('propagates a rejected progress update and stops before TestCycles', async function () {
    await UnitSetCollection.insertAsync({ _id: 'set', units: [] })
    await TestCycleCollection.insertAsync({ _id: 'cycle', unitSets: ['set'] })
    const failure = new Error('update failed')
    sinon.stub(UnitSetCollection, 'updateAsync').rejects(failure)
    const updateTestCycle = sinon.spy(TestCycleCollection, 'updateAsync')

    try {
      await recomputeProgress()
      expect.fail('Expected rejected update to propagate')
    }
    catch (error) {
      expect(error).to.equal(failure)
    }
    expect(updateTestCycle.called).to.equal(false)
  })
})
