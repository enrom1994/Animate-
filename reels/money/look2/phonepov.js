// phonepov.js — a phone seen through Max's eyes, held in his hands, and the screens it shows (a pay-later checkout, the approval,
// the payments list, a late-fee alert, the lock screen). The phone is the prop library's phone (72 x 150 mm, screen 64 x 140 mm),
// held square to his eyes: a flat thing facing the camera projects at one scale, cam.P pixels per metre at the look point, so its
// size on screen is right by construction. Screens are drawn in millimetres on the glass: u across from the left, v down from the top.
import { phone } from './props/props.js';
import { MAXC } from './max.js';
import { AUDIT, push, pop, translate, rotate, scale, shape, fillOnly, stroke, text, ell, rr, noodle, spline, getM, setM } from './toon.js';
const PH = phone(), [PW, PHH] = PH.size, SW = 64, SH = 140;   // body and screen sizes (m and mm)
const ink = '#1d1a26', teal = '#2f6f73', red = '#b8302a', cream = '#fbf6ea', paper = '#f4f1ea';
const F = (px, w = 800) => `${w} ${px}px Cap`;   // font sizes are millimetres on the glass
// ---- the item pictures on a checkout (in mm, centred on 0, 0, about 40 mm wide) ----
const ICON = {
  sneakers: () => { shape([[-19, 6], [-18, -4], [-9, -6], [-2, -12], [6, -12], [8, -6], [17, -2], [20, 4], [20, 8], [-19, 8]], { fill: '#e8e2d0', lw: 4 });
    fillOnly([[-19, 5], [20, 5], [20, 8], [-19, 8]], '#d9433a', { boil: .3 }); stroke([[-4, -9], [3, -3]], 3); stroke([[-1, -11], [6, -5]], 3); shape([[-10, 0], [2, 0], [6, 3], [-10, 3]], { fill: teal, lw: 3 }); },
  phone: () => { shape(rr(-8, -15, 16, 30, 3), { fill: '#2d2a33', lw: 4 }); shape(rr(-6.5, -13, 13, 25, 2), { fill: '#7fb3d5', lw: 2 }); },
  console: () => { shape(rr(-18, -8, 36, 16, 7), { fill: '#e8e2d0', lw: 4 }); shape(ell(-10, 0, 3.4, 3.4, 16), { fill: '#2d2a33', lw: 2 }); shape(ell(10, -2, 2, 2, 12), { fill: '#d9433a', lw: 2 }); shape(ell(13, 2, 2, 2, 12), { fill: '#4f8fd6', lw: 2 }); },
};
const PLAN_COL = { sneakers: teal, phone: '#3f6fb0', console: '#d0782a' };
// ---- screens: each fn(t, o) draws inside the glass, 0..64 x 0..140 mm ----
function statusBar() { text('9:41', 9, 5, { font: F(3.6), fill: ink, align: 'left' }); fillOnly(rr(52, 3, 7, 3.4, 1), ink, { boil: 0 }); }
function checkout(o) {   // o: { item, name, price, each, row (0..1: the pay-later row lights), press (0..1), approved (0..1) }
  const a = o.approved || 0; statusBar(); if (a < .5) { text('CHECKOUT', 32, 13, { font: F(5.2), fill: ink });
  shape(rr(6, 19, 52, 38, 4), { fill: '#e4ecef', lw: 3, boil: .2 }); push(); translate(32, 38); scale(1.05); ICON[o.item](); pop();
  text(o.name, 32, 64, { font: F(5), fill: ink }); text(o.price, 32, 75, { font: F(9), fill: ink });
  const lit = o.row || 0; shape(rr(6, 84, 52, 19, 4), { fill: lit > .5 ? '#e3f1ef' : cream, lw: 3 + 3 * lit, line: lit > .5 ? teal : '#9a958a', boil: .2 });
  text(`OR 4 × ${o.each}`, 32, 91, { font: F(5.4), fill: lit > .5 ? teal : ink }); text('0% INTEREST', 32, 98.5, { font: F(4.2), fill: '#6b5a4a' });
  const pr_ = o.press || 0; shape(rr(6 + pr_, 110 + pr_, 52 - 2 * pr_, 17 - 2 * pr_, 5), { fill: pr_ > .3 ? '#245a5d' : teal, lw: 3, boil: .2 });
  text('PAY LATER', 32, 118.6, { font: F(6), fill: '#ffffff' }); }
  if (a > 0) { shape(rr(1, 9, 62, 130, 5), { fill: '#ffffff', alpha: Math.min(1, a * 2), line: null, boil: 0 });
    if (a > .5) { shape(ell(32, 52, 15, 15, 40), { fill: teal, lw: 4 }); stroke([[25, 52], [30.5, 57.5], [40, 46]], 5, { line: '#ffffff' });
      text('APPROVED', 32, 80, { font: F(7), fill: teal }); text(`${o.each} TODAY`, 32, 92, { font: F(5), fill: ink }); text('3 MORE TO PAY', 32, 100, { font: F(4.2), fill: '#6b5a4a' }); } } }
