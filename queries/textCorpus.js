import { SpeechCorpus } from 'meteor/leaonline:speech-corpus'
import { Competency } from '../imports/contexts/Competency'
import { Dimension } from '../imports/contexts/Dimension'
import { Field } from '../imports/contexts/Field'
import { Level } from '../imports/contexts/Level'
import { TestCycle } from '../imports/contexts/TestCycle'
import { Unit } from '../imports/contexts/Unit'
import { UnitSet } from '../imports/contexts/UnitSet'
import { getCollection } from '../imports/utils/collection'
import { asyncTimeout } from '../imports/utils/asyncTimeout'
import { toTransform } from './shared/toTransform'
import uiLang from '../resources/i18n/i18n_de.json'

const isLegacyQuery = ({ isLegacy }) => {
  // include only otulea
  if (isLegacy === true) {
    return { isLegacy: true }
  }
  // include all
  if (typeof isLegacy === 'undefined' || isLegacy === null) {
    return {}
  }
  // include only non-otulea
  return { isLegacy: { $ne: true } }
}

export const createCorpusQuery = async ({ format = 'json', type = 'file', path, isLegacy = false, settings = {} }) => {
  const logOut = []
  const log = (...args) => logOut.push(args.join(' '))
  const { interval = 100 } = settings
  const query = isLegacyQuery({ isLegacy })

  const dimension = await fromFields({ ctx: Dimension, fields: ['title'], log })
  await asyncTimeout(interval)

  const field = await fromFields({ ctx: Field, fields: ['title'], query, log })
  await asyncTimeout(interval)

  const level = await fromFields({ ctx: Level, fields: ['title'], log })
  await asyncTimeout(interval)

  const testCycle = await fromFields({ ctx: TestCycle, fields: ['selfAssessment'], query, log })
  await asyncTimeout(interval)

  const competency = await fromFields({ ctx: Competency, fields: ['descriptionSimple'], mapping: v => `Ich kann ${v}`, log })
  await asyncTimeout(interval)

  const unitSet = await fromUnitSets(query, {}, { log, ...settings })
  await asyncTimeout(interval)

  const unitQuery = {}
  if (isLegacy) {
    unitQuery.shortCode = { $regex: '^OL_' }
  }
  const units = await fromUnits(unitQuery, {}, { log, ...settings })
  await asyncTimeout(interval)

  const lang = SpeechCorpus.extract.fromI18n(uiLang)
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  alphabet.forEach(letter => lang.add(letter))

  const allTexts = new Set([...dimension, ...field, ...level, ...testCycle, ...competency, ...unitSet, ...units, ...lang])
  await asyncTimeout(interval)

  SpeechCorpus.clean.register(text => {
    return text.trim()
      // multiple newlines to single space
      .replaceAll(/[\r\n]+/ig, ' ')
      // remove markdown bold
      .replaceAll(/\*\*.+\*\*/ig, '')
      // remove three dots
      .replaceAll(/\.{3}/ig, '')
      // multiple white space to single white space
      .replaceAll(/\s+/g, ' ')
  })

  const cleaned = SpeechCorpus.clean.run(allTexts)
  const data = SpeechCorpus.transformers.hashTuple({ data: cleaned })
  const title = `content_corpus_${Date.now()}`

  await SpeechCorpus.build({
    data: logOut.join('\n'),
    format: 'text',
    type: 'file',
    path,
    title,
    ext: 'log'
  })

  return SpeechCorpus.build({
    data,
    format,
    type,
    path,
    title
  })
}

const fromUnitSets = async (query, options, settings) => {
  const { log } = settings
  const UnitSetCollection = getCollection(UnitSet.name)
  const transform = toTransform(options)
  const unitSets = await UnitSetCollection.find(query, transform).fetchAsync()
  const texts = new Set()
  log(`[${UnitSet.name}]: Fetched documents: ${unitSets.length}, query=${JSON.stringify(query)}`)
  for (const unitSet of unitSets) {
    const { title, description, story } = unitSet

    if (title) texts.add(title)
    if (description) texts.add(description)
    fromContent({ source: story, destination: texts, settings })
  }

  return texts
}

const fromUnits = async (query, options, settings) => {
  const { log } = settings
  const UnitCollection = getCollection(Unit.name)
  const transform = toTransform(options)

  const units = await UnitCollection.find(query, transform).fetchAsync()
  const texts = new Set()
  log(`[${Unit.name}]: Fetched documents: ${units.length}, query=${JSON.stringify(query)}`)

  for (const unit of units) {
    const { title, instructions, stimuli, pages } = unit
    if (title) texts.add(title)
    fromContent({ source: instructions, destination: texts, settings })
    fromContent({ source: stimuli, destination: texts, settings })
    for (const page of pages) {
      const { content } = page
      fromContent({ source: content, destination: texts, settings })
    }
  }

  return texts
}

const fromContent = ({ source = [], destination = new Set() }) => {
  if (!source) return destination
  if (!Array.isArray(source)) {
    throw new Error(`source should be an array, got ${JSON.stringify(source)}`)
  }

  for (const entry of source) {
    const { type, subtype, value, useTTS } = entry

    if (type === 'text' && typeof value === 'string' && value.length > 0) {
      if (subtype === 'text') {
        destination.add(value)
      }

      // while plain text can directly be added, for
      // markdown tts we need to parse the markdown using the exact
      // parser the client will use in order to validly tokenize
      // the md source.
      // the tokens will then be added to the tts corpus
      if (subtype === 'markdown' && useTTS === true) {
        const token = MarkdownRenderer.tokenize(entry)
      }
    }

    if (type === 'item' && subtype === 'choice') {
      const { choices } = value
      for (const choice of choices) {
        if (choice.text) {
          destination.add(choice.text)
        }
      }
    }

    if (type === 'item' && subtype === 'cloze') {
      value.text.replace(/{{(.*?)}}/g, (match, p1) => {
        const [_type, _val, _tts] = p1.split('$')

        if (typeof _tts === 'string' && _tts.length > 0) {
          const clozeTTS = _tts?.trim() || ''
          if (clozeTTS) destination.add(clozeTTS)
        }
      })
    }
  }

  return destination
}

const fromFields = async ({ ctx, query = {}, options = {}, fields, mapping, log }) => {
  const collection = getCollection(ctx.name)
  const transform = toTransform(options)
  const docs = await collection.find(query, transform).fetchAsync()
  log(`[${ctx.name}]: Fetched documents: ${docs.length}, query=${JSON.stringify(query)}, fields=${JSON.stringify(fields)}`)
  const texts = new Set()

  for (const doc of docs) {
    log(`get fields from ${doc.title ?? doc.shortCode ?? doc._id}`)
    for (const fieldName of fields) {
      const value = doc[fieldName]

      if (value) {
        texts.add(mapping ? mapping(value) : value)
      }
    }
  }

  return texts
}
