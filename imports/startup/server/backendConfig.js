import { BackendConfig } from '../../api/config/BackendConfig'
import { createMethods } from '../../api/factories/createMethods'
import { rateLimitMethods } from '../../api/factories/rateLimit'
import de from '../../../resources/i18n/i18n_de'

BackendConfig.init({
  icon: 'file',
  label: 'content',
  description: 'apps.content.description'
})

BackendConfig.addLang('de', de)

const methods = Object.values(BackendConfig.methods)
createMethods(methods)
rateLimitMethods(methods)
