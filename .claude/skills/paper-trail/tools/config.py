"""One place that reads a reel's settings: reels/channel.json (channel-wide defaults, e.g. the outro) merged with <reel>/reel.json.
The outro's spoken line (if any) is appended to the script, so voice, timings and plan all see it."""
import json, os
DEFAULT_OUTRO = {"text": "Like, follow & subscribe for more", "items": ["LIKE", "FOLLOW", "SUBSCRIBE"],
                 "say": "Like, follow, and subscribe for more.", "dur": 3.6, "pause": 1.3, "lead": .7, "hold": 1.4}

def load(path="reel.json"):
    R = json.load(open(path))
    ch = os.path.join(os.path.dirname(os.path.abspath(path)), "..", "channel.json")
    C = json.load(open(ch)) if os.path.exists(ch) else {}
    out = {**C, **R}
    for k in ("voice", "grade"): out[k] = {**C.get(k, {}), **R.get(k, {})}
    o = R.get("outro", C.get("outro", {}))
    out["outro"] = None if o is False else {**DEFAULT_OUTRO, **(o or {})}
    out["story_lines"] = len(R["script"])
    out["script"] = list(R["script"]) + ([out["outro"]["say"]] if out["outro"] and out["outro"].get("say") else [])
    return out
