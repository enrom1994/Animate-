// "Egypt: one river", studio edit (v2). A shot list per chapter: globe / terrain / photo / archive / graphic shots, 3-8 s each,
// crossfades between them, one graphics package (gfx.js) on top. Timing comes from the narration (timing.json).
// Sound rule (mix.py): cuts are silent; a soft timpani on key numbers; place sounds only under their own photo.
import { makeCamera, project } from './engine.js';
import { track } from '/core/lib.js';
import * as G from './gfx.js';
const { W, H, COL, F, pr, eo, eio, lerp, win, text } = G;
let C, at, DUR, CH, SHOTS = [], SUBS = [], EV = [];
const EGB = [24.0, 21.0, 37.0, 32.5];
const PL = { qena: [32.30, 25.70, 33.05, 26.35], cairo: [30.95, 29.85, 31.55, 30.25], capital: [31.60, 29.93, 31.90, 30.10], rosetta: [30.20, 31.36, 30.50, 31.56], toshka: [30.40, 22.55, 31.70, 23.45] };
const M = { lat: 26.05735, lon0: 32.7521, lon1: 32.8361 };
const RT = { tip72: [31.5044, 30.3567], now: [31.4651, 30.3628] };
const CAIRO = [30.044, 31.236], CAPITAL = [30.035, 31.77], DAM = [23.97, 32.88];
// what each chapter loads: photos (assets/media/<n> or assets/<dir>/<n>), terrain, globe detail slots [A, B, overlay]
export const NEEDS = {
  0: { photos: ['photos/ph_cairo_night', 'luxor_westbank'], terrain: 'qena', slots: [] },
  1: { photos: ['desert_western', 'felucca_aswan'], terrain: 'qena', slots: [['qena', 'qena', null]] },
  2: { photos: ['photos/ph_inundation_1900', 'dam_lemay', 'nasser_view', 'dam_power', 'ploughing', 'plates/qena'], terrain: 'qena', slots: [] },
  3: { photos: [], terrain: null, slots: [['rosetta_1973', 'rosetta_2025', 'rosetta_1972_outline']] },
  4: { photos: ['cairo_skyline', 'photos/ph_cairo_street_1903', 'cairo_hdr', 'cotton_field'], terrain: null, slots: [['cairo_1984', 'cairo_2025', 'cairo_built_overlay']] },
  5: { photos: ['photos/ph_toshka_2005', 'photos/ph_toshka_farms', 'capital_cbd?'], terrain: null, slots: [['capital_2015', 'capital_2025', null], ['toshka_2002', 'toshka_2021', null]] },
  6: { photos: ['dam_lascar'], terrain: null, slots: [] },
};
let IMG = {}, SECTION = {};
export function setAssets(img, sections) { IMG = img; SECTION = sections; }

// —— shot builders ——
const S_ = []; const sh = o => S_.push(o);
const globe = (t0, t1, keys, o = {}) => sh({ type: 'globe', t0, t1, keys, ...o });
const terrain = (t0, t1, view, o = {}) => sh({ type: 'terrain', t0, t1, view, ...o });
const photo = (t0, t1, img, from, to, o = {}) => sh({ type: 'photo', t0, t1, img, from, to, ...o });
const archive = (t0, t1, img, cap, o = {}) => sh({ type: 'graphic', t0, t1, draw: (g, t, a0, a1) => archiveDraw(g, t, a0, a1, img, cap, o.credit ?? 'Library of Congress'), ...o });
const graphic = (t0, t1, draw, o = {}) => sh({ type: 'graphic', t0, t1, draw, ...o });
const qenaFly = (dusk, u0 = 0) => u => ({ x: 47.5, y: 6 + 9 * u, h: 3.2 - .4 * u, tx: 49.5, ty: 34 + 6 * u, th: 0, sunAz: 255, sunEl: dusk ? 8 : 16, haze: 70 });

