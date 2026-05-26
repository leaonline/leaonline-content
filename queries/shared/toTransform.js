export const toTransform = ({ fields, sort, limit, skip, disableOplog = false, reactive = false, reverse = false }) => {
  const transform = { disableOplog, reactive }

  if (fields) transform.fields = fields
  if (skip) transform.skip = skip
  if (limit) transform.limit = limit
  if (sort) transform.sort = sort
  if (reverse) transform.hint = { $natural: -1 }

  return transform
}
