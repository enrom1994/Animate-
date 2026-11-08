// "Egypt: one river" — Satellite Briefing long form, 16:9, 30 fps. One page renders one chapter (?ch=N); film.sh stitches them.
// Every time is anchored to a narration line (timing.json from tools/timing.py), so re-recording a line moves its picture with it.
import { makeCamera, project, unproject } from './engine.js';
import { clamp, lerp, track } from '/core/lib.js';
export const W = 1920, H = 1080;
const pr = (t, a, b) => clamp((t - a) / (b - a));
const eo = x => 1 - Math.pow(1 - clamp(x), 3);
const back = (x, s = 2.2) => { x = clamp(x) - 1; return 1 + x * x * ((s + 1) * x + s); };
const EGB = [24.0, 21.0, 37.0, 32.5];
export const PLATES = {
  qena: [32.30, 25.70, 33.05, 26.35], cairo: [30.95, 29.85, 31.55, 30.25], capital: [31.60, 29.93, 31.90, 30.10],
  rosetta: [30.20, 31.36, 30.50, 31.56], toshka: [30.40, 22.55, 31.70, 23.45],
};
const M = { lat: 26.05735, lon0: 32.7521, lon1: 32.8361 };                  // Qena transect (egypt-nile/assets/measure.json)
const RT = { tip72: [31.5044, 30.3567], now: [31.4651, 30.3628] };          // Rosetta (assets/measure.json)
const DAM = [23.97, 32.88], CAIRO = [30.044, 31.236], CAPITAL = [30.035, 31.77], FARMS = [23.13, 31.50], TOSHKA = [23.0, 30.95];
// which plates each chapter loads into the two detail slots: [A, B, overlay]
export const CH_PLATES = {
  0: [], 1: [['qena', 'qena', null]], 2: [['qena', 'qena', null]], 3: [['rosetta_1973', 'rosetta_2025', 'rosetta_1972_outline']],
  4: [['cairo_1984', 'cairo_2025', 'cairo_built_overlay']], 5: [['capital_2015', 'capital_2025', null], ['toshka_2002', 'toshka_2021', null]], 6: [],
};
const SLOT_BB = { 1: ['qena'], 2: ['qena'], 3: ['rosetta'], 4: ['cairo'], 5: ['capital', 'toshka'] };

let C, at, camT, DUR;
export let SUBS = [];
export function setup(timing, ch, g) {
  C = timing[ch]; DUR = C.dur;
  at = (id, f = 0, o = 0) => { const L = C.lines.find(l => l.id === id); if (!L) throw new Error('no line ' + id); return L.t + L.d * f + o; };
  const K = (t, lat, lon, d, tilt = 0, hd = 0, sy = 0) => [t, [lat, lon, Math.log10(d), tilt, hd, sy]];
  const keys = {
    0: () => [K(0, 23.5, 21.0, 14000, 32, 12), K(at('c0b'), 26.2, 29.5, 6400, 16, 4), K(at('c0d'), 26.8, 30.8, 3300, 4, 0), K(DUR, 26.8, 30.8, 3050, 0, 0)],
    1: () => [K(0, 26.8, 30.6, 3000), K(at('c1e'), 26.6, 31.0, 2750), K(at('c1f', .1), 26.4, 31.9, 1400), K(at('c1f', .95), M.lat, (M.lon0 + M.lon1) / 2, 40),
        K(DUR, M.lat, (M.lon0 + M.lon1) / 2, 36)],
    2: () => [K(0, 26.1, 32.6, 900), K(at('c2d', 1), 25.9, 32.7, 700), K(at('c2e', .7), DAM[0], DAM[1], 260, 20, 10), K(at('c2f', .5), 22.9, 32.1, 1500, 10, 0),
        K(at('c2h', 1), 23.2, 32.4, 1300), K(DUR, 29.0, 31.4, 2400)],
    3: () => [K(0, 30.9, 31.0, 1100), K(at('c3a', .9), 31.468, 30.355, 25), K(at('c3g'), 31.47, 30.355, 23), K(at('c3g', .8), 31.0, 31.0, 900), K(DUR, 31.0, 31.0, 820)],
    4: () => [K(0, 30.7, 31.1, 1100), K(at('c4c', .4), 30.3, 31.2, 500), K(at('c4d', .3), 30.05, 31.25, 50), K(at('c4h'), 30.05, 31.25, 47), K(DUR, 30.05, 31.25, 46)],
    5: () => [K(0, 30.05, 31.45, 450), K(at('c5b'), 30.015, 31.75, 25), K(at('c5c2', 1), 30.015, 31.75, 23), K(at('c5d', .9), 24.0, 31.6, 1600), K(at('c5e'), 23.0, 31.22, 98),
        K(DUR, 23.0, 31.22, 92)],
    6: () => [K(0, 25.5, 31.0, 2600), K(at('c6b'), 26.5, 31.0, 6000, 18), K(DUR, 26.8, 31.0, 9500, 26, 4)],
  }[ch]();
  camT = track(keys);
  buildSubs(g);
}
export const dur = () => DUR;
export function cameraAt(t) { const [lat, lon, ld, tilt, heading, sy] = camT(t); return makeCamera({ lat, lon, d: Math.pow(10, ld), tilt, heading, fov: 32, sy }, W, H); }

