// The world of "Smell gas at home": kitchen, hallway and street, Sam, the friend and a gas worker, and the props a shot can switch on.
import * as THREE from 'three';
import { stage, box, cyl, ball, toon, clamp, lerp, canvasTex } from '../../engine/toon.js';
import { worldKit, card } from '../../engine/film.js';
import { makeChar, LOOKS } from '../../engine/char.js';
import { richStage, skyTex, windowUnit, part, slab, solid, glassMat, asphaltTex, wallpaperTex, coirTex, rng, woodTex, brickTex, plasterTex, tileTex, paintTex, stoneTex, mat } from '../../engine/rich.js';
import { reskin, tex, lit, metreUV } from '../../engine/reskin.js';
// the storybook finish on everyone: a warm medium line, a light and a shadow side, a fine grain
for (const k of ['sam', 'friend', 'gasworker', 'neighbour']) Object.assign(LOOKS[k], { ink: '#2e1d1c', lw: .8, finish: true });
Object.assign(LOOKS.friend, { top: '#2f6f73', bottom: '#d9b36a' });   // the friend out of candy colours: teal top, sand shorts
const METAL = lit(0xb8bcc4, { roughness: .35, metalness: .7 }), IRON = lit(0x2d2a2e, { roughness: .5, metalness: .5 }), BRASS = lit(0xc9a24a, { roughness: .35, metalness: .8 }), ENAMEL = lit(0xf0e6cf, { roughness: .3 });
// the old flat colours, and what each becomes
const MAP = {
  0xfbdca4: tex(plasterTex('#ead9b4', { seed: 4 }), .4), 0xcdbfe8: tex(wallpaperTex('#efe2c2', '#ddd0aa'), .9), 0xb9a8dc: tex(wallpaperTex('#efe2c2', '#ddd0aa'), .9), 0xfff3dc: tex(plasterTex('#efe4cc', { seed: 3, grime: .3 }), .3),
  0x2bb6a8: tex(paintTex('#6f8f6a', { seed: 2 }), 1), 0x35c9ba: tex(paintTex('#86a67e', { seed: 3 }), 1.5),
  0xf4f1ea: o => (o.geometry.parameters?.height ?? 1) < .1 ? tex(woodTex('#b07a48', { planks: 4, seed: 8 }), 1)(o) : ENAMEL(), 0xfff7e8: ENAMEL, 0xdedad0: ENAMEL, 0xd8d2c4: o => o.parent && o.parent.position.x > 60 || (o.geometry.parameters?.width ?? 0) > 20 ? tex(stoneTex('#c4b79e', { n: 4, seed: 2 }), .7)(o) : ENAMEL(),
  0x8a5a2e: tex(woodTex('#6e4326', { planks: 3, seed: 5 }), 1), 0xb07a45: tex(woodTex('#9a6a3f', { planks: 3, seed: 7 }), 1),
  0xc9ccd4: METAL, 0x55525f: IRON, 0x2a2733: IRON, 0x1d1a26: IRON, 0xffd23f: BRASS, 0x3f86c9: tex(paintTex('#2f5a6e', { seed: 4 }), 1),
  0x6cbf62: tex(paintTex('#6e9a50', { seed: 9 }), .3), 0x6b6f7d: tex(asphaltTex(), .25), 0xd8c79a: tex(stoneTex('#cdbf9c', { n: 6, seed: 3, cobble: true }), 1.2),
  0xf2e3c4: tex(brickTex('#a8543a', { seed: 5 }), .5), 0xbfe3d8: tex(plasterTex('#d7c9a0', { seed: 2, grime: .7 }), .4), 0xf3c9b5: tex(brickTex('#8a4a36', { seed: 11 }), .5), 0xe6dcc0: tex(plasterTex('#e2b97a', { seed: 8, grime: .7 }), .4),
  0xc9523f: lit(0xa8483a), 0x5a6f8a: lit(0x4f5f6e), 0x7a5a9a: lit(0x6a4a3e), 0x7a5230: lit(0x5a4030, { roughness: .9 }), 0x3f9a58: lit(0x5f8a48, { roughness: .9 }),
};
// surfaces picked out by size: the kitchen floor (a checker before, warm tiles now) and the painted back wall of the kitchen
const FLOOR = mat(tileTex('#c08a68', '#ddcba6', { n: 8, seed: 4, grout: '#7a6a58' }), [1, 1]), BACK = plasterTex('#ead9b4', { seed: 5 });
const special = o => { const p = o.geometry.parameters || {}; if (o.geometry.type !== 'PlaneGeometry') return null;
  if (p.width === 18 && p.height === 10) { metreUV(o, .8); return FLOOR; }
  if (p.width === 12 && p.height === 3.4 && Math.abs(o.position.z + 1.6) < .01) { metreUV(o, .4); return mat(BACK, [1, 1]); } return null; };
