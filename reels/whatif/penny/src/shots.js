// "What if you dropped a penny from the top of the Empire State Building?" A one-off 3D cartoon test, 30.7 s.
import * as THREE from 'three';
import { makeHuman as makeHuman0 } from './human.js';
import { materials } from './materials.js';
// this film's people wear a bright shirt instead of the engine's black cloth
const makeHuman = o => { const M = materials(); M.cloth.color.set(0x2f8fd6); return makeHuman0(o); };
import { glowSprite, sparks, streak, rippleOverlay } from './props.js';
import { kf, lerp, smooth, easeOut, easeIn, easeInOut, range, clamp, V, cam, place, shake } from './anim.js';

export const CAPTIONS = [
  [0.16, 'If you dropped'],
  [0.64, 'a penny from'],
  [1.28, 'the top of the'],
  [1.84, 'Empire State Building'],
  [3.28, 'could it kill'],
  [3.92, 'someone?'],
  [4.64, 'Lots of people'],
  [5.28, 'think it would'],
  [5.76, 'hit like a bullet'],
  [6.88, 'But a penny'],
  [7.52, 'is flat and light'],
  [8.56, 'so the air'],
  [9.12, 'pushes back hard'],
  [10.08, 'against it'],
  [10.72, 'After about fifty'],
  [11.52, 'feet'],
  [11.84, 'it stops speeding'],
  [12.72, 'up'],
  [13.12, 'Then it flutters'],
  [13.84, 'down like a leaf'],
  [14.96, 'at around twenty-five'],
  [16.00, 'miles an hour'],
  [17.04, 'A physicist tested'],
  [18.16, 'this with wind'],
  [18.96, 'tunnels and balloons'],
  [20.16, 'and pennies just'],
  [21.04, 'bounced off his'],
  [21.84, 'face'],
  [22.40, 'So it would'],
  [22.80, 'feel like a flick'],
  [23.60, 'on the forehead'],
  [24.48, 'A falling pen'],
  [25.52, 'is different'],
  [26.24, 'Point down'],
  [27.04, 'it can drop'],
  [27.68, 'like an arrow'],
  [28.48, 'fast enough to punch'],
  [29.52, 'into wood', 30.51],
];
export const DURATION = 30.71;
export const FADES = [[6.68, 6.82, 6.86, 7.0]];

// ---------- materials and props made for this film ----------
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .6, metalness: 0, ...o });
const COPPER = std(0xc8743a, { metalness: .85, roughness: .32 }), STONE = std(0xd9cdb8), STONE2 = std(0xc4b59c), STEEL = std(0xc9ccd4, { metalness: .8, roughness: .3 });
function box(w, h, d, m, p = [0, 0, 0]) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(...p); o.castShadow = o.receiveShadow = true; return o; }
function windowsTex(cols, rows) { const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d'); g.fillStyle = '#d9cdb8'; g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { g.fillStyle = (i * 7 + j * 3) % 11 === 0 ? '#ffe9a6' : '#5a7ba8'; g.fillRect(8 + i * (240 / cols), 6 + j * (500 / rows), 240 / cols - 10, 500 / rows - 6); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function penny(s = 1) { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(.0095 * s, .0095 * s, .0015 * s, 48), COPPER); c.castShadow = true; g.add(c);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.0092 * s, .0005 * s, 6, 48), COPPER); rim.rotation.x = Math.PI / 2; rim.position.y = .0008 * s; g.add(rim); return g; }
// a stepped art-deco tower with a spire: base at the origin, total height H
function tower(H = 60) { const g = new THREE.Group(), seg = [[1, .34, 9], [.84, .58, 7.5], [.7, .76, 6.2], [.56, .86, 5], [.44, .92, 3.8]]; let y0 = 0;
  for (const [, top, w] of seg) { const h = H * top - y0, m = std(0xffffff, { map: windowsTex(Math.round(w * 1.2), Math.round(h * .9)) }); g.add(box(w, h, w, m, [0, y0 + h / 2, 0])); y0 = H * top; }
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(.25, 1.2, H * .1, 12), STONE2); mast.position.y = y0 + H * .05; g.add(mast);
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(.04, .2, H * .09, 8), STEEL); spire.position.y = y0 + H * .145; g.add(spire);
  g.userData.top = y0; return g; }
