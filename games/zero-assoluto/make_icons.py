#!/usr/bin/env python3
"""Genera le icone PNG di Zero Assoluto: anello oro con 0 e spada incrociata, sfondo notte.
Puro stdlib (zlib/struct), nessuna dipendenza."""
import struct, zlib, math, os

OUT = os.path.join(os.path.dirname(__file__), 'icons')
os.makedirs(OUT, exist_ok=True)

NIGHT   = (20, 20, 40)
INK     = (232, 228, 242)
GOLD    = (212, 168, 83)
GOLD_D  = (168, 125, 44)
LAV     = (184, 167, 216)

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def png_bytes(w, h, get):
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
    cx = min(max(x, r), w - r)
    cy = min(max(y, r), h - r)
    dx, dy = x - cx, y - cy
    return math.hypot(dx, dy) - r

def sword_icon(size, maskable=False):
    """Sfondo notte, anello dorato (lo zero) con una spada diagonale."""
    cx = cy = size / 2
    R = size * (0.40 if maskable else 0.44)
    rrect = size * 0.12 if maskable else size * 0.16

    def get(x, y):
        d = rounded_rect_mask(x, y, size, size, rrect)
        if d > 0:
            return (0, 0, 0, 0)
        col = NIGHT
        # anello (zero)
        dist = math.hypot(x - cx, y - cy)
        if abs(dist - R) < size * 0.055:
            col = GOLD
        elif dist < R:
            col = lerp(NIGHT, (30, 30, 60), (R - dist) / R * 0.6)
        # spada: linea diagonale dal basso-sinistra all'alto-destra
        # parametrizzazione della diagonale principale
        t = ((x - cx) + (y - cy)) / (size * 1.4)
        perp = ((x - cx) - (y - cy)) / math.sqrt(2)
        if 0.12 < t < 0.88 and abs(perp) < size * 0.035:
            # lama
            col = INK if t < 0.78 else GOLD
        # elsa (perpendicolare piccola)
        if 0.74 < t < 0.80 and abs(perp) < size * 0.09:
            col = GOLD_D
        # pomolo
        px = cx + 0.12 * size * math.sqrt(2) * 0.5
        py = cy - 0.12 * size * math.sqrt(2) * 0.5
        if math.hypot(x - (cx - 0.09 * size), y - (cy + 0.09 * size)) < size * 0.045:
            col = GOLD
        return col + (255,)

    return png_bytes(size, size, get)

for size in (192, 512):
    with open(os.path.join(OUT, f'icon-{size}.png'), 'wb') as f:
        f.write(sword_icon(size, maskable=False))
    print(f'icon-{size}.png ok')

with open(os.path.join(OUT, 'icon-maskable.png'), 'wb') as f:
    f.write(sword_icon(512, maskable=True))
print('icon-maskable.png ok')

with open(os.path.join(OUT, 'apple-touch-icon.png'), 'wb') as f:
    f.write(sword_icon(180, maskable=True))
print('apple-touch-icon.png ok')
