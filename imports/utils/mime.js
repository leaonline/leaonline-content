import mmm from 'mmmagic'
const { Magic } = mmm
const magic = new Magic(mmm.MAGIC_MIME_TYPE)

export const detectMime = fullPath => {
  return new Promise((resolve, reject) => {
    magic.detectFile(fullPath, function (err, result) {
      if (err) {
        console.error(err)
        resolve(null)
      }
      else {
        resolve(result)
      }
    })
  })
}
