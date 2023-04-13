#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# =====================================================================================================================

if [[ -z "$1" ]]; then
  printf "Please indicate what you want 'mach' to do."
  exit 1
fi

XMACH_GIT=`which git 2>/dev/null`
XMACH_CURL=`which curl 2>/dev/null`

# We need python 2.7
XMACH_PYTHON=`which python2.7 2>/dev/null`

if [[ -z "$XMACH_PYTHON" ]]; then
  printf "We could not find Python 2.7 which is required for just about everything!\n"
  exit 1
fi

# Determine the current OS
# This will also be exported so it can be picked up by .mozconfig
XMACH_TARGET_OS=`uname | tr [:upper:] [:lower:]`

if [[ "$XMACH_TARGET_OS" == "mingw32_nt-"* ]]; then
  XMACH_TARGET_OS=winnt
fi

export _BUILD_TARGET_OS=$XMACH_TARGET_OS

# =====================================================================================================================

xmach_check_git() {
  if [[ -z "$XMACH_GIT" ]]; then
    printf "Error: git not found in your path."
    exit 1
  fi
}

xmach_check_curl() {
  if [ -z "$XMACH_CURL" ]; then
    printf "Error: curl not found in your path."
    exit 1
  fi
}

# =====================================================================================================================

cmd_gitcow() {
  xmach_check_git
  printf "Git.. with Cow!"
}

cmd_gitpatch() {
  xmach_check_git

  if [ -z "$1" ]; then
    printf "Error: Patch with what?"
    exit 1
  fi

  if [[ "$1" == "http"* ]]; then
    xmach_check_curl
    if [[ "$1" == *"github.com"* ]] ||
       [[ "$1" == *"gitlab.com"* ]] ||
       [[ "$1" == *"code.binaryoutcast.com"* ]] ||
       [[ "$1" == *"repo.palemoon.org"* ]]; then
      echo ${1}.patch
      $XMACH_CURL -L ${1}.patch | "$XMACH_GIT" apply --reject "${@:2}"
    else
      echo ${1}
      $XMACH_CURL -L ${1} | "$XMACH_GIT" apply --reject "${@:2}"
    fi
  else
    if [[ -d "$1" ]] && [[ -n "$2" ]]; then
      for _commit in "${@:2}"; do
        read -n 1 -s -r -p "Press any key to apply external commit ${_commit}..."
        printf "\n"
        $XMACH_GIT -C "$1" show $_commit | "$XMACH_GIT" apply --reject
      done
    elif [[ -f "$1" ]]; then
      cat "$1" | "$XMACH_GIT" apply --reject
    fi
  fi
}

cmd_v2k() {
  $XMACH_PYTHON ./runtime/build/version2k.py ${@:2}
}

cmd_release() {
  $XMACH_PYTHON mach build && $XMACH_PYTHON mach package && $XMACH_PYTHON mach mar

  if [[ "$XMACH_TARGET_OS" == "winnt" ]]; then
    $XMACH_PYTHON mach installer
  fi
}

cmd_localbuild() {
  $XMACH_PYTHON mach build || exit 1
  if [[ "$XMACH_TARGET_OS" == "winnt" ]]; then
    $XMACH_PYTHON mach installer && $XMACH_PYTHON mach install
  else
    $XMACH_PYTHON mach stage
  fi
}

# =====================================================================================================================

if [[ "$1" == "-c" ]] || [[ "$1" == "--command" ]]; then
  "cmd_${@:2}"
  exit 0
fi

# =====================================================================================================================

# Fallthrough to Mozilla Mach...

# =====================================================================================================================
