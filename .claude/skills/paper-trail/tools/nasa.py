"""NASA Image and Video Library (images.nasa.gov) helper. NASA media is generally not copyrighted (US government work);
do not use NASA logos/insignia as branding or imply NASA endorses the channel. Run fetch from the reel folder.
  nasa.py search "apollo 13 splashdown" [--video] [--count 15]
  nasa.py fetch <nasa_id> <name>     -> assets/<name>.jpg (or .mp4 for a video) + assets/<name>.json (source, credit)"""
import json, os, sys, time, urllib.parse, urllib.request
UA = {"User-Agent": "paper-trail/0.1"}
def get(url, raw=False, tries=5):
    for k in range(tries):
        try:
            b = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=180).read()
            return b if raw else json.loads(b)
        except Exception as e:
            if k == tries - 1: raise
            print(f"  retry {k + 1} ({e})", file=sys.stderr); time.sleep(2 ** (k + 1))
def arg(flag, default=None): return sys.argv[sys.argv.index(flag) + 1] if flag in sys.argv else default

def search(q):
    mt = "video" if "--video" in sys.argv else "image"
    d = get("https://images-api.nasa.gov/search?" + urllib.parse.urlencode({"q": q, "media_type": mt}))["collection"]
    print(d["metadata"]["total_hits"], mt + "s")
    for it in d["items"][: int(arg("--count", "15"))]:
        x = it["data"][0]
        print(f"{x['nasa_id']:32s} {x.get('date_created', '')[:10]} | {x.get('title', '')[:80]}")

def fetch(nid, name):
    files = [i["href"] for i in get(f"https://images-api.nasa.gov/asset/{urllib.parse.quote(nid)}")["collection"]["items"]]
    meta = get(f"https://images-api.nasa.gov/search?nasa_id={urllib.parse.quote(nid)}")["collection"]["items"][0]["data"][0]
    video = meta.get("media_type") == "video"
    pref = ["~large.mp4", "~medium.mp4", "~small.mp4", "~mobile.mp4", "~orig.mp4"] if video else ["~large.jpg", "~orig.jpg", "~medium.jpg"]   # video originals can be gigabytes
    url = next((f for p in pref for f in files if f.endswith(p)), None)
    if not url: sys.exit(f"no {'mp4' if video else 'jpg'} for {nid}: {files[:6]}")
    os.makedirs("assets", exist_ok=True); ext = "mp4" if video else "jpg"
    open(f"assets/{name}.{ext}", "wb").write(get(url.replace(" ", "%20"), raw=True))
    json.dump({"source": f"https://images.nasa.gov/details/{nid}", "title": meta.get("title"), "date": meta.get("date_created", "")[:10],
               "nasa_id": nid, "center": meta.get("center"), "credit": "NASA", "file": url,
               "rights": "NASA media: generally not copyrighted (US government work); no NASA endorsement implied"},
              open(f"assets/{name}.json", "w"), indent=1)
    print("saved", name, ext, meta.get("title"))

if __name__ == "__main__":
    {"search": lambda: search(sys.argv[2]), "fetch": lambda: fetch(sys.argv[2], sys.argv[3])}[sys.argv[1]]()