function city(n = 60, seed = 3) { const g = new THREE.Group(); let r = seed; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < n; i++) { const w = 3 + rnd() * 5, h = 5 + rnd() * 22, x = (rnd() - .5) * 140, z = -10 - rnd() * 120; if (Math.abs(x) < 9 && z > -30) continue; g.add(box(w, h, w, std([0xc9b99a, 0xb8c4cf, 0xd8c9b0, 0x9fb0c4][i % 4]), [x, h / 2, z])); }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), std(0x8a96a6)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
  for (let k = -3; k <= 3; k++) { const road = new THREE.Mesh(new THREE.PlaneGeometry(4, 400), std(0x4a4f5a)); road.rotation.x = -Math.PI / 2; road.position.set(k * 22, .02, -60); g.add(road); }
  return g; }
function airArrow() { const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .85, toneMapped: false }); const s = new THREE.Mesh(new THREE.CylinderGeometry(.0012, .0012, .03, 8), m); s.position.y = -.015; const h = new THREE.Mesh(new THREE.ConeGeometry(.0035, .009, 10), m); h.position.y = .004; g.add(s, h); return g; }
function sign(text, sub, w = .9, h = .5, col = '#ffd23f') { const c = document.createElement('canvas'); c.width = 512; c.height = Math.round(512 * h / w); const g = c.getContext('2d'); g.fillStyle = col; g.beginPath(); g.roundRect(6, 6, c.width - 12, c.height - 12, 28); g.fill(); g.lineWidth = 12; g.strokeStyle = '#1d1a26'; g.stroke();
  g.fillStyle = '#1d1a26'; g.textAlign = 'center'; g.font = `700 ${c.height * .36}px Cap, sans-serif`; g.fillText(text, c.width / 2, c.height * (sub ? .5 : .64)); if (sub) { g.font = `700 ${c.height * .14}px Cap, sans-serif`; g.fillText(sub, c.width / 2, c.height * .82); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false })); return m; }
