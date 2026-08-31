#!/usr/bin/env python3
"""Genera le icone PNG di De Rerum Gatta: fiore con gattino al centro, sfondo crema.
Puro stdlib (zlib/struct), nessuna dipendenza."""
import struct, zlib, math, os

OUT = os.path.join(os.path.dirname(__file__), 'icons')
os.makedirs(OUT, exist_ok=True)

# palette coccolosa
CREAM   = (253, 246, 236)
PINK    = (232, 160, 180)
PINK_D  = (176, 82, 104)
GOLD    = (212, 168, 83)
SAGE    = (157, 184, 155)
INK     = (74, 58, 51)
WHITE   = (255, 255, 255)
LAV     = (184, 167, 216)

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def png_bytes(w, h, get):
    """get(x, y) -> (r,g,b,a)"""
    rows = []
    for y in range(h):
        row = bytearray([0])
        for x in range(w):
            row += bytes(get(x, y))
        rows.append(bytes(row))
    raw = b''.join(rows)

    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        c += struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
        return c

    ihdr = struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr)
            + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))

def rounded_rect_mask(x, y, w, h, r):
    """distanza firmata dal bordo arrotondato: <=0 dentro"""
    cx = min(max(x, r), w - r)
    cy = min(max(y, r), h - r)
    dx, dy = x - cx, y - cy
    return math.hypot(dx, dy) - r

def flower_icon(size, padding_ratio=0.06, maskable=False):
    """fiore con 8 petali (Fibonacci!) e gattino al centro"""
    R = size * (0.46 if maskable else 0.50)
    cx = cy = size / 2
    pad = size * padding_ratio
    rrect = size * 0.10 if maskable else size * 0.14

    def get(x, y):
        # sfondo
        d = rounded_rect_mask(x, y, size, size, rrect)
        if d > 0:
            return (0, 0, 0, 0)
        col = CREAM
        if maskable and d > -size * 0.05:
            # bordo interno morbido
            t = min(1.0, -d / (size * 0.05))
            col = lerp(CREAM, (246, 236, 220), t)
        # petali
        for i in range(8):
            ang = i * math.pi / 4
            px = cx + math.cos(ang) * R * 0.62
            py = cy + math.sin(ang) * R * 0.62
            dx, dy = x - px, y - py
            # petalo ellittico ruotato
            ca, sa = math.cos(ang), math.sin(ang)
            ex = dx * ca + dy * sa
            ey = -dx * sa + dy * ca
            a = R * 0.34
            b = R * 0.20
            if (ex / a) ** 2 + (ey / b) ** 2 <= 1:
                t = abs(ey) / b
                col = lerp(PINK, (255, 245, 248), min(1, t * 0.7))
                # bordo delicato
                if (ex / a) ** 2 + (ey / b) ** 2 >= 0.72:
                    col = lerp(col, PINK_D, 0.35)
        # centro (testa del gatto)
        dx, dy = x - cx, y - cy
        if math.hypot(dx, dy) <= R * 0.30:
            col = GOLD
        # orecchie del gattino
        for s in (-1, 1):
            ox = cx + s * R * 0.13
            oy = cy - R * 0.24
            if abs(x - ox) < R * 0.10 and abs(y - oy) < R * 0.10:
                if abs(x - ox) + abs(y - oy) < R * 0.14:
                    col = PINK_D if maskable else INK
        # occhi
        for s in (-1, 1):
            ox = cx + s * R * 0.11
            oy = cy - R * 0.03
            if math.hypot(x - ox, y - oy) <= R * 0.055:
                col = INK
        # naso
        if math.hypot(x - cx, y - (cy + R * 0.10)) <= R * 0.035:
            col = PINK_D
        # baffi
        for s in (-1, 1):
            if abs(y - (cy + R * 0.06)) < R * 0.02:
                if s == 1 and cx + R * 0.08 < x < cx + R * 0.28:
                    col = INK
                if s == -1 and cx - R * 0.28 < x < cx - R * 0.08:
                    col = INK
        return col + (255,)

    return png_bytes(size, size, get)

for size in (192, 512):
    with open(os.path.join(OUT, f'icon-{size}.png'), 'wb') as f:
        f.write(flower_icon(size, maskable=False))
    print(f'icon-{size}.png ok')

with open(os.path.join(OUT, 'icon-maskable.png'), 'wb') as f:
    f.write(flower_icon(512, maskable=True))
print('icon-maskable.png ok')

with open(os.path.join(OUT, 'apple-touch-icon.png'), 'wb') as f:
    f.write(flower_icon(180, maskable=True))
print('apple-touch-icon.png ok')
