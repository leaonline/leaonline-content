/* eslint-env mocha */
import { expect } from 'chai'
import { createInitContext } from '../createInitContext'

describe(createInitContext.name, function () {
  it('uses a list of init-functions to create a context', function () {
    const ctx = {}
    const initEmpty = createInitContext([])
    initEmpty(ctx)
    expect(ctx).to.deep.equal({}) // unmutated

    const withMutators = createInitContext([x => { x.foo = 'bar' }])
    withMutators(ctx)
    expect(ctx).to.deep.equal({ foo: 'bar' }) // mutated
  })
})
