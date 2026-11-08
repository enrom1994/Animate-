// "Why does almost everyone in Egypt live on 4% of the land?" — Satellite Briefing, 9:16, 30 fps.
// One camera: orbit → lock on Egypt → day/night scan → readings → grey grade, colour stays on the strip → dive to Qena,
// range line across the valley → track north to the delta and Cairo → climb back to orbit at night.
import { makeCamera, project, unproject } from './engine.js';
import { clamp, lerp, track } from '/core/lib.js';
export const W = 1080, H = 1920, DUR = 57.0;
const pr = (t, a, b) => clamp((t - a) / (b - a));
const eo = x => 1 - Math.pow(1 - clamp(x), 3);
const back = (x, s = 2.2) => { x = clamp(x) - 1; return 1 + x * x * ((s + 1) * x + s); };

// —— narration (t = start; d from voices/durations.json) ——
export const LINES = [
  { id: 'n01', t: 0.6, d: 3.785, text: 'Egypt is bigger than France and Germany put together.' },
  { id: 'n02', t: 5.0, d: 2.378, text: 'But look at it from space, at night.' },
  { id: 'n03', t: 9.2, d: 3.445, text: 'Almost everyone lives on this one thin line.' },
  { id: 'n04', t: 13.2, d: 4.268, text: 'About 95% of Egyptians live along the Nile.' },
  { id: 'n05', t: 18.0, d: 4.451, text: 'More than 100 million people, on roughly 4% of the land.' },
  { id: 'n06', t: 23.2, d: 4.962, text: 'The rest is the Sahara. In most of the country, it almost never rains.' },
  { id: 'n07', t: 28.8, d: 4.671, text: 'So every field, every town, every city depends on one river.' },
  { id: 'n08', t: 34.6, d: 4.309, text: 'Here, the whole green strip is only about 8 km wide.' },
  { id: 'n09', t: 40.0, d: 5.66, text: 'Then the river fans out into the delta, where roughly half of all Egyptians live.' },
  { id: 'n10', t: 46.4, d: 2.962, text: 'And Cairo sits right where the valley opens.' },
  { id: 'n11', t: 50.6, d: 2.635, text: 'One river. A hundred million people.' },
];
// transcript cues: one line each; long sentences split at a comma or full stop near the middle (measured with the real font)
export let SUBS = [];
export function buildSubs(ctx) {
  ctx.font = '400 40px Barlow'; const MAX = 940; SUBS = [];
  LINES.forEach((L, i) => {
    const t1max = (LINES[i + 1]?.t ?? DUR) - 0.15, end = Math.min(t1max, Math.max(L.t + 1.8, L.t + L.d + 0.6));
    if (ctx.measureText(L.text).width <= MAX) { SUBS.push({ t0: L.t - 0.05, t1: end, text: L.text }); return; }
    const cut = [...L.text.matchAll(/[,.] /g)].map(m => m.index + 1); const mid = L.text.length / 2;
    const c = cut.length ? cut.reduce((a, b) => Math.abs(b - mid) < Math.abs(a - mid) ? b : a) : L.text.lastIndexOf(' ', mid);
    const a = L.text.slice(0, c).trim(), b = L.text.slice(c).trim(), tm = L.t + L.d * (a.length / L.text.length);
    SUBS.push({ t0: L.t - 0.05, t1: tm + 0.15, text: a }, { t0: tm + 0.15, t1: end, text: b });
  });
}

// —— places ——
const EGB = [24.0, 21.0, 37.0, 32.5], QB = [32.30, 25.70, 33.05, 26.35];
const M = { lat: 26.05735, lon0: 32.7521, lon1: 32.8361, km: 8.4 };       // assets/measure.json (narrowest transect)
const CAIRO = [30.044, 31.236], DELTA = [[30.10, 31.20], [31.20, 29.92], [31.50, 30.70], [31.53, 31.60], [31.27, 32.30], [30.10, 31.20]];

// —— camera keys: [lat, lon, log10(distance km), tilt, heading, sy] ——
const K = (t, lat, lon, d, tilt = 0, hd = 0, sy = -120) => [t, [lat, lon, Math.log10(d), tilt, hd, sy]];
const camT = track([
  K(0, 24.0, 28.0, 11000, 28, 8, -60), K(4.4, 26.3, 30.6, 5200, 10, 2, -120),
  K(5.6, 26.75, 30.8, 3150, 0, 0, -170), K(23.0, 26.75, 30.8, 2900, 0, 0, -170),
  K(28.6, 26.6, 31.4, 2650, 0, 0, -170), K(30.6, 26.3, 32.2, 900, 0, 0, -150),
  K(33.4, M.lat, (M.lon0 + M.lon1) / 2, 62, 0, 0, -140), K(39.4, M.lat, (M.lon0 + M.lon1) / 2, 56, 0, 0, -140),
  K(41.4, 28.2, 31.3, 800, 0, 0, -150), K(44.6, 30.85, 31.1, 1050, 0, 0, -120),
  K(46.6, 30.2, 31.2, 300, 8, 0, -160), K(49.6, 30.1, 31.22, 250, 10, 0, -160),
  K(53.0, 27.5, 31.0, 6000, 20, 0, -120), K(57.0, 26.5, 31.0, 9000, 26, 4, -100),
]);
export function cameraAt(t) { const [lat, lon, ld, tilt, heading, sy] = camT(t); return makeCamera({ lat, lon, d: Math.pow(10, ld), tilt, heading, fov: 32, sy }, W, H); }

