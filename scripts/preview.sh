#!/usr/bin/env bash
echo 'Generating CSS bundle...'
npx tailwindcss -i ./src/app.css -o ./src/dist/output.css
echo 'Starting build... (Ctrl+C to exit)'
node api/ & vite preview && fg
wait
