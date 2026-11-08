"""NASADEM elevation (public domain, NASA/JPL) for a bbox, mosaicked from the 1-degree tiles via the Planetary Computer data API.
usage: python3 -I tools/fetch_dem.py <name> <w> <s> <e> <n> [deg_per_px=0.0005]   -> assets/raw/dem_<name>.npz (float32 metres)"""
import sys, io, json, time, math, datetime, urllib.request, urllib.parse
import numpy as np
name = sys.argv[1]; w, s, e, n = map(float, sys.argv[2:6]); dl = float(sys.argv[6]) if len(sys.argv) > 6 else .0005
STAC = 'https://planetarycomputer.microsoft.com/api/stac/v1/search'; DATA = 'https://planetarycomputer.microsoft.com/api/data/v1/item/bbox'
def http(url, data=None):
    for k in range(6):
        try:
            req = urllib.request.Request(url, data=data, headers={'User-Agent': 'animate-film/1.0', 'Content-Type': 'application/json'})
            return urllib.request.urlopen(req, timeout=240).read()
        except Exception:
            if k == 5: raise
            time.sleep(4 + 4 * k)
feats = json.loads(http(STAC, json.dumps({'collections': ['nasadem'], 'bbox': [w, s, e, n], 'limit': 50}).encode()))['features']
W, H = int(round((e - w) / dl)), int(round((n - s) / dl)); Z = np.full((H, W), np.nan, np.float32)
log = open('assets/raw/manifest.jsonl', 'a')
for f in feats:
    bw, bs, be, bn = f['bbox']; x0 = max(0, int(math.floor((bw - w) / dl))); x1 = min(W, int(math.ceil((be - w) / dl))); y0 = max(0, int(math.floor((n - bn) / dl))); y1 = min(H, int(math.ceil((n - bs) / dl)))
    if x1 <= x0 or y1 <= y0: continue
    for cy in range(y0, y1, 1200):
        for cx in range(x0, x1, 1200):
            cw, ch = min(1200, x1 - cx), min(1200, y1 - cy); bb = (w + cx * dl, n - (cy + ch) * dl, w + (cx + cw) * dl, n - cy * dl)
            url = f"{DATA}/{bb[0]:.6f},{bb[1]:.6f},{bb[2]:.6f},{bb[3]:.6f}/{cw}x{ch}.npy?" + urllib.parse.urlencode([('collection', 'nasadem'), ('item', f['id']), ('assets', 'elevation')])
            a = np.load(io.BytesIO(http(url)), allow_pickle=False); z = a[0].astype(np.float32); m = a[-1] > 0
            sub = Z[cy:cy + ch, cx:cx + cw]; sub[m] = z[m]
            log.write(json.dumps({'dem': name, 'item': f['id'], 'url': url, 'accessed': datetime.date.today().isoformat()}) + '\n')
Z = np.where(np.isnan(Z), np.nanmedian(Z), Z)
np.savez_compressed(f'assets/raw/dem_{name}.npz', z=Z, bbox=[w, s, e, n]); print(name, Z.shape, 'm', round(float(Z.min())), '..', round(float(Z.max())))
