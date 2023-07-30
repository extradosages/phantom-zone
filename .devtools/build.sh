#!/bin/bash
ROOT=$(git rev-parse --show-toplevel)
LIB=$ROOT/lib

cd $LIB
echo "Building with typescript $(npx tsc --version)"
npx tsc --build $LIB/tsconfig.json --verbose