// the payments list: rows two weeks apart; each plan adds its chip from the date it starts; payday marked; one row turns red
const DATES = ['MAR 4', 'MAR 18', 'APR 1', 'APR 15'];
function payments(o) {   // o: { plans: [[item, each$, amount 0..1]...], payday (0..1), late (0..1), total (0..1) }
  statusBar(); text('PAYMENTS', 32, 13, { font: F(5.2), fill: ink });
  let y = 22;
  for (let r = 0; r < 4; r++) {
    const late = r === 0 ? o.late || 0 : 0, sum = o.plans.reduce((s, [, e, k]) => s + (k > .5 ? e : 0), 0);
    if (r === 1 && (o.payday || 0) > 0) { const k = o.payday; push(); translate(32, y + 4); scale(1, Math.min(1, k * 1.4)); shape(rr(-26, -4, 52, 8, 3), { fill: '#ffd23f', lw: 2.5 }); text('PAYDAY · MAR 6', 0, .3, { font: F(4), fill: ink }); pop(); y += 11 * Math.min(1, k * 1.4); }
    shape(rr(5, y, 54, 22, 4), { fill: late > .5 ? '#f7dcd6' : cream, lw: 2.5 + 3 * late, line: late > .5 ? red : '#9a958a', boil: .2 });
    text(DATES[r], 9, y + 5.6, { font: F(4.6), fill: late > .5 ? red : ink, align: 'left' }); text('$' + sum, 55, y + 5.6, { font: F(5), fill: late > .5 ? red : ink, align: 'right' });
    let x = 9; for (const [item, each, k] of o.plans) { if (k <= 0) continue; const w = 15; push(); translate(x + w / 2, y + 15); scale(Math.min(1, k * 1.3)); shape(rr(-w / 2, -4.2, w, 8.4, 2.5), { fill: PLAN_COL[item], lw: 2 }); text('$' + each, 0, .3, { font: F(4), fill: '#ffffff' }); pop(); x += w + 2; }
    y += 26;
  }
}
function alert(o) {   // a late-fee banner dropping over whatever is on the glass, below the notch; o.k 0..1
  const y = -26 + 36 * Math.min(1, o.k * 1.2), n0 = AUDIT.log.length; shape(rr(3, y, 58, 24, 5), { fill: '#ffffff', lw: 4, line: red });
  const b = AUDIT.on && AUDIT.log[n0] ? AUDIT.log[n0].bb : null;   // what it hides on purpose is not a fault: the labels under it leave the audit
  if (b) AUDIT.log = AUDIT.log.filter((e, i) => i >= n0 || e.k !== 'text' || e.bb[2] < b[0] || e.bb[0] > b[2] || e.bb[3] < b[1] || e.bb[1] > b[3]);
  text('LATE FEE', 32, y + 8, { font: F(6.4), fill: red }); text(o.text || '$8 · PAYMENT MISSED', 32, y + 17, { font: F(4), fill: ink }); }
function lock(o) {   // the lock screen, notifications stacking: o.n how many shown (fractional springs in)
  text('9:41', 32, 24, { font: F(14), fill: '#ffffff' }); text('TUESDAY, MARCH 4', 32, 34, { font: F(3.6), fill: '#ffffff' });
  const N = [['PAYMENT DUE', '$100 · SNEAKERS', ink], ['PAYMENT DUE', '$150 · PHONE', ink], ['PAYMENT DUE', '$125 · CONSOLE', ink], ['PAYMENT LATE', '$8 LATE FEE', red]];
  for (let i = 0; i < N.length; i++) { const k = Math.max(0, Math.min(1, (o.n - i) * 1.6)); if (k <= 0) continue; const y = 44 + i * 21;
    push(); translate(32, y + 9); scale(.6 + .4 * k, .6 + .4 * k); shape(rr(-28, -9, 56, 18, 4), { fill: i === 3 ? '#fde8e4' : 'rgba(255,255,255,.92)', lw: 2.5, line: i === 3 ? red : '#9a958a' });
    text(N[i][0], -24, -2.5, { font: F(4.4), fill: N[i][2], align: 'left' }); text(N[i][1], -24, 4.5, { font: F(3.8), fill: '#4a4048', align: 'left' }); pop(); } }
