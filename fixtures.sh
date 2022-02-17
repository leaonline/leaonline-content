#!/usr/bin/env bash


mongorestore --host="127.0.0.1" --port="3031" \
    --archive=$1 --gzip --verbose \
    --nsInclude="leaonline-content.*" \
    --nsExclude='leaonline-content.meteor_accounts_loginServiceConfiguration' \
    --nsExclude='leaonline-content.meteor_oauth_pendingCredentials' \
    --nsFrom="leaonline-content.*" --nsTo="meteor.*" --convertLegacyIndexes


