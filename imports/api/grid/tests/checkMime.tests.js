/* eslint-env mocha */
import { Email } from 'meteor/email'
import { expect } from 'chai'
import FileType from 'file-type'
import mimeTypes from 'mime-types'
import { getCheckMime } from '../checkMime'
import { stub, restoreAll } from '../../../../tests/helpers/testHelpers'
import { expectThrow } from '../../../../tests/helpers/expectThrow'

describe(getCheckMime.name, function () {
  afterEach(() => {
    restoreAll()
  })
  it('throws on undetected mime', async () => {
    const checkMime = getCheckMime()
    stub(FileType, 'fromFile', () => undefined)
    stub(Email, 'sendAsync', () => true)

    await expectThrow({
      fn: () => checkMime({}),
      message: 'files.mimeError'
    })
  })
  it('throws if the mime type is not found by lookup', async () => {
    const checkMime = getCheckMime()
    stub(FileType, 'fromFile', () => ({}))
    stub(mimeTypes, 'lookup', () => undefined)
    stub(mimeTypes, 'extension', () => undefined)
    stub(Email, 'sendAsync', () => true)

    await expectThrow({
      fn: () => checkMime({}),
      message: 'files.mimeError'
    })
  })
  it('allows if the lookup matches the detected mime', async () => {
    const checkMime = getCheckMime()
    stub(FileType, 'fromFile', () => ({ mime: 'foo' }))
    stub(mimeTypes, 'lookup', () => 'foo')
    stub(mimeTypes, 'extension', () => undefined)
    stub(Email, 'sendAsync', () => true)

    const isValid = await checkMime({})
    expect(isValid).to.equal(true)
  })
  it('allows if extensions are globally ignored', async () => {
    const checkMime = getCheckMime({
      filesContext: { extensions: null }
    })
    stub(FileType, 'fromFile', () => ({}))
    stub(mimeTypes, 'lookup', () => undefined)
    stub(mimeTypes, 'extension', () => undefined)
    stub(Email, 'sendAsync', () => true)

    const isValid = await checkMime({})
    expect(isValid).to.equal(true)
  })
  it('allows if the lookup matches global allowed extension', async () => {
    const checkMime = getCheckMime({
      filesContext: { extensions: ['foo', 'bar', 'moo'] }
    })
    stub(FileType, 'fromFile', () => ({ ext: 'moo' }))
    stub(mimeTypes, 'lookup', () => undefined)
    stub(mimeTypes, 'extension', () => undefined)
    stub(Email, 'sendAsync', () => true)

    const isValid = await checkMime({})
    expect(isValid).to.equal(true)
  })
  it('allows if the resolved extension matches the proposed extension', async () => {
    const checkMime = getCheckMime()
    stub(FileType, 'fromFile', () => ({ ext: 'moo' }))
    stub(mimeTypes, 'lookup', () => undefined)
    stub(mimeTypes, 'extension', () => 'moo')
    stub(Email, 'sendAsync', () => true)

    const isValid = await checkMime({ extension: 'moo' })
    expect(isValid).to.equal(true)
  })
})
