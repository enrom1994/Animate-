// Look test 2: two sets in the richer style. The kitchen (indoors, around the origin) and a street (outdoors, around x = 200).
import * as THREE from 'three';
import { woodTex, brickTex, plasterTex, tileTex, paintTex, stoneTex, mat, solid, slab, part, rng } from '../../engine/rich.js';
const T = { floor: woodTex('#8a5a34', { planks: 7, seed: 3 }), counter: woodTex('#b07a48', { planks: 4, seed: 8 }), plaster: plasterTex('#ead9b4', { seed: 4 }), sage: paintTex('#7d9a78', { seed: 2 }), cream: paintTex('#efe4cc', { seed: 5 }), tiles: tileTex('#efe8d8', null, { n: 8 }), check: tileTex('#e8dcc4', '#3d4a52', { n: 6, seed: 4, grout: '#6d6458' }) };
const BRASS = solid(0xc9a24a, { roughness: .35, metalness: .8 }), IRON = solid(0x2d2a2e, { roughness: .5, metalness: .6 }), GLASSW = solid(0xfff1d0, { emissive: 0xffe6b0, ei: 1.4 });
const label = (w, h, draw, res = 300) => { const c = document.createElement('canvas'); c.width = Math.round(w * res); c.height = Math.round(h * res); draw(c.getContext('2d'), c.width, c.height); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: .8 })); };
// a panel door: a frame of rails and stiles round a sunken panel, and a knob
function panelDoor(w, h, tex, knob = [.38, .1]) { const G = new THREE.Group(), m = mat(tex, [w, h]); G.add(slab(w, h, .02, m, 1, [0, 0, 0]));
  const r = .055; G.add(slab(w, r, .03, m, 1, [0, h / 2 - r / 2, .02]), slab(w, r, .03, m, 1, [0, -h / 2 + r / 2, .02]), slab(r, h, .03, m, 1, [-w / 2 + r / 2, 0, .02]), slab(r, h, .03, m, 1, [w / 2 - r / 2, 0, .02]));
  G.add(part(new THREE.SphereGeometry(.022, 12, 8), BRASS, [w * knob[0], h * knob[1], .05])); return G; }
