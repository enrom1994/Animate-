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
  // the car: a hard metal roof on pillars over a cabin with a seat, a dashboard and a wheel, so the person inside is really sitting in it; the glass slides up
  const C = new THREE.Group(); C.position.set(...CAR); C.rotation.y = .5;
  C.add(box(3.6, .85, 1.7, 0xe6232e, [0, .8, 0]), box(2.4, .1, 1.62, 0xe6232e, [-.1, 2.5, 0])); for (const [x, z] of [[-1.25, .76], [1.0, .76], [-1.25, -.76], [1.0, -.76]]) C.add(box(.1, 1.25, .1, 0xe6232e, [x, 1.85, z]));
  for (const [x, z] of [[-1.15, .87], [1.15, .87], [-1.15, -.87], [1.15, -.87]]) { const w = cyl(.42, .42, .25, 0x1d1a26, [x, .42, z], 14); w.rotation.x = Math.PI / 2; C.add(w); }
  C.add(box(.16, 1.0, 1.3, 0x3a3f55, [-.95, 1.75, 0]), box(.6, .14, 1.3, 0x3a3f55, [-.6, 1.3, 0]), box(.4, .4, 1.5, 0x2a2733, [1.05, 1.43, 0]));   // seat back, seat, dashboard
  { const wheel = new THREE.Mesh(new THREE.TorusGeometry(.2, .04, 8, 20), toon(0x1d1a26)); wheel.position.set(.66, 1.66, 0); wheel.rotation.y = Math.PI / 2; wheel.rotation.z = .35; C.add(wheel); }
  const glass = [.8, -.8].map(z => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.15, 1.2), new THREE.MeshBasicMaterial({ transparent: true, opacity: .5, depthWrite: false, side: THREE.DoubleSide, map: canvasTex(215, 120, (g, w, h) => { g.fillStyle = 'rgba(191,227,255,.62)'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 7; g.lineCap = 'round'; for (const x of [.2, .32]) { g.beginPath(); g.moveTo(w * x, h * .85); g.lineTo(w * (x + .22), h * .15); g.stroke(); } }) })); m.geometry.translate(0, .6, 0); m.position.set(-.12, 1.24, z); m.userData.noInk = true; C.add(m); return m; });
  C.add(box(.5, .1, .06, 0x1d1a26, [.2, 1.0, .88])); G.add(C); G.userData.glass = glass;
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
// a lightning bolt: a jagged path from the cloud with two forks, a white core inside yellow inside ink, and a soft glow behind it.
// Its foot is at the group's origin. world.bolt() makes it travel down, flicker and thin out.
export function bolt(h = 24, wd = 5, seed = 1) {
  let r = seed * 9301 + 49297; const rnd = () => (r = (r * 233 + 12345) % 233280) / 233280;
  const n = 13, pts = []; for (let i = 0; i <= n; i++) { const y = i / n; pts.push([.5 + (i === n ? 0 : (i % 2 ? .13 : -.13) + (rnd() - .5) * .12) * (1 - y * .3), y]); }
  const fork = (i0, dir) => { const p = [pts[i0]]; let [x, y] = pts[i0]; for (let k = 0; k < 4; k++) { x += dir * (.07 + rnd() * .05) * (k % 2 ? .4 : 1); y += .045 + rnd() * .02; p.push([x, y]); } return p; };
  const forks = [fork(4, 1), fork(7, -1)];
  const path = (g, w, hh, P) => { g.beginPath(); P.forEach(([x, y], i) => i ? g.lineTo(w * x, hh * y) : g.moveTo(w * x, hh * y)); };
  const core = card(wd, h, (g, w, hh) => { g.lineJoin = 'miter'; g.miterLimit = 6; g.lineCap = 'round';
    for (const [col, lw] of [[INK, .1], ['#ffd21f', .074], ['#ffffff', .034]]) { g.strokeStyle = col; g.lineWidth = w * lw; path(g, w, hh, pts); g.stroke(); g.lineWidth = w * lw * .55; for (const f of forks) { path(g, w, hh, f); g.stroke(); } } }, 40);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(wd * 1.5, h), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, map: canvasTex(Math.round(wd * 1.5 * 24), Math.round(h * 24), (g, w, hh) => { g.lineJoin = 'round'; g.lineCap = 'round'; g.filter = `blur(${Math.round(w * .09)}px)`; g.strokeStyle = 'rgba(255,238,150,.9)'; g.lineWidth = w * .12; const sx = 1 / 1.5, ox = (1 - sx) / 2; const P2 = P => P.map(([x, y]) => [ox + x * sx, y]); path(g, w, hh, P2(pts)); g.stroke(); for (const f of forks) { path(g, w, hh, P2(f)); g.stroke(); } }) }));
  glow.userData.noInk = true; glow.renderOrder = 4; core.geometry.translate(0, h / 2, 0); glow.geometry.translate(0, h / 2, -.02);
  const G = new THREE.Group(); G.add(glow, core); G.userData = { h, glow, core }; return G; }
