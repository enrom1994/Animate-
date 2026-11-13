// What every film shares: painted decals, the pop-in, and the director that gives each shot its camera life.
import * as THREE from 'three';
import { canvasTex, clamp } from './toon.js';
export const INK = '#1d1a26';
// a picture painted on a surface (the floor, the water): its ink line is in the drawing
export function decal(w, d, draw, res = 96) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: canvasTex(Math.round(w * res), Math.round(d * res), draw), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
  m.rotation.x = -Math.PI / 2; m.position.y = .09; m.userData.noInk = true; m.renderOrder = 2; return m;
}
// a flat picture that stands up and turns to the lens (flames, smoke, marks)
export function card(w, h, draw, res = 500) {   // solid where it is painted: it hides what is behind it and takes the scene's ink line
  const tex = canvasTex(Math.round(w * res), Math.round(h * res), draw), m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: .5 }));
  m.userData.nmat = new THREE.MeshBasicMaterial({ map: tex, alphaTest: .5, color: 0x8080ff }); return m;
}
export function arrowPath(g, w, h) { g.beginPath(); g.moveTo(w / 2, h * .06); g.lineTo(w * .94, h * .5); g.lineTo(w * .68, h * .5); g.lineTo(w * .68, h * .94); g.lineTo(w * .32, h * .94); g.lineTo(w * .32, h * .5); g.lineTo(w * .06, h * .5); g.closePath(); }
export const arrowDraw = fill => (g, w, h) => { g.lineJoin = 'round'; arrowPath(g, w, h); g.fillStyle = fill; g.fill(); g.strokeStyle = INK; g.lineWidth = w * .07; g.stroke(); };
// overshoot, then settle
export const pop = (o, u, s = 1) => { const k = u <= 0 ? 0 : u >= 1 ? 1 : 1 + 2.2 * Math.pow(u - 1, 3) + 1.2 * Math.pow(u - 1, 2); o.visible = u > 0; o.scale.setScalar(Math.max(.001, k * s)); };
// the base of a world: actors and props that a shot switches on, a camera, and a per-frame reset
export function worldKit(scene, camera, actors, props, perFrame = () => {}) {
  for (const k in actors) scene.add(actors[k].group);
  return { scene, camera, A: actors, props, pop,
    reset(t) { perFrame(t); for (const k in props) props[k].visible = false; for (const k in actors) { actors[k].group.visible = false; actors[k].group.rotation.set(0, 0, 0); } },
    cam(pos, look, fov = 40) { camera.fov = fov; camera.position.set(...pos); camera.up.set(0, 1, 0); camera.lookAt(...look); },
    act(name, x, z, pose, full = false, y = 0) { const a = actors[name]; a.group.visible = true; a.group.position.set(x, y, z); a.set(pose, camera); if (full) a.group.quaternion.copy(camera.quaternion); } };
}
// director: shot(start, end, fn) collects the edit; SHOTS() wraps every shot with a settle after the cut, a handheld drift and the shakes
export function director(makeWorld, SHAKES = []) {
  let Wd; const W = () => Wd || (Wd = makeWorld()), SH = [];
  return { shot: (a, b, fn) => SH.push([a, b, fn]),
    SHOTS: () => SH.map(([start, end, fn]) => ({ start, end, build: () => { const w = W(); return { scene: w.scene, camera: w.camera, update: (lt, t) => { w.reset(t); const r = fn(lt, t, clamp(lt / (end - start)), w) || {}, c = w.camera, d = r.focus || 6;
      c.translateZ(d * .09 * Math.pow(1 - clamp(lt / .32), 3));
      c.translateX(Math.sin(t * 1.7) * d * .006); c.translateY(Math.sin(t * 2.3 + 1) * d * .005); c.rotateZ(Math.sin(t * 1.3) * .007);
      for (const [ts, amp] of SHAKES) { const dt = t - ts; if (dt >= 0 && dt < .4) { const a = amp * Math.pow(1 - dt / .4, 2); c.rotateZ(Math.sin(dt * 70) * a); c.rotateX(Math.sin(dt * 55 + 1) * a * .6); } }
      return r; } }; } })) };
}
