// Eight small painted vignettes for the wedding-day programme.
import { blossom, bud, dabsInEllipse, f, impastoFilter, knife, leaf, makeRng, paint, path, poly, smoothClosed, smoothOpen, svgDoc } from "./lib.mjs";

export const ICON = { W: 260, H: 260 };

const LEAVES = { fill: "#3f6a42", light: "#74995f", dark: "#28472e", vein: "#9fbb8c" };
const PINK = { petal: "#f9e3e8", tint: "#e993a8", center: "#e7c45f", stamen: "#9b3f52", outline: "#c98a98" };
const WHITE = { petal: "#fdf9f4", tint: "#f2d9d9", center: "#e3c560", stamen: "#9c6b3a", outline: "#cdbdb5" };

function rose(r, x, y, s, pal = ["#e48aa0", "#cf6c86", "#f3b3c2", "#b9506c"]) {
  let out = `<circle cx="${f(x)}" cy="${f(y)}" r="${f(s)}" fill="${pal[1]}"/>`;
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + r.range(-0.3, 0.3);
    const d = s * (k < 4 ? 0.55 : 0.25);
    out += knife(x + Math.cos(a) * d, y + Math.sin(a) * d, s * 1.05, s * 0.42, a + Math.PI / 2, paint(r, pal), { ridge: 0.4, shadow: 0.25 });
  }
  out += `<path d="M${f(x - s * 0.3)} ${f(y)}q${f(s * 0.3)} ${f(-s * 0.35)} ${f(s * 0.55)} ${f(-s * 0.05)}" fill="none" stroke="${pal[3]}" stroke-width="${f(s * 0.12)}" stroke-linecap="round"/>`;
  return out;
}

function bow(r, x, y, s, pal = ["#eaa6b6", "#f6cbd5", "#c97a8e"]) {
  const [base, light, dark] = pal;
  let out = "";
  for (const dir of [-1, 1]) {
    out += path(`M${f(x)} ${f(y)}C${f(x + dir * 18 * s)} ${f(y - 26 * s)} ${f(x + dir * 46 * s)} ${f(y - 20 * s)} ${f(x + dir * 40 * s)} ${f(y)}C${f(x + dir * 36 * s)} ${f(y + 14 * s)} ${f(x + dir * 16 * s)} ${f(y + 8 * s)} ${f(x)} ${f(y)}Z`, base);
    out += path(`M${f(x + dir * 6 * s)} ${f(y - 2 * s)}C${f(x + dir * 18 * s)} ${f(y - 18 * s)} ${f(x + dir * 36 * s)} ${f(y - 15 * s)} ${f(x + dir * 34 * s)} ${f(y - 3 * s)}`, "none", `stroke="${light}" stroke-width="${f(4 * s)}" stroke-linecap="round" opacity="0.8"`);
    out += `<path d="${smoothOpen([[x, y], [x + dir * 10 * s, y + 20 * s], [x + dir * 6 * s, y + 38 * s], [x + dir * 18 * s, y + 52 * s]])}" fill="none" stroke="${base}" stroke-width="${f(9 * s)}"/>`;
    out += `<path d="${smoothOpen([[x, y], [x + dir * 10 * s, y + 20 * s], [x + dir * 6 * s, y + 38 * s], [x + dir * 18 * s, y + 52 * s]])}" fill="none" stroke="${dark}" stroke-width="${f(2.5 * s)}" opacity="0.6" transform="translate(${f(dir * 3 * s)} 0)"/>`;
  }
  out += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(7 * s)}" ry="${f(6 * s)}" fill="${dark}"/>`;
  return out;
}

