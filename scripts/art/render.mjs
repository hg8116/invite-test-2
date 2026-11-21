#!/usr/bin/env node
// Renders every procedural painting to an optimised WebP in assets/art/.
//
//   node scripts/art/render.mjs            # render everything
//   node scripts/art/render.mjs hero card  # render only some pieces
//   PREVIEW_DIR=/tmp/x node scripts/art/render.mjs hero   # also dump PNG previews
//
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

import { pieces } from "./pieces.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const outDir = join(root, "assets", "art");
const previewDir = process.env.PREVIEW_DIR;

const only = new Set(process.argv.slice(2));

await mkdir(outDir, { recursive: true });
if (previewDir) await mkdir(previewDir, { recursive: true });

for (const piece of pieces) {
  if (only.size && !only.has(piece.name)) continue;
  const t0 = performance.now();
  const svg = piece.svg();
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: piece.outWidth ?? piece.width },
    background: "rgba(0,0,0,0)",
    shapeRendering: 2,
  });
  const png = resvg.render().asPng();
  const file = join(outDir, `${piece.name}.webp`);
  await sharp(png)
    .webp({ quality: piece.quality ?? 80, alphaQuality: 90, effort: 6, smartSubsample: true })
    .toFile(file);
  if (previewDir) {
    await writeFile(join(previewDir, `${piece.name}.png`), png);
    await writeFile(join(previewDir, `${piece.name}.svg`), svg);
  }
  const ms = Math.round(performance.now() - t0);
  console.log(`✓ ${piece.name.padEnd(14)} ${String(ms).padStart(5)} ms  → assets/art/${piece.name}.webp`);
}
