#!/bin/bash

echo "Authenticating release"

if [ -z "${NPM_TOKEN}" ]
then
  npm whoami 2&> /dev/null
  WHOAMI_CODE=$(echo $?)
  if [ "${WHOAMI_CODE}" != "0" ]
  then
    >&2 echo "No access to @nanaio scope on npmjs.org; aborting release"
    >&2 echo 'Either set the `NPM_TOKEN` environment variable or login to npmjs.org with `npm login`'
    exit 1
  fi
fi