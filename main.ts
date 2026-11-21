// Writes the Vellamora travel poster to /output/entry.png.
// The poster is drawn as SVG in art/build.mjs and rendered once to entry.png (bash art/render.sh);
// this program only ships that image, so the sandbox needs no browser and no network.
import { copyFileSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.OUTPUT_DIR ?? "/output";
const src = join(here, "entry.png");
const dst = join(outDir, "entry.png");

mkdirSync(outDir, { recursive: true });
copyFileSync(src, dst);
console.log(`wrote ${dst} (${statSync(dst).size} bytes)`);
