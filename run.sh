#!/bin/sh
meteor npm install

PACKAGE_DIRS="../lib:../liboauth"

INSPECT_BRK=""          # no debugger by default

SCRIPT_USAGE="
Usage: $(basename $0) [OPTIONS]

Options:
  -d              run debugger
"


while getopts "d" opt; do
  case $opt in
    d)
      INSPECT_BRK="--inspect-brk"
      ;;
    \?)
      echo "$SCRIPT_USAGE"
      exit 1
      ;;
  esac
done

METEOR_PACKAGE_DIRS=${PACKAGE_DIRS}  meteor --port=3030 --settings=settings.json --allow-incompatible-update --exclude-archs "web.browser.legacy, web.cordova" ${INSPECT_BRK}
