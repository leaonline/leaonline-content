import { Status } from '../../types/Status'
import { ColorType } from '../../types/ColorTypes'
import { ServiceRegistry } from '../../api/config/ServiceRegistry'

[Status, ColorType].forEach(ServiceRegistry.register)
