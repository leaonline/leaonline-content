/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'
import { EJSON } from 'meteor/ejson'
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { notifyAboutError } from '../notifyAboutError'
import { stub, restoreAll } from '../../../../tests/helpers/testHelpers'

describe(notifyAboutError.name, function () {
  afterEach(() => {
    restoreAll()
  })
  it('it sends an email', (done) => {
    const userId = Random.id()
    const message = 'Expected error ' + Random.id()

    stub(Email, 'sendAsync', (data) => {
      try {
        const err = EJSON.parse(data.text)
        expect(err.name).to.equal('hello')
        expect(err.type).to.equal('native')
        expect(err.reason).to.equal(message)
        expect(err.foo).to.equal('bar')
        done()
      }
      catch (e) {
        done(e)
      }
    })

    notifyAboutError({
      error: new Meteor.Error('hello', message),
      userId,
      foo: 'bar' // custom value
    })
  })
})
