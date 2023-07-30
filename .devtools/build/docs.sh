#!/bin/bash

# https://stackoverflow.com/questions/59895/how-to-get-the-source-directory-of-a-bash-script-from-within-the-script-itself
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
BASE_DIR=$(dirname $DIR)

typedoc \
  --tsconfig /mnt/lib/tsconfig.json \
  --out /mnt/docs/reference \
  --gitRemote https://bitbucket.org/nanaio/server-lib-types/src/main/ \
  /mnt/lib/src