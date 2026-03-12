import { createGetByIdRoute } from '../decorators/createGetByIdRoute'
import { createGetByCodeRoute } from '../decorators/createGetByCodeRoute'
import { createRoutes } from '../factories/createRoute'

export const initRoutes = context => {
  context.routes = context.routes || {}

  if (context.routes.byId) {
    context.routes.byId.run = createGetByIdRoute(context)
  }

  if (context.routes.byCode) {
    context.routes.byCode.run = createGetByCodeRoute(context)
  }

  const routes = Object.values(context.routes)
  createRoutes(routes)
}
