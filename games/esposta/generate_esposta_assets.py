#!/usr/bin/env python3
"""
Esposta Store Assets Generator
Generates icons, splash screens, and feature graphics for PWA/Play Store/App Store.
Requires: pip install Pillow
"""

from PIL import Image, ImageDraw, ImageFont
import math
import os
import json

# ── Colors ───────────────────────────────────────────────────────────────
BG       = (26, 18, 8)         # #1a1208  dark brown-black
GOLD     = (212, 168, 83)      # #d4a853  sepia gold accent
GOLD_DEEP = (160, 120, 50)     # #a07832  darker gold
SEPIA    = (80, 60, 30)        # #503c1e  sepia mid-tone
LENS_BG  = (15, 10, 5)         # #0f0a05  inner lens dark
RING     = (50, 40, 20)        # #322814  outer ring
INCR     = (35, 25, 12)        # #23190c  incremental ring
MUTED    = (140, 110, 60)      # #8c6e3c  muted gold

# ── Paths ────────────────────────────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))
ICONS_DIR = os.path.join(BASE, "icons")
RESOURCES_DIR = os.path.join(BASE, "resources")
ANDROID_RES_DIR = os.path.join(RESOURCES_DIR, "android")
IOS_RES_DIR = os.path.join(RESOURCES_DIR, "ios")
IOS_ASSETS = os.path.join(BASE, "ios", "App", "App", "Assets.xcassets")

