#!/usr/bin/env bash

set -e

# ------------------------------------------
#
# Variable declarations
#
# ------------------------------------------

PROJECT_ROOT=$(pwd)
PARENT_ROOT="$(dirname "$PROJECT_ROOT")"
PORT=5566
WATCH_MODE=1
RUN_ONCE=''
VERBOSE_MODE=0
PACKAGE_DIRS="${PARENT_ROOT}/lib:${PARENT_ROOT}/libnpm:${PARENT_ROOT}/liboauth:./github"

# ------------------------------------------
#
# Read args from script call
#
# ------------------------------------------

while getopts "vc" opt; do
  case $opt in
    v)
	  VERBOSE_MODE=1
      ;;
    c)
      WATCH_MODE=0
      RUN_ONCE='--once'
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

# ------------------------------------------
#
# Print variables on verbose mode
#
# ------------------------------------------

if [ "$VERBOSE_MODE" -eq "1" ];
then
    PROJECT_NAME=`basename "$PROJECT_ROOT"`
	echo "=> Test: $PROJECT_NAME"
	echo "=> Path: [${PROJECT_ROOT}]"
	echo "=> Port: [${PORT}]"
	echo "=> Lib path(s): [${PACKAGE_DIRS}]"
	echo "=> Watch mode: [${WATCH_MODE}] ${RUN_ONCE}"
fi


if [ "$WATCH_MODE" -eq "0" ];
then
    # ---------------------------------------------------------------
    # in cli mode we use a headless browser to include client tests
    # and we activate the coverage reporting functionality
    # ---------------------------------------------------------------
    METEOR_PACKAGE_DIRS=${PACKAGE_DIRS} \
    BABEL_ENV=COVERAGE \
    TEST_SERVER=1 \
    TEST_CLIENT=0 \
    COVERAGE=1 \
    COVERAGE_OUT_HTML=1 \
    COVERAGE_OUT_LCOVONLY=1 \
    COVERAGE_OUT_TEXT_SUMMARY=1 \
    COVERAGE_OUT_JSON_SUMMARY=1 \
    COVERAGE_APP_FOLDER=$PWD/ \
    COVERAGE_VERBOSE_MODE=${VERBOSE_MODE} \
            meteor test \
                --exclude-archs=web.browser.legacy,web.cordova \
                --driver-package=meteortesting:mocha \
                --settings=settings.json \
                --port=${PORT} \
                --once
    cat ./.coverage/summary.txt
    else
    # ---------------------------------------------------------------
    # in watch mode we neither use a browser driver, nor coverage
    # se we speed up the test reload in the development phase
    # ---------------------------------------------------------------
    METEOR_PACKAGE_DIRS=${PACKAGE_DIRS} \
    TEST_SERVER=1 \
    TEST_CLIENT=0 \
        meteor test \
            --exclude-archs=web.browser.legacy,web.cordova \
            --driver-package=meteortesting:mocha \
            --settings=settings.json \
            --port=${PORT}
fi
