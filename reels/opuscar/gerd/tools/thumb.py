"""YouTube thumbnail in the layout of the ChatGPT design (assets/thumb/chatgpt.png): its dam illustration on the left,
headline in Roboto Condensed Black on a yellow brush stroke, and REAL Landsat on the right in place of its invented panels
(the same window at the same scale, 9 Feb 2020 vs 8 Jan 2026; water = MNDWI > 0, grown 2 px and tinted blue to read at phone size).
usage: python3 -I tools/thumb.py   → thumbnail.jpg (1280×720)"""
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
T = 'assets/thumb/'
img = Image.open(T + 'chatgpt.png').convert('RGB'); W, H = img.size        # 1672×941: work in the design's own pixels
rng = np.random.default_rng(7)
Y = (252, 204, 10)

# —— 1. cover the design's own headline (left of the panels): darkened, blurred mirror of the water above it
cut = 584
band = img.crop((0, 2 * cut - H, W, cut)).transpose(Image.FLIP_TOP_BOTTOM).filter(ImageFilter.GaussianBlur(14))
g = np.linspace(.55, .12, H - cut)[:, None, None]
band = Image.fromarray((np.array(band, np.float32) * g + np.array([8, 14, 28]) * (1 - g)).astype(np.uint8))
img.paste(band, (0, cut))
fade = Image.new('L', (W, 40)); fade.putdata([int(255 * y / 39) for y in range(40) for _ in range(W)])
img.paste(band.crop((0, 0, W, 40)), (0, cut - 40), fade)

