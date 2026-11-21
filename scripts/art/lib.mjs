// Shared helpers for the procedural "painted" artwork.
// Everything is deterministic (seeded) so re-running the generator
// produces identical images.

/* ------------------------------------------------------------------ */
/* Random                                                              */
/* ------------------------------------------------------------------ */

export function makeRng(seed = 1) {
  let a = seed >>> 0;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = () => next();
  r.range = (min, max) => min + next() * (max - min);
  r.int = (min, max) => Math.floor(min + next() * (max - min + 1));
  r.pick = (arr) => arr[Math.floor(next() * arr.length)];
  r.chance = (p) => next() < p;
  r.gauss = () => {
    let s = 0;
    for (let i = 0; i < 6; i++) s += next();
    return (s - 3) / 1.2247; // ~N(0,1)
  };
  r.sign = () => (next() < 0.5 ? -1 : 1);
  return r;
}

/* ------------------------------------------------------------------ */
/* Numbers                                                             */
/* ------------------------------------------------------------------ */

export const f = (n) => Math.round(n * 10) / 10;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const deg = (d) => (d * Math.PI) / 180;

/* ------------------------------------------------------------------ */
/* Colour                                                              */
/* ------------------------------------------------------------------ */

export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
}

export function rgbToHex(rgb) {
  return (
    "#" +
    rgb
      .map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
}

export const lighten = (c, t) => mix(c, "#ffffff", t);
export const darken = (c, t) => mix(c, "#000000", t);

function rgbToHsl([r, g, b]) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}

function hslToRgb([h, s, l]) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return rgb.map((v) => (v + m) * 255);
}

/** Randomly shift a colour in HSL space. */
export function jitter(r, hex, { h = 4, s = 0.05, l = 0.05 } = {}) {
  const [H, S, L] = rgbToHsl(hexToRgb(hex));
  return rgbToHex(
    hslToRgb([
      (H + r.range(-h, h) + 360) % 360,
      clamp(S + r.range(-s, s), 0, 1),
      clamp(L + r.range(-l, l), 0, 1),
    ]),
  );
}

/** Pick from a palette and jitter it slightly. */
export const paint = (r, palette, j) => jitter(r, r.pick(palette), j);

// Light comes from the top-left in every painting.
const LIGHT = [-0.7071, -0.7071];

/**
 * A thick "palette knife" stroke: base colour, a lit ridge on the side that
 * faces the light and a thin shadow on the opposite side. This is what gives
 * the paintings their impasto relief.
 */
