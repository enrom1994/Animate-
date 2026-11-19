// The money channel's prop library: the objects the money goes on, drawn as accurately detailed illustrations (right shape, real parts,
// shading and a highlight) in the street's own ink line and palette. Generic designs only: no brand, no logo, no copied product.
// Every function draws at (x, y) = the object's base centre (ground contact), w = its width in pixels.
export const INK = '#2e1d1c';
const ink = (g, lw) => { g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; };
const shade = (g, x0, y0, x1, y1, a, b) => { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, a); gr.addColorStop(1, b); return gr; };
const mix = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = c => Math.max(0, Math.min(255, Math.round(c + (k > 0 ? (255 - c) * k : c * k)))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
// a hatchback seen side-on, facing right
export function car(g, x, y, w, { paint = '#3f5f8a', lw = 5 } = {}) { const P = (px, py) => [x - w / 2 + px * w, y + py * w];
  g.save();
  g.fillStyle = 'rgba(40,25,20,.28)'; g.beginPath(); g.ellipse(x, y + .005 * w, w * .5, w * .035, 0, 0, 7); g.fill();   // the shadow under it
  const body = () => { g.beginPath(); g.moveTo(...P(.03, -.12)); g.lineTo(...P(.012, -.27)); g.quadraticCurveTo(...P(.02, -.33), ...P(.06, -.35));
    g.lineTo(...P(.16, -.45)); g.quadraticCurveTo(...P(.19, -.475), ...P(.25, -.478)); g.lineTo(...P(.55, -.47)); g.quadraticCurveTo(...P(.6, -.465), ...P(.63, -.44));
    g.lineTo(...P(.72, -.34)); g.quadraticCurveTo(...P(.9, -.325), ...P(.965, -.29)); g.quadraticCurveTo(...P(.995, -.27), ...P(.995, -.2)); g.lineTo(...P(.99, -.12)); g.closePath(); };
  body(); g.fillStyle = shade(g, 0, y - .48 * w, 0, y - .1 * w, mix(paint, .25), mix(paint, -.25)); g.fill();
  // the shoulder line catching the light, and the darker sill
  g.save(); body(); g.clip(); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x - w / 2, y - .345 * w, w, .03 * w); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x - w / 2, y - .17 * w, w, .06 * w); g.restore();
  body(); ink(g, lw); g.stroke();
  // the glasshouse: rear quarter and front door windows either side of the B pillar, with rubber seals and a reflection
  const glass = (pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...P(...p)) : g.moveTo(...P(...p))); g.closePath(); };
  for (const pts of [[[.17, -.435], [.39, -.445], [.39, -.345], [.11, -.345]], [[.42, -.445], [.545, -.445], [.645, -.35], [.42, -.345]]]) {
    glass(pts); g.fillStyle = shade(g, 0, y - .45 * w, 0, y - .34 * w, '#a9c4d4', '#5f7f95'); g.fill();
    g.save(); glass(pts); g.clip(); g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); const [ax, ay] = P(pts[0][0] + .06, -.45); g.moveTo(ax, ay); g.lineTo(ax + .05 * w, ay); g.lineTo(ax - .03 * w, ay + .11 * w); g.lineTo(ax - .08 * w, ay + .11 * w); g.fill(); g.restore();
    glass(pts); ink(g, lw * .8); g.stroke(); }
  // door seams, handles, mirror, fuel flap
  ink(g, lw * .6); g.beginPath(); for (const dx of [.405, .66]) { g.moveTo(...P(dx, -.345)); g.lineTo(...P(dx + (dx > .5 ? .01 : 0), -.125)); } g.moveTo(...P(.405, -.345)); g.lineTo(...P(.405, -.45)); g.stroke();
  for (const hx of [.34, .6]) { g.beginPath(); g.roundRect(...P(hx, -.315), .05 * w, .014 * w, 4); g.fillStyle = mix(paint, -.35); g.fill(); ink(g, lw * .5); g.stroke(); }
  g.beginPath(); g.moveTo(...P(.655, -.355)); g.quadraticCurveTo(...P(.7, -.39), ...P(.71, -.355)); g.closePath(); g.fillStyle = mix(paint, -.1); g.fill(); ink(g, lw * .6); g.stroke();
  g.beginPath(); g.arc(...P(.1, -.3), .018 * w, 0, 7); ink(g, lw * .5); g.stroke();
  // lights: a wraparound headlight with a lens, a red tail light cluster
  g.beginPath(); g.moveTo(...P(.93, -.29)); g.quadraticCurveTo(...P(.985, -.28), ...P(.99, -.24)); g.lineTo(...P(.94, -.245)); g.closePath(); g.fillStyle = shade(g, x + .43 * w, 0, x + .49 * w, 0, '#fff6dc', '#d9d2b8'); g.fill(); ink(g, lw * .7); g.stroke();
  g.beginPath(); g.moveTo(...P(.014, -.29)); g.lineTo(...P(.06, -.3)); g.lineTo(...P(.06, -.255)); g.lineTo(...P(.016, -.245)); g.closePath(); g.fillStyle = '#c42a24'; g.fill(); ink(g, lw * .7); g.stroke();
  // bumpers in black plastic, a grille slot
  for (const [a, b] of [[.85, .995], [.02, .15]]) { g.beginPath(); g.roundRect(...P(a, -.17), (b - a) * w, .045 * w, 6); g.fillStyle = '#2d2b30'; g.fill(); ink(g, lw * .6); g.stroke(); }
  g.beginPath(); g.roundRect(...P(.94, -.215), .045 * w, .02 * w, 3); g.fillStyle = '#1d1b1f'; g.fill();
  // wheels: arch shadow, tyre with sidewall, a five-spoke alloy, the hub
  for (const cx of [.2, .8]) { const [wx, wy] = P(cx, -.115), R = .115 * w;
    g.beginPath(); g.arc(wx, wy, R * 1.12, Math.PI, 0); g.fillStyle = '#1a181c'; g.fill();
    g.beginPath(); g.arc(wx, wy, R, 0, 7); g.fillStyle = '#26242a'; g.fill(); ink(g, lw); g.stroke();
    g.beginPath(); g.arc(wx, wy, R * .66, 0, 7); g.fillStyle = shade(g, wx - R, wy - R, wx + R, wy + R, '#e3e6ea', '#9aa0a8'); g.fill(); ink(g, lw * .6); g.stroke();
    g.fillStyle = '#5a5f66'; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - Math.PI / 2; g.save(); g.translate(wx, wy); g.rotate(a); g.beginPath(); g.moveTo(-R * .07, -R * .14); g.lineTo(R * .07, -R * .14); g.lineTo(R * .14, -R * .6); g.lineTo(-R * .14, -R * .6); g.closePath(); g.fill(); g.restore(); }
    g.beginPath(); g.arc(wx, wy, R * .14, 0, 7); g.fillStyle = '#c9ccd4'; g.fill(); ink(g, lw * .5); g.stroke(); }
  g.restore(); }
