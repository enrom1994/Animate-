// One scale for the whole channel: every person, vehicle and prop is drawn from these real sizes, in metres, and a scene
// says how many pixels a metre is. Nothing is sized by eye, so a car can never come out smaller than the person beside it.
export const M = {
  person: { h: 1.75 },                       // standing height; the big toon head is counted inside this
  car: { l: 4.3, w: 1.8, h: 1.5 },           // a family hatchback or sedan
  suv: { l: 4.7, w: 1.9, h: 1.75 },
  door: { w: .9, h: 2.05 },
  counter: { h: .95, d: .6 },
  tv: { w: 1.22, h: .7 },                    // a 55-inch set
  phone: { w: .072, h: .15 },
  storey: 3.0,                               // one floor of a building
  lane: 3.5,                                 // one traffic lane
  parking: { w: 2.5, l: 5.0 },               // one bay
  pump: { h: 1.9, w: .9 },                   // a fuel pump
  streetlight: 7.5,
};
// a check for a scene: returns the problems as text (sizes that differ from the table by more than 15%)
export function checkScale(items, pxPerM) {
  const out = [];
  for (const { name, kind, dim, px } of items) { const real = M[kind] && (typeof M[kind] === 'number' ? M[kind] : M[kind][dim]); if (!real) continue;
    const got = px / pxPerM; if (Math.abs(got - real) / real > .15) out.push(`${name}: ${got.toFixed(2)} m, should be about ${real} m`); }
  return out;
}
