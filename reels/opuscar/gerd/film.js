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
  0: { photos: ['eth_countryside', 'photos/ph_gerd_aster', 'cairo_rowing'], terrain: true, slots: [] },
  1: { photos: ['bluenile_falls', 'cairo_rowing', 'plates/khartoum', 'tana_fishermen', 'khartoum_bluenile'], terrain: false, slots: [] },
  2: { photos: ['khartoum_shadouf', 'eth_plough'], terrain: true, slots: [] },
  3: { photos: ['oromia_village', 'eth_countryside', 'tana_fishermen', 'bahirdar_street'], terrain: true, slots: [] },
  4: { photos: [], terrain: true, slots: [], timelapse: true },
  5: { photos: ['nasser_view', 'aswan_lascar', 'photos/ph_iss_2020', 'cairo_rowing', 'khartoum_bluenile'], terrain: true, slots: [] },
  6: { photos: ['bluenile_falls', 'photos/ph_iss_2020', 'cairo_rowing', 'nasser_view', 'plates/khartoum'], terrain: true, slots: [] },
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
// the short forms the re-cut is written in (EDITING.md §3): every shot is a hard cut and travels
const CRED = { aswan_lascar: 'Photo: Jorge Láscar, CC BY 2.0', bluenile_falls: 'Photo: Nina R, CC BY 2.0', cairo_rowing: 'Photo: Ibrahim.ID, CC BY 4.0', eth_countryside: 'Photo: A. Davey, CC BY 2.0', eth_plough: 'Photo: ILRI / Stevie Mann, CC BY 2.0',
  nasser_view: 'Photo: Warren LeMay, CC0', oromia_village: 'Photo: Ninara, CC BY 2.0', tana_fishermen: 'Photo: A. Davey, CC BY 2.0', 'photos/ph_iss_2020': 'Photo: NASA / ISS crew', khartoum_bluenile: 'Photo: Francisco Anzola, CC BY 2.0',
  bahirdar_street: 'Photo: Radosław Botev, CC BY 3.0', 'plates/khartoum': 'Landsat 8 · USGS · 13 Sept 2024' };
const Gl = (t0, t1, A, B, o = {}) => globe(t0, t1, [[t0 - .3, ...A], [t1 + .1, ...B]], { cut: 1, ...o });
const Tr = (t0, t1, A, B, o = {}, lv) => terrain(t0, t1, fly(A, B, lv ? { level: lv } : {}), { cut: 1, ...o });
const P = (t0, t1, img, from, to, o = {}) => photo(t0, t1, img, from, to, { cut: 1, credit: CRED[img], ...o });
const LAYERS = [];   // graphics that play across several shots: the picture keeps cutting underneath
const layer = (t0, t1, fn, veil = .6) => LAYERS.push({ t0, t1, fn, veil });
const lowerL = (t0, t1, title, meta) => layer(t0, t1, (g, t) => G.lower(g, t, t0 + .2, t1 - .1, title, meta), 0);
// terrain moves in the gorge (km on the plate: x east from 34.95°E, y north from 10.70°N; the dam is at x 15.6, y 57.0)
const fly = (a, b, o = {}) => u => { const k = eio(u); const v = {}; for (const key of Object.keys(a)) v[key] = typeof a[key] === 'number' ? lerp(a[key], b[key] ?? a[key], k) : a[key]; return { sunAz: 240, sunEl: 17, haze: 70, ...v, ...(o.level ? { level: o.level(u) } : {}) }; };
const LV = (l0, l1, u0 = 0, u1 = 1) => u => lerp(l0, l1, eio(pr(u, u0, u1)));
// a graphic laid over a moving shot: the slate card becomes a dark veil, so the map or terrain keeps moving behind it
let VEIL = 0; const BG = g => VEIL < 0 ? 0 : VEIL ? (g.save(), g.fillStyle = `rgba(9,13,17,${VEIL})`, g.fillRect(0, 0, W, H), g.restore()) : G.bg(g);
const onShot = (fn, veil = .62) => (g, t, cam, S) => { VEIL = veil; try { fn(g, t, S.t0, S.t1); } finally { VEIL = 0; } };
// a readable key on a picture (dark chip, large type)
function key(g, t, t0, t1, big, small, x = 120, y = 150) {
  const a = win(t, t0, t1, .4); if (a <= 0) return; g.save(); g.font = `600 38px ${F.lab}`; const w = Math.max(g.measureText(big).width, small.length * 16.5) + 70; g.restore();
  g.save(); g.globalAlpha = a * .78; g.fillStyle = '#080b0e'; g.fillRect(x, y, w, 118); g.globalAlpha = a; g.fillStyle = COL.amber; g.fillRect(x, y, 6, 118); g.restore();
  text(g, big, x + 34, y + 52, `600 38px ${F.lab}`, COL.text, 'left', a, false, 2); text(g, small, x + 34, y + 94, `400 28px ${F.mono}`, COL.text, 'left', a, false);
}

