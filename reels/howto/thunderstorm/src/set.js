// The park under a storm. Metres, y up, the camera mostly looks toward -z.
// The hill with its one tall tree is at x = -6, z = -6; the house and the car are to the right, toward the camera.
import * as THREE from 'three';
import { toon, flat, box, cyl, ball, canvasTex, board } from '../../engine/toon.js';
import { card, decal, INK } from '../../engine/film.js';
export const TREE = [-6, 1.1, -6], HOUSE = [8.5, 0, 3.5], CAR = [2.6, 0, 4.2];
export const hillY = (x, z) => { const d = Math.hypot(x - TREE[0], z - TREE[2]) / 5.2; return d >= 1 ? 0 : 1.1 * Math.pow(Math.cos(d * Math.PI / 2), 1.4); };   // ground height on and off the hill
export function park() {
  const G = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 160), toon(0x5aa35c)); ground.rotation.x = -Math.PI / 2; ground.position.z = -30; ground.receiveShadow = true; G.add(ground);
  // the hill: a low dome whose height matches hillY
  { const geo = new THREE.CircleGeometry(5.2, 40, 0, Math.PI * 2), rings = 14, pos = [], idx = []; for (let r = 0; r <= rings; r++) for (let a = 0; a < 40; a++) { const rr = r / rings * 5.2, an = a / 40 * Math.PI * 2, x = TREE[0] + Math.cos(an) * rr, z = TREE[2] + Math.sin(an) * rr; pos.push(x, hillY(x, z) + .01, z); }
    for (let r = 0; r < rings; r++) for (let a = 0; a < 40; a++) { const i = r * 40 + a, j = r * 40 + (a + 1) % 40; idx.push(i, i + 40, j, j, i + 40, j + 40); }
    const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g2.setIndex(idx); g2.computeVertexNormals(); const hill = new THREE.Mesh(g2, toon(0x66b064)); hill.receiveShadow = true; G.add(hill); }
  // the one tall tree
  const T = new THREE.Group(); T.position.set(...TREE); T.add(cyl(.22, .34, 3.4, 0x7a5230, [0, 1.7, 0], 10)); for (const [x, y, z, r] of [[0, 4.6, 0, 1.9], [-1.2, 3.9, .2, 1.3], [1.25, 4.0, -.1, 1.35], [.2, 5.9, 0, 1.3]]) T.add(ball(r, 0x45a862, [x, y, z])); G.add(T);
  // pond, path, fence
  const pond = decal(9, 5.5, (g, w, h) => { g.fillStyle = '#3f86c9'; g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.ellipse(w / 2, h / 2, w * .46, h * .42, 0, 0, 7); g.fill(); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 8; for (const [x, y, l] of [[.3, .4, .12], [.55, .6, .16], [.62, .35, .1]]) { g.beginPath(); g.moveTo(w * x, h * y); g.lineTo(w * (x + l), h * y); g.stroke(); } }, 64); pond.position.set(7, .05, -9); G.add(pond);
  for (let i = 0; i < 9; i++) { const x = 1.5 + i * 1.5; G.add(cyl(.07, .07, 1.2, 0x8f8f9a, [x, .6, -3.2], 8)); if (i < 8) for (const y of [.5, 1.0]) G.add(box(1.5, .03, .03, 0xb9bcc6, [x + .75, y, -3.2])); }
  const path = decal(3, 40, (g, w, h) => { g.fillStyle = '#d8c79a'; g.fillRect(w * .15, 0, w * .7, h); }, 24); path.position.set(-.5, .03, -8); G.add(path);
  // the house: lit windows, a real door
  const H = new THREE.Group(); H.position.set(...HOUSE); H.rotation.y = -.35;
  H.add(box(5, 3, 4, 0xf2e3c4, [0, 1.5, 0])); { const roof = new THREE.Mesh(new THREE.ConeGeometry(4.1, 1.9, 4), toon(0xc9523f)); roof.rotation.y = Math.PI / 4; roof.position.y = 3.95; roof.castShadow = true; H.add(roof); }
  for (const x of [-1.6, 1.6]) { const w = board(.9, .9, (g, ww, hh) => { g.fillStyle = '#ffd966'; g.fillRect(0, 0, ww, hh); g.strokeStyle = INK; g.lineWidth = ww * .09; g.strokeRect(0, 0, ww, hh); g.beginPath(); g.moveTo(ww / 2, 0); g.lineTo(ww / 2, hh); g.moveTo(0, hh / 2); g.lineTo(ww, hh / 2); g.stroke(); }); w.position.set(x, 1.8, -2.01); w.rotation.y = Math.PI; H.add(w); }
  H.add(box(1.0, 2.0, .08, 0x8a5a2e, [0, 1.0, -2.02]), ball(.06, 0xffd23f, [.32, 1.0, -2.1]), box(1.6, .12, 1.0, 0xcfc4a8, [0, .06, -2.5])); G.add(H);
  // the car: a hard metal roof on four pillars, so whoever sits inside shows through the windows; the glass slides up
  const C = new THREE.Group(); C.position.set(...CAR); C.rotation.y = .5;
  C.add(box(3.4, .8, 1.6, 0xe6232e, [0, .75, 0]), box(2.0, .1, 1.5, 0xe6232e, [-.1, 1.9, 0])); for (const [x, z] of [[-1.05, .7], [.85, .7], [-1.05, -.7], [.85, -.7]]) C.add(box(.09, .72, .09, 0xe6232e, [x, 1.5, z]));
  for (const [x, z] of [[-1.1, .82], [1.1, .82], [-1.1, -.82], [1.1, -.82]]) { const w = cyl(.38, .38, .25, 0x1d1a26, [x, .38, z], 14); w.rotation.x = Math.PI / 2; C.add(w); }
  const glass = [.74, -.74].map(z => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.8, .7), new THREE.MeshBasicMaterial({ color: 0xbfe3ff, transparent: true, opacity: .32, depthWrite: false, side: THREE.DoubleSide })); m.geometry.translate(0, .35, 0); m.position.set(-.1, 1.15, z); m.userData.noInk = true; C.add(m); return m; });
  C.add(box(.5, .1, .06, 0x1d1a26, [.2, .95, .83])); G.add(C); G.userData.glass = glass;
  // what does not count as shelter: a tent and an open picnic shelter
  { const tent = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.7, 4), toon(0xff9a3d)); tent.rotation.y = Math.PI / 4; tent.position.set(-14, .85, 2.2); tent.castShadow = true; G.add(tent); }
  const P = new THREE.Group(); P.position.set(-3.2, 0, 3.2); for (const [x, z] of [[-1.3, -1], [1.3, -1], [-1.3, 1], [1.3, 1]]) P.add(cyl(.08, .08, 2.3, 0x9a6b3c, [x, 1.15, z], 8)); P.add(box(3.2, .14, 2.6, 0x7a5230, [0, 2.36, 0]), box(1.6, .1, .8, 0xb07a45, [0, .75, 0]), box(.1, .7, .7, 0xb07a45, [-.6, .38, 0]), box(.1, .7, .7, 0xb07a45, [.6, .38, 0])); G.add(P);
  // behind the camera's usual side too, so a shot that looks back toward the house still has a world behind it
  for (let i = 0; i < 22; i++) { const x = -60 + i * 5.6 + (i % 3) * 1.1; G.add(ball(3 + (i % 4) * .7, 0x2a6a40, [x, 1.5, 34 + (i % 5) * 2], [1.2, 1, .6])); }
  for (const [x, y, z, s] of [[-24, 17, 62, 9], [2, 21, 66, 11], [26, 18, 64, 10], [-46, 23, 70, 12], [12, 28, 76, 13]]) { const c = new THREE.Group(); for (const [dx, dy, r] of [[0, 0, 1], [1.2, -.2, .8], [-1.2, -.25, .75], [.4, .4, .75]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(r * s, 16, 10), flat(0x56607a)); b.position.set(dx * s, dy * s, 0); b.scale.z = .3; c.add(b); } c.position.set(x, y, z); G.add(c); }
  // far tree line and the cloud bank
  for (let i = 0; i < 26; i++) { const x = -70 + i * 5.6 + (i % 3) * 1.1; G.add(ball(3 + (i % 4) * .7, 0x2a6a40, [x, 1.5, -46 - (i % 5) * 2], [1.2, 1, .6])); }
  for (const [x, y, z, s] of [[-30, 17, -70, 9], [-8, 21, -75, 11], [16, 18, -72, 10], [38, 22, -78, 11], [-52, 22, -80, 12], [4, 28, -85, 14], [-22, 27, -86, 12], [28, 29, -88, 13]]) { const c = new THREE.Group(); for (const [dx, dy, r] of [[0, 0, 1], [1.2, -.2, .8], [-1.2, -.25, .75], [.4, .4, .75], [-.5, .35, .6]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(r * s, 16, 10), flat(0x56607a)); b.position.set(dx * s, dy * s, 0); b.scale.z = .3; c.add(b); } c.position.set(x, y, z); G.add(c); }
  return G;
}
// a lightning bolt: a jagged strip 24 m tall, its foot at the card's origin, drawn at its real proportions so the zigzag survives
export function bolt(h = 24, wd = 3.4) { const c = card(wd, h, (g, w, hh) => { const n = 9, L = [], R = []; for (let i = 0; i <= n; i++) { const y = i / n, x = .5 + (i % 2 ? .2 : -.2) * (1 - y * .35) + .1 * Math.sin(i * 2.3), t = .16 * (1 - y * .72) + .04; L.push([w * (x - t), hh * y]); R.push([w * (x + t + (i % 2 ? .06 : -.06)), hh * (y + (i < n ? .035 : 0))]); }
    g.lineJoin = 'miter'; g.beginPath(); L.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); R.reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); g.fillStyle = '#fff7b0'; g.fill(); g.strokeStyle = INK; g.lineWidth = w * .03; g.stroke(); }, 46); c.geometry.translate(0, h / 2, 0); return c; }
