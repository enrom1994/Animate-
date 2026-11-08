// Satellite Briefing engine: one perspective camera around a spherical Earth, imagery plates sampled
// by lon/lat in a WebGL2 shader, and the same camera math in JS for the 2D annotation layer.
// One world -> screen function (project) serves every annotation, so lines stay glued to the ground.

export const R = 6371.0088;          // Earth radius, km
const D2R = Math.PI / 180;

// ------------------------------------------------------------------ vectors (double precision, JS)
const v = (x, y, z) => [x, y, z];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => mul(a, 1 / Math.hypot(a[0], a[1], a[2]));

export function ecef(lat, lon, h = 0) {
  const p = lat * D2R, l = lon * D2R, r = R + h;
  return v(r * Math.cos(p) * Math.cos(l), r * Math.cos(p) * Math.sin(l), r * Math.sin(p));
}
function enu(lat, lon) {
  const p = lat * D2R, l = lon * D2R;
  const up = v(Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p));
  const east = v(-Math.sin(l), Math.cos(l), 0);
  const north = cross(up, east);
  return { up, east, north };
}

// camera: look at ground point (lat, lon) from distance d (km), tilt (deg from straight down),
// heading (deg, direction the camera faces, clockwise from north), roll (deg), vertical fov (deg),
// and a lens shift so the target can sit off-centre: (sx, sy) in pixels from the frame centre.
export function makeCamera({ lat, lon, d, tilt = 0, heading = 0, roll = 0, fov = 30, sx = 0, sy = 0 }, W = 1920, H = 1080) {
  const T = ecef(lat, lon, 0);
  const { up, east, north } = enu(lat, lon);
  const hd = heading * D2R, tl = tilt * D2R;
  const Hdir = add(mul(north, Math.cos(hd)), mul(east, Math.sin(hd)));
  const C = add(T, mul(add(mul(up, Math.cos(tl)), mul(Hdir, -Math.sin(tl))), d));
  const f = norm(sub(T, C));
  let u = norm(sub(add(mul(Hdir, Math.cos(tl)), mul(up, Math.sin(tl))), mul(f, 0)));   // screen-up before roll
  u = norm(sub(u, mul(f, dot(u, f))));
  let r = norm(cross(f, u));
  if (roll) { const rr = roll * D2R; const r2 = add(mul(r, Math.cos(rr)), mul(u, Math.sin(rr))); u = norm(cross(r2, f)); r = r2; }
  const F = (H / 2) / Math.tan(fov * D2R / 2);
  const Cc = mul(C, -1);                        // camera -> Earth centre
  const h = Math.hypot(C[0], C[1], C[2]) - R;   // altitude above the sphere
  return { C, f, u, r, F, W, H, sx, sy, Cc, c2: h * (2 * R + h), alt: h, tgt: { lat, lon } };
}

// world -> screen. Returns [x, y, visible] (visible = in front and on the camera's side of the globe)
export function project(cam, lat, lon, hgt = 0) {
  const P = ecef(lat, lon, hgt);
  const q = sub(P, cam.C);
  const z = dot(q, cam.f);
  const x = cam.W / 2 + cam.sx + cam.F * dot(q, cam.r) / z;
  const y = cam.H / 2 + cam.sy - cam.F * dot(q, cam.u) / z;
  const facing = dot(P, mul(q, -1)) > 0;      // surface normal points towards the camera
  return [x, y, z > 0 && facing];
}
// screen -> ground (lat, lon) or null
export function unproject(cam, x, y) {
  const nx = (x - cam.W / 2 - cam.sx) / cam.F, ny = -(y - cam.H / 2 - cam.sy) / cam.F;
  const d = norm(add(cam.f, add(mul(cam.r, nx), mul(cam.u, ny))));
  const b = dot(d, cam.Cc), disc = b * b - cam.c2;
  if (disc < 0) return null;
  const t = b - Math.sqrt(disc);
  const Q = sub(mul(d, t), cam.Cc);
  return [Math.asin(Q[2] / R) / D2R, Math.atan2(Q[1], Q[0]) / D2R];
}
// km per pixel at the target (for scale bars)
export function kmPerPx(cam) { return (cam.alt / Math.max(1e-6, Math.cos(0))) / cam.F; }


