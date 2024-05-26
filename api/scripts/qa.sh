#!/usr/bin/env bash
echo 'Checking types'
echo '=============='
pnpm tsc --noEmit -p tsconfig.json || exit 1
echo $'\nChecking frontend types'
echo '======================='
pnpm tsc --noEmit -p frontend/src/tsconfig.json || exit 1
echo $'\nChecking with ESLint'
echo '===================='
pnpm eslint .
echo $'\nFixing style issues'
echo '==================='
pnpm eslint --fix . || exit 1
echo $'\n^ Any unresolved issues are shown above.'
