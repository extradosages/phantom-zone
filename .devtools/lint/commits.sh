#!/bin/bash

ROOT=$(git rev-parse --show-toplevel)

echo "Linting commits"

cd $ROOT
npx commitlint --verbose $@
