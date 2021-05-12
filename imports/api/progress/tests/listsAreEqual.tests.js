/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { listsAreEqual } from '../listsAreEqual'

describe(listsAreEqual.name, function () {
  it('determines, whether two String-Arrays are equal', function () {
    const id = Random.id()
    ;[
      [],
      [undefined, []],
      [[], undefined],
      [[], []],
      [[''], ['']],
      [['1'], ['1']],
      [[id, id], [id, id]]
    ].forEach(([a, b]) => {
      expect(listsAreEqual(a, b)).to.equal(true)
    })

    ;[
      [[''], []],
      [[], ['']],
      [[Random.id()], [Random.id()]],
      [['1'], [' 1']]
    ].forEach(([a, b]) => {
      expect(listsAreEqual(a, b)).to.equal(false)
    })
  })
})
