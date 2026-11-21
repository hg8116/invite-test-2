// Small pieces: torn paper card, blossom sprig, decorative tile, ribbons,
// story clouds.
import {
  blossom,
  bud,
  dabsInEllipse,
  dabsInRect,
  impastoFilter,
  jitter,
  knife,
  leaf,
  makeRng,
  paint,
  path,
  smoothOpen,
  svgDoc,
  f,
  cloud,
} from "./lib.mjs";

/* ------------------------------------------------------------------ */
/* Torn paper card                                                     */
/* ------------------------------------------------------------------ */

export const CARD = { W: 800, H: 1300 };

export function cardSvg() {
  const { W, H } = CARD;
  const defs = `<filter id="torn" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="5" seed="3" result="n"/>
<feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/>
<feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="4" seed="8" result="p1"/>
<feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="9" result="p2"/>
<feComposite in="p1" in2="p2" operator="arithmetic" k2="0.75" k3="0.3" result="pn"/>
<feColorMatrix in="pn" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="ph"/>
<feComposite in="ph" in2="d" operator="in" result="ph2"/>
<feGaussianBlur in="ph2" stdDeviation="0.8" result="ph3"/>
<feDiffuseLighting in="ph3" surfaceScale="3" diffuseConstant="1.17" lighting-color="#ffffff" result="dl"><feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting>
<feBlend in="d" in2="dl" mode="multiply" result="lit"/>
<feComposite in="lit" in2="d" operator="in" result="paper"/>
<feGaussianBlur in="d" stdDeviation="9" result="blur"/>
<feOffset in="blur" dx="3" dy="7" result="off"/>
<feColorMatrix in="off" type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.13  0 0 0 0 0.25  0 0 0 0.38 0" result="shadow"/>
<feMerge><feMergeNode in="shadow"/><feMergeNode in="paper"/></feMerge>
</filter>`;
  return svgDoc(W, H, defs, `<rect x="44" y="44" width="${W - 88}" height="${H - 88}" fill="#f4eee7" filter="url(#torn)"/>`);
}

/* ------------------------------------------------------------------ */
/* Pink blossom sprig (flanks the date)                                */
/* ------------------------------------------------------------------ */

export const SPRIG = { W: 260, H: 170 };

export function sprigSvg() {
  const { W, H } = SPRIG;
  const r = makeRng(77);
  const defs = impastoFilter("paint", W, H, { relief: 1.8, warp: 2, warpFreq: 0.08, seed: 4 });
  let body = "";
  const twig = [[20, 120], [80, 104], [140, 96], [200, 82], [245, 60]];
  body += `<path d="${smoothOpen(twig)}" fill="none" stroke="#6b5245" stroke-width="4" stroke-linecap="round"/>`;
  body += leaf(r, 92, 102, 52, 22, -0.9, { fill: "#4f7448", light: "#7ea06b", dark: "#365234", vein: "#a5bf92" });
  body += leaf(r, 150, 95, 46, 20, 0.55, { fill: "#4f7448", light: "#7ea06b", dark: "#365234", vein: "#a5bf92" });
  body += bud(r, 232, 58, 26, -0.5, { fill: "#e48ea3", light: "#f6c4cf" });
  const pink = { petal: "#f7dfe4", tint: "#e993a8", center: "#e7c45f", stamen: "#9b3f52", outline: "#c98a98" };
  body += blossom(r, 120, 86, 62, { ...pink, squash: 0.8 });
  body += blossom(r, 190, 80, 48, { ...pink, squash: 0.9 });
  body += blossom(r, 52, 112, 40, { ...pink, squash: 0.75 });
  return svgDoc(W, H, defs, `<g filter="url(#paint)">${body}</g>`);
}

/* ------------------------------------------------------------------ */
/* Story clouds band                                                   */
/* ------------------------------------------------------------------ */

export const CLOUDS = { W: 1000, H: 560 };

