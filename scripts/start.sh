#!/usr/bin/env bash
echo 'Starting up...'
node serve.js
echo 'Opening landing page...'
cd web
if [[ '$OSTYPE' == 'linux-gnu'* ]]; then
    xdg-open ./index.html
elif [[ '$OSTYPE' == 'darwin'* ]]; then
    open ./index.html
elif [[ '$OSTYPE' == 'cygwin' ]]; then
    xdg-open ./index.html
elif [[ '$OSTYPE' == 'msys' ]]; then
    start ./index.html
elif [[ '$OSTYPE' == 'win32' ]]; then
    start ./index.html
elif [[ '$OSTYPE' == 'freebsd'* ]]; then
    start ./index.html
else
    echo 'Unknown OS, still trying to open...'
    xdg-open ./index.html || open ./index.html || start ./index.html
    echo 'If no page is displayed, please open web/index.html manually.'
fi