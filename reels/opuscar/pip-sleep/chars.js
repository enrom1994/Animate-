// Characters, drawn in crayon: Biscuit (and the wild cat, same build, other coat), the mouse, Pip.
// Every function draws into a rig group (k = knock-out, f = colour, l = outline). Parts drawn later hide the parts before them.
import { line, fill, dab, ellipse, handCircle, xf } from './crayon.js';
import { part, tube, curve } from './rig.js';
import { PAL } from './pal.js';
const K = PAL.crayon;

export const COATS = {
  biscuit: { fur: K.tangerine, belly: K.cream, stripe: '#c96a1e' },
  wild: { fur: '#d9a85a', belly: K.cream, stripe: K.brown },
};
const F = (col, seed, o = {}) => ({ col, p: o.p ?? 0.9, gap: o.gap ?? 8, w: o.w ?? 10, ang: o.ang ?? 0.6, seed, over: o.over ?? 5 });
const O = (seed, o = {}) => ({ w: o.w ?? 7, seed, col: o.col ?? K.ink, p: o.p ?? 0.95, draw: o.draw ?? 1 });

// ——— a cat ———
// pose: 'curl' (asleep, tail wrapped), 'sit', 'run' (stretched, legs alternate on twos), 'crouch' (wild cat stalking)
// eyes: 'closed' | 'open' | 'wide'; ear: 0..1 lifts the near ear (listening); flip: -1 faces left; draw: 0..1 outline progress
export function cat(C, o) {
  const { x, y, s = 1, pose = 'curl', eyes = 'closed', ear = 0, flip = 1, seed = 100, coat = 'biscuit', step = 0 } = o;
  const c = COATS[coat], d = o.draw ?? 1, fp = o.fill ?? 1;
  const T = pts => xf(pts, { x, y, s, sx: flip });
  const P = (poly, col, sd, fo = {}, lo = {}) => part(C, T(poly), fp > 0 ? { ...F(col, seed + sd, fo), draw: fp } : null, O(seed + sd + 50, { ...lo, draw: d }));
  if (pose === 'curl') {
    // body (a loaf), tail wrapped round the front, head resting on the paws at the left
    P(ellipse(10, -80, 150, 88, 40), c.fur, 1);
    for (let i = 0; i < 3; i++) line(C.l, T([[30 + i * 38, -160], [44 + i * 38, -128], [36 + i * 38, -100]]), { w: 6, col: c.stripe, seed: seed + 10 + i, p: 0.85, draw: d });
    P(tube(curve([[150, -60], [150, -12], [70, 4], [-40, 4], [-120, -8]]), 34, 24), c.fur, 3);
    head(C, T, -112, -96, 0.95, { eyes, ear, c, seed: seed + 20, d, fp, sc: s });
    P(ellipse(-60, -14, 34, 18, 20), c.belly, 4, { gap: 6, w: 8 });   // the front paw tucked under the chin
    return;
  }
  if (pose === 'sit') {
    P(tube(curve([[70, -20], [130, -40], [150, -110], [120, -160]]), 26, 18), c.fur, 3);
    P(ellipse(0, -100, 95, 105, 40), c.fur, 1);
    P(ellipse(0, -80, 52, 70, 30), c.belly, 2, { gap: 6, w: 8 });
    P(ellipse(-34, -10, 30, 18, 20), c.fur, 4); P(ellipse(34, -10, 30, 18, 20), c.fur, 5);
    head(C, T, 0, -230, 1, { eyes, ear, c, seed: seed + 20, d, fp, sc: s });
    return;
  }
  // run / crouch / pounce: a long body, legs as tubes
  const run = pose === 'run', crouch = pose === 'crouch';
  const ph = step % 2;   // two key drawings, alternating on twos
  const bodyY = crouch ? -60 : -110, legL = crouch ? 40 : 90;
  const legs = run ? (ph ? [[-90, 60, -150], [-60, -40, -100], [70, 40, 130], [100, -30, 80]] : [[-90, -20, -60], [-60, 40, -130], [70, -40, 60], [100, 50, 150]])
                   : [[-90, 0, -95], [-55, 0, -60], [70, 0, 75], [105, 0, 110]];
  legs.slice(0, 2).forEach(([lx, sw, fx], i) => P(tube([[lx, bodyY + 20], [fx, bodyY + 20 + legL]], 30, 26), c.fur, 30 + i));
  P(tube(curve([[-120, bodyY - 10], [-190, bodyY - 60 - (run ? 0 : 30)], [-230, bodyY - (run ? 40 : 110)]]), 26, 16), c.fur, 3);   // tail up behind
  P(ellipse(0, bodyY, 140, crouch ? 52 : 62, 40), c.fur, 1);
  for (let i = 0; i < 3; i++) line(C.l, T([[-60 + i * 40, bodyY - 55], [-50 + i * 40, bodyY - 25]]), { w: 6, col: c.stripe, seed: seed + 10 + i, p: 0.85, draw: d });
  legs.slice(2).forEach(([lx, sw, fx], i) => P(tube([[lx, bodyY + 20], [fx, bodyY + 20 + legL]], 30, 26), c.fur, 40 + i));
  head(C, T, 150, bodyY - (crouch ? 40 : 60), 0.9, { eyes, ear: run ? -1 : ear, c, seed: seed + 20, d, fp, sc: s });
}

