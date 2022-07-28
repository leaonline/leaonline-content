import { createMethods } from '../factories/createMethods'
import { rateLimitMethods } from '../factories/rateLimit'
import { CRUDMethods } from '../decorators/defineCRUDMethods'
import { RateLimitDefaults } from '../rateLimit/RateLimitDefaults'

export const initMethods = context => {
  context.methods = context.methods || {}
  context.methods.insert = context.methods.insert || CRUDMethods.defineInsertMethod({
    name: context.name,
    schema: context.schema,
    ...RateLimitDefaults.methods.insert()
  })
  context.methods.update = context.methods.update || CRUDMethods.defineUpdateMethod({
    name: context.name,
    schema: context.schema,
    ...RateLimitDefaults.methods.update()
  })
  context.methods.remove = context.methods.remove || CRUDMethods.defineRemoveMethod({ name: context.name, ...RateLimitDefaults.methods.remove() })
  context.methods.getAll = context.methods.getAll || CRUDMethods.defineGetAllMethod({ name: context.name, ...RateLimitDefaults.methods.all() })
  context.methods.getOne = context.methods.getOne || CRUDMethods.defineGetOneMethod({ name: context.name, ...RateLimitDefaults.methods.get })
  context.methods.all = context.methods.all || CRUDMethods.defineAllMethod({ name: context.name, ...RateLimitDefaults.methods.all() })

  const methods = Object.values(context.methods)
  createMethods(methods)
  rateLimitMethods(methods)
}
