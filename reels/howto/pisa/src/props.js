// The story's machinery: the 1990 barrier and its gate, the cutaway of the ground, the steel ring and cables, the lead and its crane,
// the drill, the plumb line and its mark board, the 1170s scaffold and the 2001 ribbon. Each is a group a shot switches on.
import * as THREE from 'three';
import { toon, box, cyl, ball, canvasTex, board } from '../../engine/toon.js';
import { decal, card, arrowDraw, INK } from '../../engine/film.js';
import { tower } from './set.js';
const STEEL = 0x8d939e, LEAD = 0x5d616b, CONCRETE = 0xc9c3b6;
const font = (g, px, w = 800) => { g.font = `${w} ${px}px Cap, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; };
// a mesh fence panel: a steel frame with wire mesh you can see through, on two concrete feet
function panel(w = 2.6, h = 2) { const P = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon(0xffffff, { map: canvasTex(256, 200, (g, W, H) => { g.strokeStyle = '#8d939e'; g.lineWidth = 3; for (let i = 0; i <= 26; i++) { g.beginPath(); g.moveTo(i * W / 26, 0); g.lineTo(i * W / 26, H); g.stroke(); } for (let j = 0; j <= 20; j++) { g.beginPath(); g.moveTo(0, j * H / 20); g.lineTo(W, j * H / 20); g.stroke(); } }), transparent: true, alphaTest: .4, side: THREE.DoubleSide }));
  mesh.position.y = h / 2 + .15; mesh.userData.noInk = true; P.add(mesh);
  for (const x of [-w / 2, w / 2]) P.add(cyl(.04, .04, h, STEEL, [x, h / 2 + .15, 0], 8), box(.25, .15, .6, CONCRETE, [x, .07, 0]));
  P.add(box(w, .05, .05, STEEL, [0, h + .15, 0]), box(w, .05, .05, STEEL, [0, .2, 0])); return P; }
// the barrier round the tower: panels on a ring of radius 10, with a two-leaf gate facing the lawn (+x) and a CHIUSO sign
export function barrier() { const B = new THREE.Group(), RAD = 10, n = 24;
  for (let i = 1; i < n; i++) { const a = i / n * Math.PI * 2, p = panel(); p.position.set(Math.cos(a) * RAD, 0, Math.sin(a) * RAD); p.rotation.y = -a + Math.PI / 2; B.add(p); }
  const leaves = [];
  for (const s of [-1, 1]) { const hinge = new THREE.Group(); hinge.position.set(RAD, 0, s * 1.3); const lf = panel(1.3, 2); lf.rotation.y = Math.PI / 2; lf.position.z = -s * .65; hinge.add(lf); B.add(hinge); leaves.push([hinge, s]); }
  const sign = board(1.15, .75, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#e23d3d'; g.fillRect(0, 0, w, h * .55); g.strokeStyle = INK; g.lineWidth = h * .05; g.strokeRect(0, 0, w, h);
    g.fillStyle = '#fff'; font(g, h * .3); g.fillText('CHIUSO', w / 2, h * .29); g.fillStyle = INK; font(g, h * .2, 700); g.fillText('CLOSED', w / 2, h * .66); font(g, h * .14, 700); g.fillText('7 · 1 · 1990', w / 2, h * .86); }, 300);
  sign.position.set(0, 1.35, .06); leaves[1][0].children[0].add(sign);
  B.userData.open = (u, signOn = true) => { sign.visible = signOn; for (const [h, s] of leaves) h.rotation.y = -s * u * 1.6; };
  return B; }
// the ground cut open: soil layers on the face of a block, a stone footing under the tower that sinks and tips with it.
// The block's face is the plane x = 3.75 (local); the camera looks at it from +x. High side +z is screen left.
export function section() { const S = new THREE.Group(), D = 26, Z = 100;
  const strata = canvasTex(2000, 520, (g, w, h) => { const y = m => m / D * h;
    const band = (a, b, c) => { g.fillStyle = c; g.fillRect(0, y(a), w, y(b - a) + 1); };
    band(0, .4, '#5aa84f'); band(.4, 2.4, '#8a5a3a'); band(2.4, 11, '#9aa3ad'); band(11, 15, '#e0c27a'); band(15, D, '#6f7a86');
    g.strokeStyle = 'rgba(29,26,38,.25)'; g.lineWidth = 3;
    for (let j = 0; j < 9; j++) { g.beginPath(); for (let x = 0; x <= w; x += 20) g.lineTo(x, y(3.2 + j * .9) + Math.sin(x * .02 + j) * 5); g.stroke(); }
    g.fillStyle = 'rgba(29,26,38,.25)'; for (let i = 0; i < 400; i++) { const x = (i * 977) % w, yy = y(11.2) + ((i * 613) % 1000) / 1000 * y(3.6); g.beginPath(); g.arc(x, yy, 3, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 160; i++) { const x = (i * 571) % w, yy = y(15.5) + ((i * 331) % 1000) / 1000 * y(10); g.fillRect(x, yy, 30, 4); }
    g.strokeStyle = INK; g.lineWidth = 5; for (const m of [.4, 2.4, 11, 15]) { g.beginPath(); g.moveTo(0, y(m)); g.lineTo(w, y(m)); g.stroke(); } });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(Z, D), toon(0xffffff, { map: strata })); face.rotation.y = Math.PI / 2; face.position.set(3.75, -D / 2, 0); S.add(face);
  const top = box(60, .2, Z, 0x66b55a, [3.75 - 30, -.1, 0]); S.add(top); S.add(box(60, D, .2, 0x6f5a4a, [3.75 - 30, -D / 2, -Z / 2]));
  // the tower, and its footing drawn on the cut
  const T = tower(); S.add(T);
  const piv = new THREE.Group(); piv.position.set(3.8, 0, 0); S.add(piv);
  const foot = board(9.5, 3.2, (g, w, h) => { g.fillStyle = '#d9d2c2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#a8a294'; g.lineWidth = 4; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); } for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) { const x = (i + (j % 2) * .5) * w / 6; g.beginPath(); g.moveTo(x, j * h / 4); g.lineTo(x, (j + 1) * h / 4); g.stroke(); } g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(0, 0, w, h); }, 120);
  foot.rotation.y = Math.PI / 2; foot.position.y = -2.15; piv.add(foot);
  // voids the drill leaves under the high side, drawn on the cut
  const holes = []; for (let i = 0; i < 5; i++) { const h = new THREE.Mesh(new THREE.CircleGeometry(.6, 20), toon(0x2d2a33)); h.rotation.y = Math.PI / 2; h.position.set(3.82, -4.4 - (i % 2) * .7, 1.2 + i * 1.05); h.userData.noInk = true; S.add(h); holes.push(h); }
  // the drill: a rig on the lawn beyond the high side, three tubes angled down under the footing, soil coming up them into a skip
  const rig = new THREE.Group(); rig.position.set(1, 0, 15); S.add(rig);
  rig.add(box(3, 1.4, 2.2, 0xffb000, [0, .9, 0]), box(.9, .6, 2.6, 0x2a2733, [0, .3, 0]), cyl(.12, .12, 7, 0xe6634a, [0, 4.2, -.8], 8), box(1.2, .9, 1, 0x2a2733, [0, 2, .9]));
  const skip = new THREE.Group(); skip.position.set(1.5, 0, 19); S.add(skip); skip.add(box(2.2, 1, 1.6, 0xffd23f, [0, .5, 0]));
  const pile = ball(1, 0x8a5a3a, [0, 1, 0], [1, .45, .7]); skip.add(pile);
  const tubes = []; for (const [ex, ey, ez] of [[3.85, -4.4, 1.2], [3.85, -5.1, 3.3], [3.85, -4.4, 5.4]]) { const a = new THREE.Vector3(3.85, -.2, 13.5), b = new THREE.Vector3(ex, ey, ez), m = cyl(.16, .16, 1, STEEL, [0, 0, 0], 10);
    m.userData = { a, b }; S.add(m); tubes.push(m); }
  const crumbs = []; for (let i = 0; i < 12; i++) { const c = ball(.22, 0x8a5a3a, [0, 0, 0]); S.add(c); crumbs.push(c); }
  const arrow = card(3, 3, arrowDraw('#ffd23f'), 200); arrow.rotation.y = Math.PI / 2; S.add(arrow);
  S.userData = { T, piv, holes, tubes, crumbs, pile, arrow,
    // lean (radians), sink (metres), drill 0..1 (how far the tubes are in), dug 0..1 (soil out), close 0..1 (voids closed), t for the flow
    set({ lean = .07, sink = 0, drill = 0, dug = 0, close = 0, t = 0, storeys = 7, arrowK = 0 }) {
      T.position.y = -sink; T.userData.lean.rotation.x = -lean; T.userData.tiers.forEach((s, i) => s.visible = i < storeys - 1);
      piv.position.y = -sink; piv.rotation.x = -lean;
      holes.forEach((h, i) => { const k = THREE.MathUtils.clamp(dug * 5 - i, 0, 1) * (1 - close); h.visible = k > .02; h.scale.setScalar(Math.max(.01, k)); });
      tubes.forEach((m, i) => { const k = THREE.MathUtils.clamp(drill * 1.4 - i * .2, 0, 1), e = m.userData.a.clone().lerp(m.userData.b, k), d = e.clone().sub(m.userData.a); m.visible = k > .01 && close < .98;
        m.position.copy(m.userData.a).add(e).multiplyScalar(.5); m.scale.set(1, Math.max(.01, d.length()), 1); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); });
      crumbs.forEach((c, i) => { const tb = tubes[i % 3], f = ((t * .5 + i / 12) % 1); c.visible = dug > 0 && dug < 1 && tb.visible; c.position.copy(tb.userData.b).lerp(tb.userData.a, f); c.position.x = 3.95; });
      pile.scale.set(1, .45 * Math.max(.05, dug), .7); pile.visible = dug > 0;
      arrow.visible = arrowK > 0; arrow.scale.setScalar(Math.max(.01, arrowK)); arrow.position.set(4.2, 14, 6); arrow.rotation.set(0, Math.PI / 2, Math.PI / 2 - .3); } };
  return S; }
// a steel ring round the third storey and two cables to anchor blocks across the square (toward +z, the high side)
export function cables(T) { const C = new THREE.Group(), lean = T.userData.lean, R = T.userData.R;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R + .35, .14, 8, 48), toon(STEEL)); ring.rotation.x = Math.PI / 2; ring.position.y = 9 + 2 * 5.4 + .3; lean.add(ring); ring.visible = false;
  const ANCH = [[-9, 21.5], [9, 21.5]], wires = [], blocks = [];
  for (const [x, z] of ANCH) { const b = new THREE.Group(); b.position.set(x, 0, z); b.add(box(2.4, 1.2, 2.4, CONCRETE, [0, .6, 0]), box(.5, .9, .5, STEEL, [0, 1.6, 0]), cyl(.25, .25, .2, 0xffd23f, [0, 2.1, 0], 12)); C.add(b); blocks.push(b);
    const w = cyl(.07, .07, 1, 0x3a3d45, [0, 0, 0], 6); C.add(w); wires.push(w); }
  C.userData.set = u => { ring.visible = u > 0; T.updateMatrixWorld(true);
    ANCH.forEach(([x, z], i) => { const a = lean.localToWorld(new THREE.Vector3(x > 0 ? 1.6 : -1.6, ring.position.y, R + .3)), b = new THREE.Vector3(x, 2.1, z), e = a.clone().lerp(b, THREE.MathUtils.clamp(u, 0, 1)), d = e.clone().sub(a), w = wires[i];
      w.visible = u > 0; w.position.copy(a).add(e).multiplyScalar(.5); w.scale.set(1, Math.max(.01, d.length()), 1); w.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); }); };
  return C; }
// the lead: a concrete ring segment hugging the high side, ingots stacked on it, a plaque, and a tower crane with an ingot on its hook
export function lead() { const L = new THREE.Group();
  L.add(box(8, .8, 2.6, CONCRETE, [0, .4, 5.2]));
  const ingots = []; for (let l = 0; l < 6; l++) for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) { const g = box(.95, .34, .7, LEAD, [-3.3 + c * 1.1 + (l % 2) * .1, .97 + l * .36, 4.4 + r * .8]); L.add(g); ingots.push(g); }
  const plaque = board(1.8, .7, (g, w, h) => { g.fillStyle = '#2a2733'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ffd23f'; g.lineWidth = h * .06; g.strokeRect(h * .06, h * .06, w - h * .12, h * .88); g.fillStyle = '#ffd23f'; font(g, h * .55); g.fillText('870 t', w / 2, h * .54); }, 260);
  plaque.position.set(4.02, .45, 5.2); plaque.rotation.y = Math.PI / 2; L.add(plaque);
  const crane = new THREE.Group(); crane.position.set(0, 0, 16); L.add(crane);
  for (let y = 0; y < 30; y += 2) crane.add(box(1.2, .1, .1, 0xffb000, [0, y, .55]), box(1.2, .1, .1, 0xffb000, [0, y, -.55]), box(.1, .1, 1.2, 0xffb000, [.55, y, 0]), box(.1, .1, 1.2, 0xffb000, [-.55, y, 0]));
  for (const [x, z] of [[.55, .55], [.55, -.55], [-.55, .55], [-.55, -.55]]) crane.add(box(.14, 30, .14, 0xffb000, [x, 15, z]));
  const jib = new THREE.Group(); jib.position.y = 30; crane.add(jib); jib.add(box(1, 1, 14, 0xffb000, [0, 0, -5]), box(2, 1.6, 2, 0x2a2733, [0, .3, 4.5]), box(1.4, 1.4, 1.4, 0xffb000, [0, 1.2, 0]));
  const hook = new THREE.Group(); jib.add(hook); const rope = cyl(.03, .03, 1, 0x2a2733, [0, 0, 0], 4); hook.add(rope); const hi = box(.95, .34, .7, LEAD, [0, 0, 0]); hook.add(hi);
  L.userData = { ingots, hook, rope, hi, plaque,
    // n 0..1: how much of the 870 t is down; drop 0..1: where the ingot on the hook is between the jib and the stack
    set(n, drop = 1) { const k = Math.round(n * ingots.length); ingots.forEach((g, i) => g.visible = i < k); const ty = 1 + Math.floor(k / 21) * .36 + .3;
      hook.position.set(0, 0, 5.2 - 16); const y = THREE.MathUtils.lerp(-6, ty - 30, drop); hi.position.y = y; rope.position.y = y / 2; rope.scale.y = Math.max(.01, -y); hi.visible = drop < 1 && n < 1; } };
  return L; }
// the plumb line from the top of the low side, and a mark board on the ground under it
export function plumb(T, marks) { const P = new THREE.Group(), lean = T.userData.lean, H = 9 + 6 * 5.4 - .2;
  const line = cyl(.025, .025, 1, 0x2a2733, [0, 0, 0], 4), bob = new THREE.Mesh(new THREE.ConeGeometry(.22, .5, 12), toon(0xb08d3c)); bob.rotation.x = Math.PI; P.add(line, bob);
  const arm = box(.12, .12, 1.4, STEEL, [0, H, -T.userData.R - .7]); lean.add(arm); arm.visible = false;
  const zOf = a => -(H * Math.sin(a) + (T.userData.R + 1.35) * Math.cos(a));
  const [z90, z38] = [zOf(marks[1]), zOf(marks[0])];
  const boardM = decal(1.6, .8, (g, w, h) => { g.fillStyle = '#f6f2e8'; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
    const X = z => w / 2 - (z - (z90 + z38) / 2) / 1.6 * w; g.lineWidth = 4; for (let i = -20; i <= 20; i++) { const x = w / 2 + i * w / 32; g.beginPath(); g.moveTo(x, h * .78); g.lineTo(x, h * (i % 5 ? .88 : .94)); g.stroke(); }
    for (const [z, label, c] of [[z90, '1990', '#e23d3d'], [z38, '1838', '#2f6fd6']]) { g.strokeStyle = c; g.lineWidth = 10; g.beginPath(); g.moveTo(X(z), h * .2); g.lineTo(X(z), h * .76); g.stroke(); g.fillStyle = c; font(g, h * .15); g.textAlign = label === '1990' ? 'left' : 'right'; g.fillText(label, X(z) + (label === '1990' ? 1 : -1) * w * .03, h * .64); }
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(X(z90), h * .5); g.lineTo(X(z38), h * .5); g.stroke(); g.fillStyle = INK; font(g, h * .13); g.fillText('45 cm', (X(z90) + X(z38)) / 2, h * .42); }, 240);
  boardM.rotation.z = Math.PI / 2; boardM.position.set(0, .03, (z90 + z38) / 2); P.add(boardM);
  P.userData = { arm, board: boardM, set(t) { arm.visible = true; T.updateMatrixWorld(true); const top = lean.localToWorld(new THREE.Vector3(0, H - .1, -T.userData.R - 1.35)), sw = .06 * Math.sin(t * 2.2), bot = new THREE.Vector3(top.x + sw * .3, .5, top.z + sw);
    line.position.copy(top).add(bot).multiplyScalar(.5); line.scale.y = top.distanceTo(bot); const d = bot.clone().sub(top).normalize(); line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); bob.position.copy(bot); bob.position.y = .45; return bot; } };
  return P; }
// the 1170s: wooden scaffold round a three-storey stump
export function scaffold() { const S = new THREE.Group(), R = 4.5, WOOD = 0x8a5a2e;
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; S.add(cyl(.09, .11, 22, WOOD, [Math.cos(a) * R, 11, Math.sin(a) * R], 6)); }
  for (const y of [3, 7, 11, 15, 19]) { const r = new THREE.Mesh(new THREE.TorusGeometry(R, .07, 4, 32), toon(WOOD)); r.rotation.x = Math.PI / 2; r.position.y = y; S.add(r);
    const deck = new THREE.Mesh(new THREE.RingGeometry(3.4, R, 32, 1), toon(0xb07a45, { side: THREE.DoubleSide })); deck.rotation.x = -Math.PI / 2; deck.position.y = y - .05; S.add(deck); }
  S.add(box(1.4, .8, .9, 0xe9e3d4, [7, .4, 2]), box(1.4, .8, .9, 0xe9e3d4, [7.2, 1.2, 2.1]), box(1.4, .8, .9, 0xe9e3d4, [6.2, .4, 3.4]));
  return S; }
// the ribbon across the open gate in 2001: two halves that drop when it is cut
export function ribbon() { const Rb = new THREE.Group(), halves = [];
  for (const s of [-1, 1]) { const h = new THREE.Group(); h.position.set(10.2, 1.3, s * 1.35); const m = box(.04, .22, 1.35, 0xe23d3d, [0, 0, -s * .675]); h.add(m); Rb.add(h); halves.push([h, s]); }
  const bow = ball(.25, 0xe23d3d, [10.25, 1.3, 0], [.5, 1, 1.4]); Rb.add(bow);
  Rb.userData.cut = u => { bow.visible = u <= 0; for (const [h, s] of halves) h.rotation.x = -s * u * 1.4; };
  return Rb; }