// an investing app: the index fund's line rising over the years (o.k 0..1 draws it), a long-run note, and the fine print
function fund(o) {
  statusBar(); text('INVESTING', 32, 13, { font: F(5.2), fill: ink });
  text('INDEX FUND', 32, 24, { font: F(6.2), fill: teal });
  shape(rr(5, 31, 54, 56, 4), { fill: '#ffffff', lw: 2.5, line: '#9a958a', boil: .2 });
  for (let i = 1; i < 4; i++) stroke([[8, 31 + i * 14], [56, 31 + i * 14]], 1, { line: 'rgba(60,60,60,.18)', boil: 0 });
  const N = 60, k = Math.max(.02, o.k ?? 1), pts = [];   // a wobbly long-run rise: up overall, never a straight line
  for (let i = 0; i <= N * k; i++) { const x = i / N, y = Math.pow(x, 1.6) * .8 + .06 * Math.sin(x * 23) + .04 * Math.sin(x * 51 + 1) - (x > .42 && x < .5 ? .12 * Math.sin((x - .42) / .08 * Math.PI) : 0); pts.push([9 + x * 46, 82 - Math.max(0, y) * 46]); }
  if (pts.length > 1) stroke(pts, 4, { line: teal, boil: .1 });
  text('LONG RUN, AFTER', 34, 94, { font: F(4.2), fill: '#6b5a4a' }); text('INFLATION', 34, 99.5, { font: F(4.2), fill: '#6b5a4a' }); text('~7% A YEAR', 34, 109, { font: F(7.6), fill: teal });
  text('NOT A PROMISE', 34, 121, { font: F(3.8), fill: '#6b5a4a' }); text('NOT ADVICE', 34, 127, { font: F(3.8), fill: '#6b5a4a' }); }   // set right of centre: his left thumb lies along the left edge