function buildSubs(g) {
  g.font = '400 40px Barlow'; const MAX = 1500; SUBS = [];
  C.lines.forEach((L, i) => {
    const end = Math.min((C.lines[i + 1]?.t ?? DUR) - .15, Math.max(L.t + 1.8, L.t + L.d + .6));
    if (g.measureText(L.text).width <= MAX) { SUBS.push({ t0: L.t - .05, t1: end, text: L.text }); return; }
    const cut = [...L.text.matchAll(/[,.] /g)].map(m => m.index + 1), mid = L.text.length / 2;
    const c = cut.length ? cut.reduce((a, b) => Math.abs(b - mid) < Math.abs(a - mid) ? b : a) : L.text.lastIndexOf(' ', mid);
    const a = L.text.slice(0, c).trim(), b = L.text.slice(c).trim(), tm = L.t + L.d * (a.length / L.text.length);
    SUBS.push({ t0: L.t - .05, t1: tm + .15, text: a }, { t0: tm + .15, t1: end, text: b });
  });
}

// —— picture state per chapter ——
const swapLat = (bb, t, t0, dt = 1.6) => t < t0 ? bb[3] + .05 : lerp(bb[3] + .05, bb[1] - .05, eo(pr(t, t0, t0 + dt)));
export function shaderState(t, ch) {
  const cam = cameraAt(t), alt = cam.alt;
  const s = { bE: EGB, b1: PLATES[SLOT_BB[ch]?.[0] ?? 'qena'], b2: PLATES[SLOT_BB[ch]?.[1] ?? 'qena'], uExpo: 1.04, uAtm: clamp((alt - 1500) / 3000), uShade: clamp((alt - 1500) / 4000),
    uDet1: clamp((700 - alt) / 500), uDet2: clamp((700 - alt) / 500), uSwap1: 90, uSwap2: 90, uNightA: 0, uNightB: 0, uScanLat: 60 };
  const card = C.card && t < C.card ? 1 : 0; s.uDim = card ? .5 * (1 - pr(t, C.card - .5, C.card)) : 0;
  if (ch === 0) { s.uNightA = s.uNightB = 1; s.uOutline = pr(t, at('c0b'), at('c0b') + 1.2); s.uDim = t > at('c0d', 1) ? pr(t, at('c0d', 1), at('c0d', 1) + .8) * .5 : 0; }
  if (ch === 1) { const g0 = at('c1c'); s.uGrey = eo(pr(t, g0, g0 + 1.4)) * .92; s.uKeep = pr(t, at('c1e'), at('c1e') + 1.4); }
  if (ch === 2) { s.uFlood = eo(pr(t, at('c2b', .3), at('c2b', .9))) * (1 - pr(t, at('c2c'), at('c2c', .9))); s.uGrey = t > at('c2h') ? pr(t, at('c2h'), at('c2h') + 1) * .7 * (1 - pr(t, at('c2i', .6), at('c2i', 1))) : 0; }
  if (ch === 3) { s.uSwap1 = swapLat(PLATES.rosetta, t, at('c3c', .3)); s.uSwapOn1 = t > at('c3c', .3) && t < at('c3c', .3) + 1.8 ? 1 : 0; s.uOver1 = pr(t, at('c3c', .3) + 1.4, at('c3c', .3) + 2.2) * (1 - pr(t, at('c3g'), at('c3g', .4))); }
  if (ch === 4) { s.uSwap1 = swapLat(PLATES.cairo, t, at('c4e', .2)); s.uSwapOn1 = t > at('c4e', .2) && t < at('c4e', .2) + 1.8 ? 1 : 0; s.uOver1 = pr(t, at('c4g', .3), at('c4g', .6)) * .9; }
  if (ch === 5) { s.uSwap1 = swapLat(PLATES.capital, t, at('c5c')); s.uSwapOn1 = t > at('c5c') && t < at('c5c') + 1.8 ? 1 : 0;
    s.uSwap2 = swapLat(PLATES.toshka, t, at('c5f')); s.uSwapOn2 = t > at('c5f') && t < at('c5f') + 1.8 ? 1 : 0; }
  if (ch === 6) { s.uNightA = 0; s.uNightB = 1; s.uScanLat = lerp(40, -50, pr(t, at('c6a'), at('c6a') + 3)); s.uScanOn = t > at('c6a') && t < at('c6a') + 3.2 ? 1 : 0;
    s.uDim = t > at('c6b', 1) ? pr(t, at('c6b', 1), at('c6b', 1) + .8) * .5 : 0; }
  return s;
}

