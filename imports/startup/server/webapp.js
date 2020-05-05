import { WebApp } from 'meteor/webapp'
import bodyParser from 'body-parser'

WebApp.connectHandlers.urlEncoded(bodyParser)
WebApp.connectHandlers.json(bodyParser)
