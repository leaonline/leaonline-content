/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { initMethods } from '../initMethods'
import { stub, restoreAll } from '../../../../tests/helpers/testHelpers'
import { CRUDMethods } from '../../decorators/defineCRUDMethods'

describe(initMethods.name, function () {
  let name

  beforeEach(function () {
    name = Random.id()
  })

  afterEach(function () {
    restoreAll()
  })

  it('sets default methods', function () {
    let count = 0
    const value = Random.id()
    const define = context => {
      return {
        name: `${context.name}.methods.${count++}`,
        schema: {},
        numRequests: 1,
        timeInterval: 500,
        run: () => value
      }
    }

    stub(CRUDMethods, 'defineInsertMethod', define)
    stub(CRUDMethods, 'defineRemoveMethod', define)
    stub(CRUDMethods, 'defineUpdateMethod', define)
    stub(CRUDMethods, 'defineGetAllMethod', define)
    stub(CRUDMethods, 'defineGetOneMethod', define)
    stub(CRUDMethods, 'defineAllMethod', define)

    const collection = new Mongo.Collection(null)
    const context = { name, collection: () => collection }
    initMethods(context)

    ;[
      context.methods.insert,
      context.methods.update,
      context.methods.remove,
      context.methods.getAll,
      context.methods.getOne,
      context.methods.all,
    ].forEach((method, index) => {
      expect(method.name).to.equal(`${context.name}.methods.${index}`)
      expect(method.run()).to.equal(value)
    })
  })
})
