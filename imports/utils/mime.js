import FileType from 'file-type'

export const detectMime = fullPath => FileType.fromFile(fullPath)
