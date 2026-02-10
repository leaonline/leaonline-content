import { WebApp } from 'meteor/webapp'

WebApp.express.urlencoded({ extended: true })
WebApp.handlers.use(WebApp.express.json())
