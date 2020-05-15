import { ServiceRegistry } from '../../api/config/ServiceRegistry'
import { createMethods } from '../../api/factories/createMethods'
import { rateLimitMethods } from '../../api/factories/rateLimit'
import de from '../../../resources/i18n/i18n_de'
import commonDe from 'meteor/leaonline:interfaces/common/i18n_de'

ServiceRegistry.init({
  icon: 'file',
  label: 'content',
  description: 'apps.content.description'
})

ServiceRegistry.addLang('de', Object.assign(commonDe, de))

const methods = Object.values(ServiceRegistry.methods)
createMethods(methods)
rateLimitMethods(methods)
