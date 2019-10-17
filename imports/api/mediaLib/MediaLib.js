import { getCollection } from '../../utils/collection'

export const MediaLib = {
  name: 'mediaLib',
  label: 'mediaLib.title',
  icon: 'images',
  appId: 'content',
  isFilesCollection: true
}

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

MediaLib.routes = {}

MediaLib.routes.mediaUrl = {
  path: '/media/url',
  methods: [ 'GET', 'OPTIONS' ],
  schema: {
    _id: String
  },
  isPublic: true,
  returns: {
    contentType: 'application/json;UTF-8',
    schema: {
      url: String
    }
  }
}

MediaLib.publications = {}

MediaLib.publications.all = {
  name: 'mediaLib.publications.all',
  schema: {},
  projection: {},
  numRequests: 1,
  timeInterval: 500,
  isPublic: true,
  roles: [ 'readMediaContent' ],
  group: 'content',
  run: function () {
    return MediaLib.collection().find()
  }
}
