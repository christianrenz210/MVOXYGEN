#!/usr/bin/env bash
set -e

# Install Node dependencies and build assets
npm ci
npm run build
