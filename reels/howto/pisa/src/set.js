// The Piazza dei Miracoli: the leaning tower, the cathedral and the baptistery on a green lawn, the town around it, and its clutter.
// Metres, y up. The tower stands at the origin and leans toward -z (its "low side"); the high side is +z. Seen from the lawn (+x), it leans to screen right.
import * as THREE from 'three';
import { toon, flat, box, cyl, ball, canvasTex, board } from '../../engine/toon.js';
import { decal, INK } from '../../engine/film.js';
export const LEAN = .07;   // about 4 degrees
const MARBLE = 0xf4efe3, GREY = 0xb9b4a8, TERRACOTTA = 0xc9653f;
// a band of arches, drawn: white marble with grey inlay lines and dark arch openings
function arcadeTex(n, dark = '#4a4552') { return canvasTex(1024, 256, (g, w, h) => { g.fillStyle = '#f4efe3'; g.fillRect(0, 0, w, h); const aw = w / n;
  for (let i = 0; i < n; i++) { const x = i * aw; g.fillStyle = dark; g.beginPath(); g.moveTo(x + aw * .18, h); g.lineTo(x + aw * .18, h * .42); g.arc(x + aw / 2, h * .42, aw * .32, Math.PI, 0); g.lineTo(x + aw * .82, h); g.fill();
    g.strokeStyle = '#a8a294'; g.lineWidth = 6; g.beginPath(); g.arc(x + aw / 2, h * .42, aw * .38, Math.PI, 0); g.stroke(); g.fillStyle = '#d9d2c2'; g.fillRect(x, 0, aw * .06, h); }
  g.fillStyle = '#b9b4a8'; g.fillRect(0, 0, w, h * .05); g.fillRect(0, h * .95, w, h * .05); }); }
function stripes(n) { const t = canvasTex(64, 512, (g, w, h) => { for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? '#e9e3d4' : '#f6f2e8'; g.fillRect(0, i * h / n, w, h / n); } }); t.wrapS = THREE.RepeatWrapping; t.repeat.set(8, 1); return t; }
export function tower() { const T = new THREE.Group(), lean = new THREE.Group(); T.add(lean); lean.rotation.x = -LEAN;
  const R = 3.3, base = 9;
  // the base: a closed drum with blind arches and a door
  { const m = new THREE.Mesh(new THREE.CylinderGeometry(R, R + .15, base, 48, 1, true), toon(0xffffff, { map: arcadeTex(14, '#d4ccba') })); m.position.y = base / 2; m.castShadow = m.receiveShadow = true; lean.add(m);
    const cap0 = cyl(R + .25, R + .25, .5, MARBLE, [0, .25, 0], 48); lean.add(cap0); }
  // six open galleries, each a core, a ring of columns and a cornice
  let y = base; const gh = 5.4, tiers = [];
  for (let k = 0; k < 6; k++) { const st = new THREE.Group(); lean.add(st); tiers.push(st); { const lean = st; const core = new THREE.Mesh(new THREE.CylinderGeometry(R - .55, R - .55, gh, 40, 1, true), toon(0xffffff, { map: stripes(18) })); core.position.y = y + gh / 2; lean.add(core);
    lean.add(cyl(R + .2, R + .2, .35, MARBLE, [0, y + .17, 0], 48), cyl(R + .25, R + .2, .4, GREY, [0, y + gh - .2, 0], 48));
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(R + .08, R + .08, 1.2, 48, 1, true), toon(0xffffff, { map: arcadeTex(30, 'rgba(0,0,0,0)'), transparent: true, alphaTest: .5, side: THREE.DoubleSide })); arch.position.y = y + gh - 1.0; lean.add(arch);
    for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2; const c = cyl(.13, .15, gh - 1.4, MARBLE, [Math.cos(a) * (R + .05), y + .35 + (gh - 1.4) / 2, Math.sin(a) * (R + .05)], 10); lean.add(c); } }
    y += gh; }
  // the belfry: a narrower drum with big openings and a little roof rail; a bell inside
  const belfry = new THREE.Group(); lean.add(belfry); tiers.push(belfry);
  { const lean = belfry; const b = new THREE.Mesh(new THREE.CylinderGeometry(R - .9, R - .9, 4.5, 40, 1, true), toon(0xffffff, { map: arcadeTex(12, '#2d2a33'), side: THREE.DoubleSide })); b.position.y = y + 2.25; b.castShadow = true; lean.add(b);
    lean.add(cyl(R - .7, R - .7, .3, GREY, [0, y + 4.6, 0], 40), cyl(R - .85, R - .85, .25, MARBLE, [0, y + .12, 0], 40));
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(.35, .7, .9, 16), toon(0xb08d3c)); bell.position.set(0, y + 2.6, 0); lean.add(bell); }
  T.userData = { lean, tiers, top: y + 4.7, R }; T.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return T; }
