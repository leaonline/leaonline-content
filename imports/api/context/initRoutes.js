import { createGetByIdRoute } from '../decorators/createGetByIdRoute'
import { createRoutes } from '../factories/createRoute'

export const initRoutes = context => {
  context.routes = context.routes || {}

  if (context.routes.byId) {
    context.routes.byId.run = createGetByIdRoute(context)
  }

  const routes = Object.values(context.routes)
  createRoutes(routes)
}
