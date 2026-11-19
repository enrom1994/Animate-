// The richer look: painted textures on every surface (wood, brick, plaster, tile, paint), soft warm light, and a bump from the same
// painting so grain, mortar and grout catch the light. Everything is drawn in code from a seed, so a set looks the same every frame.
import * as THREE from 'three';
const cache = new Map();
// a seeded random, so a texture is the same on every render
export const rng = s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
// a colour, nudged lighter or darker
const shade = (hex, k) => { const c = new THREE.Color(hex); c.offsetHSL(0, 0, k); return '#' + c.getHexString(); };
const mix = (a, b, u) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), u).getHexString();
function paint(key, w, h, draw) {
  if (cache.has(key)) return cache.get(key);
  const col = document.createElement('canvas'), bmp = document.createElement('canvas'); col.width = bmp.width = w; col.height = bmp.height = h;
  const g = col.getContext('2d'), b = bmp.getContext('2d'); b.fillStyle = '#808080'; b.fillRect(0, 0, w, h); draw(g, b, w, h);
  const map = new THREE.CanvasTexture(col), bump = new THREE.CanvasTexture(bmp); map.colorSpace = THREE.SRGBColorSpace;
  for (const t of [map, bump]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; }
  const r = { map, bump }; cache.set(key, r); return r;
}
// mottling: many soft low-alpha blobs, the "painted" unevenness every reference surface has
function mottle(g, w, h, r, col, n = 260, a = .06, size = .08) { for (let i = 0; i < n; i++) { const x = r() * w, y = r() * h, s = (.3 + r()) * size * w; const gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, col.replace('A', a * (.5 + r()))); gr.addColorStop(1, col.replace('A', 0)); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s); } }
// wooden planks: running the long way of the texture, each plank its own tone, grain lines, knots and dark gaps
export function woodTex(base = '#9a6a3f', { planks = 6, seed = 3, gap = .006 } = {}) {
  return paint(`wood${base}${planks}${seed}`, 1024, 1024, (g, b, w, h) => { const r = rng(seed * 997 + 1), ph = h / planks;
    for (let i = 0; i < planks; i++) { const y = i * ph, tone = shade(base, (r() - .5) * .09); g.fillStyle = tone; g.fillRect(0, y, w, ph);
      for (let k = 0; k < 26; k++) { const yy = y + r() * ph, amp = 2 + r() * 5, fr = .004 + r() * .01, ph0 = r() * 9; g.strokeStyle = `rgba(60,30,10,${.06 + r() * .1})`; g.lineWidth = 1 + r() * 2.5; g.beginPath(); for (let x = 0; x <= w; x += 16) g.lineTo(x, yy + Math.sin(x * fr + ph0) * amp); g.stroke(); }
      if (r() < .5) { const kx = r() * w, ky = y + ph * (.3 + r() * .4); g.fillStyle = 'rgba(70,35,15,.35)'; g.beginPath(); g.ellipse(kx, ky, 14 + r() * 10, 6 + r() * 4, 0, 0, 7); g.fill(); }
      const ends = [r() * w]; for (const ex of ends) { g.fillStyle = 'rgba(40,20,8,.55)'; g.fillRect(ex, y, 3, ph); b.fillStyle = '#404040'; b.fillRect(ex, y, 3, ph); }
      g.fillStyle = 'rgba(30,15,5,.7)'; g.fillRect(0, y, w, h * gap); b.fillStyle = '#303030'; b.fillRect(0, y, w, h * gap); g.fillStyle = 'rgba(255,230,190,.08)'; g.fillRect(0, y + h * gap, w, 3); }
    mottle(g, w, h, r, 'rgba(255,220,170,A)', 120, .05, .1); mottle(g, w, h, r, 'rgba(40,20,5,A)', 160, .05, .08); });
}
// brick: staggered rows, every brick its own colour, recessed mortar, chips and soot
export function brickTex(base = '#a8543a', { rows = 16, cols = 6, seed = 5, mortar = '#cfc2a8' } = {}) {
  return paint(`brick${base}${rows}${seed}`, 1024, 1024, (g, b, w, h) => { const r = rng(seed * 131 + 7), bh = h / rows, bw = w / cols, m = Math.max(3, bh * .12);
    g.fillStyle = mortar; g.fillRect(0, 0, w, h); b.fillStyle = '#383838'; b.fillRect(0, 0, w, h);
    for (let j = 0; j < rows; j++) for (let i = -1; i < cols + 1; i++) { const x = i * bw + (j % 2) * bw / 2, y = j * bh, tone = shade(mix(base, ['#8a3f2a', '#b86a45', '#7c4a3a', '#a35a3c'][Math.floor(r() * 4)], r() * .5), (r() - .5) * .08);
      g.fillStyle = tone; g.fillRect(x + m / 2, y + m / 2, bw - m, bh - m); b.fillStyle = `rgb(${170 + r() * 40},${170 + r() * 40},${170 + r() * 40})`; b.fillRect(x + m / 2, y + m / 2, bw - m, bh - m);
      g.fillStyle = 'rgba(255,220,180,.12)'; g.fillRect(x + m / 2, y + m / 2, bw - m, 3); g.fillStyle = 'rgba(30,10,5,.18)'; g.fillRect(x + m / 2, y + bh - m / 2 - 3, bw - m, 3);
      for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(${r() < .5 ? '40,15,8' : '230,190,150'},${.1 + r() * .15})`; g.fillRect(x + m + r() * (bw - 2 * m), y + m + r() * (bh - 2 * m), 2 + r() * 6, 2 + r() * 4); } }
    mottle(g, w, h, r, 'rgba(40,25,20,A)', 90, .07, .12); });
}
// plaster: a flat paint colour, mottled, with faint cracks, and a darker band where the wall meets the floor (the corner shadow)
export function plasterTex(base = '#e8dcc0', { seed = 9, grime = .5 } = {}) {
  return paint(`plaster${base}${seed}${grime}`, 1024, 1024, (g, b, w, h) => { const r = rng(seed * 71 + 3); g.fillStyle = base; g.fillRect(0, 0, w, h);
    mottle(g, w, h, r, 'rgba(255,250,235,A)', 160, .08, .12); mottle(g, w, h, r, 'rgba(120,90,60,A)', 200, .05 * grime + .02, .1);
    for (let k = 0; k < 5; k++) { let x = r() * w, y = r() * h; g.strokeStyle = 'rgba(90,70,50,.18)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 8; s++) { x += (r() - .5) * 40; y += r() * 30; g.lineTo(x, y); } g.stroke(); }
    for (let i = 0; i < 4000; i++) { const v = 110 + r() * 40; b.fillStyle = `rgb(${v},${v},${v})`; b.fillRect(r() * w, r() * h, 2, 2); } });
}
// square tiles with grout; every tile a touch different, a glaze highlight on each
export function tileTex(a = '#e9e4d6', c2 = null, { n = 8, seed = 2, grout = '#8f8676' } = {}) {
  return paint(`tile${a}${c2}${n}${seed}`, 1024, 1024, (g, b, w, h) => { const r = rng(seed * 37 + 11), s = w / n, gw = s * .06;
    g.fillStyle = grout; g.fillRect(0, 0, w, h); b.fillStyle = '#404040'; b.fillRect(0, 0, w, h);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const col = c2 && (i + j) % 2 ? c2 : a; g.fillStyle = shade(col, (r() - .5) * .05); g.fillRect(i * s + gw / 2, j * s + gw / 2, s - gw, s - gw); b.fillStyle = '#b0b0b0'; b.fillRect(i * s + gw / 2, j * s + gw / 2, s - gw, s - gw);
      const gr = g.createLinearGradient(i * s, j * s, i * s + s, j * s + s); gr.addColorStop(0, 'rgba(255,255,255,.18)'); gr.addColorStop(.5, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(i * s + gw / 2, j * s + gw / 2, s - gw, s - gw); } });
}
// painted wood (doors, frames, cabinets): a solid paint with brush streaks and worn edges
export function paintTex(base = '#3f6e5a', { seed = 4 } = {}) {
  return paint(`paint${base}${seed}`, 512, 512, (g, b, w, h) => { const r = rng(seed * 53 + 17); g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 140; k++) { const y = r() * h; g.strokeStyle = `rgba(${r() < .5 ? '255,255,255' : '0,0,0'},${.03 + r() * .04})`; g.lineWidth = 1 + r() * 3; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (r() - .5) * 8); g.stroke(); }
    mottle(g, w, h, r, 'rgba(60,40,20,A)', 60, .06, .1); });
}
// paving: big slabs or cobbles
export function stoneTex(base = '#b9ae9a', { n = 5, seed = 6, cobble = false } = {}) {
  return paint(`stone${base}${n}${seed}${cobble}`, 1024, 1024, (g, b, w, h) => { const r = rng(seed * 19 + 5), s = w / n; g.fillStyle = shade(base, -.18); g.fillRect(0, 0, w, h); b.fillStyle = '#3a3a3a'; b.fillRect(0, 0, w, h);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x = i * s + (cobble ? (j % 2) * s / 2 : 0), y = j * s, tone = shade(base, (r() - .5) * .1); g.fillStyle = tone; b.fillStyle = '#b8b8b8';
      if (cobble) { g.beginPath(); g.ellipse(x + s / 2, y + s / 2, s * .44, s * .4, r(), 0, 7); g.fill(); b.beginPath(); b.ellipse(x + s / 2, y + s / 2, s * .44, s * .4, 0, 0, 7); b.fill(); } else { g.fillRect(x + 3, y + 3, s - 6, s - 6); b.fillRect(x + 3, y + 3, s - 6, s - 6); } }
    mottle(g, w, h, r, 'rgba(50,40,30,A)', 150, .07, .1); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(${r() < .5 ? '0,0,0' : '255,255,255'},.08)`; g.fillRect(r() * w, r() * h, 2, 2); } });
}
// a material from a texture: repeat (u, v) tiles across the surface; bump strength from the same painting
export function mat({ map, bump }, rep = [1, 1], o = {}) {
  const m = map.clone(), bp = bump.clone(); m.repeat.set(...rep); bp.repeat.set(...rep); m.needsUpdate = bp.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ map: m, bumpMap: bp, bumpScale: o.bumpScale ?? 1.2, roughness: o.roughness ?? .85, metalness: o.metalness ?? 0, ...(o.extra || {}) });
}
export const solid = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.roughness ?? .7, metalness: o.metalness ?? 0, emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1 });
// a box with a material: uv repeat follows the box's size (rpm = repeats per metre), so a long wall doesn't stretch its bricks
export function slab(w, h, d, tex, rpm = 1, pos = [0, 0, 0], o = {}) {
  const geo = new THREE.BoxGeometry(w, h, d), uv = geo.attributes.uv, nrm = geo.attributes.normal;
  for (let i = 0; i < uv.count; i++) { const nx = Math.abs(nrm.getX(i)), ny = Math.abs(nrm.getY(i)), [a, b] = nx > .5 ? [d, h] : ny > .5 ? [w, d] : [w, h]; uv.setXY(i, uv.getX(i) * a * rpm, uv.getY(i) * b * rpm); }
  const m = new THREE.Mesh(geo, tex.isMaterial ? tex : mat(tex, [1, 1], o)); m.position.set(...pos); m.castShadow = m.receiveShadow = true; return m;
}
export const part = (geo, material, pos = [0, 0, 0]) => { const m = new THREE.Mesh(geo, material); m.position.set(...pos); m.castShadow = m.receiveShadow = true; return m; };
// a sky that fades from the zenith colour to a warm horizon
export function skyTex(top = '#7fb2d8', hor = '#f3d9b0') { const c = document.createElement('canvas'); c.width = 4; c.height = 512; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, top); gr.addColorStop(.75, hor); gr.addColorStop(1, hor); g.fillStyle = gr; g.fillRect(0, 0, 4, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
// the light: a warm low sun with soft wide shadows, a cool sky fill and a warm bounce from below
export function richStage({ sky = skyTex(), sun = [6, 9, 5], key = 2.6, fill = 1.1, shadow = 10, keyCol = 0xffe2b8 } = {}) {
  const scene = new THREE.Scene(); scene.background = sky;
  scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x8a6a4a, fill));
  const k = new THREE.DirectionalLight(keyCol, key); k.position.set(...sun); k.castShadow = true; k.shadow.mapSize.set(2048, 2048);
  const c = k.shadow.camera; c.left = c.bottom = -shadow; c.right = c.top = shadow; c.near = .5; c.far = 80; k.shadow.bias = -.0004; k.shadow.normalBias = .03; k.shadow.radius = 6; k.shadow.blurSamples = 16;
  scene.add(k, k.target); scene.userData.key = k; return scene;
}

