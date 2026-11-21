// A Mallorcan finca on terraced grounds, painted as a free-standing cut-out
// so it can straddle the dark-green / ivory section boundary.
import { blobPath, bush, cypress, dabsInEllipse, dabsInRect, impastoFilter, makeRng, paint, path, poly, smoothClosed, svgDoc } from "./lib.mjs";

export const ESTATE = { W: 1000, H: 640 };

const WALL = ["#efe3cc", "#e8d9bd", "#f3eadb", "#e2d0b2", "#ecd9c0"];
const WALL_SHADE = ["#c9b595", "#bba78a", "#b7a99a", "#c2ae90"];
const ROOF = ["#c07a5b", "#b06c50", "#cc8b6b", "#a96248"];
const OLIVE = ["#8e9c6e", "#a3ad80", "#7d8c62", "#b2b98f", "#94a074"];
const OLIVE_LIGHT = ["#c9cda4", "#d3d6b2", "#bcc497"];
const OLIVE_DARK = ["#5b6a45", "#4e5d3c", "#66734c"];

function building(r, x, y, w, h, { roofH = 26, tower = false } = {}) {
  let out = "";
  out += path(poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]), paint(r, WALL));
  out += dabsInRect(r, { x, y, width: w, height: h, count: Math.round((w * h) / 22), palette: WALL, len: [5, 12], w: [3, 6], angle: Math.PI / 2, angJitter: 0.8, ridge: 0.25, shadow: 0.15 });
  const sw = Math.min(40, w * 0.22);
  out += path(poly([[x + w - sw, y], [x + w, y], [x + w, y + h], [x + w - sw, y + h]]), paint(r, WALL_SHADE), 'opacity="0.85"');
  out += path(poly([[x - 5, y + 2], [x + 14, y - roofH], [x + w - 14, y - roofH], [x + w + 5, y + 2]]), paint(r, ROOF));
  out += dabsInRect(r, { x: x + 8, y: y - roofH + 2, width: w - 16, height: roofH - 2, count: Math.round(w / 1.6), palette: ROOF, len: [6, 12], w: [2, 4], angle: 0.05, angJitter: 0.2, ridge: 0.2, shadow: 0.1 });
  const cols = Math.max(2, Math.round(w / 28));
  const rows = Math.max(1, Math.round(h / 36));
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const wx = x + (i + 0.5) * (w / cols) - 4;
      const wy = y + (j + 0.3) * (h / rows);
      out += path(poly([[wx, wy], [wx + 8, wy], [wx + 8, wy + 13], [wx, wy + 13]]), paint(r, ["#5f5047", "#6d5c52", "#544740"]));
    }
  }
  if (tower) {
    const tx = x + w * 0.12;
    const tw = 62;
    const th = 92;
    out += path(poly([[tx, y - roofH - th + 20], [tx + tw, y - roofH - th + 20], [tx + tw, y + 4], [tx, y + 4]]), paint(r, WALL));
    out += dabsInRect(r, { x: tx, y: y - roofH - th + 20, width: tw, height: th + roofH - 16, count: 160, palette: WALL, len: [5, 10], w: [3, 5], angle: Math.PI / 2, angJitter: 0.8 });
    out += path(poly([[tx + tw - 14, y - roofH - th + 20], [tx + tw, y - roofH - th + 20], [tx + tw, y + 4], [tx + tw - 14, y + 4]]), paint(r, WALL_SHADE), 'opacity="0.85"');
    for (let i = 0; i < 4; i++) {
      const mx = tx - 3 + i * ((tw + 6) / 3.3);
      out += path(poly([[mx, y - roofH - th + 20], [mx, y - roofH - th + 6], [mx + 11, y - roofH - th + 6], [mx + 11, y - roofH - th + 20]]), paint(r, WALL));
    }
    out += path(poly([[tx + 24, y - roofH - th + 44], [tx + 36, y - roofH - th + 44], [tx + 36, y - roofH - th + 64], [tx + 24, y - roofH - th + 64]]), "#5f5047");
  }
  return out;
}

