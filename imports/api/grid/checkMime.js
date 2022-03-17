import { check } from 'meteor/check'
import { detectMime } from '../../utils/mime'
import mimeTypes from 'mime-types'
import { createLog } from '../../utils/log'
import { notifyAboutError } from '../errors/notifyAboutError'

const debug = createLog('checkMime')

export const getCheckMime = (i18nFactory = x => x, filesContext) => {
  check(i18nFactory, Function)

  return async uploadedFile => {
    const { path, extension } = uploadedFile
    debug('check mime for', uploadedFile.name, uploadedFile.mime)

    const detected = await detectMime(path)

    if (!detected) {
      const error = new Error(i18nFactory('files.mimeError', {
        expected: uploadedFile.ext,
        got: 'undefined',
        ending: 'undefined'
      }))
      notifyAboutError({ error })
      throw error
    }

    debug('detected', detected, 'one path', path)
    const detectedExt = detected.ext
    const detectedMime = detected.mime
    const lookup = mimeTypes.lookup(path) || ''

    if (typeof filesContext.validateMime === 'function') {
      return filesContext.validateMime({
        extension: detectedExt,
        mime: detectedMime,
        file: uploadedFile
      })
    }

    // in this first approach we check if the detected mime matches the
    // expected, which occurs in many non-container-wrapped file formats
    if (lookup === detectedMime) {
      return true
    }

    // and if that's not the case it might still be supported
    if (filesContext.extensions === null || filesContext.extensions.includes(detectedExt)) {
      return true
    }

    const resolvedExtension = mimeTypes.extension(detectedMime)

    // for containers, we need to reverse-check if the detected mime is
    // matching the ending we expect the container format to have
    if (resolvedExtension === extension) {
      return true
    }

    const error = new Error(i18nFactory('files.mimeError', {
      expected: lookup,
      got: detectedMime,
      ending: resolvedExtension
    }))
    notifyAboutError({ error })
    throw error
  }
}
