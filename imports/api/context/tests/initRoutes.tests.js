/* eslint-env mocha */
import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { initRoutes } from '../initRoutes'
import { fetch } from 'meteor/fetch'

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
          run: async function () {
            return { foo: 'bar' }
          }
        }
      }
    }

    initRoutes(context)

    const title = Random.id()
    const insertDocId = collection.insert({ title })
    const url = new URL(Meteor.absoluteUrl(path))
    url.search = new URLSearchParams({ _id: insertDocId }).toString()
    const response = await fetch(url)
    const data = await response.json()
    expect(response.status).to.equal(200)
    expect(response.ok).to.equal(true)
    expect(data).to.deep.equal({ _id: insertDocId, title })
    const responseHeaders = Object.fromEntries(response.headers.entries())
    const { date, ...headers } = responseHeaders
    expect(headers).to.deep.equal({
      // global cacheControl on createRoute
      'cache-control': 'no-cache, no-store, must-revalidate',
      pragma: 'no-cache',
      expires: '0',
      connection: 'close',
      'content-type': 'application/json; charset=utf-8',
      'content-length': '55',
      vary: 'Origin, Accept-Encoding'
    })
    expect(new Date(date).getFullYear()).to.equal(new Date().getFullYear())

    const response2 = await fetch(Meteor.absoluteUrl(path2))
    const data2 = await response2.json()
    expect(data2).to.deep.equal({ foo: 'bar' })
  })
})
