// "Who controls the Nile?" — the Grand Ethiopian Renaissance Dam. Same visual system as "Egypt: one river" (v2):
// globe / terrain / photo / archive / graphic shots, crossfades, one graphics package (gfx.js). Timing from timing.json.
// Script method: stakes first (cold open), conflict-led chapters, both sides stated in their own terms, every number sourced (FACTS.md).
import { makeCamera, project } from './engine.js';
import { track } from '/core/lib.js';
import * as G from './gfx.js';
const { W, H, COL, F, pr, eo, eio, lerp, win, text } = G;
let C, at, DUR, CH, SHOTS = [], SUBS = [], EV = [];
const BASIN = [22.0, -4.0, 46.0, 32.5];
const PL = { res: [34.95, 9.75, 35.95, 11.35], khartoum: [32.40, 15.52, 32.64, 15.72] };
const DAM = [11.215, 35.093], KHT = [15.61, 32.53], CAIRO = [30.044, 31.236], ASWAN = [23.97, 32.88], VIC = [-1.0, 33.0], TANA = [12.0, 37.3], ADDIS = [9.03, 38.74];
const LEVELS = [[2020, 540], [2021, 575], [2022, 600], [2023, 625], [2024, 640]];   // end of each filling (Wikipedia, GERD article)
export const NEEDS = {
  0: { photos: ['eth_countryside', 'photos/ph_gerd_aster'], terrain: true, slots: [] },
  1: { photos: ['bluenile_falls', 'cairo_rowing', 'plates/khartoum'], terrain: false, slots: [] },
  2: { photos: ['khartoum_shadouf', 'eth_plough'], terrain: false, slots: [] },
  3: { photos: ['oromia_village', 'eth_countryside', 'tana_fishermen'], terrain: true, slots: [] },
  4: { photos: [], terrain: true, slots: [], timelapse: true },
  5: { photos: ['nasser_view', 'aswan_lascar', 'photos/ph_iss_2020'], terrain: true, slots: [] },
  6: { photos: ['bluenile_falls', 'photos/ph_iss_2020'], terrain: true, slots: [] },
  7: { photos: [], terrain: false, slots: [] },
};
let IMG = {}, DATA = {};
export function setAssets(img, data) { IMG = img; DATA = data; }

// —— shot builders ——
const S_ = []; const sh = o => S_.push(o);
const globe = (t0, t1, keys, o = {}) => sh({ type: 'globe', t0, t1, keys, ...o });
const terrain = (t0, t1, view, o = {}) => sh({ type: 'terrain', t0, t1, view, ...o });
const photo = (t0, t1, img, from, to, o = {}) => sh({ type: 'photo', t0, t1, img, from, to, ...o });
const archive = (t0, t1, img, cap, o = {}) => sh({ type: 'graphic', t0, t1, draw: (g, t, a0, a1) => archiveDraw(g, t, a0, a1, img, cap, o.credit ?? 'Library of Congress'), ...o });
const graphic = (t0, t1, draw, o = {}) => sh({ type: 'graphic', t0, t1, draw, ...o });
// terrain moves in the gorge (km on the plate: x east from 34.95°E, y north from 10.70°N; the dam is at x 15.6, y 57.0)
const fly = (a, b, o = {}) => u => { const k = eio(u); const v = {}; for (const key of Object.keys(a)) v[key] = typeof a[key] === 'number' ? lerp(a[key], b[key] ?? a[key], k) : a[key]; return { sunAz: 240, sunEl: 17, haze: 70, ...v, ...(o.level ? { level: o.level(u) } : {}) }; };
const LV = (l0, l1, u0 = 0, u1 = 1) => u => lerp(l0, l1, eio(pr(u, u0, u1)));
// a graphic laid over a moving shot: the slate card becomes a dark veil, so the map or terrain keeps moving behind it
let VEIL = 0; const BG = g => VEIL ? (g.save(), g.fillStyle = `rgba(9,13,17,${VEIL})`, g.fillRect(0, 0, W, H), g.restore()) : G.bg(g);
const onShot = (fn, veil = .62) => (g, t, cam, S) => { VEIL = veil; try { fn(g, t, S.t0, S.t1); } finally { VEIL = 0; } };
// a readable key on a picture (dark chip, large type)
function key(g, t, t0, t1, big, small, x = 120, y = 150) {
  const a = win(t, t0, t1, .4); if (a <= 0) return; g.save(); g.font = `600 38px ${F.lab}`; const w = Math.max(g.measureText(big).width, small.length * 16.5) + 70; g.restore();
  g.save(); g.globalAlpha = a * .78; g.fillStyle = '#080b0e'; g.fillRect(x, y, w, 118); g.globalAlpha = a; g.fillStyle = COL.amber; g.fillRect(x, y, 6, 118); g.restore();
  text(g, big, x + 34, y + 52, `600 38px ${F.lab}`, COL.text, 'left', a, false, 2); text(g, small, x + 34, y + 94, `400 28px ${F.mono}`, COL.text, 'left', a, false);
}

