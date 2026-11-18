// The storybook look, shared by every remake so a fix made once is made everywhere (REGRESSIONS 19-25).
// Use: LOOK on every shot; finish() on the cast; restyle() on the scene after it is built; sunFollow() on the world kit; cross() for the "don't" mark.
import * as THREE from 'three';
import { LOOKS } from './char.js';
import { card } from './film.js';
import { canvasTex } from './toon.js';
import { richStage, skyTex, windowUnit, part, slab, solid, woodTex, brickTex, plasterTex, tileTex, paintTex, stoneTex, asphaltTex, wallpaperTex, mat, rng } from './rich.js';
import { reskin, tex, lit, metreUV } from './reskin.js';
export { richStage, skyTex };
// the grade on every shot: medium ink, light creases, a little haze, dust in the light, warm, saturated
export const LOOK = { inkK: .8, normK: .5, haze: ['#f2d9ae', .08], dust: .12, warm: .45, sat: 1.25 };
// a storm: cooler, greyer, no dust, the haze grey-blue
export const STORM = { inkK: .8, normK: .5, haze: ['#9aa6b8', .3], dust: 0, warm: 0, sat: 1.1 };
// wrap a director's shot() so every shot gets the look unless it says otherwise
export const withLook = (shot, look = LOOK) => (a, b, fn) => shot(a, b, (...x) => { const r = fn(...x) || {}; return { ...r, look: { ...look, ...(r.look || {}) } }; });
// the cast: a warm medium line, a light and a shadow side, a fine grain; and the friend out of candy colours
export function finish(names = ['sam', 'friend', 'gasworker', 'neighbour', 'guard']) {
  for (const k of names) if (LOOKS[k]) Object.assign(LOOKS[k], { ink: '#2e1d1c', lw: .8, finish: true });
  if (LOOKS.friend) Object.assign(LOOKS.friend, { top: '#2f6f73', bottom: '#d9b36a' });
}
// the sun follows the camera: its shadow box centres where the shot looks
export function sunFollow(W, scene, dir = [3, 7, 4.5]) { const key = scene.userData.key, cam0 = W.cam;
  W.cam = (pos, look, fov) => { cam0(pos, look, fov); key.target.position.set(...look); key.position.set(look[0] + dir[0], look[1] + dir[1], look[2] + dir[2]); }; }
const METAL = lit(0xb8bcc4, { roughness: .35, metalness: .7 }), IRON = lit(0x2d2a2e, { roughness: .5, metalness: .5 }), BRASS = lit(0xc9a24a, { roughness: .35, metalness: .8 }), ENAMEL = lit(0xf0e6cf, { roughness: .3 });
// the shared palette: the flat colours every film used, and what each becomes. A film adds or overrides entries.
export const PALETTE = {
  0xfbdca4: tex(plasterTex('#ead9b4', { seed: 4 }), .4), 0xcdbfe8: tex(wallpaperTex('#efe2c2', '#ddd0aa'), .9), 0xb9a8dc: tex(wallpaperTex('#efe2c2', '#ddd0aa'), .9), 0xfff3dc: tex(plasterTex('#efe4cc', { seed: 3, grime: .3 }), .3),
  0x2bb6a8: tex(paintTex('#6f8f6a', { seed: 2 }), 1), 0x35c9ba: tex(paintTex('#86a67e', { seed: 3 }), 1.5),
  0xf4f1ea: o => (o.geometry.parameters?.height ?? 1) < .1 ? tex(woodTex('#b07a48', { planks: 4, seed: 8 }), 1)(o) : ENAMEL(), 0xfff7e8: ENAMEL, 0xdedad0: ENAMEL, 0xd8d2c4: ENAMEL,
  0x8a5a2e: tex(woodTex('#6e4326', { planks: 3, seed: 5 }), 1), 0xb07a45: tex(woodTex('#9a6a3f', { planks: 3, seed: 7 }), 1),
  0xc9ccd4: METAL, 0x55525f: IRON, 0x2a2733: IRON, 0x1d1a26: IRON, 0xffd23f: BRASS, 0x3f86c9: tex(paintTex('#2f5a6e', { seed: 4 }), 1),
  0x6cbf62: tex(paintTex('#6e9a50', { seed: 9 }), .3), 0x6b6f7d: tex(asphaltTex(), .25), 0xd8c79a: tex(stoneTex('#cdbf9c', { n: 6, seed: 3, cobble: true }), 1.2),
  0xf2e3c4: tex(brickTex('#a8543a', { seed: 5 }), .5), 0xbfe3d8: tex(plasterTex('#d7c9a0', { seed: 2, grime: .7 }), .4), 0xf3c9b5: tex(brickTex('#8a4a36', { seed: 11 }), .5), 0xe6dcc0: tex(plasterTex('#e2b97a', { seed: 8, grime: .7 }), .4),
  0xc9523f: lit(0xa8483a), 0x5a6f8a: lit(0x4f5f6e), 0x7a5a9a: lit(0x6a4a3e), 0x7a5230: lit(0x5a4030, { roughness: .9 }), 0x3f9a58: lit(0x5f8a48, { roughness: .9 }),
};
// the kitchen shared by the films: warm tiles for the checker floor, plaster for the painted back wall
const FLOOR = mat(tileTex('#c08a68', '#ddcba6', { n: 8, seed: 4, grout: '#7a6a58' }), [1, 1]), BACK = plasterTex('#ead9b4', { seed: 5 });
export const kitchenSpecial = o => { const p = o.geometry.parameters || {}; if (o.geometry.type !== 'PlaneGeometry') return null;
  if (p.width === 18 && p.height === 10) { metreUV(o, .8); return FLOOR; }
  if (p.width === 12 && p.height === 3.4 && Math.abs(o.position.z + 1.6) < .01) { metreUV(o, .4); return mat(BACK, [1, 1]); } return null; };