// a sash window with a stone sill and lintel, glass that catches the sky, and louvred shutters either side
export function windowUnit(w, h, frameTex, shutter = '#3f6b55') { const G = new THREE.Group(), f = mat(frameTex, [1, 1]), stone = stoneTex('#d9cdb5', { n: 2 });
  G.add(slab(w, h, .02, glassMat(), 1, [0, 0, -.03]));
  for (const [ww, hh, x, y] of [[w + .24, .12, 0, h / 2 + .06], [w + .24, .12, 0, -h / 2 - .06], [.12, h, -w / 2 - .06, 0], [.12, h, w / 2 + .06, 0], [.06, h, 0, 0], [w, .06, 0, h * .12]]) G.add(slab(ww, hh, .12, f, 1, [x, y, 0]));
  G.add(slab(w + .4, .12, .28, stone, 1, [0, -h / 2 - .12, .06]), slab(w + .3, .14, .12, stone, 1, [0, h / 2 + .15, .02]));
  const sh = paintTex(shutter, { seed: 7 }), dark = new THREE.Color(shutter).multiplyScalar(.75).getHex();
  for (const s of [-1, 1]) { G.add(slab(w * .5, h, .03, sh, 1, [s * (w * .75 + .12), 0, .02])); for (let k = 0; k < 7; k++) G.add(slab(w * .46, .015, .03, solid(dark), 1, [s * (w * .75 + .12), -h / 2 + (k + .5) * h / 7, .04])); }
  return G; }

