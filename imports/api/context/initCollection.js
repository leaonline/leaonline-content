import { Meteor } from 'meteor/meteor'
import { CollectionTimeStamp } from '../collection/CollectionTimeStamp'
import { createCollection } from '../factories/createCollection'
import { createFilesCollection } from '../factories/createFilesCollection'
import { metaSchema } from '../schema/metaSchema'
import { getCheckMime } from '../grid/checkMime'
import { getUserCheck } from '../grid/checkuser'

const validateUser = getUserCheck()
const allowedOrigins = Object.values(Meteor.settings.hosts).map(host => host.url)

export const initCollection = context => {
  let collection

  if (context.isFilesCollection) {
    // mime validation is context-sensitive, because some file categories
    // have a very special way of dealing with their existions, mimes etc.
    const validateMime = getCheckMime(x => x, context)
    // console.log('FS ALLOWED ORIGINS', allowedOrigins)

    collection = createFilesCollection({
      collectionName: context.collectionName,
      allowedOrigins,
      debug: Meteor.isDevelopment,
      validateUser,
      validateMime,
      maxSize: context.maxSize,
      extensions: context.extensions
    })
  }
  else {
    collection = createCollection({
      name: context.name,
      schema: Object.assign({}, context.schema, metaSchema),
      attachSchema: true
    })

    // we always want to track who created a document
    collection.before.insert(function (userId, doc) {
      console.info(context.name, 'insert', { userId }, doc)
      doc.meta = {
        createdBy: userId,
        createdAt: new Date()
      }
    })

    // we also want to know who updated a document
    collection.before.update(function (userId, doc, fieldNames, modifier /*, options */) {
      console.info(context.name, 'update', { userId, doc: doc._id }, modifier)

      modifier.$set = modifier.$set || {}
      // last updates
      modifier.$set['meta.updatedAt'] = new Date()
      modifier.$set['meta.updatedBy'] = userId
    })

    if (context.afterInsert) {
      collection.after.insert(context.afterInsert)
      delete context.afterInsert
    }

    if (context.beforeUpdate) {
      collection.before.update(context.beforeUpdate)
      delete context.beforeUpdate
    }

    if (context.afterUpdate) {
      collection.after.update(context.afterUpdate)
      delete context.afterUpdate
    }

    collection.before.remove(function (userId, doc) {
      console.info(context.name, 'remove', { userId }, doc._id)
    })
  }

  context.collection = () => collection

  CollectionTimeStamp.register(context.name, context.isFilesCollection
    ? collection.collection
    : collection)
}
