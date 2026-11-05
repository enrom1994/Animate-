"""Fetch the paper-trail sound library (real recordings) into kit/sfx/library and write its catalog.csv for real-sfx.
Source: Mixkit (mixkit.co), free licence for use in videos incl. commercial and YouTube; the files must not be
redistributed on their own, so the library is NOT committed: run this once per machine.   python3 kit/sfx/fetch.py"""
import csv, os, re, sys, time, urllib.request
HERE = os.path.dirname(os.path.realpath(__file__)); LIB = os.path.join(HERE, "library")
rows = list(csv.DictReader(open(os.path.join(HERE, "mixkit.csv"))))
os.makedirs(LIB, exist_ok=True); out = []
for r in rows:
    folder = os.path.join(LIB, r["type"]); os.makedirs(folder, exist_ok=True)
    fn = re.sub(r"[^a-z0-9]+", "_", r["name"].lower()).strip("_") + f"_mixkit{r['id']}.mp3"; dst = os.path.join(folder, fn)
    if not os.path.exists(dst):
        url = f"https://assets.mixkit.co/active_storage/sfx/{r['id']}/{r['id']}-preview.mp3"
        for k in range(4):
            try:
                data = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "paper-trail/0.1"}), timeout=60).read(); break
            except Exception as e:
                if k == 3: sys.exit(f"failed {url}: {e}")
                time.sleep(2 ** (k + 1))
        open(dst, "wb").write(data); print("got", r["type"], fn)
    out.append({"file": f"{r['type']}/{fn}", "type": r["type"], "source": f"{r['name']} (Mixkit {r['id']})", "hit": "", "hits_in_source": ""})
with open(os.path.join(LIB, "catalog.csv"), "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["file", "type", "source", "hit", "hits_in_source"]); w.writeheader(); w.writerows(out)
print(len(out), "sounds in", LIB)
