// The QUICK STOP, built once in the 3D world, inside and out, so one camera can move from Max at the counter, back through the
// shop window, out to the street and up over the town without ever changing drawings. Metres; the shopfront faces +z at z = 27.
import { view as meshView, proj, draw, box, panel } from './props/mesh.js';
import { counter, shelf, fridge, bill } from './props/props.js';
import { drawMax, UNIT, ORIGIN_H, MAXC } from './max.js';
import { hand } from './faces.js';
import { push, pop, translate, scale, shape, fillOnly, text, ell, noodle } from './toon.js';
import { gripHand } from './phonepov.js';
export const STORE = { x0: -8, x1: 14, z0: 14, z1: 27, h: 4.5, counterX: 5.3, counterZ: 22.6, maxZ: 21.9 };
const S = STORE, GLASS = 'rgba(200,232,240,.16)';
const place = (faces, dx, dz, rot = 0) => faces.map(q => ({ ...q, pts: q.pts.map(([x, y, z]) => [dx + x * Math.cos(rot) + z * Math.sin(rot), y, dz - x * Math.sin(rot) + z * Math.cos(rot)]) }));
// the shell, each piece drawn on its own, back to front: floor, ceiling, back wall, side walls
const SHELL = [box(S.x0, -.05, S.z0, S.x1, 0, S.z1, '#d5d9cf'), box(S.x0, S.h - .14, S.z0, S.x1, S.h - .1, S.z1, { all: '#c9cdc4', bottom: '#e4e8df' }),
  box(S.x0, 0, S.z0 - .2, S.x1, S.h, S.z0, '#8fa3a3'), box(S.x0 - .2, 0, S.z0, S.x0, S.h, S.z1, '#86999b'), box(S.x1, 0, S.z0, S.x1 + .2, S.h, S.z1, '#86999b')];
// floor tiles: a grid of thin lines on the floor
const TILES = []; for (let x = S.x0; x <= S.x1; x += .6) TILES.push([[x, .002, S.z0], [x, .002, S.z1]]); for (let z = S.z0; z <= S.z1; z += .6) TILES.push([[S.x0, .002, z], [S.x1, .002, z]]);
// the stock: shelving along the back wall, a run of shelving behind the counter, drinks fridges down the right wall, a card rack
const STOCK = (() => { const f = [], fr = fridge().faces;
  for (let i = 0; i < 18; i++) f.push(...place(shelf(i % 2 ? undefined : ['#4f8fd6', '#e8742e', '#f2c14e', '#7ab55c', '#d9433a', '#2f6f73']).faces, S.x0 + .9 + i * 1.05, S.z0 + .3));
  for (let i = 0; i < 4; i++) f.push(...place(shelf(['#f2c14e', '#d9433a', '#2f6f73', '#e8742e', '#4f8fd6', '#b45fc4']).faces, S.counterX - 1.6 + i * 1.05, 20.9));
  for (let i = 0; i < 7; i++) f.push(...place(fr.map(q => q.col === '#e2ded4' ? { ...q, col: '#bfe3ee', glow: true } : q), S.x1 - .4, 15.2 + i * .74, -Math.PI / 2));
  for (const x of [-3.2, -.2]) for (let i = 0; i < 2; i++) f.push(...place(shelf().faces, x + i * 1.05, 19.5), ...place(shelf().faces, x + i * 1.05, 20.0, Math.PI));   // aisles
  return f; })();
