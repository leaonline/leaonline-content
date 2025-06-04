/**
 * Converts a value to an array.
 * If the value is undefined, it returns an empty array.
 * Note, that null will be converted to an array with a single null element.
 * @param value
 * @return {*|*[]}
 */
export const toArray = value => {
  if (typeof value === 'undefined') return []
  return Array.isArray(value) ? value : [value]
}
