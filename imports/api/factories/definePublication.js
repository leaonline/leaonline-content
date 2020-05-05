import { onServer } from '../../utils/arch'
import { getCollection } from '../../utils/collection'

export const defineAllPublication = ({ name, schema, projection, query, numRequests, timeInterval, isPublic, run }) => {
  const runFct = run || function (queryDoc = {}) {
    const Collection = getCollection(name)
    if (!Collection) throw new Error(`Expected collection by name <${name}>`)
    const finalQuery = Object.assign({}, queryDoc, query)
    const cursr = Collection.find(finalQuery, projection)
    console.info(name, cursr.count(), finalQuery)
    return cursr
  }

  return {
    name: `${name}.publications.all`,
    schema: schema || {},
    numRequests: numRequests || 1,
    timeInterval: timeInterval || 250,
    run: onServer(runFct)
  }
}
