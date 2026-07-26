/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { getUserCheck } from '../checkuser'
import { restoreAll, stubUser } from '../../../../tests/helpers/testHelpers'

const validateUser = getUserCheck()

describe(getUserCheck.name, function () {
  afterEach(() => {
    restoreAll()
  })
  it('returns true if passed for download', async () => {
    const allowed = await validateUser(undefined, undefined, 'download')
    expect(allowed).to.eq(true)
  })
  it('returns true if user exists', async () => {
    const userId = Random.id()
    stubUser({ _id: userId })

    for (const value of [userId, { _id: userId }]) {
      const allowed = await validateUser(value)
      expect(allowed).to.eq(true)
    }
  })
  it('returns false if user does exists', async () => {
    const userId = Random.id()

    for (const value of [userId, { _id: userId }, undefined, null, {}]) {
      const allowed = await validateUser(value)
      expect(allowed).to.eq(false)
    }
  })
})