// —— events for the mixer ——
export function events(ch) {
  const EV = []; const ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
  C.lines.forEach(L => ev(L.t, 'voice', { id: L.id }));
  if (C.card) { ev(0, 'card'); ev(.15, 'lock'); }
  const R = (id, f = 0, heavy = 0) => ev(at(id, f), 'reading', { heavy });
  if (ch === 0) { ev(0, 'orbit', { dur: DUR }); ev(at('c0b'), 'glass'); ev(at('c0b'), 'ticks', { dur: 1.2 }); ev(at('c0d', 1) + .2, 'title'); }
  if (ch === 1) { R('c1b', .55, 1); R('c1b', .9); ev(at('c1c'), 'servo', { dur: 1.4 }); R('c1d', .3); ev(at('c1e'), 'glass'); ev(at('c1f', .1), 'dive', { dur: at('c1f', .95) - at('c1f', .1) });
    ev(at('c1g', .1), 'ratchet', { dur: 1.6 }); R('c1g', .1, 1); ev(at('c1g', .1) - .4, 'suckout'); }
  if (ch === 2) { ev(at('c2b', .3), 'flood', { dur: 3 }); ev(at('c2e', .1), 'climb', { dur: 2.5 }); ev(at('c2e', .75), 'lock'); R('c2f2', .3); R('c2h', .5, 1); ev(at('c2i', .2), 'climb', { dur: 3 }); }
  if (ch === 3) { ev(at('c3a', .1), 'dive', { dur: 3 }); ev(at('c3b'), 'stamp'); ev(at('c3c', .3), 'scan', { dur: 1.6, dir: 1 }); ev(at('c3c', .3) + .1, 'stamp');
    ev(at('c3d', .05), 'ratchet', { dur: 1.6 }); R('c3d', .05, 1); ev(at('c3d') - .4, 'suckout'); ev(at('c3e', .5), 'lock'); ev(at('c3g'), 'climb', { dur: 3 }); }
  if (ch === 4) { R('c4b', .2); R('c4b', .75, 1); ev(at('c4c', .3), 'lock'); ev(at('c4d'), 'dive', { dur: 2.5 }); ev(at('c4d', .4), 'stamp'); ev(at('c4e', .2), 'scan', { dur: 1.6, dir: 1 }); ev(at('c4e', .2) + .1, 'stamp');
    ev(at('c4g', .3), 'glass'); R('c4g', .5, 1); }
  if (ch === 5) { ev(.6, 'climb', { dur: 2.5 }); ev(at('c5b'), 'stamp'); ev(at('c5c'), 'scan', { dur: 1.6, dir: 1 }); ev(at('c5c'), 'stamp'); ev(at('c5c', .5), 'lock');
    ev(at('c5d', .1), 'climb', { dur: 3 }); ev(at('c5e', .2), 'stamp'); ev(at('c5f'), 'scan', { dur: 1.6, dir: 1 }); ev(at('c5f'), 'stamp'); R('c5f', .6); ev(at('c5g', .2), 'lock'); }
  if (ch === 6) { ev(0, 'orbit', { dur: DUR }); ev(at('c6a'), 'scan', { dur: 3, dir: 1 }); ev(at('c6a'), 'glass'); ev(at('c6b', 1) + .2, 'title'); }
  return EV;
}

