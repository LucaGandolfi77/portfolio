from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'icons')
os.makedirs(OUTPUT_DIR, exist_ok=True)

BG = '#11151b'
GOLD = '#f4b860'
TEAL = '#68c2b1'


def draw_icon(size, pad_pct=0):
    img = Image.new('RGB', (size, size), BG)
    draw = ImageDraw.Draw(img)
    pad = int(size * pad_pct)
    inner = size - pad * 2
    cx, cy = size // 2, size // 2
    r = inner // 2 - int(inner * 0.02)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=TEAL, width=max(2, size // 80))
    font_size = int(inner * 0.55)
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Times.ttc', font_size)
    except Exception:
        try:
            font = ImageFont.truetype('/System/Library/Fonts/Times.dfont', font_size)
        except Exception:
            font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), 'A', font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((cx - tw // 2, cy - th // 2 - bbox[1]), 'A', fill=GOLD, font=font)
    return img


sizes = {
    'icon-192.png': (192, 0),
    'icon-512.png': (512, 0),
    'icon-maskable.png': (512, 0.10),
    'apple-touch-icon.png': (180, 0),
}

for name, (size, pad) in sizes.items():
    img = draw_icon(size, pad)
    path = os.path.join(OUTPUT_DIR, name)
    img.save(path, 'PNG')
    print(f'Saved {path} ({size}x{size})')

print('Done.')
