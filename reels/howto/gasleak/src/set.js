// "Smell gas at home": the kitchen from the grease-fire film, a hallway with a light switch, stairs and the front door,
// and, at OUT, the front of the house on a quiet street. Metres, y up.
import * as THREE from 'three';
import { toon, flat, box, cyl, ball, canvasTex, board } from '../../engine/toon.js';
import { card, decal, INK } from '../../engine/film.js';
import { kitchen } from '../../greasefire/src/set.js';
export { kitchen };
export const SWITCH = [3.72, 1.3, 2.25], FRONT = [8.46, 0, 1.4], OUT = [120, 0, 0];
export function hall() { const G = new THREE.Group();
  const wall = (w, h, col, pos, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), flat(col)); m.position.set(...pos); m.rotation.y = ry; G.add(m); };
  wall(4.9, 3.4, 0xcdbfe8, [6.08, 1.7, -1.58]);                                                    // the back wall of the hall
  G.add(box(4.84, .16, .06, 0xfff7e8, [6.08, .08, -1.55]));
  // the light switch on the hall side of the kitchen wall, beside the doorway
  G.add(box(.04, .26, .18, 0xfff7e8, [3.69, SWITCH[1], SWITCH[2]])); const rocker = box(.05, .1, .07, 0xe9e2d0, [3.73, SWITCH[1], SWITCH[2]]); G.add(rocker);
  // stairs up along the back wall, with a rail
  for (let i = 0; i < 9; i++) G.add(box(.42, .22 * (i + 1), 1.0, 0xb07a45, [4.4 + i * .42, .11 * (i + 1), -1.0]));
  for (let i = 0; i < 9; i += 2) G.add(cyl(.025, .025, .9, 0xfff7e8, [4.4 + i * .42, .22 * (i + 1) + .45, -.5], 6)); { const rail = box(3.9, .06, .06, 0x8a5a2e, [6.08, 1.55, -.5]); rail.rotation.z = Math.atan2(.22, .42); G.add(rail); }
  G.add(box(.8, .1, 1.0, 0xb07a45, [8.15, 2.03, -1.0]));                                           // the landing at the top of the stairs
  { const c = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 9), flat(0xfff3dc, { side: THREE.DoubleSide })); c.rotation.x = Math.PI / 2; c.position.set(2.7, 3.4, 2.9); G.add(c); }   // a ceiling over the kitchen and the hall
  { const lamp = new THREE.Group(); lamp.position.set(7.4, 0, .1); lamp.add(cyl(.04, .04, 1.5, 0x8a5a2e, [0, .75, 0], 8), cyl(.2, .2, .05, 0x8a5a2e, [0, .03, 0], 12), box(.06, .1, .04, 0x1d1a26, [.06, 1.1, .03])); const sh = new THREE.Mesh(new THREE.ConeGeometry(.32, .38, 16, 1, true), flat(0xffe08a, { side: THREE.DoubleSide })); sh.position.y = 1.62; lamp.add(sh); G.add(lamp); }
  // the front door in the end wall: frame, a door hinged at its left edge, a mat, a coat hook
  G.add(box(.16, 2.16, .07, 0x8a5a2e, [FRONT[0], 1.08, FRONT[2] - .52]), box(.16, 2.16, .07, 0x8a5a2e, [FRONT[0], 1.08, FRONT[2] + .52]), box(.16, .08, 1.1, 0x8a5a2e, [FRONT[0], 2.15, FRONT[2]]));
  const door = new THREE.Group(); door.position.set(FRONT[0] - .02, 0, FRONT[2] - .48); door.add(box(.07, 2.08, .96, 0x3f86c9, [0, 1.04, .48]), ball(.05, 0xffd23f, [-.07, 1.0, .84])); G.add(door);
  { const mat = decal(1.0, .6, (g, w, h) => { g.fillStyle = '#c9523f'; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); }, 120); mat.position.set(FRONT[0] - .6, .04, FRONT[2]); G.add(mat); }
  G.add(box(.05, .05, .5, 0x8a5a2e, [FRONT[0] - .05, 1.7, FRONT[2] - 1.4]), box(.5, .9, .3, 0x2bb6a8, [FRONT[0] - .2, 1.25, FRONT[2] - 1.55]));
  { const pic = board(.8, .6, (g, w, h) => { g.fillStyle = '#6ec6f5'; g.fillRect(0, 0, w, h); g.fillStyle = '#5fbf6a'; g.beginPath(); g.ellipse(w * .5, h * 1.0, w * .6, h * .35, 0, 0, 7); g.fill(); g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(w * .75, h * .3, w * .1, 0, 7); g.fill(); g.strokeStyle = '#8a5a2e'; g.lineWidth = w * .07; g.strokeRect(0, 0, w, h); }); pic.position.set(5.0, 1.7, -1.56); G.add(pic); }
  G.userData = { door, rocker }; return G; }