export function kitchen() { const K = new THREE.Group();
  // floor, back wall (sage panelling under cream plaster), left wall with a window you can see the sun through
  K.add(slab(8, .1, 6, T.floor, .55, [0, -.05, 0]), slab(8.3, .12, 6.3, T.plaster, .35, [0, 2.96, 0]));
  for (let z = -2.6; z < 3; z += 1.1) K.add(slab(8, .18, .16, woodTex('#5e3d24', { planks: 2, seed: 6 }), 1, [0, 2.82, z]));
  K.add(slab(8, 1.0, .1, T.sage, .8, [0, .5, -3.05]), slab(8, 1.9, .1, T.plaster, .35, [0, 1.95, -3.05]), slab(8, .06, .08, mat(T.cream, [4, 1]), 1, [0, 1.02, -2.98]));
  for (let x = -3.6; x < 4; x += .62) K.add(slab(.44, .7, .02, mat(T.sage, [1, 1]), 1, [x, .5, -2.99]));
  const lw = (y0, y1, z0, z1) => K.add(slab(.12, y1 - y0, z1 - z0, T.plaster, .35, [-4, (y0 + y1) / 2, (z0 + z1) / 2]));
  lw(0, 1.0, -3, 3); lw(2.3, 2.9, -3, 3); lw(1.0, 2.3, -3, -1.6); lw(1.0, 2.3, .1, 3);
  const wf = mat(T.cream, [1, 1]); for (const [w, h, y, z] of [[.1, 1.4, 1.65, -1.6], [.1, 1.4, 1.65, .1], [1.9, .1, 2.3, -.75], [1.9, .12, 1.0, -.75], [.06, 1.3, 1.65, -.75], [1.7, .05, 1.65, -.75]]) K.add(slab(.16, h, w === .1 || w === .06 ? w : w, wf, 1, [-3.95, y, z]));
  K.add(slab(.35, .05, 1.9, wf, 1, [-3.8, .98, -.75]));
  // curtains: soft folds either side of the window
  const cloth = new THREE.MeshStandardMaterial({ color: 0xb4513e, roughness: .9, side: THREE.DoubleSide });
  for (const z of [-1.85, .35]) { const geo = new THREE.PlaneGeometry(.55, 1.6, 24, 1); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 34) * .035); geo.computeVertexNormals(); const c = part(geo, cloth, [-3.85, 1.6, z]); c.rotation.y = Math.PI / 2; K.add(c); }
  K.add(part(new THREE.CylinderGeometry(.015, .015, 2.6, 8), BRASS, [-3.85, 2.42, -.75])); K.children.at(-1).rotation.x = Math.PI / 2;
  // the counter run along the back wall: sage cabinets with panel doors, a butcher-block top, white tiles above
  K.add(slab(5.2, .86, .62, T.sage, 1, [-.4, .43, -2.69]), slab(5.3, .05, .66, T.counter, .8, [-.4, .885, -2.67]), slab(5.2, .1, .5, solid(0x2a2522), 1, [-.4, .05, -2.62]));
  for (let i = 0; i < 7; i++) { const d = panelDoor(.66, .68, T.sage, [i % 2 ? -.38 : .38, .3]); d.position.set(-2.75 + i * .72, .47, -2.37); K.add(d); }
  K.add(slab(5.3, .75, .02, T.tiles, 1.6, [-.4, 1.29, -2.99]));
  // a cream enamel range in the run, with a black hob, oven door, chrome rail and knobs; a pan and a kettle on it
  const R = new THREE.Group(); R.position.set(.55, 0, -2.66); K.add(R); const enamel = solid(0xf0e6cf, { roughness: .3 });
  R.add(slab(.78, .9, .64, enamel, 1, [0, .45, 0]), slab(.8, .03, .66, solid(0x1d1b1e, { roughness: .4 }), 1, [0, .915, 0]), slab(.6, .42, .02, solid(0x2d2a30, { roughness: .2, metalness: .3 }), 1, [0, .42, .33]));
  R.add(part(new THREE.CylinderGeometry(.012, .012, .6, 8), solid(0xd9d9dc, { roughness: .2, metalness: .9 }), [0, .7, .36])); R.children.at(-1).rotation.z = Math.PI / 2;
  for (let i = 0; i < 4; i++) R.add(part(new THREE.CylinderGeometry(.025, .025, .03, 12), IRON, [-.27 + i * .18, .8, .34])), R.children.at(-1).rotation.x = Math.PI / 2;
  for (const [x, z] of [[-.18, -.14], [.18, -.14], [-.18, .14], [.18, .14]]) R.add(part(new THREE.TorusGeometry(.08, .012, 6, 20), IRON, [x, .935, z])), R.children.at(-1).rotation.x = Math.PI / 2;
  R.add(part(new THREE.CylinderGeometry(.13, .11, .06, 24), IRON, [-.18, .97, .14]), part(new THREE.BoxGeometry(.28, .02, .03), IRON, [-.42, .99, .2]));
  { const k = part(new THREE.SphereGeometry(.11, 20, 14), solid(0xb5453a, { roughness: .35 }), [.18, 1.02, -.14]); k.scale.y = .85; R.add(k, part(new THREE.CylinderGeometry(.015, .03, .14, 8), solid(0xb5453a, { roughness: .35 }), [.3, 1.04, -.14])); R.children.at(-1).rotation.z = -1; R.add(part(new THREE.TorusGeometry(.06, .01, 6, 16, Math.PI), IRON, [.18, 1.12, -.14])); }
  // a shelf with jars, plates and a pot plant; a clock and a picture on the plaster
  const W = mat(T.counter, [1, .3]); K.add(slab(2.2, .04, .24, W, 1, [-2.3, 1.95, -2.88]));
  const jr = rng(42); for (let i = 0; i < 7; i++) { const h = .14 + jr() * .1, x = -3.25 + i * .3; K.add(part(new THREE.CylinderGeometry(.055, .055, h, 16), solid([0xd7a24a, 0x9b5a3a, 0xe8d8b0, 0x6d8a5a][i % 4], { roughness: .4 }), [x, 1.97 + h / 2, -2.85]), part(new THREE.CylinderGeometry(.06, .06, .025, 16), solid(0x8a5a34), [x, 1.97 + h + .012, -2.85])); }
  for (let i = 0; i < 3; i++) { const p = part(new THREE.CylinderGeometry(.13, .13, .015, 24), solid(0xf3ecdc, { roughness: .3 }), [-1.4 + i * .06, 2.11, -2.9]); p.rotation.x = Math.PI / 2 - .2; K.add(p); }
  { const pot = part(new THREE.CylinderGeometry(.11, .08, .18, 16), solid(0xb8653f), [-2.6, 1.0, -2.75]); K.add(pot); const lr = rng(7); for (let i = 0; i < 9; i++) { const l = part(new THREE.SphereGeometry(.09, 10, 8), solid(0x4f7a45, { roughness: .8 }), [-2.6 + (lr() - .5) * .22, 1.17 + lr() * .2, -2.75 + (lr() - .5) * .15]); l.scale.set(1, .5, .7); l.rotation.z = lr() * 3; K.add(l); } }
  { const c = label(.36, .36, (g, w, h) => { g.fillStyle = '#f4ecd8'; g.beginPath(); g.arc(w / 2, h / 2, w * .46, 0, 7); g.fill(); g.strokeStyle = '#3a2a20'; g.lineWidth = w * .05; g.stroke(); g.fillStyle = '#3a2a20'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillRect(w / 2 + Math.cos(a) * w * .36 - 3, h / 2 + Math.sin(a) * h * .36 - 3, 6, 6); } g.lineWidth = w * .03; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2, h * .22); g.moveTo(w / 2, h / 2); g.lineTo(w * .7, h * .56); g.stroke(); });
    c.material.transparent = true; c.material.alphaTest = .5; c.position.set(1.6, 2.15, -2.99); K.add(c); }
  { const f = label(.5, .4, (g, w, h) => { g.fillStyle = '#6b4a2e'; g.fillRect(0, 0, w, h); g.fillStyle = '#e9d8a8'; g.fillRect(w * .1, h * .12, w * .8, h * .76); g.fillStyle = '#9fb7a0'; g.fillRect(w * .1, h * .5, w * .8, h * .38); g.fillStyle = '#e7a54a'; g.beginPath(); g.arc(w * .65, h * .38, h * .1, 0, 7); g.fill(); }); f.position.set(2.6, 1.75, -2.99); K.add(f); }
  // the hanging lamp: a cord, a green enamel shade and a glowing bulb; and its warm light
  K.add(part(new THREE.CylinderGeometry(.006, .006, .7, 6), IRON, [.2, 2.5, -1.4]), part(new THREE.ConeGeometry(.24, .2, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x3f6b55, roughness: .4, side: THREE.DoubleSide }), [.2, 2.08, -1.4]), part(new THREE.SphereGeometry(.06, 12, 8), GLASSW, [.2, 1.98, -1.4]));
  const lamp = new THREE.PointLight(0xffc98a, 3.2, 6, 1.6); lamp.position.set(.2, 1.9, -1.4); K.add(lamp);
  // by the window: a small table with a chair, a radiator under the sill, a calendar and coat hooks
  { const wd = T.counter, st = new THREE.Group(); st.position.set(-3.3, 0, 1.2); K.add(st); st.add(slab(.8, .04, .8, wd, 1, [0, .74, 0])); for (const [x, z] of [[-.35, -.35], [.35, -.35], [-.35, .35], [.35, .35]]) st.add(slab(.05, .72, .05, wd, 1, [x, .36, z]));
    st.add(part(new THREE.CylinderGeometry(.06, .05, .2, 16), solid(0xe9e0cc, { roughness: .3 }), [.1, .86, -.1]));
    const ch = new THREE.Group(); ch.position.set(.55, 0, .45); ch.rotation.y = -.6; st.add(ch); ch.add(slab(.42, .04, .42, wd, 1, [0, .45, 0])); for (const [x, z] of [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]]) ch.add(slab(.04, .45, .04, wd, 1, [x, .22, z])); for (const x of [-.18, .18]) ch.add(slab(.04, .5, .04, wd, 1, [x, .72, .18])); ch.add(slab(.42, .12, .03, wd, 1, [0, .9, .18]), slab(.42, .06, .03, wd, 1, [0, .7, .18])); }
  { const rad = new THREE.Group(); rad.position.set(-3.88, .5, -.75); K.add(rad); for (let i = 0; i < 9; i++) rad.add(part(new THREE.CylinderGeometry(.035, .035, .55, 8), solid(0xe8e2d4, { roughness: .4 }), [0, 0, -.6 + i * .15])); rad.add(slab(.08, .06, 1.35, solid(0xe8e2d4), 1, [0, .3, 0]), slab(.08, .06, 1.35, solid(0xe8e2d4), 1, [0, -.3, 0])); }
  { const cal = label(.34, .48, (g, w, h) => { g.fillStyle = '#f6efe0'; g.fillRect(0, 0, w, h); g.fillStyle = '#b4513e'; g.fillRect(0, 0, w, h * .3); g.fillStyle = '#3a2a20'; for (let j = 0; j < 5; j++) for (let i = 0; i < 7; i++) g.fillRect(w * (.08 + i * .125), h * (.38 + j * .11), w * .07, h * .05); }); cal.rotation.y = Math.PI / 2; cal.position.set(-3.93, 1.75, 1.2); K.add(cal); }
  { const rail = slab(.04, .06, 1.0, T.counter, 1, [-3.92, 1.85, 2.2]); K.add(rail); for (let i = 0; i < 4; i++) K.add(part(new THREE.CylinderGeometry(.012, .012, .1, 6), BRASS, [-3.86, 1.82, 1.8 + i * .26])); const coat = part(new THREE.CylinderGeometry(.12, .2, .8, 12), solid(0x6a4a3a, { roughness: .9 }), [-3.8, 1.42, 2.06]); K.add(coat); }
  // a rug, and in the foreground a table edge with a mug and a bowl of lemons
  K.add(slab(2.4, .012, 1.5, tileTex('#a8493a', '#d9b16a', { n: 10, seed: 9, grout: '#5a2d22' }), .5, [.3, .006, -.6]));
  const tb = new THREE.Group(); tb.position.set(2.5, 0, .9); K.add(tb); tb.add(slab(1.4, .05, .9, T.counter, 1, [0, .76, 0])); for (const [x, z] of [[-.62, -.38], [.62, -.38], [-.62, .38], [.62, .38]]) tb.add(slab(.06, .74, .06, T.counter, 1, [x, .37, z]));
  tb.add(part(new THREE.CylinderGeometry(.045, .04, .1, 16), solid(0x2f6f8a, { roughness: .3 }), [-.3, .84, -.2]), part(new THREE.SphereGeometry(.15, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), solid(0xe9e0cc, { roughness: .3 }), [.1, .93, -.15]));
  for (let i = 0; i < 4; i++) { const l = part(new THREE.SphereGeometry(.05, 12, 8), solid(0xf2c63a, { roughness: .5 }), [.05 + (i % 2) * .09, .87 + Math.floor(i / 2) * .04, -.18 + (i % 3) * .05]); l.scale.set(1.2, 1, 1); tb.add(l); }
  return K; }
