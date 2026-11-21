// Reusable scene fragments shared by several paintings (sky, sea, villa,
// blossom branches...). Each returns an SVG string.
import {
  along,
  blossom,
  blobPath,
  bud,
  bush,
  cloud,
  cypress,
  dabPath,
  dabsInEllipse,
  dabsInRect,
  f,
  gull,
  jitter,
  leaf,
  lerp,
  paint,
  path,
  poly,
  smoothClosed,
  smoothOpen,
} from "./lib.mjs";

export const BLUES = ["#3f63c6", "#4a70d0", "#3557b8", "#5f84dc", "#2c4dab", "#4568c9", "#7192e0", "#3a5cc0"];
export const SEA = ["#2b4fb3", "#2346a6", "#3a63c9", "#1d3c96", "#4b72d2", "#284aa8"];
export const LEAF = { fill: "#30503a", light: "#5f8262", dark: "#1f3427", vein: "#8fa98a" };

/* ------------------------------------------------------------------ */

export function skyGradient(id, stops) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join("")}</linearGradient>`;
}

/** Painterly blue sky texture inside a rect. */
export function skyDabs(r, x, y, w, h, count, palette = BLUES) {
  return dabsInRect(r, {
    x,
    y,
    width: w,
    height: h,
    count,
    palette,
    len: [40, 90],
    w: [13, 24],
    angle: 0,
    angJitter: 0.3,
    bend: 5,
    j: { l: 0.045, s: 0.05, h: 5 },
    ridge: 0.22,
    shadow: 0.16,
  });
}

/** Scatter clouds from a list of [cx, cy, rx, ry, opts?]. */
export function clouds(r, list, base = {}) {
  return list.map(([cx, cy, rx, ry, o]) => cloud(r, cx, cy, rx, ry, { ...base, ...(o || {}) })).join("");
}

/* ------------------------------------------------------------------ */

/** Sea surface with painterly horizontal strokes and white caps. */
export function sea(r, { x = 0, y, w, h, density = 1, caps = 0.18, palette = SEA } = {}) {
  let out = "";
  const n = Math.round(((w * h) / 120) * density);
  for (let i = 0; i < n; i++) {
    const px = x + r() * w;
    const t = r();
    const py = y + t * h;
    const scale = lerp(0.55, 1.35, t); // perspective: larger strokes nearer
    const isCap = r.chance(caps * lerp(0.6, 1.4, t));
    const fill = isCap ? paint(r, ["#eef2fb", "#dfe7f8", "#c9d6f3", "#ffffff"]) : paint(r, palette, { l: 0.04, s: 0.05 });
    out += path(
      dabPath(px, py, r.range(16, 44) * scale, r.range(3.5, 8) * scale, r.range(-0.08, 0.08), r.range(-1.5, 1.5), 0.4),
      fill,
      isCap ? `opacity="${f(r.range(0.6, 1))}"` : "",
    );
  }
  return out;
}

/** Rocky outcrop in the sea with foam at its base. */
export function rock(r, cx, cy, rx, ry, { palette = ["#c79b7c", "#b48468", "#d9b597", "#a5755f"], shade = ["#7d5a4c", "#6b4f47"], foam = true } = {}) {
  let out = "";
  const top = [];
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    top.push([cx - rx + t * rx * 2, cy - Math.sin(t * Math.PI) * ry * r.range(0.7, 1.15)]);
  }
  const shape = [...top, [cx + rx, cy + ry * 0.15], [cx - rx, cy + ry * 0.15]];
  out += path(smoothClosed(shape, 0.6), paint(r, shade));
  out += dabsInEllipse(r, { cx: cx - rx * 0.1, cy: cy - ry * 0.35, rx: rx * 0.75, ry: ry * 0.5, count: Math.round((rx * ry) / 40), palette, len: [8, 20], w: [4, 9], angle: -0.6, angJitter: 0.6 });
  out += dabsInEllipse(r, { cx: cx + rx * 0.35, cy: cy - ry * 0.1, rx: rx * 0.45, ry: ry * 0.45, count: Math.round((rx * ry) / 90), palette: shade, len: [8, 18], w: [4, 8], angle: 1, angJitter: 0.5 });
  if (foam) {
    out += dabsInEllipse(r, { cx, cy: cy + ry * 0.12, rx: rx * 1.15, ry: 9, count: Math.round(rx / 3), palette: ["#ffffff", "#eef3fb", "#dfe8f8"], len: [10, 24], w: [3, 6], angle: 0, angJitter: 0.15 });
  }
  return out;
}

/** Mountain ridge silhouette filled with painterly dabs. */
export function ridge(r, pts, baseY, { palette, light, lightSide = -1, density = 1 } = {}) {
  const shape = [...pts, [pts[pts.length - 1][0], baseY], [pts[0][0], baseY]];
  let out = path(poly(shape), paint(r, palette));
  const minX = Math.min(...pts.map((p) => p[0]));
  const maxX = Math.max(...pts.map((p) => p[0]));
  const minY = Math.min(...pts.map((p) => p[1]));
  const n = Math.round((((maxX - minX) * (baseY - minY)) / 110) * density);
  let dabs = "";
  for (let i = 0; i < n; i++) {
    const x = minX + r() * (maxX - minX);
    // height of ridge at x
    let yTop = baseY;
    for (let k = 0; k < pts.length - 1; k++) {
      if (x >= pts[k][0] && x <= pts[k + 1][0]) {
        const u = (x - pts[k][0]) / (pts[k + 1][0] - pts[k][0] || 1);
        yTop = lerp(pts[k][1], pts[k + 1][1], u);
        const slope = pts[k + 1][1] - pts[k][1];
        const y = yTop + r() * (baseY - yTop);
        const lit = (slope < 0 ? lightSide < 0 : lightSide > 0) && r.chance(0.6);
        dabs += path(dabPath(x, y, r.range(12, 30), r.range(5, 10), Math.atan2(slope, pts[k + 1][0] - pts[k][0]) + r.range(-0.4, 0.4), r.range(-2, 2)), paint(r, lit ? light : palette, { l: 0.03 }));
        break;
      }
    }
  }
  out += `<g clip-path="url(#ridgeclip-${Math.round(minX)}-${Math.round(minY)})">${dabs}</g>`;
  const clip = `<clipPath id="ridgeclip-${Math.round(minX)}-${Math.round(minY)}"><path d="${poly(shape)}"/></clipPath>`;
  return { svg: out, defs: clip };
}

/* ------------------------------------------------------------------ */

/**
 * A flowering branch: leaves alternate along the curve and clusters of
 * blossoms sit at chosen points. Returns svg string.
 */
export function floweringBranch(
  r,
  pts,
  {
    leafEvery = 22,
    leafLen = [95, 150],
    leafW = [36, 54],
    leafSpread = [0.55, 1.25],
    clusters = [0.35, 0.7, 1],
    clusterSize = [4, 7],
    flowerSize = [50, 70],
    width = 9,
    leafColors = LEAF,
    flower = {},
    budColor = null,
    droop = 0.25,
  } = {},
) {
  let back = "";
  let front = "";
  const d = smoothOpen(pts);
  back += `<path d="${d}" fill="none" stroke="#4a3d34" stroke-width="${width}" stroke-linecap="round"/>`;
  back += `<path d="${d}" fill="none" stroke="#7a6656" stroke-width="${f(width * 0.35)}" stroke-linecap="round" opacity="0.7" transform="translate(-1.2 -1.2)"/>`;
  // total length
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) total += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
  const count = Math.max(2, Math.round(total / leafEvery));
  for (let i = 0; i < count; i++) {
    const t = (i + r.range(0.1, 0.9)) / count;
    const p = along(pts, t);
    const side = i % 2 === 0 ? 1 : -1;
    const a = p.a + side * r.range(leafSpread[0], leafSpread[1]) + droop * Math.cos(p.a) * side;
    const sz = 1 - t * 0.25;
    const L = r.range(leafLen[0], leafLen[1]) * sz;
    const W = r.range(leafW[0], leafW[1]) * sz;
    const lf = leaf(r, p.x, p.y, L, W, a, { ...leafColors, edge: "#8fae8b" });
    if (r.chance(0.55)) back += lf;
    else front += lf;
  }
  // blossom clusters
  let flowers = "";
  for (const ct of clusters) {
    const p = along(pts, Math.min(1, ct));
    const n = r.int(clusterSize[0], clusterSize[1]);
    for (let k = 0; k < n; k++) {
      const s = r.range(flowerSize[0], flowerSize[1]);
      const ox = r.range(-1, 1) * s * 0.9;
      const oy = r.range(-1, 1) * s * 0.9;
      if (budColor && r.chance(0.3)) {
        flowers += bud(r, p.x + ox, p.y + oy, s * 0.5, r.range(0, Math.PI * 2), { fill: budColor });
      } else {
        flowers += blossom(r, p.x + ox, p.y + oy, s, { squash: r.range(0.75, 1), ...flower });
      }
    }
  }
  return back + front + flowers;
}

/* ------------------------------------------------------------------ */

/** Mediterranean stone villa with crenellated tower (hero bottom-left). */
export function villa(r, ox, oy, s = 1) {
  // ox, oy = anchor at bottom-left of the main house. s = scale.
  const X = (v) => ox + v * s;
  const Y = (v) => oy + v * s;
  let out = "";
  const wall = ["#ebdfc8", "#e4d5ba", "#f1e6d2", "#dccdb0", "#f0dcc4", "#e6d8c9"];
  const wallShade = ["#bfae90", "#ad9c86", "#c9b99c", "#a9a0a6", "#b7a58d"];
  const roof = ["#b9765a", "#c98a68", "#a8654c", "#d39a78"];
  const dark = "#4f453d";

  // --- main house ---
  out += path(poly([[X(0), Y(0)], [X(0), Y(-150)], [X(290), Y(-150)], [X(290), Y(0)]]), paint(r, wall));
  out += dabsInRect(r, { x: X(0), y: Y(-150), width: 290 * s, height: 150 * s, count: Math.round(420 * s), palette: wall, len: [8 * s, 18 * s], w: [4 * s, 8 * s], angle: Math.PI / 2, angJitter: 0.6 });
  // shade on the right part (side facade)
  out += path(poly([[X(215), Y(0)], [X(215), Y(-150)], [X(290), Y(-150)], [X(290), Y(0)]]), paint(r, wallShade), 'opacity="0.85"');
  out += dabsInRect(r, { x: X(215), y: Y(-150), width: 75 * s, height: 150 * s, count: Math.round(110 * s), palette: wallShade, len: [8 * s, 16 * s], w: [4 * s, 7 * s], angle: Math.PI / 2 });
  // roof
  out += path(poly([[X(-12), Y(-148)], [X(30), Y(-200)], [X(250), Y(-200)], [X(302), Y(-148)]]), paint(r, roof));
  out += dabsInRect(r, { x: X(10), y: Y(-198), width: 270 * s, height: 48 * s, count: Math.round(260 * s), palette: roof, len: [10 * s, 20 * s], w: [3 * s, 6 * s], angle: 0.1, angJitter: 0.2 });
  out += path(poly([[X(-12), Y(-148)], [X(302), Y(-148)], [X(302), Y(-141)], [X(-12), Y(-141)]]), "#7f5444", 'opacity="0.7"');
  // windows (two rows)
  for (let row = 0; row < 2; row++) {
    for (let c = 0; c < 6; c++) {
      const wx = 22 + c * 44 + (c > 4 ? 6 : 0);
      if (wx > 270) continue;
      const wy = -125 + row * 62;
      out += path(poly([[X(wx), Y(wy)], [X(wx + 16), Y(wy)], [X(wx + 16), Y(wy + 30)], [X(wx), Y(wy + 30)]]), jitter(r, dark, { l: 0.05 }));
      out += path(poly([[X(wx - 2), Y(wy + 30)], [X(wx + 18), Y(wy + 30)], [X(wx + 18), Y(wy + 34)], [X(wx - 2), Y(wy + 34)]]), "#f3ecdf", 'opacity="0.8"');
    }
  }
  // --- tower ---
  const tx = 262;
  const tw = 112;
  out += path(poly([[X(tx), Y(0)], [X(tx), Y(-265)], [X(tx + tw), Y(-265)], [X(tx + tw), Y(0)]]), paint(r, wall));
  out += dabsInRect(r, { x: X(tx), y: Y(-265), width: tw * s, height: 265 * s, count: Math.round(330 * s), palette: wall, len: [7 * s, 15 * s], w: [4 * s, 7 * s], angle: Math.PI / 2, angJitter: 0.7 });
  out += path(poly([[X(tx + tw - 26), Y(0)], [X(tx + tw - 26), Y(-265)], [X(tx + tw), Y(-265)], [X(tx + tw), Y(0)]]), paint(r, wallShade), 'opacity="0.9"');
  // crenellations
  for (let i = 0; i < 6; i++) {
    const mx = tx - 6 + i * ((tw + 12) / 5.5);
    out += path(poly([[X(mx), Y(-265)], [X(mx), Y(-292)], [X(mx + 14), Y(-292)], [X(mx + 14), Y(-265)]]), paint(r, i > 4 ? wallShade : wall));
  }
  out += path(poly([[X(tx - 8), Y(-262)], [X(tx + tw + 8), Y(-262)], [X(tx + tw + 8), Y(-270)], [X(tx - 8), Y(-270)]]), paint(r, wallShade));
  // tower windows
  for (const [wx, wy, ww, wh] of [[tx + 30, -230, 16, 28], [tx + 64, -230, 16, 28], [tx + 46, -160, 18, 34], [tx + 46, -90, 18, 34]]) {
    out += path(
      `M${f(X(wx))} ${f(Y(wy + wh))}L${f(X(wx))} ${f(Y(wy + ww / 2))}Q${f(X(wx + ww / 2))} ${f(Y(wy - ww / 3))} ${f(X(wx + ww))} ${f(Y(wy + ww / 2))}L${f(X(wx + ww))} ${f(Y(wy + wh))}Z`,
      jitter(r, dark, { l: 0.05 }),
    );
  }
  // --- lower wing ---
  out += path(poly([[X(tx + tw), Y(8)], [X(tx + tw), Y(-90)], [X(tx + tw + 150), Y(-90)], [X(tx + tw + 150), Y(8)]]), paint(r, wall));
  out += dabsInRect(r, { x: X(tx + tw), y: Y(-90), width: 150 * s, height: 98 * s, count: Math.round(180 * s), palette: wall, len: [8 * s, 16 * s], w: [4 * s, 7 * s], angle: Math.PI / 2 });
  out += path(poly([[X(tx + tw - 4), Y(-90)], [X(tx + tw + 154), Y(-90)], [X(tx + tw + 154), Y(-98)], [X(tx + tw - 4), Y(-98)]]), paint(r, roof));
  for (let c = 0; c < 3; c++) {
    const wx = tx + tw + 22 + c * 44;
    out += path(poly([[X(wx), Y(-65)], [X(wx + 16), Y(-65)], [X(wx + 16), Y(-35)], [X(wx), Y(-35)]]), jitter(r, dark, { l: 0.05 }));
  }
  // arches on the wing (loggia)
  return out;
}

/** Retaining stone wall with block texture. */
export function stoneWall(r, x, y, w, h) {
  let out = path(poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]), "#c4b08c");
  const rows = Math.round(h / 16);
  for (let i = 0; i < rows; i++) {
    let cx = x + (i % 2) * 14;
    while (cx < x + w) {
      const bw = r.range(20, 40);
      out += path(dabPath(cx + bw / 2, y + i * 16 + 8, bw - 3, 12, r.range(-0.05, 0.05), 0, 0.85), paint(r, ["#d8c7a6", "#cbb894", "#e2d4b8", "#b9a47f", "#d2bd98"]));
      cx += bw;
    }
  }
  out += path(poly([[x, y], [x + w, y], [x + w, y + 5], [x, y + 5]]), "#efe4cf", 'opacity="0.8"');
  return out;
}

/** Hillside covered in greenery. */
export function greenHill(r, shapePts, { density = 1, palette, light } = {}) {
  const pal = palette || ["#56683a", "#6c7d45", "#46592f", "#7c8a4f", "#3e5130"];
  const lit = light || ["#9aa865", "#a9b673", "#c2c487"];
  let out = path(smoothClosed(shapePts, 0.5), "#3c4d2c");
  const xs = shapePts.map((p) => p[0]);
  const ys = shapePts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const id = `hill${Math.round(minX)}${Math.round(minY)}`;
  const dabs = dabsInRect(r, {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    count: Math.round((((maxX - minX) * (maxY - minY)) / 40) * density),
    palette: pal,
    len: [8, 18],
    w: [5, 10],
    angle: 0,
    angJitter: Math.PI,
  });
  const lights = dabsInRect(r, {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    count: Math.round((((maxX - minX) * (maxY - minY)) / 160) * density),
    palette: lit,
    len: [6, 12],
    w: [3, 6],
    angle: 0,
    angJitter: Math.PI,
  });
  return {
    defs: `<clipPath id="${id}"><path d="${smoothClosed(shapePts, 0.5)}"/></clipPath>`,
    svg: out + `<g clip-path="url(#${id})">${dabs}${lights}</g>`,
  };
}

export { blobPath, bush, cypress, gull, blossom, bud, leaf, dabsInEllipse, dabsInRect, dabPath, path, poly, paint, jitter, f };
