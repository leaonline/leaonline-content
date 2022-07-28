import { createLog } from '../../utils/log'

/**
 * This mixin injects useful generic functions into the method or publication
 * environment (the funciton's this-context).
 *
 * @param options
 * @return {*}
 */
export const environmentExtensionMixin = function (options) {
  const log = createLog(options.name)
  const debug = createLog(options.name, 'debug')

  const runFct = options.run

  options.run = function run (...args) {
    // safe-assign our extensions to the environment document
    Object.assign(this, { log, debug })

    log('run by ', this.userId)
    return runFct.call(this, ...args)
  }

  return options
}
