/* eslint-env mocha */
import { expect } from 'chai'
import sinon from 'sinon'
import {
  unitSetOrderChanged,
  testCycleOrderChanged,
  unitProgressChanged,
  unitSetProgressChanged
} from '../calculateProgress'
import {
  mockCollection,
  restoreCollection
} from '../../../../tests/helpers/mockCollection'
import { Unit } from '../../../contexts/Unit'
import { UnitSet } from '../../../contexts/UnitSet'
import { TestCycle } from '../../../contexts/TestCycle'

describe('calculate progress', function () {
  let UnitCollection
  let UnitSetCollection
  let TestCycleCollection

  const createUnitDoc = ({ pages = [{}] } = {}) => UnitCollection.insertAsync({ pages })
  const createUnitSetDoc = async ({ units, progress } = {}) => {
    const linkedUnits = units || [await createUnitDoc()]
    return UnitSetCollection.insertAsync({ units: linkedUnits, progress })
  }
  const createTestCycleDoc = async ({ unitSets } = {}) => {
    const linkedUnitSets = unitSets || [await createUnitSetDoc()]
    return TestCycleCollection.insertAsync({ unitSets: linkedUnitSets })
  }

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

  describe(unitProgressChanged.name, function () {
    it('aggregates page counts for every linked UnitSet', async function () {
      const changedUnitId = await createUnitDoc({ pages: [{}, {}] })
      const missingPagesId = await UnitCollection.insertAsync({})
      const linkedId = await createUnitSetDoc({ units: [changedUnitId, missingPagesId] })
      const unrelatedId = await createUnitSetDoc({ units: [await createUnitDoc({ pages: [{}, {}, {}] })] })

      await unitProgressChanged({ unitId: changedUnitId })

      expect((await UnitSetCollection.findOneAsync(linkedId)).progress).to.equal(2)
      expect((await UnitSetCollection.findOneAsync(unrelatedId)).progress).to.equal(undefined)
    })

    it('performs no writes when no UnitSet links to the unit', async function () {
      const update = sinon.spy(UnitSetCollection, 'updateAsync')

      await unitProgressChanged({ unitId: await createUnitDoc() })

      expect(update.called).to.equal(false)
    })
  })

  describe(unitSetOrderChanged.name, function () {
    it('updates one UnitSet and treats missing pages as zero', async function () {
      const unitSetId = await createUnitSetDoc({
        units: [
          await createUnitDoc({ pages: [{}, {}, {}] }),
          await UnitCollection.insertAsync({}),
          await createUnitDoc({ pages: [] })
        ]
      })

      await unitSetOrderChanged({ unitSetId })

      expect((await UnitSetCollection.findOneAsync(unitSetId)).progress).to.equal(3)
    })
  })

  describe(unitSetProgressChanged.name, function () {
    it('fans progress out to every linked TestCycle', async function () {
      const changedId = await createUnitSetDoc({ progress: 2 })
      const otherId = await createUnitSetDoc({ progress: 5 })
      const linkedOne = await createTestCycleDoc({ unitSets: [changedId, otherId] })
      const linkedTwo = await createTestCycleDoc({ unitSets: [changedId] })
      const unrelated = await createTestCycleDoc({ unitSets: [otherId] })

      await unitSetProgressChanged({ unitSetId: changedId })

      expect((await TestCycleCollection.findOneAsync(linkedOne)).progress).to.equal(7)
      expect((await TestCycleCollection.findOneAsync(linkedTwo)).progress).to.equal(2)
      expect((await TestCycleCollection.findOneAsync(unrelated)).progress).to.equal(undefined)
    })

    it('performs no writes when no TestCycle links to the UnitSet', async function () {
      const update = sinon.spy(TestCycleCollection, 'updateAsync')

      await unitSetProgressChanged({ unitSetId: await createUnitSetDoc({ progress: 1 }) })

      expect(update.called).to.equal(false)
    })
  })

  describe(testCycleOrderChanged.name, function () {
    it('sums progress and treats missing progress as zero', async function () {
      const testCycleId = await createTestCycleDoc({
        unitSets: [
          await createUnitSetDoc({ progress: 2 }),
          await createUnitSetDoc({ progress: 5 }),
          await createUnitSetDoc()
        ]
      })

      await testCycleOrderChanged({ testCycleId })

      expect((await TestCycleCollection.findOneAsync(testCycleId)).progress).to.equal(7)
    })
  })
})
