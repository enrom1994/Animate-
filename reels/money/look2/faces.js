// Face parts from the Lemo-Opuscar scifi-toon demo (CC BY 4.0, Lemomo): eyes, mouths, hands. Our cast is drawn in cast.js.
import { clamp, lerp, hash, TAU } from './lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text, S, tx, zoom } from './toon.js';
export const PAL = { skinV: '#f2c9a0', white: '#ffffff', mouthIn: '#4a1a2a', tongue: '#e8637a' };
// —— face parts ——
// Eyes: big white eye + small pupil; lid = fraction covered by the upper eyelid; closed = contented closed eye (arc)
export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = PAL.skinV, closed = false, lw = 6, jitter = 0, lower = 0 } = {}) {
  if (closed) { stroke(arc(cx, cy + ry * .15, rx * .8, ry * .45, Math.PI * .1, Math.PI * .9, 14), lw); return; }
  const E = ell(cx, cy, rx, ry, 36);
  shape(E, {
    fill: PAL.white, lw, shade: () => {
      const px = cx + look[0] * rx * .55 + jitter, py = cy + look[1] * ry * .5;
      dot(px, py, pupil);
      if (lid > 0) {   // upper eyelid
        const yl = cy - ry + lid * 2 * ry;
        fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl + ry * .08]], skin, { boil: .5 });
        stroke([[cx - rx * 1.2, yl + ry * .08], [cx + rx * 1.2, yl]], lw);
      }
      if (lower > 0) { const yb = cy + ry - lower * 2 * ry; fillOnly([[cx - rx * 1.3, yb], [cx + rx * 1.3, yb], [cx + rx * 1.3, cy + ry * 1.4], [cx - rx * 1.3, cy + ry * 1.4]], skin, { boil: .5 }); stroke([[cx - rx * 1.2, yb], [cx + rx * 1.2, yb]], lw * .8); }
    }
  });
}
// Mouth: o open 0..1, w width multiplier, sm mouth corners (+ smile, − frown), skew lopsided mouth
export function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, skew = 0, lw = 6, teeth = true, tongue = true } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k + skew * k], rc = [cx + hw, cy - sm * k - skew * k];
  if (o < .07) {
    stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw);
    stroke([[lc[0] - 4, lc[1] - 5 * Math.sign(sm || 1)], [lc[0] + 3, lc[1] + 3]], lw * .7);
    return;
  }
  const h = o * mw * .62;
  const up = quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), dn = quad(rc, [cx, cy + h + sm * k * .6], lc, 14);
  const P = [...up, ...dn];
  shape(P, {
    fill: PAL.mouthIn, lw, shade: () => {
      if (teeth && o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .32 + (cy - Math.min(lc[1], rc[1])) * .2 + 6), PAL.white, { boil: .3 });
      if (tongue) fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 20), PAL.tongue, { boil: .3 });
    }
  });
}
export function hand(x, y, ang, r = 21, col = PAL.skinV, { fist = false, lw = 6 } = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: col, lw });
  stroke([[r * .2, -r * .15], [r * .75, -r * .45]], lw * .6);   // thumb crease
  pop();
}
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });
