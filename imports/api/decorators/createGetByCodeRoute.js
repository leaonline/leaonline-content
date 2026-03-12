/**
 * Implementation for a generic route to get
 * a context document by its code value
 * @param context {object} to context for which this route is to be created
 */
export const createGetByCodeRoute = context => async function () {
  const api = this
  const { shortCode } = api.data()
  console.debug('Get by code route for context', context.name, 'shortCode', shortCode, await context.collection().find({ shortCode }).fetchAsync())
  return context.collection().findOneAsync({ shortCode })
}