function coupe(r, x, y, s, tilt, drink = "#f2d98f", glass = "#9aa6ba") {
  // x,y = base centre
  const c = Math.cos(tilt);
  const sn = Math.sin(tilt);
  const T = (u, v) => [x + u * c - v * sn, y + u * sn + v * c];
  const P = (u, v) => T(u, v).map(f).join(" ");
  let out = "";
  out += `<path d="M${P(-26 * s, 0)}Q${P(0, -6 * s)} ${P(26 * s, 0)}" fill="none" stroke="${glass}" stroke-width="${f(4 * s)}" stroke-linecap="round"/>`;
  out += `<path d="M${P(0, -3 * s)}L${P(0, -62 * s)}" stroke="${glass}" stroke-width="${f(4 * s)}" stroke-linecap="round"/>`;
  out += path(`M${P(-42 * s, -100 * s)}Q${P(-38 * s, -62 * s)} ${P(0, -62 * s)}Q${P(38 * s, -62 * s)} ${P(42 * s, -100 * s)}Z`, drink, 'opacity="0.9"');
  out += path(`M${P(-42 * s, -100 * s)}Q${P(0, -92 * s)} ${P(42 * s, -100 * s)}`, "none", `stroke="#fff6dc" stroke-width="${f(5 * s)}" opacity="0.9"`);
  out += path(`M${P(-42 * s, -100 * s)}Q${P(-38 * s, -62 * s)} ${P(0, -62 * s)}Q${P(38 * s, -62 * s)} ${P(42 * s, -100 * s)}`, "none", `stroke="${glass}" stroke-width="${f(3.5 * s)}"`);
  out += path(`M${P(-30 * s, -92 * s)}Q${P(-26 * s, -72 * s)} ${P(-8 * s, -68 * s)}`, "none", `stroke="#ffffff" stroke-width="${f(4 * s)}" stroke-linecap="round" opacity="0.85"`);
  for (let i = 0; i < 4; i++) {
    const [bx, by] = T(r.range(-20, 20) * s, r.range(-90, -70) * s);
    out += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(r.range(1.5, 3) * s)}" fill="#fffbe9"/>`;
  }
  return out;
}

