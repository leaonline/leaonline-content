/**
 *
 * @param name
 * @param target
 * @return {function(...[*]=): void}
 */
export const createLog = (name, target = console.debug) => {
  const logName = `[${name}]:`
  return (...args) => {
    args.unshift(logName)
    return target.apply(null, args)
  }
}