# ── Helpers ──────────────────────────────────────────────────────────────
def get_font(size, bold=False):
    """Try to load a good system font; fall back to default."""
    candidates = [
        "/System/Library/Fonts/Supplemental/Georgia.ttc",
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/HelveticaNeue.ttc",
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


def draw_icon_on_canvas(size, padding_pct=0):
    """
    Draw the Esposta camera-lens icon at the given pixel size.
    padding_pct: for maskable icons (0-100).
    Returns an RGBA Image.
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Effective drawing area (for maskable icons, shrink content)
    margin = int(size * padding_pct / 100) if padding_pct else 0
    inner = size - 2 * margin
    cx = margin + inner // 2
    cy = margin + inner // 2

    # ── Background (rounded rect) ──
    bg_radius = int(inner * 0.219)
    d.rounded_rectangle(
        [margin, margin, margin + inner - 1, margin + inner - 1],
        radius=bg_radius,
        fill=BG,
    )

    # ── Outer ring ──
    ring_r = int(inner * 0.46)
    ring_w = max(2, int(inner * 0.045))
    d.ellipse(
        [cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r],
        outline=RING,
        width=ring_w,
    )

    # ── Incremental ring (slightly inside) ──
    incr_r = int(inner * 0.41)
    incr_w = max(2, int(inner * 0.02))
    d.ellipse(
        [cx - incr_r, cy - incr_r, cx + incr_r, cy + incr_r],
        outline=INCR,
        width=incr_w,
    )

    # ── Inner lens circle (dark fill) ──
    lens_r = int(inner * 0.37)
    d.ellipse(
        [cx - lens_r, cy - lens_r, cx + lens_r, cy + lens_r],
        fill=LENS_BG,
    )

    # ── Camera aperture blades (triangles arranged in circle) ──
    num_blades = 6
    blade_r = int(inner * 0.11)        # length of each triangle
    blade_inner = int(inner * 0.10)    # distance from center to blade base
    for i in range(num_blades):
        angle = (2 * math.pi * i / num_blades) - math.pi / 2
        # Triangle points
        x1 = cx + int(blade_inner * math.cos(angle))
        y1 = cy + int(blade_inner * math.sin(angle))
        x2 = cx + int((blade_inner + blade_r) * math.cos(angle - 0.3))
        y2 = cy + int((blade_inner + blade_r) * math.sin(angle - 0.3))
        x3 = cx + int((blade_inner + blade_r) * math.cos(angle + 0.3))
        y3 = cy + int((blade_inner + blade_r) * math.sin(angle + 0.3))
        d.polygon([(x1, y1), (x2, y2), (x3, y3)], fill=SEPIA)

    # ── Central gold dot (aperture center) ──
    dot_r = int(inner * 0.045)
    d.ellipse(
        [cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r],
        fill=GOLD,
    )

    # ── Top-left highlight circle (lens reflection) ──
    hl_r = int(inner * 0.055)
    hl_x = cx - int(inner * 0.12)
    hl_y = cy - int(inner * 0.12)
    d.ellipse(
        [hl_x - hl_r, hl_y - hl_r, hl_x + hl_r, hl_y + hl_r],
        fill=GOLD_DEEP,
    )

    # ── Outer decorative ring (very light) ──
    outer_r = int(inner * 0.485)
    outer_w = max(1, int(inner * 0.012))
    d.ellipse(
        [cx - outer_r, cy - outer_r, cx + outer_r, cy + outer_r],
        outline=SEPIA,
        width=outer_w,
    )

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


# ── 2. Maskable icon (512 px, 10 % safe-zone padding) ──────────────────
def generate_maskable():
    print("\n── Maskable Icon ──")
    sz = 512
    img = draw_icon_on_canvas(sz, padding_pct=10)
    save_png(img, os.path.join(ICONS_DIR, "icon-maskable.png"))


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

    # Subtle radial vignette effect
    for r in range(min(W, H) // 2, 0, -4):
        t = r / (min(W, H) // 2)
        alpha = int(30 * (1 - t))
        color = (0, 0, 0, alpha)
        d.ellipse(
            [W // 2 - r, H // 2 - r, W // 2 + r, H // 2 + r],
            outline=color,
        )

    # Icon in upper third
    icon_sz = H // 3
    icon = draw_icon_on_canvas(icon_sz)
    ix = (W - icon_sz) // 2
    iy = H // 4 - icon_sz // 4
    img.paste(icon, (ix, iy), icon)

    # "ESPOSTA" title in gold
    title_sz = 180
    title_font = get_font(title_sz, bold=True)
    title = "ESPOSTA"
    tb = d.textbbox((0, 0), title, font=title_font)
    tw = tb[2] - tb[0]
    tx = (W - tw) // 2
    ty = iy + icon_sz + int(H * 0.06)
    d.text((tx, ty), title, fill=GOLD, font=title_font)

    # Tagline
    tag_sz = 72
    tag_font = get_font(tag_sz)
    tag = "Photography  \u00b7  Social  \u00b7  Marketing"
    tgb = d.textbbox((0, 0), tag, font=tag_font)
    tgw = tgb[2] - tgb[0]
    tgx = (W - tgw) // 2
    tgy = ty + title_sz + int(H * 0.03)
    d.text((tgx, tgy), tag, fill=MUTED, font=tag_font)

    save_png(img, os.path.join(RESOURCES_DIR, "splash.png"))


# ── 5. Feature graphic (1024 × 500) ─────────────────────────────────────
def generate_feature_graphic():
    print("\n── Feature Graphic ──")
    W, H = 1024, 500
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Dark gradient background (vertical)
    for y in range(H):
        t = y / H
        r = int(BG[0] * (1 - t) + LENS_BG[0] * t)
        g = int(BG[1] * (1 - t) + LENS_BG[1] * t)
        b = int(BG[2] * (1 - t) + LENS_BG[2] * t)
        d.line([(0, y), (W, y)], fill=(r, g, b, 255))

    # Small icon on left
    icon_sz = int(H * 0.55)
    icon = draw_icon_on_canvas(icon_sz)
    ix = int(W * 0.06)
    iy = (H - icon_sz) // 2
    img.paste(icon, (ix, iy), icon)

    # Title "Esposta"
    title_sz = 96
    title_font = get_font(title_sz, bold=True)
    title = "Esposta"
    tb = d.textbbox((0, 0), title, font=title_font)
    tx = ix + icon_sz + int(W * 0.05)
    ty = int(H * 0.18)
    d.text((tx, ty), title, fill=GOLD, font=title_font)

    # Subtitle
    sub_sz = 36
    sub_font = get_font(sub_sz)
    subtitle = "Photography  \u00b7  Social Media  \u00b7  Marketing"
    sb = d.textbbox((0, 0), subtitle, font=sub_font)
    stx = tx
    sty = ty + title_sz + int(H * 0.06)
    d.text((stx, sty), subtitle, fill=MUTED, font=sub_font)

    save_png(img, os.path.join(RESOURCES_DIR, "feature-graphic.png"))


# ── 6. Android splash variants (10 DPI sizes) ──────────────────────────
ANDROID_SPLASH_SIZES = {
    "drawable-mdpi":    (480,  800),
    "drawable-hdpi":    (720, 1280),
    "drawable-xhdpi":   (1080, 1920),
    "drawable-xxhdpi":  (1620, 2880),
    "drawable-xxxhdpi": (2160, 3840),
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
        title = "ESPOSTA"
        tb = d.textbbox((0, 0), title, font=title_font)
        tw = tb[2] - tb[0]
        tx = (w - tw) // 2
        ty = iy + icon_sz + int(h * 0.04)
        d.text((tx, ty), title, fill=GOLD, font=title_font)

        # Tagline
        tag_sz = max(14, h // 38)
        tag_font = get_font(tag_sz)
        tag = "Photography \u00b7 Social \u00b7 Marketing"
        tgb = d.textbbox((0, 0), tag, font=tag_font)
        tgw = tgb[2] - tgb[0]
        tgx = (w - tgw) // 2
        tgy = ty + title_sz + int(h * 0.02)
        d.text((tgx, tgy), tag, fill=MUTED, font=tag_font)

        path = os.path.join(ANDROID_RES_DIR, folder, "splash.png")
        save_png(img, path)


# ── 7. iOS splash ────────────────────────────────────────────────────────
def generate_ios_splash():
    print("\n── iOS Splash ──")
    # Main splash in resources/ios/
    W, H = 2732, 2732
    img = Image.new("RGBA", (W, H), BG + (255,))
    d = ImageDraw.Draw(img)

    # Vignette
    for r in range(min(W, H) // 2, 0, -4):
        t = r / (min(W, H) // 2)
        alpha = int(30 * (1 - t))
        color = (0, 0, 0, alpha)
        d.ellipse(
            [W // 2 - r, H // 2 - r, W // 2 + r, H // 2 + r],
            outline=color,
        )

    icon_sz = H // 3
    icon = draw_icon_on_canvas(icon_sz)
    ix = (W - icon_sz) // 2
    iy = H // 4 - icon_sz // 4
    img.paste(icon, (ix, iy), icon)

    title_sz = 180
    title_font = get_font(title_sz, bold=True)
    title = "ESPOSTA"
    tb = d.textbbox((0, 0), title, font=title_font)
    tw = tb[2] - tb[0]
    tx = (W - tw) // 2
    ty = iy + icon_sz + int(H * 0.06)
    d.text((tx, ty), title, fill=GOLD, font=title_font)

    tag_sz = 72
    tag_font = get_font(tag_sz)
    tag = "Photography  \u00b7  Social  \u00b7  Marketing"
    tgb = d.textbbox((0, 0), tag, font=tag_font)
    tgw = tgb[2] - tgb[0]
    tgx = (W - tgw) // 2
    tgy = ty + title_sz + int(H * 0.03)
    d.text((tgx, tgy), tag, fill=MUTED, font=tag_font)

    save_png(img, os.path.join(IOS_RES_DIR, "splash.png"))

    # Copy to iOS Assets.xcassets/Splash.imageset/
    imageset_dir = os.path.join(IOS_ASSETS, "Splash.imageset")
    os.makedirs(imageset_dir, exist_ok=True)

    # Create 3 scaled variants for 1x, 2x, 3x
    variants = [
        ("splash-2732x2732.png", W, H, "3x"),
        ("splash-2732x2732-1.png", W, H, "2x"),
        ("splash-2732x2732-2.png", W, H, "1x"),
    ]
    contents = {"images": [], "info": {"version": 1, "author": "xcode"}}
    for fname, vw, vh, scale in variants:
        vimg = img.copy()
        path = os.path.join(imageset_dir, fname)
        save_png(vimg, path)
        contents["images"].append({
            "idiom": "universal",
            "filename": fname,
            "scale": scale,
        })

    contents_path = os.path.join(imageset_dir, "Contents.json")
    with open(contents_path, "w") as f:
        json.dump(contents, f, indent=2)
    print(f"  ✓ ios/App/App/Assets.xcassets/Splash.imageset/Contents.json")


# ── 8. iOS App Icon copies ───────────────────────────────────────────────
IOS_ICON_SIZES = {
    "icon-57.png":   57,
    "icon-72.png":   72,
    "icon-76.png":   76,
    "icon-114.png": 114,
    "icon-120.png": 120,
    "icon-144.png": 144,
    "icon-152.png": 152,
    "icon-167.png": 167,
    "icon-180.png": 180,
    "icon-1024.png": 1024,
}


def generate_ios_icons():
    print("\n── iOS App Icons ──")
    appicon_dir = os.path.join(IOS_ASSETS, "AppIcon.appiconset")
    os.makedirs(appicon_dir, exist_ok=True)
    for fname, sz in IOS_ICON_SIZES.items():
        img = draw_icon_on_canvas(sz)
        save_png(img, os.path.join(appicon_dir, fname))

    # Contents.json for AppIcon
    contents = {
        "images": [],
        "info": {"version": 1, "author": "xcode"},
    }
    size_map = {
        "icon-57.png":   ("29pt",  "1x"),
        "icon-72.png":   ("20pt",  "2x"),
        "icon-76.png":   ("20pt",  "3x"),
        "icon-114.png":  ("29pt",  "2x"),
        "icon-120.png":  ("40pt",  "2x"),
        "icon-144.png":  ("29pt",  "3x"),
        "icon-152.png":  ("40pt",  "3x"),
        "icon-167.png":  ("76pt",  "2x"),
        "icon-180.png":  ("60pt",  "2x"),
        "icon-1024.png": ("1024pt", "1x"),
    }
    for fname in IOS_ICON_SIZES:
        size_str, scale_str = size_map[fname]
        contents["images"].append({
            "idiom": "universal",
            "filename": fname,
            "scale": scale_str,
            "size": size_str,
        })

    contents_path = os.path.join(appicon_dir, "Contents.json")
    with open(contents_path, "w") as f:
        json.dump(contents, f, indent=2)
    print(f"  ✓ ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json")


# ── Main ─────────────────────────────────────────────────────────────────
def main():
    print("╔══════════════════════════════════════╗")
    print("║   Esposta Store Assets Generator     ║")
    print("╚══════════════════════════════════════╝")

    generate_icons()
    generate_maskable()
    generate_apple_touch()
    generate_splash()
    generate_feature_graphic()
    generate_android_splash()
    generate_ios_splash()
    generate_ios_icons()

    print("\n✅ All assets generated successfully!\n")


if __name__ == "__main__":
    main()