// the front of the house on a quiet street (at OUT): the house faces +z, the street runs along x at z = 6, the neighbour's house across it
export function street() { const G = new THREE.Group(); G.position.set(...OUT);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 60), toon(0x6cbf62)); ground.rotation.x = -Math.PI / 2; ground.position.z = 6; ground.receiveShadow = true; G.add(ground);
  G.add(box(80, .04, 4.6, 0x6b6f7d, [0, .02, 6.8]), box(80, .06, 1.2, 0xd8d2c4, [0, .03, 3.9]), box(80, .06, 1.2, 0xd8d2c4, [0, .03, 9.7]));
  for (let x = -38; x < 40; x += 4) G.add(box(1.8, .05, .15, 0xfff7e8, [x, .045, 6.8]));
  G.add(box(1.3, .05, 3.4, 0xd8c79a, [0, .03, 1.6]));                                             // the path to the front door
  const house = (x, z, col, roof, ry = 0) => { const H = new THREE.Group(); H.position.set(x, 0, z); H.rotation.y = ry; H.add(box(7, 4.2, 5, col, [0, 2.1, -2.5]));
    { const r = new THREE.Mesh(new THREE.ConeGeometry(5.4, 2.2, 4), toon(roof)); r.rotation.y = Math.PI / 4; r.position.set(0, 5.3, -2.5); r.scale.z = .75; r.castShadow = true; H.add(r); }
    for (const [wx, wy] of [[-2.2, 1.4], [2.2, 1.4], [-2.2, 3.2], [2.2, 3.2], [0, 3.2]]) { const w = board(1.0, .9, (g, ww, hh) => { g.fillStyle = '#ffe9a6'; g.fillRect(0, 0, ww, hh); g.strokeStyle = INK; g.lineWidth = ww * .08; g.strokeRect(0, 0, ww, hh); g.beginPath(); g.moveTo(ww / 2, 0); g.lineTo(ww / 2, hh); g.moveTo(0, hh / 2); g.lineTo(ww, hh / 2); g.stroke(); }); w.position.set(wx, wy, .01); H.add(w); }
    H.add(box(1.3, 2.3, .1, 0x8a5a2e, [0, 1.15, .02])); return H; };
  const ours = house(0, 0, 0xf2e3c4, 0xc9523f); G.add(ours); G.add(house(-1, 15.5, 0xbfe3d8, 0x5a6f8a, Math.PI), house(12, 15.5, 0xf3c9b5, 0x8a5a2e, Math.PI), house(-12.5, 0, 0xe6dcc0, 0x7a5a9a));
  // our front door: a real door that swings out, and the doorbell button beside it
  const door = new THREE.Group(); door.position.set(-.48, 0, .12); door.add(box(.96, 2.08, .07, 0x3f86c9, [.48, 1.04, 0]), ball(.05, 0xffd23f, [.84, 1.0, .06])); G.add(door);
  G.add(box(.16, .22, .05, 0xfff7e8, [.95, 1.12, .04]), cyl(.04, .04, .03, 0xffd23f, [.95, 1.12, .08], 12).rotateX(Math.PI / 2));
  G.add(box(4.5, .7, .25, 0x8a5a2e, [-3.4, .35, 3.3]), box(4.5, .7, .25, 0x8a5a2e, [3.4, .35, 3.3]));   // low front fence with a gap for the path
  for (const x of [-9, 9]) { G.add(cyl(.08, .1, 4, 0x55525f, [x, 2, 9.9], 8), box(.6, .25, .25, 0x55525f, [x + .25, 4, 9.9])); }
  for (const [x, z, s] of [[-6, -1, 1.3], [6.5, -.5, 1.1], [16, 13, 1.4]]) G.add(cyl(.15, .2, 1.6 * s, 0x7a5230, [x, .8 * s, z], 8), ball(1.1 * s, 0x3f9a58, [x, 2.2 * s, z]));
  G.userData = { door }; return G; }
// gas you can see: wavy smell lines (drawn once) that drift and turn
export function smellLine() { return card(.5, 1.1, (g, w, h) => { g.lineCap = 'round'; for (const [col, lw] of [[INK, w * .18], ['#c8e04a', w * .1]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); for (let i = 0; i <= 30; i++) { const y = h * (.06 + .88 * i / 30), x = w * (.5 + .28 * Math.sin(i / 30 * Math.PI * 3)); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } }, 300); }
// a spark: a small white-and-yellow star
export function spark() { return card(.5, .5, (g, w, h) => { const star = (R, r, col) => { g.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = i % 2 ? r : R; g.lineTo(w / 2 + Math.cos(a) * rr * w, h / 2 + Math.sin(a) * rr * w); } g.closePath(); g.fillStyle = col; g.fill(); }; star(.48, .16, INK); star(.42, .13, '#ffd21f'); star(.26, .08, '#ffffff'); }, 300); }
