// Shared 3D props in the storybook look, built with real parts so nothing reads as a box or a ball on a stick (REGRESSIONS 16, 25).
//   tree(opts)          a trunk with a root flare, branches, and leaf clumps sitting on the branch ends; .userData.sway(t, wind)
//   upgradeCar(C, opts) rebuilds a box car in place: rounded body, bonnet, boot, slanted glass and pillars, arches, tyres and hubs,
//                       lights, grille, bumpers, mirrors, door seams. Interior parts and sliding windows the shots use are kept.
//   grass(opts)         tufts of blades scattered over an area, kept clear of a list of shapes (paths, ponds)
//   puddles(spots)      dark glossy puddles with rain rings; .userData.update(t)
// Everything here is a set dressing: tufts and rings carry userData.noInk so the checker and the ink pass ignore them.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { paintTex, woodTex, mat, rng, part } from './rich.js';
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.roughness ?? .7, metalness: o.metalness ?? 0, emissive: o.emissive ?? 0, emissiveIntensity: o.ei ?? 1, side: o.side ?? THREE.FrontSide });
const rbox = (w, h, d, r, material, pos = [0, 0, 0]) => part(new RoundedBoxGeometry(w, h, d, 3, r), material, pos);
// a cylinder from point a to point b
function limb(a, b, r0, r1, material) { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), m = part(new THREE.CylinderGeometry(r1, r0, d.length(), 10), material);
  m.position.copy(A).add(B).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; }
export function tree({ height = 3.6, spread = 1.6, greens = [0x3f5a3a, 0x4a6644, 0x354d33], seed = 7 } = {}) {
  const T = new THREE.Group(), r = rng(seed), bark = mat(paintTex('#4a3626', { seed: 21 }), [1, 3], { bumpScale: 2 });
  T.add(limb([0, 0, 0], [0, height, 0], .34, .2, bark), part(new THREE.ConeGeometry(.6, .5, 10), bark, [0, .2, 0]));   // trunk and root flare
  const crown = new THREE.Group(); crown.position.y = height * .78; T.add(crown);   // everything above the fork sways together
  const ends = [[0, height * .42, 0]];
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + r() * .5, len = spread * (.8 + r() * .4), e = [Math.cos(a) * len, height * .22 + r() * height * .2, Math.sin(a) * len * .8];
    crown.add(limb([0, 0, 0], e, .16, .07, bark)); ends.push(e); }
  for (const [ex, ey, ez] of ends) for (let k = 0; k < 6; k++) { const R = spread * (.38 + r() * .2), c = part(new THREE.IcosahedronGeometry(R, 2), std(greens[(k + Math.round(ex * 3)) % 3 < 0 ? 0 : (k + Math.round(Math.abs(ex) * 3)) % 3], { roughness: .9 }), [ex + (r() - .5) * R * 1.1, ey + (r() - .3) * R * .8, ez + (r() - .5) * R * 1.1]); crown.add(c); }
  T.userData.sway = (t, wind = 1) => { crown.rotation.z = wind * (.035 * Math.sin(t * 1.3) + .015 * Math.sin(t * 3.7)); crown.rotation.x = wind * .02 * Math.sin(t * 1.1 + 1); };
  return T; }
