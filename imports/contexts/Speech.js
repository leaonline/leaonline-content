import { AudioLib } from './AudioLib'

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
  run: async function (/* req, res, next */) {
    const { hash } = this.data()

    const query = { 'meta.hash': hash }
    const AudioFilesCollection = AudioLib.collection()
    const filesDoc = await AudioFilesCollection.findOneAsync(query)
    return filesDoc?.link()
  }
}

Speech.routes.check = {
  path: '/speech/check',
  method: 'get',
  schema: {},
  run: async function (/* req, res, next */) {
    return {
      available: true, schema: {
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