export function cloudsSvg() {
  const { W, H } = CLOUDS;
  const r = makeRng(9001);
  const defs = impastoFilter("paint", W, H, { relief: 2.2, warp: 5, seed: 12 });
  const soft = {
    light: ["#f7f1ee", "#f1e6ea", "#efe3e9", "#faf4f0"],
    mid: ["#d3cde4", "#c7c6e3", "#ddd2e4", "#d8cad9", "#c0c7e6"],
    shadow: ["#a2a9da", "#94a0d4", "#aaa2d4", "#8796cf", "#b3a3cc"],
    rim: ["#fffaf6"],
  };
  let body = "";
  const list = [
    [170, 200, 190, 80],
    [440, 140, 170, 60],
    [780, 210, 230, 95],
    [90, 390, 150, 60],
    [330, 350, 140, 55],
    [620, 380, 170, 65],
    [920, 420, 130, 60],
    [500, 480, 120, 40],
    [980, 120, 90, 45],
    [20, 110, 80, 40],
  ];
  for (const [cx, cy, rx, ry] of list) body += cloud(r, cx, cy, rx, ry, soft);
  return svgDoc(W, H, defs, `<g filter="url(#paint)">${body}</g>`);
}

/* ------------------------------------------------------------------ */
/* Decorative majolica tile (after the programme)                      */
/* ------------------------------------------------------------------ */

export const TILE = { W: 1000, H: 300 };

export function tileSvg() {
  const { W, H } = TILE;
  const r = makeRng(4242);
  const defs = impastoFilter("paint", W, H, { relief: 1.6, warp: 2.5, warpFreq: 0.05, seed: 2, lum: 0.6 });
  let body = "";
  body += `<rect x="6" y="6" width="${W - 12}" height="${H - 12}" fill="#f2e8d4"/>`;
  body += dabsInRect(r, { x: 8, y: 8, width: W - 16, height: H - 16, count: 900, palette: ["#f2e8d4", "#efe3cb", "#f6eedf", "#ecdfc6"], len: [20, 40], w: [8, 14], angle: 0, angJitter: 0.4, ridge: 0.15, shadow: 0.1 });
  // borders
  body += `<rect x="10" y="10" width="${W - 20}" height="${H - 20}" fill="none" stroke="#b08b4f" stroke-width="5"/>`;
  body += `<rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="#b08b4f" stroke-width="2"/>`;
  // vine
  const vine = [];
  for (let i = 0; i <= 12; i++) {
    const x = 40 + (i / 12) * (W - 80);
    vine.push([x, H / 2 + Math.sin(i * 1.15) * 52]);
  }
  body += `<path d="${smoothOpen(vine)}" fill="none" stroke="#3d6f82" stroke-width="7" stroke-linecap="round"/>`;
  body += `<path d="${smoothOpen(vine)}" fill="none" stroke="#7aa7b5" stroke-width="2" stroke-linecap="round" transform="translate(-1 -2)" opacity="0.7"/>`;
  // tendrils + leaves + flowers
  for (let i = 0; i < 12; i++) {
    const [x, y] = vine[i];
    const [x2, y2] = vine[i + 1];
    const mx = (x + x2) / 2;
    const my = (y + y2) / 2;
    const up = i % 2 === 0 ? -1 : 1;
    const a = Math.atan2(y2 - y, x2 - x);
    body += leaf(r, mx, my, 46, 20, a + up * 0.9, { fill: "#4f7d4a", light: "#7ba765", dark: "#365c36", vein: "#a9c595" });
    body += leaf(r, mx - 18, my, 38, 16, a - up * 1.1, { fill: "#4f7d4a", light: "#7ba765", dark: "#365c36", vein: "#a9c595" });
    // stem to the flower
    const fx = mx + 26;
    const fy = my + up * 62;
    body += `<path d="M${f(mx)} ${f(my)}Q${f(mx + 30)} ${f(my + up * 22)} ${f(fx)} ${f(fy)}" fill="none" stroke="#3d6f82" stroke-width="3"/>`;
    body += blossom(r, fx, fy, 54, {
      petal: "#c8493a",
      tint: "#e26b52",
      petalShade: "#a63a2e",
      center: "#7a2a22",
      stamen: "#e9c25a",
      outline: "#8e2f25",
      petals: 6,
      squash: 0.9,
    });
  }
  return svgDoc(W, H, defs, `<g filter="url(#paint)">${body}</g>`);
}

/* ------------------------------------------------------------------ */
/* Sage silk ribbons for the dress code                                */
/* ------------------------------------------------------------------ */

export const RIBBONS = { W: 1000, H: 560 };

