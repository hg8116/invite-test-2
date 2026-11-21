// Envelope face: a coastal village painted directly onto textured cotton
// paper, a flowering branch in the corner and gulls in the (unpainted) sky.
// The site cuts this single painting into the flap and the two pocket
// halves, so the composition is continuous across the seams.
import { blossom, cypress, dabsInEllipse, dabsInRect, impastoFilter, knife, makeRng, paint, paperFilter, path, poly, smoothClosed, svgDoc } from "./lib.mjs";
import { floweringBranch, gull, ridge, rock, sea, bush } from "./scenes.mjs";

export const W = 1000;
export const H = 2000;

const PASTELS = ["#f2e7d2", "#f3c9a8", "#ecb7aa", "#f0dc9f", "#f6f1e6", "#eed3c0", "#e9c3b3"];
const ROOFS = ["#c47b5c", "#b86e52", "#d08d6b", "#a9614a"];

function house(r, x, y, w, h, { color, roof = true, flat = false }) {
  // x,y = top-left of front face
  let out = "";
  const shade = "#b9a48e";
  out += path(poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]), color);
  out += dabsInRect(r, { x, y, width: w, height: h, count: Math.round((w * h) / 30), palette: [color, color, "#fff6ea"], len: [5, 12], w: [3, 6], angle: Math.PI / 2, angJitter: 0.8, ridge: 0.25, shadow: 0.15, j: { l: 0.03 } });
  // side (shaded) face
  const sw = w * 0.28;
  out += path(poly([[x + w, y], [x + w + sw, y - sw * 0.35], [x + w + sw, y + h - sw * 0.35], [x + w, y + h]]), shade, 'opacity="0.9"');
  if (roof && !flat) {
    out += path(poly([[x - 4, y + 2], [x + w * 0.5, y - h * 0.32], [x + w + 4, y + 2]]), paint(r, ROOFS));
    out += dabsInEllipse(r, { cx: x + w * 0.5, cy: y - h * 0.1, rx: w * 0.35, ry: h * 0.12, count: Math.round(w / 3), palette: ROOFS, len: [5, 10], w: [2, 4], angle: 0, angJitter: 0.4, ridge: 0.2, shadow: 0.1 });
  } else {
    out += path(poly([[x - 3, y - 4], [x + w + 3, y - 4], [x + w + sw + 2, y - sw * 0.35 - 4], [x + w + sw + 2, y - sw * 0.35], [x + w, y], [x - 3, y]]), "#efe6d8");
  }
  // windows
  const cols = Math.max(1, Math.round(w / 26));
  const rows = Math.max(1, Math.round(h / 34));
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (r.chance(0.2)) continue;
      const wx = x + (i + 0.5) * (w / cols) - 4;
      const wy = y + (j + 0.35) * (h / rows);
      out += path(poly([[wx, wy], [wx + 8, wy], [wx + 8, wy + 12], [wx, wy + 12]]), paint(r, ["#5a4a44", "#6b5850", "#4b3f3a"]));
    }
  }
  return out;
}

function belltower(r, x, y, s) {
  let out = "";
  out += path(poly([[x, y], [x + 46 * s, y], [x + 46 * s, y + 160 * s], [x, y + 160 * s]]), "#f0e2c6");
  out += dabsInRect(r, { x, y, width: 46 * s, height: 160 * s, count: 90, palette: ["#f0e2c6", "#e7d3b2", "#f6ecd9"], len: [5, 11], w: [3, 6], angle: Math.PI / 2, angJitter: 0.6, ridge: 0.25 });
  out += path(poly([[x + 32 * s, y], [x + 46 * s, y], [x + 46 * s, y + 160 * s], [x + 32 * s, y + 160 * s]]), "#c2ab8b", 'opacity="0.8"');
  // dome
  out += path(`M${x - 4 * s} ${y}Q${x + 23 * s} ${y - 70 * s} ${x + 50 * s} ${y}Z`, "#d9a57c");
  out += dabsInEllipse(r, { cx: x + 22 * s, cy: y - 18 * s, rx: 20 * s, ry: 14 * s, count: 30, palette: ["#e3b48a", "#c98d66", "#f0c79f"], len: [5, 10], w: [3, 5], angle: 0, angJitter: 1.2 });
  // arched openings
  for (const oy of [30, 90]) {
    out += path(`M${x + 14 * s} ${y + (oy + 26) * s}L${x + 14 * s} ${y + (oy + 8) * s}Q${x + 23 * s} ${y + oy * s} ${x + 32 * s} ${y + (oy + 8) * s}L${x + 32 * s} ${y + (oy + 26) * s}Z`, "#5a4a44");
  }
  return out;
}

