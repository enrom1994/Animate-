// ?ch=N renders one chapter of the studio edit
import { makeGlobe } from './engine.js';
import { makeTerrain } from './terrain.js';
import * as F from './film.js';
const ch = +(new URLSearchParams(location.search).get('ch') ?? 1);
const load = s => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('missing ' + s)); i.src = s; });
const tryLoad = s => load(s).catch(() => null);
await Promise.all(['500 40px "Barlow Condensed"', '300 40px "Barlow Condensed"', '400 40px Barlow', '600 40px Barlow', '400 40px "IBM Plex Mono"', '400 40px "IBM Plex Serif"'].map(f => document.fonts.load(f)));
const timing = await (await fetch('timing.json')).json();
const need = F.NEEDS[ch];
const [WD, WN, ED, EN] = await Promise.all(['world_day', 'world_night', 'egypt_day', 'egypt_night'].map(n => load(`assets/plates/${n}.jpg`)));
const imgs = { tWD: WD, tWN: WN, tED: ED, tEN: EN };
const plate = n => n.endsWith('overlay') || n.endsWith('outline') ? `assets/plates/${n}.png` : `assets/plates/${n}.jpg`;
for (const [i, [A, B, O]] of need.slots.entries()) { imgs[`t${i + 1}A`] = await load(plate(A)); imgs[`t${i + 1}B`] = await load(plate(B)); if (O) imgs[`t${i + 1}O`] = await load(plate(O)); }
if (ch === 1 || ch === 2) { imgs.t1A = imgs.t1B = await load('assets/plates/qena.jpg'); }
const globe = makeGlobe(document.getElementById('gl'), imgs);
let terrain = null;
if (need.terrain) { const meta = (await (await fetch('assets/plates/dem.json')).json())[need.terrain]; terrain = makeTerrain(document.getElementById('ter'), { heightImg: await load(`assets/plates/dem_${need.terrain}.png`), texImg: await load(`assets/plates/${need.terrain}_terrain.jpg`), meta }); }
const IMG = {};
for (let p of need.photos) { const opt = p.endsWith('?'); p = p.replace('?', ''); const src = p.includes('/') ? `assets/${p}.jpg` : `assets/media/${p}.jpg`; const im = opt ? await tryLoad(src) : await load(src); if (im) IMG[p] = im; }
const sections = { qena: await (await fetch('assets/plates/section_qena.json')).json(), delta: await (await fetch('assets/plates/section_delta.json')).json() };
F.setAssets(IMG, sections);
const gl = document.getElementById('gl'), ter = document.getElementById('ter'), ph = document.getElementById('ph'), ov = document.getElementById('ov');
const g = ph.getContext('2d'), o = ov.getContext('2d');
F.setup(timing, ch, o);
window.DUR = F.dur(); window.EV = F.events();
const U = (t, S) => Math.max(0, Math.min(1, (t - S.t0 + .25) / (S.t1 - S.t0 + .5)));
window.render = t => {
  const L = F.frame(t); let ga = 0, ta = 0; const cams = [];
  for (const { S, a } of L) {
    if (S.type === 'globe') { const { cam, st } = F.globeState(S, t); globe(cam, st); cams[F.SHOTS.indexOf(S)] = cam; ga = Math.max(ga, a); }
    if (S.type === 'terrain') { terrain.render(S.view(U(t, S))); ta = Math.max(ta, a); }
  }
  gl.style.opacity = ga; ter.style.opacity = ta;
  F.draw(g, t, L.filter(x => x.S.type === 'photo' || x.S.type === 'graphic'));
  F.overlay(o, t, L, cams);
};
window.READY = true;
