// Walks and runs, stepped by the distance covered and never by the clock, so a planted foot keeps pace with the ground (REGRESSIONS 23).
// ph is a phase in radians: ST.walk(metres) or ST.run(metres) of the distance covered so far in the shot. Offset a second walker by about 1.6.
export const ST = { walk: d => d * 5.7, run: d => d * 2.9 };
export const walkTo = (ph, toward, o = {}) => ({ toward, legL: .35 * Math.sin(ph), legR: -.35 * Math.sin(ph), armL: [-.15 - .35 * Math.sin(ph), -.3], armR: [.15 - .35 * Math.sin(ph), .3], bob: 6 * Math.abs(Math.sin(ph)), ...o });
export const runTo = (ph, toward, o = {}) => ({ toward, legL: .7 * Math.sin(ph), legR: -.7 * Math.sin(ph), armL: [-.2 - .8 * Math.sin(ph), -.9], armR: [.2 - .8 * Math.sin(ph), .9], lean: .1, bob: 16 * Math.abs(Math.sin(ph)), mouth: 'grit', brow: .5, ...o });
// the distance along a straight move from a to b, a fraction u of the way: for ST.walk(dist(a, b, u))
export const dist = (a, b, u) => Math.hypot(b[0] - a[0], b[1] - a[1]) * u;
