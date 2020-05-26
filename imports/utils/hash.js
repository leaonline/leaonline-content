import { SHA256 } from 'meteor/sha'

export const simpleHash = text => SHA256(text)
