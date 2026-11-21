// edit.js — the shared editing kit of the money films: easing, the camera rig, story cards and stamps, split screens, blur.
// Every film imports it (never a copy), so a fix here reaches every episode. setupEdit(canvas) once, after the canvas exists.
import { AUDIT, g, push, pop, translate, scale, shape, rr, text } from './toon.js';
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), io = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2, pr = (t, a, b) => clamp((t - a) / (b - a)),
  mix = (a, b, u) => a + (b - a) * u, mix3 = (a, b, u) => a.map((v, i) => mix(v, b[i], u)), ss = u => u * u * (3 - 2 * u), lmix = (a, b, u) => a * Math.pow(b / a, u), back = u => 1 + 2.7 * Math.pow(u - 1, 3) + 1.7 * Math.pow(u - 1, 2);
export const money = n => '$' + Math.round(n).toLocaleString('en-US');
// ---- the camera: a look point, its distance L, how much it looks down, the lens F (px per metre at 1 m) ----
export const camOf = ({ look, L, down, F }) => ({ pitch: Math.PI / 2 - down, P: F / L, dist: L, cx: look[0], cy: look[1], cz: look[2] });
export const push_ = (st, u, L1) => ({ ...st, L: lmix(st.L, L1, u) });
export const pop_ = (t, t0, d = .35) => back(clamp((t - t0) / d)) * (t >= t0 ? 1 : 0);   // a card springs in
// ---- story cards: a rounded card with a small heading and a big figure, pinned to a point on screen ----
export const textW = (str, font) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = font; const w = g.measureText(str).width; g.restore(); return w; };
export const fitW = (w, ...items) => Math.max(w, ...items.map(([str, font, px]) => textW(str, font) + 2 * Math.max(30, px * .45)));   // a box never narrower than its text plus a margin
export function card(x, y, head, big, { col = '#2e1d1c', w = 520, bigPx = 96, s = 1 } = {}) {
  if (s <= .01) return; w = fitW(w, [head, '800 40px Cap', 40], [big, `800 ${bigPx}px Cap`, bigPx]); push(); translate(x, y); scale(s);
  shape(rr(-w / 2, -95, w, 190, 28), { fill: '#fbf6ea', lw: 8 });
  text(head, 0, -46, { font: '800 40px Cap', fill: '#6b5a4a' }); text(big, 0, 26, { font: `800 ${bigPx}px Cap`, fill: col }); pop(); }
export function stamp(x, y, word, s = 1, { col = '#b8302a', px = 76 } = {}) { if (s <= .01) return; const w = fitW(460, [word, `800 ${px}px Cap`, px]); push(); translate(x, y); scale(s); shape(rr(-w / 2, -62, w, 124, 16), { fill: '#fbf6ea', lw: 10, line: col }); text(word, 0, 4, { font: `800 ${px}px Cap`, fill: col }); pop(); }
export function banner(x, y, str, s = 1, { px = 84, fill = '#ffd23f', col = '#2e1d1c', w = 600 } = {}) { if (s <= .01) return; push(); translate(x, y); scale(s); const bw = fitW(w, [str, `800 ${px}px Cap`, px]); shape(rr(-bw / 2, -92, bw, 184, 30), { fill, lw: 10 }); text(str, 0, 4, { font: `800 ${px}px Cap`, fill: col }); pop(); }
// ---- split screens: render a shot full frame, keep its middle band ----
let cv = null, half = null, hg = null;
export function setupEdit(canvas) { cv = canvas; half = document.createElement('canvas'); half.width = 1080; half.height = 1920; hg = half.getContext('2d'); }
export function renderHalf(drawFull, top, layer) {
  const n0 = AUDIT.log.length; drawFull();
  for (const e of AUDIT.log.slice(n0)) { e.bb = [e.bb[0], e.bb[1] + (top ? -480 : 480), e.bb[2], e.bb[3] + (top ? -480 : 480)]; e.clip = top ? [0, 0, 1080, 960] : [0, 960, 1080, 1920]; e.layer = layer;
    if (e.bb[3] < e.clip[1] || e.bb[1] > e.clip[3]) e.drop = true; }
  AUDIT.log = AUDIT.log.filter(e => !e.drop);
  hg.drawImage(cv, 0, 480, 1080, 960, 0, top ? 0 : 960, 1080, 960);
}
export function split(t, drawTop, drawBottom, { reveal = 1 } = {}) {   // reveal: how far the bottom half has wiped up
  renderHalf(drawTop, true, 'top'); renderHalf(drawBottom, false, 'bottom');
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(half, 0, 0, 1080, 960, 0, 0, 1080, 960);
  const y = mix(1920, 960, ss(reveal)); g.drawImage(half, 0, 960, 1080, 960, 0, y, 1080, 960);
  g.fillStyle = '#1d1a26'; g.fillRect(0, y - 6, 1080, 12);
}
export function expandBottom(u, drawTop, drawFull) {   // the bottom half grows to fill the frame, pushing the top half up and out
  renderHalf(drawTop, true, 'top'); const n0 = AUDIT.log.length; drawFull(); const edge = mix(960, 0, ss(u));
  for (const e of AUDIT.log.slice(n0)) e.layer = 'full';
  for (const e of AUDIT.log) if (e.layer === 'top') { e.bb = [e.bb[0], e.bb[1] - (960 - edge), e.bb[2], e.bb[3] - (960 - edge)]; e.clip = [0, 0, 1080, edge]; }
  if (edge > 1) { g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(half, 0, 960 - edge, 1080, edge, 0, 0, 1080, edge); g.fillStyle = '#1d1a26'; g.fillRect(0, edge - 6, 1080, 12); }
}
export function blurPan(px) { if (px < .5) return; hg.drawImage(cv, 0, 0); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = `blur(${px}px)`; g.drawImage(half, 0, 0); g.filter = 'none'; }
export function veil(a, col = '#141b30') { if (a <= 0) return; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, 1080, 1920); g.globalAlpha = 1; }
