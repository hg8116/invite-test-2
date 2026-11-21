// Frayed silk-chiffon ribbon (vertical strip) and bow for the envelope.
import { f, svgDoc } from "./lib.mjs";

export const STRIP = { W: 180, H: 1200 };
export const BOW = { W: 640, H: 520 };

const fray = (id, seed, scale = 7) => `<filter id="${id}" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.7 0.05" numOctaves="3" seed="${seed}" result="n"/>
<feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="d"/>
<feTurbulence type="fractalNoise" baseFrequency="0.012 0.35" numOctaves="2" seed="${seed + 3}" result="weave"/>
<feColorMatrix in="weave" type="matrix" values="0 0 0 0 0.93  0 0 0 0 0.92  0 0 0 0 0.94  0 0 0 0.5 0" result="weaveC"/>
<feComposite in="weaveC" in2="d" operator="in" result="weaveIn"/>
<feBlend in="weaveIn" in2="d" mode="multiply" result="tex"/>
<feComposite in="tex" in2="d" operator="in" result="ribbon"/>
<feGaussianBlur in="d" stdDeviation="6" result="b"/>
<feOffset in="b" dx="4" dy="6" result="o"/>
<feColorMatrix in="o" type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.2  0 0 0 0 0.3  0 0 0 0.32 0" result="shadow"/>
<feMerge><feMergeNode in="shadow"/><feMergeNode in="ribbon"/></feMerge>
</filter>`;

const sheen = (id, dir = "x") =>
  `<linearGradient id="${id}" ${dir === "x" ? 'x1="0" y1="0" x2="1" y2="0"' : 'x1="0" y1="0" x2="0" y2="1"'}>
<stop offset="0" stop-color="#e2dfe4"/><stop offset="0.18" stop-color="#fbfaf9"/><stop offset="0.42" stop-color="#eeebef"/><stop offset="0.6" stop-color="#fdfcfb"/><stop offset="0.85" stop-color="#e9e6ea"/><stop offset="1" stop-color="#d9d5db"/></linearGradient>`;

export function stripSvg() {
  const { W, H } = STRIP;
  const defs = fray("fray", 11, 9) + sheen("sheen");
  // slightly wavy band
  let d = `M30 0`;
  for (let y = 0; y <= H; y += 100) d += `L${f(30 + Math.sin(y / 170) * 4)} ${y}`;
  for (let y = H; y >= 0; y -= 100) d += `L${f(150 + Math.sin(y / 150 + 1) * 4)} ${y}`;
  d += "Z";
  // soft longitudinal folds of the chiffon
  let folds = "";
  for (const [x, w, c, o] of [[58, 6, "#ffffff", 0.9], [76, 10, "#d9d5dc", 0.5], [104, 5, "#ffffff", 0.85], [126, 9, "#d6d2da", 0.45]]) {
    folds += `<path d="M${x} 0C${x + 4} ${H * 0.3} ${x - 4} ${H * 0.6} ${x + 2} ${H}" stroke="${c}" stroke-width="${w}" opacity="${o}" fill="none"/>`;
  }
  return svgDoc(W, H, defs, `<g opacity="0.9" filter="url(#fray)"><path d="${d}" fill="url(#sheen)"/>${folds}</g>`);
}

export function bowSvg() {
  const { W, H } = BOW;
  const cx = 320;
  const cy = 200;
  let defs = fray("fray", 23, 8);
  defs += `<radialGradient id="loopL" cx="0.35" cy="0.4" r="0.75"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#f1eff2"/><stop offset="1" stop-color="#cfcbd3"/></radialGradient>`;
  defs += `<radialGradient id="loopR" cx="0.6" cy="0.4" r="0.75"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#f1eff2"/><stop offset="1" stop-color="#cdc9d1"/></radialGradient>`;
  defs += sheen("tail");
  defs += `<radialGradient id="knot" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d6d2d8"/></radialGradient>`;
  let body = "";
  // tails
  body += `<path d="M${cx - 18} ${cy + 10}C${cx - 60} ${cy + 90} ${cx - 120} ${cy + 180} ${cx - 175} ${cy + 300}L${cx - 105} ${cy + 315}C${cx - 70} ${cy + 210} ${cx - 30} ${cy + 120} ${cx + 8} ${cy + 22}Z" fill="url(#tail)" filter="url(#fray)"/>`;
  body += `<path d="M${cx + 10} ${cy + 12}C${cx + 50} ${cy + 100} ${cx + 110} ${cy + 190} ${cx + 160} ${cy + 290}L${cx + 230} ${cy + 268}C${cx + 160} ${cy + 180} ${cx + 80} ${cy + 100} ${cx + 30} ${cy + 6}Z" fill="url(#tail)" filter="url(#fray)"/>`;
  // loops
  body += `<path d="M${cx} ${cy}C${cx - 60} ${cy - 120} ${cx - 250} ${cy - 150} ${cx - 280} ${cy - 50}C${cx - 300} ${cy + 30} ${cx - 220} ${cy + 80} ${cx - 120} ${cy + 50}C${cx - 70} ${cy + 35} ${cx - 30} ${cy + 20} ${cx} ${cy}Z" fill="url(#loopL)" filter="url(#fray)"/>`;
  body += `<path d="M${cx} ${cy}C${cx + 60} ${cy - 125} ${cx + 255} ${cy - 140} ${cx + 282} ${cy - 40}C${cx + 300} ${cy + 35} ${cx + 215} ${cy + 80} ${cx + 118} ${cy + 48}C${cx + 70} ${cy + 33} ${cx + 30} ${cy + 18} ${cx} ${cy}Z" fill="url(#loopR)" filter="url(#fray)"/>`;
  // inner fold shadows
  body += `<path d="M${cx - 20} ${cy - 6}C${cx - 90} ${cy - 70} ${cx - 200} ${cy - 80} ${cx - 230} ${cy - 30}" fill="none" stroke="#c9c4cc" stroke-width="10" stroke-linecap="round" opacity="0.55"/>`;
  body += `<path d="M${cx + 20} ${cy - 6}C${cx + 90} ${cy - 70} ${cx + 200} ${cy - 78} ${cx + 232} ${cy - 26}" fill="none" stroke="#c9c4cc" stroke-width="10" stroke-linecap="round" opacity="0.55"/>`;
  // knot
  body += `<ellipse cx="${cx}" cy="${cy + 4}" rx="44" ry="40" fill="url(#knot)" filter="url(#fray)"/>`;
  body += `<path d="M${cx - 26} ${cy - 10}Q${cx} ${cy - 26} ${cx + 24} ${cy - 8}" fill="none" stroke="#d5d0d8" stroke-width="6" stroke-linecap="round" opacity="0.8"/>`;
  return svgDoc(W, H, defs, body);
}
