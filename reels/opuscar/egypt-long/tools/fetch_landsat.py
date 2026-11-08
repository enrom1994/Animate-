"""Before/after Landsat plates (public domain, USGS) via the Microsoft Planetary Computer STAC + data API.
One clear scene per plate, chosen by cloud cover and season; bands red/green/blue (+ nir08, swir16 for measurement).
usage: python3 -I tools/fetch_landsat.py <project_dir> [name ...]     → assets/raw/<name>.npz ; requests → manifest.jsonl"""
import sys, os, io, json, time, datetime, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
import numpy as np
D = sys.argv[1]; RAW = os.path.join(D, 'assets/raw'); os.makedirs(RAW, exist_ok=True)
LOG = open(os.path.join(RAW, 'manifest.jsonl'), 'a'); TODAY = datetime.date.today().isoformat()
STAC = 'https://planetarycomputer.microsoft.com/api/stac/v1/search'; DATA = 'https://planetarycomputer.microsoft.com/api/data/v1/item/bbox'
L2 = ['red', 'green', 'blue', 'nir08', 'swir16']; MSS = ['red', 'green', 'nir08']
PLATES = {   # name: bbox (w, s, e, n), degrees per pixel, collection, platforms, date window
  'cairo_1984': ((30.95, 29.85, 31.55, 30.25), .0003, 'landsat-c2-l2', ['landsat-5'], '1984-01-15/1985-04-30', L2),
  'cairo_2025': ((30.95, 29.85, 31.55, 30.25), .0003, 'landsat-c2-l2', ['landsat-8', 'landsat-9'], '2025-01-15/2025-04-30', L2),
  'capital_2015': ((31.60, 29.93, 31.90, 30.10), .0003, 'landsat-c2-l2', ['landsat-8'], '2015-01-01/2015-12-31', L2),
  'capital_2025': ((31.60, 29.93, 31.90, 30.10), .0003, 'landsat-c2-l2', ['landsat-8', 'landsat-9'], '2025-01-01/2025-10-31', L2),
  'rosetta_1973': ((30.20, 31.36, 30.50, 31.56), .0003, 'landsat-c2-l1', ['landsat-1'], '1972-08-01/1973-12-31', MSS),
  'rosetta_2025': ((30.20, 31.36, 30.50, 31.56), .0003, 'landsat-c2-l2', ['landsat-8', 'landsat-9'], '2025-01-01/2025-10-31', L2),
  'toshka_2002': ((30.40, 22.55, 31.70, 23.45), .0006, 'landsat-c2-l2', ['landsat-7'], '2001-10-01/2002-12-31', L2),
  'aswan_2025': ((32.78, 23.88, 33.05, 24.12), .0003, 'landsat-c2-l2', ['landsat-8', 'landsat-9'], '2025-01-01/2025-10-31', L2),
  'toshka_2021': ((30.40, 22.55, 31.70, 23.45), .0006, 'landsat-c2-l2', ['landsat-8'], '2021-01-01/2021-12-31', L2),
}
def http(url, data=None):
    for k in range(6):
        try:
            req = urllib.request.Request(url, data=data, headers={'User-Agent': 'animate-film/1.0', 'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=240) as r: return r.read()
        except Exception as e:
            if k == 5: raise
            time.sleep(4 + 4 * k)
def fetch(name):
    dst = os.path.join(RAW, name + '.npz')
    if os.path.exists(dst): print('cached', name); return
    bb, dl, coll, plats, dt, bands = PLATES[name]
    body = {'collections': [coll], 'bbox': list(bb), 'datetime': dt, 'limit': 200, 'query': {'platform': {'in': plats}, 'eo:cloud_cover': {'lt': 10}}}
    feats = json.loads(http(STAC, json.dumps(body).encode()))['features']
    def cover(f): w, s, e, n = f['bbox']; return max(0, min(e, bb[2]) - max(w, bb[0])) * max(0, min(n, bb[3]) - max(s, bb[1])) / ((bb[2] - bb[0]) * (bb[3] - bb[1]))
    feats = [f for f in feats if cover(f) > .97] or sorted(feats, key=lambda f: -cover(f))[:5]
    feats.sort(key=lambda f: (f['properties'].get('eo:cloud_cover', 99), f['properties']['datetime']))
    f = feats[0]; print(name, f['id'], f['properties']['datetime'][:10], 'cloud', f['properties'].get('eo:cloud_cover'), 'cover', round(cover(f), 3))
    W = int(round((bb[2] - bb[0]) / dl)); H = int(round((bb[3] - bb[1]) / dl)); C = 1200
    arr = np.zeros((len(bands) + 1, H, W), np.uint16); jobs = []
    for cy in range(0, H, C):
        for cx in range(0, W, C):
            cw, ch = min(C, W - cx), min(C, H - cy)
            b2 = (bb[0] + cx * dl, bb[3] - (cy + ch) * dl, bb[0] + (cx + cw) * dl, bb[3] - cy * dl)
            qs = [('collection', coll), ('item', f['id'])] + [('assets', b) for b in bands] + ([('resampling', 'nearest')] if coll.endswith('l1') else [])
            jobs.append((cx, cy, cw, ch, f"{DATA}/{b2[0]:.6f},{b2[1]:.6f},{b2[2]:.6f},{b2[3]:.6f}/{cw}x{ch}.npy?" + urllib.parse.urlencode(qs)))
    with ThreadPoolExecutor(4) as ex:
        for (cx, cy, cw, ch, url), raw in zip(jobs, ex.map(lambda j: http(j[4]), jobs)):
            a = np.load(io.BytesIO(raw), allow_pickle=False); arr[:, cy:cy + ch, cx:cx + cw] = a[:len(bands) + 1]
            LOG.write(json.dumps({'plate': name, 'item': f['id'], 'url': url, 'accessed': TODAY}) + '\n'); LOG.flush()
    np.savez_compressed(dst, bands=arr[:-1], valid=arr[-1] > 0, names=bands, bbox=bb, item=f['id'], date=f['properties']['datetime'][:10], coll=coll)
for n in (sys.argv[2:] or PLATES): fetch(n)
