#!/bin/bash

ROOT=$(git rev-parse --show-toplevel)

echo "Setting up repository"

cd $ROOT
npm i
npx husky install
