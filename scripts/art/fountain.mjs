// Formal garden with a long water channel, arching jets and a round basin.
// The top is transparent (sky = page background) and the bottom melts into
// the dark green of the "Celebration" section.
import { blobPath, dabsInEllipse, dabsInRect, f, impastoFilter, knife, makeRng, paint, path, poly, smoothClosed, svgDoc, lerp, bush } from "./lib.mjs";

export const FOUNTAIN = { W: 1000, H: 1100 };
export const DARK_GREEN = "#26332b";

const GREENS = ["#2f4a35", "#3a5a40", "#2a4130", "#46684a", "#355238"];
const GREEN_LIGHT = ["#6f8f62", "#83a06e", "#9bb27e", "#5e7f55"];
const GREEN_DARK = ["#1f3125", "#22382a", "#1a2b20"];
const STONE = ["#e6dac6", "#d9cab1", "#efe5d4", "#cdbd9f", "#e9dccb"];
const WATER = ["#7fa3b8", "#6b93ad", "#9dbccb", "#5d86a3", "#b5cfd8", "#86a9bd"];

function topiary(r, x, baseY, h, w) {
  let out = "";
  const top = baseY - h;
  const pts = [];
  const n = 10;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const yy = top + t * h;
    const round = t < 0.12 ? Math.sin((t / 0.12) * Math.PI * 0.5) : 1;
    pts.push([x + (w / 2) * round * r.range(0.92, 1.06) * (1 + t * 0.08), yy]);
  }
  const left = pts.map(([px, py]) => [x - (px - x), py]).reverse();
  const shape = smoothClosed([[x, top - 4], ...pts, ...left], 0.8);
  out += path(shape, paint(r, GREEN_DARK));
  const count = Math.round((h * w) / 30);
  for (let i = 0; i < count; i++) {
    const t = Math.pow(r(), 0.8);
    const yy = top + t * h;
    const u = r.range(-1, 1);
    const xx = x + u * (w / 2) * 0.95 * (t < 0.12 ? Math.sin((t / 0.12) * Math.PI * 0.5) : 1);
    const pal = u < -0.3 ? (r.chance(0.65) ? GREEN_LIGHT : GREENS) : u > 0.5 ? GREEN_DARK : GREENS;
    out += knife(xx, yy, r.range(10, 22), r.range(5, 9), Math.PI / 2 + u * 0.7 + r.range(-0.4, 0.4), paint(r, pal, { l: 0.03 }), { ridge: 0.3, shadow: 0.2 });
  }
  return out;
}

function roseBush(r, cx, cy, rx, ry) {
  let out = bush(r, cx, cy, rx, ry, { palette: GREENS, light: GREEN_LIGHT, dark: GREEN_DARK, density: 0.9 });
  const roses = Math.round((rx * ry) / 650);
  for (let i = 0; i < roses; i++) {
    const a = r() * Math.PI * 2;
    const t = Math.sqrt(r()) * 0.9;
    const x = cx + Math.cos(a) * rx * t;
    const y = cy + Math.sin(a) * ry * t;
    const s = r.range(9, 17);
    const pal = r.pick([
      ["#f2c4cf", "#e79aab", "#fbe3e8"],
      ["#fbf3ee", "#efdcd8", "#ffffff"],
      ["#e48aa0", "#cf6c86", "#f3b3c2"],
    ]);
    out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(s)}" fill="${pal[1]}"/>`;
    for (let k = 0; k < 4; k++) {
      const aa = r.range(0, Math.PI * 2);
      out += knife(x + Math.cos(aa) * s * 0.35, y + Math.sin(aa) * s * 0.35, s * 1.1, s * 0.45, aa + Math.PI / 2, paint(r, pal), { ridge: 0.35, shadow: 0.2 });
    }
  }
  return out;
}

function jet(x0, y0, x1, y1, h, op = 0.85) {
  const cx = (x0 + x1) / 2;
  const cy = Math.min(y0, y1) - h;
  return (
    `<path d="M${f(x0)} ${f(y0)}Q${f(cx)} ${f(cy)} ${f(x1)} ${f(y1)}" fill="none" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" opacity="${op}"/>` +
    `<path d="M${f(x0)} ${f(y0)}Q${f(cx)} ${f(cy)} ${f(x1)} ${f(y1)}" fill="none" stroke="#dfeef4" stroke-width="7" stroke-linecap="round" opacity="${f(op * 0.25)}"/>`
  );
}