// head: round face, two ears, eyes, pink nose and cheeks, whiskers. side: the head lies on its side (sleeping curl)
function head(C, T, hx, hy, k, { eyes, ear, c, seed, d, fp, sc = 1 }) {
  const R = k * sc;
  const S = (pts) => pts.map(([px, py]) => [hx + px * k, hy + py * k]);
  const P = (poly, col, sd, fo = {}) => part(C, T(S(poly)), fp > 0 ? { ...F(col, seed + sd, fo), draw: fp } : null, O(seed + sd + 50, { draw: d }));
  const back = ear < 0 ? 0.5 : 0;   // ears flattened back when running
  // far ear, then near ear (the near ear lifts and turns when listening)
  P([[-52, -40], [-62 - back * 30, -112 + back * 50], [-14, -64]], c.fur, 1);
  const e = Math.max(0, ear);
  P([[14, -64], [56 + e * 10 + back * 30, -118 - e * 26 + back * 50], [54, -38]], c.fur, 2);
  P(handCircle(0, 0, 68, seed + 3, 0.08, 40), c.fur, 3);
  P(ellipse(0, 26, 34, 24, 20), c.belly, 4, { gap: 5, w: 7 });
  const g = C.l;
  if (eyes === 'closed') {
    for (const ex of [-26, 26]) line(g, T(S([[ex - 14, -8], [ex, 2], [ex + 14, -8]])), { w: 6, seed: seed + 60 + ex, draw: d });
  } else {
    const r = eyes === 'wide' ? 14 : 10;
    for (const ex of [-26, 26]) { dab(C.f, ...T(S([[ex, -8]]))[0], r * R, { col: K.ink, seed: seed + 70 + ex, p: 1, gap: 3, w: 4 }); dab(C.f, ...T(S([[ex + 4, -12]]))[0], 3.5 * R, { col: K.white, seed: seed + 80 + ex, p: 1, gap: 2, w: 3 }); }
  }
  dab(C.f, ...T(S([[0, 16]]))[0], 9 * R, { col: K.pink, seed: seed + 90, p: 1, gap: 3, w: 4 });
  for (const ex of [-40, 40]) dab(C.f, ...T(S([[ex, 18]]))[0], 13 * R, { col: K.pink, seed: seed + 91 + ex, p: 0.7, gap: 4, w: 5 });
  line(g, T(S([[-10, 34], [0, 40], [10, 34]])), { w: 5, seed: seed + 95, draw: d });
  for (const sg of [-1, 1]) for (const wy of [18, 32]) line(g, T(S([[sg * 34, wy], [sg * 92, wy - 8 + (wy - 24)]])), { w: 3.5, seed: seed + 96 + wy + sg, p: 0.8, draw: d });
}

// ——— the mouse (grey, small, very quick) ———
export function mouse(C, { x, y, s = 1, flip = 1, seed = 700 }) {
  const T = pts => xf(pts, { x, y, s, sx: flip });
  line(C.l, T([[-40, -20], [-90, -30], [-120, -10]]), { w: 5, seed: seed + 1 });
  part(C, T(ellipse(0, -28, 46, 28, 24)), F('#a7a2a8', seed + 2, { gap: 6, w: 8 }), O(seed + 3, { w: 6 }));
  part(C, T(handCircle(24, -56, 16, seed + 4, 0.05, 20)), F(K.pink, seed + 5, { gap: 4, w: 6 }), O(seed + 6, { w: 5 }));
  dab(C.f, ...T([[38, -32]])[0], 5 * s, { col: K.ink, seed: seed + 7, p: 1, gap: 2, w: 3 });
}

