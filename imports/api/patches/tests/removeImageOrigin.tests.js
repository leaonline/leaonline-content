/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { expect } from 'chai'
import sinon from 'sinon'
import { removeImageOrigin } from '../removeImageOrigin'
import { Unit } from '../../../contexts/Unit'
import { UnitSet } from '../../../contexts/UnitSet'
import { mockCollection, restoreCollection } from '../../../../tests/helpers/mockCollection'

describe(removeImageOrigin.name, function () {
  let UnitCollection
  let UnitSetCollection
  const origin = Meteor.settings.patches.removeImageOrigin.search

  before(function () {
    UnitCollection = mockCollection(Unit)
    UnitSetCollection = mockCollection(UnitSet)
  })

  beforeEach(async function () {
    await Promise.all([
      UnitCollection.removeAsync({}),
      UnitSetCollection.removeAsync({})
    ])
  })

  afterEach(function () {
    sinon.restore()
  })

  after(async function () {
    await Promise.all([
      UnitCollection.removeAsync({}),
      UnitSetCollection.removeAsync({})
    ])
    restoreCollection(Unit)
    restoreCollection(UnitSet)
  })

  it('removes the configured origin from unit and UnitSet image locations', async function () {
    await UnitCollection.insertAsync({
      _id: 'unit-images',
      shortCode: 'OL_IMAGES',
      stimuli: [
        null,
        'malformed',
        { subtype: 'image', value: `${origin}/stimulus.png` }
      ],
      instructions: [
        { subtype: 'image', value: 'https://other.example/instruction.png' }
      ],
      pages: [{
        instructions: [{ subtype: 'image', value: `${origin}/instruction.png` }],
        content: [{
          subtype: 'choice',
          value: {
            choices: [
              { image: `${origin}/choice.png` },
              { image: 'https://other.example/choice.png' }
            ]
          }
        }]
      }]
    })
    await UnitCollection.insertAsync({
      _id: 'unit-no-write',
      shortCode: 'OL_NO_WRITE',
      pages: [],
      stimuli: [null, { subtype: 'image', value: 'https://other.example/image.png' }]
    })
    await UnitCollection.insertAsync({
      _id: 'unit-not-selected',
      shortCode: 'CURRENT',
      pages: [],
      stimuli: [{ subtype: 'image', value: `${origin}/untouched.png` }]
    })
    await UnitSetCollection.insertAsync({
      _id: 'set-images',
      shortCode: 'OL_SET',
      story: [{ subtype: 'image', value: `${origin}/story.png` }]
    })
    await UnitSetCollection.insertAsync({
      _id: 'set-no-write',
      shortCode: 'OL_NO_WRITE',
      story: [null, { subtype: 'image', value: 'https://other.example/story.png' }]
    })
    const updateUnit = sinon.spy(UnitCollection, 'updateAsync')
    const updateUnitSet = sinon.spy(UnitSetCollection, 'updateAsync')

    await removeImageOrigin()

    expect(updateUnit.calledOnceWithExactly({ _id: 'unit-images' }, {
      $set: {
        'stimuli.2.value': '/stimulus.png',
        'pages.0.instructions.0.value': '/instruction.png',
        'pages.0.content.0.value.choices.0.image': '/choice.png'
      }
    })).to.equal(true)
    expect(updateUnitSet.calledOnceWithExactly({ _id: 'set-images' }, {
      $set: { 'story.0.value': '/story.png' }
    })).to.equal(true)

    const updated = await UnitCollection.findOneAsync('unit-images')
    expect(updated.stimuli[2].value).to.equal('/stimulus.png')
    expect(updated.instructions[0].value).to.equal('https://other.example/instruction.png')
    expect(updated.pages[0].content[0].value.choices[1].image).to.equal('https://other.example/choice.png')
    expect((await UnitCollection.findOneAsync('unit-not-selected')).stimuli[0].value).to.equal(`${origin}/untouched.png`)
  })
})
