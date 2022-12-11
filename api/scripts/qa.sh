#!/usr/bin/env bash
echo 'Checking types'
echo '=============='
yarn run tsc --noEmit -p tsconfig.json || exit 1
echo $'\nChecking with `eslint`'
echo '======================'
yarn run eslint . || exit 1
echo $'\nFixing style issues'
echo '==================='
yarn run eslint --fix . || exit 1
echo $'\n^ Any unresolved issues are shown above.'
