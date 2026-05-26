export const textFormatter = ({ data }) => {
  return typeof data === 'string' ? data : String(data)
}
