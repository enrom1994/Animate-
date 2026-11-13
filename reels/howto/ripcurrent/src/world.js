// One shared world for every shot: the beach, the actors and the props. A shot resets it, then shows what it needs.
import * as THREE from 'three';
import { stage, toon, flat, box, cyl, ball, canvasTex, board, pr, ease, lerp, clamp } from '../../engine/toon.js';
import { beach, animate } from './set.js';
import { makeChar, LOOKS } from '../../engine/char.js';
const INK = '#1d1a26';
LOOKS.pro = { skin: '#e8a877', hair: '#1d1a26', top: '#22303f', bottom: '#2bb673', hairStyle: 'cap' };
// a picture painted on the water (or the sand): its ink line is in the drawing
function decal(w, d, draw, res = 96) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: canvasTex(Math.round(w * res), Math.round(d * res), draw), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
  m.rotation.x = -Math.PI / 2; m.position.y = .09; m.userData.noInk = true; m.renderOrder = 2; return m;
}
function arrowPath(g, w, h) { g.beginPath(); g.moveTo(w / 2, h * .06); g.lineTo(w * .94, h * .5); g.lineTo(w * .68, h * .5); g.lineTo(w * .68, h * .94); g.lineTo(w * .32, h * .94); g.lineTo(w * .32, h * .5); g.lineTo(w * .06, h * .5); g.closePath(); }
const arrowDraw = fill => (g, w, h) => { g.lineJoin = 'round'; arrowPath(g, w, h); g.fillStyle = fill; g.fill(); g.strokeStyle = INK; g.lineWidth = w * .07; g.stroke(); };
const pop = (o, u, s = 1) => { const k = u <= 0 ? 0 : u >= 1 ? 1 : 1 + 2.2 * Math.pow(u - 1, 3) + 1.2 * Math.pow(u - 1, 2); o.visible = u > 0; o.scale.setScalar(Math.max(.001, k * s)); };   // overshoot, then settle