# —— 2. real Landsat panels
def landsat(year):
    z = np.load(f'assets/raw/res_{year}.npz'); b = z['bands'].astype(np.float32) * 2.75e-5 - .2
    rgb = np.stack([b[0], b[1], b[2]], -1); v = z['valid']
    lo, hi = np.percentile(rgb[v], 1), np.percentile(rgb[v], 99.5)
    out = np.clip((rgb - lo) / (hi - lo), 0, 1) ** .85
    L = out.mean(-1, keepdims=True); out = np.clip(L + (out - L) * 1.1, 0, 1)
    water = (b[1] - b[4]) / (b[1] + b[4] + 1e-6) > 0
    water = np.array(Image.fromarray((water * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0   # both years alike
    m = np.array(Image.fromarray((water * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))) / 255.
    blue = np.array([.10, .42, .82]) * (.75 + .5 * L)
    out = out * (1 - m[..., None] * .9) + blue * m[..., None] * .9
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)), water
S, CX, CY, DX, DY = .78, 560, 640, 1240, 400       # display px per plate px; plate point (CX,CY) sits at display (DX,DY)
def window(year):
    p, wm = landsat(year)
    x0, y0 = CX - DX / S, CY - DY / S
    box = tuple(int(round(v)) for v in (x0, y0, x0 + W / S, y0 + H / S))
    return p.crop(box).resize((W, H), Image.LANCZOS), wm, box
SPLIT = 336
def diag(y): return 1118 - (1118 - 925) * y / 570                           # the design's yellow diagonal
for k, yr in enumerate((2020, 2026)):
    p, wm, box = window(yr)
    m = Image.new('L', (W, H)); md = ImageDraw.Draw(m)
    y0, y1 = (0, SPLIT) if k == 0 else (SPLIT, H)
    md.polygon([(diag(y0), y0), (W, y0), (W, y1), (diag(y1), y1)], fill=255)
    img.paste(p, (0, 0), m)
    if k == 0: w20, b20 = wm, box
    else: w26, b26 = wm, box
d = ImageDraw.Draw(img)
d.line([(diag(0), 0), (diag(H), H)], fill=Y, width=9)
d.line([(diag(SPLIT), SPLIT), (W, SPLIT - 8)], fill=(255, 255, 255), width=7)

def water_near(wm, box, x, y):                    # the display point of the water pixel nearest (x, y)
    ys, xs = np.nonzero(wm)
    dx, dy = (xs - box[0]) * S, (ys - box[1]) * S; i = np.argmin((dx - x) ** 2 + (dy - y) ** 2); return float(dx[i]), float(dy[i])

F = lambda s: (lambda f: (f.set_variation_by_name('Black'), f)[1])(ImageFont.truetype(T + 'RobotoCondensed.ttf', s))
def tag(x, y, t, s, dot):
    f = F(s); w = d.textlength(t, font=f); bb = (x, y, x + w + 36, y + s * .98)
    d.line([dot, (bb[0], (bb[1] + bb[3]) / 2)], fill=(255, 255, 255), width=4)
    d.ellipse((dot[0] - 9, dot[1] - 9, dot[0] + 9, dot[1] + 9), fill=(255, 255, 255))
    d.rectangle(bb, fill=Y); d.text((x + 18, y + s * .49), t, font=f, fill=(0, 0, 0), anchor='lm')
    return bb
t1 = tag(1360, 92, '2020', 92, water_near(w20, b20, 1270, 180))
t2 = tag(1385, 455, '2026', 92, water_near(w26, b26, 1300, 520))
# curved arrow from the 2020 tag down to the 2026 tag
a0, a1, c = (t1[2] - 70, t1[3] + 18), (t2[0] + 95, t2[1] - 22), (t1[2] + 40, (t1[3] + t2[1]) / 2 - 40)
pts = [((1 - u) ** 2 * a0[0] + 2 * (1 - u) * u * c[0] + u * u * a1[0], (1 - u) ** 2 * a0[1] + 2 * (1 - u) * u * c[1] + u * u * a1[1]) for u in np.linspace(0, .86, 30)]
d.line(pts, fill=Y, width=15, joint='curve')
ex, ey = pts[-1]; tx, ty = a1[0] - ex, a1[1] - ey; n = (tx * tx + ty * ty) ** .5; tx, ty = tx / n, ty / n
d.polygon([(a1[0] + tx * 10, a1[1] + ty * 10), (ex - ty * 30, ey + tx * 30), (ex + ty * 30, ey - tx * 30)], fill=Y)

# —— 3. headline
def word(t, size, width, fill, shadow):
    f = F(size); w = int(d.textlength(t, font=f)); h = int(size * 1.25)
    lay = Image.new('RGBA', (w + 40, h + 40)); ImageDraw.Draw(lay).text((20, 20), t, font=f, fill=fill)
    lay = lay.resize((width + 40 * width // w, lay.height), Image.LANCZOS)
    if shadow:
        a = lay.split()[3]; sh = Image.new('RGBA', lay.size, (0, 0, 0, 0)); sh.putalpha(a.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(7)).point(lambda v: int(v * .85)))
        out = Image.new('RGBA', (lay.width + 16, lay.height + 16)); out.alpha_composite(sh, (10, 12)); out.alpha_composite(lay, (0, 0)); return out
    return lay
# brush stroke: dry-brush ends like the design's — thin bristles of very uneven length, gaps near the end,
# loose dashes past it, a slight slant, and rough top/bottom edges
bx0, bx1, by0, by1 = 30, 1505, 716, 884
M = np.zeros((H, W), np.float32)
def smooth(n, k):
    v = rng.normal(0, 1, n + 2 * k); return np.convolve(v, np.ones(k) / k, 'same')[k:k + n] * np.sqrt(k)
rows = np.arange(by0 - 6, by1 + 7); n = len(rows)
lo_end = bx0 + 40 + 22 * smooth(n, 9) + (rows - by0) * -.18      # left end: wavy, slanted
hi_end = bx1 - 40 + 22 * smooth(n, 9) + (rows - by0) * .12
y = 0
while y < n:
    h = int(rng.integers(1, 3)); yy = rows[y:y + h]                    # a bristle 1–3 px thick
    edge = min(yy[0] - by0, by1 - yy[-1])                              # rows near the top/bottom are sparser
    if edge < 0 and rng.random() < .55: y += h; continue
    L = lo_end[y] - rng.exponential(9) + (rng.random() < .25) * rng.uniform(-10, 30)
    R = hi_end[y] + rng.exponential(9) - (rng.random() < .25) * rng.uniform(-10, 30)
    if edge < 6: L += rng.uniform(10, 120); R -= rng.uniform(10, 120)  # ragged top/bottom: short bristles there
    M[yy[0]:yy[-1] + 1, max(int(L), 0):max(int(R), 0)] = 1
    for side, end in ((-1, L), (1, R)):
        for _ in range(int(rng.integers(0, 2))):                       # gaps just inside the end
            g0 = end - side * rng.uniform(3, 26); gl = rng.uniform(3, 10)
            a_, b_ = sorted((int(g0), int(g0 + side * gl))); M[yy[0]:yy[-1] + 1, max(a_, 0):max(b_, 0)] = 0
        if rng.random() < .22:                                         # a loose dash past the end
            d0 = end + side * rng.uniform(4, 16); dl = rng.uniform(4, 22)
            a_, b_ = sorted((int(d0), int(d0 + side * dl))); M[yy[0]:yy[-1] + 1, max(a_, 0):max(b_, 0)] = 1
    y += h
brush = Image.fromarray((M * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))
yl = Image.new('RGB', (W, H), Y)
shadow = brush.filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * .6))
img.paste(Image.new('RGB', (W, H)), (6, 8), shadow); img.paste(yl, (0, 0), brush)
L1 = word('EGYPT’S WATER,', 150, 1415, (255, 255, 255, 255), True)
L2 = word('ETHIOPIA’S DAM', 186, 1305, (0, 0, 0, 255), False)
rgba = img.convert('RGBA'); rgba.alpha_composite(L1, (75 - 20, 566)); rgba.alpha_composite(L2, (135 - 20, 696))
rgba.convert('RGB').resize((1280, 720), Image.LANCZOS).save('thumbnail.jpg', quality=90)
print('thumbnail.jpg')
