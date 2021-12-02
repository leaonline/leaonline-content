export const ContextRegistry = {}

const allContexts = new Map()

ContextRegistry.add = (ctx) => {
  allContexts.set(ctx.name, ctx)
}

ContextRegistry.get = name => allContexts.get(name)

ContextRegistry.has = name => allContexts.has(name)
