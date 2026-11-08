// 3D terrain shots: NASADEM heights (public domain) as a mesh, the Landsat plate draped on it, a low sun for relief,
// warm haze and a sky gradient. Coordinates in km on the plate: x east from the west edge, y north from the south edge.
import * as THREE from '/node_modules/three/build/three.module.js';
export function makeTerrain(canvas, { heightImg, texImg, meta, exag = 3, W = 1920, H = 1080 }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H, false); renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = THREE.SRGBColorSpace;
  const [w, s, e, n] = meta.bbox, kx = 111.32 * Math.cos((s + n) / 2 * Math.PI / 180), ky = 110.6;
  const wk = (e - w) * kx, hk = (n - s) * ky;
  // heights from the 16-bit PNG (R high byte, G low byte, decimetres)
  const c = document.createElement('canvas'); c.width = meta.W; c.height = meta.H; const g = c.getContext('2d'); g.drawImage(heightImg, 0, 0);
  const px = g.getImageData(0, 0, meta.W, meta.H).data;
  const Z = new Float32Array(meta.W * meta.H); for (let i = 0; i < Z.length; i++) Z[i] = (px[i * 4] * 256 + px[i * 4 + 1]) / 10 / 1000;   // km
  const geo = new THREE.PlaneGeometry(wk, hk, meta.W - 1, meta.H - 1); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) pos.setY(i, Z[i] * exag); geo.computeVertexNormals();
  const tex = new THREE.Texture(texImg); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.needsUpdate = true;
  const scene = new THREE.Scene();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 })); scene.add(mesh);
  const sun = new THREE.DirectionalLight(0xffe2b8, 2.6); scene.add(sun); scene.add(sun.target);
  scene.add(new THREE.HemisphereLight(0xbfd8ff, 0x8a6a48, .75));
  const sky = document.createElement('canvas'); sky.width = 4; sky.height = 512; const sg = sky.getContext('2d');
  const gr = sg.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#5f86b5'); gr.addColorStop(.55, '#c9d6de'); gr.addColorStop(1, '#ead9bf'); sg.fillStyle = gr; sg.fillRect(0, 0, 4, 512);
  scene.background = new THREE.CanvasTexture(sky); scene.background.colorSpace = THREE.SRGBColorSpace;
  scene.fog = new THREE.Fog(0xdcd2c0, 6, 60);
  const cam = new THREE.PerspectiveCamera(42, W / H, .05, 400);
  const P = (x, y, h) => new THREE.Vector3(x - wk / 2, h, -(y - hk / 2));
  const heightAt = (x, y) => { const i = Math.round(x / wk * (meta.W - 1)), j = Math.round((1 - y / hk) * (meta.H - 1)); return Z[Math.max(0, Math.min(meta.H - 1, j)) * meta.W + Math.max(0, Math.min(meta.W - 1, i))] * exag; };
  return {
    wk, hk, heightAt,
    toKm: (lat, lon) => [(lon - w) * kx, (lat - s) * ky],
    // view: { x, y, h (km above ground), tx, ty, th (target, km above ground), sunAz, sunEl, fov, haze }
    render(v) {
      const ground = heightAt(v.x, v.y), tg = heightAt(v.tx, v.ty);
      cam.position.copy(P(v.x, v.y, ground + v.h)); cam.lookAt(P(v.tx, v.ty, tg + (v.th ?? 0))); cam.fov = v.fov ?? 42; cam.updateProjectionMatrix();
      const az = (v.sunAz ?? 250) * Math.PI / 180, el = (v.sunEl ?? 18) * Math.PI / 180;
      sun.position.copy(P(wk / 2 + Math.sin(az) * Math.cos(el) * 100, hk / 2 + Math.cos(az) * Math.cos(el) * 100, Math.sin(el) * 100)); sun.target.position.copy(P(wk / 2, hk / 2, 0));
      scene.fog.far = v.haze ?? 60;
      renderer.render(scene, cam);
    },
  };
}
