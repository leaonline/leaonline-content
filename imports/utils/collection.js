import { Mongo } from 'meteor/mongo'

export const getCollection = (nameOrObject) => {
  const name = typeof nameOrObject === 'string' ? nameOrObject : nameOrObject.name
  return Mongo.getCollection(name)
}
