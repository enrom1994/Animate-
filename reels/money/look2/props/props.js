// The prop library: everyday objects as small 3D models in real metres, generic designs (no brands, no copied products).
// Each export returns { faces, size: [length x, height y, depth z], name }. Front of a prop faces +z unless it says otherwise.
import { box, extrude, cyl, panel, panelX, proj } from './mesh.js';
import { getM, setM, shape, fillOnly, stroke, text } from '../toon.js';
const poly = (pts, col, n, o = {}) => ({ pts, col, n, part: -3, bias: .015, ...o });
const GLASS = '#9fbccc', TYRE = '#26242a', RIM = '#c9ccd4', TRIM = '#2d2b30', CHROME = '#d0d3d8';
// ---- vehicles ----
// a five-door hatchback, 4.3 x 1.5 x 1.8 m, nose toward +x
export function car(paint = '#3f5f8a') {
  const prof = [[-2.15, .3], [2.15, .3], [2.18, .55], [2.1, .82], [1.0, .97], [.35, 1.45], [-1.05, 1.48], [-1.85, 1.05], [-2.15, .9], [-2.2, .55]];
  const f = [...extrude(prof, -.86, .86, paint, i => i === 4 || i === 6 ? GLASS : null)];
  for (const s of [1, -1]) { const z = s * .865;   // the glasshouse on each side, split by the pillar, and the door seams
    f.push(poly([[.92, 1.0, z], [.38, 1.4, z], [-.15, 1.42, z], [-.15, 1.0, z]], GLASS, [0, 0, s]), poly([[-.25, 1.0, z], [-.25, 1.42, z], [-1.0, 1.43, z], [-1.7, 1.05, z]], GLASS, [0, 0, s]));
    f.push(poly([[-.2, .38, z], [-.18, .38, z], [-.18, 1.0, z], [-.2, 1.0, z]], TRIM, [0, 0, s], { lw: 1.5 }), poly([[.95, .38, z], [.97, .38, z], [.97, .98, z], [.95, .98, z]], TRIM, [0, 0, s], { lw: 1.5 }));
    f.push(poly([[.3, .78, z], [.5, .78, z], [.5, .82, z], [.3, .82, z]], TRIM, [0, 0, s], { lw: 1.5 }), poly([[-.75, .78, z], [-.55, .78, z], [-.55, .82, z], [-.75, .82, z]], TRIM, [0, 0, s], { lw: 1.5 }));
    f.push(poly([[2.15, .3, z], [2.18, .52, z], [1.55, .52, z], [1.55, .3, z]], TRIM, [0, 0, s]), poly([[-1.55, .3, z], [-1.55, .52, z], [-2.2, .52, z], [-2.15, .3, z]], TRIM, [0, 0, s]));   // bumper corners
    for (const x of [1.38, -1.38]) { f.push(...cyl('z', [x, .33, 0], .33, s * .76, s * .97, TYRE, 14)); f.push(...cyl('z', [x, .33, 0], .19, s * .975, s * .985, RIM, 10)); }
    f.push(poly([[2.12, .66, s * .45], [2.12, .66, s * .78], [2.07, .8, s * .78], [2.07, .8, s * .45]], '#fff4d0', [1, 0, 0], { glow: true }));            // headlight
    f.push(poly([[-2.16, .7, s * .5], [-2.16, .7, s * .8], [-2.12, .86, s * .8], [-2.12, .86, s * .5]], '#c42a24', [-1, 0, 0], { glow: true }));          // tail light
    f.push(...box(.55, 1.0, s * .86, .72, 1.1, s * (.86 + .12), paint));   // mirror
  }
  f.push(poly([[2.19, .42, -.6], [2.19, .42, .6], [2.19, .54, .6], [2.19, .54, -.6]], TRIM, [1, 0, 0]), poly([[2.11, .62, -.4], [2.11, .62, .4], [2.11, .72, .4], [2.11, .72, -.4]], '#1d1b1f', [1, 0, 0]));   // grille, lower intake
  f.push(poly([[-2.21, .4, .7], [-2.21, .4, -.7], [-2.21, .52, -.7], [-2.21, .52, .7]], TRIM, [-1, 0, 0]));
  return { faces: f, size: [4.3, 1.5, 1.8], name: 'car (hatchback)' };
}
// ---- shop ----
export function counter(len = 2.4) {   // a shop counter: front panel faces +z, a till on top
  const f = [...box(-len / 2, 0, -.3, len / 2, .9, .3, { all: '#9c8a6a', front: '#8a7a5c' }), ...box(-len / 2 - .05, .9, -.34, len / 2 + .05, .95, .34, '#d8c7a8')];
  f.push(panel(-len / 2 + .1, .1, len / 2 - .1, .8, .301, '#7d6e56'), ...box(.5, .95, -.2, .9, 1.05, .15, '#3a3840'), ...box(.55, 1.05, -.12, .85, 1.25, -.08, '#2d2b30'), panel(.58, 1.08, .82, 1.22, -.079, '#9fd6b8', { glow: true }));
  return { faces: f, size: [len, .95, .6], name: 'counter + till' };
}
export function shelf(prods = ['#d9433a', '#f2c14e', '#4f8fd6', '#7ab55c', '#e8742e', '#b45fc4']) {   // a shop shelving unit, 1.0 x 1.8 x 0.5
  const f = [...box(-.5, 0, -.25, .5, .12, .25, '#6b5a4a'), ...box(-.5, 0, -.25, -.46, 1.8, .25, '#8a8f99'), ...box(.46, 0, -.25, .5, 1.8, .25, '#8a8f99'), ...box(-.5, .12, -.25, .5, 1.8, -.2, '#b9bcc4')];
  for (let r = 0; r < 4; r++) { const y = .12 + r * .42; f.push(...box(-.46, y, -.2, .46, y + .03, .25, '#c9ccd4'));
    for (let i = 0; i < 5; i++) { const x = -.42 + i * .17, h = .22 + ((i * 7 + r * 3) % 5) * .03; f.push(...box(x, y + .03, -.12, x + .14, y + .03 + h, .2, prods[(i + r * 2) % prods.length])); } }
  return { faces: f, size: [1.0, 1.8, .5], name: 'shop shelving' };
}
export function pylon(col = '#c8433a') {   // a roadside price sign on a pole: 2.4 x 4.2 m
  const f = [...box(-.1, 0, -.1, .1, 3.0, .1, '#5a5f66'), ...box(-1.2, 3.0, -.15, 1.2, 4.2, .15, '#2d2a33')];
  f.push(panel(-1.12, 3.08, 1.12, 4.12, .151, '#f4e7c4'), panel(-1.0, 3.75, 1.0, 4.02, .152, col), panel(-1.0, 3.18, 1.0, 3.62, .152, '#1d1b1f'));
  return { faces: f, size: [2.4, 4.2, .3], name: 'pylon sign' };
}
// ---- home ----
export function tv() {   // a 55-inch TV (1.22 x 0.7 m) on a low cabinet
  const f = [...box(-.8, 0, -.22, .8, .45, .22, { all: '#6b4f3a', front: '#5a4230' }), panel(-.75, .06, -.02, .4, .221, '#5a4230'), panel(.02, .06, .75, .4, .221, '#5a4230')];
  f.push(...box(-.2, .45, -.1, .2, .48, .1, '#2d2b30'), ...box(-.03, .48, -.04, .03, .58, .0, '#2d2b30'), ...box(-.61, .58, -.03, .61, 1.28, .02, '#1d1b1f'), panel(-.58, .61, .58, 1.25, .021, '#5b86a8', { glow: true }));
  return { faces: f, size: [1.6, 1.28, .44], name: 'TV (55 in) + cabinet' };
}
export function sofa(col = '#5a7f8a') {   // a three-seat sofa, 2.0 x 0.85 x 0.9
  const f = [...box(-1, .1, -.45, 1, .45, .45, col), ...box(-1, .45, -.45, 1, .85, -.2, col), ...box(-1, .1, -.45, -.82, .65, .45, col), ...box(.82, .1, -.45, 1, .65, .45, col)];
  for (let i = 0; i < 3; i++) f.push(...box(-.8 + i * .54, .45, -.2, -.28 + i * .54, .55, .43, col));
  for (const x of [-.95, .95]) for (const z of [-.4, .4]) f.push(...box(x - .03, 0, z - .03, x + .03, .1, z + .03, '#2d2b30'));
  return { faces: f, size: [2.0, .85, .9], name: 'sofa' };
}
export function table() {   // a dining table 1.2 x 0.75 x 0.8, and one chair
  const f = [...box(-.6, .71, -.4, .6, .75, .4, '#9a6a3f')];
  for (const x of [-.55, .51]) for (const z of [-.35, .31]) f.push(...box(x, 0, z, x + .04, .71, z + .04, '#7a5030'));
  const cx = 0, cz = .75; f.push(...box(cx - .22, .44, cz - .2, cx + .22, .48, cz + .2, '#9a6a3f'), ...box(cx - .22, .48, cz + .16, cx + .22, .95, cz + .2, '#9a6a3f'));
  for (const x of [-.2, .17]) for (const z of [-.18, .15]) f.push(...box(cx + x, 0, cz + z, cx + x + .03, .44, cz + z + .03, '#7a5030'));
  return { faces: f, size: [1.2, .95, 1.6], name: 'table + chair' };
}
export function fridge() {   // a fridge-freezer 0.7 x 1.8 x 0.7
  const f = [...box(-.35, 0, -.35, .35, 1.8, .35, '#e9e6de'), panel(-.33, .02, .33, 1.18, .351, '#e2ded4'), panel(-.33, 1.2, .33, 1.78, .351, '#e2ded4')];
  f.push(...box(.24, .7, .35, .27, 1.1, .38, CHROME), ...box(.24, 1.3, .35, .27, 1.55, .38, CHROME));
  return { faces: f, size: [.7, 1.8, .7], name: 'fridge' };
}
export function door() {   // a front door in its frame: 0.9 x 2.05 m opening
  const f = [...box(-.55, 0, -.05, -.45, 2.15, .05, '#efe6d2'), ...box(.45, 0, -.05, .55, 2.15, .05, '#efe6d2'), ...box(-.55, 2.05, -.05, .55, 2.15, .05, '#efe6d2'), ...box(-.45, 0, -.03, .45, 2.05, .02, '#2f6f73')];
  f.push(panel(-.35, 1.15, .35, 1.9, .021, '#2a6266'), panel(-.35, .15, .35, 1.0, .021, '#2a6266'), ...box(.3, .98, .02, .36, 1.04, .07, '#d9a83a'));
  return { faces: f, size: [1.1, 2.15, .1], name: 'front door' };
}
export function phone() {   // a smartphone 0.072 x 0.15 x 0.008, standing
  const f = [...box(-.036, 0, -.004, .036, .15, .004, '#26242a'), panel(-.032, .005, .032, .145, .0041, '#3f6f8a', { glow: true })];
  return { faces: f, size: [.072, .15, .008], name: 'phone' };
}