// ------------------------------------------------------------------ Egypt long film: imagery shader (this film's own; the camera above is the style's)
const VS = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
const FS = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2 uRes, uShift; uniform float uF;
uniform vec3 uR, uU, uFw, uCc; uniform float uC2;
uniform sampler2D tWD, tWN, tED, tEN, t1A, t1B, t1O, t2A, t2B, t2O;
uniform vec4 bE, b1, b2;
uniform float uDet1, uSwap1, uSwapOn1, uOver1, uDet2, uSwap2, uSwapOn2, uOver2;   // detail pairs: A south of the scan line, B north of it
uniform float uNightA, uNightB, uScanLat, uScanOn;
uniform float uGrey, uKeep, uFlood, uOutline, uAtm, uShade, uDim, uExpo;
const float RE = 6371.0088;
float lum(vec3 c){ return dot(c, vec3(.299, .587, .114)); }
vec2 uvOf(vec4 b, vec2 ll){ return vec2((ll.y - b.x) / (b.z - b.x), (b.w - ll.x) / (b.w - b.y)); }
float inside(vec2 uv, float f){ vec2 e = smoothstep(vec2(0.), vec2(f), uv) * smoothstep(vec2(0.), vec2(f), 1. - uv); return e.x * e.y; }
vec3 detail(vec3 day, vec2 ll, sampler2D A, sampler2D B, sampler2D O, vec4 bb, float det, float swp, float on, float over, inout vec3 glow){
  vec2 uv = uvOf(bb, ll); float w = inside(uv, .04) * det; if (w <= 0.) return day;
  vec3 a = texture(A, uv).rgb, b = texture(B, uv).rgb;
  float s = smoothstep(swp - .004, swp + .004, ll.x);
  vec3 c = mix(a, b, s);
  if (max(c.r, max(c.g, c.b)) < .004) w *= 0.;   // only true no-data (dark sea is real data)                          // no data (and the red scan-edge line of old scenes)            // no data: let the coarser plate show
  vec4 ov = texture(O, uv); c = mix(c, ov.rgb, ov.a * over);
  glow += vec3(.7, .85, 1.) * exp(-pow((ll.x - swp) / .0025, 2.)) * on * .5 * w;
  return mix(day, c, w);
}
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float nx = (px.x - uRes.x * .5 - uShift.x) / uF, ny = -(px.y - uRes.y * .5 - uShift.y) / uF;
  vec3 d = normalize(uFw + uR * nx + uU * ny);
  float b = dot(d, uCc), disc = b * b - uC2;
  vec2 vp = px / uRes - .5; float vig = 1. - .5 * dot(vp, vp);
  if (disc < 0.) { float dist = sqrt(max(0., dot(uCc, uCc) - b * b)); float rim = exp(-max(0., dist - RE) / 70.) * uAtm; o = vec4(vec3(.32, .52, .9) * rim * vig * (1. - uDim), 1.); return; }
  float t = b - sqrt(disc); vec3 Q = d * t - uCc; vec3 N = Q / RE;
  vec2 ll = vec2(degrees(asin(clamp(N.z, -1., 1.))), degrees(atan(N.y, N.x)));
  vec2 uW = vec2((ll.y + 180.) / 360., (90. - ll.x) / 180.);
  vec3 day = texture(tWD, uW).rgb, nig = texture(tWN, uW).rgb;
  vec2 uE = uvOf(bE, ll); float wE = inside(uE, .02);
  day = mix(day, texture(tED, uE).rgb, wE); nig = mix(nig, texture(tEN, uE).rgb, wE);
  vec3 dayBase = day, glow = vec3(0.);
  day = detail(day, ll, t1A, t1B, t1O, b1, uDet1, uSwap1, uSwapOn1, uOver1, glow);
  day = detail(day, ll, t2A, t2B, t2O, b2, uDet2, uSwap2, uSwapOn2, uOver2, glow);
  float n = mix(uNightA, uNightB, smoothstep(uScanLat - .35, uScanLat + .35, ll.x));
  vec3 col = mix(day, nig * 1.15, n);
  col += vec3(.7, .85, 1.) * exp(-pow((ll.x - uScanLat) / .25, 2.)) * uScanOn * .35 + glow;
  float veg = smoothstep(.0, .045, day.g - day.r) * smoothstep(.5, .15, lum(day)) * step(day.b, day.g * 1.08) * (1. - n);
  float valley = smoothstep(.36, .2, lum(dayBase)) * step(dayBase.b, dayBase.r * 1.08) * wE;     // the dark valley floor (not the sea)
  col = mix(col, mix(col, vec3(.16, .34, .6), .8), uFlood * valley);                 // the old summer flood over the green strip
  float L = lum(col);
  vec3 grey = mix(vec3(.03, .045, .055), vec3(.63, .655, .665), smoothstep(.02, .7, L));
  col = mix(col, grey, uGrey * (1. - uKeep * veg));
  float m = smoothstep(.22, .4, lum(textureLod(tEN, uE, 3.).rgb)) * wE;
  col = mix(col, vec3(.95, .97, .98), clamp(fwidth(m) * 2.2, 0., 1.) * uOutline);
  col *= mix(1., .45 + .55 * max(0., dot(N, -d)), uShade);
  o = vec4(col * uExpo * vig * (1. - uDim), 1.);
}`;
const SLOTS = ['tWD', 'tWN', 'tED', 'tEN', 't1A', 't1B', 't1O', 't2A', 't2B', 't2O'];
export function makeGlobe(canvas, imgs) {
  const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS)); gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  gl.useProgram(p);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(p, n);
  SLOTS.forEach((k, i) => {
    const tx = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tx);
    const im = imgs[k];
    if (im) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(U(k), i);
  });
  const F = ['uDet1', 'uSwap1', 'uSwapOn1', 'uOver1', 'uDet2', 'uSwap2', 'uSwapOn2', 'uOver2', 'uNightA', 'uNightB', 'uScanLat', 'uScanOn', 'uGrey', 'uKeep', 'uFlood', 'uOutline', 'uAtm', 'uShade', 'uDim', 'uExpo'];
  return (cam, o) => {
    gl.viewport(0, 0, cam.W, cam.H);
    gl.uniform2f(U('uRes'), cam.W, cam.H); gl.uniform2f(U('uShift'), cam.sx, cam.sy); gl.uniform1f(U('uF'), cam.F);
    gl.uniform3f(U('uR'), ...cam.r); gl.uniform3f(U('uU'), ...cam.u); gl.uniform3f(U('uFw'), ...cam.f); gl.uniform3f(U('uCc'), ...cam.Cc); gl.uniform1f(U('uC2'), cam.c2);
    gl.uniform4f(U('bE'), ...o.bE); gl.uniform4f(U('b1'), ...o.b1); gl.uniform4f(U('b2'), ...o.b2);
    for (const k of F) gl.uniform1f(U(k), o[k] ?? 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
}
