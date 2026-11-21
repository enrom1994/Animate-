// Max, one drawing for every shot: the same character at the counter close-up, through the shop window, anywhere.
// Local units: origin 10 units above the counter top; 1 unit = 1.27 mm, so his head top is 1.80 m and the counter top 0.95 m
// above the floor. drawMax(...) places him in any scene from his feet position and the scene's pixels per metre.
import { AUDIT, S, tx, INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, dot } from './toon.js';
import { eye, mouth, hand, sweat } from './faces.js';
export const UNIT = .00127, ORIGIN_H = .963;   // metres per unit; the origin's height above the floor
const C = { skin: '#e9b98f', skinS: '#cf9a6f', cap: '#e8742e', capS: '#c45a1c', vest: '#f08a24', vestS: '#cf6c10', strip: '#dfe4e6', tee: '#7d8086', teeS: '#63666c' };
const DEF = t => ({ look: [.15, .55], lid: .52 + .05 * Math.sin(t * 1.3), tilt: -.05, sigh: 0, blink: false });
// the upper body and head; call after translate() to his origin
export function maxUpper(t, act = {}) { const A = { ...DEF(t), ...act };
  shape(spline([[-190, 40], [-170, -150], [-90, -230], [90, -230], [170, -150], [190, 40]]), { fill: C.tee, lw: 7, shade: () => fillOnly(spline([[60, -230], [190, -150], [200, 60], [80, 60]]), C.teeS, { boil: .4 }) });
  for (const s of [-1, 1]) { shape(spline([[s * 30, -228], [s * 150, -170], [s * 180, 40], [s * 50, 40], [s * 40, -120]]), { fill: C.vest, lw: 7, shade: () => fillOnly(rect(s > 0 ? 100 : -200, -230, 100, 280), C.vestS, { boil: .4 }) });
    shape(rect(s > 0 ? 58 : -170, -110, 112, 26), { fill: C.strip, lw: 5 }); shape(rect(s > 0 ? 58 : -170, -40, 112, 26), { fill: C.strip, lw: 5 }); }
  // arms forward onto the counter, hands flat
  // neck and the big round head, hung forward
  shape(rr(-36, -290, 72, 80, 20), { fill: C.skin, lw: 6, shade: () => fillOnly(rect(-40, -290, 80, 30), C.skinS, { boil: .3 }) });
  push(); translate(0, -470 + 18 * A.sigh); rotate(A.tilt);
  { const [a0, b0] = tx(-200, -190), [a1, b1] = tx(200, 190); if (A.subject !== false) AUDIT.subject(A.subjectName || 'Max (at the counter)', [a0, b0, a1, b1], A.minH || 120); }
  shape(ell(0, 0, 200, 190, 80), { fill: C.skin, lw: 8, shade: () => { fillOnly(spline([[60, -200], [230, -40], [210, 140], [80, 210], [150, 40]]), C.skinS, { boil: .3 }); } });
  for (const s of [-1, 1]) shape(ell(s * 196, 14, 26, 36, 18), { fill: C.skin, lw: 6, shade: () => fillOnly(ell(s * 192, 16, 10, 18, 12), C.skinS, { boil: .3 }) });
  // the cap: crown, front panel shading, a long bill, a button
  shape(spline([[-196, -40], [-180, -140], [-90, -200], [60, -206], [170, -150], [200, -40], [0, -64]]), { fill: C.cap, lw: 7, shade: () => fillOnly(spline([[60, -206], [200, -150], [210, -30], [90, -50]]), C.capS, { boil: .4 }) });
  shape(spline([[-210, -48], [-60, -86], [120, -80], [250, -30], [240, -6], [100, -40], [-80, -42], [-214, -24]]), { fill: C.capS, lw: 7 });
  dot(-10, -196, 9, INK);
  // tired eyes, inner brows up, a small frown, a sweat drop
  const lid = A.blink ? 1 : A.lid;
  eye(-70, 40, 58, 62, { lid, look: A.look, pupil: 8, skin: C.skin, lw: 7 }); eye(70, 40, 58, 62, { lid, look: A.look, pupil: 8, skin: C.skin, lw: 7 });
  stroke(spline([[-130, -8], [-80, -24], [-30, -6]], false), 9); stroke(spline([[30, -6], [80, -24], [130, -8]], false), 9);
  for (const [ex] of [[-70], [70]]) stroke(arc(ex, 108, 40, 12, Math.PI * .2, Math.PI * .8, 10), 4);
  shape(spline([[-4, 64], [14, 96], [0, 112], [-16, 104]]), { fill: C.skin, lw: 6 });
  mouth(0, 150, 70, { o: .35 * A.sigh, w: 1 - .3 * A.sigh, sm: -.6, lw: 7 });
  sweat(178, -60 + (t * 30 % 40), 1.3);
  pop();
}
// the forearms resting on the counter, hands flat; drawn after the counter so the hands lie on it
export function maxArms() {
  for (const s of [-1, 1]) { shape(noodle([s * 160, -180], [s * 175, -60], s * 10, 62, 56), { fill: C.tee, lw: 7, shade: () => fillOnly(rect(s > 0 ? 160 : -240, -200, 80, 160), C.teeS, { boil: .3 }) });
    shape(noodle([s * 175, -70], [s * 95, 55], s * -20, 48, 42), { fill: C.skin, lw: 7, shade: () => fillOnly(rect(s > 0 ? 140 : -200, -80, 60, 140), C.skinS, { boil: .3 }) });
    hand(s * 70, 62, s > 0 ? Math.PI : 0, 30, C.skin); }
}
// place Max in a scene: (sx, sy) = his origin on screen, k = pixels per unit (pixels per metre x UNIT)
export function drawMax(t, sx, sy, k, act = {}, part = 'upper') { const lw0 = S.lwScale; S.lwScale = lw0 * Math.max(.3, Math.min(1, k));   // the ink thins as he gets smaller
  push(); translate(sx, sy); scale(k); if (part === 'upper') maxUpper(t, act); else maxArms(); pop(); S.lwScale = lw0; }
