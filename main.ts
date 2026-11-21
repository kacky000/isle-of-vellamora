// Writes the Vellamora travel poster to /output/entry.png.
// The poster is drawn as SVG in art/build.mjs and rendered once to entry.jpg (bash art/render.sh);
// this program only ships that image, so the sandbox needs no browser and no network.
// The gate takes a whole PNG or JPEG at /output/entry.png, so the JPEG bytes go there unchanged.
import { copyFileSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.OUTPUT_DIR ?? "/output";
const src = join(here, "entry.jpg");
const dst = join(outDir, "entry.png");

mkdirSync(outDir, { recursive: true });
copyFileSync(src, dst);
console.log(`wrote ${dst} (${statSync(dst).size} bytes)`);