export function makeWorld() {
  const scene = stage({ shadow: 10 }), camera = new THREE.PerspectiveCamera(40, 9 / 16, .1, 400), set = beach(); scene.add(set);
  // behind the beach: dunes and palms, so a camera out at sea has something to look back at
  for (const [x, z, s] of [[-14, 16, 5], [-4, 19, 6.5], [8, 17, 5.5], [19, 20, 7], [-26, 20, 7], [30, 17, 5]]) { const d = ball(1, 0xeccb7a, [x, -.2, z], [s * 1.8, s * .45, s]); d.castShadow = false; scene.add(d); }
  for (const [x, z, h, r] of [[-6.5, 9.5, 4.6, .12], [6.8, 11, 5.4, -.1], [-11, 12, 5, .06], [12.5, 9, 4.4, -.14], [1.5, 13.5, 5.8, .05]]) {
    const P = new THREE.Group(); P.position.set(x, 0, z); P.rotation.z = r; P.add(cyl(.16, .24, h, 0xa9773f, [0, h / 2, 0], 8));
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, l = ball(1, 0x3fae5a, [Math.cos(a) * 1.1, h + .1, Math.sin(a) * 1.1], [1.25, .16, .42]); l.rotation.y = -a; l.rotation.z = -.35; P.add(l); }
    P.add(ball(.2, 0x7a5230, [.15, h - .15, .1])); scene.add(P);
  }
  const A = { sam: makeChar('sam'), guard: makeChar('guard'), pro: makeChar('pro') }; for (const k in A) scene.add(A[k].group);
  // ripples round a swimmer
  const ripples = [0, 1, 2].map(() => { const G = new THREE.Group(); for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.RingGeometry(.55, .64, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.userData.noInk = true; G.add(r); } G.position.y = .07; scene.add(G); return G; });
  const ripple = (i, x, z, t, s = 1) => { const G = ripples[i]; G.visible = true; G.position.x = x; G.position.z = z; G.children.forEach((r, j) => { const u = (t * .9 + j / 3) % 1; r.scale.setScalar(s * (.7 + u * 1.5)); r.material.opacity = .85 * (1 - u); }); };
  // the flow: arrows carried out to sea along the rip
  const flow = Array.from({ length: 9 }, () => { const m = decal(1.0, 1.5, arrowDraw('#ffffff')); scene.add(m); return m; });
  const flowAt = (t, a = 1, z0 = -2, z1 = -34, speed = 3.2) => flow.forEach((m, i) => { const u = ((t * speed / (z0 - z1)) + i / flow.length) % 1; m.visible = a > 0; m.position.set(Math.sin(i * 2.4) * .7, .09, lerp(z0, z1, u)); m.material.opacity = a * Math.min(1, u * 8, (1 - u) * 8) * (width.visible && Math.abs(m.position.z + 13.6) < 2.2 ? 0 : 1); });   // nothing floats across the width label
  // marks: a red cross, a "down" arrow, a sideways arrow, the two swim paths, the width, the outline and the name of the rip
  const X = new THREE.Group(); for (const r of [.78, -.78]) { const b = box(1.5, .3, .22, 0xe6232e); b.rotation.z = r; X.add(b); } scene.add(X);
  const down = new THREE.Group(); down.add(cyl(.16, .16, .8, 0x2f6fd6, [0, .45, 0], 12)); { const c = new THREE.Mesh(new THREE.ConeGeometry(.4, .6, 16), toon(0x2f6fd6)); c.rotation.z = Math.PI; c.position.y = -.2; down.add(c); } scene.add(down);
  const side = decal(3.4, 2.2, (g, w, h) => { g.translate(w / 2, h / 2); g.rotate(Math.PI / 2); g.translate(-h / 2, -w / 2); arrowDraw('#ffd23f')(g, h, w); }); scene.add(side);
  const pathDraw = (pts) => (g, w, h) => { g.lineCap = g.lineJoin = 'round'; const P = pts.map(([x, y]) => [x * w, y * h]); const line = () => { g.beginPath(); P.slice(0, -1).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); const [ax, ay] = P[P.length - 2], [bx, by] = P[P.length - 1], an = Math.atan2(by - ay, bx - ax); g.lineTo(bx - Math.cos(an) * 70, by - Math.sin(an) * 70); };
    g.setLineDash([46, 44]); line(); g.strokeStyle = INK; g.lineWidth = 40; g.stroke(); line(); g.strokeStyle = '#ffd23f'; g.lineWidth = 24; g.stroke(); g.setLineDash([]);
    const [ax, ay] = P[P.length - 2], [bx, by] = P[P.length - 1], an = Math.atan2(by - ay, bx - ax); g.translate(bx, by); g.rotate(an); g.beginPath(); g.moveTo(0, 0); g.lineTo(-95, -62); g.lineTo(-95, 62); g.closePath(); g.fillStyle = '#ffd23f'; g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke(); };
  const pathSide = decal(7, 1.6, pathDraw([[.04, .5], [.5, .5], [.97, .5]])); pathSide.position.set(3.7, .09, -12); scene.add(pathSide);
  const pathBack = decal(4.4, 10.4, pathDraw([[.12, .04], [.5, .5], [.86, .96]])); pathBack.position.set(8.3, .09, -7.0); scene.add(pathBack);
  const width = decal(7.4, 2.4, (g, w, h) => { g.lineCap = g.lineJoin = 'round'; const y = h * .3; for (const [lw, c] of [[34, INK], [20, '#ffffff']]) { g.strokeStyle = c; g.lineWidth = lw; g.beginPath(); g.moveTo(w * .06, y); g.lineTo(w * .94, y); g.moveTo(w * .13, y - 50); g.lineTo(w * .06, y); g.lineTo(w * .13, y + 50); g.moveTo(w * .87, y - 50); g.lineTo(w * .94, y); g.lineTo(w * .87, y + 50); g.stroke(); }
    g.font = `800 ${h * .26}px Cap, sans-serif`; g.textAlign = 'center'; g.lineWidth = 18; g.strokeStyle = INK; g.strokeText('UNDER 100 YARDS', w / 2, h * .86); g.fillStyle = '#ffd23f'; g.fillText('UNDER 100 YARDS', w / 2, h * .86); }); width.position.set(0, .14, -13.6); width.renderOrder = 4; scene.add(width);
  const outline = decal(8, 30, (g, w, h) => { g.setLineDash([70, 50]); g.lineCap = 'round'; for (const [lw, c] of [[34, INK], [20, '#ffd23f']]) { g.strokeStyle = c; g.lineWidth = lw; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(w / 2 + s * w * .39, h * .97); g.lineTo(w / 2 + s * w * .39, h * .2); g.stroke(); } } }, 64); outline.position.set(0, .09, -16.5); scene.add(outline);
  const name = decal(6.4, 3.4, (g, w, h) => { g.font = `800 ${h * .82}px Cap, sans-serif`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 46; g.strokeStyle = INK; g.strokeText('RIP', w / 2, h * .8); g.fillStyle = '#ffffff'; g.fillText('RIP', w / 2, h * .8); }); name.position.set(0, .1, -9); scene.add(name);
  // a marker buoy with the speed on it, facing out to sea; and a rubber duck that rides the current
  const buoy = new THREE.Group(); buoy.add(cyl(.5, .6, .5, 0xff5d4d, [0, .2, 0]), cyl(.06, .06, 1.3, 0xffffff, [0, 1.0, 0], 8), box(2.5, 1.15, .08, 0xffd23f, [0, 2.1, 0]));
  { const f = board(2.4, 1.05, (g, w, h) => { g.fillStyle = '#ffd23f'; g.fillRect(0, 0, w, h); g.fillStyle = INK; g.textAlign = 'center'; g.font = `800 ${h * .26}px Cap, sans-serif`; g.fillText('UP TO', w / 2, h * .3); g.font = `800 ${h * .36}px Cap, sans-serif`; g.fillText('8 FEET', w / 2, h * .64); g.font = `800 ${h * .22}px Cap, sans-serif`; g.fillText('A SECOND', w / 2, h * .9); }); f.position.set(0, 2.1, -.05); f.rotation.y = Math.PI; buoy.add(f); } scene.add(buoy);
  const duck = new THREE.Group(); duck.add(ball(.42, 0xffd23f, [0, .25, 0], [1, .8, 1.25]), ball(.28, 0xffd23f, [0, .72, -.3])); { const c = new THREE.Mesh(new THREE.ConeGeometry(.12, .3, 10), toon(0xff7a1a)); c.rotation.x = -Math.PI / 2; c.position.set(0, .7, -.62); duck.add(c); for (const s of [-1, 1]) duck.add(ball(.05, 0x1d1a26, [s * .13, .82, -.5])); } scene.add(duck);
  // a ring buoy to throw, and the red-over-yellow flags that mark a patrolled stretch of beach
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.36, .12, 12, 28), new THREE.MeshToonMaterial({ map: canvasTex(256, 8, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#e6232e'; g.fillRect(i * w / 8, 0, w / 8 + 1, h); } }) })); ring.castShadow = true; scene.add(ring);
  const patrol = new THREE.Group(); for (const x of [-3.2, 3.2]) { patrol.add(cyl(.05, .05, 3.4, 0xffffff, [x, 1.7, 0], 8)); const f = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .8), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#e6232e'; g.fillRect(0, 0, w, h / 2); g.fillStyle = '#ffd23f'; g.fillRect(0, h / 2, w, h / 2); }) })); f.position.set(x + .62, 2.95, 0); patrol.add(f); } scene.add(patrol);
  const props = { X, down, side, pathSide, pathBack, width, outline, name, buoy, duck, ring, patrol };
  return { scene, camera, set, A, props, ripple, flowAt, pop,
    reset(t) { animate(set, t); for (const k in props) props[k].visible = false; flow.forEach(m => m.visible = false); ripples.forEach(r => r.visible = false); for (const k in A) { A[k].group.visible = false; A[k].group.rotation.set(0, 0, 0); } },
    cam(pos, look, fov = 40) { camera.fov = fov; camera.position.set(...pos); camera.up.set(0, 1, 0); camera.lookAt(...look); },
    // put an actor somewhere with a pose; full = the card faces the lens completely (for cameras looking down)
    act(name, x, z, pose, full = false) { const a = A[name]; a.group.visible = true; a.group.position.set(x, 0, z); a.set(pose, camera); if (full) a.group.quaternion.copy(camera.quaternion); } };
}
// poses
export const swim = (ph, o = {}) => ({ armL: [-(1.95 + .55 * Math.sin(ph)), -.5 * Math.cos(ph)], armR: [1.95 + .55 * Math.sin(ph + Math.PI), .5 * Math.cos(ph + Math.PI)], sink: .4, bob: 8 * Math.sin(ph * 2), head: .07 * Math.sin(ph), ...o });
export const afloat = (t, o = {}) => ({ armL: [-1.4 + .08 * Math.sin(t * 2), -.15], armR: [1.4 - .08 * Math.sin(t * 2), .15], sink: .4, bob: 10 * Math.sin(t * 2.2), ...o });
export const run = (ph, o = {}) => ({ legL: .7 * Math.sin(ph), legR: -.7 * Math.sin(ph), armL: [-.2 - .8 * Math.sin(ph), -.9], armR: [.2 - .8 * Math.sin(ph), .9], lean: .1, bob: 16 * Math.abs(Math.sin(ph)), ...o });
