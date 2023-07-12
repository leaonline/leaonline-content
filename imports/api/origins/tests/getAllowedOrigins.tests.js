/* eslint-env mocha */
import { expect } from 'chai'
import { getAllowedOrigins } from '../getAllowedOrigins'

const expectedOrigins = [
  'http://localhost:3000',
  'http://localhost:5050',
  'http://localhost:5555',
  'http://localhost:8080'
]

describe(getAllowedOrigins.name, function () {
  it('returns urls of all allowed origins', function () {
    const { urls } = getAllowedOrigins()
    expect(urls).to.deep.equal(expectedOrigins)
  })
  it('returns a regex to validate allowed origns', function () {
    const { regExp } = getAllowedOrigins()
    expectedOrigins.forEach(url => {
      expect(regExp.test(url)).to.equal(true)
    })

    // expected fails
    ;[
      'http://localhost',
      'localhost:5050',
      '//localhost:5555',
      'https://localhost:8080'
    ].forEach(url => {
      expect(regExp.test(url)).to.equal(false)
    })
  })
})