export function envelopeSvg() {
  const r = makeRng(1207);
  let defs = "";
  defs += paperFilter("paper", W, H, { freq: 0.009, fine: 0.55, relief: 3.2, coarse: 0.85, fineAmt: 0.3, seed: 21 });
  defs += impastoFilter("paint", W, H, { relief: 2.6, warp: 6, seed: 9 });

  let paper = `<rect width="${W}" height="${H}" fill="#ece6e3"/>`;
  let body = "";

  // --- distant mountains behind the village ---------------------------
  const far = ridge(
    r,
    [
      [-10, 830],
      [90, 790],
      [200, 760],
      [300, 775],
      [420, 820],
      [520, 900],
    ],
    1050,
    { palette: ["#6d80b8", "#5f73ad", "#7b8ec2", "#5568a2"], light: ["#a3b0da", "#b4bde2"], lightSide: -1 },
  );
  defs += far.defs;
  body += far.svg;

  // --- big cliff (centre-right) --------------------------------------
  const cliffPts = [
    [380, 900],
    [470, 760],
    [560, 690],
    [640, 640],
    [700, 660],
    [760, 740],
    [820, 860],
    [870, 990],
    [880, 1060],
    [380, 1060],
  ];
  body += path(smoothClosed(cliffPts, 0.55), "#3e5878");
  defs += `<clipPath id="cliff"><path d="${smoothClosed(cliffPts, 0.55)}"/></clipPath>`;
  let cliff = "";
  cliff += dabsInRect(r, { x: 380, y: 630, width: 500, height: 430, count: 900, palette: ["#3e5878", "#4d6a8b", "#344d6b", "#5a7898", "#2f465f"], len: [10, 24], w: [5, 10], angle: -0.9, angJitter: 0.5 });
  // sunlit ochre faces on the sea side
  cliff += dabsInEllipse(r, { cx: 760, cy: 880, rx: 110, ry: 140, count: 380, palette: ["#c9a57d", "#b88f6a", "#d8bd98", "#e2c9a6", "#a97f5f"], len: [8, 20], w: [4, 9], angle: 1.2, angJitter: 0.5 });
  // greenery on the top
  cliff += dabsInEllipse(r, { cx: 600, cy: 720, rx: 150, ry: 70, count: 260, palette: ["#4f6b45", "#5f7d4f", "#3f5a3a", "#6f8c5a"], len: [7, 14], w: [4, 8], angle: 0, angJitter: Math.PI });
  // light ridge highlights
  cliff += dabsInEllipse(r, { cx: 560, cy: 720, rx: 110, ry: 40, count: 90, palette: ["#8fa6c8", "#a7b9d6", "#c6cfe0"], len: [8, 18], w: [3, 6], angle: -0.5, angJitter: 0.4 });
  body += `<g clip-path="url(#cliff)">${cliff}</g>`;

  // --- sea -------------------------------------------------------------
  const seaTop = 990;
  body += path(poly([[300, seaTop], [W, seaTop], [W, H], [300, H]]), "#2c4fb2");
  body += sea(r, { x: 300, y: seaTop, w: 700, h: H - seaTop, density: 1.2 });
  body += dabsInEllipse(r, { cx: 930, cy: seaTop + 4, rx: 90, ry: 5, count: 30, palette: ["#b8c6ee", "#c7d2f2"], len: [16, 30], w: [3, 5], angle: 0, angJitter: 0.05 });
  // sailboats
  for (const [bx, by, s] of [[830, 1130, 1], [790, 1350, 1.2], [905, 1520, 0.8]]) {
    body += path(poly([[bx, by - 40 * s], [bx, by], [bx + 22 * s, by]]), "#fbf7ef");
    body += path(poly([[bx - 3 * s, by - 30 * s], [bx - 3 * s, by], [bx - 16 * s, by]]), "#e6e0d6");
    body += path(poly([[bx - 18 * s, by + 2], [bx + 24 * s, by + 2], [bx + 18 * s, by + 8 * s], [bx - 13 * s, by + 8 * s]]), "#f5efe6");
    body += dabsInEllipse(r, { cx: bx + 3, cy: by + 10 * s, rx: 26 * s, ry: 3, count: 10, palette: ["#ffffff", "#e4ebf8"], len: [8, 16], w: [2, 4], angle: 0, angJitter: 0.1 });
  }

  // --- village hillside (left) ---------------------------------------
  const hillPts = [
    [-20, 860],
    [120, 840],
    [260, 880],
    [380, 950],
    [470, 1050],
    [540, 1200],
    [590, 1380],
    [600, 1600],
    [640, 1800],
    [700, 2020],
    [-20, 2020],
  ];
  body += path(smoothClosed(hillPts, 0.5), "#6f6a4a");
  defs += `<clipPath id="hill"><path d="${smoothClosed(hillPts, 0.5)}"/></clipPath>`;
  let hill = "";
  hill += dabsInRect(r, { x: -20, y: 840, width: 720, height: 1180, count: 3600, palette: ["#6f7f45", "#5e7040", "#829355", "#4d6138", "#8a7a5a", "#a58d6a"], len: [8, 18], w: [5, 10], angle: 0, angJitter: Math.PI });
  // rocks along the shoreline
  hill += dabsInEllipse(r, { cx: 560, cy: 1500, rx: 70, ry: 520, count: 700, palette: ["#c79b7c", "#b48468", "#d9b597", "#a5755f", "#8f6a55"], len: [10, 22], w: [5, 10], angle: 1.4, angJitter: 0.5 });
  body += `<g clip-path="url(#hill)">${hill}</g>`;

  // houses: scattered along the slope, back (small) to front (large)
  let houses = "";
  const rightEdge = (y) => Math.min(560, 300 + (y - 860) * 0.42);
  for (let y = 860; y < 1760; ) {
    const s = 0.5 + ((y - 860) / 900) * 0.95;
    let x = -30 + r.range(0, 40) * s;
    while (x < rightEdge(y)) {
      if (r.chance(0.22)) {
        // vegetation instead of a house
        houses += bush(r, x + 25 * s, y - 8 * s, r.range(18, 30) * s, r.range(12, 20) * s);
        x += r.range(30, 55) * s;
        continue;
      }
      const w = r.range(42, 92) * s;
      const h = r.range(34, 70) * s;
      const yy = y + r.range(-14, 14) * s - h;
      houses += house(r, x, yy, w, h, { color: paint(r, PASTELS, { l: 0.03 }), flat: r.chance(0.5) });
      if (r.chance(0.3)) {
        houses += dabsInEllipse(r, { cx: x + w * r.range(0.2, 0.8), cy: yy + h * 0.95, rx: 16 * s, ry: 8 * s, count: 16, palette: r.chance(0.5) ? ["#d96a95", "#e889ad", "#c9507e"] : ["#5f7d4f", "#4d6b45", "#7a9660"], len: [5, 10], w: [3, 6], angle: 0, angJitter: Math.PI });
      }
      x += w * r.range(1.05, 1.45);
      if (r.chance(0.18)) {
        houses += cypress(r, x - w * 0.05, y + 6 * s, r.range(80, 140) * s, 20 * s);
        x += 10 * s;
      }
    }
    y += r.range(70, 95) * s;
  }
  body += houses;
  body += belltower(r, 200, 740, 1);

  // rocks + foam at the shore
  body += rock(r, 640, 1250, 60, 40);
  body += rock(r, 700, 1620, 70, 36);
  body += rock(r, 980, 1720, 90, 60);
  body += bush(r, 960, 1640, 60, 40);
  body += cypress(r, 930, 1690, 150, 28);

  // --- foreground blossoms (bottom-left) -------------------------------
  let fg = "";
  for (let i = 0; i < 30; i++) {
    const y = r.range(1250, 2000);
    const x = r.range(-20, 180 + (y - 1250) * 0.25);
    fg += knife(x, y, r.range(60, 110), r.range(22, 34), r.range(0, Math.PI * 2), paint(r, ["#30503a", "#3b5e44", "#24402e", "#4c7052"]), { ridge: 0.35 });
  }
  for (let i = 0; i < 16; i++) {
    const y = r.range(1300, 2000);
    const x = r.range(-10, 150 + (y - 1300) * 0.22);
    fg += blossom(r, x, y, r.range(55, 80), { squash: r.range(0.75, 1) });
  }
  body += fg;

  // --- flowering branch top-left -------------------------------------
  body += floweringBranch(r, [[-30, 30], [100, 100], [230, 160], [360, 210], [500, 250]], { clusters: [0.25, 0.6, 0.95] });
  body += floweringBranch(r, [[30, 50], [110, 190], [140, 350], [110, 520], [60, 700]], { clusters: [0.2, 0.55, 0.85] });
  body += floweringBranch(r, [[200, 150], [280, 270], [330, 390]], { clusters: [0.7, 1] });

  body += gull(862, 590, 20, "#4a4f5d");
  body += gull(910, 632, 15, "#4a4f5d");

  return svgDoc(W, H, defs, `<g filter="url(#paper)">${paper}</g><g filter="url(#paint)">${body}</g>`);
}

/** Tileable handmade-paper texture (used for the flap lining & cards). */
export function paperSvg() {
  const S = 600;
  const defs = `<filter id="p" filterUnits="userSpaceOnUse" x="0" y="0" width="${S}" height="${S}" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.0125" numOctaves="4" seed="5" stitchTiles="stitch" result="n1"/>
<feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="6" stitchTiles="stitch" result="n2"/>
<feComposite in="n1" in2="n2" operator="arithmetic" k2="0.8" k3="0.3" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="ha"/>
<feDiffuseLighting in="ha" surfaceScale="2.2" diffuseConstant="1.17" lighting-color="#ffffff" result="dl"><feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting>
<feBlend in="SourceGraphic" in2="dl" mode="multiply"/>
</filter>`;
  return svgDoc(S, S, defs, `<rect width="${S}" height="${S}" fill="#f1ece6" filter="url(#p)"/>`);
}
