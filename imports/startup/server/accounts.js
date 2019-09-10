import { Meteor } from 'meteor/meteor'

if (Meteor.isDevelopment) {
  Meteor.startup(() => {
    if (Meteor.users.find().count() === 0) {
      const userId = Accounts.createUser({ username: 'admin', password: 'password' })
      console.info(`Devmode: user created with id ${userId} - login via admin / password`)
    }
  })
}
