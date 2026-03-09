/* eslint-env mocha */
import { expect } from 'chai'
import { toArray } from '../toArray'

describe(toArray.name, () => {
  it('should return the array itself if it is an array', () => {
    const arr = [1, 2, 3]
    const result = toArray(arr)
    expect(result).to.equal(arr)
  })
  it('should return an empty array if the value is undefined', () => {
    const result = toArray(undefined)
    expect(result).to.deep.equal([])
  })
  it('should return an array with a single element if the value is not an array', () => {
    const values = [42, true, false, 'moo', null, {}, () => {}]
    for (const value of values) {
      const result = toArray(value)
      expect(result).to.deep.equal([value])
    }
  })
})
