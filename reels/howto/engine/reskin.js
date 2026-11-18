// Re-skin a set built in the flat look: every flat-coloured surface becomes a textured, lit material in the storybook palette.
// The geometry stays where it is, so shots framed on the old set still frame the new one.
// map: { 0xRRGGBB: spec } where spec is a function (mesh, size) -> material, or a material. Unlisted colours become a lit, slightly
// muted version of themselves. Painted boards (a map and no listed colour), see-through cards and decals are left alone.
import * as THREE from 'three';
import { mat } from './rich.js';
// the size of a box or plane, in metres along its own axes
const sizeOf = g => { const p = g.parameters || {}; return g.type === 'BoxGeometry' ? [p.width, p.height, p.depth] : g.type === 'PlaneGeometry' ? [p.width, p.height, 0] : null; };
// give a box or plane uvs in metres times rpm, so a texture keeps its scale whatever the size of the surface
export function metreUV(mesh, rpm) {
  const g = mesh.geometry, s = sizeOf(g); if (!s) return; const geo = g.clone(), uv = geo.attributes.uv, n = geo.attributes.normal, [w, h, d] = s;
  for (let i = 0; i < uv.count; i++) { const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), [a, b] = g.type === 'PlaneGeometry' ? [w, h] : nx > .5 ? [d, h] : ny > .5 ? [w, d] : [w, h]; uv.setXY(i, uv.getX(i) * a * rpm, uv.getY(i) * b * rpm); }
  mesh.geometry = geo;
}
// a textured material whose texture repeats every 1/rpm metres
export const tex = (t, rpm = 1, o = {}) => mesh => { metreUV(mesh, rpm); return mat(t, [1, 1], o); };
export const lit = (color, o = {}) => () => new THREE.MeshStandardMaterial({ color, roughness: o.roughness ?? .7, metalness: o.metalness ?? 0, side: o.side ?? THREE.FrontSide });
export function reskin(root, map, { keep = () => false, special = () => null } = {}) {
  const done = new Map();
  root.traverse(o => {
    if (!o.isMesh || !o.material || Array.isArray(o.material) || keep(o)) return;
    const m = o.material; if (m.isMeshStandardMaterial || m.transparent || o.userData.noInk) return;
    const sp = special(o); if (sp) { o.material = sp; o.receiveShadow = true; return; }   // a surface picked out by size or place (a floor, a painted wall)
    const hex = m.color ? m.color.getHex() : null, spec = map[hex];
    if (m.map && !spec) { if (m.isMeshBasicMaterial && !o.userData.keepFlat) { o.material = new THREE.MeshStandardMaterial({ map: m.map, roughness: .6, side: m.side }); o.receiveShadow = true; } return; }   // a painted board keeps its picture but takes the room's light, so it never glows flat white
    let nm;
    if (spec) nm = typeof spec === 'function' ? spec(o) : spec;
    else if (hex != null) { const c = new THREE.Color(hex); c.offsetHSL(0, -.12, -.03); nm = new THREE.MeshStandardMaterial({ color: c, roughness: .7 }); }
    if (!nm) return;
    if (m.side === THREE.DoubleSide) nm.side = THREE.DoubleSide;
    o.material = nm; o.castShadow = o.castShadow || o.geometry.type !== 'PlaneGeometry'; o.receiveShadow = true;
  });
  return root;
}
