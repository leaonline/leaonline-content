import { Meteor } from 'meteor/meteor'
import crypto from 'crypto'

const { hashing } = Meteor.settings

export const createHash = secret => crypto
  .createHash(hashing.algorithm)
  .update(secret)
  .digest(hashing.digest)