function pen() { const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.CylinderGeometry(.0045, .0045, .13, 16), std(0x2f6fd6, { roughness: .3 })); body.position.y = .065; const tip = new THREE.Mesh(new THREE.ConeGeometry(.0045, .016, 16), STEEL); tip.rotation.x = Math.PI; tip.position.y = -.008; const cap = new THREE.Mesh(new THREE.CylinderGeometry(.005, .005, .03, 16), std(0x1d2a4a)); cap.position.y = .12; g.add(body, tip, cap); g.traverse(o => o.castShadow = true); return g; }
function plank() { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#c98f58'; g.fillRect(0, 0, 512, 256); g.strokeStyle = 'rgba(110,60,20,.45)'; g.lineWidth = 3; for (let i = 0; i < 22; i++) { g.beginPath(); for (let x = 0; x <= 512; x += 16) { const y = i * 12 + Math.sin(x * .02 + i) * 5; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return box(.5, .04, .3, std(0xffffff, { map: t, roughness: .8 })); }
function headMesh(h) { let best = null; h.j.head.traverse(o => { if (o.isMesh && (!best || o.geometry.boundingSphere?.radius > best.geometry.boundingSphere?.radius)) { o.geometry.computeBoundingSphere(); best = o; } }); return best; }
const STAND = { lSh: [.05, 0, .16], rSh: [.05, 0, -.16], lEl: [-.25, 0, 0], rEl: [-.25, 0, 0], lHip: [0, 0, .07], rHip: [0, 0, -.07], lAn: [0, 0, -.07], rAn: [0, 0, .07] };
const pose = (h, t, extra = {}) => { const p = { ...STAND, ...extra }; p.chest = [Math.sin(t * 1.6) * .012 + (extra.chest?.[0] || 0), extra.chest?.[1] || 0, extra.chest?.[2] || 0]; h.setPose(p); };
// a penny's flutter: falling at a steady rate, swinging side to side and rocking like a leaf
const flutter = (t, vy, o = [0, 0, 0], amp = .06) => ({ x: o[0] + Math.sin(t * 3.1) * amp, y: o[1] - vy * t, z: o[2] + Math.cos(t * 2.3) * amp * .5, rx: Math.sin(t * 3.1) * .9 + 1.2, rz: Math.cos(t * 3.1) * .7 });

// 1  "If you dropped a penny from the top of the Empire State Building," : crane up the tower to the top
function shot1({ makeStage }) { const scene = makeStage({ shadowSize: 40, sunDir: [-30, 60, 40] }); const T = tower(60); scene.add(T, city()); const c = cam(40);
  return { scene, camera: c, update(t) { const k = easeInOut(range(t, 0, 3.2)); c.fov = 40; place(c, [lerp(-14, -9, k), lerp(4, 46, k), lerp(26, 18, k)], [0, lerp(22, 56, k), 0]); return { bloom: .3 }; } }; }
// 2  "could it kill someone?" : at the top rail a hand lets the penny go; it tumbles toward the street far below
function shot2({ makeStage }) { const scene = makeStage({ shadowSize: 3 }); const T = tower(60); T.position.y = -51.6; scene.add(T); const C = city(); C.position.y = -51.6; scene.add(C);
  scene.add(box(4, .06, .06, STEEL, [0, 1.05, .2]), box(4, .06, .06, STEEL, [0, .6, .2])); for (let i = -2; i <= 2; i++) scene.add(box(.05, 1.05, .05, STEEL, [i * .9, .52, .2]));
  const man = makeHuman('casual'); man.root.position.set(-.15, -.0, -.35); man.root.rotation.y = .25; scene.add(man.root); const p = penny(4); scene.add(p); const c = cam(36);
  return { scene, camera: c, update(t) { pose(man, t, { rSh: [-1.3, 0, -.3], rEl: [-.35, 0, 0], neck: [.25, 0, 0], head: [.35, .1, 0] }); man.setMouth(t > .6 ? .5 : .1);
    scene.updateMatrixWorld(true); const hand = man.j.rWr.getWorldPosition(new THREE.Vector3()); const rel = range(t, .45, 1.4);
    if (rel <= 0) { p.position.copy(hand).add(V(0, -.02, .05)); p.rotation.set(1.2, 0, 0); } else { const f = flutter(rel * 1.2, .9, [hand.x, hand.y - .02, hand.z + .05], .03); p.position.set(f.x, f.y, f.z + rel * .4); p.rotation.set(f.rx * 3 * rel, 0, f.rz); }
    const k = easeInOut(range(t, 0, 1.4)); place(c, [lerp(.55, .35, k), lerp(1.35, 1.05, k), lerp(1.9, 1.75, k)], [lerp(-.05, p.position.x, k * .5), lerp(1.35, p.position.y + .2, k * .5), -.1]); /* from outside the rail, looking back at the man as he lets go */ return { dof: { focus: 1.1, aperture: .004, maxblur: .01 }, bloom: .4 }; } }; }
// 3  "Lots of people think it would hit like a bullet." : the imagined version, a streak and a red hit
function shot3({ makeStage }) { const scene = makeStage({ shadowSize: 2 }); const man = makeHuman('casual'); scene.add(man.root); const head = headMesh(man), rip = rippleOverlay(head); const p = penny(1.6); scene.add(p);
  const tr = streak(0xffd9a0); scene.add(tr); const glow = glowSprite(0xffb070, .08); scene.add(glow); const sp = sparks(50, { speed: 1.4, spread: 1.2, dir: V(0, 1, .3), color: [1, .6, .3] }); scene.add(sp); const c = cam(34);
  return { scene, camera: c, update(t) { const hit = 1.1, u = range(t, .2, hit); pose(man, t, { neck: [-.1, 0, 0], head: t > hit ? [-.25 * Math.exp(-(t - hit) * 4), 0, 0] : [0, 0, 0] }); man.setMouth(t > hit ? .8 : 0);
    scene.updateMatrixWorld(true); const top = head.getWorldPosition(new THREE.Vector3()).add(V(0, .13, 0)); const from = top.clone().add(V(.3, 3, .2));
    if (t < hit) { const pos = from.clone().lerp(top, easeIn(u)); p.position.copy(pos); p.rotation.set(Math.PI / 2, 0, 0); tr.set(from.clone().lerp(top, Math.max(0, easeIn(u) - .3)), pos, .006, .8); glow.position.copy(pos); glow.material.opacity = .8; }
    else { p.position.copy(top); tr.set(top, top, .001, 0); glow.material.opacity = Math.max(0, 1 - (t - hit) * 3); }
    sp.position.copy(top); sp.update(t - hit); const r = range(t, hit, hit + .5); rip.material.uniforms.uCenter.value.set(0, .12, .02); rip.material.uniforms.uRadius.value = r * .2; rip.material.uniforms.uAmp.value = t > hit ? 1 - range(t, hit + .6, hit + 1.4) : 0; rip.material.uniforms.uTime.value = t;
    const k = easeOut(range(t, 0, 2.2)), s = t > hit ? shake(t, 4 * Math.exp(-(t - hit) * 3)) : [0, 0, 0]; place(c, [lerp(.8, .6, k) + s[0], 1.62 + s[1], lerp(1.1, .9, k)], [0, 1.6, 0]); return { dof: { focus: .9, aperture: .003, maxblur: .008 }, bloom: .6, exposure: .95 }; } }; }
// 4  "But a penny is flat and light, so the air pushes back hard against it." : close on the falling penny, air pushing up
function shot4({ makeStage }) { const scene = makeStage({ shadowSize: 1 }); scene.userData.sky.visible = true; const p = penny(4); scene.add(p); const arrows = Array.from({ length: 14 }, () => { const a = airArrow(); a.scale.setScalar(3.5); scene.add(a); return a; }); const c = cam(36);
  return { scene, camera: c, update(t) { const f = flutter(t, 0, [0, 1.5, 0], .02); p.position.set(f.x, 1.5 + Math.sin(t * 2) * .01, f.z); p.rotation.set(.5 + Math.sin(t * 2.6) * .35, t * .4, Math.cos(t * 2.6) * .3);
    arrows.forEach((a, i) => { const u = (t * .9 + i / arrows.length) % 1, ang = i * 2.4, r = .02 + (i % 4) * .02; a.position.set(p.position.x + Math.cos(ang) * r, 1.5 - .22 + u * .32, p.position.z + Math.sin(ang) * r); a.children.forEach(m => m.material.opacity = .9 * Math.sin(Math.PI * u)); });
    const k = easeInOut(range(t, 0, 3.8)); place(c, [lerp(.18, -.12, k), lerp(1.58, 1.46, k), lerp(.26, .22, k)], [p.position.x, 1.5, 0]); return { dof: { focus: .26, aperture: .02, maxblur: .015 }, bloom: .4 }; } }; }
// 5  "After about fifty feet, it stops speeding up." : alongside the tower, a 50 FT mark, the streak behind the penny shortening
function shot5({ makeStage }) { const scene = makeStage({ shadowSize: 20, sunDir: [-20, 40, 30] }); const T = tower(60); T.position.set(4.6, -46, 0); scene.add(T); const C = city(); C.position.y = -46; scene.add(C);
  const p = penny(30); scene.add(p); const tr = streak(0xffffff); scene.add(tr); const s50 = sign('50 FT', 'TOP SPEED REACHED', 2.4, 1.2); s50.position.set(-.5, 6, -.6); scene.add(s50); const c = cam(44);
  return { scene, camera: c, update(t) { const v = lerp(9, 3.2, easeOut(range(t, 0, 1.3))), y = 12 - (t < 1.3 ? 9 * t - 2.2 * t * t : 9 * 1.3 - 2.2 * 1.69 + 3.2 * (t - 1.3)); p.position.set(Math.sin(t * 3) * .2, y, .4); p.rotation.set(t * 4, 0, Math.sin(t * 3) * .5);
    tr.set(V(p.position.x, y + v * .35, .4), V(p.position.x, y + .1, .4), .03, .55); place(c, [lerp(-4.5, -3.8, t / 2.4), y + .5, 7.6], [-.5, y, .4]); s50.position.y = Math.min(6, y + 1.6); s50.lookAt(c.position); return { bloom: .3 }; } }; }
// 6  "Then it flutters down like a leaf, at around twenty-five miles an hour." : swinging past the windows, a 25 MPH sign
function shot6({ makeStage }) { const scene = makeStage({ shadowSize: 20, sunDir: [-20, 40, 30] }); const T = tower(60); T.position.set(4.2, -20, 0); scene.add(T); const C = city(); C.position.y = -20; scene.add(C);
  const p = penny(30); scene.add(p); const s25 = sign('25 MPH', 'ABOUT 40 KM/H', 2.6, 1.3); s25.position.set(-1.2, 3, .6); scene.add(s25); const c = cam(42);
  return { scene, camera: c, update(t) { const f = flutter(t, 1.0, [0, 6, .5], .9); p.position.set(f.x, f.y, f.z); p.rotation.set(f.rx, t * .3, f.rz);
    s25.position.y = f.y - .4; s25.visible = t > 1.4; s25.scale.setScalar(easeOut(range(t, 1.4, 1.8)) * 1 + .001);
    place(c, [lerp(-3.2, -1.8, easeInOut(range(t, 0, 3.9))), f.y + .6, lerp(8.5, 7.8, t / 3.9)], [f.x * .5 - .5, f.y - .1, .5]); s25.lookAt(c.position); return { bloom: .3 }; } }; }
// 7  "A physicist tested this with wind tunnels and balloons, and pennies just bounced off his face." : a lab with a clear tunnel
function shot7({ makeStage }) { const scene = makeStage({ shadowSize: 3 }); const glass = new THREE.MeshPhysicalMaterial({ color: 0xcfe8ff, transparent: true, opacity: .25, roughness: .05, transmission: .6, thickness: .02 });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, 1.6, 40, 1, true), glass); tube.position.set(.3, 1.4, -.5); scene.add(tube, box(.9, .25, .9, std(0x55525f), [.3, .45, -.5]), box(.9, .25, .9, std(0x55525f), [.3, 2.3, -.5]));
  const fanBlades = new THREE.Group(); for (let i = 0; i < 4; i++) { const b = box(.28, .01, .06, STEEL); const pv = new THREE.Group(); pv.rotation.y = i * Math.PI / 2; b.position.x = .14; pv.add(b); fanBlades.add(pv); } fanBlades.position.set(.3, .6, -.5); scene.add(fanBlades);
  const p = penny(5); scene.add(p); const bal = new THREE.Mesh(new THREE.SphereGeometry(.16, 32, 20), std(0xe6232e, { roughness: .25 })); bal.scale.y = 1.15; scene.add(bal); const string = streak(0xffffff); scene.add(string);
  const man = makeHuman('casual'); man.root.position.set(-.35, 0, .1); man.root.rotation.y = .5; scene.add(man.root); const head = headMesh(man); const p2 = penny(2); scene.add(p2); const c = cam(40);
  return { scene, camera: c, update(t) { fanBlades.rotation.y = t * 25; p.position.set(.3 + Math.sin(t * 4) * .05, 1.45 + Math.sin(t * 2.7) * .06, -.5); p.rotation.set(1 + Math.sin(t * 5) * .6, t, Math.cos(t * 4) * .5);
    const br = range(t, 1.4, 5.3); bal.position.set(-.75 + br * .2, 1.1 + br * 1.2, -.6); string.set(bal.position.clone().add(V(0, -.18, 0)), bal.position.clone().add(V(.02, -.7, 0)), .002, .8);
    const bounce = 4.1, hp = head.getWorldPosition(new THREE.Vector3()); pose(man, t, { neck: [t > bounce ? -.12 * Math.exp(-(t - bounce) * 5) : -.05, -.3, 0], head: [-.2, -.2, 0] }); man.setMouth(t > bounce ? .3 : .05);
    const fu = range(t, 3.2, bounce); if (t < bounce) { p2.visible = fu > 0; p2.position.set(hp.x + .04, hp.y + .2 + (1 - fu) * 1.4, hp.z + .1); p2.rotation.set(fu * 8, 0, .4); } else { const b = t - bounce; p2.position.set(hp.x + .04 + b * .3, hp.y + .2 + b * 1.1 - 4 * b * b, hp.z + .12 + b * .2); p2.rotation.set(b * 20, 0, 0); }
    const k = easeInOut(range(t, 0, 5.3)); place(c, [lerp(.6, -.1, k), lerp(1.7, 1.65, k), lerp(4.0, 2.4, k)], [lerp(.1, -.25, k), lerp(1.45, 1.55, k), -.2]); return { dof: { focus: 2.2, aperture: .002, maxblur: .006 }, bloom: .4 }; } }; }