// —— picture state ——
const T = { lock: 2.6, scan0: 6.6, scan1: 8.6, outline: 9.6, r95: 14.2, r4: 20.0, back0: 23.4, back1: 24.9, grey0: 24.6, keep: 29.2,
  range0: 35.7, range1: 37.6, delta: 43.4, half: 44.6, cairo: 46.9, night2: 50.0, card: 53.3 };
export function shaderState(t) {
  let A = 0, B = 0, lat = 40, on = 0;
  if (t < T.back0) { A = 0; B = 1; lat = lerp(37, 10, pr(t, T.scan0, T.scan1)); on = t > T.scan0 && t < T.scan1 + .3 ? 1 : 0; if (t < T.scan0) lat = 40; }
  else if (t < T.night2) { A = 1; B = 0; lat = lerp(37, 10, pr(t, T.back0, T.back1)); on = t < T.back1 + .3 ? 1 : 0; }
  else { A = 0; B = 1; lat = lerp(37, -50, pr(t, T.night2, T.night2 + 3.2)); on = t < T.night2 + 3.4 ? 1 : 0; }
  const cam = cameraAt(t);
  return {
    bE: EGB, bQ: QB,
    uDet: clamp((900 - cam.alt) / 650), uNightA: A, uNightB: B, uScanLat: lat, uScanOn: on,
    uGrey: t > T.grey0 && t < 45.5 ? eo(pr(t, T.grey0, T.grey0 + 1.5)) * (1 - pr(t, 44.0, 45.5)) * .92 : 0,
    uKeep: pr(t, T.keep, T.keep + 1.4),
    uOutline: t > T.outline && t < T.back0 ? pr(t, T.outline, T.outline + 1.2) : 0,
    uAtm: clamp((cam.alt - 1500) / 3000), uShade: clamp((cam.alt - 1500) / 4000), uExpo: 1.04, uDim: t > T.card ? pr(t, T.card, T.card + 1.0) * .55 : 0,
  };
}

// —— events for the mixer ——
export const EV = [];
const ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
LINES.forEach(L => ev(L.t, 'voice', { id: L.id }));
ev(0, 'orbit', { dur: 5.4 }); ev(1.2, 'search'); ev(T.lock, 'lock');
ev(T.scan0, 'scan', { dur: T.scan1 - T.scan0, dir: 1 }); ev(T.scan0 + .1, 'glass');
ev(T.outline, 'ticks', { dur: 1.2 }); ev(T.r95, 'reading', { heavy: 1 }); ev(T.r4, 'reading', { heavy: 0 });
ev(T.back0, 'scan', { dur: T.back1 - T.back0, dir: -1 }); ev(T.grey0, 'servo', { dur: 1.2 });
ev(T.keep, 'glass'); ev(30.6, 'dive', { dur: 2.8 }); ev(35.2, 'suckout', { dur: .4 });
ev(T.range0, 'ratchet', { dur: T.range1 - T.range0 }); ev(T.range1, 'reading', { heavy: 1 });
ev(39.6, 'climb', { dur: 4.6 }); ev(T.delta, 'ticks', { dur: 1.0 }); ev(T.half, 'reading', { heavy: 0 }); ev(T.cairo, 'lock');
ev(T.night2, 'scan', { dur: 1.6, dir: 1 }); ev(51.5, 'climb', { dur: 4 }); ev(T.card, 'card'); ev(55.6, 'end');
[['open', 0], ['night', T.scan0], ['facts', 13.0], ['rain', 23.0], ['dive', 30.6], ['measure', 34.6], ['north', 39.6], ['cairo', 46.4], ['outro', 50.0]].forEach(([id, t]) => ev(t, 'cue', { id }));