// find meshes by their shape: always say the geometry type as well as the size (REGRESSIONS 25)
export const byGeo = (root, type, test) => { const out = []; root.traverse(o => { if (o.isMesh && o.geometry && o.geometry.type === type && test(o.geometry.parameters || {}, o)) out.push(o); }); return out; };
// the "don't" mark: two brush strokes of red paint, drawn over the picture so it never cuts through what it crosses out (REGRESSIONS 24)
export function cross() { const X = new THREE.Group();
  const c = card(1.6, 1.6, (g, w, h) => { const stroke = (x0, y0, x1, y1) => { g.lineCap = 'round'; g.strokeStyle = '#2e1d1c'; g.lineWidth = w * .2; g.beginPath(); g.moveTo(x0 * w, y0 * h); g.quadraticCurveTo(w * .52, h * .48, x1 * w, y1 * h); g.stroke();
      g.strokeStyle = '#c9302a'; g.lineWidth = w * .15; g.stroke(); g.strokeStyle = 'rgba(255,190,160,.35)'; g.lineWidth = w * .035; g.beginPath(); g.moveTo(x0 * w + w * .03, y0 * h - h * .02); g.quadraticCurveTo(w * .54, h * .45, x1 * w + w * .02, y1 * h - h * .03); g.stroke(); };
    stroke(.14, .16, .86, .84); stroke(.86, .14, .16, .86); }, 300);
  for (const m of [c.material, c.userData.nmat]) { m.depthTest = false; m.depthWrite = false; } c.renderOrder = 20; X.add(c); return X; }
// the kitchen window (a painted card 1.0 x 0.8) becomes a frame with glazing bars, a sill, faint glass, and a garden behind it
export function kitchenWindow(K) { const cream = paintTex('#efe6d2', { seed: 1 });
  byGeo(K, 'PlaneGeometry', (p, o) => o.material.map && p.width === 1.0 && p.height === .8).forEach(o => { const W0 = new THREE.Group(); W0.position.copy(o.position); W0.rotation.copy(o.rotation); o.parent.add(W0); o.parent.remove(o);
    const view = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .8), new THREE.MeshBasicMaterial({ map: canvasTex(400, 320, (g, w, h) => { const sk = g.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, '#9cc4dc'); sk.addColorStop(.6, '#f2dcb4'); g.fillStyle = sk; g.fillRect(0, 0, w, h); g.fillStyle = '#7a9a62'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(i * w / 8, h * .62, w * .09, 0, 7); g.fill(); } g.fillStyle = '#5f7f4c'; g.fillRect(0, h * .62, w, h * .14); g.fillStyle = '#e9dcc0'; for (let i = 0; i < 14; i++) g.fillRect(i * w / 13, h * .7, w * .03, h * .3); g.fillRect(0, h * .78, w, h * .03); g.fillStyle = '#8fae6a'; g.fillRect(0, h * .92, w, h * .08); }) }));
    view.position.z = -.05; W0.add(view); W0.add(slab(1.0, .8, .01, new THREE.MeshStandardMaterial({ color: 0xd8e6ee, transparent: true, opacity: .18, roughness: .1 }), 1, [0, 0, -.01]));
    for (const [ww, hh, x, y] of [[1.16, .08, 0, .44], [1.16, .08, 0, -.44], [.08, .88, -.54, 0], [.08, .88, .54, 0], [.04, .8, 0, 0], [1.0, .04, 0, .1]]) W0.add(slab(ww, hh, .07, cream, 1, [x, y, .02]));
    W0.add(slab(1.24, .05, .16, cream, 1, [0, -.5, .07])); }); }
