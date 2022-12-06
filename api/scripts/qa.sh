#!/usr/bin/env bash
echo 'Checking types'
echo '=============='
yarn run tsc --noEmit -p tsconfig.json
echo $'\nChecking with `eslint`'
echo '======================'
yarn run eslint .
echo $'\nFixing style issues'
echo '==================='
yarn run eslint --fix .
echo $'\n^ Any unresolved issues are shown above.'
