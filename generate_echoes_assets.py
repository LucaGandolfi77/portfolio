#!/usr/bin/env python3
"""Generate store assets for Echoes of the Last Dawn.
Dark theme with gold accents — bell tower silhouette."""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math

GAME = {
    "name": "L'Ultimo Rintocco",
    "tagline": "Echoes of the Last Dawn",
    "bg_color": (11, 14, 23),      # #0b0e17
    "accent": (212, 175, 90),       # #d4af5a
    "accent_dark": (160, 130, 60),
    "text_color": (232, 228, 216),  # #e8e4d8
    "glow": (255, 200, 100),
    "red": (193, 75, 63),          # #c14b3f (Elia)
}

BASE_DIR = os.path.dirname(__file__)
ICON_SIZES = [192, 512, 1024]
SPLASH_SIZE = (2732, 2732)
FEATURE_GRAPHIC_SIZE = (1024, 500)


def make_icon(size):
    """Bell tower silhouette on dark background with gold glow."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=size // 10, fill=GAME['bg_color'])

    cx, cy = size // 2, size // 2

    # Glow circle behind tower
    for r in range(int(size * 0.42), int(size * 0.15), -3):
        alpha = int(25 * (1 - (r - size * 0.15) / (size * 0.27)))
        c = GAME['glow'] + (max(0, alpha),)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)

    # Tower body
    tw = int(size * 0.18)
    th = int(size * 0.55)
    tx = cx - tw // 2
    ty = cy - th // 2 + int(size * 0.05)
    draw.rectangle([tx, ty, tx + tw, ty + th], fill=GAME['accent'])

    # Tower top (pointed)
    peak = [
        (cx - tw // 2 - int(size * 0.04), ty),
        (cx, ty - int(size * 0.18)),
        (cx + tw // 2 + int(size * 0.04), ty),
    ]
    draw.polygon(peak, fill=GAME['accent'])

    # Bell opening
    bell_y = ty + int(th * 0.15)
    bell_r = int(tw * 0.35)
    draw.ellipse([cx - bell_r, bell_y - bell_r, cx + bell_r, bell_y + bell_r],
                 fill=GAME['bg_color'])

    # Bell inside
    bell_inner = int(bell_r * 0.6)
    draw.ellipse([cx - bell_inner, bell_y - bell_inner + 2, cx + bell_inner, bell_y + bell_inner + 2],
                 fill=GAME['glow'] + (180,))

    # Windows
    for wy in [ty + int(th * 0.45), ty + int(th * 0.65)]:
        ww = int(tw * 0.2)
        wh = int(tw * 0.3)
        draw.rounded_rectangle([cx - ww, wy, cx + ww, wy + wh], radius=ww, fill=GAME['bg_color'])

    # Ground
    ground_y = ty + th
    draw.rectangle([0, ground_y, size, size], fill=(18, 22, 35))

    # Stars
    import random
    random.seed(42)
    for _ in range(15):
        sx = random.randint(int(size * 0.05), int(size * 0.95))
        sy = random.randint(int(size * 0.02), ground_y - int(size * 0.05))
        sr = random.randint(1, max(2, size // 300))
        draw.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=GAME['text_color'] + (120,))

    # App name at bottom
    font_size = max(12, size // 14)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        font = ImageFont.load_default()

    name = "L'Ultimo Rintocco"
    bbox = draw.textbbox((0, 0), name, font=font)
    tw_text = bbox[2] - bbox[0]
    tx_text = (size - tw_text) // 2
    ty_text = int(size * 0.84)
    draw.text((tx_text + 1, ty_text + 1), name, fill=(0, 0, 0, 100), font=font)
    draw.text((tx_text, ty_text), name, fill=GAME['text_color'] + (240,), font=font)

    return img


def make_splash():
    w, h = SPLASH_SIZE
    img = Image.new('RGBA', (w, h), GAME['bg_color'] + (255,))
    draw = ImageDraw.Draw(img)

    # Subtle gradient
    for y in range(h):
        t = y / h
        alpha = int(20 * math.sin(t * math.pi))
        draw.line([(0, y), (w, y)], fill=GAME['accent'] + (alpha,))

    # Icon centered
    icon_size = min(w, h) // 3
    icon = make_icon(icon_size)
    paste_x = (w - icon_size) // 2
    paste_y = (h - icon_size) // 2 - h // 10
    img.paste(icon, (paste_x, paste_y), icon)

    # Title
    font_size = w // 14
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        font = ImageFont.load_default()

    name = "L'ULTIMO RINTOCCO"
    bbox = draw.textbbox((0, 0), name, font=font)
    tw = bbox[2] - bbox[0]
    tx = (w - tw) // 2
    ty = paste_y + icon_size + h // 15
    draw.text((tx + 2, ty + 2), name, fill=(0, 0, 0, 60), font=font)
    draw.text((tx, ty), name, fill=GAME['text_color'] + (255,), font=font)

    # Tagline
    tag_size = w // 28
    try:
        tfont = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", tag_size)
    except:
        tfont = ImageFont.load_default()
    tag = "un rintocco · una scelta · una memoria"
    bbox2 = draw.textbbox((0, 0), tag, font=tfont)
    tw2 = bbox2[2] - bbox2[0]
    tx2 = (w - tw2) // 2
    ty2 = ty + font_size + h // 40
    draw.text((tx2, ty2), tag, fill=GAME['accent'] + (200,), font=tfont)

    return img.convert('RGB')


def make_feature_graphic():
    w, h = FEATURE_GRAPHIC_SIZE
    img = Image.new('RGBA', (w, h), GAME['bg_color'] + (255,))

    # Diagonal gradient
    for y in range(h):
        for x in range(w):
            t = (x / w * 0.6 + y / h * 0.4)
            c = tuple(int(GAME['bg_color'][i] * (1 - t) + GAME['accent_dark'][i] * t) for i in range(3))
            img.putpixel((x, y), c + (255,))

    # Glow
    glow_r = h * 0.6
    glow_img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_img)
    gd.ellipse([w // 2 - int(glow_r), h // 2 - int(glow_r),
                w // 2 + int(glow_r), h // 2 + int(glow_r)],
               fill=GAME['glow'] + (25,))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=40))
    img = Image.alpha_composite(img, glow_img)

    # Small icon
    icon_size = int(h * 0.55)
    icon = make_icon(icon_size)
    paste_x = int(w * 0.08)
    paste_y = (h - icon_size) // 2
    img.paste(icon, (paste_x, paste_y), icon)

    # Title
    draw = ImageDraw.Draw(img)
    font_size = h // 5
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        font = ImageFont.load_default()
    tx = int(w * 0.40)
    ty = int(h * 0.15)
    draw.text((tx + 2, ty + 2), GAME['name'], fill=(0, 0, 0, 80), font=font)
    draw.text((tx, ty), GAME['name'], fill=GAME['text_color'] + (255,), font=font)

    # Tagline
    tag_size = h // 10
    try:
        tfont = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", tag_size)
    except:
        tfont = ImageFont.load_default()
    ty2 = ty + font_size + h // 12
    draw.text((tx, ty2), GAME['tagline'], fill=GAME['accent'] + (220,), font=tfont)

    # Decorative line
    line_y = ty2 + tag_size + h // 15
    draw.line([(tx, line_y), (tx + w * 0.5, line_y)], fill=GAME['accent'] + (100,), width=max(2, h // 100))

    return img.convert('RGB')


def generate():
    game_dir = os.path.join(BASE_DIR, 'echoes-of-the-last-dawn')
    icons_dir = os.path.join(game_dir, 'icons')
    resources_dir = os.path.join(game_dir, 'resources')
    os.makedirs(icons_dir, exist_ok=True)
    os.makedirs(resources_dir, exist_ok=True)

    print("=== Echoes of the Last Dawn ===")

    for size in ICON_SIZES:
        icon = make_icon(size)
        icon.save(os.path.join(icons_dir, f'icon-{size}.png'), 'PNG')
        print(f"  icon-{size}.png")

    # Maskable
    maskable = make_icon(512)
    padding = 512 // 10
    canvas = Image.new('RGBA', (512, 512), GAME['bg_color'] + (255,))
    inner_size = 512 - padding * 2
    inner = maskable.resize((inner_size, inner_size), Image.LANCZOS)
    canvas.paste(inner, (padding, padding), inner)
    canvas.save(os.path.join(icons_dir, 'icon-maskable.png'), 'PNG')
    print("  icon-maskable.png")

    # Apple touch
    apple = make_icon(180)
    apple.save(os.path.join(icons_dir, 'apple-touch-icon.png'), 'PNG')
    print("  apple-touch-icon.png")

    # Splash
    splash = make_splash()
    splash.save(os.path.join(resources_dir, 'splash.png'), 'PNG')
    print("  splash.png")

    # Feature graphic
    feature = make_feature_graphic()
    feature.save(os.path.join(resources_dir, 'feature-graphic.png'), 'PNG')
    print("  feature-graphic.png")

    # Android splash sizes
    for orient in ['land', 'port']:
        for dpi in ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']:
            scale = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}[dpi]
            sw, sh = (int(960 * scale), int(540 * scale)) if orient == 'land' else (int(540 * scale), int(960 * scale))
            resized = splash.resize((sw, sh), Image.LANCZOS)
            splash_dir = os.path.join(game_dir, 'android', 'app', 'src', 'main', 'res', f'drawable-{orient}-{dpi}')
            os.makedirs(splash_dir, exist_ok=True)
            resized.save(os.path.join(splash_dir, 'splash.png'), 'PNG')
    print("  Android splash (10 sizes)")

    # iOS splash
    ios_splash_dir = os.path.join(game_dir, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset')
    if os.path.exists(ios_splash_dir):
        splash_1x = splash.resize((2732, 2732), Image.LANCZOS)
        splash_1x.save(os.path.join(ios_splash_dir, 'splash-2732x2732.png'), 'PNG')
        splash_1x.save(os.path.join(ios_splash_dir, 'splash-2732x2732-1.png'), 'PNG')
        splash_1x.save(os.path.join(ios_splash_dir, 'splash-2732x2732-2.png'), 'PNG')
        print("  iOS splash")

    print("\nDone!")


if __name__ == '__main__':
    generate()