// where a bolt lands: a short white-and-yellow star
export function burst() { const c = card(2.4, 2.4, (g, w, h) => { const star = (R, r, col) => { g.beginPath(); for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, rr = i % 2 ? r : R * (.8 + .2 * Math.sin(i * 2.7)); g.lineTo(w / 2 + Math.cos(a) * rr * w, h / 2 + Math.sin(a) * rr * w); } g.closePath(); g.fillStyle = col; g.fill(); };
  star(.47, .2, INK); star(.43, .18, '#ffd21f'); star(.28, .11, '#ffffff'); }, 120); return c; }
// the room inside the house: a window onto the storm, a sofa, a lamp and a wall clock that can be redrawn
export const ROOM = [60, 0, 0];
export function room() { const R = new THREE.Group(); R.position.set(...ROOM);
  R.add(box(9, .06, 7, 0xc98f58, [0, .03, 1]));
  const wall = (w, h, col, pos, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), flat(col)); m.position.set(...pos); m.rotation.y = ry; R.add(m); };
  wall(9, 3.6, 0xf6dba6, [0, 1.8, -2]); wall(7, 3.6, 0xedcf96, [-4.5, 1.8, 1], Math.PI / 2); wall(7, 3.6, 0xedcf96, [4.5, 1.8, 1], -Math.PI / 2); R.add(box(9, .18, .06, 0xfff7e8, [0, .12, -1.96]));
  // the window: the storm outside is a painting that brightens when lightning flashes
  const view = board(2.0, 1.6, (g, w, h) => { const s = g.createLinearGradient(0, 0, 0, h); s.addColorStop(0, '#56607a'); s.addColorStop(1, '#8a97ad'); g.fillStyle = s; g.fillRect(0, 0, w, h); g.fillStyle = '#48516a'; for (const [x, y, r] of [[.2, .22, .2], [.45, .15, .24], [.75, .24, .22], [.95, .12, .16]]) { g.beginPath(); g.arc(w * x, h * y, w * r, 0, 7); g.fill(); }
    g.fillStyle = '#2f6b45'; g.beginPath(); g.ellipse(w * .25, h * 1.02, w * .4, h * .22, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(w * .8, h * 1.0, w * .32, h * .17, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(225,236,255,.75)'; g.lineWidth = 3; for (let i = 0; i < 90; i++) { const x = (i * 97 % 211) / 211 * w, y = (i * 53 % 173) / 173 * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 5, y + 24); g.stroke(); } }, 200); view.position.set(-1.3, 1.95, -1.98); R.add(view);
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); pane.position.set(-1.3, 1.95, -1.97); pane.userData.noInk = true; R.add(pane);
  for (const [x, y, w, h] of [[-1.3, 2.8, 2.3, .12], [-1.3, 1.1, 2.3, .12], [-2.38, 1.95, .12, 1.8], [-.22, 1.95, .12, 1.8], [-1.3, 1.95, .06, 1.6], [-1.3, 1.95, 2.0, .06]]) R.add(box(w, h, .1, 0xfff7e8, [x, y, -1.93]));
  for (const x of [-2.75, .15]) R.add(box(.55, 2.1, .08, 0xe6634a, [x, 1.95, -1.88])); R.add(box(3.6, .1, .14, 0x8a5a2e, [-1.3, 3.02, -1.88]));
  // sofa, rug, lamp, plant
  R.add(box(2.4, .5, 1.0, 0x2bb6a8, [2.0, .45, -1.3]), box(2.4, .85, .28, 0x2bb6a8, [2.0, 1.0, -1.72]), box(.28, .7, 1.0, 0x24a094, [.85, .7, -1.3]), box(.28, .7, 1.0, 0x24a094, [3.15, .7, -1.3]), box(.7, .2, .55, 0xffd23f, [1.6, .8, -1.25]));
  { const rug = decal(3.6, 2.2, (g, w, h) => { g.fillStyle = '#e6634a'; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.ellipse(w / 2, h / 2, w * .47, h * .44, 0, 0, 7); g.fill(); g.stroke(); g.strokeStyle = '#ffd23f'; g.lineWidth = 12; g.beginPath(); g.ellipse(w / 2, h / 2, w * .36, h * .32, 0, 0, 7); g.stroke(); }, 60); rug.position.set(-.2, .08, .5); R.add(rug); }
  R.add(cyl(.05, .05, 1.7, 0x8a5a2e, [3.9, .9, -1.4], 8), cyl(.22, .22, .06, 0x8a5a2e, [3.9, .06, -1.4], 12)); { const sh = new THREE.Mesh(new THREE.ConeGeometry(.42, .5, 16, 1, true), flat(0xffe08a, { side: THREE.DoubleSide })); sh.position.set(3.9, 1.95, -1.4); R.add(sh); }
  R.add(cyl(.22, .17, .4, 0xc9523f, [-3.7, .23, -1.4], 12), ball(.42, 0x3f9a58, [-3.7, .85, -1.4], [1, 1.25, 1]));
  // the wall clock: its face is a canvas the film redraws, so the half hour can fill in
  const cv = document.createElement('canvas'); cv.width = cv.height = 320; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.25), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: .5 })); face.userData.nmat = new THREE.MeshBasicMaterial({ map: tex, alphaTest: .5, color: 0x8080ff }); face.position.set(1.9, 2.55, -1.96); R.add(face);
  const drawClock = frac => { const g = cv.getContext('2d'), w = 320, c = 160; g.clearRect(0, 0, w, w); g.fillStyle = '#fff'; g.beginPath(); g.arc(c, c, 146, 0, 7); g.fill();
    if (frac > 0) { g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(c, c); g.arc(c, c, 128, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI); g.closePath(); g.fill(); }
    g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.arc(c, c, 146, 0, 7); g.stroke(); g.lineWidth = 8; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(c + Math.cos(a) * 112, c + Math.sin(a) * 112); g.lineTo(c + Math.cos(a) * 130, c + Math.sin(a) * 130); g.stroke(); }
    const a = -Math.PI / 2 + frac * Math.PI; g.lineCap = 'round'; g.lineWidth = 14; g.strokeStyle = '#e6232e'; g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.cos(a) * 108, c + Math.sin(a) * 108); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(c, c, 13, 0, 7); g.fill();
    if (frac > .12) { g.textAlign = 'center'; g.fillStyle = INK; g.font = '800 62px Cap, sans-serif'; g.globalAlpha = Math.min(1, (frac - .12) * 5); g.fillText('30', c - 62, c + 8); g.font = '800 28px Cap, sans-serif'; g.fillText('MIN', c - 62, c + 40); g.globalAlpha = 1; } tex.needsUpdate = true; };
  drawClock(0); R.userData = { pane, drawClock }; return R; }
