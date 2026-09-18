/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { environmentExtensionMixin } from '../environmentExtensionMixin'

describe(environmentExtensionMixin.name, function () {
  it('returns the options if set to null', function () {
    const options = { env: null }
    const options2 = { env: false }
    expect(environmentExtensionMixin(options)).to.deep.equal(options)
    expect(environmentExtensionMixin(options2)).to.deep.equal(options2)
  })
  it('assigns logging helpers and preserves the environment', function () {
    const userId = Random.id()
    const environment = { userId }
    const options = {
      name: Random.id(8),
      run: function () {
        expect(this.log).to.be.a('function')
        expect(this.debug).to.be.a('function')
        expect(this.userId).to.equal(userId)
        expect(this).to.equal(environment)
        return this
      }
    }

    const updated = environmentExtensionMixin(options)
    expect(updated).to.equal(options)
    expect(updated.run.call(environment)).to.equal(environment)
  })
  it('forwards all parameters and the return value', function () {
    const testArgs = []
    testArgs.length = 5 + Math.floor(Math.random() * 10)
    testArgs.fill(-99)
    const result = { value: Random.id() }

    const options = {
      name: Random.id(8),
      run: function (...args) {
        expect(args).to.deep.equal(testArgs)
        return result
      }
    }

    const updated = environmentExtensionMixin(options)
    expect(updated.run(...testArgs)).to.equal(result)
  })
})
