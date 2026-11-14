// Toon building blocks: three-step shading, simple solids, canvas-painted labels.
import * as THREE from 'three';

const ramp = (() => { const d = new Uint8Array([120, 120, 120, 255, 200, 200, 200, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
export const toon = (color, o = {}) => new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...o });
export const flat = (color, o = {}) => new THREE.MeshBasicMaterial({ color, ...o });
const sh = m => { m.castShadow = true; m.receiveShadow = true; return m; };
export const box = (w, h, d, color, pos = [0, 0, 0]) => { const m = sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(color))); m.position.set(...pos); return m; };
export const cyl = (r0, r1, h, color, pos = [0, 0, 0], seg = 16) => { const m = sh(new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), toon(color))); m.position.set(...pos); return m; };
export const ball = (r, color, pos = [0, 0, 0], scale = [1, 1, 1]) => { const m = sh(new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), toon(color))); m.position.set(...pos); m.scale.set(...scale); return m; };
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
// a painted board: text or a drawing lives on an object in the scene, not floating over it
export function board(w, h, draw, res = 256) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: canvasTex(Math.round(w * res), Math.round(h * res), draw) }));
  m.userData.noInk = false; return m;
}
export function stage({ sky = 0x6ec6f5, sun = [-4, 7, 5], shadow = 9, hemi = 1.5, key: keyI = 2.4, ground = 0xd8c8a8 } = {}) {   // hemi and key: lower them for a storm or a night
  const scene = new THREE.Scene(); scene.background = new THREE.Color(sky);
  scene.add(new THREE.HemisphereLight(0xffffff, ground, hemi));
  const key = new THREE.DirectionalLight(0xfff4dd, keyI); key.position.set(...sun); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  const c = key.shadow.camera; c.left = c.bottom = -shadow; c.right = c.top = shadow; c.near = .5; c.far = 40; key.shadow.bias = -.0005; key.shadow.normalBias = .03; key.shadow.radius = 2;
  scene.add(key, key.target); scene.userData.key = key; return scene;
}
// anti: a small wind-up the wrong way before the move, then a slight overshoot and settle (anticipation, action, recovery)
export const ease = { anti: u => { const c = 1.9; return u < .5 ? (Math.pow(2 * u, 2) * ((c + 1) * 2 * u - c)) / 2 : (Math.pow(2 * u - 2, 2) * ((c + 1) * (u * 2 - 2) + c) + 2) / 2; }, io: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2, out: u => 1 - Math.pow(1 - u, 3), in: u => u * u * u };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const pr = (t, a, b) => clamp((t - a) / (b - a));
export const lerp = (a, b, u) => a + (b - a) * u;
