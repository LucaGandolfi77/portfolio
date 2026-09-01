#!/usr/bin/env python3
"""Generate FantaPanchina icons using only Python stdlib (no Pillow)."""
import struct, zlib, os

def create_png(width, height, pixels):
    """Create a minimal PNG from RGBA pixel data."""
    def chunk(chunk_type, data):
        c = chunk_type + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    
    raw = b''
    for y in range(height):
        raw += b'\x00'  # filter: none
        for x in range(width):
            idx = (y * width + x) * 4
            raw += pixels[idx:idx+4]
    
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)  # 8bit RGBA
    return sig + chunk(b'IHDR', ihdr) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')

def lerp(a, b, t):
    return int(a + (b - a) * t)

def generate_icon(size):
    pixels = bytearray(size * size * 4)
    cx, cy = size // 2, size // 2
    ball_r = size * 0.32
    bg_top = (11, 16, 32)      # #0b1020
    bg_bot = (20, 29, 51)      # #141d33
    green = (82, 255, 158)
    
    for y in range(size):
        t = y / size
        r = lerp(bg_top[0], bg_bot[0], t)
        g = lerp(bg_top[1], bg_bot[1], t)
        b = lerp(bg_top[2], bg_bot[2], t)
        
        for x in range(size):
            idx = (y * size + x) * 4
            dx = x - cx
            dy = y - cy
            dist = (dx*dx + dy*dy) ** 0.5
            
            # glow
            glow_r = size * 0.48
            if dist < glow_r:
                gt = 1.0 - (dist / glow_r)
                gr = lerp(r, green[0], gt * 0.15)
                gg = lerp(g, green[1], gt * 0.15)
                gb = lerp(b, green[2], gt * 0.15)
                pixels[idx] = min(255, gr)
                pixels[idx+1] = min(255, gg)
                pixels[idx+2] = min(255, gb)
                pixels[idx+3] = 255
            else:
                pixels[idx] = r
                pixels[idx+1] = g
                pixels[idx+2] = b
                pixels[idx+3] = 255
            
            # ball circle
            if dist < ball_r:
                bt = 1.0 - (dist / ball_r)
                br = lerp(200, 255, bt)
                bg = lerp(200, 255, bt)
                bb = lerp(200, 255, bt)
                pixels[idx] = min(255, br)
                pixels[idx+1] = min(255, bg)
                pixels[idx+2] = min(255, bb)
                pixels[idx+3] = 255
            
            # ball edge highlight
            if abs(dist - ball_r) < size * 0.02:
                pixels[idx] = min(255, green[0])
                pixels[idx+1] = min(255, green[1])
                pixels[idx+2] = min(255, green[2])
                pixels[idx+3] = 255
            
            # pentagon patches (simple black dots)
            import math
            for angle_deg in [0, 72, 144, 216, 288]:
                px = cx + math.cos(math.radians(angle_deg)) * ball_r * 0.55
                py = cy + math.sin(math.radians(angle_deg)) * ball_r * 0.55
                pd = ((x - px)**2 + (y - py)**2) ** 0.5
                pr = size * 0.06
                if pd < pr:
                    pixels[idx] = lerp(pixels[idx], 30, 0.85)
                    pixels[idx+1] = lerp(pixels[idx+1], 30, 0.85)
                    pixels[idx+2] = lerp(pixels[idx+2], 30, 0.85)
    
    return create_png(size, size, bytes(pixels))

def generate_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#141d33"/>
      <stop offset="100%" stop-color="#0b1020"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#g)"/>
  <circle cx="256" cy="256" r="140" fill="#f0f0f0" stroke="#52ff9e" stroke-width="6"/>
  <circle cx="256" cy="116" r="28" fill="#222"/>
  <circle cx="167" cy="183" r="28" fill="#222"/>
  <circle cx="345" cy="183" r="28" fill="#222"/>
  <circle cx="200" cy="300" r="28" fill="#222"/>
  <circle cx="312" cy="300" r="28" fill="#222"/>
  <text x="256" y="420" text-anchor="middle" fill="#52ff9e" font-family="system-ui,sans-serif" font-size="60" font-weight="900" letter-spacing="3">FP</text>
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
    
    print("Done! All icons generated.")
