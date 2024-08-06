import { expect } from 'chai'
import { EJSON } from 'meteor/ejson'

export const expectThrow = async ({ fn, message, details }) => {
  try {
    const result = await fn()
    expect.fail(`Expected fn to throw, got ${EJSON.stringify(result)}`)
  }
  catch (e) {
    if (message) {
      expect(e.message).to.equal(message)
    }
    if (details) {
      expect(e.details).to.deep.equal(details)
    }
  }
}
