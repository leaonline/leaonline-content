/* eslint-env mocha */
import { expect } from 'chai'
import sinon from 'sinon'
import { SpeechCorpus } from 'meteor/leaonline:speech-corpus'
import { Competency } from '../../imports/contexts/Competency'
import { Dimension } from '../../imports/contexts/Dimension'
import { Field } from '../../imports/contexts/Field'
import { Level } from '../../imports/contexts/Level'
import { TestCycle } from '../../imports/contexts/TestCycle'
import { Unit } from '../../imports/contexts/Unit'
import { UnitSet } from '../../imports/contexts/UnitSet'
import { createCorpusQuery } from '../textCorpus'

const contexts = [
  Dimension,
  Field,
  Level,
  TestCycle,
  Competency,
  UnitSet,
  Unit
]

const insertRaw = (context, documents) => {
  if (!documents.length) return
  return context.collection().rawCollection().insertMany(documents)
}

const corpusTexts = data => data.map(entry => {
  const separator = entry.indexOf('%%%')
  return entry.slice(separator + 3)
})

const stubBuild = () => {
  const calls = []
  const result = { result: 'corpus-built' }
  sinon.stub(SpeechCorpus, 'build').callsFake(async options => {
    calls.push(options)
    return calls.length % 2 === 0 ? result : undefined
  })
  return { calls, result }
}

const cleanCollections = () => Promise.all(contexts.map(context => {
  return context.collection().removeAsync({})
}))

