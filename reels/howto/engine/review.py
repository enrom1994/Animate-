#!/usr/bin/env python3
"""Review strips for a finished film: python3 engine/review.py <film folder> [video]
A contact sheet finds problems but cannot show movement, so this cuts the film where problems hide:
  review/cuts_NN.jpg      six consecutive frames across every cut (three before, three after)
  review/contacts_NN.jpg  seven frames round every hit in cues.json (the moment something lands, is grabbed or is stopped)
  review/phone.jpg        the first three seconds at phone size (360 x 640), eight frames
Times in cues.json are reference-take seconds and are mapped through tools/warp.json.
(The idea of reviewing both sides of each cut and each contact frame by frame is from kaomei/stickman-video-director, MIT.)"""
import json, os, subprocess, sys
FILM = os.path.realpath(sys.argv[1]); name = os.path.basename(FILM)
VID = sys.argv[2] if len(sys.argv) > 2 else os.path.join(FILM, name + '.mp4')
C = json.load(open(os.path.join(FILM, 'cues.json'))); WARP = json.load(open(os.path.join(FILM, 'tools/warp.json')))
def T(r):
    for (r0, n0), (r1, n1) in zip(WARP, WARP[1:]):
        if r <= r1: return n0 + (n1 - n0) * (r - r0) / (r1 - r0)
    return WARP[-1][1]
OUT = os.path.join(FILM, 'review'); os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT): os.remove(os.path.join(OUT, f))
FPS = 30
def strip(path, t0, n, step=1, w=270, cols=None, label=''):
    cols = cols or n
    vf = f"select='not(mod(n\\,{step}))',scale={w}:-1,drawtext=text='{label} %{{pts\\:hms}}':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.6,tile={cols}x{-(-n // cols)}"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{max(0, t0):.3f}', '-i', VID, '-frames:v', '1', '-vf', vf, '-vsync', '0', path], check=True)
def rows(prefix, times, before, n, per=5, label=''):
    # one image per group of rows, so each stays small enough to read
    import tempfile
    from PIL import Image
    for k in range(0, len(times), per):
        ims = []
        for i, t in enumerate(times[k:k + per]):
            p = os.path.join(tempfile.gettempdir(), f'_rv_{i}.jpg'); strip(p, T(t) - before / FPS, n, label=f'{label}{k + i + 1}'); ims.append(Image.open(p).copy())
        W, H = ims[0].size; sheet = Image.new('RGB', (W, H * len(ims)))
        for i, im in enumerate(ims): sheet.paste(im, (0, i * H))
        sheet.save(os.path.join(OUT, f'{prefix}_{k // per + 1:02d}.jpg'), quality=85)
rows('cuts', C['cuts'], 3, 6, label='cut ')
rows('contacts', [t for t, f, g, ln in C['cues'] if 'whoosh' not in f and 'ambience' not in f], 3, 7, label='hit ')
strip(os.path.join(OUT, 'phone.jpg'), 0, 8, step=11, w=360, cols=4)
print('wrote', len(os.listdir(OUT)), 'review sheets in', OUT)