// a smartphone, face on, standing upright on its base
export function phone(g, x, y, w, { body = '#26242a', lw = 5, screen = 'home' } = {}) { const h = w * 2.05, X = x - w / 2, Y = y - h;
  g.save(); g.beginPath(); g.roundRect(X, Y, w, h, w * .16); g.fillStyle = body; g.fill(); ink(g, lw); g.stroke();
  g.beginPath(); g.roundRect(X + w * .055, Y + w * .055, w * .89, h - w * .11, w * .12); g.fillStyle = shade(g, X, Y, X + w, Y + h, '#3f6f8a', '#2a3f5f'); g.fill();
  if (screen === 'home') { const cs = w * .16; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { g.beginPath(); g.roundRect(X + w * .12 + c * w * .2, Y + h * .14 + r * w * .24, cs, cs, cs * .28); g.fillStyle = ['#e7c65a', '#7aa85a', '#d9772e', '#a9c4d4', '#c94a4a', '#efe6d2'][(r * 4 + c) % 6]; g.fill(); } }
  g.beginPath(); g.roundRect(X + w * .36, Y + w * .09, w * .28, w * .07, w * .035); g.fillStyle = '#121114'; g.fill();   // the camera pill
  g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.moveTo(X + w * .6, Y + w * .06); g.lineTo(X + w * .9, Y + w * .06); g.lineTo(X + w * .1, Y + h * .7); g.lineTo(X + w * .1, Y + h * .45); g.fill();   // glare
  ink(g, lw * .7); g.beginPath(); g.moveTo(X + w, Y + h * .22); g.lineTo(X + w, Y + h * .34); g.moveTo(X, Y + h * .2); g.lineTo(X, Y + h * .26); g.stroke();   // side buttons
  g.restore(); }
