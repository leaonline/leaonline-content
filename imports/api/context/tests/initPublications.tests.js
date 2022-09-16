/* eslint-env mocha */
import { Mongo } from 'meteor/mongo'
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { initPublications } from '../initPublications'
import { stub, restoreAll } from '../../../../tests/helpers/testHelpers'
import { Publications } from '../../decorators/definePublications'

describe(initPublications.name, function () {
  let name

  beforeEach(function () {
    name = Random.id()
  })

  afterEach(function () {
    restoreAll()
  })

  it('creates default publications', function () {
    let count = 0
    const value = Random.id()
    const define = context => {
      return {
        name: `${context.name}.publications.${count++}`,
        schema: {},
        numRequests: 1,
        timeInterval: 500,
        run: () => value
      }
    }

    stub(Publications, 'defineAllPublication', define)

    const collection = new Mongo.Collection(null)
    const context = { name, collection: () => collection }
    initPublications(context)

    ;[
      context.publications.all
    ].forEach((method, index) => {
      expect(method.name).to.equal(`${context.name}.publications.${index}`)
      expect(method.run()).to.equal(value)
    })
  })
})
