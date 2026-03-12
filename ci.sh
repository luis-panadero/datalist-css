#!/bin/bash

echo "Using correct Node version"
nvm install

echo "Node deps and budiling..."
npm ci
npm run build
npx playwright install --with-deps

echo "Runing tests"
npm run test:e2e

