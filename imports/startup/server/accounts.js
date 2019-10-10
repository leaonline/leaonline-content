import { Meteor } from 'meteor/meteor'

Meteor.startup(() => {
  if (Meteor.users.find().count() === 0) {
    const { login } = Meteor.settings.accounts
    const { username } = login
    const { password } = login
    const userId = Accounts.createUser({ username, password })
    console.info(`Devmode: user created with id ${userId} - login via admin / password`)
  }
})

