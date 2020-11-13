export const implementGetByIdRoute = context => {
  if (context?.routes?.byId) {
    context.routes.byId.run = function () {
      const api = this
      const { _id } = api.data()
      return context.collection().findOne(_id)
    }
  }
}
