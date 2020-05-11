import { Status } from '../../types/Status'
import { ColorType } from '../../types/ColorTypes'
import { BackendConfig } from '../../api/config/BackendConfig'

[Status, ColorType].forEach(BackendConfig.add)
