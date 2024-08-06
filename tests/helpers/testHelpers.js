import sinon from 'sinon'
import { getProperty } from '../../imports/utils/getProperty'

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
  return stubbedTarget
}

export const restore = (target, name) => {
  const prop = getProperty(target, name)
  if (!prop?.restore) {
    throw new Error(`not stubbed: ${name}`)
  }
  prop.restore()
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