// ———— chapters ————
const CHAPTERS = {
  0() {
    const a = at;
    terrain(0, a('c0b'), fly({ x: 34, y: 8, h: 5.5, tx: 24, ty: 34, th: 0 }, { x: 31, y: 14, h: 5.0, tx: 21, ty: 40 }), { lower: ['THE BLUE NILE GORGE · FEBRUARY 2020', '3D: NASADEM elevation ×1.6 · Landsat 8, 9 Feb 2020'] });
    terrain(a('c0b'), a('c0c'), fly({ x: 31, y: 14, h: 5.0, tx: 21, ty: 40 }, { x: 36, y: 10, h: 7.0, tx: 22, ty: 40 }, { level: LV(0, 640, 0, .7) }),
      { lower: ['THE SAME CANYON · FULL', 'water at 640 m, the full-supply level · shoreline as measured in 2026'] });
    globe(a('c0c'), a('c0d'), [[a('c0c') - .3, DAM[0], DAM[1], 900], [a('c0d'), 11.6, 34.6, 1600]],
      { over: (g, t, cam) => pin(g, t, cam, DAM, 'THE DAM', '14 km from the Sudan border', a('c0c', .2), a('c0d')) });
    globe(a('c0d'), a('c0e'), [[a('c0d'), 11.6, 34.6, 1500], [a('c0d', .9), 22.0, 33.0, 7000]],
      { over: (g, t, cam) => { rivers(g, t, cam, ['blue', 'nile'], a('c0d') + .2, a('c0d', .95)); pin(g, t, cam, CAIRO, 'EGYPT', '≈ 2,500 km downstream', a('c0d', .8), a('c0e'), 1); pin(g, t, cam, DAM, 'GERD', null, a('c0d'), a('c0e')); } });
    photo(a('c0e'), a('c0f'), 'eth_countryside', [.5, .5, 1.12], [.45, .5, 1.0], { credit: 'Photo: A. Davey, CC BY 2.0',
      over: (g, t) => quote(g, t, a('c0e', .3), a('c0f'), '"to light up our homes"', 'Abiy Ahmed, Prime Minister of Ethiopia · 9 Sep 2025 (Reuters)') });
    photo(a('c0f'), a('c0f', .45), 'photos/ph_gerd_aster', [.5, .45, 1.25], [.5, .5, 1.05], { credit: 'Image: NASA/METI/AIST/Japan Space Systems · ASTER, 2020', over: (g, t) => key(g, t, a('c0f') + .2, a('c0f', .45) + .2, 'THE DAM FROM SPACE · FALSE COLOUR', 'plants show red · water shows blue') });
    terrain(a('c0f', .45), DUR, fly({ x: 2, y: 64, h: 3.5, tx: 22, ty: 40, th: 0 }, { x: 4, y: 60, h: 4.5, tx: 26, ty: 36 }, { level: () => 640 }),
      { over: (g, t, cam, S) => bigTitle(g, t, a('c0f', 1) + .2, DUR + 1, 'WHO CONTROLS THE NILE?', 'the Grand Ethiopian Renaissance Dam') });
  },
  1() {
    const a = at;
    globe(0, a('c1a'), [[0, 14, 33, 9000], [a('c1a'), 10, 33, 8000]], { title: ['01', 'Where the water starts'] });
    globe(a('c1a'), a('c1a2'), [[a('c1a'), 10, 33, 8000], [a('c1a', .8), VIC[0], VIC[1], 2400]], { over: (g, t, cam) => pin(g, t, cam, VIC, 'LAKE VICTORIA', null, a('c1a', .5), a('c1a2')) });
    globe(a('c1a2'), a('c1b'), [[a('c1a2'), VIC[0], VIC[1], 2400], [a('c1b'), 14.0, 31.5, 9800]],
      { over: (g, t, cam) => { rivers(g, t, cam, ['white', 'nile'], a('c1a2'), a('c1b') - .3); G.counter(g, t, a('c1a2', .4), a('c1b'), { to: 11, fmt: v => Math.round(v) + '', label: 'COUNTRIES IN THE NILE BASIN', sub: '> 6,000 km from Lake Victoria to the sea' }); } });
    globe(a('c1b'), a('c1c'), [[a('c1b'), 14.0, 31.5, 9800], [a('c1c'), 9.0, 31.0, 3600]],
      { over: (g, t, cam) => { rivers(g, t, cam, ['white', 'nile'], -9, -8); label(g, t, cam, [7.5, 30.6], 'WHITE NILE', a('c1b', .1), a('c1c')); } });
    globe(a('c1c'), a('c1d'), [[a('c1c'), 9.0, 31.0, 3600], [a('c1c', .55), 12.6, 34.6, 2600], [a('c1d'), KHT[0], KHT[1], 700]],
      { over: (g, t, cam) => { rivers(g, t, cam, ['white', 'nile'], -9, -8); rivers(g, t, cam, ['blue'], a('c1c', .3), a('c1c', .9), 1, COL.blue); label(g, t, cam, [11.2, 36.6], 'BLUE NILE', a('c1c', .5), a('c1d'), COL.blue); pin(g, t, cam, KHT, 'KHARTOUM', null, a('c1c', .8), a('c1d')); } });
    graphic(a('c1d'), a('c1e'), (g, t, t0, t1) => { G.photo(g, IMG['plates/khartoum'], t, t0 - .5, t1 + .5, [.5, .55, 1.0], [.47, .6, 1.12], 1);
      const P = (lat, lon) => { const [w, s, e, n] = [32.36, 15.50, 32.72, 15.72], u = eio(pr(t, t0 - .5, t1 + .5)), z = lerp(1, 1.12, u), im = IMG['plates/khartoum'], base = Math.max(W / im.width, H / im.height) * z, ww = im.width * base, hh = im.height * base;
        const x = G.clamp(W / 2 - lerp(.5, .47, u) * ww, W - ww, 0), y = G.clamp(H / 2 - lerp(.55, .6, u) * hh, H - hh, 0); return [x + (lon - w) / (e - w) * ww, y + (n - lat) / (n - s) * hh]; };
      const tag = (ll, s, col, tt) => { const [x, y0] = P(...ll), y = G.clamp(y0, 130, H - 330), a = pr(t, tt, tt + .4); text(g, s, x, y, `600 34px ${F.lab}`, col, 'center', a, true, 4); };
      tag([15.578, 32.468], 'WHITE NILE', COL.text, a('c1d', .25)); tag([15.60, 32.605], 'BLUE NILE', '#e8c08a', a('c1d', .55)); tag([15.68, 32.50], 'THE NILE', COL.text, a('c1d', .8));
      G.lower(g, t, t0 + .3, t1 - .1, 'KHARTOUM · 13 SEPTEMBER 2024', 'Landsat 8 · flood season · USGS'); });
    photo(a('c1e'), a('c1e', 1) + .4, 'bluenile_falls', [.5, .55, 1.15], [.5, .5, 1.0], { amb: 'river', lower: ['THE BLUE NILE FALLS', 'below Lake Tana, Ethiopia'], credit: 'Photo: Nina R, CC BY 2.0' });
    graphic(a('c1e', 1) + .4, a('c1g'), shareGraphic);
    photo(a('c1g'), DUR, 'cairo_rowing', [.5, .5, 1.12], [.5, .45, 1.0], { amb: 'river', credit: 'Photo: Ibrahim.ID, CC BY 4.0',
      over: (g, t) => G.counter(g, t, a('c1g', .3), DUR + .4, { to: 97, fmt: v => '≈' + Math.round(v) + '%', label: "OF EGYPT'S RENEWABLE WATER", sub: 'from the Nile · Nile Basin Initiative', col: COL.teal }) });
  },
  2() {
    const a = at;
    globe(0, a('c2a'), [[0, 20, 32, 6500], [a('c2a'), 19, 32.5, 5600]], { title: ['02', 'A treaty for two'], state: () => ({ uGrey: .85 }) });
    archive(a('c2a'), a('c2b'), 'khartoum_shadouf', 'a shaduf lifting water from the Blue Nile · Khartoum · Matson collection');
    graphic(a('c2b'), a('c2c'), treatyCard);
    globe(a('c2c'), a('c2f'), [[a('c2c') - .3, 17, 31, 6200], [a('c2e'), 14, 33, 5200], [a('c2f'), 11, 35.5, 4200]], { state: () => ({ uGrey: .55 }),
      over: (g, t, cam, S) => { rivers(g, t, cam, ['blue', 'nile'], a('c2c'), a('c2d', 1)); (t < a('c2e') + .25 ? onShot(splitGraphic, .6) : onShot(timeline1929, .62))(g, t, cam, { t0: t < a('c2e') + .25 ? a('c2c') : a('c2e'), t1: t < a('c2e') + .25 ? a('c2e') : a('c2f') }); } });
    photo(a('c2f'), DUR, 'eth_plough', [.4, .5, 1.12], [.5, .5, 1.0], { credit: 'Photo: ILRI / Stevie Mann, CC BY 2.0', lower: ['THE ETHIOPIAN HIGHLANDS', 'where most of the water starts'] });
  },
  3() {
    const a = at;
    globe(0, a('c3a'), [[0, 15, 34, 7000], [a('c3a'), 15, 34, 6600]], { title: ['03', 'Power for the dark'] });
    globe(a('c3a'), a('c3c'), [[a('c3a'), 15, 34, 6600], [a('c3c'), 17, 34.5, 6000]], { state: t => ({ uNightA: 0, uNightB: 1, uScanLat: lerp(40, -10, pr(t, a('c3a'), a('c3a') + 2.6)), uScanOn: t > a('c3a') && t < a('c3a') + 2.8 ? 1 : 0 }),
      over: (g, t, cam) => { G.lower(g, t, a('c3a') + .4, a('c3c') - .2, 'THE NILE BASIN AT NIGHT', 'NASA VIIRS Black Marble · 2016'); label(g, t, cam, [29.5, 31.2], 'EGYPT', a('c3b'), a('c3c')); label(g, t, cam, [9.5, 38.5], 'ETHIOPIA', a('c3b', .5), a('c3c')); label(g, t, cam, [9.03, 38.74], 'Addis Ababa', a('c3b', .7), a('c3c'), COL.dim, 24); } });
    photo(a('c3c'), a('c3d'), 'oromia_village', [.45, .5, 1.12], [.55, .5, 1.0], { credit: 'Photo: Ninara, CC BY 2.0',
      over: (g, t) => G.counter(g, t, a('c3c', .45), a('c3d'), { to: 45, fmt: v => '≈' + Math.round(v) + '%', label: 'OF ETHIOPIANS WITHOUT ELECTRICITY · 2023', sub: 'World Bank: 55.4% had access' }) });
    globe(a('c3d'), a('c3e'), [[a('c3d') - .3, 11.0, 36.0, 2400], [a('c3d', .9), DAM[0], DAM[1] + .3, 520]],
      { over: (g, t, cam) => { pin(g, t, cam, DAM, 'GUBA', 'construction from 2 April 2011', a('c3d', .5), a('c3e')); } });
    photo(a('c3e'), a('c3f'), 'eth_countryside', [.6, .5, 1.15], [.5, .45, 1.0], { credit: 'Photo: A. Davey, CC BY 2.0',
      over: (g, t) => G.counter(g, t, a('c3e', .2), a('c3f'), { to: 5, fmt: v => '≈ US$' + Math.round(v) + ' bn', label: 'COST · MOSTLY RAISED INSIDE ETHIOPIA', sub: 'bonds + salary contributions · Chinese loan for turbines' }) });
    terrain(a('c3f'), a('c3g'), fly({ x: 30, y: 46, h: 4.2, tx: 18, ty: 58 }, { x: 24, y: 50, h: 3.6, tx: 16, ty: 58 }, { level: () => 640 }), { over: onShot(heightGraphic, .66) });
    globe(a('c3g'), a('c3h'), [[a('c3g') - .3, 12, 37, 3400], [a('c3h'), 10, 38.5, 2600]], { state: () => ({ uNightA: 1, uNightB: 1 }), over: onShot(powerGraphic, .5) });
    photo(a('c3h'), DUR, 'tana_fishermen', [.5, .55, 1.12], [.5, .5, 1.0], { amb: 'river', credit: 'Photo: A. Davey, CC BY 2.0', lower: ['LAKE TANA', 'the source of the Blue Nile'] });
  },
  4() {
    const a = at;
    terrain(0, a('c4a'), fly({ x: 44, y: 12, h: 6, tx: 26, ty: 36, sunAz: 120, sunEl: 24 }, { x: 40, y: 18, h: 6, tx: 22, ty: 42 }), { title: ['04', 'Five summers'] });
    graphic(a('c4a'), a('c4b'), flowGraphic);
    terrain(a('c4b'), a('c4d'), fly({ x: 38, y: 10, h: 6.0, tx: 22, ty: 40 }, { x: 33, y: 14, h: 5.0, tx: 21, ty: 42 }, { level: u => lerp(490, 540, eio(pr(u, .1, .95))) }),
      { over: (g, t) => { G.lower(g, t, a('c4b') + .3, a('c4c') - .2, 'WHILE IT FILLS, LESS GOES ON', 'water held back is water that does not flow downstream'); G.lower(g, t, a('c4c') + .1, a('c4d') - .1, 'JULY 2020 · THE FIRST FILLING', 'no agreement with Egypt or Sudan · 3D model'); } });
    graphic(a('c4d'), a('c4h'), timelapse);
    terrain(a('c4h'), a('c4i'), fly({ x: 36, y: 14, h: 6.5, tx: 22, ty: 40 }, { x: 33, y: 18, h: 6.5, tx: 20, ty: 44 }, { level: u => levelAt(u) }),
      { over: (g, t, cam, S) => levelGauge(g, t, S), lower: ['WATER LEVEL BEHIND THE DAM', 'end of each filling · 3D model'] });
    graphic(a('c4i'), a('c4j'), volumeGraphic);
    graphic(a('c4j'), DUR, talksGraphic);
  },
  5() {
    const a = at;
    photo(0, a('c5a'), 'nasser_view', [.5, .55, 1.12], [.5, .5, 1.0], { title: ['05', 'What Egypt fears'], amb: 'river', credit: 'Photo: Warren LeMay, CC0' });
    photo(a('c5a'), a('c5b'), 'aswan_lascar', [.4, .5, 1.12], [.55, .5, 1.0], { credit: 'Photo: Jorge Láscar, CC BY 2.0', lower: ['ASWAN HIGH DAM · LAKE NASSER', "Egypt's reserve, completed 1970"] });
    globe(a('c5b'), a('c5c'), [[a('c5b') - .3, 23.0, 32.4, 1600], [a('c5c'), 22.6, 32.0, 900]], { state: () => ({ uGrey: .7, uKeep: 1 }),
      over: (g, t, cam) => { G.lower(g, t, a('c5b', .2), a('c5c') - .1, 'LAKE NASSER', 'the drought of the 1980s'); pin(g, t, cam, ASWAN, 'ASWAN HIGH DAM', null, a('c5b', .4), a('c5c')); } });
    graphic(a('c5c'), a('c5d2'), twoDams);
    terrain(a('c5d2'), a('c5d3'), fly({ x: 70, y: 30, h: 5.5, tx: 40, ty: 38 }, { x: 46, y: 46, h: 3.8, tx: 22, ty: 52 }, { level: () => 640 }),
      { over: (g, t) => { text(g, "ETHIOPIA'S CASE", 120, 170, `600 44px ${F.lab}`, COL.text, 'left', win(t, a('c5d2') + .2, a('c5d3') - .1), true, 4);
        [['LESS EVAPORATION', 'cool highlands, not the desert', .12], ['A STEADIER RIVER', 'released through the year', .5], ['FEWER FLOODS IN SUDAN', 'the peak is held back', .78]].forEach(([b, sm, f], i) => key(g, t, a('c5d2', f), a('c5d3') - .1, b, sm, 120, 220 + i * 140)); } });
    globe(a('c5d3'), a('c5d3', .6), [[a('c5d3') - .3, 13.5, 34.0, 2600], [a('c5d3', .6), 14.0, 33.6, 2200]],
      { over: (g, t, cam) => { rivers(g, t, cam, ['blue', 'white', 'nile'], -9, -8); pin(g, t, cam, KHT, 'KHARTOUM', 'Sudan', a('c5d3') + .3, a('c5d3', .6), -1); pin(g, t, cam, DAM, 'GERD', null, a('c5d3', .2), a('c5d3', .6)); } });
    photo(a('c5d3', .6), a('c5e'), 'photos/ph_iss_2020', [.5, .5, 1.2], [.5, .5, 1.05], { credit: 'Photo: NASA / ISS crew', lower: ['KHARTOUM AT NIGHT', 'where the Blue and White Nile meet · ISS, 2020'] });
    globe(a('c5e'), DUR, [[a('c5e'), 12.5, 34.5, 2400], [DUR, 16, 33.5, 5200]],
      { over: (g, t, cam) => { rivers(g, t, cam, ['blue'], a('c5e'), a('c5e', .8), 1, COL.blue); rivers(g, t, cam, ['nile'], a('c5e', .6), DUR); pin(g, t, cam, DAM, 'CONTROLLED HERE', null, a('c5e', .5), DUR); } });
  },
  6() {
    const a = at;
    terrain(0, a('c6a', 1) + .3, fly({ x: 2, y: 66, h: 4, tx: 20, ty: 44 }, { x: 6, y: 62, h: 5, tx: 24, ty: 40 }, { level: () => 640 }),
      { title: ['06', 'The flood of 2025'], over: (g, t) => G.lower(g, t, a('c6a', .3), a('c6a', 1) + .2, '9 SEPTEMBER 2025', 'the dam is formally inaugurated') });
    photo(a('c6a', 1) + .3, a('c6b', .55), 'bluenile_falls', [.5, .5, 1.2], [.5, .55, 1.05], { amb: 'river', credit: 'Photo: Nina R, CC BY 2.0' });
    photo(a('c6b', .55), a('c6c'), 'photos/ph_iss_2020', [.45, .5, 1.15], [.5, .5, 1.02], { credit: 'Photo: NASA / ISS crew',
      over: (g, t) => G.counter(g, t, a('c6b', .6), a('c6c'), { to: 1200, fmt: v => '> ' + Math.round(v).toLocaleString('en-US'), label: 'FAMILIES DISPLACED · BAHRI, KHARTOUM', sub: 'autumn 2025 · Sudanese authorities, via press reports' }) });
    graphic(a('c6c'), a('c6f'), versionsGraphic);
    globe(a('c6f'), DUR, [[a('c6f') - .3, 13, 34, 3200], [DUR, 14, 33, 4200]], { over: (g, t, cam) => { rivers(g, t, cam, ['blue', 'white', 'nile'], -9, -8); pin(g, t, cam, DAM, 'NO SHARED DATA', 'on how the dam is run', a('c6f', .2), DUR + 1); } });
  },
  7() {
    const a = at;
    globe(0, a('c7b'), [[0, 24, 32, 6000], [a('c7b'), 18, 34, 5200]], { state: () => ({ uNightA: 1, uNightB: 1 }), over: (g, t, cam, S) => { rivers(g, t, cam, ['blue', 'nile'], -9, -8, .8); onShot(headlineCard, .55)(g, t, cam, S); } });
    globe(a('c7b'), a('c7c'), [[a('c7b') - .3, 26, 31.5, 3800], [a('c7b', .55), 18, 33, 6500], [a('c7c'), 11, 37, 3600]], { state: () => ({ uNightA: 1, uNightB: 1 }),
      over: (g, t, cam) => label(g, t, cam, [11.2, 38.0], 'THE ETHIOPIAN HIGHLANDS', a('c7b', .6), a('c7c')) });
    globe(a('c7c'), DUR, [[a('c7c'), 11, 37, 3600], [DUR, 17, 33, 9000]], { state: () => ({ uNightA: 1, uNightB: 1 }),
      over: (g, t, cam, S) => { rivers(g, t, cam, ['blue', 'nile'], a('c7c'), a('c7c', .9), 1, COL.amber); bigTitle(g, t, a('c7c', .5), DUR + 1, 'One river.', 'Two great dams. No agreement.');
        if (t > a('c7c', 1) + .6) text(g, 'Which river should we follow next?  Tell us in the comments.', W / 2, H / 2 + 210, `400 30px ${F.mono}`, COL.text, 'center', pr(t, a('c7c', 1) + .6, a('c7c', 1) + 1.1)); } });
  },
};

