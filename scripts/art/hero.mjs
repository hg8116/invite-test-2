// Hero painting: impasto sky with clouds over a deep-blue sea, a stone villa
// with a tower on a green headland and a flowering branch. It is rendered as
// two layers so the villa and the branch can sit *in front of* the
// torn-paper card (rendered separately), exactly like a collage:
//   hero.webp     — complete painting (background)
//   hero-fg.webp  — only the foreground elements, transparent elsewhere
import { impastoFilter, makeRng, svgDoc } from "./lib.mjs";
import {
  bush,
  clouds,
  cypress,
  floweringBranch,
  greenHill,
  gull,
  ridge,
  rock,
  sea,
  skyDabs,
  skyGradient,
  stoneWall,
  villa,
  dabsInEllipse,
} from "./scenes.mjs";

export const W = 1000;
export const H = 2000;

// Vertical offset of the headland so the tower stays clear of the card text.
const DY = 95;

let cache = null;

function build() {
  if (cache) return cache;
  let defs = "";

  // ---------------- background ---------------------------------------
  const r = makeRng(20270727);
  defs += skyGradient("sky", [
    [0, "#3a5dc2"],
    [0.35, "#5378d4"],
    [0.62, "#7f9de0"],
    [0.7, "#a7b9ea"],
  ]);
  let bg = "";
  bg += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  bg += skyDabs(r, 0, 0, W, 1460, 1500);
  const cloudList = [
    [640, 80, 300, 105],
    [180, 300, 150, 70],
    [820, 330, 240, 110],
    [470, 300, 200, 80],
    [960, 600, 150, 120],
    [520, 640, 320, 140],
    [60, 700, 140, 80],
    [930, 900, 150, 120],
    [470, 1000, 330, 150],
    [70, 1050, 140, 90],
    [940, 1180, 150, 90],
    [480, 1300, 300, 110],
    [130, 1310, 150, 70],
  ];
  bg += clouds(r, cloudList);
  const puffs = [];
  for (let i = 0; i < 10; i++) {
    const side = r.chance(0.5);
    puffs.push([side ? r.range(0, 150) : r.range(850, 1000), r.range(150, 1300), r.range(50, 85), r.range(30, 50)]);
  }
  bg += clouds(r, puffs);

  const mtn = ridge(
    r,
    [
      [600, 1440],
      [680, 1390],
      [760, 1350],
      [830, 1310],
      [880, 1302],
      [940, 1325],
      [1000, 1295],
    ],
    1445,
    { palette: ["#8f8dc0", "#8287bd", "#7c7db3", "#9a95c4"], light: ["#c3bde0", "#b7b3db", "#d5cbe5"], lightSide: -1 },
  );
  defs += mtn.defs;
  bg += mtn.svg;

  const seaTop = 1438;
  bg += `<rect x="0" y="${seaTop}" width="${W}" height="${H - seaTop}" fill="#2c4fb2"/>`;
  bg += sea(r, { y: seaTop, w: W, h: H - seaTop, density: 1.15 });
  bg += dabsInEllipse(r, { cx: 800, cy: seaTop + 4, rx: 260, ry: 6, count: 60, palette: ["#b8c6ee", "#c7d2f2", "#a5b6e8"], len: [20, 40], w: [3, 5], angle: 0, angJitter: 0.05 });
  bg += rock(r, 860, 1570, 95, 42);
  bg += rock(r, 975, 1615, 70, 70);
  bg += rock(r, 770, 1645, 45, 22);
  bg += rock(r, 925, 1740, 55, 30);
  bg += gull(872, 820, 20, "#3f4556");
  bg += gull(925, 868, 15, "#3f4556");
  bg += gull(842, 895, 11, "#3f4556");

  // ---------------- foreground: headland + villa ----------------------
  const rf = makeRng(4711);
  let land = "";
  const hill = greenHill(rf, [
    [-20, 1330 + DY],
    [120, 1350 + DY],
    [300, 1405 + DY],
    [470, 1470 + DY],
    [600, 1560 + DY],
    [690, 1690 + DY],
    [740, 1830 + DY],
    [770, 2020 + DY],
    [-20, 2020 + DY],
  ]);
  defs += hill.defs;
  land += cypress(rf, 62, 1470 + DY, 360, 50);
  land += cypress(rf, 128, 1460 + DY, 290, 42);
  land += cypress(rf, 30, 1520 + DY, 250, 40);
  land += hill.svg;
  land += villa(rf, 40, 1610 + DY, 1);
  land += cypress(rf, 470, 1560 + DY, 200, 34);
  land += stoneWall(rf, 110, 1640 + DY, 520, 80);
  land += cypress(rf, 600, 1680 + DY, 210, 34);
  land += cypress(rf, 652, 1730 + DY, 170, 30);
  const bushes = [
    [60, 1660, 70, 45],
    [190, 1700, 60, 36],
    [330, 1760, 90, 48],
    [520, 1780, 80, 46],
    [650, 1830, 60, 40],
    [80, 1800, 90, 55],
    [250, 1860, 100, 55],
    [460, 1900, 110, 60],
    [640, 1950, 80, 50],
    [120, 1960, 120, 60],
    [360, 1990, 120, 50],
  ];
  for (const [x, y, rx, ry] of bushes) land += bush(rf, x, y + DY * 0.6, rx, ry);
  land += cypress(rf, 715, 1990, 230, 36);

  // ---------------- foreground: flowering branch ------------------------
  const rb = makeRng(99);
  let branch = "";
  branch += floweringBranch(rb, [[-30, 40], [110, 120], [250, 190], [390, 250], [530, 300]], { clusters: [0.3, 0.62, 0.95] });
  branch += floweringBranch(rb, [[40, 60], [120, 200], [150, 360], [130, 540], [80, 720], [30, 900]], { clusters: [0.2, 0.5, 0.78] });
  branch += floweringBranch(rb, [[200, 160], [265, 260], [315, 365]], { clusters: [0.6, 1] });
  branch += floweringBranch(rb, [[-20, 300], [40, 400], [70, 500]], { clusters: [0.9] });

  cache = { defs, bg, fg: land + branch };
  return cache;
}

export function heroSvg() {
  const { defs, bg, fg } = build();
  return svgDoc(W, H, defs + impastoFilter("paint", W, H, { relief: 2.6, warp: 4, seed: 7 }), `<g filter="url(#paint)">${bg}${fg}</g>`);
}

export function heroFgSvg() {
  const { defs, fg } = build();
  return svgDoc(W, H, defs + impastoFilter("paint", W, H, { relief: 2.6, warp: 4, seed: 7 }), `<g filter="url(#paint)">${fg}</g>`);
}
