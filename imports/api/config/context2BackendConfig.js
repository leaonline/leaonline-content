import { Competency } from '../../contexts/Competency'
import { Dimensions } from '../../contexts/Dimensions'
import { BackendConfig } from './BackendConfig'

function getConfigType (context) {
  if (context.isFilesCollection) {
    return BackendConfig.types.gallery
  }
  if (context.isConfigDoc) {
    return BackendConfig.types.document
  }
  return BackendConfig.types.list
}

function getPublicFields (context) {
  const fields = Object.entries(context.schema)
  const publicFields = {}
  fields.forEach(({ key, value }) => {
    if (!value.isPublic) return

    const def = {}
    def.label = `${context.name}.${key}`

    if (value.context) {
      def.type = BackendConfig.fieldTypes.context
      def.context = value.context
    }

    if (value.collection) {
      def.type = BackendConfig.fieldTypes.collection
      def.collection = value.collection
      def.field = value.field
    }

    publicFields[key] = def
  })
  return publicFields
}

export const context2BackendConfig = context => {
  const configType = getConfigType(context)
  const publicFields = getPublicFields(context.schema)

  return {
    name: context.name,
    label: context.label,
    icon: context.icon,
    isFilesCollection: context.isFilesCollection,
    type: configType,
    fields: publicFields,
    actions: {
      insert: insertUpdate,
      update: insertUpdate,
      remove: {
        method: Competency.methods.remove.name,
        schema: { _id: String }
      }
    },
    mainCollection: Competency.name,
    collections: [
      Competency.name
    ],
    publications: [{
      name: Competency.publications.all.name,
      schema: Competency.publications.all.schema
    }]
  }
}