// a flat-screen TV on a stand, showing a picture
export function tv(g, x, y, w, { lw = 5 } = {}) { const h = w * .58, X = x - w / 2, Y = y - h - w * .1;
  g.save(); g.fillStyle = '#2d2b30'; g.beginPath(); g.moveTo(x - w * .05, Y + h); g.lineTo(x + w * .05, Y + h); g.lineTo(x + w * .03, y - w * .02); g.lineTo(x - w * .03, y - w * .02); g.closePath(); g.fill(); ink(g, lw * .7); g.stroke();
  g.beginPath(); g.roundRect(x - w * .2, y - w * .025, w * .4, w * .025, 4); g.fill(); g.stroke();
  g.beginPath(); g.roundRect(X, Y, w, h, w * .015); g.fillStyle = '#1d1b1f'; g.fill(); ink(g, lw); g.stroke();
  const sx = X + w * .02, sy = Y + w * .02, sw = w * .96, sh = h - w * .04; const sk = g.createLinearGradient(0, sy, 0, sy + sh); sk.addColorStop(0, '#7fb2d6'); sk.addColorStop(.6, '#f2d9b0'); g.fillStyle = sk; g.fillRect(sx, sy, sw, sh);
  g.fillStyle = '#5f8a48'; g.beginPath(); g.moveTo(sx, sy + sh); g.lineTo(sx, sy + sh * .62); g.quadraticCurveTo(sx + sw * .3, sy + sh * .45, sx + sw * .55, sy + sh * .66); g.quadraticCurveTo(sx + sw * .8, sy + sh * .52, sx + sw, sy + sh * .6); g.lineTo(sx + sw, sy + sh); g.fill();
  g.fillStyle = '#f6efe0'; g.beginPath(); g.arc(sx + sw * .75, sy + sh * .3, sh * .1, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(sx + sw * .55, sy); g.lineTo(sx + sw * .75, sy); g.lineTo(sx + sw * .35, sy + sh); g.lineTo(sx + sw * .15, sy + sh); g.fill();
  g.fillStyle = '#c42a24'; g.beginPath(); g.arc(X + w * .5, Y + h - w * .008, w * .004, 0, 7); g.fill();   // standby light
  g.restore(); }
// a games console standing upright, and its controller lying in front
export function console_(g, x, y, w, { lw = 5 } = {}) { const h = w * 1.55, X = x - w / 2, Y = y - h;
  g.save(); g.beginPath(); g.roundRect(X, Y, w, h, w * .1); g.fillStyle = shade(g, X, 0, X + w, 0, '#3a383e', '#1f1d22'); g.fill(); ink(g, lw); g.stroke();
  g.fillStyle = '#121114'; for (let i = 0; i < 9; i++) g.fillRect(X + w * .2, Y + h * .12 + i * h * .045, w * .6, h * .018);   // vents
  g.fillStyle = '#6fc0d6'; g.fillRect(X + w * .1, Y + h * .72, w * .8, h * .012);   // the light strip
  g.beginPath(); g.roundRect(X + w * .3, Y + h * .8, w * .4, h * .03, 3); g.fillStyle = '#121114'; g.fill();   // the disc slot
  g.beginPath(); g.arc(X + w * .5, Y + h * .9, w * .05, 0, 7); g.fillStyle = '#2d2b30'; g.fill(); ink(g, lw * .5); g.stroke();
  // the controller, in front and to the side
  const cx = x + w * 1.05, cy = y - w * .2, cw = w * 1.2; g.beginPath(); g.moveTo(cx - cw * .5, cy); g.quadraticCurveTo(cx - cw * .55, cy - cw * .3, cx - cw * .25, cy - cw * .32); g.lineTo(cx + cw * .25, cy - cw * .32); g.quadraticCurveTo(cx + cw * .55, cy - cw * .3, cx + cw * .5, cy);
  g.quadraticCurveTo(cx + cw * .42, cy + cw * .14, cx + cw * .28, cy + cw * .04); g.lineTo(cx - cw * .28, cy + cw * .04); g.quadraticCurveTo(cx - cw * .42, cy + cw * .14, cx - cw * .5, cy); g.closePath(); g.fillStyle = '#2d2b30'; g.fill(); ink(g, lw * .8); g.stroke();
  for (const sx of [-.17, .07]) { g.beginPath(); g.arc(cx + cw * sx, cy - cw * .1, cw * .065, 0, 7); g.fillStyle = '#1a181c'; g.fill(); ink(g, lw * .5); g.stroke(); }
  for (const [bx, by, c] of [[.3, -.2, '#e7c65a'], [.36, -.14, '#c94a4a'], [.24, -.14, '#4f7fc4'], [.3, -.08, '#7aa85a']]) { g.beginPath(); g.arc(cx + cw * bx, cy + cw * by, cw * .025, 0, 7); g.fillStyle = c; g.fill(); }
  g.fillStyle = '#c9ccd4'; g.fillRect(cx - cw * .33, cy - cw * .2, cw * .1, cw * .025); g.fillRect(cx - cw * .295, cy - cw * .235, cw * .025, cw * .095);   // the d-pad
  g.restore(); }
