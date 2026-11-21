// Registry of every painting rendered by render.mjs.
import { heroSvg, heroFgSvg, W as HW, H as HH } from "./hero.mjs";
import { envelopeSvg, paperSvg, W as EW, H as EH } from "./envelope.mjs";
import { cardSvg, CARD, sprigSvg, SPRIG, cloudsSvg, CLOUDS, tileSvg, TILE, ribbonsSvg, RIBBONS } from "./small.mjs";
import { frameSvg, FRAME } from "./frame.mjs";
import { fountainSvg, FOUNTAIN } from "./fountain.mjs";
import { estateSvg, ESTATE } from "./estate.mjs";
import { iconSvg, ICON, ICON_NAMES } from "./icons.mjs";
import { stripSvg, STRIP, bowSvg, BOW } from "./ribbon.mjs";

export const pieces = [
  { name: "hero", width: HW, height: HH, outWidth: 1000, svg: heroSvg, quality: 78 },
  { name: "hero-fg", width: HW, height: HH, outWidth: 1000, svg: heroFgSvg, quality: 82 },
  { name: "envelope", width: EW, height: EH, outWidth: 1000, svg: envelopeSvg, quality: 78 },
  { name: "paper", width: 600, height: 600, svg: paperSvg, quality: 82 },
  { name: "card", width: CARD.W, height: CARD.H, svg: cardSvg, quality: 84 },
  { name: "sprig", width: SPRIG.W, height: SPRIG.H, svg: sprigSvg, quality: 88 },
  { name: "story-clouds", width: CLOUDS.W, height: CLOUDS.H, svg: cloudsSvg, quality: 82 },
  { name: "tile", width: TILE.W, height: TILE.H, outWidth: 800, svg: tileSvg, quality: 84 },
  { name: "ribbons", width: RIBBONS.W, height: RIBBONS.H, svg: ribbonsSvg, quality: 80 },
  { name: "frame", width: FRAME.W, height: FRAME.H, svg: frameSvg, quality: 82 },
  { name: "fountain", width: FOUNTAIN.W, height: FOUNTAIN.H, svg: fountainSvg, quality: 80 },
  { name: "estate", width: ESTATE.W, height: ESTATE.H, svg: estateSvg, quality: 80 },
  { name: "ribbon", width: STRIP.W, height: STRIP.H, svg: stripSvg, quality: 86 },
  { name: "bow", width: BOW.W, height: BOW.H, svg: bowSvg, quality: 88 },
  ...ICON_NAMES.map((n) => ({ name: `icon-${n}`, width: ICON.W, height: ICON.H, svg: () => iconSvg(n), quality: 88 })),
];
