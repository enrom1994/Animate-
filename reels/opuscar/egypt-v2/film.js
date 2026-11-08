// "Egypt: one river", studio edit (v2). A shot list per chapter: globe / terrain / photo / graphic shots, 3-6 s each,
// crossfades between them, one graphics package (gfx.js) on top. Timing comes from the narration (timing.json).
import { makeCamera, project } from './engine.js';
import { track } from '/core/lib.js';
import * as G from './gfx.js';
const { W, H, COL, F, pr, eo, eio, lerp, win, text } = G;
let C, at, DUR, SHOTS = [], SUBS = [], EV = [];
const M = { lat: 26.05735, lon0: 32.7521, lon1: 32.8361 };
const EGB = [24.0, 21.0, 37.0, 32.5], QB = [32.30, 25.70, 33.05, 26.35];
export const NEEDS = { 1: { photos: ['desert_western', 'felucca_aswan'], terrain: 'qena', plates: ['qena', 'qena'] } };

// ———— chapter 1 ————
function chapter1() {
  const a = at, s = [];
  const T = (t0, t1, o) => s.push({ t0, t1, ...o });
  const [qx, qy] = [0, 0];
  T(0, a('c1a'), { type: 'terrain', view: u => ({ x: 47.5, y: 6 + 9 * u, h: 3.2 - .4 * u, tx: 49.5, ty: 34 + 6 * u, th: 0, sunAz: 255, sunEl: 16, haze: 70 }), title: ['01', 'A country of 4%'] });
  T(a('c1a'), a('c1b'), { type: 'graphic', draw: areaGraphic });
  T(a('c1b'), a('c1b', .5), { type: 'globe', night: 1, keys: [[a('c1b') - .3, 26.6, 30.8, 3600], [a('c1b', .5), 26.7, 30.9, 3000]],
    over: (g, t) => G.counter(g, t, a('c1b') + .1, a('c1b', .5), { to: 95, fmt: v => Math.round(v) + '%', label: 'OF EGYPTIANS LIVE ALONG THE NILE', sub: 'approx. · FAO, Britannica' }) });
  T(a('c1b', .5), a('c1c'), { type: 'globe', grey: 1, keep: 1, keys: [[a('c1b', .5), 26.7, 30.9, 3000], [a('c1c'), 26.5, 31.2, 2400]],
    over: (g, t) => G.counter(g, t, a('c1b', .5) + .1, a('c1c'), { to: 4, fmt: v => '≈' + Math.round(v) + '%', label: 'OF THE LAND', sub: 'Nile valley + delta · FAO', col: COL.green }) });
  T(a('c1c'), a('c1c', .48), { type: 'photo', img: 'desert_western', from: [.35, .5, 1.12], to: [.6, .5, 1.02], amb: 'desert', lower: ['THE SAHARA', 'Western Desert, Egypt'], credit: 'Photo: Vyacheslav Argenberg, CC BY 4.0' });
  T(a('c1c', .48), a('c1d'), { type: 'graphic', draw: rainGraphic });
  T(a('c1d'), a('c1e'), { type: 'photo', img: 'felucca_aswan', amb: 'river', from: [.45, .45, 1.18], to: [.52, .5, 1.04], credit: 'Photo: Vyacheslav Argenberg, CC BY 4.0',
    over: (g, t) => G.counter(g, t, a('c1d', .25), a('c1e'), { to: 97, fmt: v => '≈' + Math.round(v) + '%', label: "OF EGYPT'S RENEWABLE WATER", sub: 'from the Nile · Nile Basin Initiative', col: COL.teal }) });
  T(a('c1e'), a('c1f'), { type: 'terrain', view: u => ({ x: 49.0 + 1.2 * u, y: 24 + 9 * eio(u), h: 1.1, tx: 49.6, ty: 50 + 6 * u, th: .1, sunAz: 250, sunEl: 15, haze: 55 }),
    lower: ['THE NILE VALLEY NEAR QENA', '3D: NASADEM elevation ×3 · Landsat 9, 2025'] });
  T(a('c1f'), a('c1h'), { type: 'globe', keys: [[a('c1f') - .3, 26.4, 31.9, 1400], [a('c1f', .9), M.lat, (M.lon0 + M.lon1) / 2, 40], [a('c1h'), M.lat, (M.lon0 + M.lon1) / 2, 34]],
    over: (g, t, cam) => { G.lower(g, t, a('c1f', .4), a('c1g') - .2, 'LANDSAT 9 · 8 OCTOBER 2025', 'Qena, Egypt · 30 m per pixel · USGS'); rangeLine(g, t, cam); } });
  T(a('c1h'), DUR, { type: 'graphic', draw: sectionGraphic });
  return s;
}
// —— infographics ——
function areaGraphic(g, t, t0, t1) {
  G.bg(g); const k = eo(pr(t, t0 + .1, t0 + 1.2)), k2 = eo(pr(t, t0 + 1.2, t0 + 2.3)), S = .00052;   // px per sqrt(km²)
  const sq = (x, y, area, col, k) => { const s = Math.sqrt(area) * 600 / Math.sqrt(1001450) * k; g.save(); g.fillStyle = col; g.globalAlpha = .9; g.fillRect(x, y - s, s, s); g.restore(); return s; };
  const base = 820;
  const se = sq(260, base, 1001450, COL.amber, k);
  text(g, 'EGYPT', 260, base + 52, `600 34px ${F.lab}`, COL.text, 'left', k, true, 3); text(g, Math.round(1001450 * k).toLocaleString('en-US') + ' km²', 260, base + 96, `500 44px ${F.num}`, COL.amber, 'left', k);
  const sf = sq(1060, base, 551500, COL.blue, k2), sg = sq(1060 + Math.sqrt(551500) * 600 / Math.sqrt(1001450) + 20, base, 357600, COL.teal, k2);
  text(g, 'FRANCE + GERMANY', 1060, base + 52, `600 34px ${F.lab}`, COL.text, 'left', k2, true, 3); text(g, Math.round(909100 * k2).toLocaleString('en-US') + ' km²', 1060, base + 96, `500 44px ${F.num}`, COL.blue, 'left', k2);
  text(g, 'land area · France: metropolitan', W - 120, H - 60, `400 20px ${F.mono}`, COL.dim, 'right', k2, false);
}
function rainGraphic(g, t, t0, t1) {
  G.bg(g); const k = eo(pr(t, t0 + .2, t0 + 1.6)); const x = 760, y0 = 860, hcm = 52;   // px per cm
  g.save(); g.strokeStyle = 'rgba(244,242,238,.8)'; g.lineWidth = 3; g.strokeRect(x, y0 - 10 * hcm, 160, 10 * hcm);
  for (let c = 0; c <= 10; c++) { g.beginPath(); g.moveTo(x + 160, y0 - c * hcm); g.lineTo(x + 180, y0 - c * hcm); g.stroke(); text(g, c + ' cm', x + 192, y0 - c * hcm + 8, `400 22px ${F.mono}`, COL.dim, 'left', 1, false); }
  const lvl = 2.5 * k; const gr = g.createLinearGradient(0, y0 - lvl * hcm, 0, y0); gr.addColorStop(0, '#7fb6e6'); gr.addColorStop(1, '#3e6fa6'); g.fillStyle = gr; g.fillRect(x + 3, y0 - lvl * hcm, 154, lvl * hcm - 3); g.restore();
  G.counter(g, t, t0 + .1, t1 + .4, { to: 2.5, fmt: v => '< 3 cm', label: 'RAIN IN A WHOLE YEAR · CAIRO', sub: 'climate normals ≈ 18–25 mm', col: '#7fb6e6' });
}
let SECTION = null;
export function setSection(s) { SECTION = s; }
function sectionGraphic(g, t, t0, t1) {
  G.bg(g); if (!SECTION) return; const P = SECTION, n = P.km.length, x0 = 160, x1 = W - 160, yb = 760, ex = .55;   // px per m (heavily exaggerated)
  const X = i => lerp(x0, x1, i / (n - 1)), Y = i => yb - (P.m[i] - 40) * ex;
  const k = eo(pr(t, t0 + .1, t0 + 1.4)), m = Math.ceil(n * k);
  const i0 = P.lon.findIndex(l => l >= P.measure[0]), i1 = P.lon.findIndex(l => l >= P.measure[1]);
  g.save();   // ground: desert tan; the valley floor (dark on the image) green
  g.beginPath(); g.moveTo(X(0), yb + 120); for (let i = 0; i < m; i++) g.lineTo(X(i), Y(i)); g.lineTo(X(m - 1), yb + 120); g.closePath(); g.fillStyle = '#b89668'; g.fill();
  for (let i = 0; i < m - 1; i++) if (i >= i0 && i <= i1) { g.fillStyle = P.refl[i] < .06 ? '#3d78b8' : '#5f8f46'; g.fillRect(X(i), Y(i), X(i + 1) - X(i) + 1, 18); }
  g.beginPath(); for (let i = 0; i < m; i++) i ? g.lineTo(X(i), Y(i)) : g.moveTo(X(i), Y(i)); g.strokeStyle = COL.text; g.lineWidth = 3; g.stroke(); g.restore();
  const L = (s, i, dy, tt, col = COL.text) => { const a = pr(t, tt, tt + .4); if (a <= 0) return; g.save(); g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.moveTo(X(i), Y(i) - 6); g.lineTo(X(i), Y(i) - dy); g.stroke(); g.restore(); text(g, s, X(i), Y(i) - dy - 12, `600 28px ${F.lab}`, col, 'center', a, true, 2); };
  const ir = P.refl.reduce((b, r, i) => (i > i0 && i < i1 && r < P.refl[b]) ? i : b, i0 + 1), iv = Math.round(lerp(i0, i1, .82));
  L('FIELDS', Math.round(lerp(i0, ir, .4)), 110, at('c1h') + .1, COL.green); L('VILLAGES', Math.round(lerp(ir, i1, .45)), 170, at('c1h', .18), COL.text);
  L('ROADS', iv, 120, at('c1h', .3), COL.text); L('RIVER', ir, 230, at('c1h', .45), COL.blue);
  L('SAND', 25, 90, at('c1h', .75), COL.sand); L('SAND', n - 25, 90, at('c1h', .8), COL.sand);
  const kb = pr(t, at('c1h', .55), at('c1h', .55) + .5);
  if (kb > 0) { g.save(); g.globalAlpha = kb; g.strokeStyle = COL.amber; g.lineWidth = 3; g.beginPath(); g.moveTo(X(i0), yb + 60); g.lineTo(X(i0), yb + 80); g.lineTo(X(i1), yb + 80); g.lineTo(X(i1), yb + 60); g.stroke(); g.restore(); text(g, '8.4 km', (X(i0) + X(i1)) / 2, yb + 122, `500 46px ${F.num}`, COL.amber, 'center', kb); }
  text(g, 'CROSS-SECTION AT 26.06°N · height ×40', 160, 140, `400 22px ${F.mono}`, COL.dim, 'left', k, false);
  text(g, Math.round(Math.max(...P.m)) + ' m', X(P.m.indexOf(Math.max(...P.m))), Y(P.m.indexOf(Math.max(...P.m))) - 16, `400 22px ${F.mono}`, COL.dim, 'left', k, false);
}
function rangeLine(g, t, cam) {
  const t0 = at('c1g', .1), t1 = t0 + 1.6; if (t < at('c1g') - .4) return;
  const A = project(cam, M.lat, M.lon0), B = project(cam, M.lat, M.lon1), a = win(t, at('c1g') - .4, at('c1h'), .4);
  const k = eo(pr(t, t0, t1)), tip = [lerp(A[0], B[0], k), lerp(A[1], B[1], k)];
  g.save(); g.globalAlpha = a; g.lineCap = 'round';
  for (const E of [A, B]) { g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 6; g.beginPath(); g.moveTo(E[0], E[1] - 46); g.lineTo(E[0], E[1] + 46); g.stroke(); g.strokeStyle = COL.text; g.lineWidth = 3; g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 7; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(tip[0], tip[1]); g.stroke(); g.strokeStyle = COL.amber; g.lineWidth = 4; g.stroke();
  for (let i = 1; i <= Math.floor(8.4 * k); i++) { const u = i / 8.4, x = lerp(A[0], B[0], u), y = lerp(A[1], B[1], u); g.beginPath(); g.moveTo(x, y - 12); g.lineTo(x, y + 12); g.lineWidth = 2; g.stroke(); }
  g.restore();
  G.counter(g, t, t0, at('c1h'), { to: 8.4, fmt: v => v.toFixed(1) + ' km', label: 'THE WHOLE GREEN STRIP', sub: 'narrowest point · measured on Landsat 9' });
}

// ———— setup, state, events ————
export function setup(timing, ch, g) {
  C = timing[ch]; DUR = C.dur;
  at = (id, f = 0) => { const L = C.lines.find(l => l.id === id); if (!L) throw new Error('no line ' + id); return L.t + L.d * f; };
  SHOTS = { 1: chapter1 }[ch]();
  for (const S of SHOTS) if (S.keys) { const K = S.keys.map(([t, la, lo, d]) => [t, [la, lo, Math.log10(d)]]); const tr = track(K); S.cam = t => { const [la, lo, ld] = tr(t); return makeCamera({ lat: la, lon: lo, d: Math.pow(10, ld), fov: 32 }, W, H); }; }
  SUBS = C.lines.map((L, i) => ({ t0: L.t - .05, t1: Math.min((C.lines[i + 1]?.t ?? DUR) - .1, Math.max(L.t + 1.8, L.t + L.d + .5)), text: L.text }));
  EV = C.lines.map(L => ({ t: L.t, type: 'voice', id: L.id }));
  SHOTS.forEach(S => { if (S.amb) EV.push({ t: S.t0, type: 'amb', name: S.amb, dur: S.t1 - S.t0 }); });   // place sound only under its own shot; cuts are silent
  EV.push({ t: .2, type: 'card' });
  EV.push({ t: at('c1b') + .2, type: 'reading', heavy: 1 }, { t: at('c1b', .5) + .2, type: 'reading', heavy: 0 }, { t: at('c1d', .25) + .2, type: 'reading', heavy: 0 }, { t: at('c1g', .1) + 1.6, type: 'reading', heavy: 1 }, { t: at('c1h', .55), type: 'reading', heavy: 0 });
}
export const dur = () => DUR, events = () => EV;
const XF = .5;   // crossfade length
export function frame(t) {   // which shots are on screen and how much
  const out = [];
  SHOTS.forEach((S, i) => { const a = Math.min(pr(t, S.t0 - XF / 2, S.t0 + XF / 2) || (i === 0 ? 1 : 0), 1 - pr(t, S.t1 - XF / 2, S.t1 + XF / 2)); const a0 = i === 0 ? 1 - pr(t, S.t1 - XF / 2, S.t1 + XF / 2) : a; if (a0 > 0) out.push({ S, a: a0 }); });
  return out;
}
export function globeState(S, t) {
  const cam = S.cam(t), alt = cam.alt;
  return { cam, st: { bE: EGB, b1: QB, b2: QB, uExpo: 1.04, uAtm: G.clamp((alt - 1500) / 3000), uShade: G.clamp((alt - 1500) / 4000), uDet1: G.clamp((300 - alt) / 200), uDet2: 0, uSwap1: 90, uSwap2: 90,
    uNightA: S.night ? 1 : 0, uNightB: S.night ? 1 : 0, uScanLat: 60, uGrey: S.grey ? .9 : 0, uKeep: S.keep ? 1 : 0, uOutline: S.night ? .8 : 0 } };
}
export function draw(g, t, photos, layers) {   // 2D layer: photos + infographics; layers = [{S, a}]
  g.clearRect(0, 0, W, H);
  for (const { S, a } of layers) {
    if (S.type === 'photo') G.photo(g, photos[S.img], t, S.t0 - XF, S.t1 + XF, S.from, S.to, a);
    if (S.type === 'graphic') { g.save(); g.globalAlpha = a; S.draw(g, t, S.t0, S.t1); g.restore(); }
  }
}
export function overlay(g, t, layers, cams) {
  g.clearRect(0, 0, W, H);
  for (const { S, a } of layers) {
    g.save(); g.globalAlpha = a;
    if (S.over) S.over(g, t, cams[SHOTS.indexOf(S)]);
    if (S.lower) G.lower(g, t, S.t0 + .3, S.t1 - .1, ...S.lower);
    if (S.credit) G.credit(g, S.credit, 1);
    if (S.title) G.chapter(g, t, S.t0, S.t1 + .2, ...S.title);
    g.restore();
  }
  const s = SUBS.find(x => t >= x.t0 && t < x.t1); if (s) G.subtitle(g, s.text, pr(t, s.t0, s.t0 + .15) * (1 - pr(t, s.t1 - .12, s.t1)));
}
export { SHOTS };
