// Toon renderer: flat-shaded 3D set + flat 2D characters, one ink-outline pass over both.
// Every frame is a function of time: window.renderAt(t).
import * as THREE from 'three';
// the film is chosen in the address: /engine/index.html?film=ripcurrent loads /ripcurrent/src/shots.js
const FILM = new URLSearchParams(location.search).get('film');
const { SHOTS, CAPTIONS, DURATION, WARP } = await import(`/${FILM}/src/shots.js`);
// film time -> the first take's time, which is what the shots are written in
const toRef = t => { for (let i = 1; i < WARP.length; i++) if (t <= WARP[i][1]) { const [r0, n0] = WARP[i - 1], [r1, n1] = WARP[i]; return r0 + (r1 - r0) * (t - n0) / (n1 - n0); } return WARP[WARP.length - 1][0]; };

export const W = 720, H = 1280, INK = 0x1d1a26;
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').prepend(renderer.domElement);

// pass 1: colour (multisampled). pass 2: normals + depth, which the ink shader reads for edges.
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNorm = new THREE.WebGLRenderTarget(W * 2, H * 2, { depthTexture: new THREE.DepthTexture(W * 2, H * 2), minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const NORMAL = new THREE.MeshNormalMaterial();
const ink = new THREE.ShaderMaterial({
  uniforms: { tC: { value: rtColor.texture }, tN: { value: rtNorm.texture }, tD: { value: rtNorm.depthTexture }, near: { value: .1 }, far: { value: 300 },
    px: { value: new THREE.Vector2(1 / W, 1 / H) }, ink: { value: new THREE.Color(INK) }, uVig: { value: .22 }, uBlur: { value: 0 }, uFocus: { value: 6 }, uWhip: { value: new THREE.Vector2() }, uZoom: { value: 0 }, uFlash: { value: 0 }, uRain: { value: 0 }, uTime: { value: 0 },
    uInkK: { value: 1 }, uNormK: { value: 1 }, uHaze: { value: new THREE.Vector4(0, 0, 0, 0) }, uDust: { value: 0 }, uWarm: { value: 0 }, uSat: { value: 1 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
  fragmentShader: `
    uniform sampler2D tC, tN, tD; uniform float near, far, uVig, uBlur, uFocus, uZoom, uFlash, uRain, uTime, uInkK, uNormK, uDust, uWarm, uSat; uniform vec2 px, uWhip; uniform vec4 uHaze;
    float h1(float n){ return fract(sin(n * 127.1) * 43758.5453); }
    // rain: slanted streaks on two scales, falling with time; a function of time only, like everything else
    float rain(vec2 uv, float sc, float sp){ vec2 p = uv * vec2(34., 7.) * sc; p.x += p.y * .22; p.y += uTime * sp; vec2 id = floor(p), f = fract(p); float h = h1(id.x * 17. + id.y * 3.1), on = step(h, .34);
      return on * smoothstep(.07, .0, abs(f.x - .2 - h * 1.7)) * smoothstep(0., .15, f.y) * smoothstep(1., .55, f.y); } uniform vec3 ink; varying vec2 vUv;
    float dust(vec2 uv){ float s = 0.; for (int l = 0; l < 2; l++) { float sc = 9. + float(l) * 7.; vec2 p = uv * vec2(sc * .5625, sc) + vec2(uTime * .03 * (1. + float(l)), -uTime * .05); vec2 id = floor(p), f = fract(p); float h = h1(id.x * 31. + id.y * 7. + float(l) * 13.); vec2 c0 = vec2(.2 + .6 * h1(h * 91.), .2 + .6 * h1(h * 57.)) + .15 * vec2(sin(uTime * .7 + h * 40.), cos(uTime * .5 + h * 30.)); s += step(.55, h) * smoothstep(.06 - float(l) * .02, 0., length(f - c0)) * (.5 + .5 * sin(uTime * 1.3 + h * 60.)); } return s; }
    float iz(vec2 u){ float d = texture2D(tD, u).x; float z = near * far / (far - d * (far - near)); return 1. / z; }   // 1/viewZ is linear on screen for a plane
    vec3 nm(vec2 u){ return texture2D(tN, u).xyz * 2. - 1.; }
    float edge(vec2 u, float r){
      vec2 o = px * r; float c = iz(u);
      float lap = abs(iz(u + vec2(o.x, 0.)) + iz(u - vec2(o.x, 0.)) + iz(u + vec2(0., o.y)) + iz(u - vec2(0., o.y)) - 4. * c) / c;
      vec3 n = nm(u); float dn = 0.;
      dn = max(dn, 1. - dot(n, nm(u + vec2(o.x, 0.)))); dn = max(dn, 1. - dot(n, nm(u - vec2(o.x, 0.))));
      dn = max(dn, 1. - dot(n, nm(u + vec2(0., o.y)))); dn = max(dn, 1. - dot(n, nm(u - vec2(0., o.y))));
      return max(smoothstep(.012, .03, lap), smoothstep(.25, .5, dn) * uNormK);   // uNormK < 1: creases inside a shape draw lighter than its outline
    }
    void main(){
      vec3 c = vec3(0.); float tr = length(uWhip) + abs(uZoom);
      if (tr > .001) {                                                                    // on a cut: the picture smears out one way and in from the other
        float dz = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);   // each pixel starts its samples at a different point, so the blur is smooth and never a comb of ghost copies
        for (int k = 0; k < 32; k++) { float f = (float(k) + dz) / 32.; vec2 u = vUv + uWhip * (.35 + f * .6); u = .5 + (u - .5) * (1. - uZoom * (.35 + f * .65)); u = abs(mod(u + 1., 2.) - 1.); c += texture2D(tC, clamp(u, .001, .999)).rgb; }   // past an edge the picture folds back on itself, so the smear is made of picture, never of one stretched row of pixels
        c /= 32.;
      } else {
        float z = 1. / iz(vUv), far01 = max(smoothstep(uFocus * 2.2, uFocus * 7., z) * .7, smoothstep(uFocus * .5, uFocus * .22, z) * 1.6) * uBlur;   // the background goes soft, the subject stays crisp
        float n = 0.;
        for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) { vec2 o = vec2(float(i), float(j)) * px * 2.2 * far01; c += texture2D(tC, vUv + o).rgb; n += 1.; }
        c /= n;
        float e = 0.; for (int i = 0; i < 4; i++) { vec2 j = (vec2(mod(float(i), 2.), floor(float(i) / 2.)) - .5) * px * .5; e += max(edge(vUv + j, 1.6), edge(vUv + j, .8)); } e *= .25;
        e *= 1. - .75 * far01;                                                              // lines thin out with distance
        c = mix(c, ink, e * uInkK);
        c = mix(c, uHaze.rgb, uHaze.a * smoothstep(uFocus * 1.2, uFocus * 9., z));   // haze: far things sink into the air's colour
      }
      if (uDust > 0.) c += uDust * dust(vUv) * vec3(1., .93, .78);   // dust in the light: soft specks drifting, a function of time
      if (uSat != 1.) { float l = dot(c, vec3(.2126, .7152, .0722)); c = max(mix(vec3(l), c, uSat), 0.); }   // storybook colour: push saturation
      if (uWarm > 0.) { c = mix(c, c * vec3(1.07, 1.0, .86) + vec3(.025, .012, 0.), uWarm); }
      if (uRain > 0.) c = mix(c, vec3(.86, .92, 1.), uRain * (.42 * rain(vUv, 1., 9.) + .26 * rain(vUv + .37, 1.9, 13.)));
      c = mix(c, vec3(1.), uFlash * .85);                                                 // lightning: the whole frame goes white and falls back
      vec2 q = vUv - .5; q.x *= .5625; c *= 1. - uVig * smoothstep(.2, .65, length(q));
      gl_FragColor = vec4(c, 1.);
      #include <colorspace_fragment>
    }`, depthTest: false, depthWrite: false });
const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ink));

const capEl = document.getElementById('cap'), built = new Map();
let LAST = null;   // the shot drawn last, for the checker
const getShot = i => { if (!built.has(i)) built.set(i, SHOTS[i].build()); return built.get(i); };
window.DURATION = DURATION;
window.renderAt = t => {
  const tr = toRef(t); let idx = SHOTS.findIndex(s => tr >= s.start && tr < s.end); if (idx < 0) idx = SHOTS.length - 1;
  const shot = getShot(idx), r = shot.update(tr - SHOTS[idx].start, tr) || {}, cam = shot.camera, scene = shot.scene; LAST = { scene, cam, idx, r };
  cam.aspect = W / H; cam.setViewOffset(W, H, 0, 55, W, H);   // the whole picture sits a little high: the bottom fifth of a Short is under the player's own text
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setRenderTarget(rtColor); renderer.render(scene, cam);
  const swap = []; scene.traverse(o => { if (o.isMesh) { swap.push([o, o.material]); o.material = o.userData.nmat || NORMAL; if (o.userData.noInk) o.visible = false; } });
  const bg = scene.background; scene.background = null; renderer.setClearColor(0x8080ff, 1);
  renderer.setRenderTarget(rtNorm); renderer.render(scene, cam);
  for (const [o, m] of swap) { o.material = m; o.visible = true; } scene.background = bg;
  ink.uniforms.near.value = cam.near; ink.uniforms.far.value = cam.far; ink.uniforms.uBlur.value = r.blur ?? 1; ink.uniforms.uFocus.value = r.focus ?? 6; ink.uniforms.uFlash.value = r.flash ?? 0; ink.uniforms.uRain.value = r.rain ?? 0; ink.uniforms.uTime.value = t;
  const L = r.look || {}; ink.uniforms.uInkK.value = L.inkK ?? 1; ink.uniforms.uNormK.value = L.normK ?? 1; ink.uniforms.uDust.value = L.dust ?? 0; ink.uniforms.uWarm.value = L.warm ?? 0; ink.uniforms.uSat.value = L.sat ?? 1;   // look: the richer style's grade (old films leave it out)
  { const hz = L.haze || [0, 0], hc = new THREE.Color(hz[0]); ink.uniforms.uHaze.value.set(hc.r, hc.g, hc.b, hz[1]); }
  // transitions: the last and first frames of a shot smear (a whip) or burst (a zoom), alternating
  const WH = .13, lt = tr - SHOTS[idx].start, rem = SHOTS[idx].end - tr, KINDS = [[1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -.7]];   // whip right, zoom in, whip left, zoom out. No vertical whips: on a tall frame they turn lettering and faces into streaks
  let wx = 0, wy = 0, wz = 0;
  if (rem < WH && idx < SHOTS.length - 1) { const k = KINDS[idx % KINDS.length], a = Math.pow(1 - rem / WH, 2); wx = k[0] * a * .5; wy = k[1] * a * .26; wz = k[2] * a * .45; }   // the frame is tall: a vertical whip travels half as far as a horizontal one
  else if (lt < WH && idx > 0) { const k = KINDS[(idx - 1) % KINDS.length], a = Math.pow(1 - lt / WH, 2); wx = -k[0] * a * .5; wy = -k[1] * a * .26; wz = -k[2] * a * .45; }
  ink.uniforms.uWhip.value.set(wx, wy); ink.uniforms.uZoom.value = wz;
  renderer.setRenderTarget(null); renderer.render(quadScene, quadCam);
  const c = CAPTIONS.filter(c => t >= c[0]).pop(); capEl.innerHTML = c && (c[2] == null || t < c[2]) ? c[1] : '';
  return idx;
};
const qs = new URLSearchParams(location.search);
window.ready = document.fonts.load("800 54px Cap").then(() => true);
if (qs.has('t')) window.ready.then(() => window.renderAt(parseFloat(qs.get('t'))));

// ---- the checker: window.audit(t) draws frame t, then looks for the mistakes we have shipped before (REGRESSIONS.md 17, 19, 20, and the framing rules) ----
const SOLID = new Set(['BoxGeometry', 'CylinderGeometry', 'SphereGeometry', 'IcosahedronGeometry', 'ConeGeometry', 'LatheGeometry', 'TorusGeometry']);
const shown = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
const label = o => { const p = o.geometry.parameters || {}, b = new THREE.Box3().setFromObject(o), s = b.getSize(new THREE.Vector3()); return `${o.geometry.type.replace('Geometry', '')} ${s.x.toFixed(2)}x${s.y.toFixed(2)}x${s.z.toFixed(2)} at (${b.getCenter(new THREE.Vector3()).toArray().map(v => v.toFixed(1)).join(', ')})`; };
window.audit = t => {
  window.renderAt(t); const { scene, cam, idx } = LAST, out = [], solids = [], surfaces = [], chars = [];
  scene.updateMatrixWorld(true);
  scene.traverse(o => { if (o.userData && o.userData.char && shown(o)) chars.push(o); if (!o.isMesh || !shown(o) || o.userData.card || o.userData.noInk) return; const m = o.material; if (m && (m.transparent && m.opacity < .9)) return;
    surfaces.push(o); if (SOLID.has(o.geometry.type)) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); const lb = o.geometry.boundingBox, s = lb.getSize(new THREE.Vector3()).multiply(o.getWorldScale(new THREE.Vector3())); if (Math.min(s.x, s.y, s.z) > .12) solids.push([o, lb]); } });
  // inside a solid, tested in the solid's own frame, so a turned house or car is not judged by the square box around it
  const inside = (p, shrink = .02) => solids.find(([o, lb]) => { const q = o.worldToLocal(p.clone()), sc = o.getWorldScale(new THREE.Vector3()), b = lb.clone(); b.min.addScalar(shrink / Math.max(sc.x, 1e-3)); b.max.addScalar(-shrink / Math.max(sc.x, 1e-3)); if (!b.containsPoint(q)) return false;
    const g = o.geometry.parameters || {}, r = Math.hypot(q.x, q.z), ty = o.geometry.type;   // round shapes by their real outline, not their box
    if (ty === 'ConeGeometry') return r < g.radius * (.5 - q.y / g.height) - shrink;
    if (ty === 'CylinderGeometry') return r < Math.max(g.radiusTop, g.radiusBottom) - shrink;
    if (ty === 'SphereGeometry' || ty === 'IcosahedronGeometry') return q.length() < (g.radius || g.detail || 1) - shrink;
    return true; });
  const ci = inside(cam.position); if (ci) out.push(['error', 'camera inside a solid: ' + label(ci[0])]);
  const ray = new THREE.Raycaster();
  for (const g of chars) { const pose = g.userData.pose || {}; if (g.children[0].rotation.z !== 0 || pose.sit || pose.lie) continue;   /* lying down, or sitting in a seat: the feet and body rules do not apply */ const P = g.position, hH = g.userData.hH, name = g.userData.char;
    ray.set(new THREE.Vector3(P.x, P.y + .3, P.z), new THREE.Vector3(0, -1, 0)); ray.far = 3; const hit = ray.intersectObjects(surfaces, false).find(h => h.face && h.face.normal.clone().transformDirection(h.object.matrixWorld).y > .2 || h.object.geometry.type === 'PlaneGeometry'), gy = hit ? hit.point.y : 0, d = P.y - gy;
    if (Math.abs(d) > .06) out.push([Math.abs(d) > .15 ? 'error' : 'warn', `${name}'s feet ${d > 0 ? 'float' : 'sink'} ${Math.abs(d).toFixed(2)} m ${d > 0 ? 'above' : 'into'} ${hit ? label(hit.object) : 'the ground'}`]);
    for (const h of [.5, 1.0]) { const s = inside(new THREE.Vector3(P.x, P.y + h * hH / 1.96, P.z), .04); if (s) { out.push(['error', `${name}'s body is inside ${label(s[0])}`]); break; } }
    const head = new THREE.Vector3(P.x, P.y + .615 * hH, P.z).project(cam), feet = new THREE.Vector3(P.x, P.y, P.z).project(cam);
    if (head.z < 1) { if (Math.abs(head.x) > 1 && Math.abs(feet.x) < 1.15) out.push(['warn', `${name}'s face is out of frame`]); else if (Math.abs(head.x) > .9 && Math.abs(head.x) <= 1) out.push(['warn', `${name}'s face is at the frame edge`]);
      if (head.y < -.4 && head.y > -.62 && Math.abs(head.x) < .75) out.push(['warn', `${name}'s face is under the captions`]); } }
  return { shot: idx, issues: out };
};
window.SHOTCOUNT = SHOTS.length;

// debugging aid for the checker: what the ray under each character hits
window.__probe = () => { const { scene } = LAST, out = []; scene.updateMatrixWorld(true); const ray = new THREE.Raycaster(); const meshes = []; scene.traverse(o => { if (o.isMesh && !o.userData.card) meshes.push(o); });
  scene.traverse(g => { if (g.userData && g.userData.char && g.visible) { const P = g.position; ray.set(new THREE.Vector3(P.x, P.y + .3, P.z), new THREE.Vector3(0, -1, 0)); ray.far = 3; out.push([g.userData.char, P.toArray().map(v => +v.toFixed(2)), ray.intersectObjects(meshes, false).slice(0, 4).map(h => [h.object.geometry.type, +h.point.y.toFixed(2), h.face ? +h.face.normal.y.toFixed(2) : null, h.object.material.side, h.object.visible])]); } });
  const hill = meshes.filter(m => m.geometry.type === 'BufferGeometry').map(m => { m.geometry.computeBoundingBox(); return [m.geometry.boundingBox.min.toArray(), m.geometry.boundingBox.max.toArray(), m.material.side, m.material.type, m.position.toArray(), m.parent && m.parent.position.toArray()]; }); return [out, hill]; };
