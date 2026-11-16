// Sam in 3D: the channel's character as a rounded cartoon figure with a face that acts.
// makeSam3D(look) returns { root, j, setPose(pose), setFace(face) }. Joints rotate in radians, as [x, y, z].
// Face: { eyes: [x, y] (-1..1, where the pupils look), blink 0..1, brow -1..1 (worried..cross), mouth: 'smile'|'o'|'shout'|'grit'|'sad'|'flat', sweat 0..1, blush 0..1 }.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
const LOOKS = {
  sam: { skin: 0xf2b183, hair: 0x3a2a26, top: 0xff6a3d, trim: 0xd9542c, shorts: 0x2f6fd6, shoe: 0xffffff, sole: 0xe6232e, lace: 0xffd23f, sock: 0xffffff },
};
const SHADOW = o => { o.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); return o; };
const mat = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: .55, sheen: .3, sheenColor: new THREE.Color(0xffffff), ...o });
const sph = (r, m, p = [0, 0, 0], s = [1, 1, 1], seg = 32) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * .75)), m); o.position.set(...p); o.scale.set(...s); return o; };
const cap = (r, len, m, p = [0, 0, 0]) => { const o = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 20), m); o.position.set(...p); return o; };
const ring = (r, tube, m, p = [0, 0, 0], rx = Math.PI / 2) => { const o = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 10, 40), m); o.position.set(...p); o.rotation.x = rx; return o; };
// a bean for the body: wider at the hips than the chest, flatter front to back
function bean(h, r0, r1) { const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24, y = u * h, r = (r0 + (r1 - r0) * u) * Math.sin(Math.PI * (.12 + .76 * u)) / Math.sin(Math.PI * .5) * (u < .08 ? u / .08 * .85 + .15 : 1); pts.push(new THREE.Vector2(Math.max(.001, r), y)); }
  const g = new THREE.LatheGeometry(pts, 40); g.scale(1, 1, .78); return g; }
// the mouth is drawn, so it can change shape freely, on a small curved card on the face
function mouthCard() { const c = document.createElement('canvas'); c.width = 256; c.height = 160; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const g = new THREE.CylinderGeometry(.22, .22, .1, 24, 1, true, -.38, .76);   /* an arc of a cylinder round the front of the face */ const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: .4, side: THREE.DoubleSide }));
  const draw = (shape) => { const x = c.getContext('2d'), w = 256, h = 160, cx = 128, cy = 70; x.clearRect(0, 0, w, h); x.lineCap = x.lineJoin = 'round'; x.strokeStyle = '#2a1416'; x.lineWidth = 11;
    if (shape === 'smile') { x.beginPath(); x.arc(cx, cy - 36, 58, .2 * Math.PI, .8 * Math.PI); x.stroke(); }
    else if (shape === 'o') { x.fillStyle = '#5a1f2a'; x.beginPath(); x.ellipse(cx, cy, 24, 32, 0, 0, 7); x.fill(); x.stroke(); x.fillStyle = '#ff8fa0'; x.beginPath(); x.ellipse(cx, cy + 16, 13, 8, 0, 0, 7); x.fill(); }
    else if (shape === 'shout') { x.fillStyle = '#5a1f2a'; x.beginPath(); x.roundRect(cx - 62, cy - 32, 124, 74, 34); x.fill(); x.stroke(); x.fillStyle = '#fff'; x.fillRect(cx - 48, cy - 27, 96, 15); x.fillStyle = '#ff8fa0'; x.beginPath(); x.ellipse(cx, cy + 28, 34, 14, 0, Math.PI, 7); x.fill(); }
    else if (shape === 'grit') { x.fillStyle = '#fff'; x.beginPath(); x.roundRect(cx - 58, cy - 20, 116, 42, 14); x.fill(); x.stroke(); x.lineWidth = 5; for (let i = -1; i <= 1; i++) { x.beginPath(); x.moveTo(cx + i * 29, cy - 20); x.lineTo(cx + i * 29, cy + 22); x.stroke(); } }
    else if (shape === 'sad') { x.beginPath(); x.arc(cx, cy + 48, 52, 1.22 * Math.PI, 1.78 * Math.PI); x.stroke(); }
    else { x.beginPath(); x.moveTo(cx - 36, cy); x.lineTo(cx + 36, cy); x.stroke(); }
    tex.needsUpdate = true; };
  m.userData.draw = draw; draw('smile'); return m; }