// —— marks ——
function pin(g, t, cam, ll, label, sub, t0, t1, side = 1) {
  const a = win(t, t0, t1, .4); if (a <= 0) return; const [x, y, vis] = project(cam, ...ll); if (!vis) return;
  const k = eo(pr(t, t0, t0 + .5)), r = 30;
  g.save(); g.globalAlpha = a; g.strokeStyle = COL.amber; g.lineWidth = 3; g.beginPath(); g.arc(x, y, r * (1.6 - .6 * k), 0, Math.PI * 2); g.stroke();
  g.fillStyle = COL.amber; g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill();
  g.strokeStyle = COL.text; g.lineWidth = 2; g.beginPath(); g.moveTo(x + side * r * .7, y - r * .7); g.lineTo(x + side * (r + 80 * k), y - r - 80 * k); g.lineTo(x + side * (r + 80 * k + 30), y - r - 80 * k); g.stroke(); g.restore();
  text(g, label, x + side * (r + 120), y - r - 72, `600 34px ${F.lab}`, COL.text, side > 0 ? 'left' : 'right', a * k, true, 3);
  if (sub) text(g, sub, x + side * (r + 120), y - r - 40, `400 26px ${F.mono}`, COL.dim, side > 0 ? 'left' : 'right', a * k);
}
function label(g, t, cam, ll, s, t0, t1, col = COL.text, size = 30) {
  const a = win(t, t0, t1, .4); if (a <= 0) return; const [x, y, vis] = project(cam, ...ll); if (!vis) return;
  text(g, s, x, y, `600 ${size}px ${F.lab}`, col, 'center', a, true, 4);
}
// river lines (Natural Earth centrelines, public domain): drawn from the source outwards between t0 and t1
function rivers(g, t, cam, keys, t0, t1, alpha = 1, col = 'rgba(120,190,255,.95)') {
  const k = eo(pr(t, t0, t1)); if (k <= 0 || alpha <= 0) return;
  g.save(); g.globalAlpha = alpha; g.lineCap = 'round'; g.lineJoin = 'round';
  for (const key of keys) {
    const segs = DATA.rivers[key]; const mx = Math.max(...segs.flat().map(p => p[2])), lim = k * mx;
    for (const pass of [[8, 'rgba(0,0,0,.35)'], [3.5, key === 'blue' ? (col === 'rgba(120,190,255,.95)' ? '#7fb3ff' : col) : col]]) {
      g.strokeStyle = pass[1]; g.lineWidth = pass[0]; g.beginPath();
      for (const s of segs) { let on = false; for (const p of s) { if (p[2] > lim) { on = false; continue; } const [x, y, vis] = project(cam, p[0], p[1]); if (!vis) { on = false; continue; } on ? g.lineTo(x, y) : g.moveTo(x, y); on = true; } }
      g.stroke();
    }
  }
  g.restore();
}
function quote(g, t, t0, t1, q, who) {
  const a = win(t, t0, t1, .5); if (a <= 0) return; const k = eo(pr(t, t0, t0 + .8));
  g.save(); g.globalAlpha = a * .5; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore();
  text(g, q, W / 2, H / 2 + 20 * (1 - k), `400 92px ${F.serif}`, COL.text, 'center', a * k, true);
  g.save(); g.globalAlpha = a; g.fillStyle = COL.amber; g.fillRect(W / 2 - 140 * k, H / 2 + 50, 280 * k, 3); g.restore();
  text(g, who, W / 2, H / 2 + 104, `400 26px ${F.mono}`, COL.dim, 'center', a * pr(t, t0 + .5, t0 + 1));
}
function bigTitle(g, t, t0, t1, big, small) {
  const a = win(t, t0, t1, .6); if (a <= 0) return; const k = eo(pr(t, t0, t0 + 1));
  g.save(); g.globalAlpha = a * .45; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore();
  text(g, big, W / 2, H / 2 - 10 + 20 * (1 - k), `500 140px ${F.num}`, COL.text, 'center', a * k, true, 6);
  g.save(); g.globalAlpha = a; g.fillStyle = COL.amber; g.fillRect(W / 2 - 200 * k, H / 2 + 30, 400 * k, 3); g.restore();
  text(g, small, W / 2, H / 2 + 100, `400 40px ${F.lab}`, COL.amber, 'center', a * pr(t, t0 + .6, t0 + 1.2), true, 2);
}
function archiveDraw(g, t, t0, t1, img, cap, credit) {
  const im = IMG[img]; if (!im) return; const u = eio(pr(t, t0 - .5, t1 + .5)), ar = im.width / im.height;
  g.save(); g.filter = 'blur(28px) brightness(.45) sepia(.4)'; const s0 = Math.max(W / im.width, H / im.height) * 1.15; g.drawImage(im, W / 2 - im.width * s0 / 2, H / 2 - im.height * s0 / 2, im.width * s0, im.height * s0); g.restore();
  const h = 660 * (1 + .05 * u), w = h * ar, cy = H / 2 - 90; g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 50; g.shadowOffsetY = 16; g.filter = 'sepia(.25) contrast(1.05)'; g.drawImage(im, W / 2 - w / 2, cy - h / 2, w, h); g.restore();
  text(g, cap, W / 2 - w / 2, cy + h / 2 + 44, `400 24px ${F.mono}`, COL.text, 'left', 1);
  text(g, credit, W / 2 + w / 2, cy + h / 2 + 44, `400 26px ${F.mono}`, COL.dim, 'right', 1);
}

