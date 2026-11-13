#!/usr/bin/env python3
"""Sound for the pilot: the voice, a sea bed, and real recorded cues on the cuts and marks (EDITING.md section 4).
   python3 mix.py  ->  audio/mix.wav   (the library is .claude/kit/sfx/library; nothing is synthesised)"""
import os, subprocess
HERE = os.path.dirname(os.path.realpath(__file__)); LIB = os.path.realpath(os.path.join(HERE, '../../../.claude/kit/sfx/library'))
DUR = 34
W = ['whoosh/quick_air_woosh_mixkit2605.mp3', 'whoosh/air_woosh_mixkit1489.mp3', 'whoosh/transition_windy_swoosh_mixkit1474.mp3', 'whoosh/cinematic_whoosh_fast_transition_mixkit1492.mp3']
CUTS = [1.62, 3.3, 6.25, 9.45, 11.05, 12.52, 14.45, 17.65, 19.15, 21.65, 23.5, 25.38, 27.25, 31.7]
# (time, file, gain, start offset in the file, length)
CUES = [(0, 'ambience/sea_waves_ambience_mixkit1189.mp3', .22, 0, DUR)]
def attack(fn):   # seconds until the sound first reaches half its peak, so that moment can sit on the cut
    import array
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-t', '1.5', '-i', os.path.join(LIB, fn), '-f', 's16le', '-ac', '1', '-ar', '8000', '-'], capture_output=True, check=True).stdout
    a = array.array('h', raw); pk = max(1, max(abs(x) for x in a)); return next(i for i, x in enumerate(a) if abs(x) >= pk * .5) / 8000
ATT = {w: attack(w) for w in W}
CUES += [(t - ATT[W[i % len(W)]], W[i % len(W)], .30, 0, 1.6) for i, t in enumerate(CUTS)]
CUES += [(.80, 'whoosh/deep_air_woosh_mixkit2604.mp3', .5, 0, 1.6),            # the sea takes hold
         (1.76, 'foley/body_punch_quick_hit_thud_mixkit2153.mp3', .7, 0, 1),   # the red cross: "not"
         (3.3, 'ambience/river_water_flowing_mixkit2454.mp3', .3, 0, 2.9),     # "a river of water"
         (7.9, 'foley/wood_hard_hit_stamp_mixkit2182.mp3', .45, 0, 1),         # "as fast"
         (11.3, 'impact/deep_heartbeat_impact_mixkit498.mp3', .6, 0, 1.6),     # "drown"
         (13.3, 'foley/body_punch_quick_hit_thud_mixkit2153.mp3', .6, 0, 1),   # "not pull you under"
         (15.5, 'foley/wood_hard_hit_stamp_mixkit2182.mp3', .45, 0, 1),        # the width lands
         (17.92, 'whoosh/quick_air_woosh_mixkit2605.mp3', .45, 0, 1),          # the sideways arrow
         (25.9, 'foley/impact_of_a_blow_thud_mixkit2150.mp3', .35, 0, 1),      # the lifeguard jumps
         (32.5, 'impact/movie_impact_intro_presentation_mixkit2902.mp3', .4, 0, 1.5)]  # "the rip"
ins, f, lab = ['-i', os.path.join(HERE, 'audio/vo.wav')], ['[0:a]aresample=48000,volume=1.0[v]'], ['[v]']
for i, (t, fn, g, ss, ln) in enumerate(CUES, 1):
    ins += ['-ss', str(ss), '-t', str(ln), '-i', os.path.join(LIB, fn)]
    fade = f'afade=t=in:d=0.4,afade=t=out:st={ln - 1.2:.2f}:d=1.2' if ln > 5 else f'afade=t=out:st={max(0, ln - .3):.2f}:d=0.3'
    f.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,{fade},volume={g},adelay={int(max(0, t) * 1000)}:all=1[c{i}]'); lab.append(f'[c{i}]')
f.append(''.join(lab) + f'amix=inputs={len(lab)}:normalize=0:duration=longest,atrim=0:{DUR},alimiter=limit=.9[o]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(f), '-map', '[o]', '-ar', '48000', '-ac', '2', os.path.join(HERE, 'audio/mix.wav')], check=True)
print('wrote audio/mix.wav', len(CUES), 'cues')
