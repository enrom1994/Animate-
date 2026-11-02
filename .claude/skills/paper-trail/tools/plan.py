"""Resolve reel.json (+ channel.json) + audio/words.json + OCR boxes into build/plan.json and build/plan.js. Run from the reel folder.
Shot kinds: page (default; newspaper scans and any still image), photo (fills the frame), card (typed text on paper),
map (ink diagram drawn in code), footage (archive film clip). The outro end card is added automatically."""
import json, os, re, sys, subprocess, glob
HERE = os.path.dirname(os.path.realpath(__file__)); sys.path.insert(0, HERE)
import loc, config

def img_size(path):
    o = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", path], capture_output=True, text=True).stdout
    return tuple(int(x) for x in o.strip().split("\n")[0].split(","))

def box(name, spec, default_pad=.12):
    """A view/region spec -> [x0,y0,x1,y1] normalized to the image."""
    if spec in (None, "page"): return [0, 0, 1, 1]
    if isinstance(spec, list): return spec
    if "box" in spec: b = list(spec["box"])
    elif "find" in spec:
        b = loc.find(name, spec["find"], spec.get("nth", 0))
        if b is None: sys.exit(f"'{spec['find']}' not found on {name}: check the OCR with  loc.py find {name} \"...\"")
    else: sys.exit(f"bad view spec {spec}")
    p = spec.get("pad", default_pad if "find" in spec else 0); w, h = b[2] - b[0], b[3] - b[1]
    px, py = w * p, max(h * p, w * p * .5)
    b = [b[0] - px, b[1] - py, b[2] + px, b[3] + py]
    if "grow" in spec: g = spec["grow"]; b = [b[0] - g[0], b[1] - g[1], b[2] + g[2], b[3] + g[3]]
    if "zoom" in spec:
        cx, cy, z = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, spec["zoom"]
        b = [cx - (cx - b[0]) / z, cy - (cy - b[1]) / z, cx + (b[2] - cx) / z, cy + (b[3] - cy) / z]
    return [round(v, 4) for v in b]

norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
def cap_word(w): return re.sub(r"[^\w%$'’.,-]", "", w).strip(".,").replace("’", "'").upper()
SMALL = {"the", "a", "an", "to", "of", "and", "at", "in", "for", "with"}

def footage_frames(name, src, t0, dur):
    """Pre-extract a film clip to numbered JPEGs at 30 fps (the renderer draws them frame-exact)."""
    d = f"build/frames/{name}"
    if not glob.glob(f"{d}/*.jpg"):
        os.makedirs(d, exist_ok=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t0), "-t", str(dur + .5), "-i", src, "-vf", "fps=30,scale=-2:1080", "-q:v", "3", f"{d}/%05d.jpg"], check=True)
    return len(glob.glob(f"{d}/*.jpg"))

