/* eslint-env mocha */
import { Email } from 'meteor/email'
import { expect } from 'chai'
import { getCors } from '../getCors'
import { restoreAll, stub } from '../../../../../tests/helpers/testHelpers'
import { asyncTimeout } from '../../../../utils/asyncTimeout'
import { ServerResponse } from 'http'
import { Meteor } from 'meteor/meteor'

describe(getCors.name, function () {
  afterEach(function () {
    restoreAll()
  })
  it('notifies about invalid origins', async function () {
    const cors = getCors()
    const req = {
      headers: {
        origin: 'foo'
      }
    }
    const res = {}
    const next = () => {}
    let sent = false

    stub(Email, 'sendAsync', doc => {
      const error = JSON.parse(doc.text)
      expect(error.message).to.equal('[HTTP]: foo is not allowed by CORS policy')
      sent = true
    })

    await cors(req, res, next)
    await asyncTimeout(50)
    expect(sent).to.equal(true)
  })
  it('does not notify about undefined origins', async function () {
    const cors = getCors()
    const req = {
      method: 'get',
      headers: {
        origin: 'undefined'
      }
    }
    const res = new ServerResponse(req)
    const next = () => {}
    let sent = false
    stub(Email, 'sendAsync', doc => {
      sent = true
    })
    await cors(req, res, next)
    await asyncTimeout(25)
    expect(sent).to.equal(false)
  })
  it('allows allowed origins', async function () {
    const allowedOrigins = Object.values(Meteor.settings.hosts).map(host => host.url)
    const cors = getCors()
    const req = {
      method: 'get',
      headers: {
        origin: allowedOrigins[0]
      }
    }
    const res = new ServerResponse(req)
    const next = () => {}
    let sent = false
    stub(Email, 'sendAsync', doc => {
      sent = true
    })
    await cors(req, res, next)
    await asyncTimeout(25)
    expect(sent).to.equal(false)
  })
  it('handles url / suffix', async function () {
    const allowedOrigins = Object.values(Meteor.settings.hosts).map(host => host.url)
    const cors = getCors()
    const req = {
      method: 'get',
      headers: {
        origin: allowedOrigins[0] + '/'
      }
    }
    const res = new ServerResponse(req)
    const next = () => {}
    let sent = false
    stub(Email, 'sendAsync', doc => {
      sent = true
    })
    await cors(req, res, next)
    await asyncTimeout(25)
    expect(sent).to.equal(false)
  })
})
