import { onServer } from '../../utils/arch'
import { getCollection } from '../../utils/collection'
import { notifyAboutError } from '../errors/notifyAboutError'
import { ContextRegistry } from '../../api/config/ContextRegistry'

const defineAllPublication = ({ name, schema, projection, query, numRequests, timeInterval, isPublic, run, debug }) => {
  const log = (...args) => console.info.apply(null, args)
  const runFct = run || function (queryDoc = {}) {
    const ctx = ContextRegistry.get(name)
    const Collection = ctx && ctx.collection()

    if (!Collection) {
      const error = new TypeError(`Expected collection by name <${name}>`)
      notifyAboutError({ error })
      throw error
    }

    const finalQuery = Object.assign({}, queryDoc, query)
    const cursr = Collection.find(finalQuery, projection)
    log(`[${name}] publish`, finalQuery, ' => ', cursr.count())

    return cursr
  }

  return {
    name: `${name}.publications.all`,
    schema: schema || {},
    numRequests: numRequests || 1,
    timeInterval: timeInterval || 250,
    log: log,
    run: onServer(runFct)
  }
}

export const Publications = {
  name: 'Publications',
  defineAllPublication
}
