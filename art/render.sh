#!/usr/bin/env bash
# Renders art/poster.html to entry.png (1024x1024) with headless Chrome.
# Run from the repository root:  bash art/render.sh
set -euo pipefail
browser="${BROWSER_BIN:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
cd "$(dirname "$0")/.."
root="$(pwd -W 2>/dev/null || pwd)"
node art/build.mjs
"$browser" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1024,1024 --screenshot="$root/entry.png" "file:///$root/art/poster.html"
node -e "
const b = require('node:fs').readFileSync(process.argv[1]);
console.log('entry.png', b.length, 'bytes', b.readUInt32BE(16) + 'x' + b.readUInt32BE(20));
" "$root/entry.png"
