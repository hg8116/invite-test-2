// Countdown frame: a hand-painted blue & white checked border draped in
// apple blossom garlands. The centre is transparent.
import { along, blossom, bud, f, impastoFilter, jitter, knife, leaf, makeRng, paint, path, poly, svgDoc } from "./lib.mjs";

export const FRAME = { W: 900, H: 1200 };

const APPLE = { petal: "#fcf6f3", tint: "#f2bcc8", center: "#e3c560", stamen: "#a3485a", outline: "#d3a7b0" };
const LEAVES = { fill: "#3f6a42", light: "#74995f", dark: "#28472e", vein: "#9fbb8c" };

function garland(r, pts, { leaves = 14, flowers = 6, buds = 5, size = [52, 74] } = {}) {
  let back = "";
  let mid = "";
  let front = "";
  for (let i = 0; i < leaves; i++) {
    const p = along(pts, (i + r.range(0, 1)) / leaves);
    const a = p.a + r.sign() * r.range(0.5, 1.6);
    back += leaf(r, p.x, p.y, r.range(55, 95), r.range(24, 38), a, LEAVES);
  }
  for (let i = 0; i < buds; i++) {
    const p = along(pts, r());
    mid += bud(r, p.x + r.range(-30, 30), p.y + r.range(-30, 30), r.range(22, 32), r.range(0, Math.PI * 2), { fill: "#e7899f", light: "#f7c6d1", sepal: "#3f6a42" });
  }
  for (let i = 0; i < flowers; i++) {
    const p = along(pts, (i + r.range(0.1, 0.9)) / flowers);
    front += blossom(r, p.x + r.range(-18, 18), p.y + r.range(-18, 18), r.range(size[0], size[1]), { ...APPLE, squash: r.range(0.75, 1) });
  }
  return back + mid + front;
}

export function frameSvg() {
  const { W, H } = FRAME;
  const r = makeRng(31337);
  const defs = impastoFilter("paint", W, H, { relief: 2.3, warp: 3.5, warpFreq: 0.05, seed: 5 });
  let body = "";
  const o = { x0: 80, y0: 80, x1: W - 80, y1: H - 80 };
  const band = 78;
  const cell = band / 2;
  const blues = ["#2f5fc8", "#3a6ad0", "#2953b5", "#4774d6", "#2448a6"];
  const whites = ["#f5f2ec", "#ebe7e4", "#f8f4ee", "#e4e2e6"];
  for (let y = o.y0; y < o.y1 - 0.1; y += cell) {
    for (let x = o.x0; x < o.x1 - 0.1; x += cell) {
      const inside = x >= o.x0 + band - 0.1 && x < o.x1 - band - 0.1 && y >= o.y0 + band - 0.1 && y < o.y1 - band - 0.1;
      if (inside) continue;
      const i = Math.round((x - o.x0) / cell);
      const j = Math.round((y - o.y0) / cell);
      const isBlue = (i + j) % 2 === 0;
      const pal = isBlue ? blues : whites;
      const cw = Math.min(cell, o.x1 - x);
      const ch = Math.min(cell, o.y1 - y);
      body += path(poly([[x, y], [x + cw, y], [x + cw, y + ch], [x, y + ch]]), paint(r, pal, { l: 0.02 }));
      for (let k = 0; k < 4; k++) {
        body += knife(x + r.range(6, cw - 6), y + r.range(6, ch - 6), r.range(14, 24), r.range(6, 10), r.range(-0.4, 0.4) + (r.chance(0.5) ? Math.PI / 2 : 0), paint(r, pal, { l: 0.04 }), { ridge: 0.3, shadow: 0.2 });
      }
    }
  }
  // dark blue edge lines
  const line = (x0, y0, x1, y1) => `<path d="M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}" stroke="#1f3f8f" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  for (const inset of [0, band]) {
    const a = { x0: o.x0 + inset, y0: o.y0 + inset, x1: o.x1 - inset, y1: o.y1 - inset };
    body += line(a.x0, a.y0, a.x1, a.y0) + line(a.x1, a.y0, a.x1, a.y1) + line(a.x1, a.y1, a.x0, a.y1) + line(a.x0, a.y1, a.x0, a.y0);
  }
  // garlands
  body += garland(r, [[340, 70], [200, 80], [110, 150], [80, 300], [100, 450], [70, 620], [95, 720]], { leaves: 26, flowers: 9, buds: 8 });
  body += garland(r, [[600, 75], [740, 85], [830, 160], [835, 300]], { leaves: 14, flowers: 5, buds: 4 });
  body += garland(r, [[845, 470], [820, 600], [850, 740]], { leaves: 10, flowers: 4, buds: 3 });
  body += garland(r, [[70, 930], [90, 1080], [200, 1135], [380, 1125]], { leaves: 16, flowers: 6, buds: 5 });
  body += garland(r, [[560, 1135], [700, 1130], [820, 1075], [835, 930]], { leaves: 16, flowers: 6, buds: 5 });
  return svgDoc(W, H, defs, `<g filter="url(#paint)">${body}</g>`);
}

export { jitter };
