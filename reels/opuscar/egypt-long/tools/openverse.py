"""Openverse photo helper (api.openverse.org): only licences safe for a monetised video without share-alike:
CC0, Public Domain Mark, CC BY (attribution required: kept in assets/media/<name>.json and CREDITS).
  python3 -I tools/openverse.py search "aswan high dam" [--count 12]
  python3 -I tools/openverse.py fetch <openverse id> <name>          -> assets/media/<name>.jpg (+ .json: title, creator, licence, source page)"""
import sys, os, json, time, urllib.request, urllib.parse
API = 'https://api.openverse.org/v1/images/'
UA = {'User-Agent': 'animate-film/1.0 (documentary video; images credited per licence)'}
SAFE = 'cc0,pdm,by'
def get(url, raw=False):
    for k in range(5):
        try:
            b = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()
            return b if raw else json.loads(b)
        except Exception as e:
            if k == 4: raise
            time.sleep(3 + 4 * k)
cmd = sys.argv[1]
if cmd == 'search':
    q = sys.argv[2]; n = int(sys.argv[sys.argv.index('--count') + 1]) if '--count' in sys.argv else 12
    d = get(API + '?' + urllib.parse.urlencode({'q': q, 'license': SAFE, 'page_size': n, 'size': 'large'}))
    print(d.get('result_count'), 'results')
    for r in d.get('results', []):
        print(f"{r['id']} | {r['license']} {r.get('license_version') or ''} | {(r.get('title') or '')[:60]} | {(r.get('creator') or '?')[:24]} | {r.get('width')}x{r.get('height')}")
elif cmd == 'fetch':
    oid, name = sys.argv[2], sys.argv[3]
    r = get(API + oid + '/')
    assert r['license'] in SAFE.split(','), f"licence {r['license']} not allowed"
    os.makedirs('assets/media', exist_ok=True)
    url = r['url']
    if 'upload.wikimedia.org/wikipedia/commons/' in url and '/thumb/' not in url:   # Wikimedia asks tools to use its standard thumbnail sizes
        head, tail = url.split('/wikipedia/commons/'); fn = tail.split('/')[-1]
        url = f"{head}/wikipedia/commons/thumb/{tail}/1920px-{fn}" + ('.jpg' if fn.lower().endswith(('.tif', '.tiff')) else '')
    time.sleep(2)
    data = get(url, raw=True); open(f"assets/media/{name}.jpg", "wb").write(data)
    meta = {k: r.get(k) for k in ('id', 'title', 'creator', 'creator_url', 'license', 'license_version', 'license_url', 'foreign_landing_url', 'url', 'source', 'attribution')}
    json.dump(meta, open(f'assets/media/{name}.json', 'w'), indent=1)
    print('saved', name, r['license'], r.get('license_version'), '|', r.get('title'), '|', r.get('creator'))