// the cathedral front: tiers of little arcades over three doors, a gable, and side aisles
function cathedral() { const C = new THREE.Group();
  C.add(box(30, 14, 60, MARBLE, [0, 7, -30]), box(14, 8, 60, MARBLE, [0, 18, -30]));
  const front = board(30, 22, (g, w, h) => { g.fillStyle = '#f4efe3'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b9b4a8'; g.lineWidth = w * .004; for (let i = 0; i < 40; i++) { g.beginPath(); g.moveTo(0, i * h / 40); g.lineTo(w, i * h / 40); g.stroke(); }
    for (const [y0, n, s] of [[.62, 5, .3], [.36, 15, .12], [.22, 11, .1], [.1, 9, .09]]) for (let i = 0; i < n; i++) { const x = w * (.5 - (n - 1) * s * .5 * .9 + i * s * .9), y = h * y0; g.fillStyle = '#4a4552'; g.beginPath(); g.moveTo(x - w * s * .3, y + h * .12); g.lineTo(x - w * s * .3, y); g.arc(x, y, w * s * .3, Math.PI, 0); g.lineTo(x + w * s * .3, y + h * .12); g.fill(); }
    for (const [x, s] of [[.5, .07], [.25, .05], [.75, .05]]) { g.fillStyle = '#8a5a2e'; g.fillRect(w * (x - s / 2), h * .78, w * s, h * .22); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(w * (x - s / 2), h * .78, w * s, h * .22); } }, 40);
  front.position.set(0, 11, .02); C.add(front);
  for (const [y0, hh, n, wd] of [[0, 7.5, 9, 28], [8.2, 3, 19, 28], [11.6, 2.6, 15, 18], [14.6, 2.4, 11, 14]]) { C.add(box(wd + .6, .35, 1.2, GREY, [0, y0 + hh + .17, .5]), box(wd + .6, .25, 1.2, MARBLE, [0, y0 + .12, .5]));
    for (let i = 0; i < n; i++) C.add(cyl(.16, .2, hh, MARBLE, [-wd / 2 + wd * i / (n - 1), y0 + hh / 2 + .2, .55], 10)); }
  for (const sx of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(8, .4, 60), toon(TERRACOTTA)); r.position.set(sx * 11, 14.4, -30); r.rotation.z = sx * -.25; C.add(r); }
  C.add(box(14.4, .4, 60, TERRACOTTA, [0, 22.2, -30]));
  const gable = new THREE.Mesh(new THREE.ConeGeometry(9, 5, 4, 1), toon(MARBLE)); gable.rotation.y = Math.PI / 4; gable.scale.z = .25; gable.position.set(0, 24.5, -.5); C.add(gable);
  { const dome = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xd9cdb0)); dome.position.set(0, 22, -30); C.add(dome); }
  return C; }
function baptistery() { const B = new THREE.Group(); B.add(cyl(9, 9.3, 12, MARBLE, [0, 6, 0], 48), cyl(9.3, 9.3, .5, GREY, [0, 12, 0], 48));
  const ar = new THREE.Mesh(new THREE.CylinderGeometry(9.05, 9.05, 3, 48, 1, true), toon(0xffffff, { map: arcadeTex(28, '#4a4552') })); ar.position.y = 9; B.add(ar);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(8.6, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xe7dfcc)); dome.position.y = 12.2; dome.scale.y = 1.2; B.add(dome);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(5.5, 6, 32), toon(0xc9653f)); cone.position.y = 22.5; B.add(cone); B.add(ball(.7, 0xb08d3c, [0, 26, 0])); return B; }
