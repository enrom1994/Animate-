// street.js — Theo and Max on their street: where each man and his car stand, the standard framings, and the people as extras
// the town draws in depth (drawWide's `extras`). Shared by every money film.
import { AUDIT, S as INKS, push, pop, translate, scale } from './toon.js';
import { town, drawWide } from './wide.js';
import { camOf } from './edit.js';
import { maxStanding, theoStanding, THEO } from './cast.js';
import { UNIT, ORIGIN_H } from './max.js';
import { car as hatch, coupe } from './props/props.js';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const THEO_X = 21.3, THEO_Z = -6.9, TCAR = [24.0, -8.8], MAX_X = 8.0, MAX_Z = -6.9, MCAR = [9.9, -9.0];   // each man stands in front of his car
export const FRAME_THEO = { look: [22.5, 1.1, -7.2], L: 9.5, down: .1, F: 2300 }, FRAME_MAX = { look: [9.2, 1.1, -7.2], L: 9.5, down: .1, F: 2300 };
export const CLOSE_THEO = { look: [THEO_X + .3, 1.2, THEO_Z], L: 5, down: .1, F: 2300 };
// ---- the people and cars, as extras the town draws in depth ----
export const STREET = { focus: true };   // is the camera close on the people? (in the wide town shots they are scenery, not the subject)
export const person = (draw, name) => (sx, sy, kpx) => { const k = kpx * UNIT, lw0 = INKS.lwScale; INKS.lwScale = lw0 * clamp(k, .3, 1); push(); translate(sx, sy); scale(k); draw(); pop(); INKS.lwScale = lw0;
  if (STREET.focus) AUDIT.subject(name, [sx - 200 * k, sy - 670 * k, sx + 200 * k, sy - 270 * k], 60); };
export const COUPE = coupe('#c8302a').faces, COUPE_OLD = coupe('#8f3a33').faces, HATCH = hatch('#7d8f86').faces;
export const theoEx = (t, act = {}) => ({ x: THEO_X, z: THEO_Z, h: ORIGIN_H, fn: person(() => theoStanding(t, THEO.C, act), 'Theo') });
export const maxEx = (t, act = {}) => ({ x: MAX_X, z: MAX_Z, h: ORIGIN_H, fn: person(() => maxStanding(t, { outfit: 'flash', act }), 'Max') });
export const carsEx = (old = false) => [{ x: MCAR[0], z: MCAR[1], dir: 'x', car: old ? COUPE_OLD : COUPE }, { x: TCAR[0], z: TCAR[1], dir: 'x', car: HATCH }];
export const pin = (x, z, h) => town.pj(x, z, h);
// a shot of one man in front of his house and car: returns a draw function (for split screens)
export const maxShot = (t, st, { old = false, act = {} } = {}) => () => drawWide(t, { ...camOf(st), extras: [maxEx(t, act), ...carsEx(old)] }, { tilt: false });
export const theoShot = (t, st, { old = false, act = {} } = {}) => () => drawWide(t, { ...camOf(st), extras: [theoEx(t, act), ...carsEx(old)] }, { tilt: false });
