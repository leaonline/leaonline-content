/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
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
import { restoreAll } from '../../../../tests/helpers/testHelpers'

describe('calculate progress', function () {
  let unitId
  let unitSetId
  let testCycleId
  let UnitCollection
  let UnitSetCollection
  let TestCycleCollection

  const createUnitDoc = ({ pages = [{}] } = {}) => UnitCollection.insert({ pages })
  const createUnitSetDoc = ({ units = [createUnitDoc()], progress } = {}) => UnitSetCollection.insert({ units, progress })
  const createTestCycleDoc = ({ unitSets = [createUnitSetDoc()] } = {}) => TestCycleCollection.insert({ unitSets })

  beforeEach(function () {
    mockCollection(Unit)
    mockCollection(UnitSet)
    mockCollection(TestCycle)
    UnitCollection = Unit.collection()
    UnitSetCollection = UnitSet.collection()
    TestCycleCollection = TestCycle.collection()

    unitId = createUnitDoc()
    unitSetId = createUnitSetDoc()
    testCycleId = createTestCycleDoc()
  })

  afterEach(function () {
    restoreCollection(Unit)
    restoreCollection(UnitSet)
    restoreCollection(TestCycle)
    restoreAll()
  })

  describe(unitProgressChanged.name, function () {
    it('updates all UnitSets that link to this unit', function () {
      const doc1 = UnitSetCollection.insert({ units: [createUnitDoc(), createUnitDoc()] })
      const doc2 = UnitSetCollection.insert({ units: [createUnitDoc(), unitId] })
      const doc3 = UnitSetCollection.insert({ units: [] })
      const doc4 = UnitSetCollection.insert({})
      unitProgressChanged({ unitId })

      expect(UnitSetCollection.findOne(doc1).progress).to.equal(undefined)
      expect(UnitSetCollection.findOne(doc3).progress).to.equal(undefined)
      expect(UnitSetCollection.findOne(doc4).progress).to.equal(undefined)
      expect(UnitSetCollection.findOne(doc2).progress).to.equal(2)
    })
  })

  describe(unitSetOrderChanged.name, function () {
    it('updates the single unitSet if it\'s units order has changed', function ( ) {
      const units = [createUnitDoc(), createUnitDoc(), createUnitDoc()]
      const unitSetId = UnitSetCollection.insert({ units })
      expect(UnitSetCollection.findOne(unitSetId).progress).to.equal(undefined)
      unitSetOrderChanged({ unitSetId })
      expect(UnitSetCollection.findOne(unitSetId).progress).to.equal(3)
    })
  })

  describe(unitSetProgressChanged.name, function () {
    it('updates all testCycles that link to this unitSet', function () {
      const docId = createUnitSetDoc({ units: [createUnitDoc(), createUnitDoc()], progress: 2 })
      const tcDoc1 = createTestCycleDoc({ unitSets: [createUnitSetDoc({ progress: 1 }), docId] })
      const tcDoc2 = createTestCycleDoc({ unitSets: [docId] })
      expect(TestCycleCollection.findOne(testCycleId).progress).to.equal(undefined)
      expect(TestCycleCollection.findOne(tcDoc1).progress).to.equal(undefined)
      expect(TestCycleCollection.findOne(tcDoc2).progress).to.equal(undefined)


      unitSetProgressChanged({ unitSetId: docId })

      expect(TestCycleCollection.findOne(testCycleId).progress).to.equal(undefined)
      expect(TestCycleCollection.findOne(tcDoc1).progress).to.equal(3)
      expect(TestCycleCollection.findOne(tcDoc2).progress).to.equal(2)
    })
  })

  describe(testCycleOrderChanged.name, function () {
    it('updates a single testCycle doc', function () {
      const tcDoc = createTestCycleDoc({ unitSets: [createUnitSetDoc({ progress: 2 }), createUnitSetDoc({ progress: 5 })] })
      expect(TestCycleCollection.findOne(tcDoc).progress).to.equal(undefined)
      testCycleOrderChanged({ testCycleId: tcDoc })
      expect(TestCycleCollection.findOne(tcDoc).progress).to.equal(7)
    })
  })
})
