#!/bin/sh

# INPUT PARAMS
TTS_TEXT="$1"
TTS_HASH="$2"

# PATH VARIABLES
PROJECT_ROOT=$(pwd)
TEMP_PHO="/tmp/$TTS_HASH.pho"
TEMP_WAV="/tmp/$TTS_HASH.wav"

# OUTPUT
AUDIO_ROOT="$PROJECT_ROOT/assets/app/uploads/ttsfiles"
AUDIO_TARGET="$AUDIO_ROOT/$TTS_HASH.wav"

# create target folder if it does not exists
[ ! -d ${AUDIO_ROOT} ] && mkdir -p ${AUDIO_ROOT}

# ARCH
PROJECT_ARCH=$(uname -s)
echo ${PROJECT_ARCH}

# On the Linux arch we use the espeak and
# mbrola packages for synthesizing the voices
# as they are FLOSS software packages and can be
# installed easily on most Linux OS':
#
# 1. generate phonems list in temp dir
# 2. use mbrola to generate a .wav file from it
ttsLinux () {
	TTS_VOICE=${3:-"de5"}
    espeak -v "mb-$TTS_VOICE" "$TTS_TEXT" --pho > ${TEMP_PHO}
    mbrola "/usr/share/mbrola/$TTS_VOICE/$TTS_VOICE" ${TEMP_PHO} ${TEMP_WAV}
    echo ${TEMP_WAV}
    mv ${TEMP_WAV} ${AUDIO_TARGET}
	rm ${TEMP_PHO}
}

# on OSX we use the internal "say" command
# and write the output directly to the tempdir
ttsOsx () {
    TTS_VOICE=${3:-"Anna"}
    say -v ${TTS_VOICE} -o ${TEMP_WAV} --quality=127
}

if [ "$PROJECT_ARCH" = "Linux" ]; then
    ttsLinux
fi

if [ "$PROJECT_ARCH" = "Darwin" ]; then
	ttsOsx
fi


if [ -f "${AUDIO_TARGET}" ]; then
    echo ${AUDIO_TARGET}
    exit 0
else
    echo "files does not exist"
    exit 1
fi
