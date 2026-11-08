"""Measure the green (cultivated + settled) strip across the Nile valley on the Landsat plate shown in the film.
Method: mean reflectance smoothed over ~0.75 km; the valley floor (fields, villages, river) is < 0.18, the desert
around it 0.25-0.32. On each east-west transect through the north-south reach of the bend we take the run below the
threshold that contains the river, and report its width. Writes assets/measure.json.
usage: <lemo venv python> -I tools/measure.py   (needs scipy)"""
import json, numpy as np
from scipy.ndimage import uniform_filter
d = np.load('assets/raw/qena.npz'); r, g, b = d['rgb'].astype(np.float32) * 2.75e-5 - 0.2
w, s, e, n = [float(x) for x in d['bbox']]; H, W = r.shape; dl = (e - w) / W
km_px = dl * 111.32 * np.cos(np.radians((s + n) / 2))
br = uniform_filter((r + g + b) / 3, 25); raw = (r + g + b) / 3
res = []
for y in range(int(H * .45), int(H * .97), 8):
    x0 = int(W * .5); seg = raw[y, x0:]
    xr = x0 + int(np.argmin(uniform_filter(seg, 9)))          # the river: the darkest point
    if raw[y, xr] > .06: continue
    a = xr; bb = xr
    while a > 0 and br[y, a - 1] < .18: a -= 1
    while bb < W - 1 and br[y, bb + 1] < .18: bb += 1
    if a <= 2 or bb >= W - 3: continue                          # strip leaves the plate: no reading
    res.append((y, a, bb, (bb - a) * km_px))
ws = np.array([q[3] for q in res]); i = int(np.argmin(ws)); y, a, bb, km = res[i]
out = {'item': str(d['item']), 'date': str(d['date']), 'method': 'smoothed reflectance < 0.18, run containing the river, E-W transects', 'km_per_px': km_px,
       'transects': len(res), 'median_km': float(np.median(ws)), 'max_km': float(ws.max()), 'min_km': float(km),
       'min_line': {'lat': float(n - (y + .5) * dl), 'lon0': float(w + a * dl), 'lon1': float(w + bb * dl)}, 'px': [int(y), int(a), int(bb)]}
json.dump(out, open('assets/measure.json', 'w'), indent=1); print(json.dumps(out, indent=1))
