import { Meteor } from 'meteor/meteor'
import { Unit } from '../../contexts/Unit'
import { toArray } from '../../utils/toArray'
import { UnitSet } from '../../contexts/UnitSet'

const { enabled, search, regex } = Meteor.settings.patches.removeImageOrigin

export const removeImageOrigin = async () => {
  if (!enabled) return
  const debug = (...args) => console.debug('[removeImageOrigin]:', ...args)

  const query = { shortCode: { $regex: new RegExp(regex) } }
  const units = await Unit.collection().find(query).fetchAsync()
  debug('query found units', units.length)

  for (const unitDoc of units) {
    const updateDoc = { found: false, $set: {} }

    appendUpdate(updateDoc, 'stimuli', toArray(unitDoc.stimuli))
    appendUpdate(updateDoc, 'instructions', toArray(unitDoc.instructions))

    const pages = toArray(unitDoc.pages)
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      appendUpdate(updateDoc, `pages.${i}.instructions`, toArray(page.instructions))
      appendUpdate(updateDoc, `pages.${i}.content`, toArray(page.content))
    }

    if (updateDoc.found) {
      delete updateDoc.found
      debug('update', updateDoc.$set)
      await Unit.collection().updateAsync({ _id: unitDoc._id }, updateDoc)
    }
  }

  const unitSets = await UnitSet.collection().find(query).fetchAsync()
  debug('query found unit sets', unitSets.length)
  for (const unitSetDoc of unitSets) {
    const updateDoc = { found: false, $set: {} }
    appendUpdate(updateDoc, 'story', toArray(unitSetDoc.story))
    if (updateDoc.found) {
      delete updateDoc.found
      debug('update', updateDoc.$set)
      await UnitSet.collection().updateAsync({ _id: unitSetDoc._id }, updateDoc)
    }
  }
}

const appendUpdate = (updateDoc, name, array) => {
  const found = checkForImages(name, array)
  if (found.length) {
    updateDoc.found = true

    for (const update of found) {
      updateDoc.$set[update[0]] = update[1]
    }
  }
}

const checkForImages = (name, array) => {
  const updates = []
  for (let i = 0; i < array.length; i++) {
    const entry = array[i]
    if (!entry || typeof entry !== 'object') {
      continue
    }
    if (entry.subtype === 'image' && entry.value && entry.value.startsWith(search)) {
      const value = entry.value.replace(search, '')
      const key = `${name}.${i}.value`
      updates.push([key, value])
    }
    if (entry.subtype === 'choice' && entry.value?.choices?.length) {
      for (let j = 0; j < entry.value.choices.length; j++) {
        const choice = entry.value.choices[j]
        if (choice.image && choice.image.startsWith(search)) {
          const value = choice.image.replace(search, '')
          const key = `${name}.${i}.value.choices.${j}.image`
          updates.push([key, value])
        }
      }
    }
  }
  return updates
}
