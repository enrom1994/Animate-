// ?ch=N renders one chapter of the studio edit
import { makeGlobe } from './engine.js';
import { makeTerrain } from './terrain.js';
import * as F from './film.js';
const ch = +(new URLSearchParams(location.search).get('ch') ?? 1);
const load = s => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('missing ' + s)); i.src = s; });
await Promise.all(['500 40px "Barlow Condensed"', '300 40px "Barlow Condensed"', '400 40px Barlow', '600 40px Barlow', '400 40px "IBM Plex Mono"', '400 40px "IBM Plex Serif"'].map(f => document.fonts.load(f)));
const timing = await (await fetch('timing.json')).json();
const need = F.NEEDS[ch];
const [WD, WN, ED, EN] = await Promise.all(['world_day', 'world_night', 'egypt_day', 'egypt_night'].map(n => load(`assets/plates/${n}.jpg`)));
const imgs = { tWD: WD, tWN: WN, tED: ED, tEN: EN };
if (need.plates) { imgs.t1A = imgs.t1B = await load(`assets/plates/${need.plates[0]}.jpg`); }
const globe = makeGlobe(document.getElementById('gl'), imgs);
let terrain = null;
if (need.terrain) { const meta = (await (await fetch('assets/plates/dem.json')).json())[need.terrain]; terrain = makeTerrain(document.getElementById('ter'), { heightImg: await load(`assets/plates/dem_${need.terrain}.png`), texImg: await load(`assets/plates/${need.terrain}_terrain.jpg`), meta }); }
const photos = {}; for (const p of need.photos || []) photos[p] = await load(`assets/media/${p}.jpg`);
F.setSection(await (await fetch('assets/plates/section_qena.json')).json());
const gl = document.getElementById('gl'), ter = document.getElementById('ter'), ph = document.getElementById('ph'), ov = document.getElementById('ov');
const g = ph.getContext('2d'), o = ov.getContext('2d');
F.setup(timing, ch, o);
window.DUR = F.dur(); window.EV = F.events();
window.render = t => {
  const L = F.frame(t); let ga = 0, ta = 0; const cams = [];
  for (const { S, a } of L) {
    if (S.type === 'globe') { const { cam, st } = F.globeState(S, t); globe(cam, st); cams[F.SHOTS.indexOf(S)] = cam; ga = Math.max(ga, a); }
    if (S.type === 'terrain') { const u = G01(t, S); terrain.render(S.view(u)); ta = Math.max(ta, a); }
  }
  gl.style.opacity = ga; ter.style.opacity = ta;
  F.draw(g, t, photos, L.filter(x => x.S.type === 'photo' || x.S.type === 'graphic'));
  F.overlay(o, t, L, cams);
};
const G01 = (t, S) => Math.max(0, Math.min(1, (t - S.t0 + .25) / (S.t1 - S.t0 + .5)));
window.READY = true;
