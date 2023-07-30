#!/bin/bash
ROOT=$(git rev-parse --show-toplevel)

cd $ROOT
echo "Using standard-version version $(npx standard-version --version)"
npx standard-version -a