/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { checkPermissions } from '../checkPermissions'
import { restoreAll, stub } from '../../../../tests/helpers/testHelpers'
import { Email } from 'meteor/email'
import { PermissionDeniedError } from '../../errors/PermissionDeniedError'
import nJwt from 'njwt'

const createOptions = () => {
  const options = {}
  options.name = Random.id(8)
  options.run = function () {
    return options.name
  }
  return options
}

const createToken = (name, host) => {
  const signingKey = Meteor.settings.jwt.key
  const claims = {
    iss: host.url,
    sub: host.sub // The UID of the user in your system
  }
  const jwt = nJwt.create({ scope: name, ...claims }, signingKey)
  jwt.setExpiration(new Date().getTime() + (60 * 1000)) // One minute from now
  return jwt.compact()
}

describe(checkPermissions.name, function () {
  afterEach(() => {
    restoreAll()
  })
  it('grants access to public flagged definitions', function () {
    const options = createOptions()
    options.isPublic = true
    const wrapped = checkPermissions(options)
    expect(wrapped).to.deep.equal(options)
    expect(wrapped.run()).to.equal(options.name)
  })
  it('prevents access if no user is authenticated and no token exchange is defined', function (done) {
    const options = createOptions()

    stub(Email, 'send', doc => {
      const error = JSON.parse(doc.text)
      expect(error.message).to.equal('notLoggedIn [errors.permissionDenied]')
      done()
    })

    const wrapped = checkPermissions(options)

    // grant access to authenticated user
    expect(wrapped.run.call({ userId: Random.id() })).to.equal(options.name)

    const thrown = expect(() => wrapped.run()).to.throw(PermissionDeniedError.name)
    thrown.with.property('reason', 'notLoggedIn')
    thrown.with.deep.property('details', { name: options.name })
  })
  it('allows access with correct token', function () {
    const options = createOptions()
    options.token = true

    const wrapped = checkPermissions(options)

    Object.values(Meteor.settings.hosts).forEach(host => {
      const token = createToken(options.name, host)
      expect(wrapped.run({ token })).to.equal(options.name)
    })
  })
  it('prevents access if wrong token when token required', function (done) {
    const options = createOptions()
    options.token = true

    stub(Email, 'send', doc => {
      const error = JSON.parse(doc.text)
      expect(error.message).to.equal('tokenInvalid [errors.permissionDenied]')
      done()
    })

    const wrapped = checkPermissions(options)

    const thrown = expect(() => wrapped.run()).to.throw(PermissionDeniedError.name)
    thrown.with.property('reason', 'tokenInvalid')
    thrown.with.deep.property('details', {
      name: options.name,
      reason: 'no token',
      token: undefined
    })
  })
  it('prevents access without token if token is wrong', function () {
    const options = createOptions()
    options.token = true

    stub(Email, 'send', doc => {
      const error = JSON.parse(doc.text)
      expect(error.message).to.equal('tokenInvalid [errors.permissionDenied]')
    })

    const wrapped = checkPermissions(options)

    const expectThrown = ({ fn, token, reason }) => {
      try {
        fn()
      }
      catch (err) {
        console.debug(err.name)
        console.debug(err.error)
        console.debug(err.reason)
        console.debug(err.details)
        console.debug(reason)
        expect(err.error).to.equal(PermissionDeniedError.name)
        expect(err.reason).to.equal('tokenInvalid')
        expect(err.details.name).to.equal(options.name)
        expect(err.details.token).to.equal(token)
        expect(err.details.reason).to.equal(reason)
      }
    }

    const hosts = Object.values(Meteor.settings.hosts)

    // case 0 parsing error
    hosts.forEach(() => {
      const token = Random.id()
      expectThrown({
        fn: () => wrapped.run({ token }),
        token,
        reason: 'Jwt cannot be parsed'
      })
    })

    // case 1: wrong scope
    hosts.forEach(host => {
      const scope = Random.id()
      const token = createToken(scope, host)
      expectThrown({
        fn: () => wrapped.run({ token }),
        token,
        reason: `invalid scope: ${options.name} !== ${scope}`
      })
    })

    // case 2: wrong url
    hosts.forEach(host => {
      const url = host.url + '0'
      const token = createToken(options.name, { url, sub: host.sub })
      expectThrown({
        fn: () => wrapped.run({ token }),
        token,
        reason: `host ${url} has invalid url or invalid sub ${host.sub}`
      })
    })

    // case 3: wrong sub
    hosts.forEach(host => {
      const sub = Random.id()
      const token = createToken(options.name, { url: host.url, sub })
      expectThrown({
        fn: () => wrapped.run({ token }),
        token,
        reason: `host ${host.url} has invalid url or invalid sub ${sub}`
      })
    })
  })
})
