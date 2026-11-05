"""Listen to the whole sound library with earshot (CLAP + AudioSet tagger, local) and say for each file whether it
is what its row in mixkit.csv says it is, and whether it is a real recording. Writes audit.json and prints a table.
   kit/.venv-earshot/bin/python kit/sfx/audit.py            (models load once, ~1-2 s per file on CPU)"""
import csv, json, os
from earshot import api
HERE = os.path.dirname(os.path.realpath(__file__)); LIB = os.path.join(HERE, "library")
# what each type should sound like, and the closest wrong readings it must beat
QUERY = {"camera": ("a vintage camera shutter click", ["a gunshot", "a typewriter key", "a door closing"]),
         "paper": ("paper rustling, a newspaper page turning", ["wind blowing", "cloth rustling", "rain"]),
         "typing": ("an old mechanical typewriter typing", ["a computer keyboard typing", "rain on a window"]),
         "impact": ("a deep cinematic impact boom", ["a gunshot", "thunder", "a door slam"]),
         "foley": ("a heavy wooden thud", ["a gunshot", "a drum hit", "a door slam"]),
         "atmosphere": ("an old film projector running", ["an air conditioner hum", "rain", "a car engine idling"]),
         "ambience": ("a train station with people and trains", ["a busy restaurant", "rain", "a stadium crowd"]),
         "whoosh": ("a fast whoosh", ["wind", "a jet passing", "a sword swing"]),
         "other": (None, ["an explosion", "fireworks", "a door slam"])}
rows = list(csv.DictReader(open(os.path.join(LIB, "catalog.csv"))))
out, bad = [], []
for r in rows:
    q, alts = QUERY.get(r["type"], (None, []))
    name = r["source"].split(" (Mixkit")[0]
    q = q if q and r["type"] not in ("foley", "other") else name   # foley/other rows are specific: use their own name
    p = os.path.join(LIB, r["file"])
    m = api.match(p, q, alts=alts); rl = api.realness(p)
    top = (m.get("closest_vocab") or [{}])[0]
    rec = {"file": r["file"], "query": q, "verdict": m["verdict"], "z": round(m["z"], 2), "p_vs_alts": m.get("p_vs_alts"),
           "sounds_like": top.get("text") if isinstance(top, dict) else str(top), "real": rl["verdict"], "p_real": rl["p_real"]}
    out.append(rec)
    flag = m["verdict"] in ("weak", "no match") or rl["p_real"] < .5
    if flag: bad.append(rec)
    print(f"{'!!' if flag else 'ok'} {m['verdict']:9s} z{m['z']:+5.1f} real {rl['p_real']:.2f}  {r['file'][:58]:58s} <- '{q}'")
json.dump(out, open(os.path.join(HERE, "audit.json"), "w"), indent=1)
print(f"\n{len(out)} sounds, {len(bad)} flagged (weak/no match to their description, or likely synthesized) -> kit/sfx/audit.json")