const icons = {
  drinks(r) {
    let out = "";
    out += leaf(r, 70, 220, 60, 24, -2.6, LEAVES) + leaf(r, 190, 222, 60, 24, -0.5, LEAVES);
    out += coupe(r, 92, 230, 1, 0.32);
    out += coupe(r, 168, 230, 1, -0.32);
    out += bow(r, 130, 176, 1);
    out += blossom(r, 70, 206, 44, PINK) + blossom(r, 196, 210, 40, WHITE) + blossom(r, 104, 226, 34, WHITE) + bud(r, 160, 228, 22, -0.4, { fill: "#e7899f" });
    return out;
  },
  arch(r) {
    let out = "";
    // arch frame
    out += `<path d="M64 236L64 120A66 66 0 0 1 196 120L196 236" fill="none" stroke="#e9dfcf" stroke-width="9"/>`;
    out += `<path d="M64 236L64 120A66 66 0 0 1 196 120L196 236" fill="none" stroke="#b9a98f" stroke-width="2.5" transform="translate(3 2)"/>`;
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      if (t < 0.25) pts.push([64, 236 - (t / 0.25) * 116]);
      else if (t > 0.75) pts.push([196, 120 + ((t - 0.75) / 0.25) * 116]);
      else {
        const a = Math.PI + ((t - 0.25) / 0.5) * Math.PI;
        pts.push([130 + Math.cos(a) * 66, 120 + Math.sin(a) * 66]);
      }
    }
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i];
      out += leaf(r, x, y, r.range(28, 40), r.range(12, 18), r.range(0, Math.PI * 2), LEAVES);
    }
    for (let i = 0; i < pts.length; i += 2) {
      const [x, y] = pts[i];
      if (r.chance(0.5)) out += blossom(r, x + r.range(-8, 8), y + r.range(-8, 8), r.range(26, 36), r.chance(0.5) ? PINK : WHITE);
      else out += rose(r, x + r.range(-6, 6), y + r.range(-6, 6), r.range(9, 13), r.chance(0.5) ? ["#f2c4cf", "#e79aab", "#fbe3e8", "#c97a8e"] : ["#fbf3ee", "#efdcd8", "#ffffff", "#cdb9b0"]);
    }
    return out;
  },
  cocktail(r) {
    let out = "";
    out += leaf(r, 120, 232, 70, 28, -2.7, LEAVES) + leaf(r, 140, 232, 70, 28, -0.4, LEAVES) + leaf(r, 130, 236, 60, 22, -1.9, LEAVES);
    out += coupe(r, 130, 238, 1.25, 0, "#f3a06f");
    // orange slice on the rim
    out += `<circle cx="178" cy="112" r="22" fill="#f6b25a"/><circle cx="178" cy="112" r="17" fill="#fbd27e"/>`;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      out += `<path d="M178 112L${f(178 + Math.cos(a) * 16)} ${f(112 + Math.sin(a) * 16)}" stroke="#f6b25a" stroke-width="2"/>`;
    }
    out += rose(r, 84, 222, 22) + rose(r, 178, 224, 18, ["#fbf3ee", "#efdcd8", "#ffffff", "#cdb9b0"]) + rose(r, 128, 240, 16, ["#f2c4cf", "#e79aab", "#fbe3e8", "#c97a8e"]);
    return out;
  },
  dinner(r) {
    let out = "";
    // plate
    out += `<ellipse cx="130" cy="140" rx="82" ry="78" fill="#c9c3c8"/>`;
    out += `<ellipse cx="128" cy="136" rx="80" ry="76" fill="#fbf8f4"/>`;
    out += `<ellipse cx="128" cy="136" rx="58" ry="55" fill="none" stroke="#d9d0cc" stroke-width="3"/>`;
    out += dabsInEllipse(r, { cx: 128, cy: 136, rx: 72, ry: 68, count: 60, palette: ["#ffffff", "#f3eee9", "#ebe5e2"], len: [10, 20], w: [4, 7], angle: (x, y) => Math.atan2(y - 136, x - 128) + Math.PI / 2, angJitter: 0.2, ridge: 0.3, shadow: 0.15 });
    // fork
    out += `<path d="M30 70L30 230" stroke="#a8a39f" stroke-width="7" stroke-linecap="round"/>`;
    for (const dx of [-8, -2.7, 2.7, 8]) out += `<path d="M${30 + dx} 50L${30 + dx} 92" stroke="#a8a39f" stroke-width="3" stroke-linecap="round"/>`;
    out += `<path d="M22 90Q30 104 38 90" fill="#a8a39f" stroke="#a8a39f" stroke-width="3"/>`;
    // knife
    out += `<path d="M228 50Q244 90 236 140L230 140Z" fill="#b9b4b0"/><path d="M232 138L232 232" stroke="#a8a39f" stroke-width="7" stroke-linecap="round"/>`;
    // napkin + bow
    out += path("M92 150L168 150L176 186L84 186Z", "#f1c9d1");
    out += path("M92 150L168 150L172 160L88 160Z", "#f7dce2");
    out += bow(r, 128, 150, 0.75, ["#c86d82", "#e595a8", "#9f4f63"]);
    out += blossom(r, 110, 112, 30, WHITE) + leaf(r, 126, 108, 34, 14, -0.4, LEAVES);
    return out;
  },
  cake(r) {
    let out = "";
    // stand
    out += `<path d="M60 226L200 226" stroke="#cdbfae" stroke-width="7" stroke-linecap="round"/><path d="M130 226L130 244M104 246L156 246" stroke="#cdbfae" stroke-width="6" stroke-linecap="round"/>`;
    // tiers
    const tier = (x, y, w, h) => {
      let o = path(`M${x} ${y}L${x + w} ${y}L${x + w} ${y + h}Q${x + w / 2} ${y + h + 10} ${x} ${y + h}Z`, "#f8f1e8");
      o += `<ellipse cx="${x + w / 2}" cy="${y}" rx="${w / 2}" ry="9" fill="#fffaf3"/>`;
      o += dabsInEllipse(r, { cx: x + w / 2, cy: y + h / 2, rx: w / 2, ry: h / 2, count: Math.round(w / 3), palette: ["#fbf5ec", "#efe4d6", "#ffffff"], len: [8, 16], w: [4, 7], angle: Math.PI / 2, angJitter: 0.2, ridge: 0.3, shadow: 0.2 });
      o += path(`M${x + w - 12} ${y + 4}L${x + w} ${y + 4}L${x + w} ${y + h}L${x + w - 12} ${y + h + 2}Z`, "#e3d6c6", 'opacity="0.7"');
      return o;
    };
    out += tier(70, 150, 120, 70);
    out += tier(96, 92, 68, 56);
    // flowers cascading
    out += leaf(r, 160, 98, 40, 16, -0.6, LEAVES) + leaf(r, 168, 150, 44, 18, 0.3, LEAVES) + leaf(r, 80, 160, 40, 16, 2.8, LEAVES) + leaf(r, 150, 210, 40, 16, 0.6, LEAVES);
    out += rose(r, 156, 96, 15, ["#c45c73", "#a94660", "#e08aa0", "#7e2f43"]);
    out += rose(r, 174, 146, 14, ["#e48aa0", "#cf6c86", "#f3b3c2", "#b9506c"]);
    out += rose(r, 162, 200, 13, ["#c45c73", "#a94660", "#e08aa0", "#7e2f43"]);
    out += blossom(r, 84, 152, 30, PINK) + blossom(r, 112, 92, 24, WHITE) + bud(r, 186, 172, 18, 1, { fill: "#d76f8a" });
    return out;
  },
  dance(r) {
    let out = "";
    // man (navy suit)
    out += path("M140 118Q156 112 166 124L170 236L152 236L148 172L140 236L122 236L126 150Z", "#2f3550");
    out += dabsInEllipse(r, { cx: 146, cy: 170, rx: 18, ry: 56, count: 50, palette: ["#2f3550", "#3a4262", "#262b42", "#4a5376"], len: [8, 16], w: [3, 6], angle: Math.PI / 2, angJitter: 0.3 });
    out += `<circle cx="150" cy="100" r="13" fill="#e8c4a8"/><path d="M137 98Q140 82 152 84Q163 86 163 98Q156 90 146 92Z" fill="#4a3428"/>`;
    // man's arm raised holding hers
    out += `<path d="M160 128Q176 96 150 62" fill="none" stroke="#2f3550" stroke-width="10" stroke-linecap="round"/>`;
    // woman (white gown)
    out += path("M104 112Q116 106 124 116L130 160Q150 196 162 236L52 236Q76 196 96 160Z", "#fbf7f1");
    out += dabsInEllipse(r, { cx: 108, cy: 196, rx: 48, ry: 36, count: 90, palette: ["#fbf7f1", "#efe7df", "#ffffff", "#e6ddd7"], len: [10, 20], w: [4, 8], angle: (x) => Math.PI / 2 + (x - 108) / 60, angJitter: 0.2 });
    out += path("M52 236Q30 226 40 210Q64 222 70 232Z", "#efe7df");
    out += `<circle cx="112" cy="94" r="12" fill="#ecc9ae"/><path d="M100 92Q104 78 116 80Q126 84 124 94Q116 86 106 90Z" fill="#7a5238"/><circle cx="104" cy="84" r="6" fill="#7a5238"/>`;
    out += `<path d="M120 122Q138 96 148 64" fill="none" stroke="#ecc9ae" stroke-width="6" stroke-linecap="round"/>`;
    out += `<path d="M100 124Q84 140 92 156" fill="none" stroke="#ecc9ae" stroke-width="6" stroke-linecap="round"/>`;
    out += blossom(r, 70, 226, 26, PINK) + blossom(r, 190, 230, 24, WHITE) + leaf(r, 180, 236, 30, 12, -0.3, LEAVES);
    return out;
  },
  disco(r) {
    let out = "";
    out += `<path d="M130 18L130 70" stroke="#9e9a9a" stroke-width="3"/>`;
    out += `<circle cx="130" cy="150" r="76" fill="#9ea3ad"/>`;
    // facets
    for (let row = -6; row <= 6; row++) {
      const y = 150 + row * 11.5;
      const half = Math.sqrt(Math.max(0, 76 * 76 - (y - 150) * (y - 150)));
      const n = Math.max(2, Math.round(half / 9));
      for (let i = 0; i < n * 2; i++) {
        const x = 130 - half + (i + 0.5) * (half / n);
        const lit = (x - 100) * (x - 100) + (y - 120) * (y - 120) < 1800;
        const c = lit ? paint(r, ["#ffffff", "#f1f3f8", "#e3e7f0"]) : paint(r, ["#a9afba", "#8f95a2", "#c4c9d3", "#7d8391", "#b7bcc7", "#d8c7d6"]);
        out += `<rect x="${f(x - 4.4)}" y="${f(y - 5.4)}" width="${f(8.6)}" height="${f(10.6)}" fill="${c}" rx="1"/>`;
      }
    }
    out += `<circle cx="130" cy="150" r="76" fill="none" stroke="#6e7380" stroke-width="2.5"/>`;
    out += `<circle cx="104" cy="122" r="9" fill="#ffffff" opacity="0.9"/>`;
    out += bow(r, 130, 74, 1.05);
    return out;
  },
  moon(r) {
    let out = "";
    // crescent
    out += path("M150 46A82 82 0 1 0 214 168A66 66 0 1 1 150 46Z", "#ebc96f");
    out += dabsInEllipse(r, { cx: 120, cy: 120, rx: 62, ry: 70, count: 70, palette: ["#f3d98c", "#e6bf5f", "#f7e4a6", "#d9ad4b"], len: [10, 20], w: [4, 7], angle: (x, y) => Math.atan2(y - 128, x - 132) + Math.PI / 2, angJitter: 0.3 });
    defsMoon = `<clipPath id="moonclip"><path d="M150 46A82 82 0 1 0 214 168A66 66 0 1 1 150 46Z"/></clipPath>`;
    out = `<g clip-path="url(#moonclip)">${out}</g>`;
    // cloud
    const cl = [
      [80, 200, 30],
      [116, 190, 36],
      [156, 200, 30],
      [186, 210, 22],
      [52, 212, 20],
    ];
    for (const [x, y, s] of cl) {
      out += `<circle cx="${x}" cy="${y}" r="${s}" fill="#c9c4e3"/>`;
      out += dabsInEllipse(r, { cx: x - s * 0.2, cy: y - s * 0.3, rx: s * 0.8, ry: s * 0.5, count: Math.round(s / 2), palette: ["#f4eef2", "#e6dff0", "#ffffff"], len: [8, 16], w: [4, 7], angle: 0, angJitter: 0.5 });
      out += dabsInEllipse(r, { cx: x, cy: y + s * 0.4, rx: s * 0.8, ry: s * 0.35, count: Math.round(s / 3), palette: ["#a6a3d4", "#9899cc", "#b3a9d2"], len: [8, 14], w: [3, 6], angle: 0, angJitter: 0.4 });
    }
    // stars
    const star = (x, y, s) => {
      const pts = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const rr = i % 2 ? s * 0.38 : s;
        pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
      }
      return path(poly(pts), "#e3b94f") + `<circle cx="${x}" cy="${y}" r="${f(s * 0.25)}" fill="#f7e3a2"/>`;
    };
    out += star(214, 58, 14) + star(46, 70, 10) + star(226, 120, 8) + star(30, 140, 7);
    return out;
  },
};

let defsMoon = "";

export const ICON_NAMES = Object.keys(icons);

export function iconSvg(name) {
  const { W, H } = ICON;
  const r = makeRng(name.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0);
  defsMoon = "";
  const body = icons[name](r);
  const defs = impastoFilter("paint", W, H, { relief: 1.6, warp: 2, warpFreq: 0.07, seed: 3, lum: 0.75 }) + defsMoon;
  return svgDoc(W, H, defs, `<g filter="url(#paint)">${body}</g>`);
}

export { smoothClosed };
