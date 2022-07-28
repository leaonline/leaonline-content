import { ServiceRegistry } from '../config/ServiceRegistry'
import { ContextRegistry } from '../config/ContextRegistry'

/**
 * Registers the context to the serviceRegistry for being connectable with
 * Services
 * and to the contextRegistry to being available by name
 * @param context {object}
 */
export const registerContext = context => {
  ServiceRegistry.register(context)
  ContextRegistry.add(context)
}
