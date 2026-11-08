# Cut one 9:16 Short (45-60 s) per mystery from the finished 16:9 episode.
# Each Short keeps a list of scenes, named by the phrase that starts them, so it still works after the script changes.
# Layout: title on top, the whole 16:9 frame in the middle (nothing cropped), the channel band below.
#   python3 shorts.py            (run from the episode folder, after make.sh)
import json, re, subprocess, os
EP, FONT = 'ep01-cats.mp4', 'web/fonts/Poppins-Bold.ttf'
W = json.load(open('audio/words_new.json')); SH = json.load(open('audio/shots.json'))
n = lambda x: re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', '', x.lower())).strip()
def at(phrase):
    p = n(phrase).split()
    for i in range(len(W) - len(p) + 1):
        if all(n(W[i + q]['w']) == p[q] and W[i + q]['line'] == W[i]['line'] for q in range(len(p))): return W[i]['s']
    raise SystemExit('phrase not found: ' + phrase)
def scene(phrase):   # the shot that starts at this phrase
    t = at(phrase); return min(SH, key=lambda s: abs(s[0] - t))
SHORTS = [
 ('short1-purr', 'WHY DO CATS', 'PURR?', '0xf2b52a', ['Listen Biscuit is purring', 'Can I purr too', 'Quick guess first', 'Most people think', "But here's something surprising",
   "Deep in Biscuit's throat", 'That wobbling makes', 'A few years ago', 'Mother cats purr', 'So Biscuit has a little']),
 ('short2-landing', 'HOW DO CATS LAND', 'ON THEIR FEET?', '0x5d8fd8', ['Biscuit jumped off', 'How does she do it', "It's called the righting", 'First a part of',
   'Guess first When she turns', 'Then she twists', 'She can do that because', "And cats don't have", 'Then she reaches', 'Kittens start learning',
   "But here's the important part", 'So we never drop']),
 ('short3-knead', 'WHY DO CATS', 'MAKE BISCUITS?', '0x3fa35b', ['Look Biscuit is pressing', 'This is called kneading', "Hey that's your name", 'So why do cats knead',
   'Guess first Did it start', 'It starts when', 'When cats grow up', 'Some cats even close', 'Cats also have scent', 'So when Biscuit kneads']),
 ('short4-box', 'WHY DO CATS', 'LOVE BOXES?', '0x7a4bc4', ['Yesterday a big box', 'Biscuit Even when a box', 'Guess first Do cats like boxes', 'Boxes make them feel safe Inside',
   'Scientists tested this', 'Boxes are warm too', "And here's the funniest", 'Scientists asked cat owners', "There's no box at all", 'So if your cat sits']),
]
os.makedirs('shorts', exist_ok=True)
for name, l1, l2, col, keep in SHORTS:
    spans = []
    for ph in keep:
        a, b = scene(ph)
        if spans and abs(spans[-1][1] - a) < .01: spans[-1][1] = b       # neighbours: one piece, no seam
        else: spans.append([a, b])
    spans[-1][1] -= .25
    dur = sum(b - a for a, b in spans); assert 45 <= dur <= 60, f'{name}: {dur:.1f} s is outside 45-60 s'
    f = []
    for i, (a, b) in enumerate(spans):   # each piece: video trimmed, audio with 30 ms fades so the seams don't click
        f.append(f'[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS[v{i}];[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={b - a - .03:.3f}:d=0.03[a{i}]')
    f.append(''.join(f'[v{i}][a{i}]' for i in range(len(spans))) + f'concat=n={len(spans)}:v=1:a=1[cv][ca]')
    txt = lambda s, size, y, extra='': f"drawtext=fontfile={FONT}:text='{s}':fontsize={size}:x=(w-tw)/2:y={y}{extra}"
    f.append(f'color=c={col}:s=1080x1920:r=30[bg];[cv]scale=1080:608,pad=1096:624:8:8:color=0x2a2026[v];[bg][v]overlay=-8:600:shortest=1,'
             + txt(l1, 96, 230, ':fontcolor=white:borderw=10:bordercolor=0x2a2026') + ',' + txt(l2, 96, 350, ':fontcolor=white:borderw=10:bordercolor=0x2a2026') + ','
             + txt('PIP & BISCUIT', 64, 1400, ':fontcolor=0x2a2026') + ',' + txt('animal mysteries for curious kids', 44, 1490, ':fontcolor=0x2a2026@0.75')
             + f',fade=t=out:st={dur - .6:.2f}:d=0.5[out];[ca]afade=t=out:st={dur - .6:.2f}:d=0.5[aout]')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', EP, '-filter_complex', ';'.join(f), '-map', '[out]', '-map', '[aout]', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium',
                    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', f'shorts/{name}.mp4'], check=True)
    print(f'shorts/{name}.mp4  {dur:.1f} s  ({len(spans)} pieces)')
