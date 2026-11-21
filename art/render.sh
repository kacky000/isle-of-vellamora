#!/usr/bin/env bash
# Renders art/poster.html with headless Chrome, then saves it as entry.jpg (1024x1024 JPEG):
# the paper grain makes a PNG of this poster larger than the 1 MiB cap, a JPEG at quality 92 is not.
# Run from the repository root:  bash art/render.sh
set -euo pipefail
browser="${BROWSER_BIN:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
cd "$(dirname "$0")/.."
root="$(pwd -W 2>/dev/null || pwd)"
node art/build.mjs
"$browser" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1024,1024 --screenshot="$root/art/shot.png" "file:///$root/art/poster.html"
python -c "
from PIL import Image
Image.open('art/shot.png').convert('RGB').save('entry.jpg', quality=92, subsampling=0, optimize=True)
im = Image.open('entry.jpg'); import os
print('entry.jpg', os.path.getsize('entry.jpg'), 'bytes', im.size)
"