export function fountainSvg() {
  const { W, H } = FOUNTAIN;
  const r = makeRng(1789);
  let defs = impastoFilter("paint", W, H, { relief: 2.4, warp: 5, seed: 14 });
  defs += `<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${DARK_GREEN}" stop-opacity="0"/><stop offset="0.55" stop-color="${DARK_GREEN}" stop-opacity="0.85"/><stop offset="1" stop-color="${DARK_GREEN}"/></linearGradient>`;
  let body = "";
  const VP = [500, 430];

  // --- ground plane (below the horizon) -------------------------------
  const ground = [[-20, 470], [1020, 470], [1020, 1110], [-20, 1110]];
  body += path(poly(ground), "#3c5a3f");
  body += dabsInRect(r, { x: -20, y: 460, width: 1040, height: 650, count: 2600, palette: ["#4f7350", "#5f8260", "#45664a", "#6e8f67"], len: [10, 22], w: [5, 9], angle: 0, angJitter: 0.5 });

  // far hedge at the end of the vista
  body += dabsInEllipse(r, { cx: 500, cy: 440, rx: 120, ry: 26, count: 240, palette: ["#5d7b66", "#6c8a74", "#4e6a57", "#7f9a85"], len: [8, 16], w: [4, 8], angle: 0, angJitter: 1 });

  // --- paved terraces either side of the channel -----------------------
  const paveL = [[VP[0] - 26, 450], [VP[0] - 60, 450], [80, 860], [300, 860]];
  const paveR = [[VP[0] + 26, 450], [VP[0] + 60, 450], [920, 860], [700, 860]];
  for (const pv of [paveL, paveR]) {
    body += path(poly(pv), "#ddd0b8");
    defs += `<clipPath id="pv${pv[2][0]}"><path d="${poly(pv)}"/></clipPath>`;
    body += `<g clip-path="url(#pv${pv[2][0]})">${dabsInRect(r, { x: 60, y: 440, width: 880, height: 430, count: 900, palette: STONE, len: [10, 24], w: [4, 8], angle: 0, angJitter: 0.25 })}</g>`;
  }

  // --- water channel ----------------------------------------------------
  const chan = [[VP[0] - 22, 452], [VP[0] + 22, 452], [690, 840], [310, 840]];
  body += path(poly(chan), "#7fa3b8");
  defs += `<clipPath id="chan"><path d="${poly(chan)}"/></clipPath>`;
  body += `<g clip-path="url(#chan)">${dabsInRect(r, { x: 300, y: 450, width: 400, height: 400, count: 900, palette: WATER, len: [12, 30], w: [3, 7], angle: 0, angJitter: 0.12 })}</g>`;
  // stone rims
  body += `<path d="M${VP[0] - 22} 452L310 840" stroke="#efe6d6" stroke-width="7" fill="none"/>`;
  body += `<path d="M${VP[0] + 22} 452L690 840" stroke="#e3d7c2" stroke-width="7" fill="none"/>`;

  // low clipped hedges along the paving
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const yl = lerp(470, 820, t);
    const xl = lerp(VP[0] - 70, 120, t);
    const xr = lerp(VP[0] + 70, 880, t);
    const s = lerp(0.35, 1.1, t);
    body += path(blobPath(r, xl, yl, 34 * s, 12 * s, { irr: 0.1 }), "#3b5a3f");
    body += dabsInEllipse(r, { cx: xl, cy: yl, rx: 32 * s, ry: 11 * s, count: Math.round(30 * s), palette: GREENS.concat(GREEN_LIGHT), len: [5, 10], w: [3, 5], angle: 0, angJitter: 0.6 });
    body += path(blobPath(r, xr, yl, 34 * s, 12 * s, { irr: 0.1 }), "#3b5a3f");
    body += dabsInEllipse(r, { cx: xr, cy: yl, rx: 32 * s, ry: 11 * s, count: Math.round(30 * s), palette: GREENS.concat(GREEN_LIGHT), len: [5, 10], w: [3, 5], angle: 0, angJitter: 0.6 });
  }

  // --- topiary rows (back to front) --------------------------------------
  const rows = [
    [455, 468, 120, 36],
    [425, 482, 165, 46],
    [385, 500, 215, 58],
    [330, 524, 280, 72],
    [262, 552, 350, 86],
    [175, 590, 440, 104],
    [62, 640, 560, 126],
  ];
  for (const [x, by, h, w] of rows) {
    body += topiary(r, x, by, h, w);
    body += topiary(r, W - x, by, h, w);
  }

  // --- jets arching over the channel ------------------------------------
  let jets = "";
  for (let i = 0; i < 9; i++) {
    const t = (i + 0.6) / 9.5;
    const y = lerp(458, 830, t);
    const xl = lerp(VP[0] - 26, 300, t);
    const xr = lerp(VP[0] + 26, 700, t);
    const h = lerp(40, 150, t);
    jets += jet(xl, y, lerp(VP[0] - 4, 470, t), y - lerp(4, 10, t), h);
    jets += jet(xr, y, lerp(VP[0] + 4, 530, t), y - lerp(4, 10, t), h);
    jets += dabsInEllipse(r, { cx: VP[0] + (r.chance(0.5) ? -1 : 1) * lerp(4, 25, t), cy: y - 6, rx: lerp(6, 26, t), ry: lerp(2, 8, t), count: 6, palette: ["#ffffff", "#e8f3f7"], len: [3, 8], w: [2, 3], angle: 0, angJitter: 1, ridge: 0, shadow: 0 });
  }
  body += jets;

  // --- rose beds ---------------------------------------------------------
  body += roseBush(r, 110, 820, 170, 90);
  body += roseBush(r, 890, 820, 170, 90);
  body += roseBush(r, 250, 900, 150, 70);
  body += roseBush(r, 750, 900, 150, 70);

  // --- round basin --------------------------------------------------------
  body += `<ellipse cx="500" cy="905" rx="262" ry="70" fill="#b8a98f"/>`;
  body += dabsInEllipse(r, { cx: 500, cy: 900, rx: 255, ry: 66, count: 700, palette: STONE.concat(["#c4b498", "#b5a486"]), len: [10, 22], w: [4, 8], angle: 0, angJitter: 0.35 });
  body += `<ellipse cx="500" cy="890" rx="228" ry="50" fill="#6f97ad"/>`;
  body += dabsInEllipse(r, { cx: 500, cy: 890, rx: 220, ry: 46, count: 380, palette: WATER, len: [12, 28], w: [3, 6], angle: 0, angJitter: 0.12 });
  // basin front face
  body += `<path d="M238 905Q500 1010 762 905L762 940Q500 1050 238 940Z" fill="#cdbd9f"/>`;
  body += dabsInEllipse(r, { cx: 500, cy: 965, rx: 250, ry: 34, count: 420, palette: STONE.concat(["#bfae90"]), len: [10, 20], w: [4, 7], angle: 0, angJitter: 0.25 });
  // central spray
  body += `<path d="M500 885L500 760" stroke="#ffffff" stroke-width="5" opacity="0.9" stroke-linecap="round"/>`;
  body += dabsInEllipse(r, { cx: 500, cy: 760, rx: 40, ry: 30, count: 40, palette: ["#ffffff", "#eaf4f8", "#d6e8ef"], len: [4, 10], w: [2, 4], angle: Math.PI / 2, angJitter: 1, ridge: 0, shadow: 0 });
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + (i - 3.5) * 0.28;
    body += jet(500, 765, 500 + Math.cos(a) * 140, 880 + r.range(-4, 4), r.range(10, 30), 0.65);
  }
  body += dabsInEllipse(r, { cx: 500, cy: 882, rx: 150, ry: 16, count: 90, palette: ["#ffffff", "#e5f1f5"], len: [6, 16], w: [2, 5], angle: 0, angJitter: 0.3 });

  // flowers in front of the basin
  body += roseBush(r, 80, 1000, 190, 80);
  body += roseBush(r, 920, 1000, 190, 80);

  // ground texture under everything
  return svgDoc(W, H, defs, `<g filter="url(#paint)">${body}</g><rect x="0" y="820" width="${W}" height="${H - 820}" fill="url(#fade)"/>`);
}
