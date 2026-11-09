"""Landsat C2 L2 plates that need more than one scene: all rows of one WRS path on the SAME day (same sun, same water level),
mosaicked on the valid masks. Via the Microsoft Planetary Computer STAC + data API (public domain, USGS).
usage: python3 -I tools/fetch_mosaic.py <name> <w> <s> <e> <n> <deg_per_px> <date window a/b> <path> [platforms=landsat-8,landsat-9]
  → assets/raw/<name>.npz (bands red green blue nir08 swir16, valid, items, date); requests → assets/raw/manifest.jsonl"""
import sys, os, io, json, time, datetime, urllib.request, urllib.parse
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
import numpy as np
name = sys.argv[1]; bb = tuple(map(float, sys.argv[2:6])); dl = float(sys.argv[6]); dt = sys.argv[7]; path = sys.argv[8]
plats = (sys.argv[9] if len(sys.argv) > 9 else 'landsat-8,landsat-9').split(',')
RAW = 'assets/raw'; os.makedirs(RAW, exist_ok=True); LOG = open(f'{RAW}/manifest.jsonl', 'a'); TODAY = datetime.date.today().isoformat()
STAC = 'https://planetarycomputer.microsoft.com/api/stac/v1/search'; DATA = 'https://planetarycomputer.microsoft.com/api/data/v1/item/bbox'
B = ['red', 'green', 'blue', 'nir08', 'swir16']; C = 1200
def http(url, data=None):
    for k in range(6):
        try: return urllib.request.urlopen(urllib.request.Request(url, data=data, headers={'User-Agent': 'animate-film/1.0', 'Content-Type': 'application/json'}), timeout=240).read()
        except Exception:
            if k == 5: raise
            time.sleep(4 + 4 * k)
body = {'collections': ['landsat-c2-l2'], 'bbox': list(bb), 'datetime': dt, 'limit': 300, 'query': {'platform': {'in': plats}, 'eo:cloud_cover': {'lt': 20}, 'landsat:wrs_path': {'eq': path}}}
days = defaultdict(list)
for f in json.loads(http(STAC, json.dumps(body).encode()))['features']: days[f['properties']['datetime'][:10]].append(f)
def cover(fs):   # share of the bbox inside the union of footprints (rough: bbox of each)
    g = np.zeros((50, 50), bool); ys, xs = np.mgrid[0:50, 0:50]; lon = bb[0] + (xs + .5) / 50 * (bb[2] - bb[0]); lat = bb[3] - (ys + .5) / 50 * (bb[3] - bb[1])
    for f in fs: w, s, e, n = f['bbox']; g |= (lon > w + .15) & (lon < e - .15) & (lat > s + .05) & (lat < n - .05)
    return g.mean()
cands = sorted(days.items(), key=lambda kv: (-round(cover(kv[1]) * 20), max(f['properties']['eo:cloud_cover'] for f in kv[1]), kv[0]))
day, fs = cands[0]; print(name, day, [(f['id'], f['properties']['eo:cloud_cover']) for f in fs], 'cover', round(cover(fs), 3))
W = int(round((bb[2] - bb[0]) / dl)); H = int(round((bb[3] - bb[1]) / dl))
out = np.zeros((len(B), H, W), np.uint16); valid = np.zeros((H, W), bool)
for f in sorted(fs, key=lambda f: -f['properties']['eo:cloud_cover']):    # clearest scene last, so it wins the overlap
    jobs = []
    for cy in range(0, H, C):
        for cx in range(0, W, C):
            cw, ch = min(C, W - cx), min(C, H - cy); b2 = (bb[0] + cx * dl, bb[3] - (cy + ch) * dl, bb[0] + (cx + cw) * dl, bb[3] - cy * dl)
            qs = [('collection', 'landsat-c2-l2'), ('item', f['id'])] + [('assets', b) for b in B]
            jobs.append((cx, cy, cw, ch, f"{DATA}/{b2[0]:.6f},{b2[1]:.6f},{b2[2]:.6f},{b2[3]:.6f}/{cw}x{ch}.npy?" + urllib.parse.urlencode(qs)))
    with ThreadPoolExecutor(4) as ex:
        for (cx, cy, cw, ch, url), raw in zip(jobs, ex.map(lambda j: http(j[4]), jobs)):
            a = np.load(io.BytesIO(raw), allow_pickle=False); v = a[len(B)] > 0
            sl = (slice(cy, cy + ch), slice(cx, cx + cw)); o = out[(slice(None),) + sl]; o[:, v] = a[:len(B)][:, v]; valid[sl] |= v
            LOG.write(json.dumps({'plate': name, 'item': f['id'], 'url': url, 'accessed': TODAY}) + '\n'); LOG.flush()
np.savez_compressed(f'{RAW}/{name}.npz', bands=out, valid=valid, names=B, bbox=bb, item=','.join(f['id'] for f in fs), date=day, coll='landsat-c2-l2')
print('saved', name, W, 'x', H, 'valid', round(valid.mean(), 3))