// ———— chapters ————
const CHAPTERS = {
  0() {
    const a = at;
    globe(0, a('c0c'), [[0, 23.5, 21.0, 14000], [a('c0b'), 26.2, 29.5, 6400], [a('c0c') + .5, 26.8, 30.8, 3300]], { state: t => ({ uNightA: 1, uNightB: 1, uOutline: pr(t, a('c0b'), a('c0b') + 1.2) }) });
    photo(a('c0c'), a('c0d'), 'photos/ph_cairo_night', [.55, .55, 1.0], [.6, .62, 1.25], { credit: 'Photo: NASA / ISS crew', lower: ['CAIRO AND THE NILE AT NIGHT', 'from the International Space Station'] });
    photo(a('c0d'), a('c0d', 1) + .4, 'luxor_westbank', [.5, .5, 1.08], [.42, .5, 1.0], { credit: 'Photo: Vyacheslav Argenberg, CC BY 4.0', amb: 'river' });
    terrain(a('c0d', 1) + .4, DUR, qenaFly(true), { over: (g, t, cam, S) => bigTitle(g, t, S.t0 + .3, DUR + 1, 'EGYPT', 'one river, a hundred million people') });
  },
  1() {
    const a = at;
    terrain(0, a('c1a'), qenaFly(false), { title: ['01', 'A country of 4%'] });
    graphic(a('c1a'), a('c1b'), areaGraphic);
    globe(a('c1b'), a('c1b', .5), [[a('c1b') - .3, 26.6, 30.8, 3600], [a('c1b', .5), 26.7, 30.9, 3000]], { state: () => ({ uNightA: 1, uNightB: 1, uOutline: .8 }),
      over: (g, t) => G.counter(g, t, a('c1b') + .1, a('c1b', .5), { to: 95, fmt: v => Math.round(v) + '%', label: 'OF EGYPTIANS LIVE ALONG THE NILE', sub: 'approx. · FAO, Britannica' }) });
    globe(a('c1b', .5), a('c1c'), [[a('c1b', .5), 26.7, 30.9, 3000], [a('c1c'), 26.5, 31.2, 2400]], { state: () => ({ uGrey: .9, uKeep: 1 }),
      over: (g, t) => G.counter(g, t, a('c1b', .5) + .1, a('c1c'), { to: 4, fmt: v => '≈' + Math.round(v) + '%', label: 'OF THE LAND', sub: 'Nile valley + delta · FAO', col: COL.green }) });
    photo(a('c1c'), a('c1c', .48), 'desert_western', [.35, .5, 1.12], [.6, .5, 1.02], { amb: 'desert', lower: ['THE SAHARA', 'Western Desert, Egypt'], credit: 'Photo: Vyacheslav Argenberg, CC BY 4.0' });
    graphic(a('c1c', .48), a('c1d'), rainGraphic);
    photo(a('c1d'), a('c1e'), 'felucca_aswan', [.45, .45, 1.18], [.52, .5, 1.04], { amb: 'river', credit: 'Photo: Vyacheslav Argenberg, CC BY 4.0',
      over: (g, t) => G.counter(g, t, a('c1d', .25), a('c1e'), { to: 97, fmt: v => '≈' + Math.round(v) + '%', label: "OF EGYPT'S RENEWABLE WATER", sub: 'from the Nile · Nile Basin Initiative', col: COL.teal }) });
    terrain(a('c1e'), a('c1f'), u => ({ x: 49.0 + 1.2 * u, y: 24 + 9 * eio(u), h: 1.1, tx: 49.6, ty: 50 + 6 * u, th: .1, sunAz: 250, sunEl: 15, haze: 55 }), { lower: ['THE NILE VALLEY NEAR QENA', '3D: NASADEM elevation ×3 · Landsat 9, 2025'] });
    globe(a('c1f'), a('c1h'), [[a('c1f') - .3, 26.4, 31.9, 1400], [a('c1f', .9), M.lat, (M.lon0 + M.lon1) / 2, 40], [a('c1h'), M.lat, (M.lon0 + M.lon1) / 2, 34]],
      { over: (g, t, cam) => { G.lower(g, t, a('c1f', .4), a('c1g') - .2, 'LANDSAT 9 · 8 OCTOBER 2025', 'Qena, Egypt · 30 m per pixel · USGS'); range(g, t, cam, [M.lat, M.lon0], [M.lat, M.lon1], 8.4, a('c1g', .1), a('c1g') - .4, a('c1h'), 'THE WHOLE GREEN STRIP', 'narrowest point · measured on Landsat 9'); } });
    graphic(a('c1h'), DUR, sectionGraphic);
  },
  2() {
    const a = at;
    terrain(0, a('c2a'), u => ({ x: 49 + 3 * u, y: 30 + 4 * u, h: 4.5, tx: 47, ty: 52, th: 0, sunAz: 120, sunEl: 20, haze: 75 }), { title: ['02', 'The flood that built Egypt'] });
    archive(a('c2a'), a('c2b'), 'photos/ph_inundation_1900', '1900 · the Nile in flood at Giza');
    graphic(a('c2b'), a('c2c'), floodGraphic);
    globe(a('c2c'), a('c2d'), [[a('c2c') - .3, 26.1, 32.6, 900], [a('c2d'), 25.9, 32.7, 700]], { state: t => ({ uFlood: 1 - eo(pr(t, a('c2c', .2), a('c2c', .95))) }),
      over: (g, t) => G.lower(g, t, a('c2c', .2), a('c2d') - .1, 'THE WATER DRAWS BACK', 'and leaves the mud behind') });
    graphic(a('c2d'), a('c2e'), kemetGraphic);
    photo(a('c2e'), a('c2f'), 'dam_lemay', [.5, .55, 1.15], [.45, .5, 1.02], { lower: ['ASWAN HIGH DAM', 'completed 1970'], credit: 'Photo: Warren LeMay, CC0' });
    photo(a('c2f'), a('c2f2'), 'nasser_view', [.45, .55, 1.15], [.55, .5, 1.02], { lower: ['LAKE NASSER', 'seen from the High Dam'], credit: 'Photo: Warren LeMay, CC0', amb: 'river' });
    globe(a('c2f2'), a('c2g'), [[a('c2f2') - .3, 22.9, 32.1, 1500], [a('c2g'), 23.1, 32.3, 1350]],
      { over: (g, t) => G.counter(g, t, a('c2f2', .3), a('c2g'), { to: 550, fmt: v => '≈' + Math.round(v) + ' km', label: 'LONG, FROM EGYPT INTO SUDAN', sub: 'Lake Nasser + Lake Nubia · approx.' }) });
    photo(a('c2g'), a('c2h'), 'dam_power', [.45, .5, 1.12], [.55, .48, 1.0], { lower: ['WATER ALL YEAR, AND ELECTRICITY', 'the High Dam power station'], credit: 'Photo: Vyacheslav Argenberg, CC BY 4.0' });
    graphic(a('c2h'), a('c2i'), sedimentGraphic);
    archive(a('c2i'), DUR, 'ploughing', 'ploughing a field in the Nile valley · Matson collection');
  },
  3() {
    const a = at, tsw = a('c3c', .3);
    globe(0, a('c3a'), [[0, 30.9, 31.0, 1100], [a('c3a'), 31.2, 30.8, 600]], { title: ['03', 'The coast pulls back'] });
    globe(a('c3a'), a('c3f', .6), [[a('c3a'), 31.2, 30.8, 600], [a('c3a', .9), 31.468, 30.355, 25], [a('c3d'), 31.475, 30.358, 21], [a('c3e', .4), 31.468, 30.36, 22], [a('c3f'), 31.469, 30.36, 21], [a('c3f', .6), 31.3, 30.6, 250]],
      { state: t => ({ uSwap1: swapLat(PL.rosetta, t, tsw), uSwapOn1: t > tsw && t < tsw + 1.8 ? 1 : 0, uOver1: pr(t, tsw + 1.4, tsw + 2.2) * (1 - pr(t, a('c3f'), a('c3f', .4))) }),
        over: (g, t, cam) => {
          G.lower(g, t, a('c3a', .8), tsw + .2, 'ROSETTA · 31 AUGUST 1972', 'Landsat 1 · where the Nile meets the Mediterranean');
          G.lower(g, t, tsw + .8, a('c3d') - .2, 'ROSETTA · 19 AUGUST 2025', 'Landsat 9 · the white line: the coast in 1972');
          range(g, t, cam, RT.now, RT.tip72, 3.8, a('c3d', .05), a('c3d') - .3, a('c3e'), 'THE TIP HAS PULLED BACK', '1972 → 2025 · Landsat · measured');
          pin(g, t, cam, [31.462, 30.366], 'SEA WALL', 'built 1991', a('c3e', .5), a('c3f'));
        } });
    graphic(a('c3f', .6), DUR, deltaGraphic);
  },
  4() {
    const a = at, tsw = a('c4e', .2);
    photo(0, a('c4a'), 'cairo_skyline', [.5, .5, 1.12], [.45, .5, 1.02], { title: ['04', 'A city on its own fields'], amb: 'city', credit: 'Photo: Vyacheslav Argenberg, CC BY 4.0' });
    archive(a('c4a'), a('c4b'), 'photos/ph_cairo_street_1903', '1903 · street life in Cairo');
    graphic(a('c4b'), a('c4c'), popGraphic);
    photo(a('c4c'), a('c4d'), 'cairo_hdr', [.42, .5, 1.15], [.5, .5, 1.02], { amb: 'city', credit: 'Photo: Andrew A. Shenouda, CC BY 2.0',
      over: (g, t) => G.counter(g, t, a('c4c', .2), a('c4d'), { to: 25, fmt: v => '≈' + Math.round(v) + ' million', label: 'CAIRO · THE LARGEST CITY IN AFRICA', sub: 'UN World Urbanization Prospects 2025' }) });
    globe(a('c4d'), a('c4h'), [[a('c4d') - .3, 30.2, 31.2, 300], [a('c4d', .6), 30.05, 31.25, 50], [a('c4g'), 30.05, 31.25, 46], [a('c4g2'), 30.08, 31.2, 34], [a('c4h'), 30.1, 31.15, 26]],
      { state: t => ({ uSwap1: swapLat(PL.cairo, t, tsw), uSwapOn1: t > tsw && t < tsw + 1.8 ? 1 : 0, uOver1: pr(t, a('c4g', .3), a('c4g', .6)) * .9 }),
        over: (g, t, cam) => {
          G.lower(g, t, a('c4d', .3), tsw + .2, 'CAIRO · 20 APRIL 1984', 'Landsat 5'); G.lower(g, t, tsw + .8, a('c4g', .3), 'CAIRO · 5 APRIL 2025', 'Landsat 8');
          for (const [ll, side, k0] of [[[30.02, 31.05], -1, a('c4f', .3)], [[30.03, 31.47], 1, a('c4f', .45)]]) pin(g, t, cam, ll, 'NEW CITY', null, k0, a('c4g'), side);
          G.counter(g, t, a('c4g', .5), a('c4h') + .5, { to: 25, fmt: v => '≈ 1 in 4', label: 'GREEN FIELDS OF 1984, NOW BUILT OVER', sub: 'red · Landsat 5 → 8, same season · measured', col: COL.red });
        } });
    archive(a('c4h'), DUR, 'cotton_field', 'a cotton field in the Nile valley · Matson collection');
  },
  5() {
    const a = at, ts1 = a('c5c'), ts2 = a('c5f');
    globe(0, a('c5a'), [[0, 30.05, 31.45, 450], [a('c5a'), 30.03, 31.6, 200]], { title: ['05', 'Into the desert'] });
    globe(a('c5a'), a('c5d'), [[a('c5a'), 30.03, 31.6, 200], [a('c5b'), 30.015, 31.75, 25], [a('c5d'), 30.015, 31.75, 21]],
      { state: t => ({ uSwap1: swapLat(PL.capital, t, ts1), uSwapOn1: t > ts1 && t < ts1 + 1.8 ? 1 : 0 }),
        over: (g, t, cam) => { G.lower(g, t, a('c5b'), ts1 + .2, 'EAST OF CAIRO · SEPTEMBER 2015', 'Landsat 8'); G.lower(g, t, ts1 + .8, a('c5d'), 'NEW ADMINISTRATIVE CAPITAL · SEPTEMBER 2025', 'Landsat 9 · announced 2015'); } });
    if (IMG['capital_cbd']) { const k = S_.length - 1; S_[k].t1 = a('c5c', .6); photo(a('c5c', .6), a('c5d'), 'capital_cbd', [.5, .5, 1.1], [.5, .45, 1.0], { credit: 'Photo: Youssef Abdelwahab, CC BY 4.0' }); }
    globe(a('c5d'), a('c5e', .45), [[a('c5d') - .3, 26.5, 31.6, 2200], [a('c5e'), 23.0, 31.22, 98]], { state: () => ({ uSwap1: 0 }) });
    photo(a('c5e', .45), a('c5f'), 'photos/ph_toshka_2005', [.5, .5, 1.12], [.55, .55, 1.0], { lower: ['THE TOSHKA LAKES', 'from the International Space Station, 2005'], credit: 'Photo: NASA / ISS crew' });
    globe(a('c5f'), a('c5g', .3), [[a('c5f') - .3, 23.0, 31.22, 98], [a('c5g', .3), 23.0, 31.22, 92]], { state: t => ({ uSwap1: 0, uSwap2: swapLat(PL.toshka, t, ts2), uSwapOn2: t > ts2 && t < ts2 + 1.8 ? 1 : 0 }),
      over: (g, t) => { G.counter(g, t, a('c5f', .1), a('c5f', .55), { to: 584, fmt: v => Math.round(v) + ' km²', label: 'OF LAKE · DECEMBER 2001', sub: 'in this frame · Landsat 7 · measured', col: COL.teal });
        G.counter(g, t, a('c5f', .55), a('c5g', .3), { from: 584, to: 955, fmt: v => Math.round(v) + ' km²', label: 'OF LAKE · OCTOBER 2021', sub: 'in this frame · Landsat 8 · measured', col: COL.teal }); } });
    photo(a('c5g', .3), DUR, 'photos/ph_toshka_farms', [.62, .3, 1.25], [.55, .4, 1.02], { lower: ['NEW FARMS, WATERED FROM THE LAKE', 'from the International Space Station, 2025'], credit: 'Photo: NASA / ISS crew' });
  },
  6() {
    const a = at;
    globe(0, a('c6b'), [[0, 25.5, 31.0, 2600], [a('c6b'), 26.5, 31.0, 5200, 14]], { state: t => ({ uNightA: 0, uNightB: 1, uScanLat: lerp(40, -50, pr(t, a('c6a'), a('c6a') + 3)), uScanOn: t > a('c6a') && t < a('c6a') + 3.2 ? 1 : 0 }) });
    photo(a('c6b'), a('c6b', 1) + .2, 'dam_lascar', [.4, .5, 1.12], [.55, .5, 1.0], { credit: 'Photo: Jorge Láscar, CC BY 2.0' });
    globe(a('c6b', 1) + .2, DUR, [[a('c6b', 1), 26.6, 31.0, 7000], [DUR, 26.8, 31.0, 9500]], { state: () => ({ uNightA: 1, uNightB: 1 }),
      over: (g, t, cam, S) => { bigTitle(g, t, S.t0 + .2, DUR + 1, 'One river.', '100 million people.');
        if (t > a('c6c')) text(g, 'Which country next?  Tell us in the comments.', W / 2, H / 2 + 210, `400 30px ${F.mono}`, COL.text, 'center', pr(t, a('c6c'), a('c6c') + .5)); } });
  },
};