const LIGHTS = []; for (const x of [-4.5, .5, 5.3, 10]) for (const z of [16, 19.5, 23, 25.8]) LIGHTS.push(...box(x - .75, S.h - .3, z - .1, x + .75, S.h - .2, z + .1, '#fbfff8', { glow: true }));
const BILL = bill(), BILL_AT = [S.counterX - .28, .95, S.counterZ + .15], BILL_ROT = .06;
const CTR = place(counter(2.8).faces, S.counterX, S.counterZ);
const BOARD = [...box(S.counterX - 1.9, 2.4, 20.75, S.counterX + 1.9, 3.2, 21.0, '#2d2b30')];
const CELLS = [['COFFEE', '$1.29', '#e8742e'], ['HOT DOGS', '2 FOR $3', '#c8433a'], ['ICE', '$2.49', '#4f8fd6']];
// the shopfront: wall pieces round real openings, so the room shows through the glass
export const BAYS = [[S.x0 + .4, S.x0 + 4.4, .6, 3.1], [S.x0 + 4.7, S.x0 + 8.7, .6, 3.1], [S.x0 + 9.0, S.x0 + 11.0, 0, 2.05], [S.x0 + 11.3, S.x0 + 15.3, .75, 2.45], [S.x0 + 15.6, S.x1 - .4, .6, 3.1]];
const FRONT = (() => { const f = [], Z0 = S.z1 - .25, Z1 = S.z1, W = '#c8543f';
  f.push(...box(S.x0, 3.1, Z0, S.x1, S.h, Z1, { all: W, front: '#e8e2d0' }));                       // the sign band across the top
  let x = S.x0; for (const [a, b, lo, hi] of BAYS) { if (a > x) f.push(...box(x, 0, Z0, a, 3.1, Z1, W)); if (lo > 0) f.push(...box(a, 0, Z0, b, lo, Z1, '#8a3a2e')); if (hi < 3.1) f.push(...box(a, hi, Z0, b, 3.1, Z1, W)); x = b; }
  f.push(...box(x, 0, Z0, S.x1, 3.1, Z1, W));
  for (const [a, b, lo, hi] of BAYS) f.push(...box(a, hi - .07, Z1 - .03, b, hi, Z1 + .03, '#3a3840'), ...box(a, lo, Z1 - .03, b, lo + .05, Z1 + .03, '#3a3840'));
  const roof = box(S.x0 - .2, S.h - .1, S.z0 - .2, S.x1 + .2, S.h, S.z1, '#5b6170'); roof.pop(); f.push(...roof);   // the flat roof (no underside: inside, the ceiling is that)
  return f; })();