// the street: a row of brick and plaster houses with shops, a stone pavement, a road, lamps and the clutter of a pavement
function windowUnit(w, h, frameTex) { const G = new THREE.Group(), f = mat(frameTex, [1, 1]);
  const glass = new THREE.MeshStandardMaterial({ color: 0x2e3f52, roughness: .15, metalness: .5 }); G.add(slab(w, h, .02, glass, 1, [0, 0, -.06]));
  for (const [ww, hh, x, y] of [[w + .24, .12, 0, h / 2 + .06], [w + .24, .12, 0, -h / 2 - .06], [.12, h, -w / 2 - .06, 0], [.12, h, w / 2 + .06, 0], [.06, h, 0, 0], [w, .06, 0, h * .12]]) G.add(slab(ww, hh, .12, f, 1, [x, y, 0]));
  G.add(slab(w + .4, .12, .28, stoneTex('#d9cdb5', { n: 2 }), 1, [0, -h / 2 - .1, .06]), slab(w + .3, .14, .12, stoneTex('#d9cdb5', { n: 2 }), 1, [0, h / 2 + .13, .02]));
  for (const s of [-1, 1]) { const sh = slab(w * .5, h, .03, paintTex('#3f6b55', { seed: 7 }), 1, [s * (w * .75 + .09), 0, .02]); G.add(sh); for (let k = 0; k < 7; k++) G.add(slab(w * .46, .015, .03, solid(0x30574a), 1, [s * (w * .75 + .09), -h / 2 + (k + .5) * h / 7, .04])); }
  return G; }
