
// Look test: the convenience-store counter at night, in the scifi-toon style (boiling ink line, flat fills, hard shadows, big eyes).
// Our own character: Max (orange cap, hi-vis vest over a grey tee), on a night shift, with his car payment on the counter.
import { AUDIT, tx, INK, init, frame, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text, bands } from './toon.js';
import { eye, mouth, hand, sweat } from './faces.js';
import { hash } from './lib.js';
let g; export function setupCounter(canvas) { g = init(canvas); }
const C = { wall: '#7a8c8e', wallS: '#55666c', ceil: '#b4c2c1', light: '#f4fbf6', counter: '#c9b896', counterS: '#a8977a', counterF: '#7d6e56', night: '#23304f', night2: '#2f3f63',
  skin: '#e9b98f', skinS: '#cf9a6f', cap: '#e8742e', capS: '#c45a1c', vest: '#f08a24', vestS: '#cf6c10', strip: '#dfe4e6', tee: '#7d8086', teeS: '#63666c', shelf: '#6b5a4a' };
// act: how Max performs this frame. look [x, y] for the pupils, lid 0..1, tilt of the head, sigh 0..1 (shoulders drop, mouth opens), blink
export function drawCounter(t, act = {}) {
  const A = { look: [.15, .55], lid: .52 + .05 * Math.sin(t * 1.3), tilt: -.05, sigh: 0, blink: false, ...act };
  frame(t);
  // ---- the room in perspective: one vanishing point behind Max's head; the far wall, the ceiling, two side walls, the floor ----
  const VX = 540, VY = 760, F = [120, 500, 960, 1150];   // far wall: x0, y0, x1, y1
  const toV = (x, y, k) => [x + (VX - x) * k, y + (VY - y) * k];
  g.fillStyle = '#16203a'; g.fillRect(0, 0, 1080, 1920);
  // ceiling: a trapezoid with a tile grid running back, and two rows of tubes that get smaller with distance
  shape([[-20, -20], [1100, -20], [F[2], F[1]], [F[0], F[1]]], { fill: C.ceil, lw: 6, shade: () => {
    for (let i = 0; i <= 10; i++) { const x = -20 + i * 112; stroke([[x, -20], toV(x, -20, (F[1] + 20) / (VY + 20))], 3, { line: '#8e9d9e' }); }
    for (const k of [.25, .48, .66, .8, .9]) { const a = toV(-20, -20, k), b = toV(1100, -20, k); stroke([a, b], 3, { line: '#8e9d9e' }); }
    fillOnly([[-20, -20], [1100, -20], [1100, 120], [-20, 120]], 'rgba(10,15,30,.25)', { boil: 0 }); } });
  const flick = (Math.floor(t * 9) % 11 === 0) ? .35 : 1;
  for (const [k, w, on] of [[.12, 300, 1], [.42, 170, flick], [.66, 100, 1]]) for (const sx of [-1, 1]) {
    const [cx, cy] = toV(VX + sx * 300, -20, k), h = 40 * (1 - k * .8);
    shape(rr(cx - w / 2, cy, w, h, 8), { fill: on > .5 ? C.light : '#9fb0ad', lw: 6 * (1 - k * .5) });
    if (on > .5) fillOnly(ell(cx, cy + h * 2.2, w * .9, h * 1.6, 24), 'rgba(235,255,245,.10)', { boil: 0 }); }
  // the cracked tube: a little lightning flicker in the ceiling, as in the reference's mood
  if (flick < .5) stroke([toV(VX + 300, -20, .42), [toV(VX + 300, -20, .42)[0] + 30, toV(VX + 300, -20, .42)[1] + 40], [toV(VX + 300, -20, .42)[0] + 10, toV(VX + 300, -20, .42)[1] + 60]], 4, { line: '#e8fbff' });
  // left wall: night windows with a pump and a street light outside
  shape([[-20, -20], [F[0], F[1]], [F[0], F[3]], [-20, 1500]], { fill: C.wallS, lw: 6, shade: () => {
    shape([toV(-20, 260, .05), toV(-20, 260, .62), toV(-20, 1180, .62), toV(-20, 1180, .05)], { fill: C.night, lw: 6, shade: () => {
      fillOnly(ell(110, 560, 70, 70), 'rgba(255,230,150,.14)', { boil: 0 }); shape(rect(100, 560, 12, 260), { fill: '#3a4566', lw: 5 }); shape(ell(106, 556, 24, 12), { fill: '#ffe9a8', lw: 5 });
      shape(rr(40, 760, 80, 130, 8), { fill: '#c8433a', lw: 5, shade: () => fillOnly(rr(54, 776, 52, 36, 5), '#ffe9a8', { boil: .3 }) }); } });
    for (const k of [.05, .33, .62]) stroke([toV(-20, 260, k), toV(-20, 1180, k)], 9); } });
  // right wall: the drinks fridge, glass doors glowing
  shape([[1100, -20], [F[2], F[1]], [F[2], F[3]], [1100, 1500]], { fill: C.wallS, lw: 6, shade: () => {
    shape([toV(1100, 300, .08), toV(1100, 300, .62), toV(1100, 1300, .62), toV(1100, 1300, .08)], { fill: '#9fd0d8', lw: 6, shade: () => {
      for (let r = 0; r < 5; r++) for (let i = 0; i < 6; i++) { const k = .1 + i * .085, [x, y] = toV(1100, 360 + r * 190, k); fillOnly(rr(x - 20 * (1 - k), y, 26 * (1 - k * .7), 70 * (1 - k * .6), 5), ['#d9433a', '#f2c14e', '#4f8fd6', '#7ab55c'][(i + r) % 4], { boil: .3 }); }
      fillOnly([toV(1100, 300, .08), toV(1100, 300, .2), toV(1100, 1300, .2), toV(1100, 1300, .08)], 'rgba(255,255,255,.18)', { boil: 0 }); } });
    for (const k of [.08, .35, .62]) stroke([toV(1100, 300, k), toV(1100, 1300, k)], 8); } });
  // floor seen past the counter ends
  shape([[-20, 1500], [F[0], F[3]], [F[2], F[3]], [1100, 1500]], { fill: '#8c9a92', lw: 6, shade: () => { for (let i = 0; i <= 8; i++) { const x = -20 + i * 140; stroke([[x, 1500], toV(x, 1500, (1500 - F[3]) / (1500 - VY))], 3, { line: '#6f7c75' }); } } });
  // far wall: shelves of snacks and a card rack, small with distance
  shape(rect(F[0], F[1], F[2] - F[0], F[3] - F[1]), { fill: C.wall, lw: 6, shade: () => {
    for (let i = 0; i < 24; i++) fillOnly(ell(F[0] + hash(i) * 660, F[1] + hash(i * 3.3) * 680, 14 + hash(i * 7) * 40, 8 + hash(i * 9) * 20, 12), 'rgba(40,50,45,.12)', { boil: .2 });
    for (let r = 0; r < 4; r++) { const y = F[1] + 150 + r * 120; fillOnly(rect(F[0], y + 70, 420, 12), C.shelf, { boil: .3 }); stroke([[F[0], y + 70], [F[0] + 420, y + 70]], 5);
      for (let i = 0; i < 9; i++) { const x = F[0] + 8 + i * 46, h = 46 + hash(i + r * 9) * 20; shape(rr(x, y + 70 - h, 38, h, 4), { fill: ['#d9433a', '#f2c14e', '#4f8fd6', '#7ab55c', '#e8742e', '#b45fc4'][(i + r * 2) % 6], lw: 4 }); } }
    shape(rr(F[0] + 450, F[1] + 160, 200, 280, 10), { fill: '#3f4a5a', lw: 6, shade: () => { for (let r = 0; r < 4; r++) for (let i = 0; i < 3; i++) fillOnly(rr(F[0] + 466 + i * 62, F[1] + 178 + r * 64, 48, 54, 4), ['#e9e2c8', '#c8433a', '#2f6f73'][(i + r) % 3], { boil: .3 }); } });
    fillOnly(rect(F[0], F[1], F[2] - F[0], 60), 'rgba(10,15,30,.18)', { boil: 0 }); } });
  // the back counter running along under the far wall
  shape(rect(F[0] - 40, F[3] - 140, F[2] - F[0] + 80, 140), { fill: '#6b5f4c', lw: 6, shade: () => fillOnly(rect(F[0] - 40, F[3] - 140, F[2] - F[0] + 80, 26), '#8c7d64', { boil: .3 }) });
  // Max behind the counter: hi-vis vest over a grey tee, arms on the counter, head hung
  const ox = 540, oy = 1290;
  push(); translate(ox, oy);
  shape(spline([[-190, 40], [-170, -150], [-90, -230], [90, -230], [170, -150], [190, 40]]), { fill: C.tee, lw: 7, shade: () => fillOnly(spline([[60, -230], [190, -150], [200, 60], [80, 60]]), C.teeS, { boil: .4 }) });
  for (const s of [-1, 1]) { shape(spline([[s * 30, -228], [s * 150, -170], [s * 180, 40], [s * 50, 40], [s * 40, -120]]), { fill: C.vest, lw: 7, shade: () => fillOnly(rect(s > 0 ? 100 : -200, -230, 100, 280), C.vestS, { boil: .4 }) });
    shape(rect(s > 0 ? 58 : -170, -110, 112, 26), { fill: C.strip, lw: 5 }); shape(rect(s > 0 ? 58 : -170, -40, 112, 26), { fill: C.strip, lw: 5 }); }
  // arms forward onto the counter, hands flat
  // neck and the big round head, hung forward
  shape(rr(-36, -290, 72, 80, 20), { fill: C.skin, lw: 6, shade: () => fillOnly(rect(-40, -290, 80, 30), C.skinS, { boil: .3 }) });
  push(); translate(0, -470 + 18 * A.sigh); rotate(A.tilt);
  { const [a0, b0] = tx(-200, -190), [a1, b1] = tx(200, 190); AUDIT.subject('Max (at the counter)', [a0, b0, a1, b1], 120); }
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
  pop(); pop();
  // the counter, worn, in front of him
  shape(rect(-20, 1300, 1120, 120), { fill: C.counter, lw: 7, shade: () => { for (const [a, b] of [[[120, 1330], [240, 1350]], [[700, 1320], [790, 1360]], [[420, 1380], [470, 1365]]]) stroke([a, b], 3, { line: '#9c8a6a' }); fillOnly(rect(-20, 1400, 1120, 20), C.counterS, { boil: .3 }); } });
  shape(rect(-20, 1420, 1120, 520), { fill: C.counterF, lw: 7, shade: () => { for (let i = 0; i < 6; i++) stroke([[-20 + i * 200, 1420], [-20 + i * 200, 1940]], 5); fillOnly(rect(-20, 1420, 1120, 50), 'rgba(0,0,0,.2)', { boil: .3 }); } });
  // on the counter: the car payment slip, a card, the car key, a coffee
  push(); translate(250, 1362); rotate(-.06); shape(rect(-120, -40, 240, 92), { fill: '#f4efe0', lw: 6 }); text('CAR PAYMENT', 0, -12, { font: '800 30px Cap', fill: INK }); text('$787 / mo', 0, 26, { font: '800 34px Cap', fill: '#b8302a' }); pop();
  push(); translate(590, 1362); rotate(.06); shape(rr(-70, -40, 140, 84, 12), { fill: '#2f6f73', lw: 6, shade: () => { fillOnly(rect(-70, -22, 140, 16), '#1d1a26', { boil: .3 }); fillOnly(rr(-52, 10, 30, 22, 4), '#e2b13c', { boil: .3 }); } }); pop();
  push(); translate(760, 1358); rotate(-.3); shape(rr(-34, -22, 68, 44, 18), { fill: '#2d2a33', lw: 6, shade: () => fillOnly(ell(10, 0, 10, 10, 12), '#c8433a', { boil: .3 }) }); shape(ell(-50, 0, 20, 20, 16), { fill: 'rgba(0,0,0,0)', lw: 6 }); pop();
  shape(spline([[880, 1250], [960, 1250], [950, 1356], [890, 1356]]), { fill: '#f4efe0', lw: 6, shade: () => fillOnly(rect(870, 1280, 100, 30), '#8a5a3a', { boil: .3 }) });
  for (let i = 0; i < 2; i++) stroke(spline([[905 + i * 22, 1236], [895 + i * 22, 1210], [912 + i * 22, 1188]], false), 4, { line: '#cfd8d4' });
  // a hot dog roller at the back left of the counter, under a glass hood
  shape(rr(-30, 1170, 230, 130, 10), { fill: '#9aa3ad', lw: 6, shade: () => fillOnly(rect(-30, 1270, 230, 30), '#7a838d', { boil: .3 }) });
  for (let i = 0; i < 4; i++) shape(rr(-10, 1196 + i * 18, 190, 16, 8), { fill: '#c9663a', lw: 4 });
  shape(spline([[-34, 1176], [0, 1110], [190, 1104], [214, 1176]]), { fill: 'rgba(210,235,240,.25)', lw: 5 });
  // Max's arms: short grey sleeves, forearms resting on the counter, hands flat
  push(); translate(540, 1290);
  for (const s of [-1, 1]) { shape(noodle([s * 160, -180], [s * 175, -60], s * 10, 62, 56), { fill: C.tee, lw: 7, shade: () => fillOnly(rect(s > 0 ? 160 : -240, -200, 80, 160), C.teeS, { boil: .3 }) });
    shape(noodle([s * 175, -70], [s * 95, 55], s * -20, 48, 42), { fill: C.skin, lw: 7, shade: () => fillOnly(rect(s > 0 ? 140 : -200, -80, 60, 140), C.skinS, { boil: .3 }) });
    hand(s * 70, 62, s > 0 ? Math.PI : 0, 30, C.skin); }
  pop();
  // the night: the room is lit only by the tubes, so the corners fall into a flat cool shade
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#c3cbe0'; g.fillRect(0, 0, 1080, 1920); g.globalCompositeOperation = 'source-over';   // the cold night cast over everything
}
