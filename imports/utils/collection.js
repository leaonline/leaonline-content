import { Mongo } from 'meteor/mongo'
import { FilesCollection } from 'meteor/ostrio:files'

/**
 * Returns a collection by name.
 * @param options Either a String with the collection name or an Object with 'name' property
 * @return {Mongo.Collection}
 */
export const getCollection = options => {
  const type = typeof options
  if ('string' === type) {
    return Mongo.Collection.get(options)
  }
  if ('object' === type && options.name && 'string' === typeof options.name) {
    return Mongo.Collection.get(options.name)
  }
  throw new Error(`Unexpected type for "name" -> ${type}, expected String or Object { name:String }`)
}

export const createFilesCollection = ({ name }) => {
  return new FilesCollection({
    collectionName: name,
    allowClientCode: false, // Disallow remove files from Client
  })
}