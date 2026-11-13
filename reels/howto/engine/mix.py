#!/usr/bin/env python3
"""Sound for a film: python3 engine/mix.py <film folder>  ->  <film>/audio/mix.wav
The voice, a bed, a whoosh on every cut and the cues in <film>/cues.json. Every sound is a real recording from
.claude/kit/sfx/library; nothing is synthesised. Times are seconds of the reference take and are mapped through
<film>/tools/warp.json. SFX=0 or VOICE=0 writes one stem alone (OUT=path), to measure the balance."""
import array, json, os, subprocess, sys
FILM = os.path.realpath(sys.argv[1]); LIB = os.path.realpath(os.path.join(os.path.dirname(os.path.realpath(__file__)), '../../../.claude/kit/sfx/library'))
C = json.load(open(os.path.join(FILM, 'cues.json'))); WARP = json.load(open(os.path.join(FILM, 'tools/warp.json'))); DUR = WARP[-1][1]
SFX, VOICE = float(os.environ.get('SFX', C.get('sfx', .4))), float(os.environ.get('VOICE', 1))   # effects sit about 10 dB under the voice
def T(r):
    for (r0, n0), (r1, n1) in zip(WARP, WARP[1:]):
        if r <= r1: return n0 + (n1 - n0) * (r - r0) / (r1 - r0)
    return DUR
def attack(fn):   # seconds until the sound first reaches half its peak, so that moment sits on the mark
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-t', '1.5', '-i', os.path.join(LIB, fn), '-f', 's16le', '-ac', '1', '-ar', '8000', '-'], capture_output=True, check=True).stdout
    a = array.array('h', raw); pk = max(1, max(abs(x) for x in a)); return next(i for i, x in enumerate(a) if abs(x) >= pk * .5) / 8000
WH = ['whoosh/quick_air_woosh_mixkit2605.mp3', 'whoosh/air_woosh_mixkit1489.mp3', 'whoosh/transition_windy_swoosh_mixkit1474.mp3', 'whoosh/cinematic_whoosh_fast_transition_mixkit1492.mp3']
cues = [(0, C['bed'][0], C['bed'][1] * .75, DUR, False)] + [(t, WH[i % 4], .30, 1.6, True) for i, t in enumerate(C['cuts'])] + [(t, f, g, ln, True) for t, f, g, ln in C['cues']]
ATT = {}
ins, f, lab = ['-i', os.path.join(FILM, 'audio/vo.wav')], [f'[0:a]aresample=48000,volume={VOICE}[v]'], ['[v]']
for i, (t, fn, g, ln, hit) in enumerate(cues, 1):
    if hit and fn not in ATT: ATT[fn] = attack(fn)
    t = T(t) - (ATT[fn] if hit else 0)
    ins += ['-stream_loop', '-1', '-t', str(ln), '-i', os.path.join(LIB, fn)] if not hit else ['-t', str(ln), '-i', os.path.join(LIB, fn)]
    fade = f'afade=t=in:d=0.4,afade=t=out:st={ln - 1.2:.2f}:d=1.2' if not hit else f'afade=t=out:st={max(0, ln - .3):.2f}:d=0.3'
    f.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,{fade},volume={g * SFX},adelay={int(max(0, t) * 1000)}:all=1[c{i}]'); lab.append(f'[c{i}]')
f.append(''.join(lab) + f'amix=inputs={len(lab)}:normalize=0:duration=longest,atrim=0:{DUR},alimiter=limit=.9[o]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(f), '-map', '[o]', '-ar', '48000', '-ac', '2', os.path.join(FILM, os.environ.get('OUT', 'audio/mix.wav'))], check=True)
print('wrote audio/mix.wav', len(cues), 'cues')