// 8  "So it would feel like a flick on the forehead." : a tap, a blink, a shrug
function shot8({ makeStage }) { const scene = makeStage({ shadowSize: 2 }); const man = makeHuman('casual'); scene.add(man.root); const head = headMesh(man), rip = rippleOverlay(head); const p = penny(1.6); scene.add(p); const c = cam(30);
  return { scene, camera: c, update(t) { const hit = .75; pose(man, t, { neck: [t > hit ? -.1 * Math.exp(-(t - hit) * 6) : 0, 0, 0], lSh: [.05, 0, t > 1.3 ? .9 : .16], rSh: [.05, 0, t > 1.3 ? -.9 : -.16] }); man.setMouth(t > hit && t < 1.3 ? .25 : .1);
    scene.updateMatrixWorld(true); const hp = head.getWorldPosition(new THREE.Vector3()), fore = hp.clone().add(V(0, .1, .12)); const u = range(t, .1, hit);
    if (t < hit) { p.position.copy(fore).add(V(.02, (1 - u) * .7, .02)); p.rotation.set(u * 6, 0, .6); } else { const b = t - hit; p.position.copy(fore).add(V(.08 * b, .3 * b - 2 * b * b, .15 * b)); p.rotation.set(b * 14, 0, 0); }
    rip.material.uniforms.uCenter.value.set(0, .1, .12); rip.material.uniforms.uRadius.value = range(t, hit, hit + .3) * .05; rip.material.uniforms.uAmp.value = t > hit ? .6 * (1 - range(t, hit + .3, hit + .8)) : 0; rip.material.uniforms.uTime.value = t;
    place(c, [lerp(.35, .28, t / 2), 1.66, lerp(.7, .6, t / 2)], [0, 1.64, 0]); return { dof: { focus: .65, aperture: .004, maxblur: .01 }, bloom: .4 }; } }; }
