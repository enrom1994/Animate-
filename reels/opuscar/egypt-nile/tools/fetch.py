"""Imagery for the film (all public domain): NASA GIBS Blue Marble NG (day) and VIIRS Black Marble 2016 (night)
for the world and Egypt; one Landsat Collection 2 Level-2 scene (USGS) of the Nile valley near Qena, via the
Microsoft Planetary Computer STAC + data API. Every request goes to assets/raw/manifest.jsonl.
usage: python3 -I tools/fetch.py <project_dir>"""
import sys, os, io, json, time, math, datetime, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image
D = sys.argv[1]; RAW = os.path.join(D, 'assets/raw'); os.makedirs(RAW, exist_ok=True)
LOG = open(os.path.join(RAW, 'manifest.jsonl'), 'a'); TODAY = datetime.date.today().isoformat()
def http(url, data=None):
    for k in range(5):
        try:
            req = urllib.request.Request(url, data=data, headers={'User-Agent': 'animate-film/1.0', 'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=180) as r: return r.read()
        except Exception:
            if k == 4: raise
            time.sleep(3 + 3 * k)
WMS = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi'
def gibs(name, layer, w, s, e, n, W, H, T=1024):
    dst = os.path.join(RAW, name + '.jpg')
    if os.path.exists(dst): return
    img = Image.new('RGB', (W, H)); jobs = []
    for ty in range(0, H, T):
        for tx in range(0, W, T):
            tw, th = min(T, W - tx), min(T, H - ty)
            bw = w + (e - w) * tx / W; be = w + (e - w) * (tx + tw) / W; bn = n - (n - s) * ty / H; bs = n - (n - s) * (ty + th) / H
            url = f'{WMS}?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS={layer}&STYLES=&CRS=EPSG:4326&BBOX={bs:.6f},{bw:.6f},{bn:.6f},{be:.6f}&WIDTH={tw}&HEIGHT={th}&FORMAT=image/jpeg'
            jobs.append((tx, ty, url))
    with ThreadPoolExecutor(6) as ex:
        for (tx, ty, url), raw in zip(jobs, ex.map(lambda j: http(j[2]), jobs)):
            img.paste(Image.open(io.BytesIO(raw)).convert('RGB'), (tx, ty)); LOG.write(json.dumps({'asset': name, 'url': url, 'accessed': TODAY}) + '\n')
    img.save(dst, quality=93); print('gibs', name, W, H)
EG = (24.0, 21.0, 37.0, 32.5)        # Egypt and its seas (no borders are drawn)
gibs('world_day', 'BlueMarble_NextGeneration', -180, -90, 180, 90, 8192, 4096)
gibs('world_night', 'VIIRS_Black_Marble', -180, -90, 180, 90, 8192, 4096)
gibs('egypt_day', 'BlueMarble_NextGeneration', *EG, 3120, 2760)
gibs('egypt_night', 'VIIRS_Black_Marble', *EG, 3120, 2760)
# —— Landsat detail: the valley near Qena (the river's big bend) ——
STAC = 'https://planetarycomputer.microsoft.com/api/stac/v1/search'
DATA = 'https://planetarycomputer.microsoft.com/api/data/v1/item/bbox'
BB = (32.30, 25.70, 33.05, 26.35); DL = 0.0003
dst = os.path.join(RAW, 'qena.npz')
if not os.path.exists(dst):
    body = {'collections': ['landsat-c2-l2'], 'bbox': list(BB), 'datetime': '2024-01-01/2025-12-31', 'limit': 100, 'query': {'eo:cloud_cover': {'lt': 3}, 'platform': {'in': ['landsat-8', 'landsat-9']}}}
    feats = json.loads(http(STAC, json.dumps(body).encode()))['features']
    def cover(f): bw, bs, be, bn = f['bbox']; return max(0, min(be, BB[2]) - max(bw, BB[0])) * max(0, min(bn, BB[3]) - max(bs, BB[1]))
    feats.sort(key=lambda f: (-round(cover(f) / ((BB[2] - BB[0]) * (BB[3] - BB[1])), 2), f['properties']['eo:cloud_cover']))
    f = feats[0]; print('landsat', f['id'], f['properties']['datetime'][:10], f['properties']['eo:cloud_cover'])
    W = int(round((BB[2] - BB[0]) / DL)); H = int(round((BB[3] - BB[1]) / DL)); C = 1200
    arr = np.zeros((4, H, W), np.uint16); jobs = []
    for cy in range(0, H, C):
        for cx in range(0, W, C):
            cw, ch = min(C, W - cx), min(C, H - cy)
            bb = (BB[0] + cx * DL, BB[3] - (cy + ch) * DL, BB[0] + (cx + cw) * DL, BB[3] - cy * DL)
            qs = [('collection', 'landsat-c2-l2'), ('item', f['id']), ('assets', 'red'), ('assets', 'green'), ('assets', 'blue')]
            jobs.append((cx, cy, cw, ch, f"{DATA}/{bb[0]:.6f},{bb[1]:.6f},{bb[2]:.6f},{bb[3]:.6f}/{cw}x{ch}.npy?" + urllib.parse.urlencode(qs)))
    with ThreadPoolExecutor(4) as ex:
        for (cx, cy, cw, ch, url), raw in zip(jobs, ex.map(lambda j: http(j[4]), jobs)):
            a = np.load(io.BytesIO(raw), allow_pickle=False); arr[:, cy:cy + ch, cx:cx + cw] = a[:4]
            LOG.write(json.dumps({'asset': 'qena', 'item': f['id'], 'url': url, 'accessed': TODAY}) + '\n')
    np.savez_compressed(dst, rgb=arr[:3], valid=arr[3] > 0, bbox=BB, item=f['id'], date=f['properties']['datetime'][:10])
print('done')