// —— 2D marks ——
const C = { mark: '#F2F5F6', read: '#FFBE55', halo: 'rgba(5,8,10,.75)', dim: 'rgba(242,245,246,.62)' };
function hair(g, pts, w = 2, col = C.mark, dash = null) {
  if (pts.length < 2) return; g.save(); g.lineJoin = g.lineCap = 'round';
  if (dash) g.setLineDash(dash);
  for (const [lw, c] of [[w + 3, C.halo], [w, col]]) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.lineWidth = lw; g.strokeStyle = c; g.stroke(); }
  g.restore();
}
function txt(g, s, x, y, font, col = C.mark, align = 'left', a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha = a; g.font = font; g.textAlign = align; g.textBaseline = 'alphabetic';
  g.lineWidth = 5; g.strokeStyle = C.halo; g.lineJoin = 'round'; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); g.restore();
}
function reading(g, x, y, value, label, note, k) {   // label above, the reading, the source below; it pops in and lands
  if (k <= 0) return; const s = back(k / .6, 1.6), a = clamp(k / .25);
  txt(g, label, x, y - 118, '500 34px Barlow', C.mark, 'left', a);
  g.save(); g.translate(x, y); g.scale(s, s); txt(g, value, 0, 0, '300 132px "Barlow Condensed"', C.read, 'left', a); g.restore();
  txt(g, note, x, y + 44, '400 24px "IBM Plex Mono"', C.dim, 'left', a);
}
function brackets(g, x, y, r, k, col = C.mark) {
  if (k <= 0) return; const rr = r * (1 + .5 * (1 - back(k, 2.6))), L = r * .35;
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) hair(g, [[x + sx * rr, y + sy * (rr - L)], [x + sx * rr, y + sy * rr], [x + sx * (rr - L), y + sy * rr]], 2.4, col);
}
const P = (cam, lat, lon) => project(cam, lat, lon);

