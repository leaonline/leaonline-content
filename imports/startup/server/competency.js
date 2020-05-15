import { Competency } from '../../contexts/Competency'
import { createCollection } from '../../api/factories/createCollection'
import { createMethods } from '../../api/factories/createMethods'
import { rateLimitMethods, rateLimitPublications } from '../../api/factories/rateLimit'
import { createPublications } from '../../api/factories/createPublication'
import { ServiceRegistry } from '../../api/config/ServiceRegistry'
import { Dimensions } from '../../contexts/Dimensions'
import { createRoutes } from '../../api/factories/createRoute'

const CompetencyCollection = createCollection(Competency)

Competency.collection = function () {
  return CompetencyCollection
}

const methods = Object.values(Competency.methods)
createMethods(methods)
rateLimitMethods(methods)

const publications = Object.values(Competency.publications)
createPublications(publications)
rateLimitPublications(publications)

const routes = Object.values(Competency.httpRoutes)
createRoutes(routes)

const insertUpdate = {
  method: Competency.methods.update.name,
  schema: JSON.stringify(Competency.schema, ServiceRegistry.replacer)
}

ServiceRegistry.add({
  name: Competency.name,
  label: Competency.label,
  icon: Competency.icon,
  type: ServiceRegistry.types.list,
  fields: {
    competencyId: {
      label: Competency.schema.competencyId.label
    },
    dimension: {
      label: Dimensions.label,
      type: ServiceRegistry.fieldTypes.context,
      context: Dimensions.name
    },
    descriptionTeacher: {
      label: Competency.schema.descriptionTeacher.label
    },
    descriptionLearner: {
      label: Competency.schema.descriptionLearner.label
    }
  },
  actions: {
    insert: insertUpdate,
    update: insertUpdate,
    remove: {
      method: Competency.methods.remove.name,
      schema: { _id: String }
    }
  },
  isFilesCollection: false,
  mainCollection: Competency.name,
  collections: [
    Competency.name
  ],
  publications: [{
    name: Competency.publications.all.name,
    schema: Competency.publications.all.schema
  }]
})
