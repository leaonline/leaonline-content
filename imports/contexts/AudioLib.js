export const AudioLib = {
  name: 'audioLib',
  collectionName: 'audioLib',
  isFilesCollection: true,
  label: 'audioLib.title',
  original: 'original',
  icon: 'volume',
  accept: 'audio/*',
  extensions: ['mp3', 'aac', 'ogg'],
  representative: 'name',
  hooks: {}
}

AudioLib.transformVersions = async (file, { translate, log }) => {
  log('add metadata')
  const [hash] = file.name.split('.')
  await AudioLib.collection().updateAsync(file._id, { $set: { 'meta.hash': hash }})
}

AudioLib.schema = {

}