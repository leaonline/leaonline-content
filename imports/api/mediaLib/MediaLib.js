import { MediaLib } from 'meteor/leaonline:interfaces/MediaLib'
import { getCollection } from '../../utils/collection'

let _collection
let _filesCollection

MediaLib.collection = function () {
  if (!_collection) {
    _collection = getCollection(MediaLib)
  }
  return _collection
}

MediaLib.filesCollection = function () {
  if (!_filesCollection) {
    _filesCollection = MediaLib.collection().filesCollection
  }
  return _filesCollection
}

MediaLib.publications.all.run = function () {
  console.log("media lib pub")
  return MediaLib.collection().find()
}

export { MediaLib }