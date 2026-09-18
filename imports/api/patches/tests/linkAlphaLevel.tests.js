/* eslint-env mocha */
import { expect } from 'chai'
import sinon from 'sinon'
import { linkAlphaLevel } from '../linkAlphaLevel'
import { AlphaLevel } from '../../../contexts/AlphaLevel'
import { Competency } from '../../../contexts/Competency'
import { mockCollection, restoreCollection } from '../../../../tests/helpers/mockCollection'

describe(linkAlphaLevel.name, function () {
  let AlphaLevelCollection
  let CompetencyCollection

  before(function () {
    AlphaLevelCollection = mockCollection(AlphaLevel)
    CompetencyCollection = mockCollection(Competency)
  })

  beforeEach(async function () {
    await Promise.all([
      AlphaLevelCollection.removeAsync({}),
      CompetencyCollection.removeAsync({})
    ])
  })

  afterEach(function () {
    sinon.restore()
  })

  after(async function () {
    await Promise.all([
      AlphaLevelCollection.removeAsync({}),
      CompetencyCollection.removeAsync({})
    ])
    restoreCollection(AlphaLevel)
    restoreCollection(Competency)
  })

  it('links a numeric level to the matching AlphaLevel with the exact update', async function () {
    await AlphaLevelCollection.insertAsync({ _id: 'alpha-match', dimension: 'dimension-a', level: 2 })
    await AlphaLevelCollection.insertAsync({ _id: 'alpha-other', dimension: 'dimension-b', level: 2 })
    await CompetencyCollection.insertAsync({ _id: 'competency', dimension: 'dimension-a', level: 2 })
    const update = sinon.spy(CompetencyCollection, 'updateAsync')

    await linkAlphaLevel()

    expect(update.calledOnceWithExactly('competency', {
      $set: { level: 'alpha-match' }
    })).to.equal(true)
    expect((await CompetencyCollection.findOneAsync('competency')).level).to.equal('alpha-match')
  })

  it('does not rewrite already-linked or non-numeric levels', async function () {
    await AlphaLevelCollection.insertAsync({ _id: 'alpha', dimension: 'dimension-a', level: 2 })
    await CompetencyCollection.insertAsync({ _id: 'linked', dimension: 'dimension-a', level: 'alpha' })
    await CompetencyCollection.insertAsync({ _id: 'missing-level', dimension: 'dimension-a' })
    const update = sinon.spy(CompetencyCollection, 'updateAsync')

    await linkAlphaLevel()

    expect(update.called).to.equal(false)
  })

  it('does not write when no AlphaLevel matches', async function () {
    await AlphaLevelCollection.insertAsync({ _id: 'alpha', dimension: 'dimension-b', level: 2 })
    await CompetencyCollection.insertAsync({ _id: 'competency', dimension: 'dimension-a', level: 2 })
    const update = sinon.spy(CompetencyCollection, 'updateAsync')

    await linkAlphaLevel()

    expect(update.called).to.equal(false)
    expect((await CompetencyCollection.findOneAsync('competency')).level).to.equal(2)
  })
})