// —— infographics ——
function shareGraphic(g, t, t0, t1) {   // where the water that reaches Egypt comes from
  BG(g); const x0 = 220, Wd = W - 440, y = 560, k1 = eo(pr(t, t0, t0 + 1.5)), k2 = eo(pr(t, t0 + 1.1, t0 + 2.1));
  text(g, 'WHERE THE NILE WATER REACHING EGYPT COMES FROM', x0, 300, `600 38px ${F.lab}`, COL.text, 'left', 1, true, 3);
  text(g, 'long-term average, approx.', x0, 344, `400 24px ${F.mono}`, COL.dim, 'left', pr(t, t0 + .2, t0 + .7), false);
  g.save(); g.fillStyle = '#7fb3ff'; g.fillRect(x0, y, Wd * .85 * k1, 120); g.fillStyle = 'rgba(244,242,238,.85)'; g.fillRect(x0 + Wd * .85, y, Wd * .15 * k2, 120); g.restore();
  text(g, 'ETHIOPIAN HIGHLANDS', x0, y + 180, `600 36px ${F.lab}`, '#7fb3ff', 'left', k1, true, 3); text(g, 'Blue Nile · Atbara · Sobat', x0, y + 222, `400 26px ${F.mono}`, COL.dim, 'left', k1);
  text(g, 'WHITE NILE', x0 + Wd, y + 180, `600 36px ${F.lab}`, COL.text, 'right', k2, true, 3); text(g, 'East African lakes', x0 + Wd, y + 222, `400 26px ${F.mono}`, COL.dim, 'right', k2);
  text(g, '≈' + Math.round(85 * k1) + '%', x0 + 30, y + 88, `500 84px ${F.num}`, '#10161b', 'left', k1, false);
  text(g, 'Molden et al. 2010; Eastern Nile studies: Ethiopian share ≈ 85–86% of the natural flow at Aswan', W - 120, 52, `400 23px ${F.mono}`, COL.dim, 'right', 1, false);
}
function treatyCard(g, t, t0, t1) {
  BG(g); const k = eo(pr(t, t0 + .1, t0 + 1.0)), pw = 1160, ph = 640, x = W / 2 - pw / 2, y = H / 2 - ph / 2 + 30 * (1 - k);
  g.save(); g.globalAlpha = k; g.fillStyle = '#ece4d2'; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 40; g.fillRect(x, y, pw, ph); g.restore();
  const ink = '#2a2520';
  text(g, '8 NOVEMBER 1959 · CAIRO', W / 2, y + 90, `400 26px ${F.mono}`, ink, 'center', k, false, 4);
  ['Agreement between the Republic of the Sudan', 'and the United Arab Republic', 'for the Full Utilization of the Nile Waters'].forEach((s, i) => text(g, s, W / 2, y + 200 + i * 56, `400 40px ${F.serif}`, ink, 'center', k, false));
  g.save(); g.globalAlpha = k; g.fillStyle = ink; g.fillRect(W / 2 - 120, y + 400, 240, 2); g.restore();
  text(g, 'two parties: Egypt (then the U.A.R.) and Sudan', W / 2, y + 460, `400 26px ${F.mono}`, '#6b5f52', 'center', pr(t, t0 + 1, t0 + 1.5), false);
  const ks = eo(pr(t, t0 + 1.6, t0 + 2.1)); if (ks > 0) { g.save(); g.translate(x + pw - 190, y + ph - 70); g.rotate(-.18); g.globalAlpha = ks * .85; g.strokeStyle = '#a3322a'; g.lineWidth = 5; g.strokeRect(-130, -44, 260, 88); g.restore(); text(g, 'ETHIOPIA: NOT A PARTY', 0, 0, '', COL.red, 'center', 0); g.save(); g.translate(x + pw - 190, y + ph - 70); g.rotate(-.18); g.globalAlpha = ks * .85; g.fillStyle = '#a3322a'; g.font = `600 30px ${F.lab}`; g.textAlign = 'center'; g.fillText('ETHIOPIA: NOT', 0, -6); g.fillText('A PARTY', 0, 28); g.restore(); }
}
function splitGraphic(g, t, t0, t1) {   // the 1959 allocation, billion m³ per year
  BG(g); const rows = [['EGYPT', 55.5, COL.amber], ['SUDAN', 18.5, COL.teal], ['ETHIOPIA', 0, COL.red]], x0 = 520, sc = 20, y0 = 360;
  text(g, 'THE 1959 SPLIT', 220, 220, `600 40px ${F.lab}`, COL.text, 'left', pr(t, t0, t0 + .4), true, 3);
  text(g, 'billion cubic metres per year · of an average 84 at Aswan, ~10 lost to evaporation', 220, 264, `400 24px ${F.mono}`, COL.dim, 'left', pr(t, t0 + .2, t0 + .6), false);
  rows.forEach(([n, v, col], i) => { const k = eo(pr(t, t0 + .3 + i * .9, t0 + 1.4 + i * .9)), y = y0 + i * 190; if (k <= 0) return;
    text(g, n, x0 - 40, y + 70, `600 44px ${F.lab}`, COL.text, 'right', k, true, 3);
    g.save(); g.globalAlpha = k; g.fillStyle = col; g.fillRect(x0, y, Math.max(6, v * sc * k), 100); g.restore();
    text(g, v ? (v * k).toFixed(1) : '0', x0 + Math.max(6, v * sc * k) + 30, y + 78, `500 90px ${F.num}`, col, 'left', k); });
  const kn = pr(t, at('c2d'), at('c2d') + .5); text(g, 'no share · no seat at the table', x0 + 160, y0 + 2 * 190 + 70, `400 32px ${F.mono}`, COL.red, 'left', kn, false);
}
function timeline1929(g, t, t0, t1) {
  BG(g); const y = 560, x0 = 360, x1 = W - 360, k = eo(pr(t, t0 + .1, t0 + 1.2));
  g.save(); g.strokeStyle = COL.dim; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 - 80, y); g.lineTo(lerp(x0 - 80, x1 + 80, k), y); g.stroke(); g.restore();
  const ev = [[x0, '1929', 'Egypt + Britain', 'for its colonies upstream', 'Egypt may object to projects upstream', t0 + .4], [x1, '1959', 'Egypt + Sudan', 'divide the river', '55.5 + 18.5 billion m³', t0 + .9]];
  for (const [x, yr, a1, a2, a3, tt] of ev) { const a = pr(t, tt, tt + .5); if (a <= 0) continue;
    g.save(); g.globalAlpha = a; g.fillStyle = COL.amber; g.beginPath(); g.arc(x, y, 14, 0, Math.PI * 2); g.fill(); g.restore();
    text(g, yr, x, y - 60, `500 110px ${F.num}`, COL.amber, 'center', a); text(g, a1, x, y + 80, `600 36px ${F.lab}`, COL.text, 'center', a, true, 3); text(g, a2, x, y + 120, `400 26px ${F.mono}`, COL.dim, 'center', a); }
  const kv = pr(t, at('c2e2'), at('c2e2') + .6); text(g, 'Egypt may object to projects upstream', x0, y + 180, `500 30px ${F.lab}`, COL.red, 'center', kv, true);
  text(g, 'ETHIOPIA SIGNED NEITHER', W / 2, 260, `600 40px ${F.lab}`, COL.red, 'center', pr(t, at('c2e2', .7), at('c2e2', .7) + .5), true, 4);
}
function heightGraphic(g, t, t0, t1) {   // 145 m main dam vs the Great Pyramid (≈ 139 m today)
  BG(g); const yb = 800, sc = 4.0, k = eo(pr(t, t0 + .1, t0 + 1.1)), k2 = eo(pr(t, at('c3f', .55), at('c3f', .55) + 1.0));
  g.save(); g.strokeStyle = 'rgba(244,242,238,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(160, yb); g.lineTo(W - 160, yb); g.stroke(); g.restore();
  const hp = 139 * sc * k2; g.save(); g.fillStyle = COL.sand; g.globalAlpha = k2; g.beginPath(); g.moveTo(360, yb); g.lineTo(360 + 230 * sc * .5 * k2 * .5, yb - hp); g.lineTo(360 + 230 * sc * .5 * k2, yb); g.closePath(); g.fill(); g.restore();
  text(g, 'GREAT PYRAMID', 360 + 115 * sc * .5 * k2, yb + 50, `600 30px ${F.lab}`, COL.sand, 'center', k2, true, 3); text(g, '≈ 139 m', 360 + 115 * sc * .5 * k2, yb - hp - 20, `500 50px ${F.num}`, COL.sand, 'center', k2);
  const hd = 145 * sc * k, xd = 900, wd = W - 160 - xd; g.save(); g.fillStyle = '#c9ccc8'; g.beginPath(); g.moveTo(xd, yb); g.lineTo(xd + 40, yb - hd); g.lineTo(xd + wd - 40, yb - hd); g.lineTo(xd + wd, yb); g.closePath(); g.fill(); g.restore();
  text(g, 'MAIN DAM', xd + wd / 2, yb + 50, `600 30px ${F.lab}`, COL.text, 'center', k, true, 3); text(g, '145 m', xd + 60, yb - hd - 20, `500 70px ${F.num}`, COL.amber, 'left', k);
  text(g, '1,780 m long →', xd + wd - 20, yb - hd - 24, `400 26px ${F.mono}`, COL.dim, 'right', k, false);
  text(g, 'heights to scale · length not to scale · plus a 5 km saddle dam', W - 120, 52, `400 23px ${F.mono}`, COL.dim, 'right', 1, false);
}
function powerGraphic(g, t, t0, t1) {
  BG(g); const x0 = 620, sc = .2, rows = [['GERD', 5150, COL.amber, t0 + .3], ['ASWAN HIGH DAM', 2100, COL.teal, t0 + 1.2]];
  text(g, 'INSTALLED POWER · MEGAWATTS', 220, 260, `600 40px ${F.lab}`, COL.text, 'left', pr(t, t0, t0 + .4), true, 3);
  rows.forEach(([n, v, col, tt], i) => { const k = eo(pr(t, tt, tt + 1.1)), y = 400 + i * 230; if (k <= 0) return;
    text(g, n, x0 - 40, y + 76, `600 40px ${F.lab}`, COL.text, 'right', k, true, 3); g.save(); g.globalAlpha = k; g.fillStyle = col; g.fillRect(x0, y, v * sc * k, 110); g.restore();
    text(g, Math.round(v * k).toLocaleString('en-US'), x0 + v * sc * k + 30, y + 86, `500 96px ${F.num}`, col, 'left', k); });
  text(g, 'THE LARGEST HYDROPOWER PLANT IN AFRICA', 220, 860, `600 34px ${F.lab}`, COL.amber, 'left', pr(t, at('c3g', .45), at('c3g', .45) + .5), true, 3);
  text(g, 'GERD: 13 turbines · Aswan High Dam: 2.1 GW', W - 120, 52, `400 23px ${F.mono}`, COL.dim, 'right', 1, false);
}
function flowGraphic(g, t, t0, t1) {   // a dam passes water on; filling holds it back
  BG(g); const y = 560, xd = W / 2, kf = pr(t, at('c4b', .35), at('c4b', .35) + 2.5), ph = t * 1.6;
  const arrow = (x0, x1, w, col, a) => { if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = col; g.fillRect(x0, y - w / 2, x1 - x0 - 40, w); g.beginPath(); g.moveTo(x1 - 40, y - w / 2 - 26); g.lineTo(x1, y); g.lineTo(x1 - 40, y + w / 2 + 26); g.closePath(); g.fill();
    g.globalAlpha = a * .35; g.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { const xx = x0 + ((ph * 120 + i * 150) % (x1 - x0 - 60)); g.fillRect(xx, y - w / 2 + 6, 40, 4); } g.restore(); };
  arrow(200, xd - 70, 90, '#7fb3ff', 1); arrow(xd + 70, W - 200, lerp(90, 30, kf), '#7fb3ff', 1);
  g.save(); g.fillStyle = '#c9ccc8'; g.fillRect(xd - 40, y - 230, 80, 460); g.restore();
  if (kf > 0) { g.save(); g.globalAlpha = .55; g.fillStyle = '#3f78b8'; const hh = 200 * eo(kf); g.fillRect(xd - 420, y - hh, 380, hh + 60); g.restore(); text(g, 'HELD BACK TO FILL THE LAKE', xd - 230, y - 220 * eo(kf) - 24, `600 28px ${F.lab}`, COL.text, 'center', kf, true, 2); }
  text(g, 'IN', 260, y - 80, `600 34px ${F.lab}`, COL.text, 'left', 1, true, 3); text(g, 'OUT, DOWNSTREAM', W - 260, y - 80, `600 34px ${F.lab}`, COL.text, 'right', 1, true, 3);
  text(g, kf > .05 ? 'WHILE FILLING: LESS GOES ON' : 'RUNNING: THE WATER PASSES THROUGH', W / 2, 250, `600 40px ${F.lab}`, kf > .05 ? COL.amber : COL.text, 'center', 1, true, 3);
  text(g, 'schematic', W - 120, 52, `400 23px ${F.mono}`, COL.dim, 'right', 1, false);
}
function timelapse(g, t, t0, t1) {   // the reservoir every dry season, same stretch, same frame (Landsat path 171)
  const yrs = [2020, 2021, 2022, 2023, 2024, 2025, 2026], M = DATA.measure;
  const key = [[at('c4d') - 1, 0], [at('c4e') - .7, 0], [at('c4e'), 1], [at('c4f') - 1.4, 1], [at('c4f') - .7, 2], [at('c4f'), 3], [at('c4g') - 1.3, 3], [at('c4g') - .8, 4], [at('c4g') - .3, 5], [at('c4g') + .3, 6]];
  let f = 0; for (let i = 0; i < key.length - 1; i++) if (t >= key[i][0]) f = lerp(key[i][1], key[i + 1][1], eio(pr(t, key[i][0], key[i + 1][0])));
  if (t >= key[key.length - 1][0]) f = 6;
  const i0 = Math.floor(f), i1 = Math.min(6, i0 + 1), u = f - i0;
  const im0 = IMG['res_' + yrs[i0]], im1 = IMG['res_' + yrs[i1]]; if (!im0) return;
  // frame: the lake from the dam to the southern arm (crop of the plate, lat 10.05–11.32), rotated to landscape is not allowed: fit height
  const [w, s, e, n] = PL.res, la0 = 10.1, la1 = 11.32, lo0 = 34.98, lo1 = 35.76;
  const sx = (lo0 - w) / (e - w) * im0.width, sy = (n - la1) / (n - s) * im0.height, sw = (lo1 - lo0) / (e - w) * im0.width, shh = (la1 - la0) / (n - s) * im0.height;
  const dh = H, dw = dh * sw / shh * (Math.cos(10.7 * Math.PI / 180)), dx = W - 140 - dw;
  g.fillStyle = '#0b0f12'; g.fillRect(0, 0, W, H); BG(g);
  g.save(); g.drawImage(im0, sx, sy, sw, shh, dx, 0, dw, dh); if (u > 0) { g.globalAlpha = u; g.drawImage(im1, sx, sy, sw, shh, dx, 0, dw, dh); } g.restore();
  const yr = yrs[Math.round(f)], m = M[yr], area = lerp(M[yrs[i0]].km2, M[yrs[i1]].km2, u);
  text(g, m.date.slice(0, 7).replace('-', ' · '), 200, 330, `500 120px ${F.num}`, COL.text, 'left', 1);
  text(g, 'LANDSAT · ' + m.date, 200, 380, `400 24px ${F.mono}`, COL.dim, 'left', 1, false);
  text(g, 'OPEN WATER BEHIND THE DAM', 200, 540, `600 32px ${F.lab}`, COL.text, 'left', 1, true, 3);
  text(g, area < 5 ? 'a river' : Math.round(area).toLocaleString('en-US') + ' km²', 196, 660, `500 130px ${F.num}`, COL.teal, 'left', 1);
  text(g, 'measured on these images · MNDWI > 0', 200, 712, `400 26px ${F.mono}`, COL.dim, 'left', 1, false);
  const kl = pr(t, at('c4g', .6), at('c4g', .6) + .6); text(g, '≈ the size of Greater London (1,572 km²)', 200, 800, `500 32px ${F.lab}`, COL.amber, 'left', kl, true);
  // the dam marker on the image
  const dxm = dx + (DAM[1] - lo0) / (lo1 - lo0) * dw, dym = (la1 - DAM[0]) / (la1 - la0) * dh;
  g.save(); g.strokeStyle = COL.amber; g.lineWidth = 3; g.beginPath(); g.arc(dxm, dym, 22, 0, Math.PI * 2); g.stroke(); g.restore(); text(g, 'DAM', dxm - 34, dym + 10, `600 26px ${F.lab}`, COL.amber, 'right', 1, true, 3);
  G.credit(g, 'Landsat 8/9 · USGS · path 171, dry season', 1);
}
function levelAt(u) { const k = u * 5.2; const i = Math.min(4, Math.floor(k)); const l0 = i === 0 ? 490 : LEVELS[i - 1][1]; return lerp(l0, LEVELS[i][1], eio(Math.min(1, (k - i) / .7))); }
function levelGauge(g, t, S) {
  const u = G.clamp((t - S.t0 + .25) / (S.t1 - S.t0 + .5)), lv = levelAt(u), x = W - 300, y0 = 860, y1 = 300, Y = m => lerp(y0, y1, (m - 480) / 180);
  g.save(); g.fillStyle = 'rgba(8,11,14,.55)'; g.fillRect(x - 130, y1 - 90, 330, y0 - y1 + 150); g.strokeStyle = COL.dim; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke();
  g.fillStyle = '#5ea0dc'; g.fillRect(x - 14, Y(lv), 28, y0 - Y(lv)); g.restore();
  for (const [yr, m] of LEVELS) { const a = lv >= m - 1 ? 1 : .35; text(g, yr + '', x + 30, Y(m) + 8, `400 24px ${F.mono}`, COL.text, 'left', a, false); text(g, m + ' m', x - 24, Y(m) + 8, `500 26px ${F.num}`, a === 1 ? COL.amber : COL.dim, 'right', 1, false); }
  text(g, Math.round(lv) + ' m', x + 70, y1 - 30, `500 56px ${F.num}`, COL.text, 'center', 1); text(g, 'above sea level', x + 70, y0 + 46, `400 23px ${F.mono}`, COL.dim, 'center', 1, false);
}
function volumeGraphic(g, t, t0, t1) {   // cubes with volume ∝ value
  BG(g); const cube = (cx, v, col, k, lab, val) => { const s = Math.cbrt(v) * 84 * k, d = s * .35; if (k <= 0) return; const x = cx - s / 2, y = 820 - s;
    g.save(); g.globalAlpha = k; g.fillStyle = col; g.fillRect(x, y, s, s); g.globalAlpha = k * .7; g.beginPath(); g.moveTo(x, y); g.lineTo(x + d, y - d); g.lineTo(x + s + d, y - d); g.lineTo(x + s, y); g.closePath(); g.fill();
    g.globalAlpha = k * .5; g.beginPath(); g.moveTo(x + s, y); g.lineTo(x + s + d, y - d); g.lineTo(x + s + d, y + s - d); g.lineTo(x + s, y + s); g.closePath(); g.fill(); g.restore();
    text(g, lab, cx, 880, `600 32px ${F.lab}`, COL.text, 'center', k, true, 3); text(g, val, cx + d / 2, y - d - 30, `500 70px ${F.num}`, col, 'center', k); };
  cube(620, 74, '#5ea0dc', eo(pr(t, t0 + .2, t0 + 1.2)), 'THE RESERVOIR, FULL', '74');
  cube(1300, 55.5, COL.amber, eo(pr(t, at('c4i', .45), at('c4i', .45) + 1.0)), "EGYPT'S YEARLY SHARE, 1959", '55.5');
  text(g, 'BILLION CUBIC METRES', W / 2, 170, `600 38px ${F.lab}`, COL.text, 'center', pr(t, t0, t0 + .4), true, 4);
  text(g, 'cube volumes to scale · total storage; about 59 is active', W - 120, 52, `400 23px ${F.mono}`, COL.dim, 'right', 1, false);
}
function talksGraphic(g, t, t0, t1) {
  BG(g); const ev = [['2015', 'Declaration of Principles', 'Khartoum', at('c4j', .18)], ['2020', 'Talks in Washington', 'US Treasury, World Bank', at('c4j', .5)], ['2021', 'UN Security Council', 'session on the dam, 8 July', at('c4j', .78)], ['DEC 2023', 'Egypt: talks are over', 'after the last round', at('c4k', .1)]];
  const y = 560, x0 = 300, x1 = W - 300, k = eo(pr(t, t0 - .3, t0 + .6));
  g.save(); g.strokeStyle = COL.dim; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 - 60, y); g.lineTo(lerp(x0 - 60, x1 + 60, k), y); g.stroke(); g.restore();
  ev.forEach(([yr, a1, a2, tt], i) => { const x = lerp(x0, x1, i / 3), a = pr(t, tt, tt + .4), last = i === 3; if (a <= 0) return;
    g.save(); g.globalAlpha = a; g.fillStyle = last ? COL.red : COL.amber; g.beginPath(); g.arc(x, y, 13, 0, Math.PI * 2); g.fill(); g.restore();
    text(g, yr, x, y - 50, `500 72px ${F.num}`, last ? COL.red : COL.amber, 'center', a); text(g, a1, x, y + 70, `600 30px ${F.lab}`, COL.text, 'center', a, true, 2); text(g, a2, x, y + 108, `400 26px ${F.mono}`, COL.dim, 'center', a); });
  text(g, 'NO BINDING AGREEMENT', W / 2, 250, `600 44px ${F.lab}`, COL.text, 'center', pr(t, at('c4k', .5), at('c4k', .5) + .5), true, 5);
}
function twoDams(g, t, t0, t1) {   // the question: who holds back, who lets go
  BG(g); const y = 560, xg = 520, xa = W - 520, k = eo(pr(t, t0 - .3, t0 + .7));
  g.save(); g.strokeStyle = '#7fb3ff'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(200, y); g.lineTo(lerp(200, W - 200, k), y); g.stroke(); g.restore();
  for (const [x, n, sub, tt] of [[xg, 'GERD', 'Ethiopia · 74 billion m³', t0 - .1], [xa, 'ASWAN HIGH DAM', 'Egypt · Lake Nasser', t0 + .2]]) { const a = pr(t, tt, tt + .4);
    g.save(); g.globalAlpha = a; g.fillStyle = '#c9ccc8'; g.fillRect(x - 18, y - 110, 36, 220); g.restore(); text(g, n, x, y - 150, `600 40px ${F.lab}`, COL.text, 'center', a, true, 3); text(g, sub, x, y + 160, `400 24px ${F.mono}`, COL.dim, 'center', a); }
  text(g, '→ flow →', W / 2, y - 30, `400 28px ${F.mono}`, COL.dim, 'center', k, false);
  const kq = pr(t, at('c5c', .2), at('c5c', .2) + .5); text(g, 'IN A DROUGHT, WHO RELEASES WHAT?', W / 2, 250, `600 46px ${F.lab}`, COL.amber, 'center', kq, true, 4);
  const kd = pr(t, at('c5d'), at('c5d') + .5), kd2 = pr(t, at('c5d', .45), at('c5d', .45) + .5);
  text(g, 'EGYPT: a binding agreement', 200, 850, `600 34px ${F.lab}`, COL.amber, 'left', kd, true, 2); text(g, 'ETHIOPIA: its own dam, its own decision', W - 200, 850, `600 34px ${F.lab}`, '#7fb3ff', 'right', kd2, true, 2);
  text(g, 'schematic · not to scale', W - 120, 52, `400 23px ${F.mono}`, COL.dim, 'right', 1, false);
}
function versionsGraphic(g, t, t0, t1) {
  BG(g); const cards = [['EGYPT', '"a man-made flood"', 'sudden releases from the dam', COL.amber, at('c6c')], ['ETHIOPIA', 'the dam held water back', 'without it, worse damage', '#7fb3ff', at('c6d')], ['SUDAN', 'also the White Nile', 'and war-damaged infrastructure', COL.teal, at('c6e')]];
  text(g, 'THE FLOOD OF 2025 · THREE VERSIONS', W / 2, 220, `600 42px ${F.lab}`, COL.text, 'center', pr(t, t0, t0 + .4), true, 4);
  cards.forEach(([n, q, s, col, tt], i) => { const a = eo(pr(t, tt, tt + .6)), x = 220 + i * 520, y = 360 + 30 * (1 - a); if (a <= 0) return;
    g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(x, y, 440, 420); g.fillStyle = col; g.fillRect(x, y, 440, 8); g.restore();
    text(g, n, x + 30, y + 80, `600 40px ${F.lab}`, col, 'left', a, true, 4); text(g, q, x + 30, y + 190, `400 34px ${F.serif}`, COL.text, 'left', a, false); text(g, s, x + 30, y + 250, `400 24px ${F.mono}`, COL.dim, 'left', a, false); });
  text(g, 'statements as reported by Ahram Online, Sudan Tribune, The New Arab, Fanack · Sept–Oct 2025', W - 120, 52, `400 23px ${F.mono}`, COL.dim, 'right', 1, false);
}
function headlineCard(g, t, t0, t1) {
  BG(g); const k1 = eo(pr(t, t0 + .2, t0 + 1)), k2 = eo(pr(t, at('c7a', .55), at('c7a', .55) + .8));
  text(g, '2 NOVEMBER 2026', 220, 330, `500 96px ${F.num}`, COL.amber, 'left', k1);
  text(g, 'Egypt and Sudan, joint statement:', 220, 420, `600 40px ${F.lab}`, COL.text, 'left', k1, true, 2); text(g, 'a binding legal agreement on the dam, citing the 1959 treaty', 220, 470, `400 28px ${F.mono}`, COL.dim, 'left', k1);
  text(g, 'ETHIOPIA', 220, 640, `500 96px ${F.num}`, '#7fb3ff', 'left', k2); text(g, 'more dams planned on the Blue Nile', 220, 720, `600 40px ${F.lab}`, COL.text, 'left', k2, true, 2);
  text(g, 'allAfrica, 3 Nov 2026; Al Majalla', W - 120, 52, `400 23px ${F.mono}`, COL.dim, 'right', 1, false);
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
  ({ 0: () => { R('c0b', .3, 1); EV.push({ t: at('c0f', 1) + .4, type: 'title' }); },
     1: () => { R('c1a2', .4); R('c1f', .1, 1); R('c1g', .3); },
     2: () => { R('c2c', .05, 1); R('c2d', .1); },
     3: () => { R('c3c', .45, 1); R('c3g', .1); },
     4: () => { R('c4e', .1); R('c4f', .1); R('c4g', .2, 1); R('c4i', .45, 1); R('c4k', .1); },
     5: () => { R('c5c', .2); },
     6: () => { R('c6b', .6); },
     7: () => EV.push({ t: at('c7c', .5), type: 'title' }) })[ch]();
}
export const dur = () => DUR, events = () => EV;
const XF = .5;
export function frame(t) {
  const out = [];
  SHOTS.forEach((S, i) => { const fin = i === 0 ? 1 : pr(t, S.t0 - XF / 2, S.t0 + XF / 2), fout = i === SHOTS.length - 1 ? 1 : 1 - pr(t, S.t1 - XF / 2, S.t1 + XF / 2), a = Math.min(fin, fout); if (a > 0) out.push({ S, a }); });
  return out;
}
// detail plates only show once they can fill the frame (altitude, km)
const det = (alt, a0) => a0 ? G.clamp((a0 - alt) / (a0 * .25)) : 0;
export function globeState(S, t) {
  const cam = S.cam(t), alt = cam.alt, sl = NEEDS[CH].slots;
  const st = { bE: BASIN, b1: PL[(sl[0]?.[0] || 'res_').split('_')[0]] || PL.res, b2: PL[(sl[1]?.[0] || 'res_').split('_')[0]] || PL.res, uExpo: 1.04,
    uAtm: G.clamp((alt - 1500) / 3000), uShade: G.clamp((alt - 1500) / 4000), uDet1: sl[0] ? det(alt, sl[0][0] === 'khartoum' ? 30 : 150) : 0, uDet2: sl[1] ? det(alt, 30) : 0, uSwap1: 90, uSwap2: 90,
    uNightA: 0, uNightB: 0, uScanLat: 60, ...(S.state ? S.state(t) : {}) };
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
    if (S.title) G.chapter(g, t, S.t0, Math.min(S.t1 + .2, S.t0 + 5.5), ...S.title);
    g.restore();
  }
  const s = SUBS.find(x => t >= x.t0 && t < x.t1); if (s) G.subtitle(g, s.text, pr(t, s.t0, s.t0 + .15) * (1 - pr(t, s.t1 - .12, s.t1)));
}
export { SHOTS };
