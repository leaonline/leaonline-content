import { EJSON } from 'meteor/ejson'

export const jsonFormatter = ({ data }) => {
  return EJSON.stringify(data)
}