export const SCREENS = { checkout, payments, lock, fund };
// ---- a two-handed grip on a sheet of paper (the letter in ep. 1) ----
// side: -1 left hand, +1 right hand; at: the screen point on the page's side edge where the thumb's base sits; mm: pixels per mm
// there. Call with layer 'back' before drawing the page (the hand beside and behind the paper) and 'front' after it (the thumb).
export function gripHand(side, at, mm, layer, { hands = null } = {}) {   // no watch by default: on a letter-wide grip the wrists sit at the frame's edge, where a watch is only a gold scrap
  SK = { skin: MAXC.skin, skinS: MAXC.skinS, watch: false, ...(hands || {}) }; const lw = 6.5 * Math.min(1.5, mm / 4.6), s = side;
  push(); translate(at[0], at[1]); scale(mm); if (s > 0) scale(-1, 1);   // drawn as a left hand; the right is its mirror
  // Holding a sheet by its side edges, thumbs in front: from the eyes you see the thumb on the page, the back of the hand beside the
  // edge with the knuckles along its top, and the index finger curling over the edge above the thumb before it goes behind the page.
  // 'back' (before the page): the index and middle fingers, which the page's edge cuts off. 'front' (after): one outline for the
  // forearm, the back of the hand, the web and the thumb, so nothing floats. Drawn as the left hand; the right is its mirror.
  if (layer === 'back') {
    skinShape(noodle([-30, -27], [24, -18], -3, 20, 18), { lw, d: 2 });      // the middle finger, mostly hidden by the thumb
    skinShape(noodle([-32, -46], [24, -42], -4, 21, 19), { lw, d: 2 });      // the index finger over the edge, above the thumb
  } else {
    skinShape(spline([[-130, 330], [-88, 200], [-66, 110], [-60, 60],                                       // the forearm, out toward the elbow
      [-62, 30], [-60, 10], [-63, -8], [-60, -24], [-54, -36], [-44, -44], [-34, -38],                           // the back of the hand, knuckles along its edge
      [-20, -32], [-6, -28], [3, -24],                                                                          // the web, at the paper's edge
      [14, -22], [27, -31], [37, -38], [45, -34], [44, -21], [34, -11], [20, 4], [10, 22],                      // the thumb across the page
      [4, 50], [-2, 90], [-12, 150], [-40, 330]]), { lw, d: 3.2 });                                             // the ball of the thumb, down the inner wrist
    shape(spline([[33, -33], [40, -38], [45, -33], [41, -26], [34, -27]]), { fill: '#f3c7a6', lw: lw * .5 });
    stroke(spline([[16, -4], [4, 24], [-4, 58], [-10, 98]], false, 6), lw * .45, { line: 'rgba(29,26,38,.5)' });   // the crease round the ball of the thumb
    stroke([[24, -24], [27, -16]], lw * .4, { line: 'rgba(29,26,38,.45)' });                                       // the thumb's knuckle
    for (const y of [-16, 2, 20]) stroke([[-61, y], [-50, y - 3]], lw * .45, { line: 'rgba(29,26,38,.5)' });    // between the knuckles
  }
  pop();
}
let SK = { skin: MAXC.skin, skinS: MAXC.skinS, watch: true };   // whose hands: set by drawPovPhone({ hands })
function skinShape(pts, o = {}) { const d = o.d ?? 2.6; return shape(pts, { fill: SK.skinS, lw: o.lw, audit: o.audit, shade: () => { fillOnly(pts.map(([x, y]) => [x - d * .7, y - d]), SK.skin, { boil: .2, audit: o.audit }); o.inner && o.inner(); } }); }   // inner: drawn clipped to the skin (a watch band)
const nrm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
const add = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];
// the left hand cradles the phone: the palm under its lower half, three fingertips wrapping round the right edge, the thumb along the
// left edge, the wrist running down out of frame with his gold watch on it. In mm, phone centre at 0, 0 (edges at x +-36, y +-75).
function leftHandBack(lw) { }   // (the palm is drawn in front: everything of it that shows lies outside the phone)
function leftHandFront(lw) {
  for (const [y, len] of [[-16, 13], [2, 14.5], [20, 14], [38, 11.5]]) {   // fingertips round the right edge, the little finger shortest
    skinShape(spline([[34, y - 8.2], [34 + len - 4, y - 8], [34 + len + 1.5, y - 3], [34 + len + 1.5, y + 3.5], [34 + len - 4, y + 8.6], [34, y + 8.4]]), { lw, d: 1.8 });
    stroke([[34 + 2.4, y - 5], [34 + 2.8, y + 5]], lw * .45, { line: 'rgba(29,26,38,.55)' }); }   // where the finger bends round the edge
  // one outline: up the wrist, the outside of the hand, the thumb up the phone's left side, back down its inner edge to the web, along
  // just under the phone's bottom edge (the phone rests on the palm), and down the far side of the palm to the wrist
  skinShape(spline([[-44, 300], [-52, 200], [-58, 130], [-62, 84], [-60, 54], [-52, 34], [-43, 20], [-33, 15], [-26, 21], [-26, 36],
    [-30, 58], [-33, 74], [-26, 79], [-4, 80], [18, 81], [32, 86], [33, 104], [24, 140], [12, 200], [6, 300]]),
    { lw, d: 3.4, audit: false, inner: () => { if (!SK.watch) return;
      shape([[-70, 122], [40, 117], [40, 132], [-70, 137]], { fill: '#d9a83a', lw, shade: () => fillOnly([[-70, 130], [40, 126], [40, 132], [-70, 138]], '#b0822a', { boil: .2 }) }); } });   // the gold watch band round the wrist
  if (SK.watch) { shape(rr(-30, 113, 20, 26, 5), { fill: '#d9a83a', lw }); shape(rr(-27, 116, 14, 20, 4), { fill: '#f3ead2', lw: lw * .5 }); }   // its face
  AUDIT.parts([[[-62, 15], [-26, 15], [-26, 79], [-62, 79]], [[-62, 79], [33, 79], [33, 300], [-62, 300]]]);   // what it covers: the thumb up the side, the palm below the phone
  shape(spline([[-38, 23], [-31.5, 19], [-27.5, 24], [-28.5, 32], [-35.5, 32]]), { fill: '#f3c7a6', lw: lw * .5 });   // the thumbnail
  stroke(spline([[-30, 60], [-40, 76], [-48, 100]], false, 6), lw * .45, { line: 'rgba(29,26,38,.5)' });              // the crease round the ball of the thumb
  stroke([[-52, 50], [-42, 48]], lw * .45, { line: 'rgba(29,26,38,.55)' });                                            // the thumb's knuckle
}
// the right hand points, drawn as one outline in the finger's own frame (u along the finger to the tip, v across: thumb side negative):
// forearm, the thumb tucked along the side, the index finger out to the tip, the curled fingers' knuckles. It comes up from the lower right.
function rightHand(tip, lw) {
  const dir = nrm(-.42, -1), per = [-dir[1], dir[0]], P = ([u, v]) => add(add(tip, dir, u), per, v);
  skinShape(spline([[-270, -27], [-120, -27], [-92, -31], [-70, -31], [-53, -25], [-44, -17],
    [-38, -10], [-20, -9.5], [-7, -9], [-1, -6], [1.5, 0], [-1, 6], [-7, 9], [-20, 9.5], [-34, 10.5],
    [-37, 15], [-34, 21], [-37, 27], [-36, 33], [-42, 39], [-62, 42], [-96, 39], [-135, 35], [-270, 37]].map(P)), { lw, d: 3, audit: false });
  AUDIT.parts([[[-40, -10], [2, -10], [2, 10], [-40, 10]], [[-120, -31], [-34, -31], [-34, 42], [-120, 42]], [[-270, -27], [-120, -27], [-120, 37], [-270, 37]]].map(q => q.map(P)));   // what it covers: finger, hand, forearm
  const nb = P([-6, 0]); shape([add(add(nb, per, -5.4), dir, 4), add(add(nb, per, 5.4), dir, 4), add(add(nb, per, 4.8), dir, -4.2), add(add(nb, per, -4.8), dir, -4.2)], { fill: '#f3c7a6', lw: lw * .5 });   // the nail
  for (const [u0, v0, u1, v1] of [[-18, -7, -18, 7], [-35, -9, -46, -14], [-36, 18, -46, 17], [-36, 24, -46, 23], [-38, 30, -48, 30]])
    stroke([P([u0, v0]), P([u1, v1])], lw * .45, { line: 'rgba(29,26,38,.5)' });                                     // finger joint, the thumb's edge, the curled fingers' creases
}
// ---- the phone in his hands ----
// at: screen point of the phone's centre; k: pixels per metre there (cam.P); rot: a little handheld roll; screen() draws the glass;
// tap: { u, v, k } his right index finger reaching to a point on the glass (k 0 = resting below the phone, 1 = on the point)
// hands: { skin, skinS, watch } (Max's by default: his skin and his gold watch)
export function drawPovPhone({ at = [540, 760], k = 5800, rot = 0, screen, glass = '#f4f1ea', tap = null, over = null, hands = null } = {}) {
  SK = { skin: MAXC.skin, skinS: MAXC.skinS, watch: true, ...(hands || {}) };
  const mm = k / 1000, lw = 6.5 * Math.min(1.5, k / 4600);
  push(); translate(at[0], at[1]); rotate(rot); scale(mm);
  leftHandBack(lw);
  // the body (8 mm deep: its lower edge shows), then the glass
  shape(rr(-PW * 500, -PHH * 500 + 2.4, PW * 1000, PHH * 1000, 9), { fill: '#141317', lw: lw * .8 });
  shape(rr(-PW * 500, -PHH * 500, PW * 1000, PHH * 1000, 9), { fill: '#26242a', lw: lw * .8 });
  push(); translate(-SW / 2, -SH / 2);
  shape(rr(0, 0, SW, SH, 6), { fill: glass, lw: 2, line: '#0d0c10', boil: .1 });
  screen && screen();
  fillOnly(rr(22, 2.2, 20, 4.4, 2.2), '#0d0c10', { boil: 0 });   // the camera notch
  if (over) over();
  pop();
  leftHandFront(lw);
  const rest = [44, 112], q = tap ? tap.k : 0, tgt = tap ? [tap.u - 32, tap.v - 70] : rest;
  rightHand([rest[0] + (tgt[0] - rest[0]) * q, rest[1] + (tgt[1] - rest[1]) * q], lw);
  pop();
}
export { checkout, payments, alert, lock, fund };
