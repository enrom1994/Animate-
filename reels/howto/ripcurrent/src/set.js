// The beach: sand, a sea with breaking waves and one calm dark gap (the rip), a lifeguard tower, flags, an umbrella.
// World: metres, y up, the sea is at -z, the waterline at z = 0.
import * as THREE from 'three';
import { toon, flat, box, cyl, ball, canvasTex, board } from '../../engine/toon.js';
const INK = '#1d1a26';
export const RIP_X = 0;   // the rip runs out to sea along x = 0
export function seaTexture() {   // u: along the shore (64 m), v: 0 at the shore to 1 at 80 m out
  return canvasTex(1024, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, '#5fe0d8'); gr.addColorStop(.18, '#2fc4d6'); gr.addColorStop(.6, '#1b8fd0'); gr.addColorStop(1, '#1668b8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // the rip: a darker, calmer channel that widens into a head beyond the waves
    const rg = g.createLinearGradient(0, h, 0, h * .35); rg.addColorStop(0, 'rgba(14,92,150,.0)'); rg.addColorStop(.12, 'rgba(14,92,150,.85)'); rg.addColorStop(1, 'rgba(14,92,150,.6)'); g.fillStyle = rg;
    g.beginPath(); g.moveTo(w / 2 - 46, h); g.bezierCurveTo(w / 2 - 40, h * .7, w / 2 - 60, h * .55, w / 2 - 130, h * .4); g.bezierCurveTo(w / 2 - 60, h * .3, w / 2 + 60, h * .3, w / 2 + 130, h * .4); g.bezierCurveTo(w / 2 + 60, h * .55, w / 2 + 40, h * .7, w / 2 + 46, h); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 5; for (let i = 0; i < 60; i++) { const x = (i * 197) % w, y = (i * 331) % (h * .45); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30, y); g.stroke(); }
  });
}
export function waveTexture() {   // tiles along v, so the bands can roll toward the shore
  const t = canvasTex(1024, 512, (g, w, h) => { g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,.95)';
    for (let k = 0; k < 4; k++) { const y = h * (k + .5) / 4; for (const side of [-1, 1]) { g.beginPath(); for (let x = 0; x <= w / 2 - 62; x += 8) { const X = side < 0 ? x : w - x, yy = y + Math.sin(X * .02 + k * 1.7) * 9 + Math.sin(X * .051 + k) * 4; x ? g.lineTo(X, yy) : g.moveTo(X, yy); } g.lineWidth = 13; g.stroke(); } } });
  t.wrapT = THREE.RepeatWrapping; return t;
}
export function beach() {
  const G = new THREE.Group();
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(200, 60), toon(0xf7d98b)); sand.rotation.x = -Math.PI / 2; sand.position.set(0, 0, 29); sand.receiveShadow = true; G.add(sand);
  const wet = new THREE.Mesh(new THREE.PlaneGeometry(200, 2.4), flat(0xd9b76a)); wet.rotation.x = -Math.PI / 2; wet.position.set(0, .01, .4); wet.userData.noInk = true; G.add(wet);
  const tex = seaTexture(), sea = new THREE.Mesh(new THREE.PlaneGeometry(64, 80), flat(0xffffff, { map: tex })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, .03, -40.6); G.add(sea);
  const wt = waveTexture(), wv = new THREE.Mesh(new THREE.PlaneGeometry(64, 34), new THREE.MeshBasicMaterial({ map: wt, transparent: true, depthWrite: false })); wv.rotation.x = -Math.PI / 2; wv.position.set(0, .035, -17.8); wv.userData.noInk = true; G.add(wv); G.userData.waves = wt;
  for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), flat(0x1b8fd0)); m.rotation.x = -Math.PI / 2; m.position.set(s * 72, .03, -40.6); G.add(m); }
  const far = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), flat(0x1668b8)); far.rotation.x = -Math.PI / 2; far.position.set(0, .02, -180); G.add(far);
  const foam = new THREE.Mesh(new THREE.PlaneGeometry(200, .5), flat(0xffffff)); foam.rotation.x = -Math.PI / 2; foam.position.set(0, .04, -.5); G.add(foam);
  // lifeguard tower
  const T = new THREE.Group(); T.position.set(3.7, 0, 1.6); T.rotation.y = -.6; T.scale.setScalar(.8);
  for (const [x, z] of [[-.9, -.9], [.9, -.9], [-.9, .9], [.9, .9]]) T.add(cyl(.09, .09, 2.2, 0xe9e2d0, [x, 1.1, z], 8));
  T.add(box(2.4, .16, 2.4, 0xffffff, [0, 2.2, 0]), box(2.0, 1.5, 1.9, 0xff5d4d, [0, 3.03, -.1]), box(2.6, .14, 2.7, 0xffffff, [0, 3.86, 0]));
  const win = board(1.2, .7, (g, w, h) => { g.fillStyle = '#bfeaff'; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 14; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke(); }); win.position.set(0, 3.15, .86); T.add(win);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.3, .1, 10, 24), toon(0xffffff)); ring.position.set(-1.02, 3.0, .3); ring.rotation.y = Math.PI / 2; T.add(ring);
  const ramp = box(.7, .1, 3.2, 0xe9e2d0, [0, 1.1, 2.6]); ramp.rotation.x = .72; T.add(ramp); G.add(T);
  // the red flag: danger, no swimming
  const F = new THREE.Group(); F.position.set(-1.6, 0, .7); F.add(cyl(.05, .05, 3.6, 0xffffff, [0, 1.8, 0], 8));
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .7, 14, 1), toon(0xe6232e, { side: THREE.DoubleSide })); flag.position.set(.58, 3.2, 0); flag.castShadow = true; F.add(flag); G.add(F); G.userData.flag = flag;
  // warning sign, the label lives in the scene
  const S = new THREE.Group(); S.position.set(1.5, 0, .9); S.rotation.y = -.3; S.scale.setScalar(.62); S.add(box(.1, 1.5, .1, 0xb07a45, [0, .75, -.1]), box(1.5, .95, .08, 0xffd23f, [0, 1.75, 0]));
  const face = board(1.4, .85, (g, w, h) => { g.fillStyle = '#ffd23f'; g.fillRect(0, 0, w, h); g.fillStyle = INK; g.textAlign = 'center'; g.font = `800 ${h * .26}px Cap, sans-serif`; g.fillText('DANGER', w / 2, h * .36); g.font = `800 ${h * .2}px Cap, sans-serif`; g.fillText('RIP CURRENTS', w / 2, h * .66);
    g.strokeStyle = INK; g.lineWidth = h * .03; for (const x of [.3, .5, .7]) { g.beginPath(); g.moveTo(w * x, h * .94); g.lineTo(w * x, h * .78); g.lineTo(w * x - h * .04, h * .84); g.moveTo(w * x, h * .78); g.lineTo(w * x + h * .04, h * .84); g.stroke(); } }); face.position.set(0, 1.75, .05); S.add(face); G.add(S);
  // umbrella, towel, ball
  const U = new THREE.Group(); U.position.set(-3.1, 0, 2.6); U.add(cyl(.04, .04, 2.3, 0xffffff, [0, 1.15, 0], 8));
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.6, .7, 12, 1, true), new THREE.MeshToonMaterial({ map: canvasTex(384, 16, (g, w, h) => { for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#ff5d4d'; g.fillRect(i * w / 12, 0, w / 12 + 1, h); } }), side: THREE.DoubleSide })); cone.position.y = 2.45; cone.castShadow = true; U.add(cone); U.rotation.z = .12; G.add(U);
  G.add(box(1.0, .04, 1.9, 0x3fb7a5, [-2.9, .02, 3.4]), ball(.3, 0xffd23f, [1.25, .3, 4.7]));
  for (const [x, z, r] of [[7.5, 1.2, .5], [8.3, 1.9, .34], [-7.2, .9, .42]]) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), toon(0x8b8f9c)); m.position.set(x, r * .5, z); m.castShadow = true; G.add(m); }
  // clouds and a far headland
  for (const [x, y, z, s] of [[-22, 17, -150, 5], [16, 23, -170, 6.5], [40, 13, -160, 4], [-45, 22, -165, 5]]) { const c = new THREE.Group(); for (const [dx, dy, r] of [[0, 0, 1], [1.1, -.2, .75], [-1.1, -.25, .7], [.4, .45, .7]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(r * s, 16, 10), flat(0xffffff)); b.position.set(dx * s, dy * s, 0); b.scale.z = .3; c.add(b); } c.position.set(x, y, z); G.add(c); }
  const hill = new THREE.Mesh(new THREE.SphereGeometry(26, 20, 10), toon(0x5fbf6a)); hill.scale.set(1.8, .35, .5); hill.position.set(-70, 0, -150); G.add(hill);
  return G;
}
export function animate(G, t) {   // the flag flaps, the waves roll in
  const p = G.userData.flag.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + .55; p.setZ(i, Math.sin(x * 6 - t * 9) * .11 * x); } p.needsUpdate = true; G.userData.flag.geometry.computeVertexNormals();
  G.userData.waves.offset.y = -t * .09;
}