if __name__ == "__main__":
    R = config.load(); W = json.load(open("audio/words.json"))
    words, story_n, O = W["words"], R["story_lines"], R["outro"]
    first = {}
    for i, w in enumerate(words): first.setdefault(w["line"], i)
    story_end = max(w["e"] for w in words if w["line"] < story_n)
    WIDE = R["format"] == "16:9"; I = R.get("intro")
    def t_of(s):
        i = first[s["line"]] + s.get("word", 0)
        return round(max(0, words[i]["s"] + s.get("offset", 0) - (0 if i == 0 else .12)), 3)
    o_start = None
    # outro: starts on its spoken line, or a beat after the story
    ticks, more_t = None, None
    if O:
        spoken = O.get("say") and story_n in first
        o_start = round(words[first[story_n]]["s"] - O.get("lead", .7), 3) if spoken else round(story_end + .5, 3)
        if spoken:  # tick each box as its word is said, type FOR MORE on "more"
            ow = [w for w in words if w["line"] == story_n]
            at = lambda word: next((round(w["s"] - o_start, 3) for w in ow if norm(w["w"]) == norm(word)), None)
            ticks = [at(it) for it in O["items"]]; ticks = [t if t is not None else .5 + i * .3 for i, t in enumerate(ticks)]
            more_t = at("more") or ticks[-1] + .6
    dur = round((max(o_start + O["dur"], W["dur"] + O.get("hold", 1.3)) if O else W["dur"] + R.get("tail", 1.2)), 3)
    shots, images, ai_used = [], {}, []
    for k, s in enumerate(R["shots"]):
        kind = s.get("kind", "page"); sh = {"kind": kind, "start": (t_of(s) - .3 if I else 0) if k == 0 else t_of(s), "in": s.get("in", "fade" if k else "cut"),
              "sfx": s.get("sfx", []), "ease": s.get("ease", "inout"), "stamp": s.get("stamp"), "frame": s.get("frame"),
              "label": s.get("label") or ("AI ILLUSTRATION" if s.get("ai") else None), "marks": [], "rot": s.get("rot", 0)}
        if s.get("ai"): ai_used.append(s.get("img"))
        if kind in ("page", "photo"):
            n = s["img"]; path = f"assets/{n}.jpg"
            if n not in images:
                iw, ih = img_size(path); meta = json.load(open(f"assets/{n}.json")) if os.path.exists(f"assets/{n}.json") else {}
                images[n] = {"src": path, "w": iw, "h": ih, "title": meta.get("title"), "source": meta.get("source")}
            layout = "photo" if kind == "photo" else s.get("layout", "page")
            clip = box(n, s["clip"], .03) if layout == "clip" else None
            base = clip and [clip[0] - .01, clip[1] - .01, clip[2] + .01, clip[3] + .01]
            fr = box(n, s.get("from", base or "page")); to = box(n, s.get("to", s.get("from", base or "page")))
            if kind == "photo" and "from" not in s:  # default photo move: slow push into the centre
                fr, to = [0, 0, 1, 1], [.06, .06, .94, .94]
            if "to" not in s and "from" not in s and clip:
                cx, cy = (base[0] + base[2]) / 2, (base[1] + base[3]) / 2
                to = [cx - (cx - base[0]) / 1.08, cy - (cy - base[1]) / 1.08, cx + (base[2] - cx) / 1.08, cy + (base[3] - cy) / 1.08]
            sh.update({"img": n, "layout": layout, "clip": clip, "from": fr, "to": to,
                       "marks": [{"box": box(n, m, .04), "style": m.get("style", "box"), "t": m.get("at", .4)} for m in s.get("marks", [])]})
        elif kind == "footage":
            n = s["img"]; sh.update({"img": n, "src0": s.get("from_s", 0)})
        elif kind in ("card", "map"):
            sh.update({k2: s[k2] for k2 in ("text", "sub", "title", "blocks", "points", "route", "xs", "style") if k2 in s})
            if kind == "map" and not sh["label"]: sh["label"] = "ILLUSTRATION"
        else: sys.exit(f"unknown shot kind {kind}")
        shots.append(sh)
    if I:  # chapter title card fills the silent lead-in
        shots.insert(0, {"kind": "chapter", "start": 0, "in": "black", "sfx": [], "marks": [], "part": I.get("part"), "text": I.get("title"),
                         "sub": I.get("sub"), "img": I.get("img", next((x["img"] for x in shots if x.get("img")), None)), "label": None})
        shots[1]["in"] = "fade"
    for sh in shots:  # map elements can be timed to the narration: {"line": n, "word": k}
        if sh["kind"] == "map":
            for key in ("blocks", "points", "xs"):
                for el in sh.get(key, []) or []:
                    if isinstance(el, dict) and "line" in el: el["at"] = round(t_of(el) - sh["start"], 3)
                    elif isinstance(el, list) and len(el) > 5 and isinstance(el[5], dict): el[5]["at"] = round(t_of(el[5]) - sh["start"], 3)
    for a, b in zip(shots, shots[1:]): a["end"] = b["start"]
    shots[-1]["end"] = o_start if O else dur
    for sh in shots:
        if sh["kind"] == "chapter" and sh.get("img") and sh["img"] not in images:
            iw, ih = img_size(f"assets/{sh['img']}.jpg"); images[sh["img"]] = {"src": f"assets/{sh['img']}.jpg", "w": iw, "h": ih}
    for i, sh in enumerate(shots):
        if sh["kind"] == "footage":
            src = next(iter(glob.glob(f"assets/{sh['img']}.*")))
            sh["frames"] = footage_frames(sh["img"], src, sh["src0"], sh["end"] - sh["start"])
    if O: shots.append({"kind": "outro", "start": o_start, "end": dur, "in": "black", "sfx": [], "marks": [], "text": O["text"], "items": O["items"],
                        "ticks": ticks or [.5 + i * .3 for i in range(len(O["items"]))], "more_t": more_t or 1.3})
    # captions (story lines only): 1-3 words, break on punctuation, never end on a little word
    emph = {norm(e) for e in R.get("emph", [])}
    sw = [w for w in words if w["line"] < story_n]; caps, cur = [], []
    for i, w in enumerate(sw):
        cur.append(i); nxt = sw[i + 1] if i + 1 < len(sw) else None
        txt = " ".join(cap_word(sw[j]["w"]) for j in cur)
        punct = re.search(r"[.,?!;:]$", w["w"])
        maxw, maxc = (6, 34) if WIDE else (3, 15)  # long form reads as subtitles, Shorts as punchy 1-3 word captions
        brk = punct or len(cur) == maxw or nxt is None or nxt["line"] != w["line"] or len(txt) + 1 + len(cap_word(nxt["w"])) > maxc
        if brk and not punct and nxt is not None and nxt["line"] == w["line"] and norm(w["w"]) in SMALL:
            if len(cur) < maxw: brk = False
            elif len(cur) > 1:  # push the little word(s) to the next caption instead
                carry = []
                while len(cur) > 1 and norm(sw[cur[-1]]["w"]) in SMALL: carry.insert(0, cur.pop())
                caps.append({"s": sw[cur[0]]["s"], "last": sw[cur[-1]]["e"], "words": [{"w": cap_word(sw[j]["w"]), "emph": norm(sw[j]["w"]) in emph} for j in cur]})
                cur = carry; continue
        if brk: caps.append({"s": sw[cur[0]]["s"], "last": sw[cur[-1]]["e"], "words": [{"w": cap_word(sw[j]["w"]), "emph": norm(sw[j]["w"]) in emph} for j in cur]}); cur = []
    for a, b in zip(caps, caps[1:]): a["e"] = round(min(b["s"], a["last"] + .6), 3)
    caps[-1]["e"] = round(min(caps[-1]["last"] + .6, o_start if O else dur), 3)
    mid = R.get("cta_mid")
    if mid: mid = {"text": mid.get("text", "Follow for more"), "s": t_of(mid), "e": t_of(mid) + mid.get("dur", 2.6)}
    dur = round(round(dur * 30) / 30, 4)  # whole frames, so chapters stitch without drift
    shots[-1]["end"] = dur
    WH = (1920, 1080) if WIDE else (1080, 1920)
    plan = {"fps": 30, "W": WH[0], "H": WH[1], "format": R["format"], "dur": dur, "images": images, "shots": shots, "captions": caps, "series": R.get("series"), "series_label": R.get("series_label", False),
            "grade": R.get("grade", {}), "cta_mid": mid, "ai": ai_used}
    os.makedirs("build", exist_ok=True)
    json.dump(plan, open("build/plan.json", "w"), indent=1)
    open("build/plan.js", "w").write("window.PLAN=" + json.dumps(plan) + ";")
    # description block: sources + disclosures, ready to paste
    src = [f"- {m['title']} - {m['source']}" for m in images.values() if m.get("source")]
    desc = ["Sources:"] + src
    if ai_used: desc += ["", "Contains AI-generated illustration(s): " + ", ".join(ai_used) + ". Tick YouTube's altered/synthetic content disclosure."]
    open("build/description.txt", "w").write("\n".join(desc) + "\n")
    print(f"{len(shots)} shots, {len(caps)} captions, {dur:.2f}s")
    for s in shots: print(f"  {s['start']:6.2f}-{s['end']:6.2f} {s['kind']:8s} {s.get('img', '') or ''}")