// —— marks shared by chapters ——
const swapLat = (bb, t, t0, dt = 1.6) => t < t0 ? bb[3] + .05 : lerp(bb[3] + .05, bb[1] - .05, eo(pr(t, t0, t0 + dt)));
function range(g, t, cam, A0, B0, km, t0, tShow, tEnd, label, note) {
  if (t < tShow || t > tEnd + .4) return;
  const A = project(cam, ...A0), B = project(cam, ...B0), a = win(t, tShow, tEnd, .4), k = eo(pr(t, t0, t0 + 1.6)), tip = [lerp(A[0], B[0], k), lerp(A[1], B[1], k)];
  g.save(); g.globalAlpha = a; g.lineCap = 'round';
  for (const E of [A, B]) { g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 6; g.beginPath(); g.moveTo(E[0], E[1] - 40); g.lineTo(E[0], E[1] + 40); g.stroke(); g.strokeStyle = COL.text; g.lineWidth = 3; g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 7; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(tip[0], tip[1]); g.stroke(); g.strokeStyle = COL.amber; g.lineWidth = 4; g.stroke();
  for (let i = 1; i <= Math.floor(km * k); i++) { const u = i / km, x = lerp(A[0], B[0], u), y = lerp(A[1], B[1], u); g.beginPath(); g.moveTo(x - (B[1] - A[1]) / Math.hypot(B[0] - A[0], B[1] - A[1]) * 12, y + (B[0] - A[0]) / Math.hypot(B[0] - A[0], B[1] - A[1]) * 12); g.lineTo(x + (B[1] - A[1]) / Math.hypot(B[0] - A[0], B[1] - A[1]) * 12, y - (B[0] - A[0]) / Math.hypot(B[0] - A[0], B[1] - A[1]) * 12); g.lineWidth = 2; g.stroke(); }
  g.restore();
  G.counter(g, t, t0, tEnd, { to: km, fmt: v => v.toFixed(1) + ' km', label, sub: note });
}
function pin(g, t, cam, ll, label, sub, t0, t1, side = 1) {
  const a = win(t, t0, t1, .4); if (a <= 0) return; const [x, y, vis] = project(cam, ...ll); if (!vis) return;
  const k = eo(pr(t, t0, t0 + .5)), r = 34;
  g.save(); g.globalAlpha = a; g.strokeStyle = COL.amber; g.lineWidth = 3; g.beginPath(); g.arc(x, y, r * (1.6 - .6 * k), 0, Math.PI * 2); g.stroke();
  g.strokeStyle = COL.text; g.lineWidth = 2; g.beginPath(); g.moveTo(x + side * r * .7, y - r * .7); g.lineTo(x + side * (r + 90 * k), y - r - 90 * k); g.lineTo(x + side * (r + 90 * k + 30), y - r - 90 * k); g.stroke(); g.restore();
  text(g, label, x + side * (r + 130), y - r - 82, `600 34px ${F.lab}`, COL.text, side > 0 ? 'left' : 'right', a * k, true, 3);
  if (sub) text(g, sub, x + side * (r + 130), y - r - 50, `400 22px ${F.mono}`, COL.dim, side > 0 ? 'left' : 'right', a * k);
}
function bigTitle(g, t, t0, t1, big, small) {
  const a = win(t, t0, t1, .6); if (a <= 0) return; const k = eo(pr(t, t0, t0 + 1));
  g.save(); g.globalAlpha = a * .45; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore();
  text(g, big, W / 2, H / 2 - 10 + 20 * (1 - k), `500 150px ${F.num}`, COL.text, 'center', a * k, true, 6);
  g.save(); g.globalAlpha = a; g.fillStyle = COL.amber; g.fillRect(W / 2 - 200 * k, H / 2 + 30, 400 * k, 3); g.restore();
  text(g, small, W / 2, H / 2 + 100, `400 40px ${F.lab}`, COL.amber, 'center', a * pr(t, t0 + .6, t0 + 1.2), true, 2);
}
// archive photo: sharp print centred over a blurred, darkened copy of itself, warm grade, slow push
function archiveDraw(g, t, t0, t1, img, cap, credit) {
  const im = IMG[img]; if (!im) return; const u = eio(pr(t, t0 - .5, t1 + .5)), ar = im.width / im.height;
  g.save(); g.filter = 'blur(28px) brightness(.45) sepia(.4)'; const s0 = Math.max(W / im.width, H / im.height) * 1.15; g.drawImage(im, W / 2 - im.width * s0 / 2, H / 2 - im.height * s0 / 2, im.width * s0, im.height * s0); g.restore();
  const h = 760 * (1 + .05 * u), w = h * ar; g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 50; g.shadowOffsetY = 16; g.filter = 'sepia(.25) contrast(1.05)'; g.drawImage(im, W / 2 - w / 2, H / 2 - 40 - h / 2, w, h); g.restore();
  text(g, cap, W / 2 - w / 2, H / 2 - 40 + h / 2 + 46, `400 24px ${F.mono}`, COL.text, 'left', 1);
  text(g, credit, W / 2 + w / 2, H / 2 - 40 + h / 2 + 46, `400 22px ${F.mono}`, COL.dim, 'right', 1);
}

// —— infographics ——
function areaGraphic(g, t, t0, t1) {
  G.bg(g); const k = eo(pr(t, t0 + .1, t0 + 1.2)), k2 = eo(pr(t, t0 + 1.2, t0 + 2.3));
  const sq = (x, y, area, col, k) => { const s = Math.sqrt(area) * 600 / Math.sqrt(1001450) * k; g.save(); g.fillStyle = col; g.globalAlpha = .9; g.fillRect(x, y - s, s, s); g.restore(); return s; };
  const base = 820; sq(260, base, 1001450, COL.amber, k);
  text(g, 'EGYPT', 260, base + 52, `600 34px ${F.lab}`, COL.text, 'left', k, true, 3); text(g, Math.round(1001450 * k).toLocaleString('en-US') + ' km²', 260, base + 96, `500 44px ${F.num}`, COL.amber, 'left', k);
  sq(1060, base, 551500, COL.blue, k2); sq(1060 + Math.sqrt(551500) * 600 / Math.sqrt(1001450) + 20, base, 357600, COL.teal, k2);
  text(g, 'FRANCE + GERMANY', 1060, base + 52, `600 34px ${F.lab}`, COL.text, 'left', k2, true, 3); text(g, Math.round(909100 * k2).toLocaleString('en-US') + ' km²', 1060, base + 96, `500 44px ${F.num}`, COL.blue, 'left', k2);
  text(g, 'land area · France: metropolitan', W - 120, H - 60, `400 20px ${F.mono}`, COL.dim, 'right', k2, false);
}
function rainGraphic(g, t, t0, t1) {
  G.bg(g); const k = eo(pr(t, t0 + .2, t0 + 1.6)); const x = 760, y0 = 860, hcm = 52;
  g.save(); g.strokeStyle = 'rgba(244,242,238,.8)'; g.lineWidth = 3; g.strokeRect(x, y0 - 10 * hcm, 160, 10 * hcm);
  for (let c = 0; c <= 10; c++) { g.beginPath(); g.moveTo(x + 160, y0 - c * hcm); g.lineTo(x + 180, y0 - c * hcm); g.stroke(); text(g, c + ' cm', x + 192, y0 - c * hcm + 8, `400 22px ${F.mono}`, COL.dim, 'left', 1, false); }
  const lvl = 2.5 * k; const gr = g.createLinearGradient(0, y0 - lvl * hcm, 0, y0); gr.addColorStop(0, '#7fb6e6'); gr.addColorStop(1, '#3e6fa6'); g.fillStyle = gr; g.fillRect(x + 3, y0 - lvl * hcm, 154, lvl * hcm - 3); g.restore();
  G.counter(g, t, t0 + .1, t1 + .4, { to: 2.5, fmt: v => '< 3 cm', label: 'RAIN IN A WHOLE YEAR · CAIRO', sub: 'climate normals ≈ 18–25 mm', col: '#7fb6e6' });
}
function sectionGraphic(g, t, t0, t1) {
  G.bg(g); const P = SECTION.qena; if (!P) return; const n = P.km.length, x0 = 160, x1 = W - 160, yb = 760, ex = .55;
  const X = i => lerp(x0, x1, i / (n - 1)), Y = i => yb - (P.m[i] - 40) * ex;
  const k = eo(pr(t, t0 + .1, t0 + 1.4)), m = Math.ceil(n * k);
  const i0 = P.lon.findIndex(l => l >= P.measure[0]), i1 = P.lon.findIndex(l => l >= P.measure[1]);
  g.save(); g.beginPath(); g.moveTo(X(0), yb + 120); for (let i = 0; i < m; i++) g.lineTo(X(i), Y(i)); g.lineTo(X(m - 1), yb + 120); g.closePath(); g.fillStyle = '#b89668'; g.fill();
  for (let i = 0; i < m - 1; i++) if (i >= i0 && i <= i1) { g.fillStyle = P.refl[i] < .06 ? '#3d78b8' : '#5f8f46'; g.fillRect(X(i), Y(i), X(i + 1) - X(i) + 1, 18); }
  g.beginPath(); for (let i = 0; i < m; i++) i ? g.lineTo(X(i), Y(i)) : g.moveTo(X(i), Y(i)); g.strokeStyle = COL.text; g.lineWidth = 3; g.stroke(); g.restore();
  const L = (s, i, dy, tt, col = COL.text) => { const a = pr(t, tt, tt + .4); if (a <= 0) return; g.save(); g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.moveTo(X(i), Y(i) - 6); g.lineTo(X(i), Y(i) - dy); g.stroke(); g.restore(); text(g, s, X(i), Y(i) - dy - 12, `600 28px ${F.lab}`, col, 'center', a, true, 2); };
  const ir = P.refl.reduce((b, r, i) => (i > i0 && i < i1 && r < P.refl[b]) ? i : b, i0 + 1), iv = Math.round(lerp(i0, i1, .82));
  L('FIELDS', Math.round(lerp(i0, ir, .4)), 110, at('c1h') + .1, COL.green); L('VILLAGES', Math.round(lerp(ir, i1, .45)), 170, at('c1h', .18)); L('ROADS', iv, 120, at('c1h', .3)); L('RIVER', ir, 230, at('c1h', .45), COL.blue);
  L('SAND', 25, 90, at('c1h', .75), COL.sand); L('SAND', n - 25, 90, at('c1h', .8), COL.sand);
  const kb = pr(t, at('c1h', .55), at('c1h', .55) + .5);
  if (kb > 0) { g.save(); g.globalAlpha = kb; g.strokeStyle = COL.amber; g.lineWidth = 3; g.beginPath(); g.moveTo(X(i0), yb + 60); g.lineTo(X(i0), yb + 80); g.lineTo(X(i1), yb + 80); g.lineTo(X(i1), yb + 60); g.stroke(); g.restore(); text(g, '8.4 km', (X(i0) + X(i1)) / 2, yb + 122, `500 46px ${F.num}`, COL.amber, 'center', kb); }
  const mx = Math.max(...P.m), im = P.m.indexOf(mx);
  text(g, 'CROSS-SECTION AT 26.06°N · height ×40', 160, 140, `400 22px ${F.mono}`, COL.dim, 'left', k, false); text(g, Math.round(mx) + ' m', X(im), Y(im) - 16, `400 22px ${F.mono}`, COL.dim, 'left', k, false);
}
function floodGraphic(g, t, t0, t1) {   // the yearly flood, schematic: river level through the year
  G.bg(g); const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'], x0 = 220, x1 = W - 220, yb = 780, hh = 420;
  const lvl = m => .12 + .88 * Math.exp(-Math.pow((m - 8.1) / 1.5, 2));     // low until June, peak around late August / September
  const k = eo(pr(t, t0 + .2, t0 + 3.2)), N = 240, X = i => lerp(x0, x1, i / N), Y = i => yb - hh * lvl(i / N * 12);
  mon.forEach((s, i) => text(g, s, lerp(x0, x1, (i + .5) / 12), yb + 50, `400 24px ${F.mono}`, COL.dim, 'center', 1, false));
  g.save(); g.beginPath(); g.moveTo(X(0), yb); for (let i = 0; i <= N * k; i++) g.lineTo(X(i), Y(i)); g.lineTo(X(N * k), yb); g.closePath();
  const gr = g.createLinearGradient(0, yb - hh, 0, yb); gr.addColorStop(0, 'rgba(94,160,220,.9)'); gr.addColorStop(1, 'rgba(62,111,166,.35)'); g.fillStyle = gr; g.fill();
  g.beginPath(); for (let i = 0; i <= N * k; i++) i ? g.lineTo(X(i), Y(i)) : g.moveTo(X(i), Y(i)); g.strokeStyle = COL.text; g.lineWidth = 3; g.stroke(); g.restore();
  text(g, 'THE SUMMER FLOOD', 220, 210, `600 40px ${F.lab}`, COL.text, 'left', pr(t, t0, t0 + .5), true, 3);
  text(g, 'rain on the Ethiopian highlands → the Nile rises in Egypt in late summer', 220, 256, `400 24px ${F.mono}`, COL.dim, 'left', pr(t, t0 + .3, t0 + .8), false);
  const kp = pr(t, t0 + 3.0, t0 + 3.5); text(g, 'PEAK', X(N * 8.1 / 12), Y(N * 8.1 / 12) - 24, `600 30px ${F.lab}`, COL.amber, 'center', kp, true, 3);
  text(g, 'schematic river level, before the High Dam', W - 220, H - 60, `400 20px ${F.mono}`, COL.dim, 'right', 1, false);
}
function kemetGraphic(g, t, t0, t1) {   // the edge of the fields on the real image: black land / red land
  const im = IMG['plates/qena']; if (!im) return; const u = eio(pr(t, t0, t1)), [w, s, e, n] = PL.qena;
  const lon = 32.735, lat = 26.07, cx = (lon - w) / (e - w) * im.width, cy = (n - lat) / (n - s) * im.height, z = 3.2 - .3 * u;
  const sw = W / z, shh = H / z; g.save(); g.drawImage(im, cx - sw / 2, cy - shh / 2, sw, shh, 0, 0, W, H);
  const v = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = v; g.fillRect(0, 0, W, H); g.restore();
  const k1 = pr(t, t0 + .3, t0 + .8), k2 = pr(t, t0 + 1.6, t0 + 2.1);
  text(g, 'KEMET', W * .72, H * .42, `500 120px ${F.num}`, COL.text, 'center', k1, true, 8); text(g, '"the black land" · the river mud', W * .72, H * .42 + 50, `400 26px ${F.mono}`, COL.text, 'center', k1);
  text(g, 'DESHRET', W * .25, H * .42, `500 120px ${F.num}`, COL.sand, 'center', k2, true, 8); text(g, '"the red land" · the desert', W * .25, H * .42 + 50, `400 26px ${F.mono}`, COL.sand, 'center', k2);
  G.credit(g, 'Landsat 9 · 2025-10-08 · USGS', 1);
}
function sedimentGraphic(g, t, t0, t1) {
  G.bg(g); const bar = (y, label, parts, k) => { let x = 220; const Wd = W - 440;
    text(g, label, 220, y - 24, `600 32px ${F.lab}`, COL.text, 'left', k, true, 3);
    for (const [frac, col, name] of parts) { const w = Wd * frac * k; g.save(); g.globalAlpha = k; g.fillStyle = col; g.fillRect(x, y, w, 70); g.restore(); if (name && k > .9) text(g, name, x + 14, y + 46, `500 28px ${F.lab}`, '#10161b', 'left', pr(k, .9, 1), false); x += w; } };
  bar(380, 'BEFORE THE DAM: the mud travelled on', [[1, COL.sand, 'to the fields, the delta and the sea']], eo(pr(t, t0 + .2, t0 + 1.4)));
  bar(640, 'TODAY', [[.98, '#7f6a52', 'settles in Lake Nasser'], [.02, COL.blue, '']], eo(pr(t, t0 + 2.0, t0 + 3.2)));
  G.counter(g, t, t0 + 2.6, t1 + .4, { to: 98, fmt: v => '> ' + Math.round(v) + '%', label: 'TRAPPED BEHIND THE DAM', sub: 'IAHR / studies of the High Dam', x: 220, y: 900, size: 120 });
  
}
function deltaGraphic(g, t, t0, t1) {   // NASADEM profile, Cairo → the sea, along 31°E
  G.bg(g); const P = SECTION.delta; if (!P) return; const idx = P.lat.map((l, i) => i).filter(i => P.lat[i] >= 30.2);
  const x0 = 220, x1 = W - 220, yb = 760, ex = 9, k = eo(pr(t, t0 + .2, t0 + 1.8)), m = Math.ceil(idx.length * k);
  const X = j => lerp(x0, x1, j / (idx.length - 1)), Y = j => yb - Math.max(-2, P.m[idx[j]]) * ex;
  g.save(); g.strokeStyle = COL.blue; g.lineWidth = 2; g.setLineDash([12, 10]); g.beginPath(); g.moveTo(x0, yb); g.lineTo(x1 + 80, yb); g.stroke(); g.restore();
  text(g, 'SEA LEVEL', x1 + 80, yb - 14, `600 26px ${F.lab}`, COL.blue, 'right', 1, true, 3);
  g.save(); g.beginPath(); g.moveTo(X(0), yb + 140); for (let j = 0; j < m; j++) g.lineTo(X(j), Y(j)); g.lineTo(X(m - 1), yb + 140); g.closePath(); g.fillStyle = COL.green; g.globalAlpha = .85; g.fill(); g.restore();
  g.save(); g.beginPath(); for (let j = 0; j < m; j++) j ? g.lineTo(X(j), Y(j)) : g.moveTo(X(j), Y(j)); g.strokeStyle = COL.text; g.lineWidth = 3; g.stroke(); g.restore();
  text(g, 'CAIRO', X(0), yb + 190, `600 30px ${F.lab}`, COL.text, 'left', 1, true, 3); text(g, 'THE COAST', X(idx.length - 1), yb + 190, `600 30px ${F.lab}`, COL.text, 'right', pr(t, t0 + 1.6, t0 + 2.0), true, 3);
  text(g, '~155 km', (x0 + x1) / 2, yb + 190, `400 24px ${F.mono}`, COL.dim, 'center', 1, false);
  G.counter(g, t, t0 + 1.8, t1 + .5, { to: 3, fmt: v => '< ' + Math.round(v) + ' m', label: 'ABOVE THE SEA, FOR THE LAST ~50 km', sub: 'NASADEM, median across 31.0–31.1°E · height ×9', x: 220, y: 330, size: 130 });
}
function popGraphic(g, t, t0, t1) {   // one dot = one million people
  G.bg(g); const cols = 22, d = 34, x0 = 980, y0 = 230, n1 = 27, n2 = 109, k1 = pr(t, t0 + .2, t0 + 1.4), k2 = pr(t, t0 + .45 * (t1 - t0), t0 + .45 * (t1 - t0) + 2.2);
  const n = Math.round(lerp(0, n1, k1) + (n2 - n1) * eo(k2));
  for (let i = 0; i < n; i++) { const r = Math.floor(i / cols), c = i % cols; g.save(); g.fillStyle = i < n1 ? COL.text : COL.amber; g.beginPath(); g.arc(x0 + c * d, y0 + r * d, 11, 0, Math.PI * 2); g.fill(); g.restore(); }
  G.counter(g, t, t0 + .1, t0 + .45 * (t1 - t0), { to: 27, fmt: v => Math.round(v) + ' million', label: 'EGYPTIANS IN 1960', sub: 'UN population estimates', col: COL.text });
  G.counter(g, t, t0 + .45 * (t1 - t0), t1 + .4, { from: 27, to: 109, fmt: v => Math.round(v) + ' million', label: 'EGYPTIANS IN 2026', sub: 'CAPMAS population clock' });
  text(g, '● = 1 million people', x0, y0 + 6 * d + 40, `400 22px ${F.mono}`, COL.dim, 'left', 1, false);
}

// ———— setup, state, events ————
export function setup(timing, ch, g) {
  CH = ch; C = timing[ch]; DUR = C.dur; S_.length = 0;
  at = (id, f = 0) => { const L = C.lines.find(l => l.id === id); if (!L) throw new Error('no line ' + id); return L.t + L.d * f; };
  CHAPTERS[ch](); SHOTS = S_.slice();
  for (const S of SHOTS) if (S.keys) { const K = S.keys.map(([t, la, lo, d, tilt = 0]) => [t, [la, lo, Math.log10(d), tilt]]); const tr = track(K); S.cam = t => { const [la, lo, ld, tl] = tr(t); return makeCamera({ lat: la, lon: lo, d: Math.pow(10, ld), tilt: tl, fov: 32 }, W, H); }; }
  SUBS = C.lines.map((L, i) => ({ t0: L.t - .05, t1: Math.min((C.lines[i + 1]?.t ?? DUR) - .1, Math.max(L.t + 1.8, L.t + L.d + .5)), text: L.text }));
  EV = C.lines.map(L => ({ t: L.t, type: 'voice', id: L.id }));
  SHOTS.forEach(S => { if (S.amb) EV.push({ t: S.t0, type: 'amb', name: S.amb, dur: S.t1 - S.t0 }); });
  const R = (id, f, heavy = 0) => EV.push({ t: at(id, f) + .2, type: 'reading', heavy });
  ({ 0: () => EV.push({ t: at('c0d', 1) + .7, type: 'title' }),
     1: () => { R('c1b', 0, 1); R('c1b', .5); R('c1d', .25); R('c1g', .1, 1); EV[EV.length - 1].t += 1.4; R('c1h', .55); },
     2: () => { R('c2f2', .3); R('c2h', .37, 1); },
     3: () => { EV.push({ t: at('c3d', .05) + 1.6, type: 'reading', heavy: 1 }); },
     4: () => { R('c4b', .45, 1); R('c4c', .2); R('c4g', .5, 1); },
     5: () => { R('c5f', .1); R('c5f', .55, 1); },
     6: () => EV.push({ t: at('c6b', 1) + .4, type: 'title' }) })[ch]();
}
export const dur = () => DUR, events = () => EV;
const XF = .5;
export function frame(t) {
  const out = [];
  SHOTS.forEach((S, i) => { const fin = i === 0 ? 1 : pr(t, S.t0 - XF / 2, S.t0 + XF / 2), fout = i === SHOTS.length - 1 ? 1 : 1 - pr(t, S.t1 - XF / 2, S.t1 + XF / 2), a = Math.min(fin, fout); if (a > 0) out.push({ S, a }); });
  return out;
}
// a detail image only shows once it can fill the frame (altitude in km below which it covers the view)
const DET = { 0: [0, 0], 1: [140, 0], 2: [0, 0], 3: [30, 0], 4: [58, 0], 5: [30, 112], 6: [0, 0] };
const det = (alt, a0) => a0 ? G.clamp((a0 - alt) / (a0 * .25)) : 0;
export function globeState(S, t) {
  const cam = S.cam(t), alt = cam.alt, sl = NEEDS[CH].slots;
  const st = { bE: EGB, b1: PL[(sl[0]?.[0] || 'qena_').split('_')[0]] || PL.qena, b2: PL[(sl[1]?.[0] || 'qena_').split('_')[0]] || PL.qena, uExpo: 1.04,
    uAtm: G.clamp((alt - 1500) / 3000), uShade: G.clamp((alt - 1500) / 4000), uDet1: det(alt, DET[CH][0]), uDet2: det(alt, DET[CH][1]), uSwap1: 90, uSwap2: 90,
    uNightA: 0, uNightB: 0, uScanLat: 60, ...(S.state ? S.state(t) : {}) };
  if (CH === 1 || CH === 2) st.b1 = PL.qena;
  return { cam, st };
}
export function draw(g, t, layers) {
  g.clearRect(0, 0, W, H);
  for (const { S, a } of layers) {
    if (S.type === 'photo') G.photo(g, IMG[S.img], t, S.t0 - XF, S.t1 + XF, S.from, S.to, a);
    if (S.type === 'graphic') { g.save(); g.globalAlpha = a; S.draw(g, t, S.t0, S.t1); g.restore(); }
  }
}
export function overlay(g, t, layers, cams) {
  g.clearRect(0, 0, W, H);
  for (const { S, a } of layers) {
    g.save(); g.globalAlpha = a;
    if (S.over) S.over(g, t, cams[SHOTS.indexOf(S)], S);
    if (S.lower) G.lower(g, t, S.t0 + .3, S.t1 - .1, ...S.lower);
    if (S.credit) G.credit(g, S.credit, 1);
    if (S.title) G.chapter(g, t, S.t0, S.t1 + .2, ...S.title);
    g.restore();
  }
  const s = SUBS.find(x => t >= x.t0 && t < x.t1); if (s) G.subtitle(g, s.text, pr(t, s.t0, s.t0 + .15) * (1 - pr(t, s.t1 - .12, s.t1)));
}
export { SHOTS };
