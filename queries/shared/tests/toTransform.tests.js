/* eslint-env mocha */
import { expect } from 'chai'
import { toTransform } from '../toTransform'

describe(toTransform.name, function () {
  it('uses non-reactive oplog-safe defaults', function () {
    expect(toTransform({})).to.deep.equal({
      disableOplog: false,
      reactive: false
    })
  })

  it('forwards every supported cursor option', function () {
    const fields = { title: 1 }
    const sort = { title: -1 }

    expect(toTransform({
      fields,
      sort,
      limit: 5,
      skip: 2,
      reverse: true,
      disableOplog: true,
      reactive: true
    })).to.deep.equal({
      disableOplog: true,
      reactive: true,
      fields,
      skip: 2,
      limit: 5,
      sort,
      hint: { $natural: -1 }
    })
  })

  it('omits optional cursor options when they are falsey', function () {
    expect(toTransform({
      fields: null,
      sort: undefined,
      limit: 0,
      skip: 0,
      reverse: false
    })).to.deep.equal({
      disableOplog: false,
      reactive: false
    })
  })
})
