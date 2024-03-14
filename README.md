# Content server for lea.online

![Test suite](https://github.com/leaonline/leaonline-content/workflows/Test%20suite/badge.svg)
[![built with Meteor](https://img.shields.io/badge/Meteor-app-green?logo=meteor&logoColor=white)](https://meteor.com)
[![Project Status: Active – The project has reached a stable, usable state and is being actively developed.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
![GitHub](https://img.shields.io/github/license/leaonline/leaonline-content)

This application provides a content store for cross-application content within
the lea.online environment.

## Additional native dependencies

This application requires native OS dependencies to handle file conversions 
(via [ImageMagick](www.imagemagick.org)) and TTS synthesis (via `espeak`).

See the [`install_dependencies.sh` script](./install_dependencies.sh) for details.

Note, that these dependencies also need to be installed on the target server by
the MUP (Meteor-Up) deployment config.

## Install DB Dump

If you want to work with a dump from prod/staging environment, you can use the [fixtures.sh](./fixtures.sh)
script. It uses `mongorestore` under the hood.

If you don't have `mongorestore` installed, you may go to
[their download page](https://www.mongodb.com/try/download/database-tools?tck=docs_databasetools)
and install it for your system using [the installation guide](https://www.mongodb.com/docs/database-tools/installation).
After that you should be able to run the script without issues (unless there is a major version mismatch between your 
production mongo and the local one).

### Important note

After you successfully imported the dumped data you may need to recomute and relink data.
In [`settings.json`](./settings.json) you need to set both `patches.recomputeProgress` and `patches.linkAlphaLevel` to
`true`. The server will restart automatically. Once it ran through you can set them back to `false`.


## License

AGPL-3.0, see [LICENSE file](./LICENSE) for details