// 9  "A falling pen is different. Point down, it can drop like an arrow, fast enough to punch into wood." : the pen, the plank, the hit
function shot9({ makeStage }) { const scene = makeStage({ shadowSize: 1.5 }); const board = plank(); board.position.set(0, .7, 0); scene.add(board, box(.06, .7, .06, std(0x8a5a2e), [-.2, .35, -.1]), box(.06, .7, .06, std(0x8a5a2e), [.2, .35, -.1]), box(.06, .7, .06, std(0x8a5a2e), [-.2, .35, .1]), box(.06, .7, .06, std(0x8a5a2e), [.2, .35, .1]));
  const P = pen(); P.scale.setScalar(1.6); scene.add(P); const pe = penny(4); scene.add(pe); const tr = streak(0xffffff); scene.add(tr); const sp = sparks(70, { speed: 1.2, spread: 1.4, dir: V(0, 1, 0), color: [1, .8, .5], gravity: -4 }); sp.position.set(0, .72, 0); scene.add(sp);
  const chips = Array.from({ length: 10 }, (_, i) => { const m = box(.012, .004, .03, std(0xc98f58)); scene.add(m); return m; }); const c = cam(36);
  return { scene, camera: c, update(t) { const hit = 4.0; const pu = range(t, 1.2, hit), y = lerp(2.6, .72 + .03, easeIn(pu));
    const f = flutter(t, .12, [.18, 1.25, .05], .04); pe.position.set(f.x, Math.max(.75, f.y), f.z); pe.rotation.set(f.rx, 0, f.rz); pe.visible = false;
    P.position.set(t < 1.2 ? Math.sin(t * 3) * .03 : 0, t < hit ? y + (t < 1.2 ? Math.sin(t * 4) * .03 : 0) : .72 - .05, 0); P.rotation.set(0, t < 1.2 ? t * 2 : 0, t < 1.2 ? Math.sin(t * 3) * .12 : 0); P.visible = true; tr.set(V(0, y + 1.2 * pu, 0), V(0, y + .2, 0), .008, t < hit && pu > 0 ? .7 : 0);
    sp.update(t - hit); chips.forEach((m, i) => { const b = Math.max(0, t - hit), a = i / 10 * Math.PI * 2; m.visible = t > hit; m.position.set(Math.cos(a) * b * .5, .73 + b * 1.2 - 3 * b * b, Math.sin(a) * b * .5); m.rotation.set(b * 10 + i, i, 0); });
    const s = t > hit ? shake(t, 5 * Math.exp(-(t - hit) * 3)) : [0, 0, 0];
    if (t < 1.1) place(c, [lerp(.9, .3, t / 1.1), lerp(2.4, 2.8, t / 1.1), lerp(1.2, .7, t / 1.1)], [0, 2.65, 0]); else if (t < hit) place(c, [lerp(.8, .55, pu), y + .15, lerp(1.1, .7, pu)], [0, y - .05, 0]); else { const o = (t - hit) * .45; place(c, [Math.sin(o) * .62 + s[0], .92 - .1 * Math.min(1, t - hit) + s[1], Math.cos(o) * .62 * .9], [0, .76, 0]); } /* after the hit the camera keeps circling the plank */
    return { dof: { focus: t < 2 ? .9 : .7, aperture: .003, maxblur: .008 }, bloom: t > hit ? .9 : .4 }; } }; }

export const SHOTS = [
  { start: 0, end: 3.2, build: shot1 }, { start: 3.2, end: 4.6, build: shot2 }, { start: 4.6, end: 6.84, build: shot3 },
  { start: 6.84, end: 10.68, build: shot4 }, { start: 10.68, end: 13.08, build: shot5 }, { start: 13.08, end: 16.98, build: shot6 },
  { start: 16.98, end: 22.32, build: shot7 }, { start: 22.32, end: 24.42, build: shot8 }, { start: 24.42, end: DURATION + 1, build: shot9 },
];
