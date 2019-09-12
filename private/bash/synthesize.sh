#!/bin/sh

# INPUT PARAMS
TTS_TEXT=$1
TTS_HASH=$2

# PATH VARIABLES
PROJECT_ROOT=$(pwd)
TEMP_PHO="/tmp/$TTS_HASH.pho"
TEMP_WAV="/tmp/$TTS_HASH.wav"

# OUTPUT
AUDIO_TARGET="$PROJECT_ROOT/assets/app/ttsfiles/$TTS_HASH.wav"

# ARCH
PROJECT_ARCH=$(uname -s)

# On the Linux arch we use the espeak and
# mbrola packages for synthesizing the voices
# as they are FLOSS software packages and can be
# installed easily on most Linux OS':
#
# 1. generate phonems list in temp dir
# 2. use mbrola to generate a .wav file from it
if [ "$PROJECT_ARCH" == "Linux" ]; then
    TTS_VOICE=${3:-"de5"}
    espeak -v "mb-$TTS_VOICE" "$TTS_TEXT" --pho > ${TEMP_PHO}
    mbrola "/usr/share/mbrola/$TTS_VOICE/$TTS_VOICE" ${TEMP_PHO} ${TEMP_WAV}
fi

# on OSX we use the internal "say" command
# and write the output directly to the tempdir
if [ "$PROJECT_ARCH" == "Darwin" ]; then
    TTS_VOICE=${3:-"Anna"}
    say -v ${TTS_VOICE} -o ${TEMP_WAV} --quality=127
fi

mv ${TEMP_WAV} ${AUDIO_TARGET}
rm ${TEMP_PHO}

if [ -f "${AUDIO_TARGET}" ]; then
    echo ${AUDIO_TARGET}
    exit 0
else
    echo "files does not exist"
    exit 1
fi
