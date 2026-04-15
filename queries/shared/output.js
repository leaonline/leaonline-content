import { jsonFormatter } from './formatters/jsonFormatter'
import { nullWriter } from './writers/nullWriter'
import { fileWriter } from './writers/fileWriter'

export const output = async ({ data, format, type, path, title }) => {
  const writer = writers[type]
  if (!writer) {
    throw new Error(`Unsupported output type: ${type}`)
  }
  const formatter = formatters[format]
  if (!formatter) {
    throw new Error(`Unsupported output format: ${format}`)
  }

  return writer({ data: await formatter({ data }), format, title, path })
}

const formatters = {
  json: jsonFormatter
}

const writers = {
  null: nullWriter,
  file: fileWriter
}
