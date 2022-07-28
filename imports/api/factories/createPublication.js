import { createPublicationFactory } from 'meteor/leaonline:publication-factory'
import { checkPermissions } from '../mixins/checkPermissions'
import { environmentExtensionMixin } from '../mixins/environmentExtensionMixin'
import { Schema } from '../schema/Schema'
import { createLog } from '../../utils/log'


export const createPublication = createPublicationFactory({
  schemaFactory: Schema.create,
  mixins: [environmentExtensionMixin, checkPermissions]
})
const log = createLog('createPublication')

export const createPublications = publications => publications.map(definition => {
  log('for', definition.name)
  try {
    createPublication(definition)
  } catch (e) {
    console.error(e)
    console.debug({ definition })
    throw e
  }
})
