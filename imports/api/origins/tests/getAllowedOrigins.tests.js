/* eslint-env mocha */
import { expect } from 'chai'
import { getAllowedOrigins } from '../getAllowedOrigins'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { Meteor } from 'meteor/meteor'

describe(getAllowedOrigins.name, function () {
  it('returns urls of all allowed origins', function () {
    const urlSchema = new SimpleSchema({
      urls: {
        type: Array
      },
      'urls.$': { type: String, regEx: /^http:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/ }
    })
    const { urls } = getAllowedOrigins()
    const validationContext = urlSchema.newContext();
    try {
      urlSchema.validate({ urls })
    } catch (e) {
      console.error(e)
    }
    const errors = validationContext.validationErrors()
    expect(errors).to.have.lengthOf(0)
  })
  it('returns a regex to validate allowed origns', function () {
    const { regExp } = getAllowedOrigins()
    const urls = Object.values(Meteor.settings.hosts).map(host => host.url)

    urls.forEach(url => {
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