export function upgradeCar(C, { paint = 0xb8302a } = {}) {
  const P = std(paint, { roughness: .3, metalness: .35 }), dark = std(0x26242a, { roughness: .6 }), rubber = std(0x1d1c20, { roughness: .95 }), chrome = std(0xd0d3d8, { roughness: .2, metalness: .9 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x9fb8c8, roughness: .1, metalness: .3, transparent: true, opacity: .55, depthWrite: false });
  // out with the boxes: the old body, roof, pillars and wheels (the seat, dashboard, steering wheel, handle and sliding windows stay)
  const drop = C.children.filter(o => { if (!o.isMesh || !o.geometry.parameters) return false; const p = o.geometry.parameters;
    return (o.geometry.type === 'BoxGeometry' && ((p.width === 3.6 && p.height === .85) || (p.width === 2.4 && p.height === .1) || (p.width === .1 && p.height === 1.25))) || (o.geometry.type === 'CylinderGeometry' && p.radiusTop === .42); });
  drop.forEach(o => C.remove(o));
  C.add(rbox(3.9, .62, 1.76, .14, P, [0, .74, 0]), rbox(1.05, .3, 1.7, .12, P, [1.4, 1.15, 0]), rbox(.85, .32, 1.7, .12, P, [-1.55, 1.13, 0]));   // body, bonnet, boot
  C.add(rbox(2.7, .16, 1.74, .07, P, [-.15, 2.5, 0]));   // the roof edge, thick and rounded over the window frames
  for (const z of [-.82, .82]) { C.add(limb([1.05, 1.3, z], [.62, 2.46, z], .1, .09, P), limb([-1.2, 1.3, z], [-1.38, 2.46, z], .13, .11, P));   // A and C pillars, broad like a car's (no B pillar: a two-door, so nothing stands in front of the driver)
    C.add(rbox(1.95, .1, .08, .04, P, [-.3, 2.38, z]), rbox(2.0, .1, .08, .04, P, [-.25, 1.33, z]));   // the window frame along the top and the bottom of the side glass
    C.add(rbox(3.6, .03, .02, .01, dark, [0, 1.0, z * 1.1]), rbox(.02, .5, .02, .01, dark, [-.12, .8, z * 1.1]));   // door seams
    C.add(rbox(.16, .1, .06, .03, P, [1.0, 1.45, z * 1.15]), rbox(.1, .08, .02, .02, chrome, [1.0, 1.45, z * 1.19])); }   // mirrors
  { const ws = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.6), glass); ws.position.set(.84, 1.88, 0); ws.rotation.set(0, Math.PI / 2, 0); ws.rotateX(-.37); C.add(ws);
    const rw = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6), glass); rw.position.set(-1.3, 1.88, 0); rw.rotation.set(0, -Math.PI / 2, 0); rw.rotateX(-.1); C.add(rw); }
  for (const [x, z] of [[-1.15, .87], [1.15, .87], [-1.15, -.87], [1.15, -.87]]) { const tyre = part(new THREE.TorusGeometry(.3, .13, 12, 28), rubber, [x, .42, z]); const hub = part(new THREE.CylinderGeometry(.2, .2, .06, 20), chrome, [x, .42, z + Math.sign(z) * .05]); hub.rotation.x = Math.PI / 2;
    const arch = part(new THREE.CylinderGeometry(.5, .5, .1, 20, 1, true, -Math.PI / 2, Math.PI), dark, [x, .45, z + Math.sign(z) * .02]); arch.rotation.x = Math.PI / 2; arch.material = std(0x1a181c, { side: THREE.DoubleSide }); C.add(tyre, hub, arch); }
  for (const z of [-.58, .58]) { C.add(part(new THREE.SphereGeometry(.13, 14, 10), std(0xfff4d0, { emissive: 0xffe6a0, ei: .7, roughness: .2 }), [1.93, .95, z]), rbox(.06, .14, .3, .03, std(0xc8202a, { emissive: 0x801010, ei: .5 }), [-1.96, .98, z])); }
  C.add(rbox(.06, .22, .9, .04, dark, [1.95, .78, 0]), rbox(.16, .14, 1.84, .06, dark, [2.0, .52, 0]), rbox(.16, .14, 1.84, .06, dark, [-2.0, .52, 0]));   // grille and bumpers
  return C; }
// grass: little fans of blades on a field, clear of keep-out shapes (each [x, z, rx, rz] an ellipse to avoid)
export function grass({ area = [-16, 16, -14, 10], n = 1400, avoid = [], y = hx => 0, seed = 3, colors = [0x4f7a45, 0x5f8a4c, 0x3f6a3c] } = {}) {
  const geo = new THREE.ConeGeometry(.035, .22, 3); geo.translate(0, .11, 0); const G = new THREE.Group(), r = rng(seed), d = new THREE.Object3D();
  colors.forEach((c, ci) => { const I = new THREE.InstancedMesh(geo, std(c, { roughness: .95 }), n * 3); let k = 0;
    for (let i = 0; i < n && k < n * 3 - 3; i++) { const x = area[0] + r() * (area[1] - area[0]), z = area[2] + r() * (area[3] - area[2]); if (avoid.some(([ax, az, rx, rz]) => ((x - ax) / rx) ** 2 + ((z - az) / rz) ** 2 < 1)) continue; if (i % colors.length !== ci) continue;
      for (let b = 0; b < 3; b++) { d.position.set(x + (r() - .5) * .08, y(x, z), z + (r() - .5) * .08); d.rotation.set((r() - .5) * .5, r() * 6, (r() - .5) * .5); d.scale.setScalar(.7 + r() * .7); d.updateMatrix(); I.setMatrixAt(k++, d.matrix); } }
    I.count = k; I.userData.noInk = true; I.castShadow = false; I.receiveShadow = true; G.add(I); });
  return G; }
// puddles with rain landing in them: each spot [x, z, rx, rz]
export function puddles(spots, y = () => 0) { const G = new THREE.Group(), rings = [];
  const soft = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 20, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.7, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); return t; })();
  spots.forEach(([x, z, rx, rz], i) => { const p = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshStandardMaterial({ color: 0x7d8c9c, roughness: .04, metalness: .35, alphaMap: soft, transparent: true, opacity: .8, depthWrite: false })); p.rotation.x = -Math.PI / 2; p.scale.set(rx, rz, 1); p.position.set(x, y(x, z) + .03, z); p.userData.noInk = true; G.add(p);
    for (let k = 0; k < 3; k++) { const ring = new THREE.Mesh(new THREE.RingGeometry(.93, 1, 28), new THREE.MeshBasicMaterial({ color: 0xdfe8f0, transparent: true, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.userData = { noInk: true, at: [x + (k - 1) * rx * .4, y(x, z) + .035, z + ((k * 7) % 3 - 1) * rz * .3], s: Math.min(rx, rz) * .5, ph: i * .37 + k / 3 }; G.add(ring); rings.push(ring); } });
  G.userData.update = t => rings.forEach(r => { const u = (t * 1.4 + r.userData.ph) % 1; r.position.set(...r.userData.at); r.scale.setScalar(.05 + u * r.userData.s); r.material.opacity = .45 * (1 - u); });
  return G; }
