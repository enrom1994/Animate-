// The prop engine. Every prop is a small 3D model in metres (y up, z toward the viewer at yaw 0), drawn in the toon line
// from any camera: front-on, three-quarter, high oblique, top-down. One model, every angle, always the right size.
// A model is a list of faces: { pts: [[x, y, z], ...] (counter-clockwise seen from outside), col, line?, glow? }.
import { shape, fillOnly, stroke, dot, text } from '../toon.js';
// ---- the camera: yaw turns the world about the vertical, pitch tips it toward the viewer (0 = level, PI/2 = straight down) ----
export const CAM = { yaw: 0, pitch: .5, P: 100, ox: 540, oy: 960, cx: 0, cy: 0, cz: 0 };
export function view(o) { Object.assign(CAM, o); }
// world -> [screen x, screen y, depth]; depth grows away from the viewer
export function proj(x, y, z) {
  const c = Math.cos(CAM.yaw), s = Math.sin(CAM.yaw), dx = x - CAM.cx, dy = y - CAM.cy, dz = z - CAM.cz;
  const xr = dx * c - dz * s, zr = dx * s + dz * c, cp = Math.cos(CAM.pitch), sp = Math.sin(CAM.pitch);
  return [CAM.ox + xr * CAM.P, CAM.oy + (zr * sp - dy * cp) * CAM.P, -(zr * cp + dy * sp)];
}
// the light: from the upper left, a little toward the viewer. A face is lit or in shadow (toon: two tones, no gradient)
const L = (() => { const v = [-.45, .8, .4], n = Math.hypot(...v); return v.map(a => a / n); })();
const shadeCol = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = c => Math.round(c * k); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
const normal = p => { const [a, b, c] = p; const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]; const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], l = Math.hypot(...n) || 1; return n.map(a => a / l); };
// ---- drawing: transform the model, cull the faces turned away, sort far to near, draw each in the toon line ----
// at: [x, y, z] position; rot: yaw of the model itself
export function draw(model, at = [0, 0, 0], rot = 0, { lw = 4, boil = .35 } = {}) {
  const c = Math.cos(rot), s = Math.sin(rot), F = [], cp = Math.cos(CAM.pitch), sp = Math.sin(CAM.pitch);
  const toCam = [cp * Math.sin(CAM.yaw), sp, cp * Math.cos(CAM.yaw)];   // world direction toward the viewer
  const W = f => f.pts.map(([x, y, z]) => [at[0] + x * c + z * s, at[1] + y, at[2] - x * s + z * c]);
  // each part's centre, so every face's normal can be pointed outward whatever order its corners were listed in
  const parts = new Map(); for (const f of model) { const w = W(f), k = f.part ?? 0, a = parts.get(k) || [0, 0, 0, 0]; for (const p of w) { a[0] += p[0]; a[1] += p[1]; a[2] += p[2]; a[3]++; } parts.set(k, a); }
  for (const f of model) { const w = W(f), a = parts.get(f.part ?? 0), pc = [a[0] / a[3], a[1] / a[3], a[2] / a[3]];
    const fc = w.reduce((m, p) => [m[0] + p[0] / w.length, m[1] + p[1] / w.length, m[2] + p[2] / w.length], [0, 0, 0]);
    let n; if (f.n) n = [f.n[0] * c + f.n[2] * s, f.n[1], -f.n[0] * s + f.n[2] * c];   // a panel says which way it faces
    else { n = normal(w); if (n[0] * (fc[0] - pc[0]) + n[1] * (fc[1] - pc[1]) + n[2] * (fc[2] - pc[2]) < 0) n = n.map(v => -v); }
    if (!f.twoSided && n[0] * toCam[0] + n[1] * toCam[1] + n[2] * toCam[2] <= 1e-4) continue;   // turned away from the viewer
    const P = w.map(p => proj(...p)), lit = n[0] * L[0] + n[1] * L[1] + n[2] * L[2];
    F.push({ P, d: P.reduce((m, p) => m + p[2], 0) / P.length - (f.bias || 0), col: f.glow ? f.col : shadeCol(f.col, lit > .15 ? 1 : lit > -.3 ? .84 : .7), f }); }
  // order: parts first. A part that rests on top of another (its bottom at or above the other's top, footprints overlapping)
  // always draws after it; otherwise the farther part draws first. Panels belong to the part they sit on and draw just after its faces.
  const B = new Map(); for (const f of model) { if ((f.part ?? 0) < 0) continue; const w = W(f), k = f.part ?? 0, b = B.get(k) || [1e9, 1e9, 1e9, -1e9, -1e9, -1e9]; for (const p of w) for (let a = 0; a < 3; a++) { b[a] = Math.min(b[a], p[a]); b[a + 3] = Math.max(b[a + 3], p[a]); } B.set(k, b); }
  const owner = f => { const w = W(f), fc = w.reduce((m, p) => [m[0] + p[0] / w.length, m[1] + p[1] / w.length, m[2] + p[2] / w.length], [0, 0, 0]); let best = 0, bd = 1e9;
    for (const [k, b] of B) { const dx = Math.max(b[0] - fc[0], 0, fc[0] - b[3]), dy = Math.max(b[1] - fc[1], 0, fc[1] - b[4]), dz = Math.max(b[2] - fc[2], 0, fc[2] - b[5]), d = dx + dy + dz + (b[3] - b[0] + b[4] - b[1] + b[5] - b[2]) * 1e-3; if (d < bd) { bd = d; best = k; } } return best; };
  for (const e of F) e.k = (e.f.part ?? 0) < 0 ? owner(e.f) : (e.f.part ?? 0);
  const keys = [...new Set(F.map(e => e.k))], cdep = k => { const b = B.get(k); return b ? proj((b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2)[2] : 0; };
  const over = (a, b) => { const A = B.get(a), C = B.get(b); return A && C && A[1] >= C[4] - .02 && A[0] < C[3] && A[3] > C[0] && A[2] < C[5] && A[5] > C[2]; };
  keys.sort((a, b) => cdep(b) - cdep(a));
  for (let changed = true, n = 0; changed && n < 50; n++) { changed = false; for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) if (over(keys[i], keys[j])) { const [x] = keys.splice(i, 1); keys.splice(j, 0, x); changed = true; } }
  const rank = new Map(keys.map((k, i) => [k, i]));
  F.sort((a, b) => rank.get(a.k) - rank.get(b.k) || ((a.f.part ?? 0) < 0) - ((b.f.part ?? 0) < 0) || b.d - a.d);
  for (const { P, col, f } of F) shape(P.map(p => [p[0], p[1]]), { fill: col, lw: f.lw ?? lw, line: f.line, boil });
  return F.length;
}
let PART = 1; const tag = faces => { const id = PART++; for (const f of faces) f.part = id; return faces; };
// ---- building blocks ----
const faceQuad = (a, b, c, d, col, o = {}) => ({ pts: [a, b, c, d], col, ...o });
// an axis box from (x0, y0, z0) to (x1, y1, z1)
export function box(x0, y0, z0, x1, y1, z1, col, o = {}) {
  const v = (x, y, z) => [x, y, z], cols = typeof col === 'string' ? { all: col } : col, C = k => cols[k] || cols.all;
  return tag([faceQuad(v(x0, y0, z1), v(x1, y0, z1), v(x1, y1, z1), v(x0, y1, z1), C('front'), o),   // +z
    faceQuad(v(x1, y0, z0), v(x0, y0, z0), v(x0, y1, z0), v(x1, y1, z0), C('back'), o),           // -z
    faceQuad(v(x1, y0, z1), v(x1, y0, z0), v(x1, y1, z0), v(x1, y1, z1), C('right'), o),          // +x
    faceQuad(v(x0, y0, z0), v(x0, y0, z1), v(x0, y1, z1), v(x0, y1, z0), C('left'), o),           // -x
    faceQuad(v(x0, y1, z1), v(x1, y1, z1), v(x1, y1, z0), v(x0, y1, z0), C('top'), o),            // +y
    faceQuad(v(x0, y0, z0), v(x1, y0, z0), v(x1, y0, z1), v(x0, y0, z1), C('bottom'), o)]);        // -y
}
// a side profile [[x, y], ...] (counter-clockwise seen from +z) extruded from z0 to z1; segCol(i) colours the band between point i and i+1
export function extrude(profile, z0, z1, col, segCol = () => null, o = {}) {
  const n = profile.length, out = [];
  out.push({ pts: profile.map(([x, y]) => [x, y, z1]), col, ...o });                         // the near side
  out.push({ pts: profile.slice().reverse().map(([x, y]) => [x, y, z0]), col, ...o });       // the far side
  for (let i = 0; i < n; i++) { const [ax, ay] = profile[i], [bx, by] = profile[(i + 1) % n]; out.push({ pts: [[bx, by, z1], [ax, ay, z1], [ax, ay, z0], [bx, by, z0]], col: segCol(i) || col, ...o }); }
  return tag(out);
}
// a cylinder along an axis ('x', 'y' or 'z'), centre c, radius r, from a0 to a1 along that axis
export function cyl(axis, c, r, a0, a1, col, n = 14, o = {}) {
  const ring = a => Array.from({ length: n }, (_, i) => { const t = i / n * Math.PI * 2, u = Math.cos(t) * r, w = Math.sin(t) * r;
    return axis === 'z' ? [c[0] + u, c[1] + w, a] : axis === 'x' ? [a, c[1] + w, c[2] + u] : [c[0] + u, a, c[2] + w]; });
  const A = ring(a0), B = ring(a1), out = [{ pts: B, col, ...o }, { pts: A.slice().reverse(), col, ...o }];
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; out.push({ pts: [A[j], A[i], B[i], B[j]], col, ...o, lw: o.lw ?? 2 }); }
  return tag(out);
}
// a flat panel facing +z at depth z (a window, a screen, a label area): offset a hair outward so it sits on the surface
export const panel = (x0, y0, x1, y1, z, col, o = {}) => ({ part: -1, bias: .02, twoSided: false, n: [0, 0, 1], pts: [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], col, ...o });
export const panelX = (z0, y0, z1, y1, x, col, o = {}) => ({ part: -2, bias: .02, n: [1, 0, 0], pts: [[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]], col, ...o });   // facing +x
