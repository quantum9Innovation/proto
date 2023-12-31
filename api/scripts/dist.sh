#!/usr/bin/env bash
echo 'Building API from .'
yarn run tsc -p tsconfig.json
echo 'API built to compiled/'
echo '======================'
echo 'Rebuilding frontend from frontend/src/'
yarn run tsc -p frontend/src/tsconfig.json
echo 'Frontend built to frontend/webjs/'
echo '================================='
echo 'Compiling API to single file'
rm -r dist
yarn run ncc build compiled/run.js -o dist
echo 'API compiled to dist/index.js'
echo '==================================='
echo 'Cleaning up generated distributions'
rm -r dist/frontend/src
rm dist/frontend/webjs/*.map
echo 'Cleaned distributions'
echo '====================='
echo 'Generating tarball'
cp package.json dist/package.json
touch dist/bootstrap.sh
printf "#!/bin/bash\n" >> dist/bootstrap.sh
printf "cd ..\n" >> dist/bootstrap.sh
printf "mkdir frontend\n" >> dist/bootstrap.sh
printf "mv dist/frontend/index.html frontend/index.html\n" >> dist/bootstrap.sh
printf "cd dist; yarn install\n" >> dist/bootstrap.sh
touch dist/start.sh
printf "#!/bin/bash\n" >> dist/start.sh
printf "export NODE_ENV=production\n" >> dist/start.sh
printf "node .\n" >> dist/start.sh
tar -czvf dist/dist.tar.gz dist
echo 'Tarball generated'
echo '================='
echo $'\nSee the dist/ folder for all generated assets.'
echo 'To start here, run: '
echo '> node dist/index.js'
echo $'\nAlternatively, to run in production, move dist/dist.tar.gz to the desired location'
echo 'Then, run the bootstrapper from within the extracted location: '
echo '> ./bootstrap.sh'
echo 'Create and edit config.json and then run:'
echo '> ./start.sh'
