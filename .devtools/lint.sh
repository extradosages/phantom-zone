#!/bin/bash
ROOT=$(git rev-parse --show-toplevel)

cd $ROOT
echo "Linting project"
npx eslint --config $ROOT/.eslintrc.json $ROOT/lib \
  && echo "OK"
