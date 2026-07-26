import { Meteor } from 'meteor/meteor'
import { createLog } from '../utils/log'
import path from 'node:path'

export const Speech = {
  name: 'speech',
  label: 'speech.title',
  icon: 'speaker',
  routes: {}
}

Speech.routes.get = {
  path: '/speech',
  method: 'get',
  schema: {
    hash: String,
    speed: {
      type: Number,
      optional: true,
      min: 0.1,
      max: 2.0
    },
    gender: {
      type: String,
      optional: true,
      allowedValues: ['m', 'f', '*']
    }
  },
  run: async function (req, res, next) {
    const { hash } = this.data()
    if (!/^[a-zA-Z0-9]+$/.test(hash)) {
      throw new Meteor.Error(400, 'invalid hash', { hash })
    }
    const fileName = `${hash}.mp3`
    debug(`[SPEECH]: serving request for ${hash}`)
    const filePath = path.join(process.cwd(), 'assets/app/ttsfiles/')
    const options = {
      root: filePath,
      dotfiles: 'deny',
      acceptRanges: false,
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true,
        'Content-Type': 'audio/mpeg'
      }
    }
    return new Promise((resolve, reject) => {
      res.sendFile(fileName, options, (err, buffer) => {
        if (err) {
          return reject(err)
        }
        else {
          resolve(buffer)
        }
      })
    })
  }
}

Speech.routes.check = {
  path: '/speech/check',
  method: 'get',
  schema: {},
  run: async function (/* req, res, next */) {
    return {
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
    }
  }
}

const debug = createLog(Speech.name, console.debug)
