import { Meteor } from 'meteor/meteor'

const urls = Object.values(Meteor.settings.hosts).map(host => host.url)
// eslint-disable-next-line
const regExp = new RegExp(urls.map(url => url.replace('//', '\/\/')).join('|'), 'i')

export const getAllowedOrigins = () => {
  return { urls, regExp }
}
