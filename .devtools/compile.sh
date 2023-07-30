#!/bin/bash
ROOT=$(git rev-parse --show-toplevel)

cd $ROOT
echo "Compiling from typescript to javascript"
npx \
  tsc \
    --build \
    --verbose \
    $@
