"""YouTube thumbnail: the ChatGPT-made illustration on the left (the dam is illustrative), REAL Landsat on the right
(the same canyon, 9 Feb 2020 vs 8 Jan 2026; water = MNDWI > 0, tinted blue so it reads at phone size).
usage: python3 -I tools/thumb.py   → thumbnail.jpg (1280×720)"""
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H = 1600, 900
src = Image.open('assets/thumb/chatgpt.png').convert('RGB')
sw, sh = src.size
# the illustration above its own text (y < 566 of 941), scaled to fill the top band
TOP = 560
ill = src.crop((0, 0, int(sw * .66), int(566 / 941 * sh)))
ill = ill.resize((int(ill.width * TOP / ill.height), TOP), Image.LANCZOS)
img = Image.new('RGB', (W, H), (10, 16, 30)); img.paste(ill, (0, 0))

def landsat(year, box):
    z = np.load(f'assets/raw/res_{year}.npz'); b = z['bands'].astype(np.float32) * 2.75e-5 - .2
    x0, y0, x1, y1 = box; b = b[:, y0:y1, x0:x1]
    rgb = np.stack([b[0], b[1], b[2]], -1)
    lo, hi = np.percentile(rgb, 1), np.percentile(rgb, 99.5)
    out = np.clip((rgb - lo) / (hi - lo), 0, 1) ** .85
    L = out.mean(-1, keepdims=True); out = np.clip(L + (out - L) * 1.1, 0, 1)
    g, sw_ = b[1], b[4]; water = (g - sw_) / (g + sw_ + 1e-6) > 0
    water = np.array(Image.fromarray((water * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0   # grown 2 px (both years alike) so the 2020 river survives the downscale
    m = np.array(Image.fromarray((water * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))) / 255.
    blue = np.array([.08, .38, .78]) * (.75 + .5 * L)
    out = out * (1 - m[..., None] * .9) + blue * m[..., None] * .9
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))

BOX = (170, 120, 1120, 1330)                    # px in the 0.0005°/px plate: the dam (top left) and the reservoir
PW, PH = 480, TOP
L1, L2 = (1060, 900), (1360, 1200)              # the two diagonals: x at y=0 and at y=TOP
from PIL import ImageChops
for k, yr in enumerate((2020, 2026)):
    p = landsat(yr, BOX).resize((PW, PH), Image.LANCZOS)
    x0 = (L1[1] - 10) if k == 0 else (W - PW + 80)   # same window as the 2020 panel
    mask = Image.new('L', (W, H)); md = ImageDraw.Draw(mask)
    md.polygon([(L1[0], 0), (L2[0], 0), (L2[1], TOP), (L1[1], TOP)] if k == 0 else [(L2[0], 0), (W, 0), (W, TOP), (L2[1], TOP)], fill=255)
    layer = Image.new('RGB', (W, H)); layer.paste(p, (x0, 0)); img.paste(layer, (0, 0), mask)
d = ImageDraw.Draw(img)
Y = (255, 204, 0)
d.line([(L1[0], 0), (L1[1], TOP)], fill=Y, width=10); d.line([(L2[0], 0), (L2[1], TOP)], fill=(255, 255, 255), width=7)
F = lambda s: ImageFont.truetype('assets/thumb/Anton.ttf', s)
def tag(x, y, t, s=64):
    f = F(s); w = d.textlength(t, font=f); d.rectangle((x - 14, y, x + w + 14, y + s * 1.18), fill=Y)
    d.text((x, y - s * .16), t, font=f, fill=(0, 0, 0))
tag(1100, 22, '2020'); tag(1410, 22, '2026')
# headline on a dark band
d.rectangle((0, TOP, W, H), fill=(10, 16, 30))
f = F(128); t1 = "EGYPT’S WATER,"; t2 = "ETHIOPIA’S DAM"; w1, w2 = d.textlength(t1, font=f), d.textlength(t2, font=f)
d.text(((W - w1) / 2, TOP - 2), t1, font=f, fill=(255, 255, 255))
d.rectangle(((W - w2) / 2 - 28, TOP + 172, (W + w2) / 2 + 28, H - 12), fill=Y)
d.text(((W - w2) / 2, TOP + 148), t2, font=f, fill=(0, 0, 0))
img.resize((1280, 720), Image.LANCZOS).save('thumbnail.jpg', quality=90)
print('thumbnail.jpg')
