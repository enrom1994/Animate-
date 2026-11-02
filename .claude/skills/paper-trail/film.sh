#!/usr/bin/env bash
# Build a long-form film from chapter reels and stitch them frame-exact:  film.sh <film-folder>
#   <film>/film.json: {"title", "format": "16:9", "outro": false, "chapters": ["01-morning", "02-trusty", ...]}
#   each chapter is a normal reel folder (reel.json with an "intro" title card); the last chapter sets "outro": true.
#   CHAPTERS="03 04" film.sh <film>  rebuilds only those chapters, then restitches everything.
set -euo pipefail
SK="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FILM="$(cd "${1:?usage: film.sh <film-folder>}" && pwd)"; NAME="$(basename "$FILM")"; cd "$FILM"
mapfile -t CH < <(python3 -c 'import json;[print(c) for c in json.load(open("film.json"))["chapters"]]')
for c in "${CH[@]}"; do
  if [ -z "${CHAPTERS:-}" ] || [[ " $CHAPTERS " == *" ${c%%-*} "* ]] || [ ! -f "$c/build/silent.mp4" ]; then
    echo "######## chapter $c"; NOMUX=1 bash "$SK/make.sh" "$c"
  fi
done
mkdir -p build; : > build/v.txt; : > build/a.txt
for c in "${CH[@]}"; do echo "file '$FILM/$c/build/silent.mp4'" >> build/v.txt; echo "file '$FILM/$c/audio/mix.wav'" >> build/a.txt; done
ffmpeg -v error -y -f concat -safe 0 -i build/v.txt -c copy build/silent.mp4
ffmpeg -v error -y -f concat -safe 0 -i build/a.txt -c copy build/mix.wav
ffmpeg -v error -y -i build/silent.mp4 -i build/mix.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$NAME.part.mp4"
mv "$NAME.part.mp4" "$NAME.mp4"
# chapters for the YouTube description (timestamps of each title card)
python3 - "${CH[@]}" <<'PY'
import json, sys
t, out = 0.0, []
for c in sys.argv[1:]:
    p = json.load(open(f"{c}/build/plan.json")); first = p["shots"][0]
    title = (first.get("text") if first["kind"] == "chapter" else None) or json.load(open(f"{c}/reel.json")).get("title", c)
    out.append(f"{int(t // 60)}:{int(t % 60):02d} {title.title() if title.isupper() else title}"); t += p["dur"]
src = []
for c in sys.argv[1:]:
    for line in open(f"{c}/build/description.txt").read().splitlines():
        if line.startswith("- ") and line not in src: src.append(line)
open("build/description.txt", "w").write("Chapters:\n" + "\n".join(out) + "\n\nSources:\n" + "\n".join(src) + "\n")
print("\n".join(out))
PY
echo "done: $FILM/$NAME.mp4"
