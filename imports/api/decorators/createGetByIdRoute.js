/**
 * Implementation for a generic route to get
 * a context document by it's _id value
 * @param context {object} to context for which this route is to be created
 */
export const createGetByIdRoute = context => async function () {
  console.debug('createGetByIdRoute', context.name)
  const api = this
  const { _id } = api.data()
  return context.collection().findOneAsync(_id)
}
