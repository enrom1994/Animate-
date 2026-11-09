"""Display plates and the 3D terrain for the GERD film. Usage: <python with scipy> -I tools/plates.py
- res_<year>.jpg: the reservoir plates, ONE shared stretch for all years (from the 2025 plate) so the years compare fairly
- khartoum.jpg: the confluence, 13 Sep 2024
- dem_gorge.png (16-bit: R high byte, G low byte, decimetres) + gorge_terrain.jpg (Landsat 8, 9 Feb 2020, before filling)
  + gorge_water.png (where the reservoir is, from the 2026 mask, slightly grown: the water plane only shows there)"""
import json, numpy as np
from PIL import Image
from scipy import ndimage as nd
OUT = 'assets/plates'; info = {}; GAM = .95
def load(n):
    z = np.load(f'assets/raw/{n}.npz'); b = z['bands'].astype(np.float32) * 2.75e-5 - .2
    return np.stack([b[0], b[1], b[2]], -1), z['valid'], z
def save(n, c, v, lohi, z):
    out = np.stack([np.clip((c[..., i] - lohi[i][0]) / (lohi[i][1] - lohi[i][0]), 0, 1) for i in range(3)], -1)
    out = out ** GAM; L = out.mean(-1, keepdims=True); out = L + (out - L) * .8   # a touch less saturated: the analyst look
    out = np.maximum(np.clip(out, 0, 1), 3 / 255); out[~v] = 0
    Image.fromarray((out * 255).astype(np.uint8)).save(f'{OUT}/{n}.jpg', quality=92)
    info[n] = {'bbox': [float(x) for x in z['bbox']], 'item': str(z['item']), 'date': str(z['date'])}
    return out
c, v, z = load('res_2025'); lo, hi = np.percentile(c[v], [1, 99.6]); LH = [(lo, hi)] * 3   # one neutral stretch (all bands alike): no colour cast
for y in range(2020, 2027):
    c, v, z = load(f'res_{y}'); o = save(f'res_{y}', c, v, LH, z)
    if y == 2020: res2020 = o; bb20 = info['res_2020']['bbox']
c, v, z = load('khartoum_wide'); lo, hi = np.percentile(c[v], [1, 99.7]); GAM = 1.05; save('khartoum', c, v, [(lo, hi)] * 3, z); GAM = .95
# —— terrain ——
d = np.load('assets/raw/dem_gorge.npz'); Z = d['z']; bb = [float(x) for x in d['bbox']]; H, W = Z.shape
dm = np.clip(np.round(Z * 10), 0, 65535).astype(np.uint16)
Image.fromarray(np.stack([(dm >> 8).astype(np.uint8), (dm & 255).astype(np.uint8), np.zeros_like(dm, np.uint8)], -1)).save(f'{OUT}/dem_gorge.png')
dl = (bb20[2] - bb20[0]) / res2020.shape[1]
c0, c1 = int(round((bb[0] - bb20[0]) / dl)), int(round((bb[2] - bb20[0]) / dl)); r0, r1 = int(round((bb20[3] - bb[3]) / dl)), int(round((bb20[3] - bb[1]) / dl))
c, v, z = load('res_2020'); c = c[r0:r1, c0:c1]                      # its own stretch: the drape needs depth, not the time-lapse match
tex = np.stack([np.clip((c[..., i] - np.percentile(c[..., i], 1)) / (np.percentile(c[..., i], 99.5) - np.percentile(c[..., i], 1)), 0, 1) for i in range(3)], -1) ** 1.25
Image.fromarray((tex * 255).astype(np.uint8)).save(f'{OUT}/gorge_terrain.jpg', quality=93)
m = np.load('assets/raw/resmask_2026.npy')[r0:r1, c0:c1]; m = nd.binary_dilation(m, iterations=4)
Image.fromarray((m * 255).astype(np.uint8)).save(f'{OUT}/gorge_water.png')
json.dump({'gorge': {'bbox': bb, 'W': W, 'H': H, 'zmin': float(Z.min())}}, open(f'{OUT}/dem.json', 'w'), indent=1)
json.dump(info, open(f'{OUT}/plates.json', 'w'), indent=1); print('plates', list(info), 'dem', W, H, Z.min(), Z.max())