// a sports coupe, 4.5 x 1.3 x 1.9 m, nose toward +x: low, gold rims, a rear wing (the spender's car)
export function coupe(paint = '#c8302a') {
  const prof = [[-2.25, .28], [2.25, .28], [2.3, .5], [2.2, .66], [.9, .84], [.05, 1.27], [-1.0, 1.3], [-1.9, .95], [-2.25, .88], [-2.3, .5]];
  const f = [...extrude(prof, -.93, .93, paint, i => i === 4 || i === 6 ? GLASS : null)];
  for (const s of [1, -1]) { const z = s * .935;
    f.push(poly([[.8, .88], [.08, 1.23], [-.95, 1.26], [-1.55, .92]].map(([x, y]) => [x, y, z]), GLASS, [0, 0, s]));
    f.push(poly([[.05, .36, z], [.07, .36, z], [.07, .86, z], [.05, .86, z]], TRIM, [0, 0, s], { lw: 1.5 }), poly([[-.4, .7, z], [-.2, .7, z], [-.2, .73, z], [-.4, .73, z]], TRIM, [0, 0, s], { lw: 1.5 }));
    f.push(poly([[1.0, .3, z], [1.9, .3, z], [1.9, .38, z], [1.0, .38, z]], '#1d1b1f', [0, 0, s]));   // side skirt
    for (const x of [1.45, -1.45]) { f.push(...cyl('z', [x, .34, 0], .34, s * .8, s * 1.0, TYRE, 14)); f.push(...cyl('z', [x, .34, 0], .25, s * 1.005, s * 1.015, '#e3b23c', 12)); }
    f.push(poly([[2.24, .55, s * .5], [2.24, .55, s * .82], [2.18, .64, s * .82], [2.18, .64, s * .5]], '#fff4d0', [1, 0, 0], { glow: true }));
    f.push(poly([[-2.27, .7, s * .35], [-2.27, .7, s * .85], [-2.24, .8, s * .85], [-2.24, .8, s * .35]], '#c42a24', [-1, 0, 0], { glow: true }));
    f.push(...box(-2.05, .93, s * .55, -1.98, 1.06, s * .62, TRIM));   // wing posts
    f.push(...box(.4, .86, s * .93, .55, .95, s * 1.03, paint)); }
  f.push(...box(-2.25, 1.06, -.88, -1.85, 1.1, .88, '#1d1b1f'));   // the wing
  f.push(poly([[2.31, .32, -.7], [2.31, .32, .7], [2.31, .46, .7], [2.31, .46, -.7]], '#1d1b1f', [1, 0, 0]));
  return { faces: f, size: [4.6, 1.3, 1.9], name: 'sports coupe' };
}
// ---- houses ----
// a house, front toward +z: w wide, d deep, storeys of 2.8 m, a gabled roof with the ridge along x, lit windows, a porch;
// garage: a garage door on the right. Windows and doors are real size (door 0.9 x 2.05, windows 1.2 x 1.3)
let HP = 90000; const part = faces => { const id = HP++; faces.forEach(q => q.part = id); return faces; };
export function house({ w = 10, d = 9, storeys = 1, wall = '#c9b79a', roof = '#6e4a42', trim = '#efe6d2', door = '#2f6f73', garage = false, lit = [1, 0, 1, 1, 0, 1] } = {}) {
  const h = storeys * 2.8, rh = 2.4, o = .45, f = [...box(-w / 2, 0, -d / 2, w / 2, h, d / 2, { all: wall, front: wall })];
  const Z = d / 2 + o, R = [[-w / 2 - o, h, Z], [w / 2 + o, h, Z], [w / 2 + o, h + rh, 0], [-w / 2 - o, h + rh, 0]];
  f.push(...part([{ pts: R, col: roof }, { pts: [[w / 2 + o, h, -Z], [-w / 2 - o, h, -Z], [-w / 2 - o, h + rh, 0], [w / 2 + o, h + rh, 0]], col: roof },
    { pts: [[w / 2, h, Z - o], [w / 2, h, -Z + o], [w / 2, h + rh * (1 - o / Z), 0]], col: wall }, { pts: [[-w / 2, h, -Z + o], [-w / 2, h, Z - o], [-w / 2, h + rh * (1 - o / Z), 0]], col: wall }]));
  f.push(...box(-w / 2 - o, h - .12, Z - .08, w / 2 + o, h, Z, trim));   // fascia board
  const fz = d / 2 + .001, win = (x, y, on) => { f.push(panel(x - .66, y - .06, x + .66, y + 1.36, fz, trim), panel(x - .6, y, x + .6, y + 1.3, fz + .002, on ? '#ffd98a' : '#3a4258', { glow: on })); f.push(panel(x - .02, y, x + .02, y + 1.3, fz + .004, trim, { lw: 1.5 })); };
  const gw = garage ? 3.0 : 0, dx = garage ? -w / 2 + 2.2 : -.0;
  let li = 0; for (let st = 0; st < storeys; st++) { const y = st * 2.8 + .95;
    for (const x of (st === 0 ? (garage ? [-w / 2 + 4.4, -w / 2 + 6.2].filter(x => x < w / 2 - gw - .6) : [-w / 2 + 1.6, w / 2 - 1.6, w / 2 - 3.4]) : [-w / 2 + 1.6, -w / 2 + 3.6, w / 2 - 1.6, w / 2 - 3.6])) win(x, y, lit[li++ % lit.length]); }
  const doorX = garage ? -w / 2 + 2.0 : -w / 2 + 3.6;
  f.push(panel(doorX - .55, 0, doorX + .55, 2.2, fz, trim), panel(doorX - .45, 0, doorX + .45, 2.05, fz + .002, door, { bias: .12 }), panel(doorX - .25, 1.3, doorX + .25, 1.8, fz + .004, '#ffd98a', { glow: true, bias: .14 }));   // the door sits on its frame: its centre is lower than the frame's, so a plain depth sort put it behind (bias keeps it in front)
  f.push(...box(doorX - 1.1, 0, d / 2, doorX + 1.1, .18, d / 2 + 1.3, '#a9a295'));                                   // the porch step
  f.push(...box(doorX - 1.15, 2.5, d / 2, doorX + 1.15, 2.6, d / 2 + 1.35, roof), ...box(doorX - 1.05, .18, d / 2 + 1.18, doorX - .95, 2.5, d / 2 + 1.28, trim), ...box(doorX + .95, .18, d / 2 + 1.18, doorX + 1.05, 2.5, d / 2 + 1.28, trim));
  f.push(panel(doorX + .7, 1.6, doorX + .85, 1.75, fz + .006, '#ffe9a8', { glow: true }));   // porch light
  if (garage) { const gx = w / 2 - gw / 2 - .4; f.push(panel(gx - gw / 2 - .08, 0, gx + gw / 2 + .08, 2.38, fz, trim), panel(gx - gw / 2, 0, gx + gw / 2, 2.3, fz + .002, '#e8e2d0'));
    for (let i = 1; i < 5; i++) f.push(panel(gx - gw / 2, i * .46 - .02, gx + gw / 2, i * .46 + .02, fz + .004, '#b9b4a8', { lw: 1.5 })); }
  f.push(...box(w / 2 - 2.6, h + .6, -1.2, w / 2 - 1.9, h + rh + .3, -.5, '#8a3a2e'));   // chimney
  return { faces: f, size: [w + 2 * o, h + rh, d + 1.35], name: garage ? `house with garage (${storeys} storey)` : `house (${storeys} storey)` };
}
const houseBig = () => house({ w: 12, d: 9, storeys: 2, wall: '#e8e2d0', roof: '#3a3d48', door: '#c8302a', garage: true });
// ---- parcels ----
// a delivery box on the doorstep, sized for what is inside (outer sizes, metres): a pair of sneakers 0.36 x 0.14 x 0.25, a phone
// 0.22 x 0.09 x 0.15, a game console 0.50 x 0.16 x 0.38. Cardboard, a strip of tape over the top, a white shipping label on the front.
export const PARCEL = { sneakers: [.36, .14, .25], phone: [.22, .09, .15], console: [.50, .16, .38] };
export function parcel(kind = 'sneakers') {
  const [w, h, d] = PARCEL[kind], up = [0, 1, 0], f = [...box(-w / 2, 0, -d / 2, w / 2, h, d / 2, { all: '#c99a62', top: '#d6aa72' })];
  const tw = Math.min(.05, w * .18);
  f.push(poly([[-tw / 2, h + .001, -d / 2], [tw / 2, h + .001, -d / 2], [tw / 2, h + .001, d / 2], [-tw / 2, h + .001, d / 2]], '#b88a52', up, { lw: 1.2 }));   // tape over the top
  f.push(panel(-tw / 2, h * .55, tw / 2, h, d / 2 + .001, '#b88a52', { lw: 1.2 }));                                                                     // and down the front
  f.push(panel(w * .12, h * .18, w * .12 + Math.min(.1, w * .3), h * .18 + Math.min(.065, h * .5), d / 2 + .002, '#f6f3ea', { lw: 1.2 }));             // the shipping label
  return { faces: f, size: [w, h, d], name: `parcel (${kind})` };
}
const parcelShoes = () => parcel('sneakers'), parcelConsole = () => parcel('console');
// ---- paper ----
// a car-loan payment statement, US letter (216 x 279 mm), lying flat; its print is drawn on the sheet's own plane from any camera
export function bill() {
  const W = .216, D = .279, up = [0, 1, 0], f = [...box(-W / 2, 0, -D / 2, W / 2, .002, D / 2, '#f6f3ea')];
  f.push(poly([[-W / 2, .0021, -D / 2], [W / 2, .0021, -D / 2], [W / 2, .0021, -D / 2 + .04], [-W / 2, .0021, -D / 2 + .04]], '#2f6f73', up, { lw: 1.5 }));   // the lender's band
  const flatAt = (at, rot) => { const c = Math.cos(rot), s = Math.sin(rot); return ([x, y, z]) => [at[0] + x * c + z * s, at[1] + y, at[2] - x * s + z * c]; };
  // held up: the page stands facing +z, its top leaning back by `lean` (radians), turned by `rot` about the vertical
  const heldAt = (at, lean = .15, rot = 0) => { const cl = Math.cos(lean), sl = Math.sin(lean), c = Math.cos(rot), s = Math.sin(rot);
    return ([x, y, z]) => { const X = x, Y = -z * cl + y * sl, Z = y * cl + z * sl; return [at[0] + X * c + Z * s, at[1] + Y, at[2] - X * s + Z * c]; }; };
  return { faces: f, size: [W, .002, D], name: 'payment statement (letter paper)', flatAt, heldAt,
    placed: m => { const o = m([0, 0, 0]); return f.map(q => ({ ...q, n: q.n && m(q.n).map((v, i) => v - o[i]), pts: q.pts.map(m) })); },   // the sheet's faces moved by a placement (a facing turns with it)
    ink: (at = [0, 0, 0], rot = 0) => billInk(typeof at === 'function' ? at : flatAt(at, rot)) };
}
function billInk(m) {   // print in millimetres on the sheet: u across from the left edge, v down from the top edge; m places a sheet point in the world
  const w = (u, v) => proj(...m([-.108 + u / 1000, .0022, -.1395 + v / 1000]));
  const o = w(0, 0), a = w(1, 0), b = w(0, 1), m0 = getM(); setM([a[0] - o[0], a[1] - o[1], b[0] - o[0], b[1] - o[1], o[0], o[1]]);
  const big = Math.hypot(a[0] - o[0], a[1] - o[1]) * 216 > 150;   // print only when the sheet is big enough on screen to read
  if (big) text('AUTO LOAN', 108, 21, { font: '800 24px Cap', fill: '#ffffff' });
  if (big) text('PAYMENT DUE', 108, 57, { font: '800 20px Cap', fill: '#2e1d1c' });
  shape([[12, 72], [204, 72], [204, 128], [12, 128]], { fill: '#fff7e6', lw: 2, boil: .15 });
  if (big) text('$787.00', 108, 101, { font: '800 38px Cap', fill: '#b8302a' });
  for (let i = 0; i < 5; i++) fillOnly([[22, 144 + i * 11], [22 + (i % 2 ? 120 : 160), 144 + i * 11], [22 + (i % 2 ? 120 : 160), 148 + i * 11], [22, 148 + i * 11]], '#b9b4a8', { boil: 0 });   // fine print
  for (let u = 8; u < 210; u += 9) fillOnly([[u, 206], [u + 5, 206], [u + 5, 207.5], [u, 207.5]], '#9a958a', { boil: 0 });                                                     // the tear line
  for (let i = 0; i < 26; i++) { const x = 120 + i * 3.4, ww = i % 3 ? 1.4 : 2.4; fillOnly([[x, 226], [x + ww, 226], [x + ww, 262], [x, 262]], '#2e1d1c', { boil: 0 }); }     // barcode on the stub
  fillOnly([[20, 226], [100, 226], [100, 230], [20, 230]], '#b9b4a8', { boil: 0 }); fillOnly([[20, 238], [80, 238], [80, 242], [20, 242]], '#b9b4a8', { boil: 0 });
  setM(m0);
}
export const ALL = [house, houseBig, coupe, bill, parcelShoes, parcelConsole, car, counter, shelf, pylon, tv, sofa, table, fridge, door, phone];