import { kitchen, hall, street, smellLine, spark, gasVan, SWITCH, FRONT, OUT } from './set.js';
export { SWITCH, FRONT, OUT };
export const STOVE = [-.22, .98, -1.02];
export function makeWorld() {
  const scene = richStage({ sky: skyTex('#8fb8d6', '#f6dcb0'), sun: [2.5, 7, 5], shadow: 9 }), camera = new THREE.PerspectiveCamera(40, 9 / 16, .1, 300), K = kitchen(), H = hall(), S = street(); scene.add(K, H, S);
  K.userData.door.rotation.y = 1.45;                                                              // the kitchen door stands open onto the hall
  const X = new THREE.Group(); scene.add(X);
  // the "don't" mark: two brush strokes of red paint with a dark edge, painted, not two red bars
  X.add(card(1.6, 1.6, (g, w, h) => { const stroke = (x0, y0, x1, y1) => { g.lineCap = 'round'; g.strokeStyle = '#2e1d1c'; g.lineWidth = w * .2; g.beginPath(); g.moveTo(x0 * w, y0 * h); g.quadraticCurveTo(w * .52, h * .48, x1 * w, y1 * h); g.stroke();
      g.strokeStyle = '#c9302a'; g.lineWidth = w * .15; g.stroke(); g.strokeStyle = 'rgba(255,190,160,.35)'; g.lineWidth = w * .035; g.beginPath(); g.moveTo(x0 * w + w * .03, y0 * h - h * .02); g.quadraticCurveTo(w * .54, h * .45, x1 * w + w * .02, y1 * h - h * .03); g.stroke(); };
    stroke(.14, .16, .86, .84); stroke(.86, .14, .16, .86); }, 300));
  const lines = Array.from({ length: 10 }, () => { const l = smellLine(); scene.add(l); return l; }), sp = spark(); scene.add(sp);
  // things Sam reaches for and does not use: a matchbox and a candle, a kettle, a phone held low
  const candle = new THREE.Group(); candle.add(cyl(.06, .06, .3, 0xfff7e8, [0, .15, 0], 12), cyl(.01, .01, .05, 0x1d1a26, [0, .32, 0], 6), cyl(.12, .12, .03, 0xc9ccd4, [0, .015, 0], 16)); scene.add(candle);
  const matches = box(.16, .03, .1, 0xe6232e); scene.add(matches);
  const kettle = new THREE.Group(); kettle.add(cyl(.13, .15, .26, 0xc9ccd4, [0, .13, 0], 16), cyl(.03, .03, .14, 0x1d1a26, [0, .3, 0], 8)); kettle.position.set(1.2, .94, -1.25); scene.add(kettle);
  const van = gasVan(); scene.add(van);
  const sam = makeChar('sam'), friend = makeChar('friend'), worker = makeChar('gasworker'), neighbour = makeChar('neighbour');
  reskin(scene, MAP, { special });
  // the houses' windows: the flat painted cards become real windows, frame, sill, glass and shutters
  { const cards = []; S.traverse(o => { const p = o.geometry && o.geometry.parameters; if (o.isMesh && o.material.map && p && p.width === 1.0 && p.height === .9) cards.push(o); });
    const frame = paintTex('#efe6d2', { seed: 1 }); cards.forEach((c, i) => { const u = windowUnit(.78, .78, frame, ['#3f6b55', '#2f5a6e', '#7a3a32'][i % 3]); u.position.copy(c.position); u.position.z += .1; u.rotation.copy(c.rotation); c.parent.add(u); c.parent.remove(c); }); }
  // our house gets a real doorway: the solid block is rebuilt round a hallway you see into when the front door opens
  { const H = S.getObjectByName('ours'), drop = H.children.filter(o => { const p = o.geometry && o.geometry.parameters; return o.isMesh && p && ((p.width === 7 && p.height === 4.2) || (p.width === 1.3 && p.height === 2.3)); }); drop.forEach(o => H.remove(o));
    const brick = brickTex('#a8543a', { seed: 5 }), wall = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d)); m.position.set(x, y, z); m.material = tex(brick, .5)(m); m.castShadow = m.receiveShadow = true; H.add(m); };
    wall(3.0, 4.2, .25, -2.0, 2.1, -.125); wall(3.0, 4.2, .25, 2.0, 2.1, -.125); wall(1.0, 2.1, .25, 0, 3.15, -.125);   // the front wall round the door hole (x -0.5 to 0.5, up to 2.1): the shut door covers it
    { const fr = woodTex('#efe6d2', { planks: 1, seed: 2 }), post = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d)); m.position.set(x, y, z); m.material = tex(fr, 1)(m); m.castShadow = m.receiveShadow = true; H.add(m); };
      post(.14, 2.24, .42, -.57, 1.12, 0); post(.14, 2.24, .42, .57, 1.12, 0); post(1.28, .14, .42, 0, 2.17, 0); }   // the door frame: posts and head, deep enough that no gap shows past the shut door
    wall(7, 4.2, 2.75, 0, 2.1, -3.625); wall(2.3, 4.2, 2.25, -2.35, 2.1, -1.375); wall(2.3, 4.2, 2.25, 2.35, 2.1, -1.375); wall(2.4, 1.6, 2.25, 0, 3.4, -1.375);   // the body, round a hall 2.4 wide and 2 deep
    const plaster = plasterTex('#e3d6b0', { seed: 6 }), floor = woodTex('#9a6a3f', { planks: 5, seed: 7 }), inner = (w, h, d, x, y, z, t, rpm) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d)); m.position.set(x, y, z); m.material = tex(t, rpm)(m); m.receiveShadow = true; H.add(m); return m; };
    inner(2.4, .04, 2.0, 0, .02, -1.25, floor, .8); inner(.04, 2.6, 2.0, -1.18, 1.3, -1.25, plaster, .4); inner(.04, 2.6, 2.0, 1.18, 1.3, -1.25, plaster, .4); inner(2.4, 2.6, .04, 0, 1.3, -2.23, plaster, .4); inner(2.4, .04, 2.0, 0, 2.58, -1.25, plaster, .4);
    inner(.7, .01, 1.6, 0, .045, -1.25, tileTex('#a8493a', '#d9b16a', { n: 6, seed: 3, grout: '#5a2d22' }), 1);   // a runner
    const wood = woodTex('#6e4326', { planks: 2, seed: 9 }); inner(.7, .05, .32, -.7, .8, -2.02, wood, 1); for (const x of [-1.0, -.4]) inner(.04, .78, .04, x, .39, -1.9, wood, 1);   // a side table
    H.add(part(new THREE.CylinderGeometry(.08, .1, .25, 12), lit(0xb8653f)(), [-.7, .95, -2.02]), part(new THREE.ConeGeometry(.17, .18, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xf2e6c8, emissive: 0xffd58a, emissiveIntensity: .5, side: THREE.DoubleSide }), [-.7, 1.17, -2.02]));
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(.5, .38), new THREE.MeshStandardMaterial({ map: canvasTex(200, 150, (g, w, h) => { g.fillStyle = '#6b4a2e'; g.fillRect(0, 0, w, h); g.fillStyle = '#9fb7a0'; g.fillRect(w * .1, h * .12, w * .8, h * .76); g.fillStyle = '#e7a54a'; g.beginPath(); g.arc(w * .65, h * .38, h * .12, 0, 7); g.fill(); }) })); pic.position.set(.4, 1.6, -2.2); H.add(pic);
    for (let i = 0; i < 3; i++) H.add(part(new THREE.CylinderGeometry(.012, .012, .1, 6), lit(0xc9a24a, { metalness: .8, roughness: .35 })(), [1.15, 1.75, -.7 - i * .3])), H.children.at(-1).rotation.z = Math.PI / 2;
    H.add(part(new THREE.CylinderGeometry(.12, .2, .8, 12), lit(0x2f5a6e, { roughness: .9 })(), [1.08, 1.32, -1.0]));   // a coat on a hook
    const glow = new THREE.PointLight(0xffc98a, 2.2, 4, 1.5); glow.position.set(0, 2.2, -1.4); H.add(glow); }
  // ---- the second pass: everything that still read as the old flat look ----
  const byGeo = (root, test) => { const out = []; root.traverse(o => { if (o.isMesh && o.geometry && test(o.geometry.parameters || {}, o)) out.push(o); }); return out; };
  const cream = paintTex('#efe6d2', { seed: 1 }), oak = woodTex('#9a6a3f', { planks: 2, seed: 7 });
  // the hall floor: boards, so the hall is not the kitchen's tiles
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(4.84, 8.6)); f.rotation.x = -Math.PI / 2; f.position.set(6.08, .004, 2.7); f.material = tex(woodTex('#8a5a34', { planks: 7, seed: 3 }), .5)(f); f.receiveShadow = true; H.add(f); }
  // the switch wall and the hall: a dado rail with panelling under it, a skirting, a framed photo and a key hook by the switch
  { const wx = 3.68; H.add(slab(.04, .06, 4.8, cream, 1, [wx + .02, .95, 4.5]), slab(.03, .9, 4.8, paintTex('#a8b58c', { seed: 4 }), .8, [wx + .015, .47, 4.5]), slab(.04, .12, 4.8, cream, 1, [wx + .02, .06, 4.5]));
    for (let z = 2.3; z < 6.8; z += .7) H.add(slab(.02, .6, .5, paintTex('#b9c49c', { seed: 5 }), 1, [wx + .04, .48, z]));
    const ph = new THREE.Mesh(new THREE.PlaneGeometry(.42, .52), new THREE.MeshStandardMaterial({ map: canvasTex(210, 260, (g, w, h) => { g.fillStyle = '#5a3a24'; g.fillRect(0, 0, w, h); g.fillStyle = '#efe6d2'; g.fillRect(w * .1, h * .08, w * .8, h * .84); g.fillStyle = '#a9c4c9'; g.fillRect(w * .16, h * .14, w * .68, h * .5); g.fillStyle = '#f2b98c'; g.beginPath(); g.arc(w * .42, h * .42, w * .1, 0, 7); g.arc(w * .6, h * .45, w * .09, 0, 7); g.fill(); g.fillStyle = '#c9783f'; g.fillRect(w * .32, h * .5, w * .2, h * .14); g.fillStyle = '#2f6f73'; g.fillRect(w * .52, h * .52, w * .17, h * .12); }) }));
    ph.rotation.y = Math.PI / 2; ph.position.set(wx + .03, 1.62, 2.95); H.add(ph);
    H.add(slab(.03, .1, .4, oak, 1, [wx + .02, 1.5, 2.5])); for (let i = 0; i < 3; i++) H.add(part(new THREE.CylinderGeometry(.01, .01, .06, 6), solid(0xc9a24a, { metalness: .8, roughness: .35 }), [wx + .06, 1.47, 2.38 + i * .12])), H.children.at(-1).rotation.z = Math.PI / 2;
  }
  // the stairs: painted risers under oak treads with a lip, a side board along the open side, a spindle on every step and a newel post
  { byGeo(H, (p, o) => o.geometry.type === 'BoxGeometry' && p.width === .42 && p.depth === 1.0).forEach(o => { o.material = mat(woodTex('#5e3d24', { planks: 2, seed: 4 }), [1, 1]); });   /* the side under the treads: dark panelling */
    byGeo(H, p => p.radiusTop === .025 && p.height === .9).forEach(o => o.parent.remove(o));
    for (let i = 0; i < 9; i++) { const x = 4.4 + i * .42, y = .22 * (i + 1); H.add(slab(.48, .045, 1.06, oak, 1, [x + .02, y + .02, -1.0]));
      H.add(part(new THREE.CylinderGeometry(.02, .025, .82, 8), mat(cream, [1, 1]), [x, y + .45, -.52])); }
    const len = Math.hypot(3.78, 1.98), sb = slab(len, .32, .05, cream, 1, [6.08, 1.0, -.47]); sb.rotation.z = Math.atan2(1.98, 3.78); H.add(sb);
    H.add(slab(.12, 1.1, .12, oak, 1, [4.25, .55, -.52]), part(new THREE.SphereGeometry(.08, 12, 8), mat(oak, [1, 1]), [4.25, 1.15, -.52])); }
  // the hall lamp: a pleated fabric shade, lit from inside, on a brass stem
  { const L = H.children.find(o => o.isGroup && Math.abs(o.position.x - 7.4) < .01 && Math.abs(o.position.z - .1) < .01);
    if (L) { L.children.filter(o => o.geometry && o.geometry.type === 'ConeGeometry').forEach(o => L.remove(o));
      const sg = new THREE.CylinderGeometry(.18, .3, .34, 24, 1, true), pos = sg.attributes.position; for (let i = 0; i < pos.count; i++) { const a = Math.atan2(pos.getZ(i), pos.getX(i)), k = 1 + .04 * Math.cos(a * 24); pos.setX(i, pos.getX(i) * k); pos.setZ(i, pos.getZ(i) * k); } sg.computeVertexNormals();
      L.add(part(sg, new THREE.MeshStandardMaterial({ color: 0xf2e2c0, emissive: 0xffc98a, emissiveIntensity: .35, roughness: .9, side: THREE.DoubleSide }), [0, 1.6, 0]), part(new THREE.SphereGeometry(.05, 10, 8), new THREE.MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffe6b0, emissiveIntensity: 1.2 }), [0, 1.5, 0]));
      const gl = new THREE.PointLight(0xffc98a, 1.2, 3, 1.6); gl.position.set(0, 1.55, 0); L.add(gl); } }
  // the door mat: a real coir mat with a border, lying on the floor
  { byGeo(H, (p, o) => o.userData.noInk && p.width === 1.0 && p.height === .6).forEach(o => { const m = slab(1.0, .025, .6, coirTex(), 1, [o.position.x, .013, o.position.z]); H.add(m); o.parent.remove(o); }); }
  // the kitchen window: a cream frame with glazing bars and a sill, glass, and a garden behind it
  { byGeo(K, (p, o) => o.material.map && p.width === 1.0 && p.height === .8).forEach(o => { const W0 = new THREE.Group(); W0.position.copy(o.position); W0.rotation.copy(o.rotation); o.parent.add(W0); o.parent.remove(o);
      const view = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .8), new THREE.MeshBasicMaterial({ map: canvasTex(400, 320, (g, w, h) => { const sk = g.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, '#9cc4dc'); sk.addColorStop(.6, '#f2dcb4'); g.fillStyle = sk; g.fillRect(0, 0, w, h); g.fillStyle = '#7a9a62'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(i * w / 8, h * .62, w * .09, 0, 7); g.fill(); } g.fillStyle = '#5f7f4c'; g.fillRect(0, h * .62, w, h * .14); g.fillStyle = '#e9dcc0'; for (let i = 0; i < 14; i++) g.fillRect(i * w / 13, h * .7, w * .03, h * .3); g.fillRect(0, h * .78, w, h * .03); g.fillStyle = '#8fae6a'; g.fillRect(0, h * .92, w, h * .08); }) }));
      view.position.z = -.05; W0.add(view); W0.add(slab(1.0, .8, .01, new THREE.MeshStandardMaterial({ color: 0xd8e6ee, transparent: true, opacity: .18, roughness: .1 }), 1, [0, 0, -.01]));
      for (const [ww, hh, x, y] of [[1.16, .08, 0, .44], [1.16, .08, 0, -.44], [.08, .88, -.54, 0], [.08, .88, .54, 0], [.04, .8, 0, 0], [1.0, .04, 0, .1]]) W0.add(slab(ww, hh, .07, cream, 1, [x, y, .02]));
      W0.add(slab(1.24, .05, .16, cream, 1, [0, -.5, .07])); }); }
  // the trees: leafy clusters, not a ball on a stick
  { const tr = rng(19); byGeo(S, p => p.radius > 1).forEach(o => { const G2 = new THREE.Group(); G2.position.copy(o.position); const R = o.geometry.parameters.radius;
      G2.position.y += R * .35; G2.add(part(new THREE.CylinderGeometry(R * .09, R * .13, R * 1.3, 8), new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: .9 }), [0, -R * .75, 0]));
      for (let i = 0; i < 12; i++) G2.add(part(new THREE.IcosahedronGeometry(R * (.3 + tr() * .16), 2), new THREE.MeshStandardMaterial({ color: [0x6e9a50, 0x7aa85a, 0x5f8a48][i % 3], roughness: .9 }), [(tr() - .5) * R * .9, (tr() - .2) * R * .55, (tr() - .5) * R * .9]));
      o.parent.add(G2); o.parent.remove(o); }); }
  // the front fence: cream pickets on two rails between posts, either side of the path
  { byGeo(S, p => p.width === 4.5 && p.height === .7).forEach(o => { const F = new THREE.Group(); F.position.copy(o.position); F.position.y = 0; o.parent.add(F); o.parent.remove(o);
      for (const x of [-2.2, -1.1, 0, 1.1, 2.2]) F.add(slab(.1, .85, .1, cream, 1, [x, .42, 0]), slab(.13, .05, .13, cream, 1, [x, .87, 0]));
      for (const y of [.25, .6]) F.add(slab(4.4, .06, .04, cream, 1, [0, y, .05]));
      for (let x = -2.15; x <= 2.16; x += .155) { const pk = slab(.075, .72, .025, cream, 1, [x, .4, .085]); F.add(pk); const tip = part(new THREE.ConeGeometry(.053, .08, 4), mat(cream, [1, 1]), [x, .8, .085]); tip.rotation.y = Math.PI / 4; F.add(tip); } }); }
  // the road's edges: stone kerbs
  for (const z of [4.5, 9.1]) S.add(slab(80, .12, .2, stoneTex('#a89c86', { n: 3, seed: 5 }), 1, [0, .06, z]));
  const props = { X, sp, candle, matches, van }; lines.forEach((l, i) => props['line' + i] = l);
  // the sun follows the camera: its shadow box is centred where the shot looks, indoors or out
  const key = scene.userData.key, SUN = [3, 7, 4.5];
  const W = worldKit(scene, camera, { sam, friend, worker, neighbour }, props, () => { H.userData.door.rotation.y = 0; S.userData.door.rotation.y = 0; H.userData.rocker.rotation.z = 0; });
  { const cam0 = W.cam; W.cam = (pos, look, fov) => { cam0(pos, look, fov); key.target.position.set(...look); key.position.set(look[0] + SUN[0], look[1] + SUN[1], look[2] + SUN[2]); }; }
  const face = o => o.quaternion.copy(camera.quaternion);
  return { ...W, hallDoor: H.userData.door, outDoor: S.userData.door, rocker: H.userData.rocker,
    // gas you can see: lines drifting up from a point and spreading, amount 0..1 (how many, how big)
    smell(t, from, amount, spread = 1.4, rise = 1.6, size = 1) { lines.forEach((l, i) => { const on = i < Math.round(amount * lines.length); l.visible = on; if (!on) return; const u = (t * .22 + i * .137) % 1, a = i * 2.39;
      l.position.set(from[0] + Math.cos(a) * spread * (.2 + u), from[1] + rise * u, from[2] + Math.sin(a) * spread * .6 * (.2 + u)); face(l); l.rotateZ(Math.sin(t * 1.5 + i) * .15); l.scale.setScalar(size * (.6 + .5 * amount) * (.6 + .4 * Math.sin(Math.PI * u))); l.material.opacity = Math.sin(Math.PI * u); }); },
    spark(pos, u, s = 1) { sp.visible = u > 0 && u < 1; sp.position.set(...pos); face(sp); sp.rotateZ(u * 7); sp.scale.setScalar(s * (.4 + .9 * Math.sin(Math.PI * u))); },
    cross(pos, u, s = .3) { X.position.set(...pos); W.pop(X, u, s); face(X); },
    burner(on) { const r = K.userData.ring; if (r) r.material.color.set(on ? 0xff5a1f : 0x55525f); }, flame() {} };
}