export function overlay(g, t, cam) {
  g.clearRect(0, 0, W, H);
  // title question (the hook), top of frame
  if (t < 4.6) { const a = pr(t, .2, .7) * (1 - pr(t, 4.1, 4.6));
    txt(g, 'Why does almost everyone', W / 2, 250, '400 66px "IBM Plex Serif"', C.mark, 'center', a);
    txt(g, 'in Egypt live on 4% of the land?', W / 2, 330, '400 66px "IBM Plex Serif"', C.mark, 'center', a); }
  // reticle: searching, then lock on Egypt
  if (t > 1.0 && t < 5.4) {
    const [ex, ey] = P(cam, 26.8, 30.6); const k = pr(t, T.lock, T.lock + .35);
    const sx = k > 0 ? ex : ex + 120 * Math.sin(t * 3.1), sy = k > 0 ? ey : ey + 90 * Math.cos(t * 2.3);
    brackets(g, sx, sy, 260, k > 0 ? k : .99, k > 0 ? C.read : C.mark);
    if (k > 0) txt(g, 'EGYPT  26.8°N 30.6°E', sx, sy + 320, '400 26px "IBM Plex Mono"', C.mark, 'center', clamp(k * 2) * (1 - pr(t, 4.8, 5.4)));
  }
  // readings over the empty Western Desert
  const rx = 70;
  if (t > T.r95 - .2 && t < T.r4 - .2) reading(g, rx, 560, '95%', 'of Egyptians live along the Nile', 'approx. · FAO, Britannica', pr(t, T.r95, T.r95 + .8));
  if (t > T.r4 - .2 && t < T.back0 + 1) reading(g, rx, 560, '≈4%', 'of the land', 'Nile valley + delta · FAO', pr(t, T.r4, T.r4 + .8) * (1 - pr(t, T.back0 + .4, T.back0 + 1)));
  if (t > 18.4 && t < T.back0 + 1) txt(g, '100+ million people', rx, 700, '500 38px Barlow', C.mark, 'left', pr(t, 18.4, 18.9) * (1 - pr(t, T.back0 + .4, T.back0 + 1)));
  if (t > T.back0 + .4 && t < 29) { const a = pr(t, T.back0 + .6, T.back0 + 1.2) * (1 - pr(t, 28.4, 29)); const [sx2, sy2] = P(cam, 24.6, 28.9);
    hair(g, [[sx2, sy2], [sx2 - 10, sy2 - 140]], 1.6); txt(g, 'SAHARA', sx2 - 10, sy2 - 160, '500 36px Barlow', C.mark, 'center', a); txt(g, 'rain: almost none', sx2 - 10, sy2 - 210, '400 24px "IBM Plex Mono"', C.dim, 'center', a); }
  // the range line across the valley
  if (t > 33.8 && t < 39.8) {
    const a = pr(t, 33.8, 34.3) * (1 - pr(t, 39.4, 39.8));
    const A = P(cam, M.lat, M.lon0), B = P(cam, M.lat, M.lon1);
    g.save(); g.globalAlpha = a;
    for (const E of [A, B]) hair(g, [[E[0], E[1] - 70], [E[0], E[1] + 70]], 2.2);
    const k = eo(pr(t, T.range0, T.range1)), tip = [lerp(A[0], B[0], k), lerp(A[1], B[1], k)];
    hair(g, [A, tip], 2.6, C.read);
    const n = Math.floor(M.km * k); for (let i = 1; i <= n; i++) { const u = i / M.km; const x = lerp(A[0], B[0], u), y = lerp(A[1], B[1], u); hair(g, [[x, y - 16], [x, y + 16]], 1.6, C.read); }
    const val = t < T.range1 ? (M.km * k).toFixed(1) : M.km.toFixed(1);
    const land = pr(t, T.range1, T.range1 + .5);
    reading(g, 70, 520, `${val} km`, 'the whole green strip', 'Landsat 9 · 2025-10-08 · measured', pr(t, T.range0, T.range0 + .6) + land * 0);
    txt(g, 'DESERT', A[0] - 20, A[1] - 110, '500 30px Barlow', C.dim, 'right', 1); txt(g, 'DESERT', B[0] + 20, B[1] - 110, '500 30px Barlow', C.dim, 'left', 1);
    g.restore();
  }
  // the delta and Cairo
  if (t > T.delta - .2 && t < 50.4) {
    const a = 1 - pr(t, 49.8, 50.4), k = pr(t, T.delta, T.delta + 1.2);
    const pts = DELTA.map(([la, lo]) => P(cam, la, lo)); const n = Math.max(2, Math.ceil(pts.length * k));
    g.save(); g.globalAlpha = a; hair(g, pts.slice(0, n), 2, C.mark, [10, 9]); g.restore();
    if (t < 46.4) reading(g, 70, 520, '≈ ½', 'of all Egyptians live in the delta', 'approx. · Diercke, Wikipedia', pr(t, T.half, T.half + .8) * (1 - pr(t, 45.8, 46.4)));
    if (t > T.cairo) { const [cx, cy] = P(cam, ...CAIRO); const kc = pr(t, T.cairo, T.cairo + .35); g.save(); g.globalAlpha = a; brackets(g, cx, cy, 70, kc, C.read);
      hair(g, [[cx + 74, cy - 74], [cx + 180, cy - 180]], 1.8); txt(g, 'CAIRO', cx + 190, cy - 190, '500 44px Barlow', C.mark, 'left', clamp(kc * 2)); txt(g, 'where the valley opens', cx + 190, cy - 150, '400 24px "IBM Plex Mono"', C.dim, 'left', clamp(kc * 2)); g.restore(); }
  }
  // end card: the reticle opens into the frame
  if (t > T.card) { const k = pr(t, T.card, T.card + .6); brackets(g, W / 2, 760, 330, k, C.read);
    txt(g, 'One river.', W / 2, 740, '300 120px "Barlow Condensed"', C.mark, 'center', pr(t, T.card + .3, T.card + .8));
    txt(g, '100 million people.', W / 2, 860, '300 96px "Barlow Condensed"', C.read, 'center', pr(t, T.card + .7, T.card + 1.2)); }
  // instruments: altitude (top left), scale bar (above the transcript), imagery credit
  txt(g, `ALT ${Math.round(cam.alt).toLocaleString('en-US')} km`, 60, 110, '400 28px "IBM Plex Mono"', C.dim);
  const c0 = unproject(cam, W - 330, 1560), c1 = unproject(cam, W - 70, 1560);
  if (c0 && c1) { const km = Math.hypot((c1[1] - c0[1]) * 111.32 * Math.cos(c0[0] * Math.PI / 180), (c1[0] - c0[0]) * 110.6); const nice = [1, 2, 5].flatMap(m => [1, 10, 100, 1000].map(p => m * p)).sort((a, b) => a - b).filter(v => v <= km).pop() || 1; const px = 260 * nice / km;
    hair(g, [[W - 70 - px, 1550], [W - 70 - px, 1562], [W - 70, 1562], [W - 70, 1550]], 2); txt(g, `${nice.toLocaleString('en-US')} km`, W - 70, 1535, '400 24px "IBM Plex Mono"', C.dim, 'right'); }
  txt(g, 'Imagery: NASA Blue Marble · VIIRS Black Marble · USGS Landsat 9', 60, 1890, '400 20px "IBM Plex Mono"', 'rgba(242,245,246,.55)');
  // transcript strip, bottom left
  const S = SUBS.find(s => t >= s.t0 && t < s.t1);
  if (S) { const a = pr(t, S.t0, S.t0 + .15); g.save(); g.globalAlpha = a; const grd = g.createLinearGradient(40, 0, 1060, 0); grd.addColorStop(0, 'rgba(5,8,10,.72)'); grd.addColorStop(1, 'rgba(5,8,10,0)');
    g.fillStyle = grd; g.fillRect(40, 1600, 1020, 86); g.fillStyle = C.mark; g.fillRect(40, 1600, 2, 86); g.restore();
    txt(g, S.text, 62, 1656, '400 40px Barlow', C.mark, 'left', a); }
}
