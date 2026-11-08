#!/bin/sh
# Render every chapter (picture), stitch the picture, mix the whole film's sound in one pass, master: sh film.sh [chapters...]   → egypt-v2.mp4
set -e
HERE=$(cd "$(dirname "$0")" && pwd); ROOT=$(cd "$HERE/../../.." && pwd)
LIB=${LIB:-$ROOT/.claude/kit/lemo-opuscar}; export PLAYWRIGHT_CHROME=${PLAYWRIGHT_CHROME:-/opt/pw-browsers/chromium}
CHS=${*:-0 1 2 3 4 5 6}
cd "$LIB"
for c in $CHS; do
  node core/render/events.mjs "$HERE" --q "ch=$c" --out "$HERE/out/events_$c.json" > /dev/null
  [ -f "$HERE/out/ch$c.mp4" ] && [ -z "$FORCE" ] || node core/render/video.mjs "$HERE" --q "ch=$c" --fps 30 --workers 4 --out "$HERE/out/ch$c.mp4"
done
for c in 0 1 2 3 4 5 6; do [ -f "$HERE/out/events_$c.json" ] || node core/render/events.mjs "$HERE" --q "ch=$c" --out "$HERE/out/events_$c.json" > /dev/null; done
.venv/bin/python "$HERE/mix.py"                  # one score across the whole film: it never restarts at a chapter join
cd "$HERE/out"
: > list.txt
for c in 0 1 2 3 4 5 6; do echo "file 'ch$c.mp4'" >> list.txt; done
ffmpeg -v error -y -f concat -safe 0 -i list.txt -i mix.wav -map 0:v -map 1:a -c:v copy -c:a pcm_s16le all.mov
LN=$(python3 "$ROOT/.claude/skills/paper-trail/tools/loudnorm.py" all.mov)
ffmpeg -v error -y -i all.mov -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -af "$LN" -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$HERE/egypt-v2.mp4"
echo "done: $HERE/egypt-v2.mp4"
