import SimpleSchema from 'simpl-schema'
import sinon from 'sinon'

// allow our custom schema keys here to pass schema based tests
SimpleSchema.extendOptions(['autoform'])

export const createSchema = (schema, options) => new SimpleSchema(schema, options)
export const multiSchema = (...defs) => SimpleSchema.oneOf(defs)

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
export const iterate = (num, fct) => (new Array(num)).forEach(fct)

export const unsafeInt = negative => negative
  ? (Number.MIN_SAFE_INTEGER - 1)
  : (Number.MAX_SAFE_INTEGER + 1)

// /////////////////////////////////////////////////////////////////////////////
//
// Stubbing, the easy way
//
// /////////////////////////////////////////////////////////////////////////////

const stubs = new Map()

export const stub = (target, name, handler) => {
  if (stubs.get(target)) {
    throw new Error(`already stubbed: ${name}`)
  }
  const stubbedTarget = sinon.stub(target, name)
  if (typeof handler === 'function') {
    stubbedTarget.callsFake(handler)
  }
  else {
    stubbedTarget.value(handler)
  }
  stubs.set(stubbedTarget, name)
}

export const restore = (target, name) => {
  if (!target[name] || !target[name].restore) {
    throw new Error(`not stubbed: ${name}`)
  }
  target[name].restore()
  stubs.delete(target)
}

export const overrideStub = (target, name, handler) => {
  restore(target, name)
  stub(target, name, handler)
}

export const restoreAll = () => {
  stubs.forEach((name, target) => {
    target.restore()
    stubs.delete(target)
  })
}
