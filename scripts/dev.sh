#!/usr/bin/env bash
echo 'Starting: Tailwind CSS, Server API, SvelteKit Frontend'
echo 'Running all processes simultaneously... (Ctrl+C to exit)'
npx tailwindcss -i ./src/app.css -o ./src/dist/output.css --watch \
    & node api/ \
    & vite dev \
    & wait
