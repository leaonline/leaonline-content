/* eslint-env mocha */
import { Email } from 'meteor/email'
import { expect } from 'chai'
import sinon from 'sinon'
import { Assets } from '../Assets'

const captureNotification = () => {
  let resolveNotification
  const notification = new Promise(resolve => {
    resolveNotification = resolve
  })
  sinon.stub(Email, 'sendAsync').callsFake(async data => resolveNotification(data))
  return notification
}

const expectRejectedWith = async (promise, expected) => {
  try {
    await promise
    expect.fail('Expected promise to reject')
  }
  catch (error) {
    expect(error).to.equal(expected)
  }
}

describe(Assets.name, function () {
  afterEach(function () {
    sinon.restore()
  })

  describe(Assets.routes.assetUrl.path, function () {
    it('looks up the file and returns its public link', async function () {
      const file = { _id: 'asset-id', name: 'asset.png' }
      const findOneAsync = sinon.stub().resolves(file)
      const link = sinon.stub().withArgs(file).returns('/cdn/asset.png')
      sinon.stub(Assets, 'collection').returns({ findOneAsync, link })

      const result = await Assets.routes.assetUrl.run.call({
        data: () => ({ _id: file._id })
      })

      expect(result).to.equal('/cdn/asset.png')
      expect(findOneAsync.calledOnceWithExactly(file._id)).to.equal(true)
      expect(link.calledOnceWithExactly(file)).to.equal(true)
    })
  })

  describe(Assets.methods.remove.name, function () {
    it('resolves true after the file callback succeeds', async function () {
      const remove = sinon.stub().callsFake(callback => callback())
      const file = { _id: 'asset-id', name: 'asset.png', remove }
      const findOneAsync = sinon.stub().resolves(file)
      sinon.stub(Assets, 'collection').returns({ findOneAsync })

      expect(await Assets.methods.remove.run({ _id: file._id })).to.equal(true)
      expect(findOneAsync.calledOnceWithExactly(file._id)).to.equal(true)
      expect(remove.calledOnce).to.equal(true)
    })

    it('throws and notifies when the file document is missing', async function () {
      const notification = captureNotification()
      sinon.stub(Assets, 'collection').returns({ findOneAsync: sinon.stub().resolves() })

      try {
        await Assets.methods.remove.run({ _id: 'missing' })
        expect.fail('Expected missing asset to reject')
      }
      catch (error) {
        expect(error.error).to.equal('errors.docNotFound')
        expect(error.reason).to.equal('assets.noDocById')
        expect(error.details).to.deep.equal({ _id: 'missing' })
      }
      expect(await notification).to.have.property('text')
    })

    it('propagates a file removal callback error', async function () {
      const failure = new Error('remove failed')
      const file = {
        _id: 'asset-id',
        name: 'asset.png',
        remove: callback => callback(failure)
      }
      sinon.stub(Assets, 'collection').returns({ findOneAsync: sinon.stub().resolves(file) })

      await expectRejectedWith(Assets.methods.remove.run({ _id: file._id }), failure)
    })
  })

  describe(Assets.validateMime.name, function () {
    it('currently accepts every asset MIME candidate', function () {
      expect(Assets.validateMime({
        extension: 'png',
        mime: 'image/png',
        file: { name: 'asset.png' }
      })).to.equal(true)
    })
  })
})
