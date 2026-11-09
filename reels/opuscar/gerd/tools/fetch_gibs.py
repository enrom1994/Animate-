"""Regional plates for the Nile basin film (public domain): NASA GIBS Blue Marble NG (day) and VIIRS Black Marble 2016 (night),
Lake Victoria to the Mediterranean. Every request goes to assets/raw/manifest.jsonl.
usage: python3 -I tools/fetch_gibs.py"""
import sys, os, io, json, time, math, datetime, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image
D = sys.argv[1] if len(sys.argv) > 1 else '.'; RAW = os.path.join(D, 'assets/raw'); os.makedirs(RAW, exist_ok=True)
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
BASIN = (22.0, -4.0, 46.0, 32.5)     # the Nile basin: Lake Victoria to the Mediterranean (no borders are drawn)
gibs('basin_day', 'BlueMarble_NextGeneration', *BASIN, 2700, 4106)
gibs('basin_night', 'VIIRS_Black_Marble', *BASIN, 2700, 4106)
print('done')
