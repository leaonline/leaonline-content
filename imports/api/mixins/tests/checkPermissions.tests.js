/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'
import { expect } from 'chai'
import { Random } from 'meteor/random'
import nJwt from 'njwt'
import { checkPermissions } from '../checkPermissions'
import { PermissionDeniedError } from '../../errors/PermissionDeniedError'
import { restoreAll, stub } from '../../../../tests/helpers/testHelpers'

const createOptions = (run = function () {
  return this
}) => ({
  name: Random.id(8),
  run
})

const createToken = (name, host) => {
  const jwt = nJwt.create({
    scope: name,
    iss: host.url,
    sub: host.sub
  }, Meteor.settings.jwt.key)
  jwt.setExpiration(Date.now() + (60 * 1000))
  return jwt.compact()
}

const expectDenied = ({ fn, name, reason, token }) => {
  try {
    fn()
    expect.fail('Expected permission check to throw')
  }
  catch (error) {
    expect(error.error).to.equal(PermissionDeniedError.name)
    expect(error.reason).to.equal(reason === 'notLoggedIn' ? reason : 'tokenInvalid')
    expect(error.details).to.deep.equal(reason === 'notLoggedIn'
      ? { name }
      : { name, reason, token })
    return error
  }
}

const captureNotification = () => {
  let resolveNotification
  const notification = new Promise(resolve => {
    resolveNotification = resolve
  })
  const sendAsync = stub(Email, 'sendAsync', async data => {
    resolveNotification(data)
  })
  return { notification, sendAsync }
}

describe(checkPermissions.name, function () {
  afterEach(function () {
    restoreAll()
  })

  it('leaves public definitions untouched', function () {
    const options = createOptions(() => 'public result')
    options.isPublic = true

    const wrapped = checkPermissions(options)

    expect(wrapped).to.equal(options)
    expect(wrapped.run()).to.equal('public result')
  })

  it('forwards arguments, return values, and the authenticated context', function () {
    const expected = { result: Random.id() }
    const args = [{ value: 1 }, 'two']
    const environment = { userId: Random.id(), marker: Random.id() }
    const options = createOptions(function (...received) {
      expect(this).to.equal(environment)
      expect(received).to.deep.equal(args)
      return expected
    })

    const wrapped = checkPermissions(options)

    expect(wrapped).to.equal(options)
    expect(wrapped.run.call(environment, ...args)).to.equal(expected)
  })

  it('denies anonymous access and notifies about the error', async function () {
    const options = createOptions()
    const { notification, sendAsync } = captureNotification()
    const wrapped = checkPermissions(options)

    expectDenied({
      fn: () => wrapped.run.call({ userId: null }),
      name: options.name,
      reason: 'notLoggedIn'
    })

    const message = JSON.parse((await notification).text)
    expect(message.message).to.equal('notLoggedIn [errors.permissionDenied]')
    expect(sendAsync.calledOnce).to.equal(true)
  })

  it('accepts a valid JWT, removes it, and forwards the remaining arguments', function () {
    const host = Object.values(Meteor.settings.hosts)[0]
    const environment = { userId: null, marker: Random.id() }
    const secondArg = Random.id()
    const options = createOptions(function (...args) {
      expect(this).to.equal(environment)
      expect(args).to.deep.equal([{ keep: true }, secondArg])
      return this.marker
    })
    options.token = true
    const wrapped = checkPermissions(options)
    const firstArg = {
      token: createToken(options.name, host),
      keep: true
    }

    expect(wrapped.run.call(environment, firstArg, secondArg)).to.equal(environment.marker)
    expect(firstArg).to.deep.equal({ keep: true })
  })

  ;[
    {
      title: 'a missing token',
      token: undefined,
      reason: 'no token'
    },
    {
      title: 'a malformed token',
      token: Random.id(),
      reason: 'Jwt cannot be parsed'
    },
    {
      title: 'the wrong scope',
      token: options => createToken(Random.id(), Object.values(Meteor.settings.hosts)[0]),
      reason: (options, token) => {
        const scope = nJwt.verify(token, Meteor.settings.jwt.key).body.scope
        return `invalid scope for ${options.name}: ${scope}`
      }
    },
    {
      title: 'the wrong issuer',
      token: options => {
        const host = Object.values(Meteor.settings.hosts)[0]
        return createToken(options.name, { ...host, url: `${host.url}/wrong` })
      },
      reason: (options, token) => {
        const body = nJwt.verify(token, Meteor.settings.jwt.key).body
        return `host ${body.iss} has invalid url or invalid sub ${body.sub}`
      }
    },
    {
      title: 'the wrong subject',
      token: options => {
        const host = Object.values(Meteor.settings.hosts)[0]
        return createToken(options.name, { ...host, sub: Random.id() })
      },
      reason: (options, token) => {
        const body = nJwt.verify(token, Meteor.settings.jwt.key).body
        return `host ${body.iss} has invalid url or invalid sub ${body.sub}`
      }
    }
  ].forEach(testCase => {
    it(`rejects ${testCase.title}`, async function () {
      const options = createOptions()
      options.token = true
      const token = typeof testCase.token === 'function'
        ? testCase.token(options)
        : testCase.token
      const reason = typeof testCase.reason === 'function'
        ? testCase.reason(options, token)
        : testCase.reason
      const { notification } = captureNotification()
      const wrapped = checkPermissions(options)

      expectDenied({
        fn: () => wrapped.run.call({ userId: null }, { token }),
        name: options.name,
        reason,
        token
      })

      const message = JSON.parse((await notification).text)
      expect(message.message).to.equal('tokenInvalid [errors.permissionDenied]')
    })
  })
})
