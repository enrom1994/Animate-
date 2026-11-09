"""Reservoir area per year, measured on the plates shown (Landsat C2 L2, path 171, dry season).
Water = MNDWI > 0 (green vs SWIR1), both valid; the reservoir = the connected water body that touches the dam
(11.215°N 35.093°E, Wikipedia), so ponds and other rivers do not count. Pixel area from the plate grid (.0005°).
usage: <python with scipy> -I tools/measure.py  → assets/measure.json"""
import json, numpy as np
from scipy import ndimage as nd
out = {}
for y in range(2020, 2027):
    z = np.load(f'assets/raw/res_{y}.npz'); b = z['bands'].astype(np.float32) * 2.75e-5 - .2; v = z['valid']; bb = [float(x) for x in z['bbox']]
    H, W = v.shape; dl = (bb[2] - bb[0]) / W; lat = np.linspace(bb[3], bb[1], H)[:, None]
    px = (dl * 111.32 * np.cos(np.radians(lat))) * (dl * 110.6) * np.ones((1, W))
    wet = (b[1] - b[4]) / (b[1] + b[4] + 1e-6) > 0
    wet = nd.binary_opening(wet & v, iterations=1)
    lab, n = nd.label(wet); i = int((bb[3] - 11.200) / dl); j = int((35.085 - bb[0]) / dl)   # just upstream of the dam
    win = lab[i - 30:i + 30, j - 30:j + 30]; ids = np.bincount(win[win > 0])
    res = lab == ids.argmax() if ids.size else np.zeros_like(wet)
    out[y] = {'date': str(z['date']), 'item': str(z['item']), 'km2': round(float(px[res].sum()), 1), 'edge_touch': bool((res & ~nd.binary_erosion(v, iterations=3)).any())}
    np.save(f'assets/raw/resmask_{y}.npy', res)
    print(y, out[y])
json.dump(out, open('assets/measure.json', 'w'), indent=1)
