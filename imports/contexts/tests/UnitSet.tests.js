/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { UnitSet } from '../UnitSet'
import { Unit } from '../Unit'
import { attachSchema, mockCollection, restoreCollection } from '../../../tests/helpers/mockCollection'
import { TestCycle } from '../TestCycle'

describe(UnitSet.name, function () {
  let UnitSetCollection
  let UnitCollection
  let TestCylceCollection

  before(async () => {
    mockCollection(UnitSet)
    mockCollection(Unit)
    mockCollection(TestCycle)
    UnitSetCollection = UnitSet.collection()
    UnitCollection = Unit.collection()
    TestCylceCollection = TestCycle.collection()
    attachSchema(UnitSetCollection, UnitSet.schema)
  })

  afterEach(async () => {
    await UnitSetCollection.removeAsync({})
  })

  after(() => {
    restoreCollection(UnitSet)
    restoreCollection(Unit)
    restoreCollection(TestCycle)
  })

  describe('UnitSet.routes.all', () => {
    const handler = UnitSet.routes.all.run
    it('throws if no query parameters are provided', async () => {
      const env = {
        data: () => ({}),
        error: (error) => {
          expect(error).to.deep.equal({
            code: 500,
            title: 'routes.queryFailed',
            description: 'routes.emptyQueryNotSupported',
            info: JSON.stringify({ query: {} })
          })
        }
      }
      await handler.call(env)
    })
    it('implements a get-all route', async () => {
      const fieldId = Random.id()
      const fieldId2 = Random.id()
      const env = {
        data: () => ({ field: fieldId }),
        error: expect.fail
      }
      const unitSetId = await UnitSetCollection.insertAsync({
        dimension: Random.id(),
        dimensionShort: 'x',
        field: fieldId,
        shortCode: Random.id(),
        level: Random.id()
      })
      const unitSetDoc1 = await UnitSetCollection.findOneAsync(unitSetId)
      let result = await handler.call(env)
      expect(result).to.deep.equal([unitSetDoc1])

      env.data = () => ({ job: fieldId })
      result = await handler.call(env)
      expect(result).to.deep.equal([])

      const unitSetId2 = await UnitSetCollection.insertAsync({
        field: fieldId2,
        isLegacy: true,
        dimension: Random.id(),
        dimensionShort: 'x',
        shortCode: Random.id(),
        level: Random.id()
      })
      const unitSetDoc2 = await UnitSetCollection.findOneAsync(unitSetId2)
      env.data = () => ({ field: fieldId2, isLegacy: 'true' })
      result = await handler.call(env)
      expect(result).to.deep.equal([unitSetDoc2])
    })
  })

  describe('afterInsert', () => {
    const insert = UnitSet.methods.insert.run
    it('updates progress if units is not empty', async () => {
      const unitId = await UnitCollection.insertAsync({
        status: 1,
        title: 'moo',
        unitSet: Random.id(),
        shortCode: Random.id(),
        pages: [{}, {}, {}]
      })
      const userId = Random.id()
      const unitSetId = await insert.call({ userId }, {
        status: 1,
        dimension: Random.id(),
        dimensionShort: 'x',
        field: Random.id(),
        shortCode: Random.id(),
        level: Random.id(),
        units: [unitId]
      })
      const unitSetDoc = await UnitSetCollection.findOneAsync(unitSetId)
      expect(unitSetDoc.progress).to.equal(3)
    })
  })

  describe('beforeUpdate', () => {
    const insert = UnitSet.methods.insert.run
    const update = UnitSet.methods.update.run
    it('makes units an empty array if it is set to null', async () => {
      const unitId = await UnitCollection.insertAsync({
        status: 1,
        title: 'moo',
        unitSet: Random.id(),
        shortCode: Random.id(),
        pages: [{}, {}, {}]
      })
      const userId = Random.id()
      const unitSetId = await insert.call({ userId }, {
        status: 1,
        dimension: Random.id(),
        dimensionShort: 'x',
        field: Random.id(),
        shortCode: Random.id(),
        level: Random.id(),
        units: [unitId]
      })

      let unitSetDoc = await UnitSetCollection.findOneAsync(unitSetId)
      expect(unitSetDoc.units).to.deep.equal([unitId])
      await update.call({ userId }, { _id: unitSetId, units: null })
      unitSetDoc = await UnitSetCollection.findOneAsync(unitSetId)
      expect(unitSetDoc.units).to.deep.equal([])
    })
  })

  describe('afterUpdate', () => {
    const insert = UnitSet.methods.insert.run
    const update = UnitSet.methods.update.run

    it('is recomputes progress if units changed', async () => {
      const unitId = await UnitCollection.insertAsync({
        status: 1,
        title: 'moo',
        unitSet: Random.id(),
        shortCode: Random.id(),
        pages: [{}, {}, {}]
      })
      const userId = Random.id()
      const unitSetId = await insert.call({ userId }, {
        status: 1,
        dimension: Random.id(),
        dimensionShort: 'x',
        field: Random.id(),
        shortCode: Random.id(),
        level: Random.id(),
        units: [unitId]
      })
      const unitId2 = await UnitCollection.insertAsync({
        status: 1,
        title: 'moo2',
        unitSet: Random.id(),
        shortCode: Random.id(),
        pages: [{}, {}, {}, {}]
      })
      await update.call({ userId }, { _id: unitSetId, units: [unitId2, unitId] })
      const unitSetDoc = await UnitSetCollection.findOneAsync(unitSetId)
      expect(unitSetDoc.progress).to.equal(7)
    })
    it('is recomputes progress if progress changed', async () => {
      const unitId = await UnitCollection.insertAsync({
        status: 1,
        title: 'moo',
        unitSet: Random.id(),
        shortCode: Random.id(),
        pages: [{}, {}, {}]
      })
      const userId = Random.id()
      const unitSetId = await insert.call({ userId }, {
        status: 1,
        dimension: Random.id(),
        dimensionShort: 'x',
        field: Random.id(),
        shortCode: Random.id(),
        level: Random.id(),
        units: [unitId]
      })
      await TestCylceCollection.insertAsync({
        status: 1,
        title: 'test cycle 1',
        unitSets: [unitSetId],
        shortCode: Random.id(),
        dimension: Random.id(),
        field: Random.id(),
        level: Random.id()
      })
      await update.call({ userId }, { _id: unitSetId, progress: 123 })
      const testCycleDoc = await TestCylceCollection.findOneAsync()
      expect(testCycleDoc.progress).to.equal(123)
    })
  })
})
