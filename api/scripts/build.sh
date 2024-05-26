#!/usr/bin/env bash
echo 'Building API from .'
pnpm tsc -p tsconfig.json
echo 'API built to compiled/'
echo '======================'
echo 'Rebuilding frontend from frontend/src/'
pnpm tsc -p frontend/src/tsconfig.json
echo 'Frontend built to frontend/webjs/'
echo '================================='
