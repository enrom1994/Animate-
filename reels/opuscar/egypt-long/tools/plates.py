"""Display plates from the raw Landsat arrays: true colour (L2 surface reflectance) or, for the 1972 MSS scene (no blue band),
a natural-looking composite from green/red/NIR. Stretch is shared by each before/after pair so they compare fairly.
usage: <python> -I tools/plates.py <project_dir>  → assets/plates/<name>.jpg + plates.json"""
import sys, os, json, numpy as np
from PIL import Image
D = sys.argv[1]; RAW = f'{D}/assets/raw'; OUT = f'{D}/assets/plates'; os.makedirs(OUT, exist_ok=True)
def load(n):
    z = np.load(f'{RAW}/{n}.npz'); names = list(z['names']); b = z['bands'].astype(np.float32)
    if str(z['coll']).endswith('l2'): b = b * 2.75e-5 - 0.2
    else: b = b / 255.0 * 0.6                                   # MSS L1 DN (8-bit scaled): rough reflectance
    return {k: b[i] for i, k in enumerate(names)}, z['valid'], z
def rgb(B):
    if 'blue' in B: return np.stack([B['red'], B['green'], B['blue']], -1)
    return np.stack([B['red'], B['green'] * .9 + B['nir08'] * .1, B['green'] * .85], -1)   # MSS: synthetic natural colour
info = {}
for pair in [('cairo_1984', 'cairo_2025'), ('capital_2015', 'capital_2025'), ('rosetta_1973', 'rosetta_2025'), ('toshka_2002', 'toshka_2021')]:
    for n in pair:
        B, v, z = load(n); c = rgb(B)
        out = np.zeros_like(c)
        for i in range(3): lo, hi = np.percentile(c[..., i][v], [0.5, 99.5]); out[..., i] = np.clip((c[..., i] - lo) / (hi - lo + 1e-6), 0, 1)
        if not str(z['coll']).endswith('l2'):   # old MSS scenes: trim the scan edge (it carries a red fringe)
            from scipy.ndimage import binary_erosion; v = binary_erosion(v, iterations=16)
        out = np.maximum(out ** .85, 3 / 255); out[~v] = 0     # valid pixels never pure black: black means no data
        Image.fromarray((out * 255).astype(np.uint8)).save(f'{OUT}/{n}.jpg', quality=92)
        info[n] = {'bbox': [float(x) for x in z['bbox']], 'item': str(z['item']), 'date': str(z['date'])}
json.dump(info, open(f'{OUT}/plates.json', 'w'), indent=1); print('plates', list(info))
