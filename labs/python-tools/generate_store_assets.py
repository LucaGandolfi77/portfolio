#!/usr/bin/env python3
"""Unified store asset generator for Arrowmatic, Orto Magico, and De Rerum Gatta.
Uses Pillow for all rendering — icons, splash screens, and feature graphics."""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math

# ============================================================
# GAME DEFINITIONS
# ============================================================

GAMES = {
    "arrowmatic": {
        "name": "Arrowmatic",
        "tagline": "Arrow Storm",
        "bg_color": (18, 18, 58),       # #12123a
        "accent": (255, 94, 168),        # #ff5ea8
        "accent_dark": (180, 50, 110),
        "text_color": (255, 255, 255),
        "glow": (255, 150, 200),
        "type": "action",
    },
    "orto-magico": {
        "name": "Orto Magico",
        "tagline": "Idle Garden",
        "bg_color": (45, 80, 22),        # #2d5016
        "accent": (76, 175, 80),         # #4caf50
        "accent_dark": (40, 100, 44),
        "text_color": (255, 255, 255),
        "glow": (130, 220, 135),
        "type": "simulation",
    },
    "de-rerum-gatta": {
        "name": "De Rerum Gatta",
        "tagline": "Il Giardino dell'Universo",
        "bg_color": (253, 246, 236),     # #fdf6ec
        "accent": (232, 168, 124),       # #e8a87c
        "accent_dark": (200, 130, 80),
        "text_color": (74, 58, 51),      # #4a3a33
        "glow": (240, 210, 170),
        "type": "educational",
    },
}

ICON_SIZES = [192, 512, 1024]
MASKABLE_SIZES = [512]
APPLE_TOUCH_SIZE = 180
SPLASH_SIZE = (2732, 2732)  # iPad Pro 12.9"
FEATURE_GRAPHIC_SIZE = (1024, 500)

BASE_DIR = os.path.dirname(__file__)


