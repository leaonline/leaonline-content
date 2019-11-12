import { Competency } from '../../api/competency/Competency'
import { createCollection } from '../../api/factories/createCollection'
import { createMethods } from '../../api/factories/createMethods'
import { rateLimitMethods, rateLimitPublications } from '../../api/factories/rateLimit'
import { createPublications } from '../../api/factories/createPublication'
import { BackendConfig } from '../../api/config/BackendConfig'
import { Dimensions } from '../../api/dimensions/Dimensions'
import { Levels } from '../../api/levels/Levels'

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

const insertUpdate = {
  method: Competency.methods.update.name,
  schema: JSON.stringify(Competency.schema, BackendConfig.replacer)
}

BackendConfig.add({
  name: Competency.name,
  label: Competency.label,
  icon: Competency.icon,
  type: BackendConfig.types.list,
  fields: {
    competencyId: {
      label: Competency.schema.competencyId.label
    },
    dimension: {
      label: Dimensions.label,
      type: BackendConfig.fieldTypes.context,
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
  roles: [ 'editCompetency' ], // TODO put in Roles
  group: 'editors', // TODO put in Groups,
  isFilesCollection: false,
  mainCollection: Competency.name,
  collections: [
    Competency.name
  ],
  publications: [ {
    name: Competency.publications.all.name,
    schema: Competency.publications.all.schema
  }]
})