// a Tuscan house: ochre walls, green shutters, a terracotta roof, a shop below with an awning
function house(w, h, col, awn) { const H = new THREE.Group(); H.add(box(w, h, 7, col, [0, h / 2, 0]));
  const r = new THREE.Mesh(new THREE.CylinderGeometry(0, w * .72, 1.8, 4, 1), toon(TERRACOTTA)); r.rotation.y = Math.PI / 4; r.scale.z = 7 / w; r.position.y = h + .9; H.add(r);
  const face = board(w, h, (g, ww, hh) => { const rows = Math.round(h / 3.2), cols = Math.round(w / 2.6);
    for (let j = 1; j < rows; j++) for (let i = 0; i < cols; i++) { const x = ww * (i + .5) / cols, y = hh * (1 - (j + .5) / rows), ew = ww / cols * .34, eh = hh / rows * .55;
      g.fillStyle = '#3c2f2a'; g.fillRect(x - ew / 2, y - eh / 2, ew, eh); g.fillStyle = '#3f8a5a'; g.fillRect(x - ew / 2 - ew * .45, y - eh / 2, ew * .42, eh); g.fillRect(x + ew / 2 + ew * .03, y - eh / 2, ew * .42, eh); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(x - ew / 2 - ew * .45, y - eh / 2, ew * 1.9, eh);
      if ((i + j) % 3 === 0) { g.fillStyle = '#c9653f'; g.fillRect(x - ew * .7, y + eh / 2, ew * 1.4, eh * .12); g.fillStyle = '#4caf50'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x - ew * .5 + k * ew * .33, y + eh / 2, ew * .14, 0, 7); g.fill(); } } }
    g.fillStyle = '#2d2a33'; for (let i = 0; i < cols; i++) g.fillRect(ww * (i + .2) / cols, hh * .86, ww * .6 / cols, hh * .14); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, hh * .83, ww, hh * .015); }, 30);
  face.position.set(0, h / 2, 3.51); H.add(face);
  if (awn) { const a = new THREE.Mesh(new THREE.PlaneGeometry(w * .9, 1.6), toon(0xffffff, { map: canvasTex(256, 64, (g, ww, hh) => { for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#ffffff' : awn; g.fillRect(i * ww / 12, 0, ww / 12 + 1, hh); } }), side: THREE.DoubleSide })); a.position.set(0, 3.3, 4.2); a.rotation.x = -.9; a.castShadow = true; H.add(a); }
  return H; }
function stall(col) { const S = new THREE.Group(); S.add(box(2.2, .9, 1.1, 0x8a5a2e, [0, .45, 0])); for (const x of [-1, 1]) S.add(cyl(.04, .04, 2.2, 0xc9ccd4, [x * 1.05, 1.1, .5], 6));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.8, .7, 4, 1, true), toon(col, { side: THREE.DoubleSide })); roof.rotation.y = Math.PI / 4; roof.scale.z = .6; roof.position.set(0, 2.5, 0); S.add(roof);
  for (let i = 0; i < 5; i++) { const t = cyl(.07, .07, .45, i % 2 ? MARBLE : 0xe6634a, [-.8 + i * .4, 1.12, .1], 8); t.rotation.z = -LEAN * 2; S.add(t); }   // little leaning towers for sale
  for (let i = 0; i < 6; i++) S.add(box(.25, .3, .02, [0x6ec6f5, 0xffd23f, 0xe6634a][i % 3], [-.9 + i * .36, 1.7, .55]));   // postcards
  return S; }
export function piazza() { const G = new THREE.Group();
  const mow = canvasTex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#62b257' : '#6fbf61'; g.fillRect(i * w / 8, 0, w / 8 + 1, h); } }); mow.wrapS = mow.wrapT = THREE.RepeatWrapping; mow.repeat.set(16, 12);
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(260, 200), toon(0xffffff, { map: mow })); lawn.rotation.x = -Math.PI / 2; lawn.receiveShadow = true; G.add(lawn);
  for (const [x, z, w, d] of [[0, 18, 220, 5], [-22, -6, 5, 60], [22, -6, 5, 60]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), toon(0xe9dcc0)); p.rotation.x = -Math.PI / 2; p.position.set(x, .02, z); p.receiveShadow = true; G.add(p); }
  const cat = cathedral(); cat.position.set(-34, 0, -6); cat.rotation.y = Math.PI / 2; G.add(cat);
  const bap = baptistery(); bap.position.set(-118, 0, -6); G.add(bap);
  // the town wall behind, with crenels
  G.add(box(260, 7, 1.5, 0xc9a074, [0, 3.5, -60])); for (let x = -128; x <= 128; x += 3) G.add(box(1.4, 1.2, 1.5, 0xc9a074, [x, 7.6, -60]));
  // houses and shops along the near street
  let x = -60; const cols = [0xe9b968, 0xe39a6e, 0xd9c08a, 0xefcf9c, 0xd48a5c], awns = ['#3f8a5a', '#e6232e', '#2f6fd6', '#ffd23f', null];
  for (let i = 0; x < 70; i++) { const w = 7 + (i * 3) % 5, h = 10 + (i * 7) % 6; const H = house(w, h, cols[i % 5], awns[i % 5]); H.position.set(x + w / 2, 0, 27); H.rotation.y = Math.PI; G.add(H); x += w + .2; }
  // stalls, lamp posts, benches, cypresses, a sign (the modern things go in one group, hidden in the 1170s)
  const MOD = new THREE.Group(); MOD.name = 'modern'; G.add(MOD);
  for (const [sx, c] of [[-8, 0xe6232e], [-4, 0x2f6fd6], [6, 0x3f8a5a]]) { const s = stall(c); s.position.set(sx, 0, 17); MOD.add(s); }
  for (let lx = -40; lx <= 40; lx += 10) { MOD.add(cyl(.08, .1, 4.2, 0x2a2733, [lx, 2.1, 15.5], 8)); MOD.add(ball(.32, 0xfff3b0, [lx, 4.4, 15.5])); }
  for (const bx of [-14, 12, 22]) { MOD.add(box(1.8, .1, .5, 0x8a5a2e, [bx, .5, 13.5]), box(1.8, .5, .08, 0x8a5a2e, [bx, .8, 13.28]), box(.08, .5, .5, 0x2a2733, [bx - .85, .25, 13.5]), box(.08, .5, .5, 0x2a2733, [bx + .85, .25, 13.5])); }
  for (const [cx, cz] of [[40, -20], [44, -24], [48, -18], [-120, -30], [70, -40]]) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.4, 9, 10), toon(0x2f6b45)); c.position.set(cx, 4.5, cz); c.castShadow = true; G.add(c); }
  { const sign = board(1.6, .6, (g, w, h) => { g.fillStyle = '#2d4a7a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#fff'; g.lineWidth = h * .05; g.strokeRect(h * .06, h * .06, w - h * .12, h * .88); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `800 ${h * .32}px Cap, sans-serif`; g.fillText('PIAZZA DEI', w / 2, h * .45); g.fillText('MIRACOLI', w / 2, h * .8); }, 160); sign.position.set(-2, 1.9, 15.3); sign.rotation.y = 0; MOD.add(sign); MOD.add(cyl(.05, .05, 1.6, 0x2a2733, [-2, .8, 15.2], 6)); }
  for (let i = 0; i < 26; i++) { const px = 30 + (i * 37) % 26, pz = -6 + (i * 53) % 20; G.add(pigeon(px, pz, i)); }
  for (let fx = 20; fx <= 64; fx += 4) { MOD.add(cyl(.06, .06, .7, 0x2a2733, [fx, .35, 15], 8), ball(.09, 0x2a2733, [fx, .72, 15])); MOD.add(box(4, .03, .03, 0x2a2733, [fx + 2, .62, 15])); }
  G.traverse(o => { if (o.isMesh) { o.receiveShadow = true; } });
  return G; }
function pigeon(x, z, i) { const P = new THREE.Group(); const body = ball(.16, 0x8a8f99, [0, .16, 0]); body.scale.set(1.4, .9, .9); P.add(body, ball(.08, 0x6f7480, [.2, .3, 0]), ball(.03, 0xe6634a, [.28, .3, 0]));
  const tail = new THREE.Mesh(new THREE.ConeGeometry(.07, .2, 6), toon(0x5d616b)); tail.rotation.z = -Math.PI / 2 - .4; tail.position.set(-.24, .2, 0); P.add(tail);
  P.position.set(x, 0, z); P.rotation.y = i * 1.7; P.userData.peck = i; P.name = 'pigeon'; return P; }
