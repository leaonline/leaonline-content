const defaults = {
  cacheControl: 'no-cache, no-store, must-revalidate',
  pragma: 'no-cache',
  expires: '0'
}

export const getCacheControl = ({ cacheControl, pragma, expires } = {}) => {
  const _cacheControl = cacheControl || defaults.cacheControl
  const _pragma = pragma || defaults.pragma
  const _expires = expires || defaults.expires

  return function (req, res, next) {
    res.setHeader('Cache-Control', _cacheControl)
    res.setHeader('Pragma', _pragma)
    res.setHeader('Expires', _expires)
    next()
  }
}
