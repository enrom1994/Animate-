"""Resolve reel.json + audio/words.json + OCR boxes into build/plan.json (and build/plan.js for the renderer). Run from the reel folder."""
import json, os, re, sys
HERE = os.path.dirname(os.path.realpath(__file__)); sys.path.insert(0, HERE)
import loc

def img_size(name):
    import subprocess
    o = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", f"assets/{name}.jpg"], capture_output=True, text=True).stdout
    return tuple(int(x) for x in o.strip().split(","))

def box(name, spec, default_pad=.12):
    """A view/region spec -> [x0,y0,x1,y1] normalized to the image."""
    if spec in (None, "page"): return [0, 0, 1, 1]
    if isinstance(spec, list): return spec
    if "box" in spec: b = list(spec["box"])
    elif "find" in spec:
        b = loc.find(name, spec["find"], spec.get("nth", 0))
        if b is None: sys.exit(f"'{spec['find']}' not found on {name}: check the OCR with  loc.py find {name} \"...\"")
    else: sys.exit(f"bad view spec {spec}")
    p = spec.get("pad", default_pad); w, h = b[2] - b[0], b[3] - b[1]
    px, py = w * p, max(h * p, w * p * .5)
    b = [b[0] - px, b[1] - py, b[2] + px, b[3] + py]
    if "grow" in spec:  # extend the region down/right, e.g. to include the story under a headline
        g = spec["grow"]; b = [b[0] - g[0], b[1] - g[1], b[2] + g[2], b[3] + g[3]]
    if "zoom" in spec:
        cx, cy, z = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, spec["zoom"]
        b = [cx - (cx - b[0]) / z, cy - (cy - b[1]) / z, cx + (b[2] - cx) / z, cy + (b[3] - cy) / z]
    return [round(v, 4) for v in b]

norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
def cap_word(w): return re.sub(r"[^\w%$'’.,-]", "", w).strip(".,").replace("’", "'").upper()

if __name__ == "__main__":
    R = json.load(open("reel.json")); W = json.load(open("audio/words.json"))
    words, dur = W["words"], W["dur"] + R.get("tail", 1.2)
    first = {}
    for i, w in enumerate(words): first.setdefault(w["line"], i)
    def t_of(s):
        i = first[s["line"]] + s.get("word", 0)
        return round(max(0, words[i]["s"] + s.get("offset", 0) - (0 if i == 0 else .12)), 3)  # cut a hair before the word lands
    shots, images = [], {}
    for k, s in enumerate(R["shots"]):
        n = s["img"]
        if n not in images:
            iw, ih = img_size(n); meta = json.load(open(f"assets/{n}.json")) if os.path.exists(f"assets/{n}.json") else {}
            images[n] = {"src": f"assets/{n}.jpg", "w": iw, "h": ih, "title": meta.get("title"), "source": meta.get("source")}
        layout = s.get("layout", "page")
        clip = box(n, s["clip"], .03) if layout == "clip" else None
        base = clip and [clip[0] - .01, clip[1] - .01, clip[2] + .01, clip[3] + .01]
        fr = box(n, s.get("from", base or "page")); to = box(n, s.get("to", s.get("from", base or "page")))
        if "to" not in s and "from" not in s and clip:  # default clip move: slow push in
            cx, cy = (base[0] + base[2]) / 2, (base[1] + base[3]) / 2
            to = [cx - (cx - base[0]) / 1.08, cy - (cy - base[1]) / 1.08, cx + (base[2] - cx) / 1.08, cy + (base[3] - cy) / 1.08]
        marks = [{"box": box(n, m, .04), "style": m.get("style", "box"), "t": m.get("at", .4)} for m in s.get("marks", [])]
        shots.append({"start": 0 if k == 0 else t_of(s), "img": n, "layout": layout, "clip": clip, "from": fr, "to": to,
                      "ease": s.get("ease", "inout"), "in": s.get("in", "fade" if k else "cut"), "marks": marks,
                      "stamp": s.get("stamp"), "frame": s.get("frame"), "rot": s.get("rot", 0), "sfx": s.get("sfx", [])})
    for a, b in zip(shots, shots[1:]): a["end"] = b["start"]
    shots[-1]["end"] = round(dur, 3)
    # captions: 1-3 words, break on punctuation, emphasised words in red
    emph = {norm(e) for e in R.get("emph", [])}
    caps, cur = [], []
    for i, w in enumerate(words):
        cur.append(i)
        txt = " ".join(cap_word(words[j]["w"]) for j in cur)
        nxt = words[i + 1] if i + 1 < len(words) else None
        brk = (re.search(r"[.,?!;:]$", w["w"]) or len(cur) == 3 or nxt is None or nxt["line"] != w["line"]
               or len(txt) + 1 + len(cap_word(nxt["w"])) > 15)
        if brk and nxt is not None and nxt["line"] == w["line"] and not re.search(r"[.,?!;:]$", w["w"]) \
                and norm(w["w"]) in {"the", "a", "an", "to", "of", "and", "at", "in", "for", "with"} and len(cur) < 4:
            brk = False  # never end a caption on a little word
        if brk:
            caps.append({"s": words[cur[0]]["s"], "words": [{"w": cap_word(words[j]["w"]), "emph": norm(words[j]["w"]) in emph} for j in cur]}); cur = []
    for a, b in zip(caps, caps[1:]): a["e"] = round(min(b["s"], words[[x["s"] for x in words].index(a["s"])]["s"] + 2.5), 3)
    caps[-1]["e"] = round(W["dur"] + .6, 3)
    plan = {"fps": 30, "dur": round(dur, 3), "images": images, "shots": shots, "captions": caps,
            "series": R.get("series"), "grade": R.get("grade", {})}
    os.makedirs("build", exist_ok=True)
    json.dump(plan, open("build/plan.json", "w"), indent=1)
    open("build/plan.js", "w").write("window.PLAN=" + json.dumps(plan) + ";")
    print(f"{len(shots)} shots, {len(caps)} captions, {dur:.2f}s")
    for s in shots: print(f"  {s['start']:6.2f}-{s['end']:6.2f} {s['img']:10s} {s['layout']:5s} {s['in']}")