function ribbonBow(r, cx, cy, s, colors) {
  const [base, light, dark] = colors;
  let out = "";
  const loop = (dir) => {
    const d = `M${f(cx)} ${f(cy)}C${f(cx + dir * 60 * s)} ${f(cy - 95 * s)} ${f(cx + dir * 170 * s)} ${f(cy - 70 * s)} ${f(cx + dir * 150 * s)} ${f(cy - 5 * s)}C${f(cx + dir * 135 * s)} ${f(cy + 40 * s)} ${f(cx + dir * 60 * s)} ${f(cy + 25 * s)} ${f(cx)} ${f(cy)}Z`;
    out += path(d, base);
    out += path(`M${f(cx + dir * 12 * s)} ${f(cy - 4 * s)}C${f(cx + dir * 60 * s)} ${f(cy - 70 * s)} ${f(cx + dir * 140 * s)} ${f(cy - 55 * s)} ${f(cx + dir * 132 * s)} ${f(cy - 10 * s)}`, "none", `stroke="${light}" stroke-width="${f(14 * s)}" stroke-linecap="round" opacity="0.7"`);
    out += path(`M${f(cx + dir * 20 * s)} ${f(cy + 8 * s)}C${f(cx + dir * 70 * s)} ${f(cy + 26 * s)} ${f(cx + dir * 120 * s)} ${f(cy + 22 * s)} ${f(cx + dir * 140 * s)} ${f(cy)}`, "none", `stroke="${dark}" stroke-width="${f(8 * s)}" stroke-linecap="round" opacity="0.55"`);
  };
  const tail = (dir, len) => {
    const pts = [
      [cx, cy],
      [cx + dir * 40 * s, cy + 70 * s],
      [cx + dir * 30 * s, cy + 150 * s],
      [cx + dir * 80 * s, cy + len * s],
    ];
    out += `<path d="${smoothOpen(pts)}" fill="none" stroke="${base}" stroke-width="${f(38 * s)}" stroke-linecap="butt"/>`;
    out += `<path d="${smoothOpen(pts)}" fill="none" stroke="${light}" stroke-width="${f(12 * s)}" opacity="0.6" transform="translate(${f(-6 * s)} 0)"/>`;
    out += `<path d="${smoothOpen(pts)}" fill="none" stroke="${dark}" stroke-width="${f(6 * s)}" opacity="0.45" transform="translate(${f(10 * s)} 0)"/>`;
  };
  tail(-1, 230);
  tail(1, 200);
  loop(-1);
  loop(1);
  out += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(26 * s)}" ry="${f(22 * s)}" fill="${dark}"/>`;
  out += `<ellipse cx="${f(cx - 4 * s)}" cy="${f(cy - 4 * s)}" rx="${f(16 * s)}" ry="${f(13 * s)}" fill="${light}" opacity="0.85"/>`;
  return out;
}

export function ribbonsSvg() {
  const { W, H } = RIBBONS;
  const r = makeRng(555);
  const defs = impastoFilter("paint", W, H, { relief: 1.6, warp: 4, seed: 6 });
  const sage = ["#a5af97", "#c9cfbd", "#7f8b73"];
  const leafC = { fill: "#8d9a7f", light: "#b8c1a8", dark: "#6c7860", vein: "#d0d6c4" };
  let body = "";
  // leafy sprigs
  for (const [x0, y0, a0, n] of [[60, 420, -0.4, 9], [300, 470, -0.15, 8], [640, 500, -0.25, 9], [880, 440, -0.6, 7]]) {
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const x = x0 + Math.cos(a0) * t * 260;
      const y = y0 + Math.sin(a0) * t * 260;
      body += leaf(r, x, y, r.range(50, 80), r.range(22, 32), a0 + (i % 2 ? 0.9 : -0.9) + r.range(-0.2, 0.2), leafC);
    }
  }
  body += ribbonBow(r, 230, 250, 1, sage);
  body += ribbonBow(r, 760, 300, 0.85, sage);
  body += dabsInEllipse(r, { cx: 500, cy: 420, rx: 480, ry: 80, count: 160, palette: ["#b8c1a8", "#a5af97", "#d6dacb"], len: [10, 24], w: [4, 8], angle: 0, angJitter: Math.PI, opacity: [0.4, 0.8] });
  return svgDoc(W, H, defs, `<g filter="url(#paint)">${body}</g>`);
}

export { jitter, knife, paint, dabsInRect };
