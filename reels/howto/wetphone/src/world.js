// The world of "Phone fell in water": the kitchen from the grease-fire film, with a full sink and the props for every "do not".
import * as THREE from 'three';
import { stage, toon, flat, box, cyl, ball, canvasTex, board, clamp, lerp } from '../../engine/toon.js';
import { worldKit, card, INK } from '../../engine/film.js';
import { makeChar } from '../../engine/char.js';
import { kitchen } from '../../greasefire/src/set.js';
export const SINK = [1.6, .93, -1.22], TABLE = [-1.4, .93, -1.15];
// a phone: dark body, a lit screen, and at its bottom edge a port with gold pins that can corrode
function phone() { const P = new THREE.Group();
  P.add(box(.075, .155, .011, 0x2a2733, [0, 0, 0]));
  const scr = board(.066, .138, (g, w, h) => { const s = g.createLinearGradient(0, 0, 0, h); s.addColorStop(0, '#6ec6f5'); s.addColorStop(1, '#2bb6a8'); g.fillStyle = s; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 4; i++) { g.beginPath(); g.roundRect(w * .14, h * (.2 + i * .17), w * .72, h * .1, 8); g.fill(); } }, 2400); scr.position.z = .0058; scr.userData.noInk = true; P.add(scr);
  const port = box(.034, .0016, .0072, 0x55525f, [0, -.0782, 0]); P.add(port);   // the port: a grey slot proud of the dark edge so it reads
  const pins = []; for (let i = 0; i < 6; i++) { const p = box(.0032, .0012, .0042, 0xe2b13c, [-.0115 + i * .0046, -.0792, 0]); pins.push(p); P.add(p); }
  P.userData = { pins, gold: new THREE.Color(0xe2b13c), rust: new THREE.Color(0x4f8a5a) }; return P; }