// window glass you can read as glass at phone size: deep blue-grey, the sky caught in a pale diagonal streak, a curtain edge inside
let GLASS = null;
export function glassMat() { if (GLASS) return GLASS; const c = document.createElement('canvas'); c.width = 128; c.height = 128; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#5f7f99'); gr.addColorStop(1, '#2b3b4c'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  g.fillStyle = 'rgba(214,232,245,.45)'; g.beginPath(); g.moveTo(20, 0); g.lineTo(52, 0); g.lineTo(12, 128); g.lineTo(-20, 128); g.fill(); g.fillStyle = 'rgba(214,232,245,.25)'; g.beginPath(); g.moveTo(64, 0); g.lineTo(74, 0); g.lineTo(34, 128); g.lineTo(24, 128); g.fill();
  g.fillStyle = 'rgba(232,214,176,.55)'; g.fillRect(104, 0, 24, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; GLASS = new THREE.MeshStandardMaterial({ map: t, roughness: .2, metalness: .2, emissive: 0x1a2430, emissiveIntensity: .3 }); return GLASS; }
// asphalt: dark grey, a fine speckle of stone, worn patches and a few tar seams
export function asphaltTex(base = '#55534f', { seed = 12 } = {}) {
  return paint(`asphalt${base}${seed}`, 1024, 1024, (g, b, w, h) => { const r = rng(seed * 29 + 3); g.fillStyle = base; g.fillRect(0, 0, w, h);
    mottle(g, w, h, r, 'rgba(120,115,105,A)', 120, .1, .15); mottle(g, w, h, r, 'rgba(20,20,20,A)', 90, .1, .12);
    for (let i = 0; i < 26000; i++) { const v = r() < .5 ? 40 + r() * 30 : 130 + r() * 60; g.fillStyle = `rgba(${v},${v - 4},${v - 10},.55)`; g.fillRect(r() * w, r() * h, 2, 2); b.fillStyle = `rgb(${100 + r() * 60},${100 + r() * 60},${100 + r() * 60})`; b.fillRect(r() * w, r() * h, 2, 2); }
    for (let k = 0; k < 4; k++) { let x = r() * w, y = 0; g.strokeStyle = 'rgba(15,15,15,.6)'; g.lineWidth = 3 + r() * 3; g.beginPath(); g.moveTo(x, y); while (y < h) { x += (r() - .5) * 30; y += 30; g.lineTo(x, y); } g.stroke(); } });
}
// wallpaper: soft vertical stripes with a small leaf in every other band
export function wallpaperTex(a = '#efe2c2', b2 = '#d9cba3', { seed = 3 } = {}) {
  return paint(`paper${a}${b2}${seed}`, 512, 512, (g, b, w, h) => { const r = rng(seed * 41 + 9), n = 8, sw = w / n;
    for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b2 : a; g.fillRect(i * sw, 0, sw + 1, h); if (i % 2 === 0) for (let j = 0; j < 4; j++) { const x = i * sw + sw / 2, y = (j + .5) * h / 4; g.fillStyle = 'rgba(110,130,90,.45)'; g.beginPath(); g.ellipse(x - 5, y, 5, 11, -.5, 0, 7); g.ellipse(x + 5, y + 4, 5, 11, .5, 0, 7); g.fill(); } }
    mottle(g, w, h, r, 'rgba(120,90,60,A)', 80, .04, .12); });
}
// a coir door mat: rough brown fibre in rows, a darker border
export function coirTex() {
  return paint('coir', 512, 320, (g, b, w, h) => { const r = rng(77); g.fillStyle = '#8a6a42'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { g.strokeStyle = `rgba(${r() < .5 ? '60,40,20' : '190,150,100'},.35)`; g.lineWidth = 1.5; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 6, y + 6); g.stroke(); }
    g.strokeStyle = '#4a3420'; g.lineWidth = 26; g.strokeRect(13, 13, w - 26, h - 26); });
}
// sand: warm grains, faint ripples left by the wind, the odd shell and pebble
export function sandTex(base = '#e8cf98', { seed = 14, wet = false } = {}) {
  return paint(`sand${base}${seed}${wet}`, 1024, 1024, (g, b, w, h) => { const r = rng(seed * 61 + 5); g.fillStyle = base; g.fillRect(0, 0, w, h);
    mottle(g, w, h, r, 'rgba(255,240,205,A)', 140, .08, .14); mottle(g, w, h, r, 'rgba(150,110,60,A)', 140, wet ? .1 : .05, .12);
    for (let k = 0; k < 26; k++) { const y0 = r() * h, amp = 6 + r() * 8; g.strokeStyle = `rgba(150,110,60,${wet ? .05 : .12})`; g.lineWidth = 3; g.beginPath(); for (let x = 0; x <= w; x += 12) g.lineTo(x, y0 + Math.sin(x * .02 + k) * amp); g.stroke(); }
    for (let i = 0; i < 30000; i++) { const v = r(); g.fillStyle = v < .5 ? 'rgba(120,85,45,.3)' : 'rgba(255,248,225,.45)'; g.fillRect(r() * w, r() * h, 2, 2); b.fillStyle = `rgb(${110 + r() * 60},${110 + r() * 60},${110 + r() * 60})`; b.fillRect(r() * w, r() * h, 2, 2); }
    if (!wet) for (let i = 0; i < 18; i++) { const x = r() * w, y = r() * h; g.fillStyle = ['#f3e6d0', '#d9b8a0', '#9a8f84'][i % 3]; g.beginPath(); g.ellipse(x, y, 4 + r() * 5, 3 + r() * 3, r() * 3, 0, 7); g.fill(); } });
}