export function estateSvg() {
  const { W, H } = ESTATE;
  const r = makeRng(2027);
  let defs = impastoFilter("paint", W, H, { relief: 2.3, warp: 4.5, seed: 17 });
  let body = "";

  // background tree line along the top silhouette
  for (let x = 20; x < 1000; x += r.range(40, 70)) {
    const y = 230 + Math.sin(x / 120) * 25 + r.range(-10, 10);
    body += bush(r, x, y, r.range(40, 60), r.range(30, 46), { palette: OLIVE_DARK.concat(["#55654a"]), light: OLIVE, dark: ["#3f4d33", "#36432d"] });
  }
  body += cypress(r, 220, 260, 190, 34);
  body += cypress(r, 600, 250, 170, 30);
  body += cypress(r, 650, 262, 150, 28);
  body += cypress(r, 880, 300, 140, 28);

  // ground mass
  const groundPts = [
    [-20, 270],
    [150, 250],
    [330, 262],
    [520, 255],
    [720, 280],
    [900, 300],
    [1020, 320],
    [1020, 560],
    [880, 590],
    [700, 575],
    [520, 600],
    [330, 580],
    [150, 600],
    [-20, 570],
  ];
  body += path(smoothClosed(groundPts, 0.6), "#6f7a4f");
  defs += `<clipPath id="ground"><path d="${smoothClosed(groundPts, 0.6)}"/></clipPath>`;
  let ground = dabsInRect(r, { x: -20, y: 240, width: 1040, height: 380, count: 4200, palette: ["#7d8a55", "#8f9a62", "#6c7a4a", "#a3a36f", "#b39f77", "#9a8a66"], len: [8, 18], w: [4, 9], angle: 0, angJitter: 0.7 });
  // terraces (stone walls)
  for (const [y, x0, x1] of [[372, 120, 900], [430, 60, 960], [500, 0, 1000]]) {
    ground += path(poly([[x0, y], [x1, y + 6], [x1, y + 16], [x0, y + 10]]), "#d6c4a2");
    ground += dabsInRect(r, { x: x0, y, width: x1 - x0, height: 14, count: Math.round((x1 - x0) / 4), palette: ["#dccaa8", "#cdb994", "#e6d7bb", "#bfa983"], len: [8, 16], w: [3, 6], angle: 0.01, angJitter: 0.1, ridge: 0.2, shadow: 0.1 });
  }
  body += `<g clip-path="url(#ground)">${ground}</g>`;

  // buildings
  body += building(r, 250, 190, 300, 135, { roofH: 30, tower: true });
  body += building(r, 550, 245, 130, 90, { roofH: 22 });
  body += building(r, 690, 280, 150, 85, { roofH: 22 });
  body += building(r, 860, 315, 110, 70, { roofH: 18 });
  body += building(r, 80, 300, 120, 70, { roofH: 18 });

  // pool
  const pool = [[400, 452], [640, 452], [665, 488], [378, 488]];
  body += path(poly(pool), "#efe6d6");
  body += path(poly([[408, 457], [633, 457], [654, 483], [388, 483]]), "#86c0cf");
  body += dabsInRect(r, { x: 395, y: 459, width: 255, height: 22, count: 90, palette: ["#8fc7d6", "#a9d6e0", "#73b2c4", "#c4e4ea"], len: [10, 22], w: [3, 5], angle: 0, angJitter: 0.08, ridge: 0.2, shadow: 0.05 });

  // olive groves on the terraces
  for (let i = 0; i < 46; i++) {
    const x = r.range(0, 1000);
    const y = r.range(340, 590);
    if (x > 380 && x < 670 && y > 440 && y < 500) continue;
    body += bush(r, x, y, r.range(18, 34), r.range(14, 24), { palette: OLIVE, light: OLIVE_LIGHT, dark: OLIVE_DARK });
  }
  body += cypress(r, 360, 470, 120, 22);
  body += cypress(r, 700, 470, 110, 20);
  // hanging foreground trees making an irregular bottom edge
  for (let x = 10; x < 1000; x += r.range(50, 80)) {
    const y = 585 + r.range(-10, 18);
    body += bush(r, x, y, r.range(36, 56), r.range(24, 38), { palette: OLIVE_DARK.concat(OLIVE), light: OLIVE_LIGHT, dark: ["#3f4d33", "#36432d"] });
  }
  body += dabsInEllipse(r, { cx: 500, cy: 560, rx: 480, ry: 40, count: 120, palette: ["#d66f8c", "#e48aa2", "#f0b4c2", "#fbf2ee"], len: [5, 10], w: [3, 6], angle: 0, angJitter: Math.PI });
  return svgDoc(W, H, defs, `<g filter="url(#paint)">${body}</g>`);
}

export { blobPath };
