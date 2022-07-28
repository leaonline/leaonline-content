/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { registerContext } from '../registerContext'
import { stub, restoreAll } from '../../../../tests/helpers/testHelpers'
import { ServiceRegistry } from '../../config/ServiceRegistry'
import { ContextRegistry } from '../../config/ContextRegistry'

describe(registerContext.name, function () {
  afterEach(function () {
    restoreAll()
  })
  it('registers a context', function () {
    const ctx = { name: Random.id() }
    const register = context => {
      expect(context).to.deep.equal(ctx)
    }
    stub(ServiceRegistry, 'register', register)
    stub(ContextRegistry, 'add', register)
    registerContext(ctx)
  })
})