// ———— chapters ————
const CHAPTERS = {
  0() {   // the hook, cut to the rulebook (EDITING.md): the impossible fact first, a new moving picture every 3–4 s, subject centre frame
    const a = at, f0 = a('c0a', .4), f1 = a('c0b') - .1, fill = t => eio(pr((t - f0 + .25) / (f1 - f0 + .5), 0, .75));
    const stamp = (g, t) => { const k = fill(t); yearStamp(g, t, .1, f1 - .1, Math.round(2020 + 6 * k), k < .02 ? 'a river in a canyon' : k > .9 ? 'a lake · 1,581 km² of open water' : 'filling'); };
    terrain(0, f0, fly({ x: 46, y: 2, h: 8.5, tx: 24, ty: 34, th: 0 }, { x: 33, y: 12, h: 5.2, tx: 21, ty: 40 }), { over: (g, t) => { if (t < f0) stamp(g, t); } });
    terrain(f0, f1, fly({ x: 33, y: 12, h: 5.2, tx: 21, ty: 40 }, { x: 40, y: 6, h: 8.0, tx: 22, ty: 40 }, { level: LV(0, 640, 0, .75) }),
      { lower: ['THE BLUE NILE GORGE · 2020 TO 2026', '3D: NASADEM elevation ×1.6 · Landsat 8 · shoreline as measured'], over: (g, t) => { if (t >= f0) stamp(g, t); } });
    photo(f1, a('c0b', .3), 'photos/ph_gerd_aster', [.5, .45, 1.0], [.5, .5, 1.3], { credit: 'Image: NASA/METI/AIST/Japan Space Systems · ASTER, 2020', over: (g, t) => key(g, t, f1 + .15, a('c0b', .3) + .1, 'THE DAM FROM SPACE · FALSE COLOUR', 'plants show red · water shows blue') });
    globe(a('c0b', .3), a('c0b', .62), [[a('c0b', .3) - .3, 12.0, 34.0, 3300], [a('c0b', .62), 11.4, 34.6, 2400]],
      { over: (g, t, cam) => { border(g, t, cam, a('c0b', .3), a('c0b', .3) + .9); label(g, t, cam, [13.0, 32.6], 'SUDAN', a('c0b', .3), a('c0b', .62)); label(g, t, cam, [9.6, 37.4], 'ETHIOPIA', a('c0b', .32), a('c0b', .62)); pin(g, t, cam, DAM, 'THE DAM', '14 km from Sudan', a('c0b', .34), a('c0b', .62)); } });
    globe(a('c0b', .62), a('c0d', .5), [[a('c0b', .62), 11.4, 34.6, 2400], [a('c0d') - .2, 19.0, 33.2, 6800], [a('c0d', .5), 27.5, 31.6, 3000]],
      { over: (g, t, cam) => { rivers(g, t, cam, ['blue', 'nile'], a('c0b', .64), a('c0d', .3), 1 - pr(t, a('c0d', .5) - .3, a('c0d', .5) - .05)); pin(g, t, cam, DAM, 'BLUE NILE', null, a('c0b', .66), a('c0d') - .2); G.counter(g, t, a('c0d') + .1, a('c0d', .5), { to: 2500, label: 'KILOMETRES DOWNSTREAM', sub: 'from the dam to Cairo, along the river' }); pin(g, t, cam, CAIRO, 'EGYPT', null, a('c0d', .2), a('c0d', .5) - .2); } });
    photo(a('c0d', .5), a('c0e'), 'cairo_rowing', [.5, .5, 1.0], [.5, .45, 1.14], { amb: 'river', credit: 'Photo: Ibrahim.ID, CC BY 4.0', over: (g, t) => G.lower(g, t, a('c0d', .5) + .2, a('c0e') - .1, 'CAIRO · THE NILE', '≈ 2,500 km downstream of the dam') });
    photo(a('c0e'), a('c0e', .55), 'eth_countryside', [.5, .5, 1.14], [.47, .5, 1.0], { credit: 'Photo: A. Davey, CC BY 2.0',
      over: (g, t) => quote(g, t, a('c0e') + .15, a('c0e', .55), '"to light up our homes"', 'Abiy Ahmed, Prime Minister of Ethiopia · 9 Sep 2025 (Reuters)') });
    globe(a('c0e', .55), a('c0f'), [[a('c0e', .55) - .3, 21, 33, 6800], [a('c0f'), 16, 35, 5200]], { state: () => ({ uNightA: 0, uNightB: 1, uScanLat: -90, uScanOn: 0 }),
      over: (g, t, cam) => { label(g, t, cam, [29.5, 31.2], 'EGYPT', a('c0e', .57), a('c0f')); label(g, t, cam, [9.5, 38.5], 'ETHIOPIA', a('c0e', .6), a('c0f')); G.lower(g, t, a('c0e', .6), a('c0f') - .1, 'THE NILE BASIN AT NIGHT', 'NASA VIIRS Black Marble · 2016'); } });
    terrain(a('c0f'), a('c0f', .46), fly({ x: 2, y: 64, h: 3.5, tx: 22, ty: 40, th: 0 }, { x: 6, y: 58, h: 4.8, tx: 26, ty: 36 }, { level: () => 640 }),
      { lower: ['THE GRAND ETHIOPIAN RENAISSANCE DAM', 'the reservoir at full supply level, 640 m'] });
    globe(a('c0f', .46), DUR, [[a('c0f', .46) - .3, 11.4, 35.0, 2600], [a('c0f', 1) + .6, 17.5, 33.0, 8200], [DUR, 18.5, 33.0, 9000]],
      { over: (g, t, cam) => { rivers(g, t, cam, ['blue', 'nile'], a('c0f', .5), a('c0f', 1)); bigTitle(g, t, a('c0f', 1) + .2, DUR + 1, 'WHO CONTROLS THE NILE?', 'the Grand Ethiopian Renaissance Dam'); } });
  },
  1() {
    const a = at, WN = (g, t, cam) => rivers(g, t, cam, ['white', 'nile'], -9, -8), draw = (g, t, cam) => rivers(g, t, cam, ['white', 'nile'], a('c1a2'), a('c1b') - .3);
    globe(0, a('c1a'), [[0, 14, 33, 9000], [a('c1a'), 10, 33, 8000]], { title: ['01', 'Where the water starts'] });
    Gl(a('c1a'), a('c1a', .55), [8, 33, 7000], [1, 33, 3600]);
    Gl(a('c1a', .55), a('c1a2'), [-.3, 33, 2800], [VIC[0], VIC[1], 2000], { over: (g, t, cam) => pin(g, t, cam, VIC, 'LAKE VICTORIA', null, a('c1a', .55) + .1, a('c1a2')) });
    Gl(a('c1a2'), a('c1a2', .5), [1, 32.6, 3000], [9, 31.8, 3800], { over: draw });
    Gl(a('c1a2', .5), a('c1b'), [15, 32, 7500], [22, 31.5, 6200], { over: (g, t, cam) => { draw(g, t, cam); G.counter(g, t, a('c1a2', .5) + .1, a('c1b'), { to: 11, fmt: v => Math.round(v) + '', label: 'COUNTRIES IN THE NILE BASIN', sub: '> 6,000 km from Lake Victoria to the sea' }); } });
    Gl(a('c1b'), a('c1b', .5), [12, 31.5, 9000], [10, 31.2, 7000], { over: (g, t, cam) => { WN(g, t, cam); label(g, t, cam, [7.5, 30.6], 'WHITE NILE', a('c1b', .1), a('c1b', .5)); } });
    P(a('c1b', .5), a('c1c'), 'tana_fishermen', [.5, .5, 1.15], [.5, .58, 1.0], { amb: 'river', lower: ['LAKE TANA · ETHIOPIA', 'where the Blue Nile begins'] });
    Gl(a('c1c'), a('c1c', .45), [9, 31, 3600], [12.6, 34, 2700], { over: (g, t, cam) => { WN(g, t, cam); rivers(g, t, cam, ['blue'], a('c1c', .05), a('c1c', .45), 1, COL.blue); label(g, t, cam, [11.2, 36.6], 'BLUE NILE', a('c1c', .25), a('c1c', .45), COL.blue); } });
    Gl(a('c1c', .45), a('c1c', .8), [14.6, 33.2, 1900], [KHT[0], KHT[1], 800], { over: (g, t, cam) => { WN(g, t, cam); rivers(g, t, cam, ['blue'], -9, -8, 1, COL.blue); pin(g, t, cam, KHT, 'KHARTOUM', null, a('c1c', .47), a('c1c', .8)); } });
    P(a('c1c', .8), a('c1d'), 'khartoum_bluenile', [.45, .45, 1.0], [.5, .5, 1.14], { lower: ['THE BLUE NILE', 'at Khartoum, Sudan'] });
    graphic(a('c1d'), a('c1e'), (g, t, t0, t1) => { G.photo(g, IMG['plates/khartoum'], t, t0 - .5, t1 + .5, [.5, .55, 1.0], [.47, .6, 1.12], 1);
      const P = (lat, lon) => { const [w, s, e, n] = [32.36, 15.50, 32.72, 15.72], u = eio(pr(t, t0 - .5, t1 + .5)), z = lerp(1, 1.12, u), im = IMG['plates/khartoum'], base = Math.max(W / im.width, H / im.height) * z, ww = im.width * base, hh = im.height * base;
        const x = G.clamp(W / 2 - lerp(.5, .47, u) * ww, W - ww, 0), y = G.clamp(H / 2 - lerp(.55, .6, u) * hh, H - hh, 0); return [x + (lon - w) / (e - w) * ww, y + (n - lat) / (n - s) * hh]; };
      const tag = (ll, s, col, tt) => { const [x, y0] = P(...ll), y = G.clamp(y0, 130, H - 330), a = pr(t, tt, tt + .4); text(g, s, x, y, `600 34px ${F.lab}`, col, 'center', a, true, 4); };
      tag([15.578, 32.468], 'WHITE NILE', COL.text, a('c1d', .25)); tag([15.60, 32.605], 'BLUE NILE', '#e8c08a', a('c1d', .55)); tag([15.68, 32.50], 'THE NILE', COL.text, a('c1d', .8));
      G.lower(g, t, t0 + .3, t1 - .1, 'KHARTOUM · 13 SEPTEMBER 2024', 'Landsat 8 · flood season · USGS'); }, { cut: 1 });
    P(a('c1e'), a('c1e', .55), 'bluenile_falls', [.5, .55, 1.0], [.5, .5, 1.12], { amb: 'river', lower: ['THE BLUE NILE FALLS', 'below Lake Tana, Ethiopia'] });
    P(a('c1e', .55), a('c1e', 1) + .4, 'bluenile_falls', [.6, .42, 1.75], [.52, .46, 1.5]);
    const RE = (g, t, cam) => rivers(g, t, cam, ['blue', 'atbara', 'sobat'], a('c1e', 1) + .4, a('c1f', .5), 1, COL.blue);
    Gl(a('c1e', 1) + .4, a('c1f', .4), [11.5, 37.5, 2600], [12.5, 36, 3200], { over: RE });
    Gl(a('c1f', .4), a('c1f', .75), [14, 35, 4500], [17, 33.5, 5600], { over: (g, t, cam) => { RE(g, t, cam); rivers(g, t, cam, ['nile'], a('c1f', .4), a('c1g')); } });
    Gl(a('c1f', .75), a('c1g'), [22, 32.5, 5200], [27, 31.5, 3600], { over: (g, t, cam) => { RE(g, t, cam); rivers(g, t, cam, ['nile'], a('c1f', .4), a('c1g')); } });
    layer(a('c1e', 1) + .4, a('c1g'), shareGraphic, .62);
    const C97 = (g, t) => G.counter(g, t, a('c1g', .3), DUR + .4, { to: 97, fmt: v => '≈' + Math.round(v) + '%', label: "OF EGYPT'S RENEWABLE WATER", sub: 'from the Nile · Nile Basin Initiative', col: COL.teal });
    P(a('c1g'), a('c1g', .6), 'cairo_rowing', [.5, .5, 1.12], [.5, .45, 1.0], { amb: 'river', over: C97 });
    P(a('c1g', .6), DUR, 'cairo_rowing', [.72, .58, 1.7], [.66, .55, 1.5], { over: C97 });
  },
  2() {
    const a = at, GR = { state: () => ({ uGrey: .6 }) }, RV = (g, t, cam) => rivers(g, t, cam, ['blue', 'nile'], -9, -8, .9);
    globe(0, a('c2a'), [[0, 20, 32, 6500], [a('c2a'), 19, 32.5, 5600]], { title: ['02', 'A treaty for two'], state: () => ({ uGrey: .85 }) });
    archive(a('c2a'), a('c2a', .55), 'khartoum_shadouf', 'a shaduf lifting water from the Blue Nile · Khartoum', { cut: 1 });
    Gl(a('c2a', .55), a('c2b'), [22, 32, 5600], [13, 35.5, 4000], { ...GR, over: (g, t, cam) => { RV(g, t, cam); label(g, t, cam, [9.5, 38.5], 'ETHIOPIA', a('c2a', .7), a('c2b'), COL.red); } });
    graphic(a('c2b'), a('c2b', .72), treatyCard, { cut: 1 });
    Gl(a('c2b', .72), a('c2c'), [24, 31.5, 5200], [20, 32, 4400], { ...GR, over: (g, t, cam) => { RV(g, t, cam); label(g, t, cam, [26.5, 30.0], 'EGYPT', a('c2b', .74), a('c2c')); label(g, t, cam, [16.5, 30.5], 'SUDAN', a('c2b', .8), a('c2c')); } });
    Gl(a('c2c'), a('c2c', .5), [27, 31, 4200], [25, 31.5, 3600], { ...GR, over: RV });
    Gl(a('c2c', .5), a('c2d'), [17.5, 31.5, 4200], [15.5, 32.5, 3600], { ...GR, over: RV });
    Gl(a('c2d'), a('c2d', .55), [11.5, 37, 4000], [10, 38.5, 3200], { ...GR, over: RV });
    P(a('c2d', .55), a('c2e'), 'eth_plough', [.4, .5, 1.12], [.46, .5, 1.02]);
    layer(a('c2c'), a('c2e'), splitGraphic, .62);
    Gl(a('c2e'), a('c2e', .55), [27, 31, 5000], [23, 32, 5800], { ...GR, over: RV });
    Gl(a('c2e', .55), a('c2e2'), [16, 32.5, 5000], [13.5, 33.5, 4400], { ...GR, over: RV });
    Gl(a('c2e2'), a('c2e2', .5), [10, 36.5, 4200], [11, 35.5, 3500], { ...GR, over: RV });
    Tr(a('c2e2', .5), a('c2f'), { x: 46, y: 2, h: 8.5, tx: 24, ty: 34, th: 0 }, { x: 36, y: 10, h: 5.6, tx: 21, ty: 40 });
    layer(a('c2e'), a('c2f'), timeline1929, .64);
    P(a('c2f'), a('c2f', .55), 'eth_plough', [.45, .5, 1.0], [.5, .5, 1.1], { lower: ['THE ETHIOPIAN HIGHLANDS', 'where most of the water starts'] });
    P(a('c2f', .55), DUR, 'eth_plough', [.76, .34, 1.7], [.72, .38, 1.5]);
  },
  3() {
    const a = at, N = { state: () => ({ uNightA: 1, uNightB: 1 }) }, FULL = () => 640;
    globe(0, a('c3a'), [[0, 15, 34, 7000], [a('c3a'), 15, 34, 6600]], { title: ['03', 'Power for the dark'] });
    globe(a('c3a'), a('c3b'), [[a('c3a'), 15, 34, 6600], [a('c3b'), 16, 34.2, 6300]], { cut: 1, state: t => ({ uNightA: 0, uNightB: 1, uScanLat: lerp(40, -10, pr(t, a('c3a'), a('c3a') + 2.4)), uScanOn: t > a('c3a') && t < a('c3a') + 2.6 ? 1 : 0 }),
      over: (g, t) => G.lower(g, t, a('c3a') + .4, a('c3b') - .1, 'THE NILE BASIN AT NIGHT', 'NASA VIIRS Black Marble · 2016') });
    Gl(a('c3b'), a('c3b', .5), [28.5, 31, 3800], [26.5, 31.5, 2800], { ...N, over: (g, t, cam) => label(g, t, cam, [29.6, 29.2], 'EGYPT', a('c3b'), a('c3b', .5)) });
    Gl(a('c3b', .5), a('c3c'), [12, 37, 4400], [9.5, 38.5, 3000], { ...N, over: (g, t, cam) => { label(g, t, cam, [11.5, 38.5], 'ETHIOPIA', a('c3b', .5), a('c3c')); label(g, t, cam, [9.03, 38.74], 'Addis Ababa', a('c3b', .65), a('c3c'), COL.dim, 24); } });
    P(a('c3c'), a('c3c', .45), 'bahirdar_street', [.5, .5, 1.14], [.5, .56, 1.0], { lower: ['BAHIR DAR · ETHIOPIA', 'a city on Lake Tana'] });
    const C45 = (g, t) => G.counter(g, t, a('c3c', .47), a('c3d'), { to: 45, fmt: v => '≈' + Math.round(v) + '%', label: 'OF ETHIOPIANS WITHOUT ELECTRICITY · 2023', sub: 'World Bank: 55.4% had access' });
    P(a('c3c', .45), a('c3c', .8), 'oromia_village', [.45, .5, 1.12], [.52, .5, 1.02], { over: C45 });
    P(a('c3c', .8), a('c3d'), 'oromia_village', [.8, .62, 1.7], [.74, .6, 1.5], { over: C45 });
    Gl(a('c3d'), a('c3d', .42), [12.4, 35.6, 4200], [11.5, 34.6, 2500], { over: (g, t, cam) => { border(g, t, cam, a('c3d') + .1, a('c3d') + 1.4); rivers(g, t, cam, ['blue'], -9, -8, pr(t, a('c3d'), a('c3d') + .3)); label(g, t, cam, [13.0, 32.6], 'SUDAN', a('c3d', .08), a('c3d', .42)); label(g, t, cam, [9.6, 37.4], 'ETHIOPIA', a('c3d', .12), a('c3d', .42)); pin(g, t, cam, DAM, 'GUBA', 'the dam site', a('c3d', .15), a('c3d', .42)); } });
    Tr(a('c3d', .42), a('c3d', .72), { x: 3, y: 68, h: 5.2, tx: 22, ty: 44, th: 0 }, { x: 7, y: 63, h: 4.0, tx: 24, ty: 41 });
    Tr(a('c3d', .72), a('c3e'), { x: 36, y: 10, h: 6.0, tx: 22, ty: 40 }, { x: 31, y: 15, h: 4.8, tx: 21, ty: 42 });
    lowerL(a('c3d', .42), a('c3e'), 'GUBA · WHERE THE DAM STANDS', 'construction began 2 April 2011 · the gorge before filling');
    const C5 = (g, t) => G.counter(g, t, a('c3e', .2), a('c3f'), { to: 5, fmt: v => '≈ US$' + Math.round(v) + ' bn', label: 'COST · MOSTLY RAISED INSIDE ETHIOPIA', sub: 'bonds + salary contributions · Chinese loan for turbines' });
    P(a('c3e'), a('c3e', .4), 'eth_countryside', [.6, .5, 1.15], [.52, .47, 1.02], { over: C5 });
    P(a('c3e', .4), a('c3e', .72), 'eth_countryside', [.6, .74, 1.8], [.66, .72, 1.6], { over: C5 });
    P(a('c3e', .72), a('c3f'), 'bahirdar_street', [.3, .62, 1.7], [.36, .6, 1.5], { over: C5 });
    Tr(a('c3f'), a('c3f', .5), { x: 30, y: 46, h: 4.2, tx: 18, ty: 58 }, { x: 27, y: 48, h: 3.9, tx: 17, ty: 58 }, {}, FULL);
    Tr(a('c3f', .5), a('c3g'), { x: 2, y: 64, h: 3.5, tx: 22, ty: 40, th: 0 }, { x: 6, y: 58, h: 4.6, tx: 26, ty: 36 }, {}, FULL);
    layer(a('c3f'), a('c3g'), heightGraphic, .66);
    Gl(a('c3g'), a('c3g', .33), [12, 37, 3400], [11, 37.8, 2900], N);
    Gl(a('c3g', .33), a('c3g', .66), [9.6, 39, 2800], [9.2, 38.6, 2200], N);
    Gl(a('c3g', .66), a('c3h'), [17, 34, 5000], [21, 33, 6000], N);
    layer(a('c3g'), a('c3h'), powerGraphic, .52);
    P(a('c3h'), a('c3h', .5), 'tana_fishermen', [.5, .55, 1.12], [.5, .5, 1.0], { amb: 'river', lower: ['LAKE TANA', 'the source of the Blue Nile'] });
    P(a('c3h', .5), DUR, 'tana_fishermen', [.32, .8, 1.8], [.4, .76, 1.55]);
  },
  4() {
    const a = at, FULL = () => 640;
    terrain(0, a('c4a'), fly({ x: 44, y: 12, h: 6, tx: 26, ty: 36, sunAz: 120, sunEl: 24 }, { x: 40, y: 18, h: 6, tx: 22, ty: 42 }), { title: ['04', 'Five summers'] });
    Tr(a('c4a'), a('c4a', .55), { x: 2, y: 64, h: 3.5, tx: 22, ty: 40, th: 0 }, { x: 5, y: 60, h: 4.2, tx: 25, ty: 37 }, {}, FULL);
    Tr(a('c4a', .55), a('c4b'), { x: 40, y: 20, h: 7, tx: 22, ty: 42 }, { x: 34, y: 25, h: 6, tx: 19, ty: 48 }, {}, FULL);
    Tr(a('c4b'), a('c4b', .38), { x: 33, y: 12, h: 5.2, tx: 21, ty: 40 }, { x: 37, y: 9, h: 6.4, tx: 22, ty: 40 }, {}, u => lerp(490, 560, u));
    Tr(a('c4b', .38), a('c4b', .72), { x: 30, y: 46, h: 4.2, tx: 18, ty: 58 }, { x: 26, y: 49, h: 3.8, tx: 16, ty: 58 }, {}, u => lerp(540, 600, u));
    layer(a('c4a'), a('c4b', .72), flowGraphic, .74);
    Tr(a('c4b', .72), a('c4c'), { x: 38, y: 10, h: 6.0, tx: 22, ty: 40 }, { x: 34, y: 13, h: 5.2, tx: 21, ty: 42 }, { lower: ['WHILE IT FILLS, LESS GOES ON', 'water held back is water that does not flow downstream'] }, u => lerp(490, 520, u));
    Tr(a('c4c'), a('c4c', .5), { x: 5, y: 66, h: 5.0, tx: 22, ty: 44, th: 0 }, { x: 9, y: 61, h: 3.8, tx: 25, ty: 40 }, { lower: ['JULY 2020 · THE FIRST FILLING', 'water level raised to 540 m · 3D model'] }, u => lerp(490, 540, eio(u)));
    Gl(a('c4c', .5), a('c4d'), [17, 33, 5200], [21, 32.5, 6400], { over: (g, t, cam) => { rivers(g, t, cam, ['blue', 'nile'], -9, -8); label(g, t, cam, [26.5, 30.0], 'EGYPT', a('c4c', .52), a('c4d')); label(g, t, cam, [16.5, 30.5], 'SUDAN', a('c4c', .58), a('c4d')); pin(g, t, cam, DAM, 'NO AGREEMENT', null, a('c4c', .62), a('c4d')); } });
    const TL = (x, y, mode) => graphic(x, y, (g, t, t0, t1) => timelapse(g, t, t0, t1, mode), { cut: 1 });
    TL(a('c4d'), a('c4e'), 0); TL(a('c4e'), a('c4f') - 1.5, 1); TL(a('c4f') - 1.5, a('c4g') - 1.4, 0); TL(a('c4g') - 1.4, a('c4g', .55), 1); TL(a('c4g', .55), a('c4h'), 0);
    const GA = (g, t) => levelGauge(g, t, { t0: a('c4h'), t1: a('c4i') });
    Tr(a('c4h'), a('c4h', .5), { x: 36, y: 14, h: 6.5, tx: 22, ty: 40 }, { x: 34, y: 16, h: 6.5, tx: 21, ty: 42 }, { over: GA }, u => levelAt(u * .5));
    Tr(a('c4h', .5), a('c4i'), { x: 30, y: 46, h: 4.4, tx: 18, ty: 58 }, { x: 26, y: 49, h: 4.0, tx: 16, ty: 58 }, { over: GA }, u => levelAt(.5 + u * .5));
    lowerL(a('c4h'), a('c4i'), 'WATER LEVEL BEHIND THE DAM', 'end of each filling · 3D model');
    Tr(a('c4i'), a('c4i', .5), { x: 40, y: 20, h: 7, tx: 22, ty: 42 }, { x: 35, y: 24, h: 6.2, tx: 20, ty: 46 }, {}, FULL);
    Tr(a('c4i', .5), a('c4j'), { x: 70, y: 30, h: 5.5, tx: 40, ty: 38 }, { x: 56, y: 38, h: 4.6, tx: 30, ty: 46 }, {}, FULL);
    layer(a('c4i'), a('c4j'), volumeGraphic, .7);
    const GR = { state: () => ({ uGrey: .35 }) };
    Gl(a('c4j'), a('c4j', .4), [17, 33, 4200], [15.6, 32.6, 2600], GR);
    Gl(a('c4j', .4), a('c4j', .72), [36, -70, 7000], [38.9, -77, 4200], GR);
    Gl(a('c4j', .72), a('c4k'), [42, -70, 6500], [40.7, -74, 4200], GR);
    Gl(a('c4k'), DUR, [27, 31.5, 4200], [30, 31.2, 2400], GR);
    layer(a('c4j'), DUR + .5, talksGraphic, .5);
  },
  5() {
    const a = at, FULL = () => 640, GR = { state: () => ({ uGrey: .7, uKeep: 1 }) }, RV = (g, t, cam) => rivers(g, t, cam, ['blue', 'white', 'nile'], -9, -8);
    photo(0, a('c5a'), 'nasser_view', [.5, .55, 1.12], [.5, .5, 1.0], { title: ['05', 'What Egypt fears'], amb: 'river', credit: CRED.nasser_view });
    P(a('c5a'), a('c5a', .35), 'cairo_rowing', [.5, .5, 1.0], [.5, .46, 1.12], { amb: 'river' });
    Tr(a('c5a', .35), a('c5a', .62), { x: 33, y: 12, h: 5.2, tx: 21, ty: 40 }, { x: 38, y: 8, h: 7.0, tx: 22, ty: 40 }, {}, u => lerp(600, 640, u));
    P(a('c5a', .62), a('c5a', .82), 'aswan_lascar', [.4, .5, 1.12], [.5, .5, 1.0]);
    P(a('c5a', .82), a('c5b'), 'aswan_lascar', [.3, .42, 1.75], [.37, .42, 1.5]);
    lowerL(a('c5a', .62), a('c5b'), 'ASWAN HIGH DAM · LAKE NASSER', "Egypt's reserve, completed 1970");
    Gl(a('c5b'), a('c5b', .45), [25, 32.6, 3400], [23.4, 32.5, 1900], GR);
    Gl(a('c5b', .45), a('c5c'), [23, 32.4, 1600], [22.6, 32.0, 950], { ...GR, over: (g, t, cam) => pin(g, t, cam, ASWAN, 'ASWAN HIGH DAM', null, a('c5b', .47), a('c5c')) });
    lowerL(a('c5b') + .1, a('c5c'), 'LAKE NASSER', 'the drought of the 1980s');
    Gl(a('c5c'), a('c5c', 1) + .6, [21, 33, 7000], [18, 33.5, 6000], { over: RV });
    Gl(a('c5c', 1) + .6, a('c5d', .45), [25.5, 32.6, 3400], [24, 32.9, 2500], { over: RV });
    Gl(a('c5d', .45), a('c5d', .75), [12.4, 35.2, 3200], [11.4, 35, 2500], { over: RV });
    Tr(a('c5d', .75), a('c5d2'), { x: 2, y: 64, h: 3.5, tx: 22, ty: 40, th: 0 }, { x: 5, y: 60, h: 4.2, tx: 25, ty: 37 }, {}, FULL);
    layer(a('c5c'), a('c5d2'), twoDams, .72);
    Tr(a('c5d2'), a('c5d2', .25), { x: 70, y: 30, h: 5.5, tx: 40, ty: 38 }, { x: 58, y: 37, h: 4.6, tx: 31, ty: 45 }, {}, FULL);
    Tr(a('c5d2', .25), a('c5d2', .45), { x: 40, y: 20, h: 7, tx: 22, ty: 42 }, { x: 35, y: 24, h: 6.2, tx: 20, ty: 46 }, {}, FULL);
    Gl(a('c5d2', .45), a('c5d2', .64), [23.6, 32.6, 2600], [22.9, 32.3, 1800]);
    Tr(a('c5d2', .64), a('c5d2', .82), { x: 30, y: 46, h: 4.2, tx: 18, ty: 58 }, { x: 26, y: 49, h: 3.8, tx: 16, ty: 58 }, {}, FULL);
    Gl(a('c5d2', .82), a('c5d3'), [14.6, 33.4, 2600], [15.5, 32.7, 1800], { over: RV });
    layer(a('c5d2'), a('c5d3'), caseChips, 0);
    Gl(a('c5d3'), a('c5d3', .3), [13.5, 34.0, 2800], [14.0, 33.6, 2300], { over: (g, t, cam) => { RV(g, t, cam); pin(g, t, cam, KHT, 'KHARTOUM', 'Sudan', a('c5d3') + .2, a('c5d3', .3), -1); pin(g, t, cam, DAM, 'GERD', null, a('c5d3', .08), a('c5d3', .3)); } });
    P(a('c5d3', .3), a('c5d3', .55), 'photos/ph_iss_2020', [.5, .5, 1.2], [.5, .5, 1.05], { lower: ['KHARTOUM AT NIGHT', 'where the Blue and White Nile meet · ISS, 2020'] });
    P(a('c5d3', .55), a('c5d3', .78), 'khartoum_bluenile', [.5, .5, 1.12], [.45, .48, 1.0], { lower: ['THE BLUE NILE AT KHARTOUM', '≈ 500 km downstream of the dam'] });
    Tr(a('c5d3', .78), a('c5e'), { x: 5, y: 66, h: 5.0, tx: 22, ty: 44, th: 0 }, { x: 9, y: 61, h: 3.8, tx: 25, ty: 40 }, { lower: ['THE DAM, FROM DOWNSTREAM', 'Sudan has raised concerns about its safety'] }, FULL);
    Gl(a('c5e'), a('c5e', .5), [12.5, 34.5, 2400], [14, 34, 3600], { over: (g, t, cam) => { rivers(g, t, cam, ['blue'], a('c5e'), a('c5e', .5), 1, COL.blue); pin(g, t, cam, DAM, 'CONTROLLED HERE', null, a('c5e', .25), a('c5e', .5)); } });
    Gl(a('c5e', .5), DUR, [16, 33.5, 5200], [21, 32.8, 7000], { over: (g, t, cam) => { rivers(g, t, cam, ['blue'], -9, -8, 1, COL.blue); rivers(g, t, cam, ['nile'], a('c5e', .5), DUR - .5); pin(g, t, cam, DAM, 'CONTROLLED HERE', null, a('c5e', .5), DUR + 1); } });
  },
  6() {
    const a = at, FULL = () => 640, RV = (g, t, cam) => rivers(g, t, cam, ['blue', 'white', 'nile'], -9, -8);
    terrain(0, a('c6a'), fly({ x: 2, y: 66, h: 4, tx: 20, ty: 44 }, { x: 5, y: 63, h: 4.6, tx: 23, ty: 41 }, { level: FULL }), { title: ['06', 'The flood of 2025'] });
    Tr(a('c6a'), a('c6a', .5), { x: 40, y: 20, h: 7, tx: 22, ty: 42 }, { x: 35, y: 24, h: 6.2, tx: 20, ty: 46 }, {}, FULL);
    Tr(a('c6a', .5), a('c6a', 1) + .3, { x: 30, y: 46, h: 4.2, tx: 18, ty: 58 }, { x: 26, y: 49, h: 3.8, tx: 16, ty: 58 }, {}, FULL);
    lowerL(a('c6a', .3), a('c6a', 1) + .3, '9 SEPTEMBER 2025', 'the dam is formally inaugurated');
    P(a('c6a', 1) + .3, a('c6b', .3), 'bluenile_falls', [.5, .5, 1.2], [.5, .55, 1.05], { amb: 'river' });
    P(a('c6b', .3), a('c6b', .55), 'bluenile_falls', [.6, .42, 1.8], [.54, .46, 1.55]);
    const CF = (g, t) => G.counter(g, t, a('c6b', .6), a('c6c'), { to: 1200, fmt: v => '> ' + Math.round(v).toLocaleString('en-US'), label: 'FAMILIES DISPLACED · BAHRI, KHARTOUM', sub: 'autumn 2025 · Sudanese authorities, via press reports' });
    P(a('c6b', .55), a('c6b', .8), 'photos/ph_iss_2020', [.45, .5, 1.15], [.5, .5, 1.02], { over: CF });
    P(a('c6b', .8), a('c6c'), 'photos/ph_iss_2020', [.6, .55, 1.8], [.55, .52, 1.55], { over: CF });
    P(a('c6c'), a('c6c', .55), 'cairo_rowing', [.5, .5, 1.12], [.5, .46, 1.0]);
    P(a('c6c', .55), a('c6d'), 'nasser_view', [.5, .55, 1.0], [.5, .5, 1.12]);
    layer(a('c6c'), a('c6d'), (g, t, t0, t1) => version(g, t, t0, t1, 'EGYPT', COL.amber, '"a man-made flood"', 'caused by sudden releases from the dam'), 0);
    Tr(a('c6d'), a('c6d', .5), { x: 33, y: 12, h: 5.2, tx: 21, ty: 40 }, { x: 38, y: 8, h: 7.0, tx: 22, ty: 40 }, {}, FULL);
    Tr(a('c6d', .5), a('c6e'), { x: 70, y: 30, h: 5.5, tx: 40, ty: 38 }, { x: 58, y: 37, h: 4.6, tx: 31, ty: 45 }, {}, FULL);
    layer(a('c6d'), a('c6e'), (g, t, t0, t1) => version(g, t, t0, t1, 'ETHIOPIA', '#7fb3ff', 'the dam held water back', 'without it, the damage would have been far worse'), 0);
    Gl(a('c6e'), a('c6e', .5), [13.5, 32.6, 2800], [15.2, 32.5, 1700], { over: (g, t, cam) => rivers(g, t, cam, ['white'], -9, -8) });
    P(a('c6e', .5), a('c6f'), 'plates/khartoum', [.5, .55, 1.0], [.47, .6, 1.12]);
    layer(a('c6e'), a('c6f'), (g, t, t0, t1) => version(g, t, t0, t1, 'SUDAN', COL.teal, 'also the White Nile', 'and infrastructure damaged by war'), 0);
    Gl(a('c6f'), a('c6f', .5), [13, 34, 3200], [14, 33.4, 3900], { over: (g, t, cam) => { RV(g, t, cam); pin(g, t, cam, DAM, 'NO SHARED DATA', 'on how the dam is run', a('c6f', .1), a('c6f', .5)); } });
    Gl(a('c6f', .5), DUR, [17, 33, 6200], [20, 33, 7600], { over: (g, t, cam) => { RV(g, t, cam);
      [['EGYPT', '"a man-made flood"'], ['ETHIOPIA', 'the dam held water back'], ['SUDAN', 'also the White Nile, and war damage']].forEach(([b, sm], i) => key(g, t, a('c6f', .5) + .15 + i * .35, DUR + 1, b, sm, 120, 200 + i * 140)); } });
  },
  7() {
    const a = at, N = { state: () => ({ uNightA: 1, uNightB: 1 }) }, RV = (g, t, cam) => rivers(g, t, cam, ['blue', 'nile'], -9, -8, .8);
    globe(0, a('c7a', .3), [[0, 24, 32, 6000], [a('c7a', .3), 22, 32.6, 5500]], { ...N, over: RV });
    Gl(a('c7a', .3), a('c7a', .55), [30.5, 31.2, 2900], [29.6, 31.2, 2100], N);
    Gl(a('c7a', .55), a('c7a', .8), [11.8, 36, 3800], [10.6, 37, 3100], { ...N, over: RV });
    Gl(a('c7a', .8), a('c7b'), [13, 37.5, 2800], [12, 37.4, 2300], { ...N, over: RV });
    layer(-1, a('c7b'), headlineCard, .55);
    Gl(a('c7b'), a('c7b', .5), [26, 31.5, 3800], [22, 32.2, 5200], N);
    Gl(a('c7b', .5), a('c7c'), [14, 35, 4800], [11, 37, 3600], { ...N, over: (g, t, cam) => label(g, t, cam, [11.2, 38.0], 'THE ETHIOPIAN HIGHLANDS', a('c7b', .55), a('c7c')) });
    const END = (g, t, cam) => { rivers(g, t, cam, ['blue', 'nile'], a('c7c'), a('c7c', .9), 1, COL.amber); bigTitle(g, t, a('c7c', .5), DUR + 1, 'One river.', 'Two great dams. No agreement.');
      if (t > a('c7c', 1) + .6) text(g, 'Which river should we follow next?  Tell us in the comments.', W / 2, H / 2 + 210, `400 30px ${F.mono}`, COL.text, 'center', pr(t, a('c7c', 1) + .6, a('c7c', 1) + 1.1)); };
    Gl(a('c7c'), a('c7c', .6), [11, 37, 3600], [14, 35, 6000], { ...N, over: END });
    Gl(a('c7c', .6), DUR, [15.5, 34, 7200], [17, 33, 9000], { ...N, over: END });
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
const BORDER = [[9.461,34.078],[9.513,34.079],[9.73,34.12],[9.853,34.159],[9.919,34.185],[10.125,34.291],[10.191,34.311],[10.252,34.315],[10.528,34.276],[10.659,34.344],[10.728,34.828],[10.729,34.839],[10.746,34.851],[10.764,34.857],[10.776,34.857],[10.788,34.862],[10.805,34.88],[10.845,34.934],[10.869,34.951],[10.903,34.958],[10.918,34.953],[10.94,34.923],[10.953,34.914],[10.964,34.914],[11.155,34.98],[11.186,34.984],[11.207,34.971],[11.226,34.954],[11.253,34.944],[11.275,34.947],[11.549,35.073],[11.569,35.077],[11.587,35.074],[11.628,35.053],[11.649,35.046],[11.69,35.048],[11.727,35.041],[11.748,35.041],[11.771,35.048],[11.796,35.059],[11.819,35.073],[11.838,35.088],[11.863,35.127],[11.871,35.149],[11.897,35.216],[11.93,35.246],[11.94,35.248],[11.958,35.248],[11.962,35.249],[11.972,35.251],[11.98,35.26],[12.002,35.298],[12.024,35.317],[12.047,35.326],[12.102,35.336],[12.146,35.354],[12.157,35.361],[12.166,35.371],[12.177,35.393],[12.185,35.403],[12.199,35.413],[12.211,35.415],[12.239,35.418],[12.267,35.429],[12.575,35.617],[12.585,35.626],[12.589,35.634],[12.59,35.654],[12.594,35.662],[12.604,35.672],[12.615,35.676],[12.625,35.677],[12.651,35.684],[12.656,35.684],[12.659,35.688],[12.665,35.701],[12.666,35.703],[12.674,35.728],[12.717,36.03],[12.717,36.038],[12.805,36.135],[12.911,36.137],[13.093,36.16],[13.271,36.212],[13.406,36.274],[13.467,36.307],[13.526,36.346],[13.626,36.391],[13.842,36.447],[13.988,36.444],[14.257,36.524]];   // Sudan–Ethiopia boundary (Natural Earth, public domain)
function border(g, t, cam, t0, t1) {
  const k = eo(pr(t, t0, t1)); if (k <= 0) return; const n = Math.max(2, Math.round(BORDER.length * k));
  g.save(); g.lineJoin = 'round'; g.setLineDash([14, 10]);
  for (const [w, c] of [[7, 'rgba(0,0,0,.4)'], [3, 'rgba(244,242,238,.9)']]) { g.lineWidth = w; g.strokeStyle = c; g.beginPath(); let on = false;
    for (let i = 0; i < n; i++) { const [x, y, vis] = project(cam, BORDER[i][0], BORDER[i][1]); if (!vis) { on = false; continue; } on ? g.lineTo(x, y) : g.moveTo(x, y); on = true; } g.stroke(); }
  g.restore();
}
// the year, large, top left: the opening's clock
function yearStamp(g, t, t0, t1, year, sub) {
  const a = pr(t, t0, t0 + .5) * (1 - pr(t, t1 - .4, t1)); if (a <= 0) return;
  g.save(); g.globalAlpha = a; const gr = g.createRadialGradient(330, 200, 20, 330, 200, 520); gr.addColorStop(0, 'rgba(8,11,14,.5)'); gr.addColorStop(1, 'rgba(8,11,14,0)'); g.fillStyle = gr; g.fillRect(0, 0, 900, 720); g.fillStyle = COL.amber; g.fillRect(120, 104, 90, 5); g.restore();
  text(g, String(year), 114, 250, `500 170px ${F.num}`, COL.amber, 'left', a); text(g, sub, 120, 296, `400 28px ${F.mono}`, COL.text, 'left', a);
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
function powerGraphic(g, t, t0, t1) {   // 13 turbines switch on one by one (2 × 375 MW + 11 × 400 MW = 5,150 MW), then the comparison with Aswan
  BG(g); const N = 13, MW = i => i < 2 ? 375 : 400, on = G.clamp((t - t0 - .3) / 2.6) * N, x0 = 250, dx = (W - 500) / (N - 1), yT = 360;
  text(g, 'THIRTEEN TURBINES', 220, 210, `600 40px ${F.lab}`, COL.text, 'left', pr(t, t0, t0 + .4), true, 3);
  let sum = 0;
  for (let i = 0; i < N; i++) { const k = G.clamp(on - i), x = x0 + i * dx, r = 46; sum += MW(i) * k;
    g.save(); g.translate(x, yT); g.globalAlpha = pr(t, t0 + .1, t0 + .5);
    g.strokeStyle = k > 0 ? COL.amber : 'rgba(244,242,238,.35)'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke();
    if (k > 0) { g.globalAlpha *= .25 * k; g.fillStyle = COL.amber; g.beginPath(); g.arc(0, 0, r + 14, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    g.rotate(k > 0 ? (t - t0) * 5 + i : i); g.fillStyle = k > 0 ? COL.amber : 'rgba(244,242,238,.45)';
    for (let j = 0; j < 5; j++) { g.rotate(Math.PI * 2 / 5); g.beginPath(); g.moveTo(0, -8); g.quadraticCurveTo(22, -30, 6, -r + 8); g.quadraticCurveTo(2, -24, 0, -8); g.fill(); }
    g.beginPath(); g.arc(0, 0, 9, 0, Math.PI * 2); g.fill(); g.restore(); }
  text(g, Math.round(sum).toLocaleString('en-US'), 220, 580, `500 150px ${F.num}`, COL.amber, 'left', pr(t, t0 + .2, t0 + .6)); g.save(); g.font = `500 150px ${F.num}`; const wn = g.measureText('5,150').width; g.restore();
  text(g, 'MEGAWATTS', 220 + wn + 30, 580, `600 40px ${F.lab}`, COL.text, 'left', pr(t, t0 + .2, t0 + .6), true, 3);
  const kc = at('c3g', .45), sc = .2, rows = [['GERD', 5150, COL.amber, kc], ['ASWAN HIGH DAM', 2100, COL.teal, kc + .5]];
  rows.forEach(([n, v, col, tt], i) => { const k = eo(pr(t, tt, tt + .9)), y = 650 + i * 84; if (k <= 0) return;
    text(g, n, 560, y + 44, `600 32px ${F.lab}`, COL.text, 'right', k, true, 3); g.save(); g.globalAlpha = k; g.fillStyle = col; g.fillRect(590, y, v * sc * k, 60); g.restore();
    text(g, Math.round(v * k).toLocaleString('en-US') + ' MW', 590 + v * sc * k + 24, y + 48, `500 54px ${F.num}`, col, 'left', k); });
  text(g, "AFRICA'S LARGEST HYDROPOWER PLANT · MORE THAN TWICE ASWAN", 220, 880, `600 30px ${F.lab}`, COL.amber, 'left', pr(t, kc + 1.2, kc + 1.7), true, 3);
  text(g, 'installed capacity · GERD: 2 × 375 MW + 11 × 400 MW · Aswan High Dam: 2,100 MW', W - 120, 52, `400 23px ${F.mono}`, COL.dim, 'right', 1, false);
}
function rotor(g, x, y, r, ang, col) {
  g.save(); g.translate(x, y); g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke(); g.rotate(ang); g.fillStyle = col; const q = r / 46;
  for (let j = 0; j < 5; j++) { g.rotate(Math.PI * 2 / 5); g.beginPath(); g.moveTo(0, -8 * q); g.quadraticCurveTo(22 * q, -30 * q, 6 * q, -r + 8 * q); g.quadraticCurveTo(2 * q, -24 * q, 0, -8 * q); g.fill(); }
  g.beginPath(); g.arc(0, 0, 9 * q, 0, Math.PI * 2); g.fill(); g.restore();
}
function flowGraphic(g, t, t0, t1) {   // a cross-section: running, the river passes through the turbine; filling, part of it stays behind
  BG(g); const kf = eio(pr(t, at('c4b', .12), at('c4b', .12) + 3.4)), yg = 800, xd = 980, top = 400, x0 = 180, x1 = W - 180, surf = lerp(700, 470, kf), out = lerp(66, 22, kf);
  const wave = (xa, xb, y, ph) => { for (let i = 0; i <= 40; i++) { const x = lerp(xa, xb, i / 40); g.lineTo(x, y + Math.sin(i * .6 + t * 2.6 + ph) * 3); } };
  g.save(); g.fillStyle = '#3f78b8'; g.globalAlpha = .92; g.beginPath(); g.moveTo(x0, yg); wave(x0, xd - 30, surf, 0); g.lineTo(xd - 30, yg); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(xd + 100, yg); wave(xd + 100, x1, yg - out, 2); g.lineTo(x1, yg); g.closePath(); g.fill();
  g.globalAlpha = 1; g.fillStyle = '#2a241d'; g.fillRect(x0, yg, x1 - x0, 22);
  g.fillStyle = '#c9ccc8'; g.beginPath(); g.moveTo(xd - 64, yg); g.lineTo(xd - 22, top); g.lineTo(xd + 40, top); g.lineTo(xd + 112, yg); g.closePath(); g.fill();
  g.strokeStyle = '#0d1317'; g.lineWidth = 26; g.beginPath(); g.moveTo(xd - 58, yg - 34); g.lineTo(xd + 104, yg - 24); g.stroke(); g.restore();
  rotor(g, xd + 30, yg - 30, 30, t * lerp(7, 2.6, kf), COL.amber);
  g.save(); g.fillStyle = 'rgba(255,255,255,.75)';   // the water, as moving marks: fewer leave than arrive while it fills
  for (let i = 0; i < 12; i++) { const u = ((t * .16 + i / 12) % 1), x = lerp(x0 + 20, xd - 70, u); g.fillRect(x, yg - 44 + (i % 3) * 10, 26, 4); }
  const n = Math.round(lerp(12, 4, kf)); for (let i = 0; i < n; i++) { const u = ((t * .2 + i / n) % 1), x = lerp(xd + 120, x1 - 30, u); g.fillRect(x, yg - out / 2 - 2, 26, 4); } g.restore();
  const meter = (x, w, frac, lab, right) => { g.save(); g.fillStyle = 'rgba(244,242,238,.16)'; g.fillRect(x, 300, w, 20); g.fillStyle = '#7fb3ff'; g.fillRect(right ? x + w * (1 - frac) : x, 300, w * frac, 20); g.restore(); text(g, lab, right ? x + w : x, 280, `600 32px ${F.lab}`, COL.text, right ? 'right' : 'left', 1, true, 3); };
  meter(x0 + 40, 440, 1, 'RIVER IN', 0); meter(x1 - 480, 440, lerp(1, .34, kf), 'RIVER OUT, DOWNSTREAM', 1);
  text(g, 'less, while the lake fills', x1 - 40, 356, `400 26px ${F.mono}`, COL.amber, 'right', kf, false);
  text(g, 'TURBINE', xd + 30, yg + 62, `600 26px ${F.lab}`, COL.amber, 'center', 1, true, 3); text(g, 'DAM', xd + 8, top - 22, `600 30px ${F.lab}`, COL.text, 'center', 1, true, 3);
  if (kf > 0) { text(g, 'HELD BACK', (x0 + xd) / 2 - 40, surf + 70, `600 40px ${F.lab}`, COL.text, 'center', kf, true, 4); g.save(); g.globalAlpha = kf; g.strokeStyle = COL.text; g.lineWidth = 3; const ax = x0 + 110; g.beginPath(); g.moveTo(ax, 700); g.lineTo(ax, surf + 24); g.moveTo(ax - 12, surf + 40); g.lineTo(ax, surf + 24); g.lineTo(ax + 12, surf + 40); g.stroke(); g.restore(); }
  text(g, kf > .05 ? 'FILLING: PART OF THE RIVER STAYS BEHIND' : 'RUNNING: WHAT COMES IN GOES OUT', W / 2, 190, `600 42px ${F.lab}`, kf > .05 ? COL.amber : COL.text, 'center', 1, true, 3);
  text(g, 'schematic · not to scale', W - 120, 52, `400 23px ${F.mono}`, COL.dim, 'right', 1, false);
}
function timelapse(g, t, t0, t1, mode = 0) {   // the reservoir every dry season, same stretch, same frame (Landsat path 171)
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
  g.fillStyle = '#0b0f12'; g.fillRect(0, 0, W, H);
  let dxm, dym;
  if (mode) {   // the punch-in: the main body of the lake fills the frame and drifts south
    const hh = (lo1 - lo0) * Math.cos(10.9 * Math.PI / 180) * 9 / 16, c = lerp(11.02, 10.9, pr(t, t0 - .3, t1 + .3)), ya = (n - (c + hh / 2)) / (n - s) * im0.height, yh = hh / (n - s) * im0.height;
    g.save(); g.drawImage(im0, sx, ya, sw, yh, 0, 0, W, H); if (u > 0) { g.globalAlpha = u; g.drawImage(im1, sx, ya, sw, yh, 0, 0, W, H); } g.restore();
    g.save(); const gr = g.createLinearGradient(0, 0, 1000, 0); gr.addColorStop(0, 'rgba(8,11,14,.82)'); gr.addColorStop(1, 'rgba(8,11,14,0)'); g.fillStyle = gr; g.fillRect(0, 0, 1000, H); g.restore();
    dxm = (DAM[1] - lo0) / (lo1 - lo0) * W; dym = ((c + hh / 2) - DAM[0]) / hh * H;
  } else { BG(g);
    g.save(); g.drawImage(im0, sx, sy, sw, shh, dx, 0, dw, dh); if (u > 0) { g.globalAlpha = u; g.drawImage(im1, sx, sy, sw, shh, dx, 0, dw, dh); } g.restore();
    dxm = dx + (DAM[1] - lo0) / (lo1 - lo0) * dw; dym = (la1 - DAM[0]) / (la1 - la0) * dh; }
  const yr = yrs[Math.round(f)], m = M[yr], area = lerp(M[yrs[i0]].km2, M[yrs[i1]].km2, u);
  text(g, m.date.slice(0, 7).replace('-', ' · '), 200, 330, `500 120px ${F.num}`, COL.text, 'left', 1);
  text(g, 'LANDSAT · ' + m.date, 200, 380, `400 24px ${F.mono}`, COL.dim, 'left', 1, false);
  text(g, 'OPEN WATER BEHIND THE DAM', 200, 516, `600 32px ${F.lab}`, COL.text, 'left', 1, true, 3);
  text(g, area < 5 ? 'a river' : Math.round(area).toLocaleString('en-US') + ' km²', 196, 660, `500 130px ${F.num}`, COL.teal, 'left', 1);
  text(g, 'measured on these images · MNDWI > 0', 200, 712, `400 26px ${F.mono}`, COL.dim, 'left', 1, false);
  const kl = pr(t, at('c4g', .6), at('c4g', .6) + .6); text(g, '≈ the size of Greater London (1,572 km²)', 200, 800, `500 32px ${F.lab}`, COL.amber, 'left', kl, true);
  // the dam marker on the image
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
function volumeGraphic(g, t, t0, t1) {   // two tanks, same base, one scale: height ∝ volume. 74 = 55.5 + 18.5, the whole 1959 allocation
  BG(g); const yb = 800, sc = 6.4, tw = 360, xl = 520, xr = 1160, k1 = eo(pr(t, t0 + .2, t0 + 1.6)), tE = at('c4i', .45), k2 = eo(pr(t, tE, tE + 1.1)), k3 = eo(pr(t, tE + 1.3, tE + 2.2));
  text(g, 'BILLION CUBIC METRES', xl, 170, `600 38px ${F.lab}`, COL.text, 'left', pr(t, t0, t0 + .4), true, 4);
  const tank = (x, a) => { g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(244,242,238,.05)'; g.fillRect(x, yb - 80 * sc, tw, 80 * sc); g.strokeStyle = 'rgba(244,242,238,.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, yb - 80 * sc - 14); g.lineTo(x, yb); g.lineTo(x + tw, yb); g.lineTo(x + tw, yb - 80 * sc - 14); g.stroke();
    g.lineWidth = 1.5; for (let v = 20; v <= 80; v += 20) { g.beginPath(); g.moveTo(x, yb - v * sc); g.lineTo(x + 18, yb - v * sc); g.stroke(); } g.restore();
    for (let v = 20; v <= 80; v += 20) text(g, v + '', x - 14, yb - v * sc + 8, `400 22px ${F.mono}`, COL.dim, 'right', a, false); };
  const water = (x, v0, v1, col, a) => { if (v1 <= v0) return; const yt = yb - v1 * sc, y0 = yb - v0 * sc; g.save(); g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.moveTo(x + 2, y0);
    for (let i = 0; i <= 36; i++) { const xx = x + 2 + (tw - 4) * i / 36; g.lineTo(xx, yt + Math.sin(i * .7 + t * 3 + x) * 3); } g.lineTo(x + tw - 2, y0); g.closePath(); g.fill(); g.restore(); };
  tank(xl, pr(t, t0, t0 + .4)); water(xl, 0, 74 * k1, '#5ea0dc', .92);
  text(g, (74 * k1).toFixed(k1 < 1 ? 1 : 0), xl + tw / 2, yb - 74 * sc * k1 - 26, `500 96px ${F.num}`, '#8fc0ee', 'center', pr(t, t0 + .2, t0 + .6));
  text(g, 'THE RESERVOIR, FULL', xl + tw / 2, yb + 54, `600 30px ${F.lab}`, COL.text, 'center', pr(t, t0 + .2, t0 + .6), true, 3);
  const aR = pr(t, tE - .3, tE + .1); tank(xr, aR); water(xr, 0, 55.5 * k2, COL.amber, .92); water(xr, 55.5, 55.5 + 18.5 * k3, COL.teal, .92);
  text(g, (55.5 * k2).toFixed(1), xr + tw + 30, yb - 55.5 * sc * k2 / 2 + 30, `500 96px ${F.num}`, COL.amber, 'left', k2); text(g, "EGYPT'S YEARLY SHARE", xr + tw + 34, yb - 55.5 * sc * k2 / 2 + 72, `600 26px ${F.lab}`, COL.text, 'left', k2, true, 2);
  text(g, (18.5 * k3).toFixed(1), xr + tw + 30, yb - (55.5 + 9.25) * sc + 30, `500 80px ${F.num}`, COL.teal, 'left', k3); text(g, "SUDAN'S", xr + tw + 34, yb - (55.5 + 9.25) * sc + 66, `600 26px ${F.lab}`, COL.text, 'left', k3, true, 2);
  text(g, 'THE 1959 TREATY SHARES', xr + tw / 2, yb + 54, `600 30px ${F.lab}`, COL.text, 'center', aR, true, 3);
  if (k3 > 0) { g.save(); g.globalAlpha = k3; g.strokeStyle = COL.text; g.setLineDash([10, 8]); g.lineWidth = 2; g.beginPath(); g.moveTo(xl + tw, yb - 74 * sc); g.lineTo(xr, yb - 74 * sc); g.stroke(); g.restore();
    text(g, 'THE SAME', (xl + tw + xr) / 2, yb - 74 * sc - 16, `600 28px ${F.lab}`, COL.text, 'center', k3, true, 3); }
  text(g, 'same tank, same scale · total storage 74, about 59 active · 55.5 + 18.5 = 74', W - 120, 52, `400 23px ${F.mono}`, COL.dim, 'right', 1, false);
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
function twoDams(g, t, t0, t1) {   // the river in profile, highlands to sea, with both dams: in a drought, who releases what?
  BG(g); const xa0 = 160, xb0 = W - 160, yP = x => lerp(470, 770, Math.pow(G.clamp((x - xa0) / (xb0 - xa0)), .8)), xg = 600, xa = 1320, k = eo(pr(t, t0 - .2, t0 + .9));
  const dry = eio(pr(t, at('c5c', .2), at('c5c', .2) + 1.6)), sG = yP(xg) - 92, sA = yP(xa) - 70, back = (xd, sy) => { let x = xd; while (x > xa0 && yP(x) > sy) x -= 4; return x; };
  g.save(); g.globalAlpha = k;
  g.fillStyle = '#2a241d'; g.beginPath(); g.moveTo(xa0, yP(xa0)); for (let x = xa0; x <= xb0; x += 20) g.lineTo(x, yP(x)); g.lineTo(xb0, 830); g.lineTo(xa0, 830); g.closePath(); g.fill();
  for (const [xd, sy] of [[xg, sG], [xa, sA]]) { const xs = back(xd, sy); g.fillStyle = '#3f78b8'; g.beginPath(); g.moveTo(xs, sy); g.lineTo(xd, sy); g.lineTo(xd, yP(xd)); for (let x = xd; x >= xs; x -= 8) g.lineTo(x, yP(x)); g.closePath(); g.fill(); g.fillStyle = '#c9ccc8'; g.fillRect(xd - 4, sy - 22, 26, yP(xd) - sy + 26); }
  g.fillStyle = '#3f78b8'; g.fillRect(xb0 - 70, yP(xb0) - 16, 70, 76);
  g.strokeStyle = '#7fb3ff'; g.lineCap = 'round';
  for (const [x0, x1, w] of [[xa0, back(xg, sG), lerp(12, 4, dry)], [xg + 22, back(xa, sA), 10], [xa + 22, xb0 - 70, 10]]) { g.lineWidth = w; g.setLineDash([]); g.beginPath(); for (let x = x0; x <= x1; x += 10) x === x0 ? g.moveTo(x, yP(x) - w / 2) : g.lineTo(x, yP(x) - w / 2); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; g.setLineDash([22, 60]); g.lineDashOffset = -t * 90; g.stroke(); g.strokeStyle = '#7fb3ff'; }
  g.restore();
  const a1 = pr(t, t0, t0 + .4) , a2 = pr(t, t0 + .3, t0 + .7);
  text(g, 'GERD', xg + 9, sG - 92, `600 40px ${F.lab}`, COL.text, 'center', a1, true, 3); text(g, '74 billion m³', xg + 9, sG - 54, `400 26px ${F.mono}`, COL.dim, 'center', a1);
  text(g, 'ASWAN HIGH DAM', xa + 9, sA - 92, `600 40px ${F.lab}`, COL.text, 'center', a2, true, 3); text(g, 'Lake Nasser', xa + 9, sA - 54, `400 26px ${F.mono}`, COL.dim, 'center', a2);
  text(g, 'ETHIOPIA', 330, 400, `600 30px ${F.lab}`, COL.dim, 'center', k, true, 5); text(g, 'SUDAN', 960, yP(960) - 60, `600 30px ${F.lab}`, COL.dim, 'center', k, true, 5); text(g, 'EGYPT', 1560, yP(1560) - 60, `600 30px ${F.lab}`, COL.dim, 'center', k, true, 5);
  text(g, 'less rain', 250, yP(250) - 50, `400 26px ${F.mono}`, COL.red, 'center', dry, false);
  const kq = pr(t, at('c5c', .2), at('c5c', .2) + .5); text(g, 'IN A DROUGHT, WHO RELEASES WHAT?', W / 2, 220, `600 46px ${F.lab}`, COL.amber, 'center', kq, true, 4);
  const q = pr(t, at('c5c', .55), at('c5c', .55) + .4) * (1 - pr(t, at('c5d') - .3, at('c5d'))), pu = 1 + .12 * Math.sin(t * 5);
  for (const xd of [xg, xa]) text(g, '?', xd + 9, (xd === xg ? sG : sA) - 150, `500 ${Math.round(90 * pu)}px ${F.num}`, COL.amber, 'center', q);
  const kd = pr(t, at('c5d'), at('c5d') + .5), kd2 = pr(t, at('c5d', .45), at('c5d', .45) + .5);
  text(g, 'EGYPT', xa + 9, yP(xa) + 78, `600 34px ${F.lab}`, COL.amber, 'center', kd, true, 3); text(g, 'a binding agreement', xa + 9, yP(xa) + 116, `400 28px ${F.mono}`, COL.text, 'center', kd, false);
  text(g, 'ETHIOPIA', xg + 9, yP(xg) + 78, `600 34px ${F.lab}`, '#7fb3ff', 'center', kd2, true, 3); text(g, 'its own dam, its own decision', xg + 9, yP(xg) + 116, `400 28px ${F.mono}`, COL.text, 'center', kd2, false);
  text(g, 'schematic · not to scale', W - 120, 52, `400 23px ${F.mono}`, COL.dim, 'right', 1, false);
}
function caseChips(g, t, t0, t1) {
  text(g, "ETHIOPIA'S CASE", 120, 170, `600 44px ${F.lab}`, COL.text, 'left', win(t, t0 + .2, t1 - .1), true, 4);
  [['LESS EVAPORATION', 'cool highlands, not the desert', .12], ['A STEADIER RIVER', 'released through the year', .5], ['FEWER FLOODS IN SUDAN', 'the peak is held back', .78]].forEach(([b, sm, f], i) => key(g, t, at('c5d2', f), t1 - .1, b, sm, 120, 220 + i * 140));
}
function version(g, t, t0, t1, who, col, q, sub) {   // one country's account of the flood, full frame over its own picture
  const a = win(t, t0, t1, .25); if (a <= 0) return; const k = eo(pr(t, t0, t0 + .6));
  g.save(); g.globalAlpha = a; const gr = g.createLinearGradient(0, 0, 1500, 0); gr.addColorStop(0, 'rgba(8,11,14,.86)'); gr.addColorStop(.6, 'rgba(8,11,14,.55)'); gr.addColorStop(1, 'rgba(8,11,14,0)'); g.fillStyle = gr; g.fillRect(0, 0, 1500, H);
  g.fillStyle = col; g.fillRect(120, 330, 8, 330 * k); g.restore();
  text(g, 'THE FLOOD OF 2025 · THREE VERSIONS', 160, 300, `400 26px ${F.mono}`, COL.dim, 'left', a, false);
  text(g, who, 156, 450, `500 130px ${F.num}`, col, 'left', a * k); text(g, q, 160, 560 + 20 * (1 - k), `400 66px ${F.serif}`, COL.text, 'left', a * k, true); text(g, sub, 160, 630, `400 30px ${F.mono}`, COL.text, 'left', a * pr(t, t0 + .4, t0 + .9), false);
  text(g, 'as reported by Ahram Online, Sudan Tribune, The New Arab, Fanack · Sept–Oct 2025', W - 120, 52, `400 23px ${F.mono}`, COL.dim, 'right', a, false);
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
  CH = ch; C = timing[ch]; DUR = C.dur; S_.length = 0; LAYERS.length = 0;
  at = (id, f = 0) => { const L = C.lines.find(l => l.id === id); if (!L) throw new Error('no line ' + id); return L.t + L.d * f; };
  CHAPTERS[ch](); SHOTS = S_.slice();
  for (const S of SHOTS) if (S.keys) { const K = S.keys.map(([t, la, lo, d, tilt = 0]) => [t, [la, lo, Math.log10(d), tilt]]); const tr = track(K); S.cam = t => { const [la, lo, ld, tl] = tr(t); return makeCamera({ lat: la, lon: lo, d: Math.pow(10, ld), tilt: tl, fov: 32 }, W, H); }; }
  SUBS = C.lines.map((L, i) => ({ t0: L.t - .05, t1: Math.min((C.lines[i + 1]?.t ?? DUR) - .1, Math.max(L.t + 1.8, L.t + L.d + .5)), text: L.text }));
  EV = C.lines.map(L => ({ t: L.t, type: 'voice', id: L.id }));
  SHOTS.forEach(S => { if (S.amb) EV.push({ t: S.t0, type: 'amb', name: S.amb, dur: S.t1 - S.t0 }); });
  const R = (id, f, heavy = 0) => { EV.push({ t: at(id, f) + .2, type: 'reading', heavy }); if (heavy && ch) EV.push({ t: at(id, f) + .2, type: 'hit' }); };
  if (ch) SHOTS.forEach((S, i) => { if (i) EV.push({ t: S.t0 - .2, type: 'whoosh', k: i + ch, g: S.cut ? .55 : 1 }); });
  ({ 0: () => {   // the hook's cue list: a whoosh on every cut, a riser into the fill, hits where the numbers and the title land
       SHOTS.forEach((S, i) => { if (i) EV.push({ t: S.t0 - .25, type: 'whoosh', k: i }); });
       const f0 = at('c0a', .4), f1 = at('c0b') - .1, full = f0 - .25 + .75 * (f1 - f0 + .5);
       EV.push({ t: full - 2.2, type: 'riser', dur: 2.2 }, { t: full, type: 'hit', heavy: 1 }, { t: at('c0b', .36), type: 'hit' }, { t: at('c0d') + 1.0, type: 'hit' }, { t: at('c0d', .78), type: 'drone', dur: 2.4 }, { t: at('c0f', 1) + .25, type: 'hit', heavy: 1 }, { t: at('c0f', 1) + .4, type: 'title' }); },
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
  const xf = S => S && S.cut ? .1 : XF;   // a cut is three frames; a dissolve is half a second
  SHOTS.forEach((S, i) => { const xi = xf(S), xo = xf(SHOTS[i + 1]), fin = i === 0 ? 1 : pr(t, S.t0 - xi / 2, S.t0 + xi / 2), fout = i === SHOTS.length - 1 ? 1 : 1 - pr(t, S.t1 - xo / 2, S.t1 + xo / 2), a = Math.min(fin, fout); if (a > 0) out.push({ S, a }); });
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
  const top = layers.length ? cams[SHOTS.indexOf(layers[layers.length - 1].S)] : null;
  for (const L of LAYERS) { const a = win(t, L.t0, L.t1, .3); if (a <= 0) continue; g.save(); g.globalAlpha = a; VEIL = L.veil || -1; try { L.fn(g, t, L.t0, L.t1, top); } finally { VEIL = 0; } g.restore(); }
  const s = SUBS.find(x => t >= x.t0 && t < x.t1); if (s) G.subtitle(g, s.text, pr(t, s.t0, s.t0 + .15) * (1 - pr(t, s.t1 - .12, s.t1)));
}
export { SHOTS };