export function makeWorld() {
  const scene = stage({ sky: 0xffe7b8, sun: [2.5, 6, 5], shadow: 6 }), camera = new THREE.PerspectiveCamera(40, 9 / 16, .02, 100), K = kitchen(); scene.add(K);
  // water in the sink, and drops that fly when something lands in it
  const water = new THREE.Mesh(new THREE.PlaneGeometry(.62, .38), new THREE.MeshBasicMaterial({ color: 0x8fd8ff, transparent: true, opacity: .8 })); water.rotation.x = -Math.PI / 2; water.position.set(SINK[0], SINK[1] - .005, SINK[2]); water.userData.noInk = true; scene.add(water);
  const drop = () => { const d = card(.05, .07, (g, w, h) => { g.fillStyle = '#8fd8ff'; g.strokeStyle = INK; g.lineWidth = w * .1; g.beginPath(); g.moveTo(w / 2, h * .05); g.quadraticCurveTo(w * .95, h * .65, w / 2, h * .95); g.quadraticCurveTo(w * .05, h * .65, w / 2, h * .05); g.fill(); g.stroke(); }, 1200); scene.add(d); return d; };
  const drops = Array.from({ length: 9 }, drop);
  const ph = phone(); scene.add(ph);
  // a bag of rice, rice grains, a charging cable, a hair dryer, a heater, a can of air, a cotton bud, a paper towel, a cloth, a fan
  const rice = new THREE.Group(); { rice.add(box(.22, .3, .14, 0xf4ecd8, [0, .15, 0])); const l = board(.18, .14, (g, w, h) => { g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, w, h); g.fillStyle = INK; g.textAlign = 'center'; g.font = `800 ${h * .42}px Cap, sans-serif`; g.fillText('RICE', w / 2, h * .62); g.fillStyle = '#e6232e'; g.fillRect(0, h * .78, w, h * .1); }, 900); l.position.set(0, .16, .071); rice.add(l); } scene.add(rice);
  const grains = Array.from({ length: 10 }, () => { const g = ball(.004, 0xfff7e8); g.scale.set(1, .6, 2.2); scene.add(g); return g; });
  const cable = new THREE.Group(); cable.add(cyl(.004, .004, .5, 0xffffff, [0, -.25, 0], 6), box(.012, .03, .006, 0xffffff, [0, .015, 0]), box(.006, .012, .003, 0xc9ccd4, [0, .036, 0])); scene.add(cable);
  const dryer = new THREE.Group(); { const b = cyl(.05, .05, .2, 0xe6634a, [0, 0, 0], 16); b.rotation.z = Math.PI / 2; dryer.add(b, cyl(.03, .04, .06, 0x2a2733, [.13, 0, 0], 12).rotateZ(Math.PI / 2), box(.04, .16, .04, 0xe6634a, [-.03, -.1, 0])); } scene.add(dryer);
  const heater = new THREE.Group(); heater.add(box(.9, .5, .08, 0xf7f7f2, [0, .3, 0])); for (let i = 0; i < 8; i++) heater.add(box(.06, .46, .1, 0xe9e9e2, [-.4 + i * .115, .3, .02])); heater.position.set(2.9, 0, -1.5); scene.add(heater);
  const can = new THREE.Group(); can.add(cyl(.03, .03, .16, 0x3a7bd5, [0, 0, 0], 12), cyl(.012, .015, .025, 0x2a2733, [0, .09, 0], 8), cyl(.002, .002, .1, 0xe6232e, [.04, .1, 0], 4).rotateZ(Math.PI / 2)); scene.add(can);
  const bud = new THREE.Group(); bud.add(cyl(.002, .002, .08, 0xffffff, [0, 0, 0], 6), ball(.006, 0xffffff, [0, .043, 0], [1, 1.6, 1]), ball(.006, 0xffffff, [0, -.043, 0], [1, 1.6, 1])); scene.add(bud);
  const towel = new THREE.Group(); { const t = cyl(.012, .003, .1, 0xffffff, [0, 0, 0], 8); towel.add(t); } scene.add(towel);
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(.18, .14, 4, 3), toon(0x7fd6cf, { side: THREE.DoubleSide })); scene.add(cloth);
  const fan = new THREE.Group(); { fan.add(cyl(.12, .14, .03, 0x2a2733, [0, .015, 0], 16), cyl(.015, .015, .3, 0xc9ccd4, [0, .17, 0], 8)); const head = new THREE.Group(); head.position.y = .38; const cage = new THREE.Mesh(new THREE.TorusGeometry(.14, .008, 6, 28), toon(0xc9ccd4)); head.add(cage); const blades = new THREE.Group(); for (let i = 0; i < 3; i++) { const b = box(.11, .045, .006, 0x3a7bd5, [.06, 0, 0]); const pv = new THREE.Group(); pv.rotation.z = i * Math.PI * 2 / 3; pv.add(b); blades.add(pv); } head.add(blades, ball(.025, 0x2a2733)); fan.add(head); fan.userData.blades = blades; } scene.add(fan);
  // moving air: thin pale strokes drifting from the fan
  const airs = Array.from({ length: 5 }, () => { const a = card(.18, .05, (g, w, h) => { g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = h * .18; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 20; i++) { const x = w * (.05 + .9 * i / 20), y = h * (.5 + .3 * Math.sin(i / 20 * Math.PI * 2)); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }, 900); a.material.transparent = true; a.material.alphaTest = 0; a.userData.noInk = true; scene.add(a); return a; });
  // the window: an overlay that takes the view from day to night and back; a clock hand over the kitchen clock
  const night = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .8), new THREE.MeshBasicMaterial({ color: 0x1f2a4a, transparent: true, opacity: 0, depthWrite: false })); night.position.set(2.9, 1.9, -1.585); night.userData.noInk = true; scene.add(night);
  const moon = ball(.06, 0xfff3b0, [3.1, 2.1, -1.58]); moon.scale.z = .1; moon.userData.noInk = true; scene.add(moon);
  const hand = new THREE.Group(); hand.add(box(.012, .14, .004, 0xe6232e, [0, .06, 0])); hand.position.set(-.95, 2.62, -1.585); scene.add(hand);
  const X = new THREE.Group(); for (const r of [.78, -.78]) { const b = box(1.5, .3, .22, 0xe6232e); b.rotation.z = r; X.add(b); } scene.add(X);
  const sam = makeChar('sam');
  const props = { X, ph, rice, cable, dryer, can, bud, towel, cloth, fan, moon }; drops.forEach((d, i) => props['drop' + i] = d); grains.forEach((g, i) => props['grain' + i] = g); airs.forEach((a, i) => props['air' + i] = a);
  const W = worldKit(scene, camera, { sam }, props, () => { night.material.opacity = 0; hand.rotation.z = 0; ph.userData.pins.forEach(p => p.material.color.copy(ph.userData.gold)); });
  const face = o => o.quaternion.copy(camera.quaternion);
  return { ...W, night, hand,
    // the phone at a point, turned (rx, ry, rz)
    phone(pos, rot = [0, 0, 0], s = 1) { ph.visible = true; ph.position.set(...pos); ph.rotation.set(...rot); ph.scale.setScalar(s); return ph; },
    corrode(k) { ph.userData.pins.forEach((p, i) => p.material.color.copy(ph.userData.gold).lerp(ph.userData.rust, clamp(k * 1.4 - i * .07))); },
    // drops flying out from a point; u 0..1 through the splash
    splash(at, u, s = 1) { const on = u > 0 && u < 1; for (let i = 0; i < 9; i++) { const d = props['drop' + i]; d.visible = on; if (!on) continue; const a = i / 9 * Math.PI * 2, r = .22 * s * u, y = at[1] + s * (.45 * u - .55 * u * u) * (.8 + (i % 3) * .2); d.position.set(at[0] + Math.cos(a) * r, y, at[2] + Math.sin(a) * r * .6); d.scale.setScalar(s * (1 - u * .4)); face(d); } },
    // drops falling from a point, one after another, for as long as it drips
    drip(at, t, on = 1) { for (let i = 0; i < 4; i++) { const d = props['drop' + i]; const u = (t * 1.6 + i / 4) % 1; d.visible = on > 0; d.position.set(at[0], at[1] - .5 * u * u, at[2]); d.scale.setScalar(.7); face(d); } },
    grains(from, to, u) { for (let i = 0; i < 10; i++) { const g = props['grain' + i], k = clamp(u * 1.6 - i * .06); g.visible = k > 0 && k < 1; g.position.set(lerp(from[0] + (i % 3 - 1) * .02, to[0], k), lerp(from[1] + (i % 4) * .01, to[1], k), lerp(from[2], to[2], k)); g.rotation.set(i, i * 2, 0); } },
    air(from, t, on = 1) { for (let i = 0; i < 5; i++) { const a = props['air' + i], u = (t * .7 + i / 5) % 1; a.visible = on > 0; a.position.set(from[0] - .5 * u, from[1] + (i % 3 - 1) * .07, from[2] + .1 * Math.sin(i)); a.material.opacity = Math.sin(Math.PI * u) * on; face(a); } },
    cross(pos, u, s = .3) { X.position.set(...pos); W.pop(X, u, s); face(X); } };
}
