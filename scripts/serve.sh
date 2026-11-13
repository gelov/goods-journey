#!/bin/sh
# Serve the project at http://127.0.0.1:8080 (the page needs a server for the globe texture).
cd "$(dirname "$0")/.." && exec python3 -m http.server "${1:-8080}" --bind 127.0.0.1