// ——— Pip: a picture-book child, red striped top, no hat ———
// pose: 'stand' | 'point' (points right) | 'shh' (finger to lips) | 'jump' (arms up, startled) | 'sit'
export function pip(C, { x, y, s = 1, pose = 'stand', seed = 400, eyes = 'open', mouth = 'smile', jumpY = 0 }) {
  const T = pts => xf(pts, { x, y: y - jumpY, s });
  const P = (poly, col, sd, fo = {}) => part(C, T(poly), F(col, seed + sd, fo), O(seed + sd + 50));
  const sit = pose === 'sit';
  // legs and shoes
  if (!sit) for (const lx of [-26, 26]) { P(tube([[lx, -150], [lx + Math.sign(lx) * 6, -30]], 34, 30), K.sky, 1 + lx); P(ellipse(lx + Math.sign(lx) * 12, -16, 30, 16, 16), K.brown, 3 + lx); }
  else { P(tube([[-30, -120], [40, -110], [70, -40]], 34, 30), K.sky, 1); P(tube([[30, -118], [96, -104], [118, -40]], 34, 30), K.sky, 2); P(ellipse(80, -18, 28, 15, 16), K.brown, 3); P(ellipse(128, -18, 28, 15, 16), K.brown, 4); }
  // arms behind/in front decided by pose
  const sh = [[-58, -300], [58, -300]];
  const arm = {
    stand: [[[-70, -230], [-78, -170]], [[70, -230], [78, -170]]],
    point: [[[-70, -230], [-78, -170]], [[110, -300], [170, -320]]],
    shh: [[[-70, -230], [-78, -170]], [[40, -260], [16, -350]]],
    jump: [[[-110, -360], [-130, -430]], [[110, -360], [130, -430]]],
    sit: [[[-80, -220], [-60, -170]], [[80, -220], [60, -170]]],
  }[pose];
  const by = sit ? 40 : 0;
  // top: red with cream stripes
  const torso = [[-62, -320 + by], [62, -320 + by], [74, -140 + by], [-74, -140 + by]];
  P(torso, K.red, 10, { gap: 7 });
  for (let i = 0; i < 3; i++) line(C.f, T([[-66, -280 + i * 46 + by], [66, -280 + i * 46 + by]]), { w: 13, col: K.cream, seed: seed + 20 + i, p: 1 });
  arm.forEach(([m, h], i) => { const S0 = [sh[i][0], sh[i][1] + 14 + by]; P(tube(curve([S0, [m[0], m[1] + by], [h[0], h[1] + by]]), 30, 26), K.red, 30 + i, { gap: 7 }); P(handCircle(h[0], h[1] + by, 18, seed + 33 + i, 0.05, 20), K.peach, 34 + i, { gap: 5, w: 7 }); });
  // head
  const hy = -400 + by;
  P(handCircle(0, hy, 78, seed + 40, 0.08, 44), K.peach, 40, { p: 0.75 });
  // hair: a scalloped cap, outlined only on its outer edge
  const hair = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; hair.push([Math.cos(a) * 84, hy - 10 + Math.sin(a) * 82]); }
  const fringe = []; for (let i = 0; i <= 6; i++) fringe.push([66 - i * 22, hy - 30 + (i % 2) * 18]);
  part(C, T([...hair, ...fringe]), F(K.brown, seed + 41, { gap: 7 }), null);
  line(C.l, T(hair), { w: 7, seed: seed + 42 });
  // face
  const ey = hy + 6;
  if (eyes === 'closed') for (const ex of [-28, 28]) line(C.l, T([[ex - 10, ey], [ex, ey + 6], [ex + 10, ey]]), { w: 6, seed: seed + 43 + ex });
  else for (const ex of [-28, 28]) { dab(C.f, ...T([[ex, ey]])[0], (eyes === 'wide' ? 11 : 8) * s, { col: K.ink, seed: seed + 44 + ex, p: 1, gap: 3, w: 4 }); dab(C.f, ...T([[ex + 3, ey - 3]])[0], 3 * s, { col: K.white, seed: seed + 45 + ex, p: 1, gap: 2, w: 3 }); }
  for (const ex of [-46, 46]) dab(C.f, ...T([[ex, ey + 26]])[0], 14 * s, { col: K.pink, seed: seed + 46 + ex, p: 0.75, gap: 4, w: 5 });
  if (mouth === 'o') part(C, T(handCircle(0, ey + 40, 11, seed + 47, 0.05, 18)), F(K.ink, seed + 48, { gap: 3, w: 4 }), null);
  else line(C.l, T([[-18, ey + 34], [0, ey + 44], [18, ey + 34]]), { w: 6, seed: seed + 49 });
}
