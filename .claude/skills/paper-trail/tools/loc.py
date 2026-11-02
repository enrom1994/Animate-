"""Library of Congress newspaper archive (Chronicling America) helper.
  loc.py search "nash kansas city" --from 1933-06-17 --to 1933-06-19 [--front]
  loc.py fetch <loc.gov resource url> <name> [--width 3000]   -> assets/<name>.jpg + .xml (OCR word boxes) + .json (source, rights)
  loc.py find <name> "gang guns slay"                          -> normalized box [x0,y0,x1,y1] of that phrase on the page
Run fetch/find from the reel folder."""
import json, os, re, sys, difflib, urllib.parse, urllib.request
import xml.etree.ElementTree as ET

UA = {"User-Agent": "paper-trail/0.1"}
def get(url, raw=False, tries=5):
    import time
    for k in range(tries):  # loc.gov is flaky (520s, cut-off transfers): retry with backoff
        try:
            b = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()
            return b if raw else json.loads(b)
        except Exception as e:
            if k == tries - 1: raise
            print(f"  retry {k + 1} ({e})", file=sys.stderr); time.sleep(2 ** (k + 1))
def arg(flag, default=None):
    return sys.argv[sys.argv.index(flag) + 1] if flag in sys.argv else default

def search(q):
    p = {"q": q, "fo": "json", "c": arg("--count", "40")}
    if arg("--from"): p["dates"] = f"{arg('--from')}/{arg('--to', arg('--from'))}"
    d = get("https://www.loc.gov/collections/chronicling-america/?" + urllib.parse.urlencode(p))
    print(d["pagination"]["of"], "pages")
    for r in d["results"]:
        if "--front" in sys.argv and not r["id"].endswith("sp=1"): continue
        print(r.get("date"), r["id"], "|", r.get("title", "")[:90])

def fetch(url, name):
    d = get(url + ("&" if "?" in url else "?") + "fo=json")
    jp2 = next(p for p in d["page"] if p.get("mimetype") == "image/jp2")
    xml = next(p for p in d["page"] if p.get("mimetype") == "text/xml")
    width = int(arg("--width", "3000"))
    iiif = jp2["info"].rsplit("/", 1)[0] + f"/full/{min(width, jp2['width'])},/0/default.jpg"
    os.makedirs("assets", exist_ok=True)
    open(f"assets/{name}.jpg", "wb").write(get(iiif, raw=True))
    open(f"assets/{name}.xml", "wb").write(get(xml["url"], raw=True))
    it = d.get("item", {})
    meta = {"source": url, "title": it.get("title"), "date": it.get("date"), "image": iiif,
            "orig": [jp2["width"], jp2["height"]], "rights": "Library of Congress, Chronicling America: believed public domain or no known copyright restrictions; check modern third-party content."}
    json.dump(meta, open(f"assets/{name}.json", "w"), indent=1)
    print("saved", name, meta["title"])

def words(name):
    root = ET.parse(f"assets/{name}.xml").getroot()
    ns = root.tag.split("}")[0] + "}" if root.tag.startswith("{") else ""
    page = root.find(f".//{ns}Page")
    W, H = float(page.get("WIDTH")), float(page.get("HEIGHT"))
    out = []
    for s in root.iter(f"{ns}String"):
        x, y, w, h = (float(s.get(k)) for k in ("HPOS", "VPOS", "WIDTH", "HEIGHT"))
        out.append((s.get("CONTENT", ""), x / W, y / H, (x + w) / W, (y + h) / H))
    return out

norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
def find(name, phrase, nth=0):
    """Best fuzzy match of the phrase as consecutive OCR words; returns [x0,y0,x1,y1] normalized, or None."""
    ws = [w for w in words(name) if norm(w[0])]
    target = [norm(t) for t in phrase.split() if norm(t)]
    n, hits = len(target), []
    for i in range(len(ws) - n + 1):
        sc = sum(difflib.SequenceMatcher(a=norm(ws[i + k][0]), b=target[k]).ratio() for k in range(n)) / n
        if sc > .7: hits.append((sc, i))
    if not hits: return None
    hits.sort(key=lambda h: (-h[0], h[1]))
    best = sorted(hits[:max(1, nth + 1)], key=lambda h: h[1])[nth] if nth else hits[0]
    seg = ws[best[1]:best[1] + n]
    return [round(min(s[1] for s in seg), 4), round(min(s[2] for s in seg), 4), round(max(s[3] for s in seg), 4), round(max(s[4] for s in seg), 4)]

if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "search": search(sys.argv[2])
    elif cmd == "fetch": fetch(sys.argv[2], sys.argv[3])
    elif cmd == "find": print(find(sys.argv[2], sys.argv[3]))
