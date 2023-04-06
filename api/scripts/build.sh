#!/usr/bin/env bash
echo 'Building API from .'
yarn run tsc -p tsconfig.json
echo 'API built to compiled/'
echo '======================'
echo 'Building frontend from frontend/src/'
yarn run tsc -p frontend/src/tsconfig.json
echo 'Frontend built to frontend/webjs/'
echo '================================='