// —— 2D marks ——
const CL = { mark: '#F2F5F6', read: '#FFBE55', halo: 'rgba(5,8,10,.75)', dim: 'rgba(242,245,246,.62)' };
function hair(g, pts, w = 2, col = CL.mark, dash = null) {
  if (pts.length < 2) return; g.save(); g.lineJoin = g.lineCap = 'round'; if (dash) g.setLineDash(dash);
  for (const [lw, c] of [[w + 3, CL.halo], [w, col]]) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.lineWidth = lw; g.strokeStyle = c; g.stroke(); }
  g.restore();
}
function txt(g, s, x, y, font, col = CL.mark, align = 'left', a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha = Math.min(1, a); g.font = font; g.textAlign = align; g.textBaseline = 'alphabetic';
  g.lineWidth = 5; g.strokeStyle = CL.halo; g.lineJoin = 'round'; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); g.restore();
}
function reading(g, value, label, note, k, x = 110, y = 470) {
  if (k <= 0) return; const s = back(k / .6, 1.6), a = clamp(k / .25);
  txt(g, label, x, y - 122, '500 34px Barlow', CL.mark, 'left', a);
  g.save(); g.translate(x, y); g.scale(s, s); txt(g, value, 0, 0, '300 132px "Barlow Condensed"', CL.read, 'left', a); g.restore();
  txt(g, note, x, y + 44, '400 24px "IBM Plex Mono"', CL.dim, 'left', a);
}
const win = (t, a, b, f = .4) => pr(t, a, a + f) * (1 - pr(t, b - f, b));
function brackets(g, x, y, r, k, col = CL.mark) {
  if (k <= 0) return; const rr = r * (1 + .5 * (1 - back(k, 2.6))), L = r * .35;
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) hair(g, [[x + sx * rr, y + sy * (rr - L)], [x + sx * rr, y + sy * rr], [x + sx * (rr - L), y + sy * rr]], 2.4, col);
}
function pin(g, cam, ll, label, sub, k, side = 1, r = 46) {
  if (k <= 0) return; const [x, y, vis] = project(cam, ...ll); if (!vis) return;
  brackets(g, x, y, r, clamp(k / .35), CL.read); const a = clamp((k - .2) / .3);
  hair(g, [[x + side * (r + 4), y - r - 4], [x + side * (r + 110), y - r - 110]], 1.8);
  txt(g, label, x + side * (r + 120), y - r - 118, '500 40px Barlow', CL.mark, side > 0 ? 'left' : 'right', a);
  if (sub) txt(g, sub, x + side * (r + 120), y - r - 82, '400 24px "IBM Plex Mono"', CL.dim, side > 0 ? 'left' : 'right', a);
}
function stamp(g, s, k) { if (k <= 0) return; txt(g, s, W - 70, 120, '400 28px "IBM Plex Mono"', CL.read, 'right', k); }
function range(g, cam, A, B, km, t0, t1, t, label, note) {
  const a = project(cam, ...A), b = project(cam, ...B);
  for (const E of [a, b]) hair(g, [[E[0], E[1] - 50], [E[0], E[1] + 50]], 2.2);
  const k = eo(pr(t, t0, t1)), tip = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; hair(g, [a, tip], 2.6, CL.read);
  const n = Math.floor(km * k); for (let i = 1; i <= n; i++) { const u = i / km, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u); hair(g, [[x, y - 14], [x, y + 14]], 1.6, CL.read); }
  reading(g, `${(t < t1 ? km * k : km).toFixed(1)} km`, label, note, pr(t, t0, t0 + .6));
}
function card(g, t, title) {
  const k = pr(t, .1, .6), a = pr(t, .3, .8) * (1 - pr(t, C.card - .5, C.card)); brackets(g, W / 2, H / 2 - 20, 300 * (1 - .1 * (1 - k)), k * (1 - pr(t, C.card - .4, C.card)), CL.read);
  txt(g, title, W / 2, H / 2, '400 76px "IBM Plex Serif"', CL.mark, 'center', a);
}

