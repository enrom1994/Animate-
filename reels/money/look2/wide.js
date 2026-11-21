
// The establishing shot: the neighbourhood at night from high above, drawn in the same toon line as the close-ups, with the
// tilt-shift grammar (high oblique view, a sharp band across the middle, blur above and below, time-lapse traffic in steps).
// Everything is laid out in metres (scale.js) and projected: screen x = x*P, screen y = z*P*cos - height*P*sin.
import { INK, init, frame, push, pop, translate, scale, shape, fillOnly, stroke, ell, spline, rr, rect, dot, text } from './toon.js';
import { M } from './scale.js';
import { hash } from './lib.js';
let cv, g; export function setupWide(canvas) { cv = canvas; g = init(canvas); }
const buf = document.createElement('canvas'); buf.width = 1080; buf.height = 1920;
const C = { ground: '#2c3a33', road: '#3a3d48', roadL: '#4a4e5a', mark: '#d9d4b8', walk: '#6b7078', lot: '#454955', grass: '#2f4a38', roof: '#5b6170', roofS: '#4a4f5c',
  win: '#ffd98a', winOff: '#3a4258', store: '#c9543f', storeS: '#a9402e', glass: '#ffe7a8', sky: '#141b30' };
// the view: P px per metre, pitch, and a camera centre in metres
const view = { P: 9, pitch: .95, cx: 0, cz: 0 };
const SIN = () => Math.sin(view.pitch), COS = () => Math.cos(view.pitch);
const pj = (x, z, h = 0) => [540 + (x - view.cx) * view.P, 960 + ((z - view.cz) * COS() - h * SIN()) * view.P];
// a box building: footprint x0..x1, z0..z1 (z grows toward the camera), height h; the roof and the front face show
function building(x0, z0, x1, z1, h, wall, wallS, roof, { lit = .5, sign = null, seed = 1, door = false } = {}) {
  const f = [pj(x0, z1, 0), pj(x1, z1, 0), pj(x1, z1, h), pj(x0, z1, h)];
  shape(f, { fill: wall, lw: 4, shade: () => { fillOnly([pj(x1 - (x1 - x0) * .25, z1, 0), pj(x1, z1, 0), pj(x1, z1, h), pj(x1 - (x1 - x0) * .25, z1, h)], wallS, { boil: .3 });
    const floors = Math.max(1, Math.round(h / M.storey)), bays = Math.max(2, Math.round((x1 - x0) / 3));
    for (let fl = 0; fl < floors; fl++) for (let b = 0; b < bays; b++) { const wx = x0 + (b + .3) * (x1 - x0) / bays, ww = (x1 - x0) / bays * .4, wy = fl * M.storey + 1.0;
      const on = hash(seed * 31 + fl * 7 + b * 13) < lit; fillOnly([pj(wx, z1, wy), pj(wx + ww, z1, wy), pj(wx + ww, z1, wy + 1.2), pj(wx, z1, wy + 1.2)], on ? C.win : C.winOff, { boil: .2 }); } } });
  shape([pj(x0, z0, h), pj(x1, z0, h), pj(x1, z1, h), pj(x0, z1, h)], { fill: roof, lw: 4, shade: () => fillOnly([pj(x0, z0, h), pj(x1, z0, h), pj(x1, z0 + (z1 - z0) * .2, h), pj(x0, z0 + (z1 - z0) * .2, h)], C.roofS, { boil: .3 }) });
  if (sign) { const [sx, sy] = pj((x0 + x1) / 2, z1, h * .87); push(); text(sign, sx, sy, { font: `800 ${view.P * 1.6}px Cap`, fill: '#fff4d0', outlineW: 6, outlineCol: '#7a2418' }); pop(); }
}
// the shopfront, drawn in detail (it carries the close-up): big lit windows with shelves inside, glass doors, posters,
// a sign band with a lightning-bolt logo, bollards, an ice chest and two drinks machines. Real sizes from scale.js.
function storeFront(x0, x1, z, h) {
  const F = (x, y) => pj(x, z + .01, y);
  shape([F(x0, 3.4), F(x1, 3.4), F(x1, 4.5), F(x0, 4.5)], { fill: '#e8e2d0', lw: 4, shade: () => {   // the sign band
    fillOnly([F(x0 + .4, 3.55), F(x0 + 5.5, 3.55), F(x0 + 5.5, 4.35), F(x0 + .4, 4.35)], '#e9d38a', { boil: .3 });
    fillOnly([F(x0 + .9, 3.7), F(x0 + 2.6, 4.25), F(x0 + 2.3, 3.95), F(x0 + 4.6, 4.2), F(x0 + 2.9, 3.6), F(x0 + 3.2, 3.9)], '#d9533a', { boil: .3 }); } });
  fillOnly([F(x0, 0), F(x1, 0), F(x1, .6), F(x0, .6)], '#8a3a2e', { boil: .2 });   // a brick plinth under the windows
  const bays = [[x0 + .4, x0 + 4.4, 'win'], [x0 + 4.7, x0 + 8.7, 'win'], [x0 + 9.0, x0 + 11.0, 'door'], [x0 + 11.3, x0 + 15.3, 'counter'], [x0 + 15.6, x1 - .4, 'win']];
  for (const [a, b, k] of bays) {
    const top = k === 'door' ? M.door.h : k === 'counter' ? 2.45 : 3.1, bot = k === 'door' ? 0 : k === 'counter' ? .75 : .6;
    shape([F(a, bot), F(b, bot), F(b, top), F(a, top)], { fill: '#f6e2a8', lw: 4, shade: () => {
      if (k === 'counter') { maxInWindow(a, b, z, T_); fillOnly([F(a, top - .25), F(b, top - .25), F(b, top), F(a, top)], 'rgba(255,255,255,.35)', { boil: 0 }); return; }
      if (k === 'win') { for (let r = 0; r < 3; r++) { const y = 1.0 + r * .7; fillOnly([F(a, y), F(b, y), F(b, y + .06), F(a, y + .06)], '#8a7a62', { boil: .2 });
          for (let i = 0; i < 7; i++) { const xx = a + .2 + i * (b - a - .4) / 7; fillOnly([F(xx, y + .06), F(xx + .3, y + .06), F(xx + .3, y + .45), F(xx, y + .45)], ['#d9433a', '#4f8fd6', '#7ab55c', '#e8742e'][(i + r) % 4], { boil: .2 }); } }
        fillOnly([F(a + .3, 2.3), F(a + 1.5, 2.3), F(a + 1.5, 3.0), F(a + .3, 3.0)], ['#ffffff', '#e9d38a'][Math.round(a) % 2], { boil: .3 }); }   // a poster in the glass
      else { stroke([F((a + b) / 2, 0), F((a + b) / 2, top)], 4); fillOnly([F(a + .15, 1.0), F(a + .3, 1.0), F(a + .3, 1.1), F(a + .15, 1.1)], '#c9ccd4', { boil: .2 }); }
      fillOnly([F(a, top - .25), F(b, top - .25), F(b, top), F(a, top)], 'rgba(255,255,255,.35)', { boil: 0 }); } });
  }
  // two drinks machines against the right end, an ice chest under the left window, bollards along the kerb
  for (const xx of [x1 + .3, x1 + 1.4]) { shape([F(xx, 0), F(xx + 1.0, 0), F(xx + 1.0, 1.85), F(xx, 1.85)], { fill: '#2f5fa8', lw: 4, shade: () => fillOnly([F(xx + .12, .9), F(xx + .88, .9), F(xx + .88, 1.7), F(xx + .12, 1.7)], '#cfe6f2', { boil: .2 }) }); }
  shape([pj(x0 + 1, z + 1.2, 0), pj(x0 + 3.2, z + 1.2, 0), pj(x0 + 3.2, z + 1.2, .9), pj(x0 + 1, z + 1.2, .9)], { fill: '#e8e2d0', lw: 4, shade: () => fillOnly([pj(x0 + 1, z + 1.2, .45), pj(x0 + 3.2, z + 1.2, .45), pj(x0 + 3.2, z + 1.2, .6), pj(x0 + 1, z + 1.2, .6)], '#4f8fd6', { boil: .2 }) });
  for (let i = 0; i < 6; i++) { const xx = x0 + 4 + i * 3; shape([pj(xx, z + 3, 0), pj(xx + .25, z + 3, 0), pj(xx + .25, z + 3, 1), pj(xx, z + 3, 1)], { fill: '#e9c23a', lw: 3 }); }
}
// the store's name on a sign wall that stands above the roofline (drawn after the roof, so the roof can never cover it)
function storeSign(x0, x1, z, h) {
  const F = (x, y) => pj(x, z + .02, y), a = x0 + 3, b = x1 - 3, y0 = h - .2, y1 = h + 2.0;
  shape([F(a - .3, y0), F(b + .3, y0), F(b + .3, y1 + .25), F(a - .3, y1 + .25)], { fill: '#3a2a28', lw: 4 });
  shape([F(a, y0 + .15), F(b, y0 + .15), F(b, y1), F(a, y1)], { fill: '#f4e7c4', lw: 4, shade: () => {
    fillOnly([F(a + .4, y0 + .4), F(a + 1.6, y1 - .3), F(a + 1.4, y0 + 1.0), F(a + 2.6, y1 - .4), F(a + 1.7, y0 + .3), F(a + 1.9, y0 + .8)], '#d9533a', { boil: .3 }); } });
  const [sx, sy] = F((a + b) / 2 + 1.2, (y0 + y1) / 2 + .05); text('QUICK STOP', sx, sy, { font: `800 ${view.P * 1.25}px Cap`, fill: '#c8433a', outlineW: Math.max(3, view.P * .1), outlineCol: '#3a1810' });
  for (let i = 0; i < 9; i++) { const [lx, ly] = F(a + .5 + i * (b - a - 1) / 8, y1 + .12); dot(lx, ly, view.P * .07, '#ffe9a8'); }   // bulbs along the top
}
// Max behind the counter, seen through the glass: the counter (0.95 m), Max standing behind it (1.75 m), shelves behind him
function maxInWindow(a, b, z, t) {
  const F = (x, y) => pj(x, z - .02, y), cx = (a + b) / 2;
  fillOnly([F(a, .6), F(b, .6), F(b, 3.1), F(a, 3.1)], '#e9dcb0', { boil: .2 });
  fillOnly([F(a, 1.75), F(b, 1.75), F(b, 1.8), F(a, 1.8)], '#8a7a62', { boil: .2 });                       // the lit room behind the glass
  for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const xx = a + .2 + i * (b - a - .4) / 6; fillOnly([F(xx, 1.8 + r * .32), F(xx + .4, 1.8 + r * .32), F(xx + .4, 2.05 + r * .32), F(xx, 2.05 + r * .32)], ['#d9433a', '#4f8fd6', '#7ab55c', '#e8742e'][(i + r) % 4], { boil: .2 }); }
  const P = view.P * 1.25, [hx, hy] = F(cx, 1.42), lean = .02 * Math.sin(t * 1.3);
  // torso: grey tee, hi-vis vest with silver strips
  shape([F(cx - .38, .95), F(cx - .34, 1.27), F(cx + .34, 1.27), F(cx + .38, .95)], { fill: '#f08a24', lw: 3, shade: () => { fillOnly([F(cx - .06, .95), F(cx + .06, .95), F(cx + .06, 1.25), F(cx - .06, 1.25)], '#7d8086', { boil: .2 }); fillOnly([F(cx - .3, 1.05), F(cx + .3, 1.05), F(cx + .3, 1.1), F(cx - .3, 1.1)], '#dfe4e6', { boil: .2 }); } });
  // the big round head with the orange cap, tired eyes
  shape(ell(hx, hy, P * .27, P * .26, 30), { fill: '#e9b98f', lw: 3 });
  shape([[hx - P * .27, hy - P * .02], [hx - P * .22, hy - P * .2], [hx, hy - P * .28], [hx + P * .22, hy - P * .2], [hx + P * .27, hy - P * .02]], { fill: '#e8742e', lw: 3 });
  shape([[hx - P * .2, hy - P * .04], [hx + P * .38, hy - P * .06], [hx + P * .36, hy + P * .0], [hx - P * .2, hy + P * .0]], { fill: '#c45a1c', lw: 3 });
  for (const s of [-1, 1]) { shape(ell(hx + s * P * .09, hy + P * .06, P * .07, P * .075, 14), { fill: '#fff', lw: 2.5 }); dot(hx + s * P * .09 + P * .01, hy + P * .09, P * .018); stroke([[hx + s * P * .15, hy + P * .02], [hx + s * P * .03, hy + P * .0]], 3); }
  stroke([[hx - P * .06, hy + P * .18], [hx + P * .06, hy + P * .18]], 2.5);
  fillOnly([F(a - .1, .6), F(b + .1, .6), F(b + .1, .97), F(a - .1, .97)], '#b8a586', { boil: .2 }); stroke([F(a - .1, .97), F(b + .1, .97)], 3);   // the counter top in front of him
}
// roof clutter: AC units on flat roofs
const acUnit = (x, z, h) => { shape([pj(x, z, h + .9), pj(x + 1.4, z, h + .9), pj(x + 1.4, z + 1.2, h + .9), pj(x, z + 1.2, h + .9)], { fill: '#9aa3ad', lw: 3 }); shape([pj(x, z + 1.2, h), pj(x + 1.4, z + 1.2, h), pj(x + 1.4, z + 1.2, h + .9), pj(x, z + 1.2, h + .9)], { fill: '#7a838d', lw: 3 }); const [a, b] = pj(x + .7, z + .6, h + .9); dot(a, b, view.P * .35, '#4a525c'); };
// a car, real size (4.3 x 1.8 x 1.5 m), drawn from above at an angle along x or z, headlights on
function car(x, z, dir, col, t, lights = true) { const L = M.car.l, Wd = M.car.w, H = M.car.h, along = dir === 'x' || dir === '-x';
  const hx = along ? L / 2 : Wd / 2, hz = along ? Wd / 2 : L / 2;
  shape([pj(x - hx, z - hz, .4), pj(x + hx, z - hz, .4), pj(x + hx, z + hz, .4), pj(x - hx, z + hz, .4)], { fill: col, lw: 3 });                // body
  shape([pj(x - hx, z + hz, 0), pj(x + hx, z + hz, 0), pj(x + hx, z + hz, .9), pj(x - hx, z + hz, .9)], { fill: col, lw: 3, shade: () => fillOnly([pj(x - hx, z + hz, 0), pj(x + hx, z + hz, 0), pj(x + hx, z + hz, .35), pj(x - hx, z + hz, .35)], 'rgba(0,0,0,.35)', { boil: 0 }) });
  const cx = along ? L * .18 : Wd * .4, cz = along ? Wd * .4 : L * .18;   // the cabin and its glass
  shape([pj(x - cx, z - cz, H), pj(x + cx, z - cz, H), pj(x + cx, z + cz, H), pj(x - cx, z + cz, H)], { fill: '#aac0d0', lw: 3 });
  // headlight beams on the road ahead
  const s = dir === 'x' ? 1 : dir === '-x' ? -1 : dir === 'z' ? 1 : -1;
  if (!lights) return;
  if (along) fillOnly([pj(x + s * hx, z - .6, 0), pj(x + s * (hx + 9), z - 2.2, 0), pj(x + s * (hx + 9), z + 2.2, 0), pj(x + s * hx, z + .6, 0)], 'rgba(255,240,190,.22)', { boil: 0 });
  else fillOnly([pj(x - .6, z + s * hz, 0), pj(x - 2.2, z + s * (hz + 9), 0), pj(x + 2.2, z + s * (hz + 9), 0), pj(x + .6, z + s * hz, 0)], 'rgba(255,240,190,.22)', { boil: 0 });
}
const streetLight = (x, z) => { const [a, b] = pj(x, z, 0), [c, d] = pj(x, z, M.streetlight); fillOnly(ell(a, b, view.P * 5, view.P * 5 * COS(), 24), 'rgba(255,225,150,.16)', { boil: 0 }); stroke([[a, b], [c, d]], 3); dot(c, d, view.P * .45, '#ffe9a8'); };
// ---- the town: a street grid; blocks filled with buildings, yards and trees; the store on its corner lot ----
const ZS = [-90, -45, 0, 45, 90, 135], XS = [-100, -40, 34, 92];   // street centre lines (8 m roads, 1.5 m pavements)
const RW = 4, PW = 5.5;
const BLD = [];   // [x0, z0, x1, z1, h, wall, kind]
let seedN = 3; const rnd = () => (seedN = (seedN * 16807) % 2147483647) / 2147483647;
for (let bi = 0; bi < XS.length - 1; bi++) for (let bj = 0; bj < ZS.length - 1; bj++) {
  const x0 = XS[bi] + PW + 1, x1 = XS[bi + 1] - PW - 1, z0 = ZS[bj] + PW + 1, z1 = ZS[bj + 1] - PW - 1;
  if (x0 < 20 && x1 > -14 && z0 < 30 && z1 > 8) continue;   // the store's block is laid out by hand
  // a row of buildings along the front of the block, another along the back, yards between
  for (const [za, zb] of [[z1 - 13, z1], [z0, z0 + 12]]) { let x = x0; while (x < x1 - 6) { const w = 8 + rnd() * 10, x2 = Math.min(x1, x + w), h = M.storey * (1 + Math.floor(rnd() * 3)); BLD.push([x, za, x2, zb, h, ['#8a7262', '#94786a', '#6f7684', '#80665c', '#7a7f6a'][Math.floor(rnd() * 5)], 'house', ['#5b6170', '#6e4a42', '#4f5a4c', '#5a4e62', '#6a6a6a'][Math.floor(rnd() * 5)], rnd() < .55]); x = x2 + 1.5 + rnd() * 3; } }
}
BLD.push([-8, 14, 14, 27, 4.5, C.store, 'store']); BLD.push([-30, 10, -17, 22, 6, '#7a7f6a', 'house', '#4f5a4c', true]); BLD.push([18, 10, 28, 24, 3, '#6f7684', 'house', '#5b6170', false]);
BLD.sort((a, b) => a[3] - b[3]);   // far rows first, so nearer fronts overlap them
const TREES = Array.from({ length: 60 }, (_, i) => [XS[0] + hash(i * 3.1) * (XS[3] - XS[0]), ZS[0] + hash(i * 7.3) * (ZS[5] - ZS[0])]).filter(([x, z]) => !ZS.some(zz => Math.abs(z - zz) < PW + 1) && !XS.some(xx => Math.abs(x - xx) < PW + 1) && !BLD.some(b => x > b[0] - 2 && x < b[2] + 2 && z > b[1] - 2 && z < b[3] + 2) && !(x > -14 && x < 22 && z > 2 && z < 32));
const LANES = [...ZS.flatMap(z => [{ z: z - 2, dir: 'x', v: 11 }, { z: z + 2, dir: '-x', v: 9 }]), ...XS.flatMap(x => [{ x: x + 2, dir: 'z', v: 10 }, { x: x - 2, dir: '-z', v: 8 }])];
const CARS2 = Array.from({ length: 110 }, (_, i) => ({ lane: LANES[i % LANES.length], off: hash(i * 5.3) * 240, col: ['#c8433a', '#e8e2d0', '#4f7fc4', '#2d2a33', '#d9a83a', '#6f8a7a'][i % 6] }));
let T_ = 0;
export function drawWide(t, cam = null, { tilt = true } = {}) { T_ = t;
  frame(t); const ts = Math.floor(t * 8) / 8;   // the time-lapse step
  view.pitch = .78; view.P = 12.5 - t * .25; view.cx = 2 + t * .7; view.cz = 14 - t * .4; if (cam) Object.assign(view, cam);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = C.sky; g.fillRect(0, 0, 1080, 1920);
  fillOnly([pj(-300, -300), pj(300, -300), pj(300, 300), pj(-300, 300)], C.grass, { boil: 0 });
  for (const z of ZS) { fillOnly([pj(-300, z - PW), pj(300, z - PW), pj(300, z + PW), pj(-300, z + PW)], C.walk, { boil: 0 }); }
  for (const x of XS) { fillOnly([pj(x - PW, -300), pj(x + PW, -300), pj(x + PW, 300), pj(x - PW, 300)], C.walk, { boil: 0 }); }
  for (const z of ZS) { fillOnly([pj(-300, z - RW), pj(300, z - RW), pj(300, z + RW), pj(-300, z + RW)], C.road, { boil: 0 }); for (let x = -300; x < 300; x += 6) fillOnly([pj(x, z - .15), pj(x + 3, z - .15), pj(x + 3, z + .15), pj(x, z + .15)], C.mark, { boil: 0 }); }
  for (const x of XS) { fillOnly([pj(x - RW, -300), pj(x + RW, -300), pj(x + RW, 300), pj(x - RW, 300)], C.road, { boil: 0 }); for (let z = -300; z < 300; z += 6) if (!ZS.some(zz => Math.abs(z - zz) < 6)) fillOnly([pj(x - .15, z), pj(x + .15, z), pj(x + .15, z + 3), pj(x - .15, z + 3)], C.mark, { boil: 0 }); }
  for (const x of XS) for (const z of ZS) for (let i = 0; i < 5; i++) fillOnly([pj(x - RW + .4 + i * 1.6, z + PW), pj(x - RW + 1.2 + i * 1.6, z + PW), pj(x - RW + 1.2 + i * 1.6, z + PW + 3), pj(x - RW + .4 + i * 1.6, z + PW + 3)], C.mark, { boil: 0 });   // crossings
  // the store's lot and its bays, and the light spilling from its windows
  fillOnly([pj(-14, 26.5), pj(22, 26.5), pj(22, 39), pj(-14, 39)], C.lot, { boil: 0 });
  for (let i = 0; i <= 12; i++) stroke([pj(-13 + i * M.parking.w, 33.5), pj(-13 + i * M.parking.w, 33.5 + M.parking.l)], 2, { line: '#d9d4b8' });
  fillOnly([pj(-7, 27.2, 0), pj(13, 27.2, 0), pj(15, 32, 0), pj(-9, 32, 0)], 'rgba(255,230,160,.2)', { boil: 0 });
  // trees and streetlights behind everything that stands
  for (const [x, z] of TREES) { if (z > (view.near ?? 1e9)) continue; const [a, b] = pj(x, z, 4); shape(ell(a, b, view.P * 2.4, view.P * 2.0, 20), { fill: '#24402e', lw: 3 }); }
  for (const x of XS) for (const z of ZS) { streetLight(x + PW, z + PW); }
  // buildings, far to near; the cars on a street drawn just after the row in front of it, so nearer buildings cover them
  let ci = 0; const streets = [...ZS].sort((a, b) => a - b);
  const drawCarsOn = z => { if (z > (view.near ?? 1e9)) return; for (const c of CARS2) { const L = c.lane; if (L.z == null || Math.abs(L.z - z) > 3) continue; const d = ((ts * L.v + c.off) % 240) - 120; car(L.dir === 'x' ? view.cx + d : view.cx - d, L.z, L.dir, c.col, t); } };
  let si = 0;
  const near = view.near ?? 1e9;   // the camera's own position: buildings behind it are not in the picture
  for (const b of BLD) { if (b[1] > near) continue; while (si < streets.length && streets[si] + PW < b[1]) drawCarsOn(streets[si++]);
    if (b[6] === 'store') { building(b[0], b[1], b[2], b[3], b[4], C.store, C.storeS, C.roof, { lit: 1, seed: 4 }); storeFront(b[0], b[2], b[3], b[4]); storeSign(b[0], b[2], b[3], b[4]); for (const [x, z] of [[-5, 16], [0, 18], [6, 16], [10, 20]]) acUnit(x, z, 4.5); }
    else { building(b[0], b[1], b[2], b[3], b[4], b[5], '#5a4f46', b[7], { lit: .45, seed: Math.round(b[0] * 7 + b[1]) }); if (b[8]) { const zm = (b[1] + b[3]) / 2; stroke([pj(b[0] + .5, zm, b[4]), pj(b[2] - .5, zm, b[4])], 4); for (let x = b[0] + 2; x < b[2] - 1; x += 2.2) stroke([pj(x, b[1] + .5, b[4]), pj(x, zm - .4, b[4])], 2, { line: 'rgba(0,0,0,.25)' }); } else acUnit(b[0] + 1.5, b[1] + 2, b[4]); } }
  while (si < streets.length) drawCarsOn(streets[si++]);
  // parked cars in the store's bays (real size), and the cross-street traffic on top
  for (const [i, col] of [[1, '#c8433a'], [3, '#3f5f8a'], [4, '#e8e2d0'], [8, '#2d2a33'], [10, '#6f8a7a']]) car(-13 + (i + .5) * M.parking.w, 33.5 + M.parking.l / 2, 'z', col, t, false);   // parked: lights off
  for (const c of CARS2) { const L = c.lane; if (L.x == null) continue; const d = ((ts * L.v + c.off) % 240) - 120, zz = L.dir === 'z' ? view.cz + d : view.cz - d; if (zz > (view.near ?? 1e9)) continue; car(L.x, zz, L.dir, c.col, t); }
  if (!tilt) return;
  // tilt-shift: keep the middle band sharp, blur above and below, saturate a little
  buf.getContext('2d').drawImage(cv, 0, 0);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const bandC = 900, band = 300;
  for (const [y0, y1, bl] of [[0, bandC - band - 260, 9], [bandC - band - 260, bandC - band, 4], [bandC + band, bandC + band + 260, 4], [bandC + band + 260, 1920, 9]]) {
    g.save(); g.beginPath(); g.rect(0, y0, 1080, y1 - y0); g.clip(); g.filter = `blur(${bl}px) saturate(1.15)`; g.drawImage(buf, 0, 0); g.restore(); }
  g.filter = 'none';
}
