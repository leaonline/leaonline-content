/**
 * see https://devdocs.io/openjdk~8/java/lang/string#hashCode--
 */
export const simpleHash = function (text) {
  let hash = 0
  if (text.length === 0) {
    return hash
  }
  let i, char
  for (i = 0; i < text.length; i++) {
    char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}
