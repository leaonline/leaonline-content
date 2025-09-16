import Health from 'meteor/leaonline:health'
import { createMethod } from '../../api/factories/createMethods'

createMethod({
  name: 'status.health.inquiry',
  monitor: false,
  token: true,
  schema: {
    token: String
  },
  run: () => {
    console.debug('[status.health.inquiry]: running health inquiry')
    return Health.all({
      os: false
    })
  }
})
