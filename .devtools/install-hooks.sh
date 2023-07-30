#!/bin/bash

ROOT=$(git rev-parse --show-toplevel)

echo "Installing git hooks"

cd $ROOT
npx husky install
