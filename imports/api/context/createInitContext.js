/**
 * An open-closed based method that uses a list of init methods
 * to pipe the context through. The methods can be mutating and decorating
 * with regards to the context but also create new environments, like
 * Meteor.Methods and Meteor.Publications.
 *
 * @param initMethods {Array<Function>}
 * @return {Function}
 */
export const createInitContext = initMethods => (context) => {
  console.log(`[${context.name}]: start create context pipeline`)
  initMethods.forEach(fn => fn(context))
}
