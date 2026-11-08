"""Fill a plate's missing area (outside the first scene's footprint) from the neighbouring WRS path, same season,
gain-matched per band on the overlap. usage: python3 -I tools/fill_path.py <project_dir> <name> <path>"""
import sys, os, io, json, time, datetime, urllib.request, urllib.parse
import numpy as np
sys.argv = sys.argv; D, NAME, PATH = sys.argv[1], sys.argv[2], sys.argv[3]
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fetch_landsat.py')).read().split("for n in (sys.argv[2:]")[0].replace("D = sys.argv[1];", "D = sys.argv[1] if False else D;"))
z = dict(np.load(f'{RAW}/{NAME}.npz', allow_pickle=False)); bb, dl, coll, plats, dt, bands = PLATES[NAME]
if z['valid'].mean() > .995: print('full already'); sys.exit()
body = {'collections': [coll], 'bbox': list(bb), 'datetime': dt, 'limit': 200, 'query': {'platform': {'in': plats}, 'eo:cloud_cover': {'lt': 10}, 'landsat:wrs_path': {'eq': PATH}, **({'landsat:wrs_row': {'eq': sys.argv[4]}} if len(sys.argv) > 4 else {})}}
feats = json.loads(http(STAC, json.dumps(body).encode()))['features']
target = datetime.date.fromisoformat(str(z['date']))
feats.sort(key=lambda f: (f['properties'].get('eo:cloud_cover', 99) > 2, abs((datetime.date.fromisoformat(f['properties']['datetime'][:10]) - target).days)))
f = feats[0]; print(NAME, 'fill from', f['id'], f['properties']['datetime'][:10])
H, W = z['valid'].shape; C = 1200; arr = np.zeros((len(bands) + 1, H, W), np.uint16); jobs = []
for cy in range(0, H, C):
    for cx in range(0, W, C):
        cw, ch = min(C, W - cx), min(C, H - cy); b2 = (bb[0] + cx * dl, bb[3] - (cy + ch) * dl, bb[0] + (cx + cw) * dl, bb[3] - cy * dl)
        qs = [('collection', coll), ('item', f['id'])] + [('assets', b) for b in bands]
        jobs.append((cx, cy, cw, ch, f"{DATA}/{b2[0]:.6f},{b2[1]:.6f},{b2[2]:.6f},{b2[3]:.6f}/{cw}x{ch}.npy?" + urllib.parse.urlencode(qs)))
for cx, cy, cw, ch, url in jobs:
    a = np.load(io.BytesIO(http(url)), allow_pickle=False); arr[:, cy:cy + ch, cx:cx + cw] = a[:len(bands) + 1]
    LOG.write(json.dumps({'plate': NAME, 'fill': f['id'], 'url': url, 'accessed': TODAY}) + '\n')
v2 = arr[-1] > 0; ov = z['valid'] & v2; need = ~z['valid'] & v2
b = z['bands'].astype(np.float32); b2 = arr[:-1].astype(np.float32)
for i in range(len(bands)):
    g = np.median(b[i][ov]) / max(1, np.median(b2[i][ov])); b[i][need] = b2[i][need] * g
z['bands'] = np.clip(b, 0, 65535).astype(np.uint16); z['valid'] = z['valid'] | v2; z['item'] = f"{z['item']} + {f['id']}"
np.savez_compressed(f'{RAW}/{NAME}.npz', **z); print('valid now', round(z['valid'].mean(), 4))
