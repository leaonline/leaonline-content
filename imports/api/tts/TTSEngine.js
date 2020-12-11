import { Random } from 'meteor/random'
import { TTSFiles } from './TTSFiles'
import { Synthesizer } from './synthesizer'
import { getCollection } from '../../utils/collection'
import { detectMime } from '../../utils/mime'
import { simpleHash } from '../../utils/hash'
import fs from 'fs'

export const TTSBackend = {}

let TTSFilesCollection

const writeFile = (path, { fileName, fileId, type }) => {
  return new Promise(resolve => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path, function (error, data) {
      if (error) {
        console.error(error)
        return resolve(null)
      }

      TTSFilesCollection.write(data, {
        fileName,
        fileId,
        type
      }, (writeError, fileRef) => {
        if (writeError) {
          console.error(writeError)
          resolve(null)
        }
        else {
          resolve(fileRef._id)
        }
      })
    })
  })
}

/**
 * Gets a filesCollection document with reference to a GridFS-located audio file, generated for
 * a specific text. If the file has already been generated (by compared hash) it is returned immediately.
 *
 * Otherwise the following logic will execute:
 *
 * 1. run a server script that uses some of the OS installed software to synthesize sound
 * 2. check the mimetype of the generated audio file
 * 3. move the audio file to the files collection
 *
 * @param {string} text the text that should be synthesized
 * @returns {object|undefined} the respective filesCollection doc for this synth
 */

TTSBackend.get = ({ text }) => {
  const cleanedText = text.trim().replace(/\s+/g, ' ')
  const hash = simpleHash(cleanedText).toString()

  if (!TTSFilesCollection) {
    TTSFilesCollection = getCollection(TTSFiles).filesCollection
  }

  const existingFile = TTSFilesCollection.collection.findOne({ name: hash })
  if (existingFile) {
    return existingFile
  }

  const synthesizedFilepath = Promise.await(synthesize(cleanedText, hash))
  const mime = Promise.await(detectMime(synthesizedFilepath))
  const fileId = Random.id()
  const writtenId = Promise.await(writeFile(synthesizedFilepath, {
    fileName: hash,
    type: mime,
    fileId: fileId
  }))

  // TODO MOVE FILE TO GRIDFS AND REMOVE FILE
  return TTSFilesCollection.collection.findOne(writtenId)
}

/**
 * Executes the server's local TTS engine and resolves the path to the generated file.
 *
 * @param {string} text the text to be synthesized
 * @param {string} hash use for caching
 * @returns {Promise<string>} Promise, resolving to the path to the synthesized file
 */
function synthesize (text, hash) {
  return new Promise((resolve, reject) => {
    const cb = (err, res) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(res)
      }
    }
    Synthesizer.run({ text, hash }, cb)
  })
}
