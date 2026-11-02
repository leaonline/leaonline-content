/* eslint-env mocha */
import { expect } from 'chai'
import sinon from 'sinon'
import { updateClozeScoringSchema } from '../upateClozeScoringSchema'
import { Unit } from '../../../contexts/Unit'
import { mockCollection, restoreCollection } from '../../../../tests/helpers/mockCollection'

describe(updateClozeScoringSchema.name, function () {
  let UnitCollection

  before(function () {
    UnitCollection = mockCollection(Unit)
  })

  beforeEach(function () {
    return UnitCollection.removeAsync({})
  })

  afterEach(function () {
    sinon.restore()
  })

  after(async function () {
    await UnitCollection.removeAsync({})
    restoreCollection(Unit)
  })

  it('converts nested cloze competency strings to arrays and awaits every write', async function () {
    await UnitCollection.insertAsync({
      _id: 'unit',
      pages: [
        {
          content: [
            {
              subtype: 'cloze',
              value: {
                scoring: [
                  { competency: 'competency-a' },
                  { competency: ['already-migrated'] },
                  { competency: 'competency-b' }
                ]
              }
            }
          ]
        },
        {
          content: [
            {
              subtype: 'cloze',
              value: { scoring: [{ competency: 'competency-c' }] }
            }
          ]
        }
      ]
    })
    const update = sinon.spy(UnitCollection, 'updateAsync')

    await updateClozeScoringSchema()

    expect(update.callCount).to.equal(2)
    expect(update.firstCall.calledWithExactly('unit', {
      $set: {
        'pages.0.content.0.value.scoring.0.competency': ['competency-a'],
        'pages.0.content.0.value.scoring.2.competency': ['competency-b']
      }
    })).to.equal(true)
    expect(update.secondCall.calledWithExactly('unit', {
      $set: {
        'pages.1.content.0.value.scoring.0.competency': ['competency-c']
      }
    })).to.equal(true)

    const unit = await UnitCollection.findOneAsync('unit')
    expect(unit.pages[0].content[0].value.scoring.map(entry => entry.competency)).to.deep.equal([
      ['competency-a'],
      ['already-migrated'],
      ['competency-b']
    ])
    expect(unit.pages[1].content[0].value.scoring[0].competency).to.deep.equal(['competency-c'])
  })

  it('does not write already-migrated, missing-scoring, or non-cloze entries', async function () {
    await UnitCollection.insertAsync({
      _id: 'no-op-unit',
      pages: [{
        content: [
          { subtype: 'cloze', value: { scoring: [{ competency: ['done'] }] } },
          { subtype: 'cloze', value: {} },
          { subtype: 'choice', value: { scoring: [{ competency: 'leave-string' }] } }
        ]
      }]
    })
    await UnitCollection.insertAsync({ _id: 'no-pages' })
    const update = sinon.spy(UnitCollection, 'updateAsync')

    await updateClozeScoringSchema()

    expect(update.called).to.equal(false)
  })
})