def make_icon(size, bg, accent, accent_dark, glow, name, icon_type):
    """Generate app icon with geometric design."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=size // 10, fill=bg)

    # Determine icon type and draw
    if icon_type == "action":
        _draw_arrow_icon(draw, size, accent, accent_dark, glow)
    elif icon_type == "simulation":
        _draw_plant_icon(draw, size, accent, accent_dark, glow)
    elif icon_type == "educational":
        _draw_flower_icon(draw, size, accent, accent_dark, glow)

    # App name text at bottom
    font_size = max(14, size // 12)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), name, font=font)
    tw = bbox[2] - bbox[0]
    tx = (size - tw) // 2
    ty = int(size * 0.82)
    # Shadow
    draw.text((tx + 1, ty + 1), name, fill=(0, 0, 0, 120), font=font)
    draw.text((tx, ty), name, fill=(255, 255, 255, 240), font=font)

    return img


def _draw_arrow_icon(draw, size, accent, accent_dark, glow):
    """Concentric arcs + lightning bolt — Arrowmatic."""
    cx, cy = size // 2, size // 2
    R = size * 0.35

    # Glow circle
    for r in range(int(R * 1.3), int(R * 0.5), -2):
        alpha = int(40 * (1 - (r - R * 0.5) / (R * 0.8)))
        c = glow + (max(0, alpha),)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)

    # Concentric arcs
    for i, r in enumerate([R, R * 0.7, R * 0.45]):
        color = accent if i % 2 == 0 else accent_dark
        w = max(2, int(size * 0.025))
        draw.arc([cx - r, cy - r, cx + r, cy + r], start=30 + i * 40, end=150 + i * 40,
                 fill=color, width=w)

    # Lightning bolt
    bolt = [
        (cx - size * 0.04, cy - R * 0.3),
        (cx + size * 0.10, cy - R * 0.15),
        (cx + size * 0.02, cy - R * 0.05),
        (cx + size * 0.14, cy + R * 0.15),
        (cx - size * 0.02, cy + R * 0.05),
        (cx + size * 0.04, cy + R * 0.15),
    ]
    draw.polygon(bolt, fill=accent)


def _draw_plant_icon(draw, size, accent, accent_dark, glow):
    """Stylized plant sprout with soil — Orto Magico."""
    cx, cy = size // 2, size // 2

    # Soil
    soil_y = int(cy + size * 0.18)
    draw.ellipse([cx - size * 0.35, soil_y, cx + size * 0.35, soil_y + size * 0.15],
                 fill=(90, 60, 30))

    # Stem
    stem_w = max(3, int(size * 0.03))
    draw.rectangle([cx - stem_w, cy + size * 0.02, cx + stem_w, soil_y], fill=accent)

    # Leaves
    for i, (dx, dy, angle) in enumerate([
        (-0.15, 0.05, -30),
        (0.15, 0.08, 30),
        (-0.12, -0.05, -20),
        (0.12, -0.02, 20),
    ]):
        leaf_size = size * 0.18
        lx = cx + int(dx * size)
        ly = cy + int(dy * size)
        # Leaf as rotated ellipse
        leaf = Image.new('RGBA', (int(leaf_size), int(leaf_size * 0.5)), (0, 0, 0, 0))
        ld = ImageDraw.Draw(leaf)
        ld.ellipse([0, 0, int(leaf_size), int(leaf_size * 0.5)], fill=accent)
        leaf = leaf.rotate(angle, expand=True, resample=Image.BICUBIC)
        paste_x = lx - leaf.width // 2
        paste_y = ly - leaf.height // 2
        draw._image.paste(leaf, (paste_x, paste_y), leaf) if hasattr(draw, '_image') else None
        # Fallback: just draw circles
        draw.ellipse([lx - leaf_size // 4, ly - leaf_size // 8,
                      lx + leaf_size // 4, ly + leaf_size // 8], fill=accent)

    # Sun
    sun_x, sun_y = int(cx + size * 0.28), int(cy - size * 0.28)
    sun_r = size * 0.08
    draw.ellipse([sun_x - sun_r, sun_y - sun_r, sun_x + sun_r, sun_y + sun_r],
                 fill=(255, 220, 80))
    for a in range(0, 360, 45):
        rx = sun_x + int(math.cos(math.radians(a)) * sun_r * 1.5)
        ry = sun_y + int(math.sin(math.radians(a)) * sun_r * 1.5)
        draw.line([sun_x, sun_y, rx, ry], fill=(255, 220, 80), width=max(1, int(size * 0.01)))


def _draw_flower_icon(draw, size, accent, accent_dark, glow):
    """8-petal Fibonacci flower + cat face — De Rerum Gatta."""
    cx, cy = size // 2, size // 2
    R = size * 0.35

    # Petals
    for i in range(8):
        angle = i * math.pi / 4
        px = cx + math.cos(angle) * R * 0.55
        py = cy + math.sin(angle) * R * 0.55
        petal_r = R * 0.32
        draw.ellipse([px - petal_r, py - petal_r * 0.6,
                       px + petal_r, py + petal_r * 0.6], fill=accent)

    # Center (cat face)
    cat_r = R * 0.30
    draw.ellipse([cx - cat_r, cy - cat_r, cx + cat_r, cy + cat_r], fill=(212, 168, 83))

    # Ears
    for s in (-1, 1):
        ex = cx + int(s * R * 0.15)
        ey = int(cy - R * 0.28)
        ear_s = int(R * 0.12)
        draw.polygon([(ex - ear_s, ey + ear_s), (ex, ey - ear_s), (ex + ear_s, ey + ear_s)],
                     fill=accent_dark)

    # Eyes
    for s in (-1, 1):
        ox = cx + int(s * R * 0.12)
        oy = int(cy - R * 0.02)
        eye_r = int(R * 0.06)
        draw.ellipse([ox - eye_r, oy - eye_r, ox + eye_r, oy + eye_r], fill=(74, 58, 51))

    # Nose
    nr = int(R * 0.04)
    ny = int(cy + R * 0.10)
    draw.ellipse([cx - nr, ny - nr, cx + nr, ny + nr], fill=accent_dark)


def make_splash(g):
    """Generate splash screen — centered logo on brand background."""
    w, h = SPLASH_SIZE
    img = Image.new('RGBA', (w, h), g['bg_color'] + (255,))
    draw = ImageDraw.Draw(img)

    # Subtle gradient overlay
    for y in range(h):
        t = y / h
        alpha = int(30 * math.sin(t * math.pi))
        draw.line([(0, y), (w, y)], fill=g['accent'] + (alpha,))

    # Generate small icon and paste centered
    icon_size = min(w, h) // 3
    icon = make_icon(icon_size, g['bg_color'], g['accent'], g['accent_dark'], g['glow'], g['name'], g['type'])
    paste_x = (w - icon_size) // 2
    paste_y = (h - icon_size) // 2 - h // 10
    img.paste(icon, (paste_x, paste_y), icon)

    # App name
    font_size = w // 14
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), g['name'], font=font)
    tw = bbox[2] - bbox[0]
    tx = (w - tw) // 2
    ty = paste_y + icon_size + h // 15
    draw.text((tx + 2, ty + 2), g['name'], fill=(0, 0, 0, 60), font=font)
    draw.text((tx, ty), g['name'], fill=g['text_color'] + (255,), font=font)

    # Tagline
    tag_size = w // 28
    try:
        tfont = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", tag_size)
    except:
        tfont = ImageFont.load_default()
    bbox2 = draw.textbbox((0, 0), g['tagline'], font=tfont)
    tw2 = bbox2[2] - bbox2[0]
    tx2 = (w - tw2) // 2
    ty2 = ty + font_size + h // 40
    draw.text((tx2, ty2), g['tagline'], fill=g['accent'] + (200,), font=tfont)

    return img.convert('RGB')


def make_feature_graphic(g):
    """Generate feature graphic — 1024x500 with gradient + logo."""
    w, h = FEATURE_GRAPHIC_SIZE
    img = Image.new('RGBA', (w, h), g['bg_color'] + (255,))
    draw = ImageDraw.Draw(img)

    # Diagonal gradient
    for y in range(h):
        for x in range(w):
            t = (x / w * 0.6 + y / h * 0.4)
            c = tuple(int(g['bg_color'][i] * (1 - t) + g['accent_dark'][i] * t) for i in range(3))
            img.putpixel((x, y), c + (255,))

    # Glow circle
    glow_r = h * 0.6
    glow_img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_img)
    gd.ellipse([w // 2 - int(glow_r), h // 2 - int(glow_r),
                w // 2 + int(glow_r), h // 2 + int(glow_r)],
               fill=g['glow'] + (30,))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=40))
    img = Image.alpha_composite(img, glow_img)

    # Small icon
    icon_size = int(h * 0.55)
    icon = make_icon(icon_size, g['bg_color'], g['accent'], g['accent_dark'], g['glow'], g['name'], g['type'])
    paste_x = int(w * 0.08)
    paste_y = (h - icon_size) // 2
    img.paste(icon, (paste_x, paste_y), icon)

    # App name
    draw = ImageDraw.Draw(img)
    font_size = h // 5
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        font = ImageFont.load_default()
    tx = int(w * 0.40)
    ty = int(h * 0.15)
    draw.text((tx + 2, ty + 2), g['name'], fill=(0, 0, 0, 80), font=font)
    draw.text((tx, ty), g['name'], fill=g['text_color'] + (255,), font=font)

    # Tagline
    tag_size = h // 10
    try:
        tfont = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", tag_size)
    except:
        tfont = ImageFont.load_default()
    ty2 = ty + font_size + h // 12
    draw.text((tx, ty2), g['tagline'], fill=g['accent'] + (220,), font=tfont)

    # Decorative lines
    line_y = ty2 + tag_size + h // 15
    draw.line([(tx, line_y), (tx + w * 0.5, line_y)], fill=g['accent'] + (100,), width=max(2, h // 100))

    return img.convert('RGB')


def generate_for_game(game_key):
    """Generate all store assets for a game."""
    g = GAMES[game_key]
    game_dir = os.path.join(BASE_DIR, game_key)
    icons_dir = os.path.join(game_dir, 'icons')
    resources_dir = os.path.join(game_dir, 'resources')
    os.makedirs(icons_dir, exist_ok=True)
    os.makedirs(resources_dir, exist_ok=True)

    print(f"\n=== {g['name']} ===")

    # App icons
    for size in ICON_SIZES:
        icon = make_icon(size, g['bg_color'], g['accent'], g['accent_dark'], g['glow'], g['name'], g['type'])
        path = os.path.join(icons_dir, f'icon-{size}.png')
        icon.save(path, 'PNG')
        print(f"  icon-{size}.png")

    # Maskable icon
    maskable = make_icon(MASKABLE_SIZES[0], g['bg_color'], g['accent'], g['accent_dark'], g['glow'], g['name'], g['type'])
    # Add maskable padding (10%)
    padding = MASKABLE_SIZES[0] // 10
    canvas = Image.new('RGBA', (MASKABLE_SIZES[0], MASKABLE_SIZES[0]), g['bg_color'] + (255,))
    inner_size = MASKABLE_SIZES[0] - padding * 2
    inner = maskable.resize((inner_size, inner_size), Image.LANCZOS)
    canvas.paste(inner, (padding, padding), inner)
    canvas.save(os.path.join(icons_dir, 'icon-maskable.png'), 'PNG')
    print("  icon-maskable.png")

    # Apple touch icon
    apple = make_icon(APPLE_TOUCH_SIZE, g['bg_color'], g['accent'], g['accent_dark'], g['glow'], g['name'], g['type'])
    apple.save(os.path.join(icons_dir, 'apple-touch-icon.png'), 'PNG')
    print("  apple-touch-icon.png")

    # Splash screen (iOS + Android)
    splash = make_splash(g)
    splash.save(os.path.join(resources_dir, 'splash.png'), 'PNG')
    # Android splash sizes
    for orient in ['land', 'port']:
        for dpi in ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']:
            scale = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}[dpi]
            sw, sh = (int(960 * scale), int(540 * scale)) if orient == 'land' else (int(540 * scale), int(960 * scale))
            resized = splash.resize((sw, sh), Image.LANCZOS)
            splash_dir = os.path.join(game_dir, 'android', 'app', 'src', 'main', 'res', f'drawable-{orient}-{dpi}')
            os.makedirs(splash_dir, exist_ok=True)
            resized.save(os.path.join(splash_dir, 'splash.png'), 'PNG')
    print("  splash.png (generated)")

    # Feature graphic
    feature = make_feature_graphic(g)
    feature.save(os.path.join(resources_dir, 'feature-graphic.png'), 'PNG')
    print("  feature-graphic.png")

    # iOS splash images
    ios_splash_dir = os.path.join(game_dir, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset')
    if os.path.exists(ios_splash_dir):
        splash_1x = splash.resize((2732, 2732), Image.LANCZOS)
        splash_1x.save(os.path.join(ios_splash_dir, 'splash-2732x2732.png'), 'PNG')
        splash_2x = splash.resize((2732, 2732), Image.LANCZOS)
        splash_2x.save(os.path.join(ios_splash_dir, 'splash-2732x2732-1.png'), 'PNG')
        splash_3x = splash.resize((2732, 2732), Image.LANCZOS)
        splash_3x.save(os.path.join(ios_splash_dir, 'splash-2732x2732-2.png'), 'PNG')
        print("  iOS splash updated")


if __name__ == '__main__':
    for game in GAMES:
        generate_for_game(game)
    print("\nDone! All store assets generated.")
