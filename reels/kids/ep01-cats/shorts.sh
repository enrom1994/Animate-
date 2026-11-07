#!/usr/bin/env bash
# Cut one 9:16 Short per mystery from the finished 16:9 episode.
# Layout: title on top, the scene (slightly cropped) in the middle, the channel band below.
set -euo pipefail
cd "$(dirname "$0")"
EP=ep01-cats.mp4; FONT=web/fonts/Poppins-Bold.ttf; mkdir -p shorts
# chapter start = first word of that chapter's line in words_new.json (lines from chapters.json)
read -r -a T < <(python3 - <<'EOF'
import json
w = json.load(open('audio/words_new.json')); ch = json.load(open('chapters.json'))
start = {l: min(x['s'] for x in w if x['line'] == l) for l, _ in ch}
print(' '.join(f"{start[l]:.2f}" for l, _ in ch))
EOF
)
cut() {   # name start end line1 line2 colour
  local name=$1 a=$2 b=$3 l1=$4 l2=$5 col=$6
  ffmpeg -v error -y -ss "$(echo "$a - 0.15" | bc)" -to "$(echo "$b - 0.25" | bc)" -i "$EP" -filter_complex "
    color=c=$col:s=1080x1920:r=30[bg];
    [0:v]crop=1800:1080:60:0,scale=1080:648,pad=1096:664:8:8:color=0x2a2026[v];
    [bg][v]overlay=-8:580:shortest=1,
    drawtext=fontfile=$FONT:text='$l1':fontsize=96:fontcolor=white:borderw=10:bordercolor=0x2a2026:x=(w-tw)/2:y=210,
    drawtext=fontfile=$FONT:text='$l2':fontsize=96:fontcolor=white:borderw=10:bordercolor=0x2a2026:x=(w-tw)/2:y=330,
    drawtext=fontfile=$FONT:text='PIP & BISCUIT':fontsize=64:fontcolor=0x2a2026:x=(w-tw)/2:y=1490,
    drawtext=fontfile=$FONT:text='animal mysteries for curious kids':fontsize=44:fontcolor=0x2a2026@0.75:x=(w-tw)/2:y=1580,
    fade=t=out:st=$(echo "$b - $a - 0.6" | bc):d=0.5[out]" \
    -map "[out]" -map 0:a -c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k \
    -af "afade=t=out:st=$(echo "$b - $a - 0.6" | bc):d=0.5" -movflags +faststart "shorts/$name.mp4"
  echo "shorts/$name.mp4  $(echo "$b - $a" | bc) s"
}
cut short1-purr    "${T[1]}" "${T[2]}" 'WHY DO CATS' 'PURR?'          0xf2b52a
cut short2-landing "${T[2]}" "${T[3]}" 'HOW DO CATS LAND' 'ON THEIR FEET?' 0x5d8fd8
cut short3-knead   "${T[3]}" "${T[4]}" 'WHY DO CATS' 'MAKE BISCUITS?' 0x3fa35b
cut short4-box     "${T[4]}" "${T[5]}" 'WHY DO CATS' 'LOVE BOXES?'    0x7a4bc4
