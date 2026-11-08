"""Plates for the shader from the raw downloads: Landsat true colour (per-band stretch, gentle gamma) + GIBS copies.
usage: python3 -I tools/plates.py <project_dir>"""
import sys, os, json, numpy as np
from PIL import Image
D = sys.argv[1]; os.makedirs(f'{D}/assets/plates', exist_ok=True)
d = np.load(f'{D}/assets/raw/qena.npz'); rgb = d['rgb'].astype(np.float32) * 2.75e-5 - 0.2; v = d['valid']
out = np.zeros(rgb.shape[1:] + (3,), np.float32)
for i in range(3):
    b = rgb[i]; lo, hi = np.percentile(b[v], [0.5, 99.6]); out[..., i] = np.clip((b - lo) / (hi - lo), 0, 1)
out = out ** 0.8; out[~v] = 0
Image.fromarray((out * 255).astype(np.uint8)).save(f'{D}/assets/plates/qena.jpg', quality=92)
for n in ['egypt_day', 'egypt_night', 'world_day', 'world_night']: Image.open(f'{D}/assets/raw/{n}.jpg').save(f'{D}/assets/plates/{n}.jpg', quality=92)
json.dump({'qena': {'bbox': [float(x) for x in d['bbox']], 'item': str(d['item']), 'date': str(d['date'])}}, open(f'{D}/assets/plates/plates.json', 'w')); print('plates ok')
