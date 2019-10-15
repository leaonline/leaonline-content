#!/usr/bin/env bash
PACKAGE_DIRS="../lib:../liboauth"
METEOR_PACKAGE_DIRS=${PACKAGE_DIRS} meteor update --all-packages
