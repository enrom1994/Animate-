// phonepov.js — a phone seen through Max's eyes, held in his hands, and the screens it shows (a pay-later checkout, the approval,
// the payments list, a late-fee alert, the lock screen). The phone is the prop library's phone (72 x 150 mm, screen 64 x 140 mm),
// held square to his eyes: a flat thing facing the camera projects at one scale, cam.P pixels per metre at the look point, so its
// size on screen is right by construction. Screens are drawn in millimetres on the glass: u across from the left, v down from the top.
import { phone } from './props/props.js';
import { MAXC } from './max.js';
import { AUDIT, push, pop, translate, rotate, scale, shape, fillOnly, stroke, text, ell, rr, noodle, getM, setM } from './toon.js';
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
export const SCREENS = { checkout, payments, lock };
// ---- the phone in his hands ----
// at: screen point of the phone's centre; k: pixels per metre there (cam.P); rot: a little handheld roll; screen(t) draws the glass;
// tap: { u, v, k } the right thumb reaching to a point on the glass (k 0 = at rest on the corner, 1 = on the point)
export function drawPovPhone({ at = [540, 760], k = 5800, rot = 0, screen, glass = '#f4f1ea', tap = null, over = null } = {}) {
  const mm = k / 1000, lwk = 7 * Math.min(1.6, k / 4600), skin = MAXC.skin;
  push(); translate(at[0], at[1]); rotate(rot);
  // the left hand behind the phone: palm outside the left edge, fingers curled round the back, thumb along the bezel
  const L = (x, y) => [x * mm, y * mm];
  shape(noodle(L(-150, 330), L(-46, 52), -20, 70 * mm * .5, 58 * mm * .5), { fill: skin, lw: lwk });   // forearm, up from below the frame
  shape(ell(...L(-41, 40), 13 * mm, 24 * mm, 20), { fill: skin, lw: lwk });                                  // palm and curled fingers at the edge
  // the body (8 mm deep: its lower edge shows), then the glass
  shape(rr(-PW * 500, -PHH * 500 + 2.4 * mm, PW * 1000, PHH * 1000, 9 * mm), { fill: '#141317', lw: lwk * .7 });
  shape(rr(-PW * 500, -PHH * 500, PW * 1000, PHH * 1000, 9 * mm), { fill: '#26242a', lw: lwk * .7 });
  push(); scale(mm); translate(-SW / 2, -SH / 2);
  shape(rr(0, 0, SW, SH, 6), { fill: glass, lw: 2, line: '#0d0c10', boil: .1 });
  screen && screen();
  fillOnly(rr(22, 2.2, 20, 4.4, 2.2), '#0d0c10', { boil: 0 });   // the camera notch
  if (over) over();
  pop();
  shape(noodle(L(-40, 52), L(-33, 14), 3, 11 * mm, 9 * mm), { fill: skin, lw: lwk });                        // left thumb up the bezel
  // the right hand: palm below the right corner, the thumb reaching onto the glass
  const rest = [30, 70], tgt = tap ? [tap.u - 32, tap.v - 70] : rest, q = tap ? tap.k : 0, tip = [rest[0] + (tgt[0] - rest[0]) * q, rest[1] + (tgt[1] - rest[1]) * q];
  shape(noodle(L(160, 340), L(46, 86), 18, 72 * mm * .5, 60 * mm * .5), { fill: skin, lw: lwk });          // forearm
  shape(ell(...L(40, 82), 17 * mm, 21 * mm, 20), { fill: skin, lw: lwk });                                   // palm under the corner
  shape(noodle(L(38, 76), L(...tip), -6 * (1 - q * .5), 13 * mm, 10.5 * mm), { fill: skin, lw: lwk });        // thumb
  const ang = Math.atan2(tip[1] - 76, tip[0] - 38); shape(ell(...L(tip[0] - Math.cos(ang) * 2.2, tip[1] - Math.sin(ang) * 2.2), 3 * mm, 2.4 * mm, 10), { fill: '#f6d2b8', lw: lwk * .5 });   // nail
  pop();
}
export { checkout, payments, alert, lock };
