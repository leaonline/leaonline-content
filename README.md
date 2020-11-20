# Content server for lea.online

[![built with Meteor](https://img.shields.io/badge/Meteor-1.11.1-green?logo=meteor&logoColor=white)](https://meteor.com)
[![Project Status: Active – The project has reached a stable, usable state and is being actively developed.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
![GitHub](https://img.shields.io/github/license/leaonline/leaonline-content)

|branch|tests|
|:----:|:----:|
|master|![Test suite](https://github.com/leaonline/leaonline-content/workflows/Test%20suite/badge.svg)|
|develop|![Test suite](https://github.com/leaonline/leaonline-content/workflows/Test%20suite/badge.svg?branch=develop)|


This application provides a content store for cross-application content within
the lea.online environment.

## Additional native dependencies

This application requires native OS dependencies to handle file conversions 
(via [ImageMagick](www.imagemagick.org)) and TTS synthesis (via `espeak`).

See the [`install_dependencies.sh` script](./install_dependencies.sh) for details.

Note, that these dependencies also need to be installed on the target server by
the MUP (Meteor-Up) deployment config.

## License

AGPL-3.0, see [LICENSE file](./LICENSE) for details
