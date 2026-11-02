/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { expect } from 'chai'
import sinon from 'sinon'
import { Speech } from '../Speech'

const createRequest = origin => ({
  get: sinon.stub().withArgs('Origin').returns(origin)
})

const expectRejectedWith = async (promise, expected) => {
  try {
    await promise
    expect.fail('Expected promise to reject')
  }
  catch (error) {
    expect(error).to.equal(expected)
  }
}

describe(Speech.name, function () {
  const originalIgnoreErrors = Meteor.settings.tts.ignoreErrors

  afterEach(function () {
    Meteor.settings.tts.ignoreErrors = originalIgnoreErrors
    sinon.restore()
  })

  describe(Speech.routes.get.path, function () {
    const handler = Speech.routes.get.run

    it('rejects an invalid hash before sending a file', async function () {
      const hash = '../invalid'
      const sendFile = sinon.stub()

      try {
        await handler.call({ data: () => ({ hash }) }, createRequest(), { sendFile })
        expect.fail('Expected invalid hash to reject')
      }
      catch (error) {
        expect(error.error).to.equal(400)
        expect(error.reason).to.equal('invalid hash')
        expect(error.details).to.deep.equal({ hash })
      }
      expect(sendFile.called).to.equal(false)
    })

    ;[
      {
        title: 'adds CORS for an allowed origin',
        origin: Meteor.settings.tts.allowedOrigins[0],
        expectedOrigin: Meteor.settings.tts.allowedOrigins[0]
      },
      {
        title: 'omits CORS for a disallowed origin',
        origin: 'https://disallowed.example',
        expectedOrigin: undefined
      }
    ].forEach(testCase => {
      it(testCase.title, async function () {
        const buffer = { bytes: 123 }
        const sendFile = sinon.stub().callsFake((fileName, options, callback) => {
          callback(null, buffer)
        })
        sinon.stub(Date, 'now').returns(9876)

        const result = await handler.call(
          { data: () => ({ hash: 'abc123' }) },
          createRequest(testCase.origin),
          { sendFile }
        )

        expect(result).to.equal(buffer)
        expect(sendFile.calledOnce).to.equal(true)
        const [fileName, options] = sendFile.firstCall.args
        expect(fileName).to.equal('abc123.mp3')
        expect(options).to.include({
          dotfiles: 'deny',
          acceptRanges: false
        })
        expect(options.root).to.match(/assets\/app\/ttsfiles\/?$/)
        expect(options.headers).to.include({
          'x-timestamp': 9876,
          'x-sent': true,
          'Content-Type': 'audio/mpeg'
        })
        expect(options.headers['Access-Control-Allow-Origin']).to.equal(testCase.expectedOrigin)
      })
    })

    it('resolves null and logs a sendFile error when errors are ignored', async function () {
      Meteor.settings.tts.ignoreErrors = true
      const failure = new Error('missing file')
      const sendFile = sinon.stub().callsFake((fileName, options, callback) => callback(failure))
      const consoleError = sinon.stub(console, 'error')

      const result = await handler.call(
        { data: () => ({ hash: 'missing' }) },
        createRequest(),
        { sendFile }
      )

      expect(result).to.equal(null)
      expect(consoleError.calledOnceWithExactly(failure)).to.equal(true)
    })

    it('propagates a sendFile error when errors are not ignored', async function () {
      Meteor.settings.tts.ignoreErrors = false
      const failure = new Error('send failed')
      const sendFile = sinon.stub().callsFake((fileName, options, callback) => callback(failure))

      await expectRejectedWith(handler.call(
        { data: () => ({ hash: 'validHash' }) },
        createRequest(),
        { sendFile }
      ), failure)
    })
  })

  describe(Speech.routes.check.path, function () {
    it('describes speech availability and accepted parameters', async function () {
      expect(await Speech.routes.check.run()).to.deep.equal({
        available: true,
        schema: {
          hash: 'string',
          speed: {
            type: 'number',
            optional: true,
            min: 0.1,
            max: 2.0
          },
          gender: {
            type: 'string',
            optional: true,
            allowedValues: ['m', 'f', '*']
          }
        }
      })
    })
  })
})
