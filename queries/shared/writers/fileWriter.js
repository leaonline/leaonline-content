import fs from 'node:fs/promises'
import nodePath from 'node:path'

export const fileWriter = ({ data, title, format, path }) => {
  const filename = `${title}.${format}`
  const finalPath = path ? nodePath.join(path, filename) : nodePath.join(process.cwd(), 'output', filename)
  return fs.writeFile(finalPath, data, 'utf-8')
}