export function overlay(g, t, cam, ch) {
  g.clearRect(0, 0, W, H);
  if (C.card && t < C.card) card(g, t, C.title);
  const P = ll => project(cam, ...ll);
  if (ch === 0) {
    if (t > at('c0d', 1)) { const k = pr(t, at('c0d', 1), at('c0d', 1) + .6); brackets(g, W / 2, H / 2 - 20, 340, k, CL.read);
      txt(g, 'EGYPT', W / 2, H / 2 - 30, '400 110px "IBM Plex Serif"', CL.mark, 'center', pr(t, at('c0d', 1) + .3, at('c0d', 1) + .9));
      txt(g, 'one river, a hundred million people', W / 2, H / 2 + 50, '400 32px "IBM Plex Mono"', CL.read, 'center', pr(t, at('c0d', 1) + .7, at('c0d', 1) + 1.3)); }
  }
  if (ch === 1) {
    if (t > at('c1a') && t < at('c1b')) txt(g, '1,001,450 km²', 110, 470, '300 110px "Barlow Condensed"', CL.read, 'left', win(t, at('c1a'), at('c1b')));
    if (t > at('c1a') && t < at('c1b')) txt(g, 'France + Germany ≈ 909,000 km²', 110, 520, '400 24px "IBM Plex Mono"', CL.dim, 'left', win(t, at('c1a', .5), at('c1b')));
    if (t > at('c1b', .5) && t < at('c1c')) reading(g, '95%', 'of Egyptians live along the Nile', 'approx. · FAO, Britannica', pr(t, at('c1b', .55), at('c1b', .55) + .8) * (1 - pr(t, at('c1b', .85), at('c1b', .9))));
    if (t > at('c1b', .85) && t < at('c1c', .4)) reading(g, '≈4%', 'of the land', 'Nile valley + delta · FAO', pr(t, at('c1b', .9), at('c1b', .9) + .8) * (1 - pr(t, at('c1c', .2), at('c1c', .4))));
    if (t > at('c1c', .2) && t < at('c1d')) { const [x, y] = P([24.8, 27.6]); const a = win(t, at('c1c', .2), at('c1d'));
      hair(g, [[x, y], [x, y - 120]], 1.6); txt(g, 'SAHARA', x, y - 140, '500 38px Barlow', CL.mark, 'center', a); txt(g, 'Cairo: < 3 cm of rain a year', x, y - 190, '400 24px "IBM Plex Mono"', CL.dim, 'center', a); }
    if (t > at('c1d') && t < at('c1e', .8)) reading(g, '≈97%', "of Egypt's renewable water: the Nile", 'Nile Basin Initiative · Egyptian Ministry of Water', pr(t, at('c1d', .3), at('c1d', .3) + .8) * (1 - pr(t, at('c1e', .5), at('c1e', .8))));
    if (t > at('c1g') - .6) { const a = pr(t, at('c1g') - .6, at('c1g') - .2);
      g.save(); g.globalAlpha = a; range(g, cam, [M.lat, M.lon0], [M.lat, M.lon1], 8.4, at('c1g', .1), at('c1g', .1) + 1.6, t, 'the whole green strip', 'Landsat 9 · 2025-10-08 · measured'); g.restore();
      if (t > at('c1h')) { const A2 = P([M.lat, M.lon0]), B2 = P([M.lat, M.lon1]), a2 = pr(t, at('c1h'), at('c1h') + .5);
        txt(g, 'SAND', A2[0] - 40, A2[1] - 90, '500 32px Barlow', CL.dim, 'right', a2); txt(g, 'SAND', B2[0] + 40, B2[1] - 90, '500 32px Barlow', CL.dim, 'left', a2);
        txt(g, 'FIELDS · VILLAGES · RIVER', (A2[0] + B2[0]) / 2, A2[1] + 110, '500 30px Barlow', CL.mark, 'center', a2); } }
    stamp(g, t > at('c1f') ? 'LANDSAT 9 · 2025-10-08' : '', pr(t, at('c1f', .8), at('c1f', 1)));
  }
  if (ch === 2) {
    if (t > at('c2b', .3) && t < at('c2c', 1)) txt(g, 'THE SUMMER FLOOD', 110, 360, '500 40px Barlow', CL.mark, 'left', win(t, at('c2b', .3), at('c2c', 1)));
    if (t > at('c2c', .5) && t < at('c2e')) { reading(g, 'Kemet', 'what Egyptians called their land', '"the black land": the colour of the river mud', pr(t, at('c2d'), at('c2d') + .8) * (1 - pr(t, at('c2e') - .4, at('c2e')))); }
    if (t > at('c2e', .6) && t < at('c2g')) pin(g, cam, DAM, 'ASWAN HIGH DAM', 'completed 1970', pr(t, at('c2e', .7), at('c2e', .7) + .6) * (1 - pr(t, at('c2g') - .4, at('c2g'))));
    if (t > at('c2f', .4) && t < at('c2g', .3)) { const [x, y] = P([22.6, 31.75]); const a = win(t, at('c2f', .4), at('c2g', .3)); hair(g, [[x, y], [x - 120, y - 120]], 1.6);
      txt(g, 'LAKE NASSER', x - 130, y - 130, '500 40px Barlow', CL.mark, 'right', a); }
    if (t > at('c2f2', .2) && t < at('c2g')) reading(g, '≈550 km', 'long, from Egypt into Sudan', 'Lake Nasser + Lake Nubia · approx.', pr(t, at('c2f2', .3), at('c2f2', .3) + .8) * (1 - pr(t, at('c2g') - .4, at('c2g'))));
    if (t > at('c2g') && t < at('c2h')) { const a = win(t, at('c2g'), at('c2h')); txt(g, 'NO MORE FLOODS', 110, 360, '500 40px Barlow', CL.mark, 'left', a);
      txt(g, 'WATER ALL YEAR', 110, 420, '500 40px Barlow', CL.read, 'left', pr(t, at('c2g', .45), at('c2g', .55)) * a); txt(g, 'ELECTRICITY', 110, 480, '500 40px Barlow', CL.read, 'left', pr(t, at('c2g', .8), at('c2g', .9)) * a); }
    if (t > at('c2h', .4) && t < at('c2i', .6)) reading(g, '> 98%', "of the river's sediment stays in the lake", 'studies of the High Dam · IAHR', pr(t, at('c2h', .5), at('c2h', .5) + .8) * (1 - pr(t, at('c2i', .3), at('c2i', .6))));
  }
  if (ch === 3) {
    if (t > at('c3a', .7) && t < at('c3c', .3) + .2) stamp(g, '1972-08-31 · LANDSAT 1', pr(t, at('c3a', .7), at('c3a', .9)));
    if (t > at('c3c', .3) && t < at('c3g')) stamp(g, '2025-08-19 · LANDSAT 9', pr(t, at('c3c', .3) + .8, at('c3c', .3) + 1.2) * (1 - pr(t, at('c3g') - .3, at('c3g'))));
    if (t > at('c3c', .3) + 1.4 && t < at('c3g')) { const [x, y] = P(RT.tip72); txt(g, 'COAST IN 1972', x + 30, y - 30, '500 32px Barlow', CL.mark, 'left', pr(t, at('c3c', .3) + 1.6, at('c3c', .3) + 2.1) * (1 - pr(t, at('c3g') - .4, at('c3g')))); }
    if (t > at('c3d') - .3 && t < at('c3e')) { g.save(); g.globalAlpha = win(t, at('c3d') - .3, at('c3e')); range(g, cam, RT.now, RT.tip72, 3.8, at('c3d', .05), at('c3d', .05) + 1.6, t, 'the tip has pulled back', '1972 → 2025 · Landsat · measured'); g.restore(); }
    if (t > at('c3e', .5) && t < at('c3g')) pin(g, cam, [31.462, 30.366], 'SEA WALL', 'built 1991', pr(t, at('c3e', .5), at('c3e', .5) + .6) * (1 - pr(t, at('c3g') - .4, at('c3g'))), 1, 30);
    if (t > at('c3g')) { const [x, y] = P([31.25, 31.2]); const a = pr(t, at('c3g', .4), at('c3g', .8)); hair(g, [[x, y], [x + 90, y - 140]], 1.6);
      txt(g, 'NORTHERN DELTA', x + 100, y - 150, '500 38px Barlow', CL.mark, 'left', a); txt(g, 'barely above sea level', x + 100, y - 110, '400 24px "IBM Plex Mono"', CL.dim, 'left', a); }
  }
  if (ch === 4) {
    if (t > at('c4b') && t < at('c4c')) { const k1 = pr(t, at('c4b', .2), at('c4b', .2) + .8), k2 = pr(t, at('c4b', .75), at('c4b', .75) + .8), a = 1 - pr(t, at('c4c') - .4, at('c4c'));
      reading(g, k2 > 0 ? '109 million' : '27 million', k2 > 0 ? 'Egyptians, 2026' : 'Egyptians, 1960', k2 > 0 ? 'CAPMAS population clock' : 'UN population estimates', (k2 > 0 ? k2 : k1) * a); }
    if (t > at('c4c', .2) && t < at('c4d')) { pin(g, cam, CAIRO, 'CAIRO', '≈25 million · largest city in Africa · UN 2025', pr(t, at('c4c', .3), at('c4c', .3) + .6) * (1 - pr(t, at('c4d') - .4, at('c4d')))); }
    if (t > at('c4d', .4) && t < at('c4e', .2) + .2) stamp(g, '1984-04-20 · LANDSAT 5', pr(t, at('c4d', .4), at('c4d', .6)));
    if (t > at('c4e', .2)) stamp(g, '2025-04-05 · LANDSAT 8', pr(t, at('c4e', .2) + .8, at('c4e', .2) + 1.2));
    if (t > at('c4f', .3) && t < at('c4g')) { const a = win(t, at('c4f', .3), at('c4g')); for (const [ll, side] of [[[30.02, 31.05], -1], [[30.03, 31.47], 1]]) { const [x, y] = P(ll); hair(g, [[x, y], [x + side * 70, y - 100]], 1.6); txt(g, 'NEW CITY', x + side * 80, y - 110, '500 34px Barlow', CL.mark, side > 0 ? 'left' : 'right', a); } }
    if (t > at('c4g', .4)) reading(g, '≈ 1 in 4', 'green fields of 1984, now built over', 'Landsat 5 → 8 · same season · measured', pr(t, at('c4g', .5), at('c4g', .5) + .8) * (1 - pr(t, at('c4h', .7), at('c4h', 1))));
  }
  if (ch === 5) {
    if (t > at('c5b') && t < at('c5c')) stamp(g, '2015-09-26 · LANDSAT 8', pr(t, at('c5b'), at('c5b', .2)));
    if (t > at('c5c') && t < at('c5d')) stamp(g, '2025-09-13 · LANDSAT 9', pr(t, at('c5c') + .8, at('c5c') + 1.2) * (1 - pr(t, at('c5d') - .3, at('c5d'))));
    if (t > at('c5c', .5) && t < at('c5d')) pin(g, cam, CAPITAL, 'NEW ADMINISTRATIVE CAPITAL', 'announced 2015', pr(t, at('c5c', .5), at('c5c', .5) + .6) * (1 - pr(t, at('c5d') - .4, at('c5d'))), -1, 60);
    if (t > at('c5e', .2) && t < at('c5f')) stamp(g, '2001-12-25 · LANDSAT 7', pr(t, at('c5e', .2), at('c5e', .4)));
    if (t > at('c5f')) stamp(g, '2021-10-21 · LANDSAT 8', pr(t, at('c5f') + .8, at('c5f') + 1.2));
    if (t > at('c5e', .4) && t < at('c5f')) { const [x, y] = P([23.25, 30.85]); const a = win(t, at('c5e', .4), at('c5f')); hair(g, [[x, y], [x - 80, y - 120]], 1.6); txt(g, 'TOSHKA LAKES', x - 90, y - 130, '500 38px Barlow', CL.mark, 'right', a); }
    if (t > at('c5f', .5) && t < at('c5g', .2)) reading(g, t < at('c5f', .7) ? '584 km²' : '955 km²', t < at('c5f', .7) ? 'of lake, December 2001' : 'of lake, October 2021', 'in this frame · Landsat · measured', pr(t, at('c5f', .55), at('c5f', .55) + .8) * (1 - pr(t, at('c5g', .1), at('c5g', .2))));
    if (t > at('c5g', .2)) pin(g, cam, FARMS, 'NEW FARMS', 'pivot irrigation from Lake Nasser', pr(t, at('c5g', .2), at('c5g', .2) + .6), -1, 70);
  }
  if (ch === 6) {
    if (t > at('c6b', 1)) { const k = pr(t, at('c6b', 1), at('c6b', 1) + .6); brackets(g, W / 2, H / 2 - 20, 340, k, CL.read);
      txt(g, 'One river.', W / 2, H / 2 - 30, '300 120px "Barlow Condensed"', CL.mark, 'center', pr(t, at('c6b', 1) + .3, at('c6b', 1) + .8));
      txt(g, '100 million people.', W / 2, H / 2 + 80, '300 96px "Barlow Condensed"', CL.read, 'center', pr(t, at('c6b', 1) + .7, at('c6b', 1) + 1.2));
      if (t > at('c6c')) txt(g, 'Which country next?  Tell us in the comments.', W / 2, H / 2 + 190, '400 30px "IBM Plex Mono"', CL.mark, 'center', pr(t, at('c6c'), at('c6c') + .5)); }
  }
  // instruments: altitude, scale bar, credit; the transcript strip
  txt(g, `ALT ${Math.round(cam.alt).toLocaleString('en-US')} km`, 70, 110, '400 28px "IBM Plex Mono"', CL.dim);
  const c0 = unproject(cam, W - 400, 900), c1 = unproject(cam, W - 80, 900);
  if (c0 && c1) { const km = Math.hypot((c1[1] - c0[1]) * 111.32 * Math.cos(c0[0] * Math.PI / 180), (c1[0] - c0[0]) * 110.6); const nice = [1, 2, 5].flatMap(m => [1, 10, 100, 1000].map(p => m * p)).sort((a, b) => a - b).filter(v => v <= km).pop() || 1; const px = 320 * nice / km;
    hair(g, [[W - 80 - px, 888], [W - 80 - px, 900], [W - 80, 900], [W - 80, 888]], 2); txt(g, `${nice.toLocaleString('en-US')} km`, W - 80, 874, '400 24px "IBM Plex Mono"', CL.dim, 'right'); }
  txt(g, 'Imagery: NASA Blue Marble · VIIRS Black Marble · USGS Landsat 1, 5, 7, 8, 9', 70, 1052, '400 20px "IBM Plex Mono"', 'rgba(242,245,246,.55)');
  const S = SUBS.find(s => t >= s.t0 && t < s.t1);
  if (S) { const a = pr(t, S.t0, S.t0 + .15); g.save(); g.globalAlpha = a; const grd = g.createLinearGradient(60, 0, 1700, 0); grd.addColorStop(0, 'rgba(5,8,10,.72)'); grd.addColorStop(1, 'rgba(5,8,10,0)');
    g.fillStyle = grd; g.fillRect(60, 930, 1640, 80); g.fillStyle = CL.mark; g.fillRect(60, 930, 2, 80); g.restore(); txt(g, S.text, 84, 983, '400 40px Barlow', CL.mark, 'left', a); }
}
