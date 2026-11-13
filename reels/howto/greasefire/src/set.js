// The kitchen: a counter along the back wall with the stove in the middle, a sink, a fridge, wall cupboards, a door.
// Metres, y up. The back wall is at z = -1.6, the stove top at y = 0.95, the pan on the front-left burner.
import * as THREE from 'three';
import { toon, flat, box, cyl, ball, canvasTex, board } from '../../engine/toon.js';
import { card, INK } from '../../engine/film.js';
export const PAN = [-.22, .98, -1.02];
export function kitchen() {
  const G = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), new THREE.MeshToonMaterial({ map: (() => { const t = canvasTex(256, 256, (g, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#f6e3c0' : '#e9a25e'; g.fillRect(i * 64, j * 64, 64, 64); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 5); t.magFilter = THREE.NearestFilter; return t; })() })); floor.rotation.x = -Math.PI / 2; floor.position.z = 2; floor.receiveShadow = true; G.add(floor);
  const wallTex = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#ffe7b8'; g.fillRect(0, 0, w, h); g.fillStyle = '#7fd6cf'; g.fillRect(0, h * .42, w, h * .26); g.strokeStyle = 'rgba(29,26,38,.35)'; g.lineWidth = 3; for (let x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, h * .42); g.lineTo(x, h * .68); g.stroke(); } for (const y of [.42, .55, .68]) { g.beginPath(); g.moveTo(0, h * y); g.lineTo(w, h * y); g.stroke(); } g.fillStyle = '#e9c98f'; g.fillRect(0, h * .94, w, h * .06); });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.4), flat(0xffffff, { map: wallTex })); back.position.set(0, 1.7, -1.6); G.add(back);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.4), flat(0xfbdca4)); left.rotation.y = Math.PI / 2; left.position.set(-3.1, 1.7, 2); G.add(left);
  const right = left.clone(); right.rotation.y = -Math.PI / 2; right.position.x = 3.6; G.add(right);
  // base units and worktop
  for (const [x0, x1] of [[-2.2, -.5], [.5, 2.6]]) { G.add(box(x1 - x0, .86, .66, 0x2bb6a8, [(x0 + x1) / 2, .43, -1.27]), box(x1 - x0 + .04, .07, .72, 0xf4f1ea, [(x0 + x1) / 2, .9, -1.25])); for (let x = x0 + .28; x < x1 - .1; x += .56) { G.add(box(.48, .62, .03, 0x35c9ba, [x, .44, -.93]), ball(.035, 0xffd23f, [x + .16, .62, -.9])); } }
  // the stove: white body, dark top, four rings, knobs
  G.add(box(1.0, .88, .68, 0xf4f1ea, [0, .44, -1.26]), box(1.0, .05, .7, 0x2a2733, [0, .93, -1.25]), box(.8, .5, .03, 0x2a2733, [0, .42, -.91]), box(.7, .04, .05, 0xc9ccd4, [0, .72, -.88]), box(1.0, .22, .06, 0xf4f1ea, [0, 1.06, -1.57]));
  for (const [x, z] of [[-.22, -1.02], [.24, -1.02], [-.22, -1.42], [.24, -1.42]]) G.add(cyl(.15, .15, .02, 0x55525f, [x, .965, z], 20));
  for (let i = 0; i < 4; i++) G.add(cyl(.04, .04, .05, 0xe6232e, [-.3 + i * .2, 1.06, -1.53], 10).rotateX(Math.PI / 2));
  // hood, wall cupboards, shelf with jars
  G.add(box(1.1, .16, .6, 0xc9ccd4, [0, 2.02, -1.3]), box(.5, .7, .4, 0xc9ccd4, [0, 2.45, -1.4]));
  for (const x of [-1.55, 1.75]) { G.add(box(1.3, .8, .4, 0x2bb6a8, [x, 2.15, -1.4])); for (const s of [-.33, .33]) G.add(box(.58, .68, .03, 0x35c9ba, [x + s, 2.15, -1.19]), ball(.035, 0xffd23f, [x + s * .3, 1.92, -1.16])); }
  // sink and tap, with a window above
  G.add(box(.7, .04, .46, 0xc9ccd4, [1.6, .945, -1.22]), cyl(.03, .03, .34, 0xc9ccd4, [1.6, 1.1, -1.5], 8), box(.05, .05, .24, 0xc9ccd4, [1.6, 1.27, -1.4]));
  const win = board(1.0, .8, (g, w, h) => { const s = g.createLinearGradient(0, 0, 0, h); s.addColorStop(0, '#6ec6f5'); s.addColorStop(1, '#bfeaff'); g.fillStyle = s; g.fillRect(0, 0, w, h); g.fillStyle = '#5fbf6a'; g.beginPath(); g.ellipse(w * .3, h * 1.05, w * .5, h * .3, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; for (const [x, y, r] of [[.65, .3, .1], [.76, .33, .08], [.56, .34, .07]]) { g.beginPath(); g.arc(w * x, h * y, w * r, 0, 7); g.fill(); } g.strokeStyle = '#fff'; g.lineWidth = w * .07; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke(); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); }); win.position.set(2.9, 1.9, -1.59); G.add(win);
  // fridge
  G.add(box(.85, 1.95, .7, 0xfff7e8, [-2.65, .975, -1.24]), box(.05, .5, .05, 0xc9ccd4, [-2.32, 1.35, -.87]), box(.05, .3, .05, 0xc9ccd4, [-2.32, .6, -.87]), box(.86, .03, .71, 0xd8d2c4, [-2.65, .95, -1.24]));
  // the way out: a door in the right-hand wall
  const door = new THREE.Group(); door.position.set(3.58, 0, 1.4); door.add(box(.06, 2.1, 1.0, 0xb07a45, [0, 1.05, 0]), ball(.05, 0xffd23f, [-.06, 1.0, .36])); G.add(door);
  // clock and a smoke alarm
  const clock = board(.42, .42, (g, w, h) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 2, h / 2, w * .46, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = w * .07; g.stroke(); g.lineWidth = w * .05; g.lineCap = 'round'; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2, h * .22); g.moveTo(w / 2, h / 2); g.lineTo(w * .7, h * .56); g.stroke(); }, 300); clock.material.transparent = true; clock.material.alphaTest = .5; clock.position.set(-.95, 2.62, -1.59); clock.userData.noInk = true; G.add(clock);
  return G;
}
// the pan: shallow, dark, a long handle toward the cook, a disc of oil inside
export function pan() { const P = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(.27, .23, .09, 24, 1, true), toon(0x2a2733, { side: THREE.DoubleSide })); wall.position.y = .045; wall.castShadow = true;
  P.add(wall, cyl(.23, .23, .015, 0x2a2733, [0, .008, 0], 24), cyl(.235, .235, .01, 0xf2b91f, [0, .05, 0], 24), box(.05, .035, .42, 0x1d1a26, [0, .07, .46])); return P; }
// fire: flat flames drawn in code, three cards that flicker out of step
export function flames() { const F = new THREE.Group();
  const draw = (g, w, h) => { const sh = (s, c, lw) => { g.beginPath(); g.moveTo(w * .5, h * (1 - s) + 8); g.bezierCurveTo(w * (.5 + .5 * s), h * (1 - .45 * s), w * (.5 + .52 * s), h * .98, w * .5, h * .98); g.bezierCurveTo(w * (.5 - .52 * s), h * .98, w * (.5 - .3 * s), h * (1 - .5 * s), w * (.5 - .12 * s), h * (1 - .62 * s)); g.bezierCurveTo(w * (.5 - .02 * s), h * (1 - .52 * s), w * (.5 + .1 * s), h * (1 - .8 * s), w * .5, h * (1 - s) + 8); g.fillStyle = c; g.fill(); if (lw) { g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = lw; g.stroke(); } };
    sh(.96, '#ff5a1f', 0); sh(.66, '#ffb21f', 0); sh(.36, '#fff2a8', 0); };
  for (let i = 0; i < 3; i++) { const c = card(.5, .75, draw); c.geometry.translate(0, .375, 0); F.add(c); }
  F.userData.set = (t, size, camera) => { F.visible = size > 0; F.children.forEach((c, i) => { const f = 1 + .14 * Math.sin(t * (13 + i * 4) + i * 2); c.position.set((i - 1) * .15 * size, 0, i === 1 ? .03 : -.03); c.scale.set(size * (i === 1 ? 1 : .72) * (2 - f), size * (i === 1 ? 1 : .7) * f, 1); c.rotation.y = Math.atan2(camera.position.x - F.position.x, camera.position.z - F.position.z); }); };
  return F; }
