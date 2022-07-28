/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { initRoutes } from '../initRoutes'
import { HTTP } from 'meteor/jkuester:http'

describe(initRoutes.name, function () {
  it('omits undefined routes', function () {
    initRoutes({})
  })
  it('initializes default routes', async function () {
    const name = Random.id()
    const collection = new Mongo.Collection(null)
    const path = `/customtest/${Random.id()}`
    const path2 = `/customtest/${Random.id()}`
    const context = {
      name,
      collection: () => collection,
      routes: {
        byId: {
          path,
          schema: {
            _id: String
          },
          method: 'get'
        },
        test: {
          path: path2,
          method: 'get',
          run: function () {
            return { foo: 'bar' }
          }
        }
      }
    }

    initRoutes(context)

    const title = Random.id()
    const insertDocId = collection.insert({ title })

    const params = { _id: insertDocId }
    const response = await HTTP.get(Meteor.absoluteUrl(path), { params })
    expect(response.statusCode).to.equal(200)
    expect(response.ok).to.equal(true)
    expect(response.data).to.deep.equal({ _id: insertDocId, title })

    const { date, ...headers } = response.headers
    expect(new Date(date).getFullYear()).to.equal(new Date().getFullYear())
    expect(headers).to.deep.equal({
      // global cacheControl on createRoute
      'cache-control': 'no-cache, no-store, must-revalidate',
      pragma: 'no-cache',
      expires: '0',
      connection: 'close',
      'content-encoding': 'gzip',
      'content-type': 'application/json',
      'transfer-encoding': 'chunked',
      'vary': 'Origin, Accept-Encoding'
    })

    const response2 = await HTTP.get(Meteor.absoluteUrl(path2))
    expect(response2.data).to.deep.equal({ foo: 'bar' })
  })
})
