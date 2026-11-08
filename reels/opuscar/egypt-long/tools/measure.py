"""Measurements on the plates shown in the film. Writes assets/measure.json. Methods:
- Cairo: vegetation = NDVI > 0.3 (Landsat 5 TM 1984-04-20/29, Landsat 8 OLI 2025-03-13/04-05, same season). Share of 1984 vegetation
  pixels that are not vegetation in 2025, over the whole plate (both valid).
- Rosetta: water = NIR < 34 DN for the 1972 MSS scene (sea 24-29, wet sand 35-60), MNDWI > 0 for 2025. Land area lost = land in 1972
  and water in 2025. Tip retreat = distance from the 1972 tip (land pixel farthest along the river axis) to the nearest 2025 land pixel.
- Toshka: water = MNDWI > 0.1, farmland = NDVI > 0.3, both valid, west of 31.35°E (Lake Nasser excluded).
usage: <python with scipy> -I tools/measure.py"""
import json, numpy as np
from scipy import ndimage as nd
def load(n):
    z = np.load(f'assets/raw/{n}.npz'); names = list(z['names']); b = z['bands'].astype(np.float32)
    if str(z['coll']).endswith('l2'): b = b * 2.75e-5 - 0.2
    return {k: b[i] for i, k in enumerate(names)}, z['valid'], [float(x) for x in z['bbox']], str(z['date'])
def kmpx(bb, W): return (bb[2] - bb[0]) / W * 111.32 * np.cos(np.radians((bb[1] + bb[3]) / 2))
ndvi = lambda B: (B['nir08'] - B['red']) / (B['nir08'] + B['red'] + 1e-6)
mndwi = lambda B: (B['green'] - B['swir16']) / (B['green'] + B['swir16'] + 1e-6)
out = {}
# —— Cairo ——
A, va, bb, da = load('cairo_1984'); B, vb, _, db = load('cairo_2025'); v = va & vb; k = kmpx(bb, va.shape[1])
g84 = (ndvi(A) > .3) & v; g25 = (ndvi(B) > .3) & v; lost = g84 & ~g25
out['cairo'] = {'dates': [da, db], 'green_1984_km2': float(g84.sum() * k * k), 'green_2025_km2': float(g25.sum() * k * k), 'lost_share_of_1984_green': float(lost.sum() / g84.sum()),
               'net_change_share': float(g25.sum() / g84.sum() - 1)}
# —— Rosetta ——
A, va, bb, da = load('rosetta_1973'); B, vb, _, db = load('rosetta_2025'); v = va & vb; H, W = va.shape; k = kmpx(bb, W)
nir = A['nir08'][va]; h, e = np.histogram(nir, 256); c = np.cumsum(h); m = np.cumsum(h * (e[:-1] + e[1:]) / 2)
var = [(m[i] / c[i] - (m[-1] - m[i]) / (c[-1] - c[i])) ** 2 * c[i] * (c[-1] - c[i]) if 0 < c[i] < c[-1] else 0 for i in range(256)]; thr = e[int(np.argmax(var))]
thr = 34.0   # open sea reads 24-29 in MSS NIR, wet sand and lagoon edges 35-60 (checked on the band, see FACTS.md); Otsu (~60) cut the spit off
land72 = nd.binary_opening((A['nir08'] > thr) & va, iterations=2); land25 = nd.binary_opening((mndwi(B) < 0) & vb, iterations=2)
for L in (land72, land25):   # keep the mainland (largest component); fill lagoons
    lab, n = nd.label(L); L[:] = nd.binary_fill_holes(lab == (np.argmax(np.bincount(lab.ravel())[1:]) + 1))
lostR = land72 & ~land25 & v; gainR = land25 & ~land72 & v
axis = np.array([-0.45, -0.89])   # river mouth points north-north-west (dx, dy in pixels, y down)
ys, xs = np.nonzero(land72 & v); proj = xs * axis[0] + ys * axis[1]; i = np.argmax(proj); tip = (int(xs[i]), int(ys[i]))
dist = nd.distance_transform_edt(~land25); r = float(dist[tip[1], tip[0]] * k)
ys2, xs2 = np.nonzero(land25); j = np.argmin((xs2 - tip[0]) ** 2 + (ys2 - tip[1]) ** 2); near = (int(xs2[j]), int(ys2[j]))
ll = lambda p: [bb[3] - (p[1] + .5) * (bb[3] - bb[1]) / H, bb[0] + (p[0] + .5) * (bb[2] - bb[0]) / W]
out['rosetta'] = {'dates': [da, db], 'nir_threshold': float(thr), 'land_lost_km2': float(lostR.sum() * k * k), 'land_gained_km2': float(gainR.sum() * k * k), 'tip_retreat_km': r,
                  'tip_1972': ll(tip), 'nearest_2025': ll(near)}
# —— Toshka ——
A, va, bb, da = load('toshka_2002'); B, vb, _, db = load('toshka_2021'); H, W = va.shape; k = kmpx(bb, W)
west = np.zeros_like(va); west[:, :int((31.35 - bb[0]) / (bb[2] - bb[0]) * W)] = True; v = va & vb & west
out['toshka'] = {'dates': [da, db], 'water_km2': [float(((mndwi(A) > .1) & v).sum() * k * k), float(((mndwi(B) > .1) & v).sum() * k * k)],
                 'farmland_km2': [float(((ndvi(A) > .3) & v).sum() * k * k), float(((ndvi(B) > .3) & v).sum() * k * k)], 'area_valid_km2': float(v.sum() * k * k)}
json.dump(out, open('assets/measure.json', 'w'), indent=1); print(json.dumps(out, indent=1))
np.save('assets/rosetta_masks.npy', np.stack([land72, land25]))

# —— Cairo, refined: fields that are now built over (not just bare or fallow) + overlays for the film ——
from PIL import Image
A, va, bb, _ = load('cairo_1984'); B, vb, _, _ = load('cairo_2025'); v = va & vb
g84 = (ndvi(A) > .3) & v; g25 = (ndvi(B) > .3) & v
ndbi = (B['swir16'] - B['nir08']) / (B['swir16'] + B['nir08'] + 1e-6); bright = (B['red'] + B['green'] + B['blue']) / 3
built = (ndvi(B) < .2) & (ndbi > 0) & (bright < .2)
lostb = g84 & ~g25 & built
out['cairo'].update({'built_over_share_of_1984_green': float(lostb.sum() / g84.sum()), 'built_over_in_blocks_share': float((nd.binary_opening(g84 & ~g25, iterations=3) & built).sum() / g84.sum()),
                     'built_rule': 'NDVI 2025 < 0.2, NDBI > 0, mean visible reflectance < 0.2'})
ov = np.zeros(lostb.shape + (4,), np.uint8); ov[lostb] = [235, 80, 60, 210]
Image.fromarray(ov).save('assets/plates/cairo_built_overlay.png')
L = np.load('assets/rosetta_masks.npy')[0]; edge = L & ~nd.binary_erosion(L, iterations=3)
ov = np.zeros(L.shape + (4,), np.uint8); ov[edge] = [242, 245, 246, 255]
Image.fromarray(ov).save('assets/plates/rosetta_1972_outline.png')
json.dump(out, open('assets/measure.json', 'w'), indent=1); print('cairo built over', round(out['cairo']['built_over_share_of_1984_green'], 3))
