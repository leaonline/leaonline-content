import { Items } from '../../contexts/Items'
import { ServiceRegistry } from '../../api/config/ServiceRegistry'
// non-editable contexts, that are also not types
// are only registered to the ServiceRegistry

Items.forEach(ServiceRegistry.register)
