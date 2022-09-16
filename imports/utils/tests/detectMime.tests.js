/* eslint-env mocha */
import { expect } from 'chai'
import { stub, restoreAll } from '../../../tests/helpers/testHelpers'
import { detectMime } from '../mime'
import FileType from 'file-type'

describe(detectMime.name, function () {
  it('defers detection ti FileType package', function (done) {
    const currentPath = '/somewhere/to/file.abc'
    stub(FileType, 'fromFile', path => {
      expect(path).to.equal(currentPath)
      done()
    })
    detectMime(currentPath)
    restoreAll()
  })
})