export function knife(x, y, len, w, ang, color, { bend = 0, ridge = 0.32, shadow = 0.22, opacity = 1, taper = 0.55 } = {}) {
  let nx = -Math.sin(ang);
  let ny = Math.cos(ang);
  if (nx * LIGHT[0] + ny * LIGHT[1] < 0) {
    nx = -nx;
    ny = -ny;
  }
  const op = opacity < 1 ? ` opacity="${f(opacity)}"` : "";
  let out = `<path d="${dabPath(x, y, len, w, ang, bend, taper)}" fill="${color}"${op}/>`;
  if (shadow > 0) {
    out += `<path d="${dabPath(x - nx * w * 0.3, y - ny * w * 0.3, len * 0.82, w * 0.28, ang, bend * 0.5, taper)}" fill="${darken(color, 0.22)}" opacity="${f(shadow * opacity)}"/>`;
  }
  if (ridge > 0) {
    out += `<path d="${dabPath(x + nx * w * 0.22, y + ny * w * 0.22, len * 0.78, w * 0.3, ang, bend * 0.5, taper)}" fill="${lighten(color, 0.38)}" opacity="${f(Math.min(1, ridge * 1.6) * opacity)}"/>`;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Paths                                                               */
/* ------------------------------------------------------------------ */

/** Closed Catmull-Rom spline through points -> cubic bezier path. */
export function smoothClosed(pts, tension = 1) {
  const n = pts.length;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

/** Open Catmull-Rom spline through points. */
export function smoothOpen(pts, tension = 1) {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

export const poly = (pts) =>
  "M" + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L") + "Z";

/** Organic closed blob around an ellipse. */
export function blobPath(r, cx, cy, rx, ry, { n = 9, irr = 0.22, rot = 0 } = {}) {
  const pts = [];
  const off = r.range(0, Math.PI * 2);
  for (let i = 0; i < n; i++) {
    const a = off + (i / n) * Math.PI * 2 + r.range(-0.15, 0.15);
    const k = 1 + r.range(-irr, irr);
    const x = Math.cos(a) * rx * k;
    const y = Math.sin(a) * ry * k;
    const c = Math.cos(rot);
    const s = Math.sin(rot);
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return smoothClosed(pts);
}

/**
 * A single brush dab: a rounded, slightly bent stroke of given length/width
 * centred on (x,y) and rotated by `ang` radians.
 */
export function dabPath(x, y, len, w, ang, bend = 0, taper = 0.55) {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const P = (u, v) => `${f(x + u * c - v * s)} ${f(y + u * s + v * c)}`;
  const L = len / 2;
  const H = w / 2;
  return (
    `M${P(-L, 0)}` +
    `C${P(-L, -H * 0.95)} ${P(-L * 0.45, -H + bend)} ${P(0, -H + bend)}` +
    `C${P(L * 0.5, -H + bend)} ${P(L, -H * taper)} ${P(L, 0)}` +
    `C${P(L, H * taper)} ${P(L * 0.5, H + bend)} ${P(0, H + bend)}` +
    `C${P(-L * 0.45, H + bend)} ${P(-L, H * 0.95)} ${P(-L, 0)}Z`
  );
}

/** Lanceolate leaf from base (x,y) pointing at angle `ang`. */
export function leafPath(x, y, len, w, ang, curve = 0) {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const P = (u, v) => `${f(x + u * c - v * s)} ${f(y + u * s + v * c)}`;
  const H = w / 2;
  return (
    `M${P(0, 0)}` +
    `C${P(len * 0.25, -H * 1.05 + curve)} ${P(len * 0.65, -H * 0.95 + curve)} ${P(len, curve * 1.4)}` +
    `C${P(len * 0.62, H * 0.9 + curve)} ${P(len * 0.22, H * 1.0 + curve)} ${P(0, 0)}Z`
  );
}

/** Half of a leaf (one side of the midrib) — used for two-tone leaves. */
export function halfLeafPath(x, y, len, w, ang, curve = 0) {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const P = (u, v) => `${f(x + u * c - v * s)} ${f(y + u * s + v * c)}`;
  const H = w / 2;
  return (
    `M${P(0, 0)}` +
    `C${P(len * 0.25, -H * 1.05 + curve)} ${P(len * 0.65, -H * 0.95 + curve)} ${P(len, curve * 1.4)}` +
    `Q${P(len * 0.5, curve * 0.9)} ${P(0, 0)}Z`
  );
}

/* ------------------------------------------------------------------ */
/* SVG element helpers                                                 */
/* ------------------------------------------------------------------ */

export const path = (d, fill, extra = "") =>
  `<path d="${d}" fill="${fill}"${extra ? " " + extra : ""}/>`;

export const g = (content, attrs = "") => `<g${attrs ? " " + attrs : ""}>${content}</g>`;

export function svgDoc(w, h, defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Filters                                                             */
/* ------------------------------------------------------------------ */

/**
 * Turns flat vector shapes into something resembling thick oil paint:
 * edges are wobbled, the luminance (plus fine bristle noise) becomes a
 * height-map which is lit with diffuse + specular light.
 */
export function impastoFilter(
  id,
  W,
  H,
  {
    warp = 6,
    warpFreq = 0.06,
    relief = 2.6,
    grainFreq = 0.55,
    grain = 0.12,
    lum = 0.85,
    elev = 50,
    spec = 0.28,
    specExp = 14,
    seed = 3,
    blur = 0.6,
    azimuth = 225,
  } = {},
) {
  const kd = (1 / Math.sin(deg(elev))).toFixed(3);
  return `<filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="${warpFreq}" numOctaves="2" seed="${seed}" result="wn"/>
<feDisplacementMap in="SourceGraphic" in2="wn" scale="${warp}" xChannelSelector="R" yChannelSelector="G" result="src"/>
<feColorMatrix in="src" type="luminanceToAlpha" result="la"/>
<feTurbulence type="fractalNoise" baseFrequency="${grainFreq}" numOctaves="3" seed="${seed + 5}" result="gn"/>
<feColorMatrix in="gn" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.6 0.4 0 0 0" result="ga"/>
<feComposite in="la" in2="ga" operator="arithmetic" k1="0" k2="${lum}" k3="${grain}" k4="0" result="h0"/>
<feComposite in="h0" in2="src" operator="in" result="h1"/>
<feGaussianBlur in="h1" stdDeviation="${blur}" result="h"/>
<feDiffuseLighting in="h" surfaceScale="${relief}" diffuseConstant="${kd}" lighting-color="#ffffff" result="dl"><feDistantLight azimuth="${azimuth}" elevation="${elev}"/></feDiffuseLighting>
<feBlend in="src" in2="dl" mode="multiply" result="sh"/>
<feSpecularLighting in="h" surfaceScale="${relief}" specularConstant="${spec}" specularExponent="${specExp}" lighting-color="#ffffff" result="sp"><feDistantLight azimuth="${azimuth}" elevation="${elev}"/></feSpecularLighting>
<feComposite in="sh" in2="sp" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="lit"/>
<feComposite in="lit" in2="src" operator="in"/>
</filter>`;
}

/** Embossed paper grain, multiplied over the source graphic. */
export function paperFilter(
  id,
  W,
  H,
  { seed = 11, freq = 0.012, fine = 0.5, relief = 1.6, elev = 58, coarse = 0.8, fineAmt = 0.35, azimuth = 235 } = {},
) {
  const kd = (1 / Math.sin(deg(elev))).toFixed(3);
  return `<filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${seed}" result="n1"/>
<feTurbulence type="fractalNoise" baseFrequency="${fine}" numOctaves="2" seed="${seed + 1}" result="n2"/>
<feComposite in="n1" in2="n2" operator="arithmetic" k1="0" k2="${coarse}" k3="${fineAmt}" k4="0" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="ha"/>
<feDiffuseLighting in="ha" surfaceScale="${relief}" diffuseConstant="${kd}" lighting-color="#ffffff" result="dl"><feDistantLight azimuth="${azimuth}" elevation="${elev}"/></feDiffuseLighting>
<feBlend in="SourceGraphic" in2="dl" mode="multiply" result="b"/>
<feComposite in="b" in2="SourceGraphic" operator="in"/>
</filter>`;
}

/** Roughen/tear the outline of whatever it is applied to. */
export function roughFilter(id, { freq = 0.05, scale = 10, octaves = 4, seed = 4 } = {}) {
  return `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="${seed}" result="n"/>
<feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/>
</filter>`;
}

/** Soft blur filter (for haze / shadows). */
export function blurFilter(id, sd = 6) {
  return `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
}

/* ------------------------------------------------------------------ */
/* Painted primitives                                                  */
/* ------------------------------------------------------------------ */

/**
 * Scatter brush dabs inside an ellipse. `angle` may be a number (radians)
 * or a function (x,y) => radians.
 */
export function dabsInEllipse(
  r,
  {
    cx,
    cy,
    rx,
    ry,
    count,
    palette,
    len = [14, 30],
    w = [7, 14],
    angle = 0,
    angJitter = 0.35,
    bend = 3,
    j,
    opacity,
    ridge = 0.3,
    shadow = 0.2,
  },
) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const t = Math.sqrt(r()) * 0.98;
    const a = r() * Math.PI * 2;
    const x = cx + Math.cos(a) * rx * t;
    const y = cy + Math.sin(a) * ry * t;
    const base = typeof angle === "function" ? angle(x, y) : angle;
    const ang = base + r.range(-angJitter, angJitter);
    const op = opacity ? r.range(opacity[0], opacity[1]) : 1;
    out += knife(x, y, r.range(len[0], len[1]), r.range(w[0], w[1]), ang, paint(r, palette, j), {
      bend: r.range(-bend, bend),
      ridge,
      shadow,
      opacity: op,
    });
  }
  return out;
}

/** Scatter dabs inside an axis-aligned rectangle. */
export function dabsInRect(
  r,
  {
    x,
    y,
    width: W,
    height: H,
    count,
    palette,
    len = [14, 30],
    w = [7, 14],
    angle = 0,
    angJitter = 0.3,
    bend = 3,
    j,
    opacity,
    ridge = 0.3,
    shadow = 0.2,
  },
) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const px = x + r() * W;
    const py = y + r() * H;
    const base = typeof angle === "function" ? angle(px, py) : angle;
    const ang = base + r.range(-angJitter, angJitter);
    const op = opacity ? r.range(opacity[0], opacity[1]) : 1;
    out += knife(px, py, r.range(len[0], len[1]), r.range(w[0], w[1]), ang, paint(r, palette, j), {
      bend: r.range(-bend, bend),
      ridge,
      shadow,
      opacity: op,
    });
  }
  return out;
}

/**
 * Fill a circular "puff" with knife strokes that follow its outline; the
 * colour depends on which side faces the light (top-left).
 */
export function puff(r, cx, cy, rad, { light, mid, shadow, density = 1, size = 1, rim = null }) {
  let out = path(blobPath(r, cx, cy, rad, rad * 0.9, { irr: 0.17, n: 11 }), paint(r, mid, { l: 0.02 }));
  const n = Math.round(((rad * rad) / 75) * density);
  for (let i = 0; i < n; i++) {
    const t = Math.pow(r(), 0.6);
    const a = r() * Math.PI * 2;
    const x = cx + Math.cos(a) * rad * t * 0.95;
    const y = cy + Math.sin(a) * rad * t * 0.9;
    // light factor: projection on the light direction, more extreme near edge
    const lf = -(Math.cos(a) * 0.55 + Math.sin(a) * 0.85) * t;
    const pal = lf > 0.22 ? light : lf < -0.28 ? shadow : mid;
    const ang = a + Math.PI / 2 + r.range(-0.35, 0.35);
    const L = r.range(0.35, 0.7) * rad * size;
    const Wd = r.range(0.12, 0.22) * rad * size;
    out += knife(x, y, Math.min(L, 60 * size), Math.min(Wd, 20 * size), ang, paint(r, pal, { l: 0.025, s: 0.03 }), {
      bend: r.range(-3, 3),
      ridge: 0.34,
      shadow: 0.18,
    });
  }
  if (rim) {
    // bright rim strokes on the lit top edge
    for (let i = 0; i < Math.round(rad / 9); i++) {
      const a = r.range(Math.PI * 1.05, Math.PI * 1.75);
      const x = cx + Math.cos(a) * rad * 0.86;
      const y = cy + Math.sin(a) * rad * 0.82;
      out += knife(x, y, r.range(14, 26) * size, r.range(5, 8) * size, a + Math.PI / 2, paint(r, rim), { ridge: 0.4, shadow: 0 });
    }
  }
  return out;
}

/**
 * A painted cumulus cloud built from shaded puffs: big puffs on top, a
 * flatter row underneath.
 */
export function cloud(
  r,
  cx,
  cy,
  rx,
  ry,
  {
    light = ["#f8f1ea", "#f3e6e3", "#efe0e6", "#fbf4ec", "#f6e9dc"],
    mid = ["#d4cce2", "#c9c4e0", "#dcd0e0", "#d9cbd6", "#c4c8e6", "#e2d6de"],
    shadow = ["#9aa3d6", "#8c97cf", "#a59fd0", "#7f8cc9", "#ad9ec8", "#7889c8"],
    rim = ["#fffaf4", "#fbefe6"],
    density = 1,
    size = 1,
  } = {},
) {
  let out = "";
  const n = Math.max(3, Math.round(rx / 34));
  const puffs = [];
  // bottom row (flatter, smaller)
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = cx - rx + t * rx * 2 + r.range(-8, 8);
    const rad = ry * r.range(0.42, 0.58) * (0.75 + 0.25 * Math.sin(t * Math.PI));
    puffs.push([x, cy + ry * 0.25 + r.range(-10, 10), rad * r.range(0.8, 1.2)]);
  }
  // top row (bigger, billowing)
  const m = Math.max(2, Math.round(n * 0.65));
  for (let i = 0; i < m; i++) {
    const t = (i + 0.5) / m;
    const bell = Math.sin(t * Math.PI);
    const x = cx - rx * 0.75 + t * rx * 1.5 + r.range(-10, 10);
    const rad = ry * r.range(0.5, 0.72) * (0.6 + 0.4 * bell);
    puffs.push([x, cy - ry * 0.2 * bell - r.range(0, ry * 0.15), rad]);
  }
  for (const [x, y, rad] of puffs) {
    out += puff(r, x, y, rad, { light, mid, shadow, density, size, rim: r.chance(0.35) ? rim : null });
  }
  return out;
}

/** Five-petal blossom (apple / lemon / almond style). */
export function blossom(
  r,
  x,
  y,
  size,
  {
    petal = "#fbf8f2",
    petalShade = "#e4dcd8",
    tint = null,
    center = "#d7b958",
    stamen = "#9c6b3a",
    petals = 5,
    rot = null,
    squash = 1,
    outline = "#b9aca6",
  } = {},
) {
  const a0 = rot ?? r.range(0, Math.PI * 2);
  let out = "";
  const pl = size * 0.55;
  const pw = size * 0.5;
  for (let i = 0; i < petals; i++) {
    const a = a0 + (i / petals) * Math.PI * 2 + r.range(-0.12, 0.12);
    const c = Math.cos(a);
    const s = Math.sin(a) * squash;
    const tipX = x + c * pl;
    const tipY = y + s * pl;
    const px = -Math.sin(a) * pw * 0.5;
    const py = Math.cos(a) * pw * 0.5 * squash;
    const d =
      `M${f(x)} ${f(y)}` +
      `C${f(x + c * pl * 0.3 + px * 1.1)} ${f(y + s * pl * 0.3 + py * 1.1)} ${f(tipX + px * 1.05)} ${f(tipY + py * 1.05)} ${f(tipX + c * pl * 0.08)} ${f(tipY + s * pl * 0.08)}` +
      `C${f(tipX - px * 1.05)} ${f(tipY - py * 1.05)} ${f(x + c * pl * 0.3 - px * 1.1)} ${f(y + s * pl * 0.3 - py * 1.1)} ${f(x)} ${f(y)}Z`;
    out += path(d, jitter(r, petal, { l: 0.02, s: 0.03 }), `stroke="${outline}" stroke-width="${f(size * 0.02)}" stroke-opacity="0.4"`);
    // shading towards the base of the petal
    out += path(
      dabPath(x + c * pl * 0.32, y + s * pl * 0.32, pl * 0.5, pw * 0.42, a, 0),
      tint ? jitter(r, tint, { l: 0.03 }) : jitter(r, petalShade, { l: 0.02 }),
      `opacity="${tint ? 0.75 : 0.55}"`,
    );
    // knife strokes along the petal
    for (let k = 0; k < 2; k++) {
      const t = r.range(0.45, 0.75);
      out += knife(x + c * pl * t, y + s * pl * t, pl * r.range(0.3, 0.45), pw * r.range(0.18, 0.28), a + r.range(-0.5, 0.5), jitter(r, k ? "#ffffff" : petal, { l: 0.03 }), { ridge: 0.3, shadow: 0.25, opacity: 0.9 });
    }
  }
  // centre
  out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(size * 0.12)}" fill="${center}"/>`;
  const st = Math.round(7 + size / 12);
  for (let i = 0; i < st; i++) {
    const a = r.range(0, Math.PI * 2);
    const d = size * r.range(0.1, 0.2);
    out += `<circle cx="${f(x + Math.cos(a) * d)}" cy="${f(y + Math.sin(a) * d * squash)}" r="${f(size * 0.035)}" fill="${stamen}"/>`;
  }
  return out;
}

/** Closed bud (teardrop). */
export function bud(r, x, y, size, ang, { fill = "#e9a3b2", light = "#f7d2da", sepal = "#4d6b45" } = {}) {
  let out = "";
  out += path(dabPath(x, y, size, size * 0.62, ang, 0, 0.35), jitter(r, fill, { l: 0.04 }));
  out += path(dabPath(x - Math.cos(ang) * size * 0.05, y - Math.sin(ang) * size * 0.05, size * 0.6, size * 0.25, ang, 0), light, 'opacity="0.75"');
  const bx = x - Math.cos(ang) * size * 0.45;
  const by = y - Math.sin(ang) * size * 0.45;
  out += path(leafPath(bx, by, size * 0.45, size * 0.3, ang + 0.5), sepal);
  out += path(leafPath(bx, by, size * 0.45, size * 0.3, ang - 0.5), sepal);
  return out;
}

/** Two-tone leaf with midrib. */
export function leaf(
  r,
  x,
  y,
  len,
  w,
  ang,
  { fill = "#3a5a40", light = "#5f7f5d", dark = "#24392b", vein = "#7d9a78", curve = 0, edge = null } = {},
) {
  const c = curve || r.range(-w * 0.25, w * 0.25);
  let out = path(leafPath(x, y, len, w, ang, c), jitter(r, fill, { l: 0.04, h: 6 }));
  out += path(halfLeafPath(x, y, len, w * 0.92, ang, c), jitter(r, r.chance(0.5) ? light : dark, { l: 0.04 }), 'opacity="0.85"');
  // painterly knife strokes across the leaf
  const cs0 = Math.cos(ang);
  const sn0 = Math.sin(ang);
  const strokes = 3 + Math.round(len / 40);
  for (let k = 0; k < strokes; k++) {
    const t = r.range(0.15, 0.8);
    const side = r.range(-0.28, 0.28) * w;
    const px = x + cs0 * len * t - sn0 * (side + c * 0.6);
    const py = y + sn0 * len * t + cs0 * (side + c * 0.6);
    out += knife(px, py, len * r.range(0.18, 0.32), w * r.range(0.16, 0.26), ang + r.range(-0.35, 0.35), jitter(r, r.chance(0.5) ? light : fill, { l: 0.06 }), { ridge: 0.35, shadow: 0.15, opacity: 0.85 });
  }
  if (edge) out += path(leafPath(x, y, len, w, ang, c), "none", `stroke="${edge}" stroke-width="${f(w * 0.05)}" stroke-opacity="0.45"`);
  if (vein) {
    const cs = Math.cos(ang);
    const sn = Math.sin(ang);
    const mx = x + cs * len * 0.5 - sn * c * 0.8;
    const my = y + sn * len * 0.5 + cs * c * 0.8;
    out += `<path d="M${f(x)} ${f(y)}Q${f(mx)} ${f(my)} ${f(x + cs * len * 0.92 - sn * c * 1.2)} ${f(y + sn * len * 0.92 + cs * c * 1.2)}" fill="none" stroke="${vein}" stroke-width="${f(Math.max(0.8, w * 0.05))}" stroke-opacity="0.7" stroke-linecap="round"/>`;
  }
  return out;
}

/** Tapered branch along a polyline (drawn as many overlapping dabs). */
export function branch(r, pts, { w0 = 10, w1 = 3, color = "#5b4a3e", light = "#8a7462" } = {}) {
  let out = "";
  const segs = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const L = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    segs.push(L);
    total += L;
  }
  const d = smoothOpen(pts);
  out += `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w0}" stroke-linecap="round" stroke-linejoin="round"/>`;
  // taper: overlay thinner strokes progressively
  out += `<path d="${d}" fill="none" stroke="${light}" stroke-width="${f(Math.max(1, w1 * 0.6))}" stroke-linecap="round" opacity="0.6" transform="translate(-1 -1)"/>`;
  return { svg: out, total, segs };
}

/** Sample a point (and tangent angle) at parameter t along a polyline. */
export function along(pts, t) {
  const lens = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const L = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    lens.push(L);
    total += L;
  }
  let d = t * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const u = lens[i] ? d / lens[i] : 0;
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      return { x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * u, a: Math.atan2(y1 - y0, x1 - x0) };
    }
    d -= lens[i];
  }
  const last = pts[pts.length - 1];
  return { x: last[0], y: last[1], a: 0 };
}

/** Seagull: a soft "m" shape. */
export function gull(x, y, s, color = "#4a4a55") {
  return `<path d="M${f(x - s)} ${f(y)}Q${f(x - s * 0.5)} ${f(y - s * 0.55)} ${f(x)} ${f(y + s * 0.12)}Q${f(x + s * 0.5)} ${f(y - s * 0.55)} ${f(x + s)} ${f(y)}" fill="none" stroke="${color}" stroke-width="${f(s * 0.16)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** Tall cypress tree made of vertical knife strokes (lit from the left). */
export function cypress(
  r,
  x,
  baseY,
  h,
  w,
  { palette = ["#2c4632", "#355a3c", "#2a4230", "#3f6447"], light = ["#5d7f55", "#6e8d5e", "#7f9a66"], dark = ["#1d2f22", "#22362a"], dense = 1 } = {},
) {
  let out = "";
  const topY = baseY - h;
  const right = [];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const half = w * 0.5 * Math.pow(Math.sin(Math.min(1, t * 1.2) * Math.PI * 0.5), 0.85) * (t > 0.88 ? 1 - (t - 0.88) * 1.5 : 1);
    right.push([x + half * r.range(0.88, 1.08), topY + t * h]);
  }
  const left = right.map(([px, py]) => [x - (px - x) * r.range(0.88, 1.08), py]).reverse();
  out += path(smoothClosed([[x, topY - 8], ...right, ...left]), paint(r, dark, { l: 0.02 }));
  const count = Math.round(((h * w) / 45) * dense);
  for (let i = 0; i < count; i++) {
    const t = Math.pow(r(), 0.9);
    const yy = topY + t * h;
    const half = w * 0.46 * Math.sin(Math.min(1, t * 1.2) * Math.PI * 0.5);
    const u = r.range(-1, 1);
    const xx = x + u * half;
    const pal = u < -0.25 ? (r.chance(0.7) ? light : palette) : u > 0.45 ? dark : palette;
    out += knife(xx, yy, r.range(9, 20), r.range(3.5, 7), Math.PI / 2 + u * 0.5 + r.range(-0.3, 0.3), paint(r, pal, { l: 0.03 }), { ridge: 0.28, shadow: 0.2 });
  }
  return out;
}

/** Rounded bush / olive tree crown, lit from the top-left. */
export function bush(
  r,
  cx,
  cy,
  rx,
  ry,
  {
    palette = ["#6f7f45", "#5e7040", "#829355", "#66773f"],
    light = ["#a4b06d", "#b7bd7c", "#c6c98d"],
    dark = ["#3b4b2c", "#33452c", "#2c3d27"],
    density = 1,
    dab = 1,
  } = {},
) {
  let out = path(blobPath(r, cx, cy, rx, ry, { irr: 0.2 }), paint(r, dark, { l: 0.02 }));
  const n = Math.round(((rx * ry) / 11) * density);
  for (let i = 0; i < n; i++) {
    const t = Math.pow(r(), 0.65);
    const a = r() * Math.PI * 2;
    const x = cx + Math.cos(a) * rx * t * 0.95;
    const y = cy + Math.sin(a) * ry * t * 0.92;
    const lf = -(Math.cos(a) * 0.55 + Math.sin(a) * 0.85) * t;
    const pal = lf > 0.25 ? light : lf < -0.3 ? dark : palette;
    out += knife(x, y, r.range(7, 15) * dab, r.range(4, 8) * dab, r.range(0, Math.PI), paint(r, pal, { l: 0.03 }), { ridge: 0.3, shadow: 0.2 });
  }
  return out;
}
