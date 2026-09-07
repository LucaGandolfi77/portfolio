#!/usr/bin/env python3
"""
QuoteSmith Store Assets Generator
Generates icons, splash screens, and feature graphics for PWA/Play Store/App Store.
Requires: pip install Pillow
"""

from PIL import Image, ImageDraw, ImageFont
import math
import os
import struct

# ── Colors ───────────────────────────────────────────────────────────────
BG       = (16, 20, 23)        # #101417
BG_DEEP  = (11, 15, 17)        # #0b0f11
GOLD     = (233, 196, 106)     # #e9c46a
GOLD_DEEP = (184, 135, 50)     # #b88732
INK      = (243, 240, 232)     # #f3f0e8
MUTED    = (155, 168, 168)     # #9ba8a8
TEAL     = (114, 184, 168)     # #72b8a8
PANEL    = (23, 29, 32)        # #171d20

# ── Paths ────────────────────────────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))
ICONS_DIR = os.path.join(BASE, "icons")
RESOURCES_DIR = os.path.join(BASE, "resources")
ANDROID_RES = os.path.join(BASE, "android", "app", "src", "main", "res")
IOS_ASSETS = os.path.join(BASE, "ios", "App", "App", "Assets.xcassets")

# ── Helpers ──────────────────────────────────────────────────────────────
def get_font(size, bold=False):
    """Try to load a good system font; fall back to default."""
    candidates = [
        "/System/Library/Fonts/Supplemental/Georgia.ttc",
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSMono.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def rounded_rect_mask(w, h, radius):
    """Return an RGBA mask with a white rounded rectangle on black."""
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    return mask


def draw_icon_on_canvas(size, padding_pct=0):
    """
    Draw the QuoteSmith icon at the given pixel size.
    padding_pct: for maskable icons (0-100).
    Returns an RGBA Image.
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Effective drawing area (for maskable icons, shrink content)
    margin = int(size * padding_pct / 100) if padding_pct else 0
    inner = size - 2 * margin

    # Rounded-rect background
    bg_radius = int(inner * 0.219)
    d.rounded_rectangle(
        [margin, margin, margin + inner - 1, margin + inner - 1],
        radius=bg_radius,
        fill=BG,
    )

    # Centre coords
    cx = size // 2
    cy = size // 2

    # Gold circle (stroke only)
    circle_r = int(inner * 0.285)
    circle_w = max(2, int(inner * 0.047))
    d.ellipse(
        [cx - circle_r, cy - circle_r, cx + circle_r, cy + circle_r],
        outline=GOLD,
        width=circle_w,
    )

    # Speech bubble (gold fill)
    # Bubble body
    bw = int(inner * 0.37)
    bh = int(inner * 0.24)
    bx = cx - bw // 2
    by = cy - bh // 2 + int(inner * 0.03)
    bubble_r = int(inner * 0.04)
    d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=bubble_r, fill=GOLD)

    # Bubble tail (triangle pointing down-left)
    tail_x = bx + int(bw * 0.25)
    tail_top = by + bh - 2
    tail_bot = tail_top + int(inner * 0.08)
    tail_w = int(inner * 0.06)
    d.polygon(
        [(tail_x, tail_top), (tail_x - tail_w, tail_bot), (tail_x + tail_w, tail_top)],
        fill=GOLD,
    )

    # "Q" letter inside the bubble (dark text on gold)
    q_size = int(inner * 0.16)
    q_font = get_font(q_size, bold=True)
    q_bbox = d.textbbox((0, 0), "Q", font=q_font)
    qw = q_bbox[2] - q_bbox[0]
    qh = q_bbox[3] - q_bbox[1]
    qx = cx - qw // 2
    qy = cy - qh // 2 + int(inner * 0.02)
    d.text((qx, qy), "Q", fill=BG, font=q_font)

    return img


def save_png(img, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "PNG")
    print(f"  ✓ {os.path.relpath(path, BASE)}")


# ── 1. Standard icons ───────────────────────────────────────────────────
def generate_icons():
    print("\n── Icons ──")
    sizes = [192, 512, 1024]
    for sz in sizes:
        img = draw_icon_on_canvas(sz)
        save_png(img, os.path.join(ICONS_DIR, f"icon-{sz}.png"))

    # Keep original SVG reference
    print("  (icon.svg preserved)")


# ── 2. Maskable icon (512 px, 10 % safe-zone padding) ──────────────────
def generate_maskable():
    print("\n── Maskable Icon ──")
    sz = 512
    img = draw_icon_on_canvas(sz, padding_pct=10)
    save_png(img, os.path.join(ICONS_DIR, "icon-maskable-512.png"))


# ── 3. Apple touch icon (180 px) ───────────────────────────────────────
def generate_apple_touch():
    print("\n── Apple Touch Icon ──")
    img = draw_icon_on_canvas(180)
    save_png(img, os.path.join(ICONS_DIR, "apple-touch-icon.png"))


# ── 4. Splash screen (2732 × 2732) ─────────────────────────────────────
def generate_splash():
    print("\n── Splash Screen ──")
    W = H = 2732
    img = Image.new("RGBA", (W, H), BG + (255,))
    d = ImageDraw.Draw(img)

    # Icon in upper third (roughly 1/3 of height)
    icon_sz = H // 3
    icon = draw_icon_on_canvas(icon_sz)
    ix = (W - icon_sz) // 2
    iy = H // 4 - icon_sz // 4
    img.paste(icon, (ix, iy), icon)

    # "QUOTESMITH" title in gold
    title_sz = 180
    title_font = get_font(title_sz, bold=True)
    title = "QUOTESMITH"
    tb = d.textbbox((0, 0), title, font=title_font)
    tw = tb[2] - tb[0]
    tx = (W - tw) // 2
    ty = iy + icon_sz + int(H * 0.06)
    d.text((tx, ty), title, fill=GOLD, font=title_font)

    # Tagline
    tag_sz = 72
    tag_font = get_font(tag_sz)
    tag = "Who said it?"
    tgb = d.textbbox((0, 0), tag, font=tag_font)
    tgw = tgb[2] - tgb[0]
    tgx = (W - tgw) // 2
    tgy = ty + title_sz + int(H * 0.03)
    d.text((tgx, tgy), tag, fill=MUTED, font=tag_font)

    save_png(img, os.path.join(RESOURCES_DIR, "splash-2732x2732.png"))


# ── 5. Feature graphic (1024 × 500) ─────────────────────────────────────
def generate_feature_graphic():
    print("\n── Feature Graphic ──")
    W, H = 1024, 500
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Dark gradient background (vertical, BG → BG_DEEP)
    for y in range(H):
        t = y / H
        r = int(BG[0] * (1 - t) + BG_DEEP[0] * t)
        g = int(BG[1] * (1 - t) + BG_DEEP[1] * t)
        b = int(BG[2] * (1 - t) + BG_DEEP[2] * t)
        d.line([(0, y), (W, y)], fill=(r, g, b, 255))

    # Small icon on left
    icon_sz = int(H * 0.55)
    icon = draw_icon_on_canvas(icon_sz)
    ix = int(W * 0.06)
    iy = (H - icon_sz) // 2
    img.paste(icon, (ix, iy), icon)

    # Title "QuoteSmith"
    title_sz = 96
    title_font = get_font(title_sz, bold=True)
    title = "QuoteSmith"
    tb = d.textbbox((0, 0), title, font=title_font)
    tx = ix + icon_sz + int(W * 0.05)
    ty = int(H * 0.18)
    d.text((tx, ty), title, fill=INK, font=title_font)

    # Subtitle
    sub_sz = 36
    sub_font = get_font(sub_sz)
    subtitle = "1,284 quotes \u00b7 32 categories \u00b7 2 languages"
    sb = d.textbbox((0, 0), subtitle, font=sub_font)
    stx = tx
    sty = ty + title_sz + int(H * 0.06)
    d.text((stx, sty), subtitle, fill=MUTED, font=sub_font)

    save_png(img, os.path.join(RESOURCES_DIR, "feature-graphic-1024x500.png"))


# ── 6. Android splash variants ──────────────────────────────────────────
ANDROID_SPLASH_SIZES = {
    "drawable-mdpi":    (480,  800),
    "drawable-hdpi":    (720, 1280),
    "drawable-xhdpi":   (1080, 1920),
    "drawable-xxhdpi":  (1620, 2880),
    "drawable-xxxhdpi": (2160, 3840),
    # Landscape variants (swap dimensions)
    "drawable-mdpi-land":    (800,  480),
    "drawable-hdpi-land":    (1280, 720),
    "drawable-xhdpi-land":   (1920, 1080),
    "drawable-xxhdpi-land":  (2880, 1620),
    "drawable-xxxhdpi-land": (3840, 2160),
}


def generate_android_splash():
    print("\n── Android Splash ──")
    for folder, (w, h) in ANDROID_SPLASH_SIZES.items():
        img = Image.new("RGBA", (w, h), BG + (255,))
        d = ImageDraw.Draw(img)

        # Icon ~1/3 height
        icon_sz = min(h // 3, w // 2)
        icon = draw_icon_on_canvas(icon_sz)
        ix = (w - icon_sz) // 2
        iy = h // 4 - icon_sz // 4
        img.paste(icon, (ix, iy), icon)

        # Title
        title_sz = max(28, h // 18)
        title_font = get_font(title_sz, bold=True)
        title = "QUOTESMITH"
        tb = d.textbbox((0, 0), title, font=title_font)
        tw = tb[2] - tb[0]
        tx = (w - tw) // 2
        ty = iy + icon_sz + int(h * 0.04)
        d.text((tx, ty), title, fill=GOLD, font=title_font)

        # Tagline
        tag_sz = max(14, h // 38)
        tag_font = get_font(tag_sz)
        tag = "Who said it?"
        tgb = d.textbbox((0, 0), tag, font=tag_font)
        tgw = tgb[2] - tgb[0]
        tgx = (w - tgw) // 2
        tgy = ty + title_sz + int(h * 0.02)
        d.text((tgx, tgy), tag, fill=MUTED, font=tag_font)

        path = os.path.join(ANDROID_RES, folder, "splash.png")
        save_png(img, path)


# ── 7. iOS splash ────────────────────────────────────────────────────────
IOS_SPLASH_SIZES = [
    ("Default@2x.png",  1334,  750),
    ("Default@3x.png",  2208, 1242),
    ("Default-568h@2x.png", 1136,  640),
    ("Default-667h@2x.png", 1334,  750),
    ("Default-736h@3x.png", 2208, 1242),
    ("Default-Portrait-736h@3x.png", 1242, 2208),
    ("Default-Portrait@2x.png",  750, 1334),
    ("Default-Portrait@3x.png", 1242, 2208),
]


def generate_ios_splash():
    print("\n── iOS Splash ──")
    imageset_dir = os.path.join(IOS_ASSETS, "Splash.imageset")
    os.makedirs(imageset_dir, exist_ok=True)

    contents = {"images": []}
    for filename, w, h in IOS_SPLASH_SIZES:
        img = Image.new("RGBA", (w, h), BG + (255,))
        d = ImageDraw.Draw(img)

        icon_sz = min(h // 3, w // 2)
        icon = draw_icon_on_canvas(icon_sz)
        ix = (w - icon_sz) // 2
        iy = h // 4 - icon_sz // 4
        img.paste(icon, (ix, iy), icon)

        title_sz = max(24, h // 20)
        title_font = get_font(title_sz, bold=True)
        title = "QUOTESMITH"
        tb = d.textbbox((0, 0), title, font=title_font)
        tw = tb[2] - tb[0]
        tx = (w - tw) // 2
        ty = iy + icon_sz + int(h * 0.04)
        d.text((tx, ty), title, fill=GOLD, font=title_font)

        tag_sz = max(12, h // 40)
        tag_font = get_font(tag_sz)
        tag = "Who said it?"
        tgb = d.textbbox((0, 0), tag, font=tag_font)
        tgw = tgb[2] - tgb[0]
        tgx = (w - tgw) // 2
        tgy = ty + title_sz + int(h * 0.02)
        d.text((tgx, tgy), tag, fill=MUTED, font=tag_font)

        path = os.path.join(imageset_dir, filename)
        save_png(img, path)

        scale = "2x" if "@2x" in filename else "3x" if "@3x" in filename else "1x"
        contents["images"].append({
            "idiom": "universal",
            "filename": filename,
            "scale": scale,
        })

    # Contents.json
    import json
    contents_path = os.path.join(imageset_dir, "Contents.json")
    with open(contents_path, "w") as f:
        json.dump(contents, f, indent=2)
    print(f"  ✓ ios/App/App/Assets.xcassets/Splash.imageset/Contents.json")


# ── Main ─────────────────────────────────────────────────────────────────
def main():
    print("╔══════════════════════════════════════╗")
    print("║   QuoteSmith Store Assets Generator  ║")
    print("╚══════════════════════════════════════╝")

    generate_icons()
    generate_maskable()
    generate_apple_touch()
    generate_splash()
    generate_feature_graphic()
    generate_android_splash()
    generate_ios_splash()

    print("\n✅ All assets generated successfully!\n")


if __name__ == "__main__":
    main()
