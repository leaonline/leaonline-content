#!/bin/sh
meteor npm install

PACKAGE_DIRS="../lib:../liboauth"
METEOR_PACKAGE_DIRS=${PACKAGE_DIRS}  meteor --port=3030 --settings=settings.json --allow-incompatible-update --exclude-archs "web.browser.legacy, web.cordova"
