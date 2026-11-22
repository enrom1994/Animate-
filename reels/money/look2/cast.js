// The cast at full height. Theo, the saver, is plain on purpose: ordinary clothes, nothing new, nothing shiny. Max, the spender,
// wears what he spends: a gold chain, sunglasses, loud trainers, a big watch, a satin bomber off duty. Same units as max.js
// (1 unit = 1.27 mm, origin 0.963 m above the floor, floor at +758), so both stand on the same floor at true size.
import { AUDIT, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, dot, INK, S } from './toon.js';
import { eye, mouth, hand } from './faces.js';
import { maxUpper, maxLegs, MAXC, UNIT } from './max.js';
// arms hanging at the sides; sleeve: 'short' | 'long'; watch: null | 'gold' | 'plain'
export function standArms(skin, skinS, shirt, shirtS, { sleeve = 'short', watch = null, w = 165 } = {}) {
  for (const s of [-1, 1]) {
    const sh = [s * w, -185], el = [s * (w + 38), -20], wr = [s * (w + 30), 95];
    shape(noodle(sh, el, s * 8, 66, 58), { fill: sleeve === 'long' ? shirt : skin, lw: 7 });
    shape(noodle(el, wr, s * -6, 56, 46), { fill: sleeve === 'long' ? shirt : skin, lw: 7 });
    if (sleeve === 'short') shape(noodle(sh, [s * (w + 22), -105], s * 6, 76, 70), { fill: shirt, lw: 7, shade: () => fillOnly(rect(s > 0 ? w : -w - 60, -200, 60, 100), shirtS, { boil: .3 }) });
    else shape(rect(s * (w + 30) - 28, 72, 56, 22), { fill: shirtS, lw: 5 });   // the cuff
    if (watch === 'gold') { shape(rr(s * (w + 30) - 32, 50, 64, 34, 10), { fill: '#e3b23c', lw: 6 }); dot(s * (w + 30), 67, 9, '#fff4c8'); }
    if (watch === 'plain') shape(rr(s * (w + 30) - 26, 56, 52, 24, 6), { fill: '#2d2b30', lw: 5 });
    hand(s * (w + 32), 128, Math.PI / 2, 30, skin); }
}
// Max standing: 'work' (the store vest) or 'flash' (off duty); bling on by default, because that is who he is
export function maxStanding(t, { outfit = 'work', act = {} } = {}) {
  maxLegs(undefined, 'flash');
  standArms(MAXC.skin, MAXC.skinS, outfit === 'flash' ? '#24222b' : MAXC.tee, outfit === 'flash' ? '#17161c' : MAXC.teeS, { sleeve: outfit === 'flash' ? 'long' : 'short', watch: 'gold', w: 172 });
  maxUpper(t, { look: [0, 0], lid: .3, tilt: 0, outfit, bling: true, shades: true, subject: false, ...act });
}
// ---- Theo: three plain options. Same build, a longer, calmer face, his own hair instead of a cap ----
export const TSKIN = '#f0c8a2', TSKIN_S = '#d6a882';
export const THEO = {
  A: { name: 'A · plain tee', shirt: '#4a6a8a', shirtS: '#3b5672', legs: { cloth: '#b9a888', clothS: '#9c8c70', shoe: '#5a4a3a', sole: '#e0d8c8', belt: '#5a4a3a' }, hair: 'part', hairCol: '#6b4a2e', sleeve: 'short', collar: 'crew', glasses: false, watch: null },
  B: { name: 'B · flannel + glasses', shirt: '#6d7f95', shirtS: '#566679', legs: { cloth: '#44597a', clothS: '#364761', shoe: '#3a3630', sole: '#d8d2c4', belt: '#3a3630' }, hair: 'mop', hairCol: '#3a2a20', sleeve: 'long', collar: 'shirt', glasses: true, watch: 'plain', check: true },
  C: { name: 'C · polo, buzz cut', shirt: '#6f8a6a', shirtS: '#5a7256', legs: { cloth: '#6a6c72', clothS: '#55575c', shoe: '#2d2b30', sole: '#cfcac0', belt: '#2d2b30' }, hair: 'buzz', hairCol: '#8a6a48', sleeve: 'short', collar: 'polo', glasses: false, watch: null },
};
export function theoStanding(t, v = THEO.A, act = {}) {
  const A = { look: [0, 0], lid: .18, smile: .35, ...act };
  maxLegs(v.legs, 'plain');
  standArms(TSKIN, TSKIN_S, v.shirt, v.shirtS, { sleeve: v.sleeve, watch: v.watch, w: 158 });
  shape(spline([[-170, 40], [-155, -150], [-85, -228], [85, -228], [155, -150], [170, 40]]), { fill: v.shirt, lw: 7, shade: () => fillOnly(spline([[55, -228], [175, -150], [185, 60], [70, 60]]), v.shirtS, { boil: .4 }) });
  if (v.check) for (let i = -3; i <= 3; i++) { stroke([[i * 50, -215], [i * 50 + 4, 36]], 3, { line: 'rgba(40,50,70,.35)' }); stroke([[-165, -160 + (i + 3) * 30], [165, -160 + (i + 3) * 30]], 3, { line: 'rgba(40,50,70,.3)' }); }
  if (v.collar === 'crew') stroke(arc(0, -232, 52, 26, .1, Math.PI - .1, 14), 6);
  if (v.collar === 'shirt' || v.collar === 'polo') { for (const s of [-1, 1]) shape([[0, -200], [s * 70, -238], [s * 64, -186]], { fill: v.shirtS, lw: 5 });
    stroke([[0, -200], [0, v.collar === 'polo' ? -130 : 36]], 4); for (const y of v.collar === 'polo' ? [-180, -150] : [-160, -100, -40, 10]) dot(6, y, 6, '#e8e2d0'); }
  shape(rr(-34, -292, 68, 80, 20), { fill: TSKIN, lw: 6 });   // neck
  push(); translate(0, -472);
  shape(ell(0, 0, 176, 196, 80), { fill: TSKIN, lw: 8, shade: () => fillOnly(spline([[60, -200], [210, -40], [190, 140], [70, 205], [140, 40]]), TSKIN_S, { boil: .3 }) });
  for (const s of [-1, 1]) shape(ell(s * 174, 18, 24, 34, 18), { fill: TSKIN, lw: 6 });
  if (v.hair === 'part') shape(spline([[-180, -10], [-176, -120], [-90, -205], [40, -212], [160, -150], [182, -20], [150, -110], [20, -150], [-60, -120], [-150, -60]]), { fill: v.hairCol, lw: 7 });
  if (v.hair === 'mop') shape(spline([[-184, 0], [-190, -110], [-120, -200], [0, -222], [130, -196], [192, -100], [184, 10], [150, -80], [80, -120], [10, -100], [-60, -130], [-130, -90]]), { fill: v.hairCol, lw: 7 });
  if (v.hair === 'buzz') fillOnly(spline([[-172, -40], [-160, -130], [-80, -190], [60, -194], [150, -140], [174, -40], [120, -110], [0, -140], [-120, -110]]), v.hairCol, { boil: .3 });
  eye(-64, 30, 50, 56, { lid: A.lid, look: A.look, pupil: 8, skin: TSKIN, lw: 7 }); eye(64, 30, 50, 56, { lid: A.lid, look: A.look, pupil: 8, skin: TSKIN, lw: 7 });
  stroke(spline([[-112, -34], [-66, -44], [-24, -36]], false), 8); stroke(spline([[24, -36], [66, -44], [112, -34]], false), 8);   // level, relaxed brows
  if (v.glasses) { for (const x of [-64, 64]) shape(rr(x - 62, -18, 124, 96, 22), { fill: 'rgba(220,235,245,.18)', lw: 7 }); stroke([[-2, 10], [2, 10]], 6); }
  shape(spline([[-4, 60], [12, 96], [0, 110], [-14, 102]]), { fill: TSKIN, lw: 6 });
  mouth(0, 150, 64, { sm: A.smile, lw: 7 });
  pop();
}
export { UNIT };
