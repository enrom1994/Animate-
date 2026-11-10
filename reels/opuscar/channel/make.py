"""Channel art for "Overpass": profile image (800×800) and banner (2560×1440, text inside the 1546×423 safe area).
usage (from reels/opuscar/channel): python3 -I make.py"""
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
NAVY, Y, BLUE, WHITE = (10, 16, 30), (252, 204, 10), (40, 120, 220), (255, 255, 255)
FONT = '../gerd/assets/thumb/RobotoCondensed.ttf'
def F(s):
    f = ImageFont.truetype(FONT, s); f.set_variation_by_name('Black'); return f

# —— profile: a yellow ring (the O, and an orbit) with a satellite on it; inside, a river that becomes a lake
K = 4; S = 800 * K; im = Image.new('RGB', (S, S), NAVY); d = ImageDraw.Draw(im); c = S / 2
R, w = 270 * K, 62 * K
d.ellipse((c - R, c - R, c + R, c + R), outline=Y, width=w)
# river: one gentle meander from the top of the ring into a lake (a smooth blob, like a real reservoir's arms)
t = np.linspace(0, 1, 500); xs = c - 20 * K + 85 * K * np.sin(t * 1.6 * np.pi + .3); ys = c - (R - w) + t * (R - w) * 1.05
for x, y, r in zip(xs, ys, (13 + 9 * t) * K): d.ellipse((x - r, y - r, x + r, y + r), fill=BLUE)
blob = Image.new('L', (S, S)); bd = ImageDraw.Draw(blob)
for (bx, by, br) in [(-40, 95, 120), (60, 120, 100), (-140, 140, 80), (150, 150, 70), (20, 185, 95), (-90, 200, 70), (110, 70, 45), (-180, 95, 40)]:
    bd.ellipse((c + (bx - br) * K, c + (by - br) * K, c + (bx + br) * K, c + (by + br) * K), fill=255)
blob = blob.filter(ImageFilter.GaussianBlur(18 * K)).point(lambda v: 255 if v > 120 else 0)
im.paste(Image.new('RGB', (S, S), BLUE), (0, 0), blob); d = ImageDraw.Draw(im)
mask = Image.new('L', (S, S)); ImageDraw.Draw(mask).ellipse((c - R + w - 2, c - R + w - 2, c + R - w + 2, c + R - w + 2), fill=255)
inner = Image.new('RGB', (S, S), NAVY); im = Image.composite(im, inner, mask); d = ImageDraw.Draw(im)
d.ellipse((c - R, c - R, c + R, c + R), outline=Y, width=w)
a = np.radians(-42); sx, sy = c + (R - w / 2) * np.cos(a), c + (R - w / 2) * np.sin(a)     # the satellite, in a gap of the ring
d.ellipse((sx - 78 * K, sy - 78 * K, sx + 78 * K, sy + 78 * K), fill=NAVY)
d.ellipse((sx - 46 * K, sy - 46 * K, sx + 46 * K, sy + 46 * K), fill=WHITE)
im = im.resize((800, 800), Image.LANCZOS); im.save('profile.png')
im.resize((98, 98), Image.LANCZOS).save('/tmp/claude-0/-home-user-Animate-/98a041f0-4a4e-56eb-966f-299cbe3e5220/scratchpad/profile_small.png')

# —— banner: real Landsat (the GERD reservoir, Jan 2026), darkened, with the wordmark in the safe area
BW, BH = 2560, 1440
z = np.load('../gerd/assets/raw/res_2026.npz'); b = z['bands'].astype(np.float32) * 2.75e-5 - .2
rgb = np.stack([b[0], b[1], b[2]], -1); v = z['valid']; lo, hi = np.percentile(rgb[v], [1, 99.5])
out = np.clip((rgb - lo) / (hi - lo), 0, 1) ** .9
water = (b[1] - b[4]) / (b[1] + b[4] + 1e-6) > 0
out[water] = out[water] * .2 + np.array([.10, .42, .82]) * .8
plate = Image.fromarray((out * 255).astype(np.uint8)).crop((0, 80, 1700, 1036)).resize((BW, BH), Image.LANCZOS)
dark = Image.new('RGB', (BW, BH), NAVY)
g = np.clip((np.arange(BW) - 700) / 1500, 0, 1) ** 1.2 * .75                      # navy on the left, the lake shows on the right
ban = Image.composite(plate, dark, Image.fromarray((np.tile(g, (BH, 1)) * 255).astype(np.uint8)))
d = ImageDraw.Draw(ban)
x0, y0 = (BW - 1546) // 2, (BH - 423) // 2
f1 = F(230); d.text((x0 + 10, y0 + 20), 'OVERPASS', font=f1, fill=WHITE)
tw = d.textlength('OVERPASS', font=f1)
d.rectangle((x0 + 14, y0 + 300, x0 + 14 + tw, y0 + 312), fill=Y)
d.text((x0 + 14, y0 + 335), 'THE WORLD, MEASURED FROM ORBIT', font=F(62), fill=Y)
ban.save('banner.jpg', quality=90)
print('profile.png banner.jpg')