// the flat painted window cards on house fronts become real windows, set out from the wall so the glass shows (REGRESSIONS 22)
export function houseWindows(root, w = 1.0, h = .9) { const frame = paintTex('#efe6d2', { seed: 1 }); let i = 0;
  byGeo(root, 'PlaneGeometry', (p, o) => o.material.map && p.width === w && p.height === h).forEach(c => { const u = windowUnit(w * .78, h * .87, frame, ['#3f6b55', '#2f5a6e', '#7a3a32'][i++ % 3]); u.position.copy(c.position); u.position.addScaledVector(new THREE.Vector3(0, 0, 1).applyEuler(c.rotation), .1); u.rotation.copy(c.rotation);   /* out from the wall along the way the window faces, whichever way that is */ c.parent.add(u); c.parent.remove(c); }); }
// a ball-on-a-stick tree top (a sphere bigger than 1 m, and ONLY a sphere: a roof is a cone) becomes a leafy canopy on a trunk
// only green balls between minR and maxR: a cloud or a far hedge is a sphere too
export function leafyTrees(root, minR = 1, maxR = 2.5) { const tr = rng(19);
  byGeo(root, 'SphereGeometry', (p, o) => { const c = o.material.color; return p.radius > minR && p.radius < maxR && c && c.g > c.r && c.g > c.b; }).forEach(o => { const G2 = new THREE.Group(); G2.position.copy(o.position); const R = o.geometry.parameters.radius; G2.position.y += R * .35;
    const hasTrunk = o.parent.children.some(c => c.isMesh && c.geometry.type === 'CylinderGeometry' && Math.hypot(c.position.x - o.position.x, c.position.z - o.position.z) < R && c.position.y < o.position.y);   // a tree of several balls already stands on one trunk
    if (!hasTrunk) G2.add(part(new THREE.CylinderGeometry(R * .09, R * .13, R * 1.3, 8), new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: .9 }), [0, -R * .75, 0]));
    const greens = (o.material.color && o.material.color.getHSL({}).l < .25) ? [0x3f5a3a, 0x4a6644, 0x354d33] : [0x6e9a50, 0x7aa85a, 0x5f8a48];
    for (let i = 0; i < 12; i++) G2.add(part(new THREE.IcosahedronGeometry(R * (.3 + tr() * .16), 2), new THREE.MeshStandardMaterial({ color: greens[i % 3], roughness: .9 }), [(tr() - .5) * R * .9, (tr() - .2) * R * .55, (tr() - .5) * R * .9]));
    o.parent.add(G2); o.parent.remove(o); }); }
// apply the whole look to a built scene
export function restyle(scene, extra = {}, special = () => null) { return reskin(scene, { ...PALETTE, ...extra }, { special }); }

// a painted path (a flat decal) becomes a laid path: gravel and flags, with the decal's size and place
export function pathFromDecal(root, w, h, color = '#a89a7e') { byGeo(root, 'PlaneGeometry', (p, o) => o.userData.noInk && p.width === w && p.height === h).forEach(o => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w * .7, h), mat(stoneTex(color, { n: 4, seed: 8 }), [w * .7 / 1.2, h / 1.2])); m.rotation.copy(o.rotation); m.position.copy(o.position); m.position.y = .025; m.receiveShadow = true; o.parent.add(m); o.parent.remove(o); }); }
// a painted pond becomes water: a dark glossy surface that catches the sky, edged with stones
export function pondFromDecal(root, w, h, rx = .46, rz = .42) { byGeo(root, 'PlaneGeometry', (p, o) => o.userData.noInk && p.width === w && p.height === h).forEach(o => {
    const g = new THREE.CircleGeometry(1, 48); const water = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x3d5a70, roughness: .08, metalness: .45, emissive: 0x1a2a38, emissiveIntensity: .4 })); water.rotation.x = -Math.PI / 2; water.scale.set(w * rx, h * rz, 1); water.position.copy(o.position); water.position.y = .03; o.parent.add(water);
    const sr = rng(5); for (let i = 0; i < 34; i++) { const a = i / 34 * Math.PI * 2, st = part(new THREE.IcosahedronGeometry(.18 + sr() * .14, 0), new THREE.MeshStandardMaterial({ color: [0x8d8a80, 0x7a776e, 0x9a968a][i % 3], roughness: .9, flatShading: true }), [o.position.x + Math.cos(a) * w * rx, .06, o.position.z + Math.sin(a) * h * rz]); st.scale.y = .55; o.parent.add(st); }
    o.parent.remove(o); }); }
