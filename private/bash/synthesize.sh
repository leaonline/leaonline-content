#!/usr/bin/env bash

TTS_TEXT=$1
TTS_HASH=$2
TTS_VOICE=${3:-"de5"}

PROJECT_ROOT=$(pwd)
TEMP_PHO="/tmp/$TTS_HASH.pho"
TEMP_WAV="/tmp/$TTS_HASH.wav"
AUDIO_TARGET="$PROJECT_ROOT/assets/app/ttsfiles/$TTS_HASH.wav"

# generate phonems list in temp dir
espeak -v "mb-$TTS_VOICE" "$TTS_TEXT" --pho > ${TEMP_PHO}

# use mbrola to generate a .wav file from it
mbrola "/usr/share/mbrola/$TTS_VOICE/$TTS_VOICE" ${TEMP_PHO} ${TEMP_WAV}

mv ${TEMP_WAV} ${AUDIO_TARGET}
rm ${TEMP_PHO}

if [ -f "${AUDIO_TARGET}" ]; then
    echo ${AUDIO_TARGET}
    exit 0
else
    echo "files does not exist"
    exit 1
fi
