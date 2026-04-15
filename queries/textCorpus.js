import { getCollection } from '../imports/utils/collection'
import { Dimension } from '../imports/contexts/Dimension'
import { UnitSet } from '../imports/contexts/UnitSet'
import { Unit } from '../imports/contexts/Unit'
import { Field } from '../imports/contexts/Field'
import { TestCycle } from '../imports/contexts/TestCycle'
import { Level } from '../imports/contexts/Level'
import { toTransform } from './shared/toTransform'
import { asyncTimeout } from '../imports/utils/asyncTimeout'
import { output } from './shared/output'

export const createCorpusQuery = async ({ format = 'json', type = 'file', path, settings = {} }) => {
  const { interval = 100 } = settings

  const dimension = await fromFields({ ctx: Dimension, fields: ['title'] })
  await asyncTimeout(interval)

  const field = await fromFields({ ctx: Field, fields: ['title'] })
  await asyncTimeout(interval)

  const level = await fromFields({ ctx: Level, fields: ['title'] })
  await asyncTimeout(interval)

  const testCycle = await fromFields({ ctx: TestCycle, fields: ['selfAssessment'] })
  await asyncTimeout(interval)

  const copmetency = await fromFields({ ctx: TestCycle, fields: ['descriptionSimple'], mapping: v => `Ich kann ${v}` })
  await asyncTimeout(interval)

  const unitSet = await fromUnitSets({}, {}, settings)
  await asyncTimeout(interval)

  const units = await fromUnits({}, {}, settings)
  await asyncTimeout(interval)

  const allTexts = new Set([...dimension, ...field, ...level, ...testCycle, ...copmetency, ...unitSet, ...units])
  await asyncTimeout(interval)

  return output({
    data: Array.from(allTexts),
    format,
    type,
    path,
    title: `content_corpus_${Date.now()}`
  })
}

const fromUnitSets = async (query, options, settings) => {
  const UnitSetCollection = getCollection(UnitSet.name)
  const transform = toTransform(options)
  const unitSets = await UnitSetCollection.find(query, transform).fetchAsync()
  const texts = new Set()

  for (const unitSet of unitSets) {
    const { title, description, story } = unitSet

    if (title) texts.add(title)
    if (description) texts.add(description)
    fromContent({ source: story, destination: texts, settings })
  }

  return texts
}

const fromUnits = async (query, options, settings) => {
  const UnitCollection = getCollection(Unit.name)
  const transform = toTransform(options)
  const units = await UnitCollection.find(query, transform).fetchAsync()
  const texts = new Set()

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
  for (const entry of source) {
    const { type, subtype, value } = entry

    if (type === 'text' && value) {
      destination.add(value)
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
      const { text } = value
      const replaced = text.replace(/{{(.*?)}}/g, (match, p1) => {
        const parts = p1.split('$')
        if (parts.length === 3) {
          return parts[2]?.trim() || ''
        }
        return ''
      })
      destination.add(replaced)
    }
  }

  return destination
}

const fromFields = async ({ ctx, query = {}, options = {}, fields, mapping }) => {
  const collection = getCollection(ctx.name)
  const transform = toTransform(options)
  const docs = await collection.find(query, transform).fetchAsync()
  const texts = new Set()

  for (const doc of docs) {
    for (const fieldName of fields) {
      const value = doc[fieldName]

      if (value) {
        texts.add(mapping ? mapping(value) : value)
      }
    }
  }

  return texts
}