describe(createCorpusQuery.name, function () {
  beforeEach(cleanCollections)

  afterEach(async function () {
    sinon.restore()
    await cleanCollections()
  })

  it('builds cleaned, deduplicated corpus data and a diagnostic log', async function () {
    await insertRaw(Dimension, [{ _id: 'dimension', title: 'Dimension text' }])
    await insertRaw(Field, [{ _id: 'field', title: 'Field text' }])
    await insertRaw(Level, [{ _id: 'level', title: 'Level text' }])
    await insertRaw(TestCycle, [{ _id: 'cycle', selfAssessment: 'Assessment text' }])
    await insertRaw(Competency, [{ _id: 'competency', descriptionSimple: 'read words' }])
    await insertRaw(UnitSet, [{
      _id: 'unit-set',
      title: 'UnitSet title',
      description: 'UnitSet description',
      story: [
        { type: 'text', subtype: 'text', value: '  Repeated\n\ntext...  ' },
        { type: 'item', subtype: 'choice', value: { choices: [{ text: 'Choice text' }, { text: '' }, {}] } },
        { type: 'item', subtype: 'cloze', value: { text: 'A {{text$value$ Spoken cloze }} and {{text$value$ }}' } }
      ]
    }])
    await insertRaw(Unit, [{
      _id: 'unit',
      shortCode: 'UNIT_1',
      title: 'Unit title',
      instructions: [{ type: 'text', subtype: 'text', value: '  Repeated\n\ntext...  ' }],
      stimuli: null,
      pages: [
        {},
        { content: [{ type: 'text', subtype: 'other', value: 'Ignored text' }] },
        { content: [{ type: 'text', subtype: 'text', value: '' }] }
      ]
    }])
    const { calls, result } = stubBuild()
    sinon.stub(Date, 'now').returns(12345)

    const actual = await createCorpusQuery({
      format: 'text',
      type: 'null',
      path: '/virtual/corpus',
      settings: { interval: 0 }
    })

    expect(actual).to.equal(result)
    expect(calls).to.have.length(2)
    expect(calls[0]).to.include({
      format: 'text',
      type: 'file',
      path: '/virtual/corpus',
      title: 'content_corpus_12345',
      ext: 'log'
    })
    expect(calls[0].data).to.include('[dimension]: Fetched documents: 1, query={}, fields=["title"]')
    expect(calls[0].data).to.include('[unit]: Fetched documents: 1, query={}')
    expect(calls[1]).to.include({
      format: 'text',
      type: 'null',
      path: '/virtual/corpus',
      title: 'content_corpus_12345'
    })

    const texts = corpusTexts(calls[1].data)
    expect(texts).to.include.members([
      'Dimension text',
      'Field text',
      'Level text',
      'Assessment text',
      'Ich kann read words',
      'UnitSet title',
      'UnitSet description',
      'Unit title',
      'Repeated text',
      'Choice text',
      'Spoken cloze'
    ])
    expect(texts).not.to.include('Ignored text')
    expect(texts.filter(text => text === 'Repeated text')).to.have.length(1)
  })

  it('applies the true, false, and null legacy filters explicitly', async function () {
    await insertRaw(Dimension, [{ _id: 'dimension', title: 'Always dimension' }])
    await insertRaw(Level, [{ _id: 'level', title: 'Always level' }])
    await insertRaw(Competency, [{ _id: 'competency', descriptionSimple: 'always competency' }])
    await insertRaw(Field, [
      { _id: 'field-legacy', title: 'Legacy field', isLegacy: true },
      { _id: 'field-current', title: 'Current field', isLegacy: false },
      { _id: 'field-unset', title: 'Unset field' }
    ])
    await insertRaw(TestCycle, [
      { _id: 'cycle-legacy', selfAssessment: 'Legacy cycle', isLegacy: true },
      { _id: 'cycle-current', selfAssessment: 'Current cycle', isLegacy: false },
      { _id: 'cycle-unset', selfAssessment: 'Unset cycle' }
    ])
    await insertRaw(UnitSet, [
      { _id: 'set-legacy', title: 'Legacy set', isLegacy: true, story: [] },
      { _id: 'set-current', title: 'Current set', isLegacy: false, story: [] },
      { _id: 'set-unset', title: 'Unset set', story: [] }
    ])
    await insertRaw(Unit, [
      { _id: 'unit-legacy', title: 'Legacy unit', shortCode: 'OL_ONE', pages: [] },
      { _id: 'unit-current', title: 'Current unit', shortCode: 'UNIT_ONE', pages: [] }
    ])
    const { calls } = stubBuild()

    await createCorpusQuery({ isLegacy: true, settings: { interval: 0 } })
    await createCorpusQuery({ isLegacy: false, settings: { interval: 0 } })
    await createCorpusQuery({ isLegacy: null, settings: { interval: 0 } })

    const legacyTexts = corpusTexts(calls[1].data)
    expect(legacyTexts).to.include.members(['Legacy field', 'Legacy cycle', 'Legacy set', 'Legacy unit'])
    expect(legacyTexts).not.to.include.members(['Current field', 'Unset field', 'Current unit'])
    expect(calls[0].data).to.include('query={"isLegacy":true}')
    expect(calls[0].data).to.include('query={"shortCode":{"$regex":"^OL_"}}')

    const currentTexts = corpusTexts(calls[3].data)
    expect(currentTexts).to.include.members(['Current field', 'Unset field', 'Current cycle', 'Unset cycle', 'Current set', 'Unset set', 'Legacy unit', 'Current unit'])
    expect(currentTexts).not.to.include.members(['Legacy field', 'Legacy cycle', 'Legacy set'])
    expect(calls[2].data).to.include('query={"isLegacy":{"$ne":true}}')

    const allTexts = corpusTexts(calls[5].data)
    expect(allTexts).to.include.members([
      'Legacy field',
      'Current field',
      'Unset field',
      'Legacy cycle',
      'Current cycle',
      'Unset cycle',
      'Legacy set',
      'Current set',
      'Unset set',
      'Legacy unit',
      'Current unit'
    ])
    expect(calls[4].data).to.include('query={}')
  })

  it('rejects non-array content without attempting a build', async function () {
    await insertRaw(UnitSet, [{
      _id: 'invalid-set',
      title: 'Invalid set',
      story: 'not-an-array'
    }])
    await insertRaw(Unit, [])
    const { calls } = stubBuild()

    let error
    try {
      await createCorpusQuery({ settings: { interval: 0 } })
    }
    catch (e) {
      error = e
    }
    expect(error?.message).to.equal('invalid-set: source should be an array, got "not-an-array"')
    expect(calls).to.deep.equal([])
  })

  it('tolerates documents with missing optional fields', async function () {
    await insertRaw(Dimension, [{ _id: 'dimension' }])
    await insertRaw(UnitSet, [{
      _id: 'untitled-set',
      description: 'Untitled set description',
      story: [{ type: 'item', subtype: 'cloze', value: { text: 'No {{text$value}} speech' } }]
    }])
    await insertRaw(Unit, [{ _id: 'untitled-unit', pages: [] }])
    const { calls } = stubBuild()

    await createCorpusQuery({ settings: { interval: 0 } })

    expect(calls).to.have.length(2)
    expect(corpusTexts(calls[1].data)).to.include('Untitled set description')
  })

  it('uses the document id in errors when no shortCode exists', async function () {
    await insertRaw(UnitSet, [])
    await insertRaw(Unit, [{ _id: 'invalid-unit', instructions: 'not-an-array', pages: [] }])
    const { calls } = stubBuild()

    let error
    try {
      await createCorpusQuery({ settings: { interval: 0 } })
    }
    catch (e) {
      error = e
    }
    expect(error?.message).to.equal('invalid-unit: source should be an array, got "not-an-array"')
    expect(calls).to.deep.equal([])
  })

  it('adds tokenized TTS markdown to the corpus', async function () {
    await insertRaw(UnitSet, [])
    await insertRaw(Unit, [{
      _id: 'markdown-unit',
      title: 'Markdown unit',
      shortCode: 'UNIT_MD',
      instructions: [{
        type: 'text',
        subtype: 'markdown',
        useTTS: true,
        value: 'Hello **world** foo'
      }],
      pages: []
    }])
    const { calls } = stubBuild()

    await createCorpusQuery({ settings: { interval: 0 } })

    expect(calls).to.have.length(2)
    const texts = corpusTexts(calls[1].data)
    expect(texts).to.include('Hello world foo')
    expect(texts).not.to.include.members(['Hello', 'world', 'foo'])
  })
})