function house(w, floors, wall, trim, shop) { const H = new THREE.Group(), fh = 3.1, h = floors * fh;
  H.add(slab(w, h, 6, wall, .5, [0, h / 2, -3]));
  H.add(slab(w + .3, .3, .5, stoneTex('#d9cdb5', { n: 2 }), 1, [0, h + .15, .1]), slab(w + .4, .14, .6, stoneTex('#cbbf a7'.replace(' ', ''), { n: 2 }), 1, [0, h + .37, .15]));
  for (let f = 1; f < floors; f++) { H.add(slab(w, .12, .12, stoneTex('#d9cdb5', { n: 2 }), 1, [0, f * fh, .05])); const n = Math.max(2, Math.round(w / 2.2)); for (let i = 0; i < n; i++) { const u = windowUnit(.9, 1.5, trim); u.position.set(-w / 2 + (i + .5) * w / n, f * fh + 1.55, .07); H.add(u); } }
  if (shop) { const [sign, awn] = shop; H.add(slab(w - .4, 2.3, .03, new THREE.MeshStandardMaterial({ color: 0x3a4a52, roughness: .15, metalness: .4 }), 1, [0, 1.35, .02]));
    for (const x of [-w / 2 + .2, w / 2 - .2]) H.add(slab(.3, 2.9, .2, mat(trim, [1, 1]), 1, [x, 1.45, .1])); H.add(slab(w, .5, .2, mat(trim, [1, 1]), 1, [0, 2.75, .1]));
    const s = label(w - .8, .4, (g, ww, hh) => { g.fillStyle = '#1f2a2e'; g.fillRect(0, 0, ww, hh); g.fillStyle = '#e9c46a'; g.font = `700 ${hh * .62}px Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(sign, ww / 2, hh * .55); g.strokeStyle = '#e9c46a'; g.lineWidth = hh * .04; g.strokeRect(hh * .08, hh * .08, ww - hh * .16, hh * .84); }); s.position.set(0, 2.75, .21); H.add(s);
    const ac = document.createElement('canvas'); ac.width = 256; ac.height = 32; const ag = ac.getContext('2d'); for (let i = 0; i < 16; i++) { ag.fillStyle = i % 2 ? '#efe6d2' : awn; ag.fillRect(i * 16, 0, 16, 32); } const at = new THREE.CanvasTexture(ac); at.colorSpace = THREE.SRGBColorSpace;
    const a = part(new THREE.PlaneGeometry(w - .3, 1.3), new THREE.MeshStandardMaterial({ map: at, roughness: .9, side: THREE.DoubleSide }), [0, 2.35, .65]); a.rotation.x = -1.0; H.add(a);
    H.add(slab(.9, 2.1, .04, mat(paintTex(awn, { seed: 3 }), [1, 1]), 1, [w / 2 - .9, 1.05, .05]));
    const box_ = slab(w - 1.6, .3, .3, woodTex('#7a4a2a', { planks: 2 }), 1, [-.5, .5, .25]); H.add(box_); const fr = rng(w * 10); for (let i = 0; i < 10; i++) H.add(part(new THREE.SphereGeometry(.12, 8, 6), solid([0xd94f3d, 0xf2c63a, 0x4f7a45][i % 3], { roughness: .7 }), [-.5 - (w - 1.8) / 2 + i * (w - 1.8) / 9, .72, .25])); }
  else for (let i = 0, n = Math.max(2, Math.round(w / 2.2)); i < n; i++) { const u = windowUnit(.9, 1.5, trim); u.position.set(-w / 2 + (i + .5) * w / n, 1.6, .07); H.add(u); }
  H.add(part(new THREE.CylinderGeometry(.05, .05, h, 8), solid(0x3a3a3c, { roughness: .5, metalness: .4 }), [w / 2 - .1, h / 2, .12]));
  return H; }
function lampPost() { const L = new THREE.Group(), M = solid(0x2a2d2b, { roughness: .45, metalness: .6 });
  L.add(part(new THREE.CylinderGeometry(.16, .22, .5, 12), M, [0, .25, 0]), part(new THREE.CylinderGeometry(.06, .08, 3.6, 10), M, [0, 2.1, 0]), part(new THREE.CylinderGeometry(.12, .1, .1, 12), M, [0, 3.95, 0]));
  L.add(part(new THREE.CylinderGeometry(.22, .14, .45, 6), new THREE.MeshStandardMaterial({ color: 0xfff0c8, emissive: 0xffd58a, emissiveIntensity: .6, roughness: .3 }), [0, 4.2, 0]), part(new THREE.ConeGeometry(.3, .25, 6), M, [0, 4.55, 0]));
  return L; }
function tree() { const T_ = new THREE.Group(); T_.add(part(new THREE.CylinderGeometry(.12, .18, 3, 8), solid(0x5a4030, { roughness: .9 }), [0, 1.5, 0])); const r = rng(5);
  for (let i = 0; i < 16; i++) { const b = part(new THREE.IcosahedronGeometry(.7 + r() * .4, 1), solid([0x5f8a48, 0x6e9a50, 0x527a3e][i % 3], { roughness: .9 }), [(r() - .5) * 2, 3.4 + r() * 1.6, (r() - .5) * 2]); T_.add(b); }
  T_.add(slab(1.2, .08, 1.2, solid(0x4a3a2a), 1, [0, .04, 0])); return T_; }
function hydrant() { const H = new THREE.Group(), red = solid(0xb8392e, { roughness: .4, metalness: .2 }); H.add(part(new THREE.CylinderGeometry(.16, .18, .55, 14), red, [0, .3, 0]), part(new THREE.SphereGeometry(.17, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), red, [0, .57, 0]), part(new THREE.CylinderGeometry(.06, .06, .5, 10), red, [0, .4, 0])); H.children.at(-1).rotation.z = Math.PI / 2; H.add(part(new THREE.CylinderGeometry(.21, .21, .06, 14), red, [0, .06, 0])); return H; }
export function street() { const S = new THREE.Group();
  S.add(slab(80, .1, 4, stoneTex('#c4b79e', { n: 4, seed: 2 }), .7, [0, -.05, 2]), slab(80, .18, .25, stoneTex('#b0a48c', { n: 2, seed: 9 }), 1, [0, -.01, 4.1]), slab(80, .1, 9, stoneTex('#5d5a58', { n: 12, seed: 4, cobble: true }), 1.2, [0, -.12, 8.7]));
  const looks = [[brickTex('#a8543a', { seed: 5 }), paintTex('#efe6d2', { seed: 1 }), ['BAKERY', '#b4513e']], [plasterTex('#e2b97a', { seed: 2, grime: .8 }), paintTex('#3f6b55', { seed: 2 }), null], [brickTex('#8a4a36', { seed: 11 }), paintTex('#efe6d2', { seed: 3 }), ['HARDWARE', '#2f5a6e']], [plasterTex('#d7a08a', { seed: 6, grime: .7 }), paintTex('#efe6d2', { seed: 4 }), ['BOOKS', '#3f6b55']], [brickTex('#9a5a3a', { seed: 13 }), paintTex('#efe6d2', { seed: 5 }), null], [plasterTex('#e8d3a0', { seed: 8 }), paintTex('#7a3a32', { seed: 6 }), ['CAFÉ', '#7a3a32']]];
  let x = -34; for (let i = 0; x < 14; i++) { const [wall, trim, shop] = looks[i % looks.length], w = 5 + (i * 7) % 4, fl = 3 + (i % 2); const H = house(w, fl, wall, trim, shop); H.position.set(x + w / 2, 0, 0); S.add(H); x += w; }
  for (const lx of [-26, -16, -6, 4.5]) { const L = lampPost(); L.position.set(lx, 0, 3.6); S.add(L); }
  for (const tx of [-15, 5]) { const t = tree(); t.position.set(tx, 0, 3.3); S.add(t); }
  { const h = hydrant(); h.position.set(2.2, 0, 3.5); S.add(h); }
  { const B = new THREE.Group(); B.position.set(-4, 0, 3.4); const wd = woodTex('#7a5030', { planks: 2, seed: 4 }); for (let k = 0; k < 3; k++) B.add(slab(1.8, .04, .12, wd, 1, [0, .45, -.16 + k * .15])); for (let k = 0; k < 2; k++) B.add(slab(1.8, .1, .03, wd, 1, [0, .7 + k * .18, -.25])); for (const s of [-.8, .8]) B.add(slab(.05, .45, .4, solid(0x2a2d2b, { metalness: .5 }), 1, [s, .22, -.05])); S.add(B); }
  { const bin = part(new THREE.CylinderGeometry(.24, .2, .75, 16), solid(0x3f5a4a, { roughness: .5, metalness: .3 }), [-6.2, .38, 3.6]); S.add(bin); }
  S.add(slab(80, .02, .12, solid(0xe8dfc8), 1, [0, -.06, 8.7]));
  return S; }