const GLASSES = BAYS.map(([a, b, lo, hi]) => [[a, lo, S.z1 - .12], [b, lo, S.z1 - .12], [b, hi, S.z1 - .12], [a, hi, S.z1 - .12]]);
// the camera position for a scene camera (the town's convention: pitch PI/2 looks straight along -z, smaller looks down)
export const insideStore = e => e[0] > STORE.x0 && e[0] < STORE.x1 && e[1] < STORE.h && e[2] > STORE.z0 && e[2] < STORE.z1;   // the camera is in the shop
export const eyeOf = cam => { const d = cam.dist || 1e6, y = cam.yaw || 0; return [cam.cx + d * Math.sin(cam.pitch) * Math.sin(y), (cam.cy || 0) + d * Math.cos(cam.pitch), cam.cz + d * Math.sin(cam.pitch) * Math.cos(y)]; };   // yaw PI: the camera looks toward +z (Max's own view, out to the shopfront)
// draw the store from the scene camera: cam = { pitch, P, cx, cy, cz, dist, yaw, focus }; act.pov: through Max's eyes (no Max, nothing behind him)
export function drawStore(t, cam, act = {}) {
  meshView({ yaw: cam.yaw || 0, pitch: Math.PI / 2 - cam.pitch, P: cam.P, ox: 540, oy: 960, cx: cam.cx, cy: cam.cy || 0, cz: cam.cz, dist: cam.dist || 0 });
  const eye = eyeOf(cam), outside = !insideStore(eye), sp = (x, y, z) => proj(x, y, z), pm = (x, y, z) => { const a = sp(x, y, z), b = sp(x + 1, y, z); return Math.abs(b[0] - a[0]); };
  const lw = Math.max(1.5, Math.min(5, pm(S.counterX, 1, S.counterZ) * .02)), opt = { lw, boil: .3 };
  for (const s of SHELL) draw(s, [0, 0, 0], 0, opt);
  for (const [a, b] of TILES) { const A = sp(...a), B = sp(...b); if (A[2] > .05 - (cam.dist || 1e6) || B[2] > .05 - (cam.dist || 1e6)) shape([A, B].map(p => [p[0], p[1]]), { closed: false, lw: 1.2, line: 'rgba(60,70,70,.28)', boil: 0 }); }
  draw(STOCK, [0, 0, 0], 0, opt);
  draw(BOARD, [0, 0, 0], 0, opt);
  if (!act.pov) CELLS.forEach(([a, b, col], i) => { const x0 = S.counterX - 1.85 + i * 1.25, q = [sp(x0, 2.45, 21.01), sp(x0 + 1.15, 2.45, 21.01), sp(x0 + 1.15, 3.15, 21.01), sp(x0, 3.15, 21.01)].map(p => [p[0], p[1]]);
    shape(q, { fill: '#f6efd8', lw: Math.max(1.2, lw * .5) }); const w = q[1][0] - q[0][0], h = q[0][1] - q[3][1], cx = (q[0][0] + q[1][0]) / 2, cy = (q[0][1] + q[3][1]) / 2;
    shape([[q[3][0], q[3][1]], [q[2][0], q[2][1]], [q[2][0], q[3][1] + h * .3], [q[3][0], q[3][1] + h * .3]], { fill: col, stroke: false, boil: .2 });
    if (w > 120) { push(); translate(cx, cy); scale(w / 300); text(a, 0, -55, { font: '800 44px Cap', fill: '#fff', scenery: true }); text(b, 0, 30, { font: '800 52px Cap', fill: '#2e1d1c', scenery: true }); pop(); } });
  // Max behind the counter: his origin is 0.963 m above the floor at his spot
  const [mx, my] = sp(S.counterX, ORIGIN_H, S.maxZ), k = pm(S.counterX, ORIGIN_H, S.maxZ) * UNIT, actM = { ...act, subject: cam.focus === 'max', subjectName: 'Max (in the store)', minH: 60 };
  if (!act.pov) { drawMax(t, mx, my, k, actM, 'legs'); drawMax(t, mx, my, k, actM, 'upper'); }
  draw(CTR, [0, 0, 0], 0, opt);
  // on the counter: the car payment letter, his card, the car key, a coffee
  const flat = (x0, z0, x1, z1, y = .952) => [sp(x0, y, z1), sp(x1, y, z1), sp(x1, y, z0), sp(x0, y, z0)].map(p => [p[0], p[1]]);
  let held = null;
  if (act.holdBill) {   // he holds the statement out to us over the counter, its top leaning back to face the camera
    const m = BILL.heldAt([S.counterX - .07, 1.37, S.counterZ + .12], .28, 0);
    held = { m, hands: [-1, 1].map(s => { const p = sp(...m([s * .1, 0, .02])); return [(p[0] - mx) / k, (p[1] - my) / k]; }) };   // gripping the sides
  } else if (!act.pov) { draw(BILL.faces, BILL_AT, BILL_ROT, { lw: Math.max(1.2, lw * .5), boil: .15 }); BILL.ink(BILL_AT, BILL_ROT); }   // the car payment statement (prop library)
  const handY = (sp(S.counterX, .955, S.counterZ - .2)[1] - my) / k;   // his hands rest on the counter top, 20 cm in from its back edge
  if (act.pov) {}
  else if (held) { const a = { ...actM, subject: false, hands: held.hands };
    drawMax(t, mx, my, k, { ...a, only: 'limbs' }, 'arms'); draw(BILL.placed(held.m), [0, 0, 0], 0, { lw: Math.max(1.2, lw * .5), boil: .15 }); BILL.ink(held.m); drawMax(t, mx, my, k, { ...a, only: 'hands' }, 'arms'); }
  else drawMax(t, mx, my, k, { ...actM, subject: false, handY: Math.max(62, handY) }, 'arms');
  draw(LIGHTS, [0, 0, 0], 0, opt);
  if (!outside && !act.pov) return;   // from inside, the shopfront is only seen looking out (POV)
  for (const q of GLASSES) shape(q.map(p => sp(...p)).map(p => [p[0], p[1]]), { fill: GLASS, stroke: false, boil: 0 });   // the glass
  draw(FRONT, [0, 0, 0], 0, opt);
}

// Max's POV: the statement in his hands, 40 cm in front of his eyes, over the counter. Drawn on top of the (blurred) shop.
export const POV_BILL = [STORE.counterX, 1.2, STORE.maxZ + .4];
export function drawPovBill(t, cam, { lean = .78 } = {}) {
  meshView({ yaw: cam.yaw || 0, pitch: Math.PI / 2 - cam.pitch, P: cam.P, ox: 540, oy: 960, cx: cam.cx, cy: cam.cy || 0, cz: cam.cz, dist: cam.dist || 0 });
  const m = BILL.heldAt(POV_BILL, lean, Math.PI), sp = (...p) => proj(...m(p)), px = Math.hypot(...[0, 1].map(i => sp(.108, 0, 0)[i] - sp(-.108, 0, 0)[i])) / .216;
  const mm = px / 1000, grips = [-1, 1].map(s => [s, sp(s * .108, 0, .055)]);   // his hands at true size, holding the page's side edges a little below the middle
  for (const [s, at] of grips) gripHand(s, at, mm, 'back');                       // the hands beside and behind the paper
  draw(BILL.placed(m), [0, 0, 0], 0, { lw: Math.max(2, px * .0016), boil: .15 }); BILL.ink(m);
  for (const [s, at] of grips) gripHand(s, at, mm, 'front');                      // the thumbs on the front
}
