// ?ch=N renders chapter N (0 cold open … 6 outro)
import { makeGlobe } from './engine.js';
import * as F from './film.js';
const ch = +(new URLSearchParams(location.search).get('ch') ?? 1);
const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('missing ' + src)); i.src = src; });
await Promise.all(['300 40px "Barlow Condensed"', '400 40px Barlow', '500 40px Barlow', '400 40px "IBM Plex Mono"', '400 40px "IBM Plex Serif"'].map(f => document.fonts.load(f)));
const timing = await (await fetch('timing.json')).json();
const imgs = {};
const base = await Promise.all(['world_day', 'world_night', 'egypt_day', 'egypt_night'].map(n => load(`assets/plates/${n}.jpg`)));
[imgs.tWD, imgs.tWN, imgs.tED, imgs.tEN] = base;
const src = n => n.endsWith('overlay') || n.endsWith('outline') ? `assets/plates/${n}.png` : `assets/plates/${n}.jpg`;
for (const [i, [a, b, o]] of F.CH_PLATES[ch].entries()) { imgs[`t${i + 1}A`] = await load(src(a)); imgs[`t${i + 1}B`] = await load(src(b)); if (o) imgs[`t${i + 1}O`] = await load(src(o)); }
const globe = makeGlobe(document.getElementById('gl'), imgs);
const g = document.getElementById('ov').getContext('2d');
F.setup(timing, ch, g);
const ph = {}; for (const p of (F.PHOTOS[ch] || [])) ph[p.img] = await load(`assets/photos/${p.img}.jpg`);
F.setPhotos(ph);
window.DUR = F.dur(); window.EV = F.events(ch); window.SUBS = F.SUBS;
window.render = t => { const cam = F.cameraAt(t); globe(cam, F.shaderState(t, ch)); F.overlay(g, t, cam, ch); };
window.READY = true;