export function makeSam3D(lookName = 'sam') {
  const L = LOOKS[lookName], M = { skin: mat(L.skin, { roughness: .5, sheen: .6, sheenColor: new THREE.Color(0xffc8b0), clearcoat: .06 }), hair: mat(L.hair, { roughness: .7, sheen: .5 }),
    top: mat(L.top, { roughness: .85, sheen: .8, sheenColor: new THREE.Color(0xffb08a) }), trim: mat(L.trim, { roughness: .85 }), shorts: mat(L.shorts, { roughness: .85, sheen: .6, sheenColor: new THREE.Color(0x9cc4ff) }),
    shoe: mat(L.shoe, { roughness: .45 }), sole: mat(L.sole, { roughness: .6 }), lace: mat(L.lace, { roughness: .6 }), sock: mat(L.sock, { roughness: .9 }),
    white: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .12, clearcoat: 1 }), pupil: new THREE.MeshPhysicalMaterial({ color: 0x1d1a26, roughness: .1, clearcoat: 1 }), shine: new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    nose: mat(0xee9f74, { roughness: .45, sheen: .6 }), blush: new THREE.MeshBasicMaterial({ color: 0xff7f7f, transparent: true, opacity: .0, depthWrite: false }), ear: mat(0xe39a70, { roughness: .55 }),
    drop: new THREE.MeshPhysicalMaterial({ color: 0x8fd8ff, roughness: .05, transmission: .4, thickness: .02, clearcoat: 1 }) };
  const root = new THREE.Group(), pelvis = new THREE.Group(); pelvis.position.y = .66; root.add(pelvis);
  const spine = new THREE.Group(); pelvis.add(spine); const chest = new THREE.Group(); chest.position.y = .2; spine.add(chest);
  const j = { root, pelvis, spine, chest };
  // shorts on the pelvis, the T-shirt on the chest: one bean split at the waist, with a waistband, hems and a drawstring
  const profile = (pts, m, y = 0) => { const g = new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), 44); g.scale(1, 1, .8); const o = new THREE.Mesh(g, m); o.position.y = y; return o; };
  spine.add(profile([[.001, -.17], [.12, -.16], [.18, -.12], [.2, -.04], [.2, .1]], M.shorts));   /* shorts: rounded underneath, straight up to the waist */
  chest.add(profile([[.214, -.14], [.214, -.08], [.205, .05], [.19, .18], [.15, .27], [.08, .31], [.001, .315]], M.top));   /* the T-shirt: hangs over the shorts, rounds into the shoulders */
  { const hem = ring(.214, .013, M.trim, [0, -.14, 0]); hem.scale.set(1, .8, 1); chest.add(hem); }
  chest.add(ring(.07, .02, M.trim, [0, .305, .0]));   /* collar */
  { const pocket = new THREE.Mesh(new RoundedBoxGeometry(.08, .08, .02, 2, .01), M.trim); pocket.position.set(.085, .12, .165); pocket.rotation.x = -.15; chest.add(pocket); }
  // neck and head
  const neck = new THREE.Group(); neck.position.y = .3; chest.add(neck); neck.add(cap(.055, .02, M.skin, [0, .02, 0])); j.neck = neck;
  const head = new THREE.Group(); head.position.y = .04; head.scale.setScalar(1.32); neck.add(head); j.head = head;   /* a big cartoon head, like the flat Sam's */
  const skull = new THREE.Mesh(new RoundedBoxGeometry(.46, .42, .4, 6, .15), M.skin); skull.position.y = .19; head.add(skull);
  for (const s of [-1, 1]) { const e = sph(.06, M.ear, [s * .235, .18, -.01], [.55, 1, .8]); head.add(e); head.add(sph(.03, M.nose, [s * .262, .18, .005], [.3, .8, .6])); }
  // hair: a cap over the top and back, a swoop across the forehead, a few tufts and a cowlick
  { const top = new THREE.Mesh(new RoundedBoxGeometry(.48, .14, .42, 6, .07), M.hair); top.position.set(0, .4, -.015); head.add(top);
    const back = new THREE.Mesh(new RoundedBoxGeometry(.47, .3, .12, 6, .06), M.hair); back.position.set(0, .26, -.155); head.add(back);
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-.23, .38, .13), new THREE.Vector3(-.08, .45, .18), new THREE.Vector3(.1, .43, .18), new THREE.Vector3(.22, .37, .14)]);
    const swoop = new THREE.Mesh(new THREE.TubeGeometry(curve, 30, .045, 12), M.hair); swoop.scale.set(1, .8, 1); head.add(swoop);
    for (const [x, z, r] of [[-.12, .02, .2], [.0, -.05, -.15], [.13, .0, .25]]) { const tuft = new THREE.Mesh(new THREE.ConeGeometry(.04, .1, 10), M.hair); tuft.position.set(x, .49, z); tuft.rotation.set(-.3, 0, r); head.add(tuft); }
    const lick = new THREE.Mesh(new THREE.TorusGeometry(.035, .012, 8, 20, Math.PI * 1.3), M.hair); lick.position.set(.02, .5, -.06); lick.rotation.set(0, Math.PI / 2, 0); head.add(lick);
    for (const [x, y] of [[-.15, .115], [-.05, .095], [.06, .1], [.16, .12]]) { const t2 = new THREE.Mesh(new THREE.ConeGeometry(.035, .08, 10), M.hair); t2.position.set(x, y, -.19); t2.rotation.set(Math.PI + .3, 0, x * 2); head.add(t2); } }   /* the back of the hair ends in points, not a straight edge */
  // face: eyes with pupils and shines, lids for blinking, brows, a nose, cheeks, the drawn mouth, a sweat drop
  const eyes = [], pupils = [], brows = [], lids = [];
  for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(s * .095, .2, .178); head.add(g);
    const w = sph(.075, M.white, [0, 0, 0], [.9, 1.1, .55]); g.add(w); eyes.push(w);
    const p = new THREE.Group(); g.add(p); p.add(sph(.036, M.pupil, [0, 0, .035], [1, 1, .5]), sph(.011, M.shine, [-.012, .014, .053])); pupils.push(p);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(.079, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.skin); lid.scale.set(.92, 1.12, .6); g.add(lid); lids.push(lid);
    const b = cap(.016, .085, M.hair); b.rotation.z = Math.PI / 2; const bg = new THREE.Group(); bg.position.set(s * .1, .29, .2); bg.add(b); head.add(bg); brows.push(bg); }
  head.add(sph(.028, M.nose, [0, .13, .205], [1.2, 1, 1]));
  const cheeks = [-1, 1].map(s => { const c = new THREE.Mesh(new THREE.CircleGeometry(.035, 24), M.blush); c.position.set(s * .15, .12, .202); head.add(c); return c; });
  const mouth = mouthCard(); mouth.position.set(0, .055, -.012); head.add(mouth);
  const sweat = sph(.022, M.drop, [.21, .32, .15], [1, 1.5, 1]); head.add(sweat);
  // arms: a sleeve, a skin forearm and upper arm, a hand with a thumb and four fingers
  for (const s of [1, -1]) { const k = s > 0 ? 'l' : 'r';
    const sh = new THREE.Group(); sh.position.set(s * .19, .2, 0); chest.add(sh);
    sh.add(sph(.064, M.top), cap(.04, .16, M.skin, [0, -.12, 0])); { const sl = new THREE.Mesh(new THREE.CylinderGeometry(.062, .068, .1, 20), M.top); sl.position.y = -.05; sh.add(sl); sh.add(ring(.067, .01, M.trim, [0, -.1, 0])); }
    const el = new THREE.Group(); el.position.y = -.2; sh.add(el); el.add(cap(.04, .14, M.skin, [0, -.085, 0]));   /* no joint ball: capsules of one radius meet smoothly */
    const wr = new THREE.Group(); wr.position.y = -.19; el.add(wr);
    { const palm = sph(.045, M.skin, [0, -.04, 0], [1, 1.05, .6]); wr.add(palm); const th = cap(.014, .03, M.skin, [s * -.035, -.03, .02]); th.rotation.z = s * .7; wr.add(th);
      for (let i = 0; i < 4; i++) { const f = cap(.012, .035, M.skin, [(i - 1.5) * .022, -.095, 0]); f.rotation.z = (i - 1.5) * .06; wr.add(f); } }
    j[k + 'Sh'] = sh; j[k + 'El'] = el; j[k + 'Wr'] = wr;
    // legs: skin, a sock with a cuff, a trainer with a sole, a toe cap and laces
    const hip = new THREE.Group(); hip.position.set(s * .09, -.06, 0); pelvis.add(hip); hip.add(cap(.048, .2, M.skin, [0, -.15, 0])); { const leg = new THREE.Mesh(new THREE.CylinderGeometry(.08, .075, .1, 20), M.shorts); leg.position.y = -.05; hip.add(leg); hip.add(ring(.077, .01, M.shorts, [0, -.1, 0])); }
    const kn = new THREE.Group(); kn.position.y = -.26; hip.add(kn); kn.add(cap(.048, .19, M.skin, [0, -.12, 0])); kn.add(new THREE.Mesh(new THREE.CylinderGeometry(.052, .05, .06, 20), M.sock).translateY(-.2)); kn.add(ring(.052, .009, M.sock, [0, -.17, 0]));
    const an = new THREE.Group(); an.position.y = -.26; kn.add(an);
    { const shoe = new THREE.Mesh(new RoundedBoxGeometry(.13, .09, .24, 4, .04), M.shoe); shoe.position.set(0, -.04, .045); an.add(shoe);
      const sole = new THREE.Mesh(new RoundedBoxGeometry(.14, .03, .25, 3, .012), M.sole); sole.position.set(0, -.08, .045); an.add(sole);
      const toe = sph(.064, M.shoe, [0, -.045, .13], [1, .72, .7]); an.add(toe);
      for (let i = 0; i < 3; i++) an.add(cap(.007, .06, M.lace, [0, .006, .02 + i * .034]).rotateZ(Math.PI / 2)); }
    j[k + 'Hip'] = hip; j[k + 'Kn'] = kn; j[k + 'An'] = an; }
  SHADOW(root); cheeks.forEach(c => c.castShadow = false); mouth.castShadow = false;
  const JOINTS = ['pelvis', 'spine', 'chest', 'neck', 'head', 'lSh', 'lEl', 'lWr', 'rSh', 'rEl', 'rWr', 'lHip', 'lKn', 'lAn', 'rHip', 'rKn', 'rAn'];
  const REST = { lSh: [0, 0, .12], rSh: [0, 0, -.12], lEl: [-.15, 0, 0], rEl: [-.15, 0, 0] };
  let lastMouth = '';
  return { root, j, look: L,
    setPose(p = {}) { const q = { ...REST, ...p }; for (const k of JOINTS) { const v = q[k] || [0, 0, 0]; j[k].rotation.set(v[0], v[1], v[2], 'YXZ'); } pelvis.position.y = .66 + (p.drop || 0); },
    setFace(f = {}) { const e = f.eyes || [0, 0]; pupils.forEach(p => p.position.set(e[0] * .028, e[1] * .03, 0));
      const bl = f.blink || 0; lids.forEach(l => { l.rotation.x = lerpN(-1.75, -.08, bl); });
      const br = f.brow || 0; brows.forEach((b, i) => { const s = i ? 1 : -1; b.rotation.z = s * br * .45;   /* brow < 0 worried (inner ends up), > 0 cross (inner ends down) */ b.position.y = .29; b.position.y += - Math.abs(br) * .01 + (br < 0 ? .012 : 0); });
      const m = f.mouth || 'smile'; if (m !== lastMouth) { mouth.userData.draw(m); lastMouth = m; }
      sweat.visible = (f.sweat || 0) > 0; sweat.scale.set(1, 1.5, 1).multiplyScalar(.6 + .4 * (f.sweat || 0)); M.blush.opacity = .55 * (f.blush ?? .5); } };
}
const lerpN = (a, b, t) => a + (b - a) * t;
