// Toon renderer: flat-shaded 3D set + flat 2D characters, one ink-outline pass over both.
// Every frame is a function of time: window.renderAt(t).
import * as THREE from 'three';
import { SHOTS, CAPTIONS, DURATION } from './shots.js';
import { WARP } from './captions.js';
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
    px: { value: new THREE.Vector2(1 / W, 1 / H) }, ink: { value: new THREE.Color(INK) }, uVig: { value: .22 }, uBlur: { value: 0 }, uFocus: { value: 6 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
  fragmentShader: `
    uniform sampler2D tC, tN, tD; uniform float near, far, uVig, uBlur, uFocus; uniform vec2 px; uniform vec3 ink; varying vec2 vUv;
    float iz(vec2 u){ float d = texture2D(tD, u).x; float z = near * far / (far - d * (far - near)); return 1. / z; }   // 1/viewZ is linear on screen for a plane
    vec3 nm(vec2 u){ return texture2D(tN, u).xyz * 2. - 1.; }
    float edge(vec2 u, float r){
      vec2 o = px * r; float c = iz(u);
      float lap = abs(iz(u + vec2(o.x, 0.)) + iz(u - vec2(o.x, 0.)) + iz(u + vec2(0., o.y)) + iz(u - vec2(0., o.y)) - 4. * c) / c;
      vec3 n = nm(u); float dn = 0.;
      dn = max(dn, 1. - dot(n, nm(u + vec2(o.x, 0.)))); dn = max(dn, 1. - dot(n, nm(u - vec2(o.x, 0.))));
      dn = max(dn, 1. - dot(n, nm(u + vec2(0., o.y)))); dn = max(dn, 1. - dot(n, nm(u - vec2(0., o.y))));
      return max(smoothstep(.012, .03, lap), smoothstep(.25, .5, dn));
    }
    void main(){
      float z = 1. / iz(vUv), far01 = max(smoothstep(uFocus * 2.2, uFocus * 7., z) * .7, smoothstep(uFocus * .5, uFocus * .22, z) * 1.6) * uBlur;   // the background goes soft, the subject stays crisp
      vec3 c = vec3(0.); float n = 0.;
      for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) { vec2 o = vec2(float(i), float(j)) * px * 2.2 * far01; c += texture2D(tC, vUv + o).rgb; n += 1.; }
      c /= n;
      float e = 0.; for (int i = 0; i < 4; i++) { vec2 j = (vec2(mod(float(i), 2.), floor(float(i) / 2.)) - .5) * px * .5; e += max(edge(vUv + j, 1.6), edge(vUv + j, .8)); } e *= .25;
      e *= 1. - .75 * far01;                                                              // lines thin out with distance
      c = mix(c, ink, e);
      vec2 q = vUv - .5; q.x *= .5625; c *= 1. - uVig * smoothstep(.2, .65, length(q));
      gl_FragColor = vec4(c, 1.);
      #include <colorspace_fragment>
    }`, depthTest: false, depthWrite: false });
const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ink));

const capEl = document.getElementById('cap'), built = new Map();
const getShot = i => { if (!built.has(i)) built.set(i, SHOTS[i].build()); return built.get(i); };
window.DURATION = DURATION;
window.renderAt = t => {
  const tr = toRef(t); let idx = SHOTS.findIndex(s => tr >= s.start && tr < s.end); if (idx < 0) idx = SHOTS.length - 1;
  const shot = getShot(idx), r = shot.update(tr - SHOTS[idx].start, tr) || {}, cam = shot.camera, scene = shot.scene;
  cam.aspect = W / H; cam.updateProjectionMatrix();
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setRenderTarget(rtColor); renderer.render(scene, cam);
  const swap = []; scene.traverse(o => { if (o.isMesh) { swap.push([o, o.material]); o.material = o.userData.nmat || NORMAL; if (o.userData.noInk) o.visible = false; } });
  const bg = scene.background; scene.background = null; renderer.setClearColor(0x8080ff, 1);
  renderer.setRenderTarget(rtNorm); renderer.render(scene, cam);
  for (const [o, m] of swap) { o.material = m; o.visible = true; } scene.background = bg;
  ink.uniforms.near.value = cam.near; ink.uniforms.far.value = cam.far; ink.uniforms.uBlur.value = r.blur ?? 1; ink.uniforms.uFocus.value = r.focus ?? 6;
  renderer.setRenderTarget(null); renderer.render(quadScene, quadCam);
  const c = CAPTIONS.filter(c => t >= c[0]).pop(); capEl.innerHTML = c && (c[2] == null || t < c[2]) ? c[1] : '';
  return idx;
};
const qs = new URLSearchParams(location.search);
window.ready = document.fonts.load("800 54px Cap").then(() => true);
if (qs.has('t')) window.ready.then(() => window.renderAt(parseFloat(qs.get('t'))));
