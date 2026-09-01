#!/usr/bin/env python3
"""Generate VITE Carrère icons — Adelphi-style book."""
import struct, zlib, os, math

def create_png(width, height, pixels):
    def chunk(chunk_type, data):
        c = chunk_type + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    raw = b''
    for y in range(height):
        raw += b'\x00'
        for x in range(width):
            idx = (y * width + x) * 4
            raw += pixels[idx:idx+4]
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    return sig + chunk(b'IHDR', ihdr) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')

def lerp(a, b, t):
    return int(a + (b - a) * t)

def generate_icon(size):
    pixels = bytearray(size * size * 4)
    bg_top = (247, 242, 231)
    bg_bot = (237, 229, 213)
    gold = (184, 146, 62)
    ink = (31, 36, 48)
    for y in range(size):
        t = y / size
        br = lerp(bg_top[0], bg_bot[0], t)
        bg_ = lerp(bg_top[1], bg_bot[1], t)
        bb = lerp(bg_top[2], bg_bot[2], t)
        for x in range(size):
            idx = (y * size + x) * 4
            cx, cy = size * 0.5, size * 0.48
            dx = x - cx
            dy = y - cy
            dist = (dx*dx + dy*dy) ** 0.5
            nw = size * 0.35
            nh = size * 0.42
            inBook = abs(dx) < nw and abs(dy) < nh
            if inBook:
                edge_x = abs(abs(dx) - nw) < size * 0.015
                edge_y = abs(abs(dy) - nh) < size * 0.015
                if edge_x or edge_y:
                    pixels[idx] = gold[0]; pixels[idx+1] = gold[1]; pixels[idx+2] = gold[2]; pixels[idx+3] = 255
                elif abs(dx) > nw * 0.85:
                    pixels[idx] = lerp(ink[0], bg_bot[0], 0.1)
                    pixels[idx+1] = lerp(ink[1], bg_bot[1], 0.1)
                    pixels[idx+2] = lerp(ink[2], bg_bot[2], 0.1)
                    pixels[idx+3] = 255
                else:
                    spine = abs(dx) < size * 0.01
                    if spine:
                        pixels[idx] = gold[0]; pixels[idx+1] = gold[1]; pixels[idx+2] = gold[2]; pixels[idx+3] = 255
                    else:
                        pixels[idx] = br; pixels[idx+1] = bg_; pixels[idx+2] = bb; pixels[idx+3] = 255
            else:
                pixels[idx] = br; pixels[idx+1] = bg_; pixels[idx+2] = bb; pixels[idx+3] = 255
    return create_png(size, size, bytes(pixels))

def generate_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="0" fill="#f7f2e7"/>
  <rect x="120" y="80" width="272" height="352" rx="4" fill="#1f2430"/>
  <rect x="124" y="84" width="264" height="344" rx="2" fill="#f7f2e7"/>
  <line x1="256" y1="84" x2="256" y2="428" stroke="#b8923e" stroke-width="3"/>
  <rect x="140" y="120" width="100" height="2" fill="#b8923e" opacity=".6"/>
  <rect x="140" y="140" width="80" height="2" fill="#b8923e" opacity=".4"/>
  <rect x="272" y="120" width="100" height="2" fill="#b8923e" opacity=".6"/>
  <rect x="272" y="140" width="80" height="2" fill="#b8923e" opacity=".4"/>
  <text x="256" y="300" text-anchor="middle" fill="#1f2430" font-family="Georgia,serif" font-size="48" font-weight="400" letter-spacing="6">VITE</text>
  <text x="256" y="340" text-anchor="middle" fill="#5c5a52" font-family="Georgia,serif" font-size="14" font-style="italic">Emmanuel Carrère</text>
  <rect x="120" y="80" width="272" height="352" rx="4" fill="none" stroke="#b8923e" stroke-width="4"/>
</svg>'''

if __name__ == '__main__':
    icons_dir = os.path.join(os.path.dirname(__file__), 'icons')
    os.makedirs(icons_dir, exist_ok=True)
    print("Generating icon-192.png...")
    with open(os.path.join(icons_dir, 'icon-192.png'), 'wb') as f:
        f.write(generate_icon(192))
    print("Generating icon-512.png...")
    with open(os.path.join(icons_dir, 'icon-512.png'), 'wb') as f:
        f.write(generate_icon(512))
    print("Generating apple-touch-icon.png (180)...")
    with open(os.path.join(icons_dir, 'apple-touch-icon.png'), 'wb') as f:
        f.write(generate_icon(180))
    print("Generating icon.svg...")
    with open(os.path.join(icons_dir, 'icon.svg'), 'w') as f:
        f.write(generate_svg())
    print("Done!")
