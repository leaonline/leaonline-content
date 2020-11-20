import { SchemaValidator } from 'meteor/leaonline:corelib/validation/SchemaValidator'
import { Schema } from '../../api/schema/Schema'

SchemaValidator.set(function (schema) {
  const instance = Schema.create(schema)
  return doc => instance.validate(doc)
})
