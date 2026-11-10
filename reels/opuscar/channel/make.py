"""Channel art for "Overpass": profile image (800×800) and banner (2560×1440, text inside the 1546×423 safe area).
usage (from reels/opuscar/channel): python3 -I make.py"""
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
NAVY, Y, BLUE, WHITE = (10, 16, 30), (252, 204, 10), (40, 120, 220), (255, 255, 255)
FONT = '../gerd/assets/thumb/RobotoCondensed.ttf'
def F(s):
    f = ImageFont.truetype(FONT, s); f.set_variation_by_name('Black'); return f

# —— profile: the real Earth (NASA Blue Marble) over the Nile, a yellow orbit ring passing behind and in front, one satellite
Image.MAX_IMAGE_PIXELS = None
K = 2; S = 800 * K; c = S / 2
yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
r0 = np.hypot(xx - c, yy - c) / S
bg = np.array(NAVY, np.float32) * (1.25 - .6 * r0)[..., None]                      # soft radial vignette
im = Image.fromarray(np.clip(bg, 0, 255).astype(np.uint8))
# globe (orthographic), centred on the upper Nile, sunlit from the upper left
G = 268 * K; LON0, LAT0 = np.radians(30), np.radians(14)
world = np.asarray(Image.open('../egypt-long/assets/plates/world_day.jpg').convert('RGB'), np.float32) / 255
X = (xx - c) / G; Yv = -(yy - c) / G; rr = X * X + Yv * Yv; inside = rr <= 1
Z = np.sqrt(np.clip(1 - rr, 0, 1))
lat = np.arcsin(np.clip(Yv * np.cos(LAT0) + Z * np.sin(LAT0), -1, 1))
lon = LON0 + np.arctan2(X, Z * np.cos(LAT0) - Yv * np.sin(LAT0))
u = ((lon / (2 * np.pi) + .5) % 1) * (world.shape[1] - 1); v = (.5 - lat / np.pi) * (world.shape[0] - 1)
col = world[v.astype(int), u.astype(int)]
L = np.array([-.55, .45, .70]); L /= np.linalg.norm(L)
lam = np.clip(X * L[0] + Yv * L[1] + Z * L[2], 0, 1)
col = col ** 1.1 * (.25 + .95 * lam[..., None]) * 1.08
ocean = (col[..., 2] > col[..., 0] * 1.05); col[ocean] = col[ocean] * np.array([.8, 1.0, 1.45]) + np.array([0, .02, .06])
col = col * (.55 + .45 * Z[..., None] ** .5)                                       # limb darkening
rim = np.clip(1 - Z, 0, 1) ** 3                                                   # thin blue atmosphere at the edge
col = col * (1 - rim[..., None] * .5) + np.array([.35, .6, 1.0]) * rim[..., None] * .5 * (.3 + .7 * lam[..., None])
glob = Image.fromarray((np.clip(col, 0, 1) * 255).astype(np.uint8))
gmask = Image.fromarray((inside * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
glow = Image.fromarray((np.clip(1 - (np.sqrt(rr) - 1) / .09, 0, 1) * (np.sqrt(rr) > .98) * 110).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6 * K))
im.paste(Image.new('RGB', (S, S), (70, 130, 230)), (0, 0), glow)
# orbit: a tilted ellipse; the back half is drawn before the globe, the front half after it
A, B, TILT, OW = 352 * K, 110 * K, np.radians(-22), 18 * K
def orbit(t0, t1, n=400):
    t = np.linspace(t0, t1, n); ex, ey = A * np.cos(t), B * np.sin(t)
    return list(zip(c + ex * np.cos(TILT) - ey * np.sin(TILT), c + ex * np.sin(TILT) + ey * np.cos(TILT)))
def ring(front):                                    # a clean ellipse outline, drawn level and rotated; only one half kept
    m = Image.new('L', (S, S)); ImageDraw.Draw(m).ellipse((c - A - OW / 2, c - B - OW / 2, c + A + OW / 2, c + B + OW / 2), outline=255, width=OW)
    half = Image.new('L', (S, S)); ImageDraw.Draw(half).rectangle((0, c, S, S) if front else (0, 0, S, c), fill=255)
    m = ImageChops.multiply(m, half)
    return m.rotate(-np.degrees(TILT), resample=Image.BICUBIC, center=(c, c))
im.paste(Image.new("RGB", (S, S), Y), (0, 0), ring(False))
im.paste(glob, (0, 0), gmask)
im.paste(Image.new('RGB', (S, S), Y), (0, 0), ring(True)); d = ImageDraw.Draw(im)
# the satellite on the front arc, with a navy gap around it
(sx, sy), = orbit(np.radians(58), np.radians(58), 1)
d.ellipse((sx - 36 * K, sy - 36 * K, sx + 36 * K, sy + 36 * K), fill=NAVY)
d.ellipse((sx - 22 * K, sy - 22 * K, sx + 22 * K, sy + 22 * K), fill=WHITE)
im = im.resize((800, 800), Image.LANCZOS); im.save('profile.png')

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
