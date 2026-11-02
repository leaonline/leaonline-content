/* eslint-env mocha */
import { Email } from 'meteor/email'
import { expect } from 'chai'
import sinon from 'sinon'
import { MediaLib } from '../MediaLib'

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

describe(MediaLib.name, function () {
  afterEach(function () {
    sinon.restore()
  })

  it('is explicitly public', function () {
    expect(MediaLib.isPublic).to.equal(true)
  })

  describe(MediaLib.routes.mediaUrl.path, function () {
    it('looks up the file and returns its public link', async function () {
      const file = { _id: 'media-id', name: 'media.png' }
      const findOneAsync = sinon.stub().resolves(file)
      const link = sinon.stub().withArgs(file).returns('/cdn/media.png')
      sinon.stub(MediaLib, 'collection').returns({ findOneAsync, link })

      const result = await MediaLib.routes.mediaUrl.run.call({
        data: () => ({ _id: file._id })
      })

      expect(result).to.equal('/cdn/media.png')
      expect(findOneAsync.calledOnceWithExactly(file._id)).to.equal(true)
      expect(link.calledOnceWithExactly(file)).to.equal(true)
    })
  })

  describe(MediaLib.methods.remove.name, function () {
    it('resolves true after the file callback succeeds', async function () {
      const remove = sinon.stub().callsFake(callback => callback())
      const file = { _id: 'media-id', name: 'media.png', remove }
      const findOneAsync = sinon.stub().resolves(file)
      sinon.stub(MediaLib, 'collection').returns({ findOneAsync })

      expect(await MediaLib.methods.remove.run({ _id: file._id })).to.equal(true)
      expect(findOneAsync.calledOnceWithExactly(file._id)).to.equal(true)
      expect(remove.calledOnce).to.equal(true)
    })

    it('throws and notifies when the file document is missing', async function () {
      const notification = captureNotification()
      sinon.stub(MediaLib, 'collection').returns({ findOneAsync: sinon.stub().resolves() })

      try {
        await MediaLib.methods.remove.run({ _id: 'missing' })
        expect.fail('Expected missing media document to reject')
      }
      catch (error) {
        expect(error.error).to.equal('errors.docNotFound')
        expect(error.reason).to.equal('mediaLib.noDocById')
        expect(error.details).to.deep.equal({ _id: 'missing' })
      }
      expect(await notification).to.have.property('text')
    })

    it('propagates a file removal callback error', async function () {
      const failure = new Error('remove failed')
      const file = {
        _id: 'media-id',
        name: 'media.png',
        remove: callback => callback(failure)
      }
      sinon.stub(MediaLib, 'collection').returns({ findOneAsync: sinon.stub().resolves(file) })

      await expectRejectedWith(MediaLib.methods.remove.run({ _id: file._id }), failure)
    })
  })
})
