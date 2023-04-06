#!/usr/bin/env bash
echo 'Checking types'
echo '=============='
yarn run tsc --noEmit -p tsconfig.json || exit 1
echo $'\nChecking frontend types'
echo '======================='
yarn run tsc --noEmit -p frontend/src/tsconfig.json || exit 1
echo $'\nChecking with `eslint`'
echo '======================'
yarn run eslint .
echo $'\nFixing style issues'
echo '==================='
yarn run eslint --fix . || exit 1
echo $'\n^ Any unresolved issues are shown above.'
