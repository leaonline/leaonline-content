#!/usr/bin/env bash

# -----------------------------------------------------------------------------
# update meteor core and related packages
# -----------------------------------------------------------------------------
PACKAGE_DIRS="../lib:../liboauth:../libext:/../meteor-autoform-themes"

update_meteor () {
    METEOR_PACKAGE_DIRS=${PACKAGE_DIRS} meteor update --all-packages
}


update_npm () {
    # --------------------------------------------------------------------------
    # update all outdated npm packages to the latest
    # thanks to: https://stackoverflow.com/a/55406675/3098783
    # --------------------------------------------------------------------------
    meteor npm install $(meteor npm outdated | cut -d' ' -f 1 | sed '1d' | xargs -I '$' echo '$@latest' | xargs echo)

    # --------------------------------------------------------------------------
    # clean installed modules because some modules are broken
    # after an update (mostly related to modules that needs to be built)
    # --------------------------------------------------------------------------
    rm -rf ./node_modules
    meteor npm install
}

# -----------------------------------------------------------------------------
# parse optargs
# -----------------------------------------------------------------------------
while [[ "$1" =~ ^- && ! "$1" == "--" ]]; do case $1 in
  -m | --meteor )
    update_meteor
    ;;
  -n | --npm | --node )
    update_npm
    ;;
esac; shift; done
if [[ "$1" == '--' ]]; then shift; fi