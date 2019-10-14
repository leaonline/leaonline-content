import {MediaLib} from '../../api/mediaLib/MediaLib'
import { createFilesCollection } from '../../api/factories/createFilesCollection'
import { createPublications } from '../../api/factories/createPublication'

const allowedOrigins = new RegExp(Meteor.settings.hosts.backend.urlRegEx)

const onAfterUpload = function (file) {
  console.log('file Uploaded', file)
}
createFilesCollection({ name: MediaLib.name, allowedOrigins, debug: true, onAfterUpload })

const publications = Object.values(MediaLib.publications)
createPublications(publications)
