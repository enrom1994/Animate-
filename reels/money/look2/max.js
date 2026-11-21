// Max, one drawing for every shot: the same character at the counter close-up, through the shop window, anywhere.
// Local units: origin 10 units above the counter top; 1 unit = 1.27 mm, so his head top is 1.80 m and the counter top 0.95 m
// above the floor. drawMax(...) places him in any scene from his feet position and the scene's pixels per metre.
import { AUDIT, S, tx, INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, dot } from './toon.js';
import { eye, mouth, hand, sweat } from './faces.js';
export { LEG, C as MAXC };
export const UNIT = .00127, ORIGIN_H = .963;   // metres per unit; the origin's height above the floor
const LEG = { cloth: '#3b4458', clothS: '#2c3444', shoe: '#2a2624', sole: '#d8d2c4', belt: '#2a2624' };
const C = { skin: '#e9b98f', skinS: '#cf9a6f', cap: '#e8742e', capS: '#c45a1c', vest: '#f08a24', vestS: '#cf6c10', strip: '#dfe4e6', tee: '#7d8086', teeS: '#63666c' };
const DEF = t => ({ look: [.15, .55], lid: .52 + .05 * Math.sin(t * 1.3), tilt: -.05, sigh: 0, blink: false });
// the upper body and head; call after translate() to his origin
export function maxUpper(t, act = {}) { const A = { ...DEF(t), ...act };
  shape(spline([[-190, 40], [-170, -150], [-90, -230], [90, -230], [170, -150], [190, 40]]), { fill: C.tee, lw: 7, shade: () => fillOnly(spline([[60, -230], [190, -150], [200, 60], [80, 60]]), C.teeS, { boil: .4 }) });
  if (A.outfit === 'flash') for (const s of [-1, 1]) {   // off duty: a black satin bomber, open, gold zips and cuffs
    shape(spline([[s * 40, -228], [s * 160, -175], [s * 196, 40], [s * 70, 40], [s * 52, -120]]), { fill: '#24222b', lw: 7, shade: () => fillOnly(rect(s > 0 ? 110 : -210, -230, 100, 280), '#17161c', { boil: .4 }) });
    stroke([[s * 52, -200], [s * 70, 38]], 6, { line: '#e3b23c' }); shape(rect(s > 0 ? 70 : -196, 22, 126, 24), { fill: '#3a3842', lw: 5 }); }
  else for (const s of [-1, 1]) { shape(spline([[s * 30, -228], [s * 150, -170], [s * 180, 40], [s * 50, 40], [s * 40, -120]]), { fill: C.vest, lw: 7, shade: () => fillOnly(rect(s > 0 ? 100 : -200, -230, 100, 280), C.vestS, { boil: .4 }) });
    shape(rect(s > 0 ? 58 : -170, -110, 112, 26), { fill: C.strip, lw: 5 }); shape(rect(s > 0 ? 58 : -170, -40, 112, 26), { fill: C.strip, lw: 5 }); }
  if (A.bling) { stroke(spline([[-62, -228], [-40, -150], [0, -118], [40, -150], [62, -228]], false), 9, { line: '#e3b23c' });   // a thick gold chain and a pendant
    shape(spline([[-16, -124], [16, -124], [20, -96], [0, -80], [-20, -96]]), { fill: '#f2c94c', lw: 5 }); }
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
  if (A.shades) { for (const x of [-62, 62]) shape(rr(x - 52, -132, 104, 50, 20), { fill: '#1d1b22', lw: 6, shade: () => fillOnly(rect(x - 40, -128, 30, 14), '#6a6f86', { boil: .2 }) });   // sunglasses pushed up on the cap
    stroke([[-10, -112], [10, -112]], 6); }
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
// hips, legs and shoes down to the floor (758 units below the origin = 0.963 m): drawn first, so the counter covers what it should
export function maxLegs(L = LEG, shoe = 'plain') {   // L: trouser and shoe colours; shoe 'flash' = loud white trainers
  for (const s of [-1, 1]) {   // the legs, split at the crotch (0.79 m above the floor), one piece with the seat above
    shape([[s * 6, 190], [s * 178, 120], [s * 150, 700], [s * 40, 700]], { fill: L.cloth, lw: 7, shade: () => fillOnly(s > 0 ? [[110, 120], [178, 120], [150, 700], [115, 700]] : [[-60, 190], [-6, 190], [-40, 700], [-70, 700]], L.clothS, { boil: .3 }) });
    if (shoe === 'flash') { shape(spline([[s * 26, 676], [s * 160, 676], [s * 190, 728], [s * 160, 758], [s * 10, 758], [s * 14, 712]]), { fill: '#f7f5f0', lw: 7 });   // chunky trainers
      shape(rect(s > 0 ? 10 : -190, 730, 180, 28), { fill: '#e8e2d0', lw: 5 }); shape(spline([[s * 60, 700], [s * 150, 690], [s * 165, 715], [s * 70, 720]]), { fill: '#d63a2f', lw: 4 }); }
    else { shape(spline([[s * 32, 690], [s * 158, 690], [s * 175, 735], [s * 150, 758], [s * 18, 758], [s * 22, 720]]), { fill: L.shoe, lw: 7 });   // shoes
      stroke([[s * 20, 750], [s * 160, 750]], 4, { line: L.sole }); } }
  // the seat of the trousers: one shape from the belt down past the crotch, so the legs join it instead of hanging off it
  shape(spline([[-190, 30], [190, 30], [184, 140], [120, 175], [0, 205], [-120, 175], [-184, 140]]), { fill: L.cloth, lw: 7, shade: () => fillOnly([[110, 30], [190, 30], [184, 150], [110, 170]], L.clothS, { boil: .3 }) });
  stroke(spline([[0, 62], [4, 130], [-2, 196]], false), 4, { line: L.clothS });                                           // the fly seam
  stroke(spline([[-150, 150], [-80, 172], [-30, 182]], false), 3, { line: L.clothS }); stroke(spline([[150, 150], [80, 172], [30, 182]], false), 3, { line: L.clothS });   // creases
  shape(rect(-190, 28, 380, 30), { fill: L.belt, lw: 5 }); shape(rect(-22, 26, 44, 34), { fill: '#c9ccd4', lw: 4 });       // belt and buckle
}
// the forearms resting on the counter, hands flat; drawn after the counter so the hands lie on it
export function maxArms(handY = 62, hands = null, only = null) {   // only: 'limbs' (no hands) or 'hands', to put something between them   // hands: [[x, y] left, [x, y] right] in his units, to hold something up; else they rest at handY
  const ey = hands ? -40 : -60 + (handY - 62) * .45;   // the elbows drop a little when the hands reach further (or tuck in to hold a page up)
  for (const s of [-1, 1]) { const h = hands ? hands[s < 0 ? 0 : 1] : [s * 95, handY - 7], ex = hands ? s * 150 : s * 175;
    if (only !== 'hands') { shape(noodle([s * 160, -180], [ex, ey], s * 10, 62, 56), { fill: C.tee, lw: 7, shade: () => fillOnly(rect(s > 0 ? 160 : -240, -200, 80, 160), C.teeS, { boil: .3 }) });
    shape(noodle([ex, ey - 10], h, s * -20, 48, 42), { fill: C.skin, lw: 7, shade: () => fillOnly(rect(s > 0 ? 140 : -200, -80, 60, 140), C.skinS, { boil: .3 }) }); }
    if (only !== 'limbs') hand(hands ? h[0] - s * 20 : s * 70, hands ? h[1] : handY, hands ? (s > 0 ? Math.PI : 0) - s * .5 : (s > 0 ? Math.PI : 0), 30, C.skin); }
}
// place Max in a scene: (sx, sy) = his origin on screen, k = pixels per unit (pixels per metre x UNIT)
export function drawMax(t, sx, sy, k, act = {}, part = 'upper') { const lw0 = S.lwScale; S.lwScale = lw0 * Math.max(.3, Math.min(1, k));   // the ink thins as he gets smaller
  push(); translate(sx, sy); scale(k); if (part === 'upper') maxUpper(t, act); else if (part === 'legs') maxLegs(act.legs, act.shoe); else maxArms(act.handY, act.hands, act.only); pop(); S.lwScale = lw0; }
