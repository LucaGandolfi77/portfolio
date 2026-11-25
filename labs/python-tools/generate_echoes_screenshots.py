#!/usr/bin/env python3
"""Generate marketing screenshots for Echoes of the Last Dawn.
Creates phone (1080x1920) and tablet (1200x1920) screenshots with overlay text."""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math

GAME = {
    "bg_color": (11, 14, 23),
    "accent": (212, 175, 90),
    "accent_dark": (160, 130, 60),
    "text_color": (232, 228, 216),
    "glow": (255, 200, 100),
    "red": (193, 75, 63),
    "blue": (109, 143, 209),
    "green": (111, 185, 139),
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(BASE_DIR, "games", "echoes-of-the-last-dawn", "marketing")

FONT_PATH = "/System/Library/Fonts/Helvetica.ttc"


def get_font(size, bold=False):
    try:
        if bold:
            return ImageFont.truetype(FONT_PATH + ",Bold", size)
        return ImageFont.truetype(FONT_PATH, size)
    except:
        return ImageFont.load_default()


def draw_bell_tower(draw, cx, cy, scale=1.0):
    """Draw a stylized bell tower."""
    tw = int(36 * scale)
    th = int(110 * scale)

    # Tower body
    tx = cx - tw // 2
    ty = cy - th // 2
    draw.rectangle([tx, ty, tx + tw, ty + th], fill=GAME['accent'])

    # Pointed top
    peak = [(tx - 6, ty), (cx, ty - int(36 * scale)), (tx + tw + 6, ty)]
    draw.polygon(peak, fill=GAME['accent'])

    # Bell opening
    bell_y = ty + int(th * 0.15)
    bell_r = int(tw * 0.35)
    draw.ellipse([cx - bell_r, bell_y - bell_r, cx + bell_r, bell_y + bell_r], fill=GAME['bg_color'])
    bell_inner = int(bell_r * 0.6)
    draw.ellipse([cx - bell_inner, bell_y - bell_inner + 2, cx + bell_inner, bell_y + bell_inner + 2], fill=GAME['glow'] + (180,))

    # Windows
    for wy_pos in [ty + int(th * 0.45), ty + int(th * 0.65)]:
        ww = int(tw * 0.2)
        wh = int(tw * 0.3)
        draw.rounded_rectangle([cx - ww, wy_pos, cx + ww, wy_pos + wh], radius=ww, fill=GAME['bg_color'])

    # Ground
    ground_y = ty + th
    draw.rectangle([0, ground_y, 9999, 9999], fill=(18, 22, 35))
    return ground_y


def make_screenshot(width, height, title, subtitle, scene_type="title", lang="it"):
    img = Image.new('RGBA', (width, height), GAME['bg_color'] + (255,))
    draw = ImageDraw.Draw(img)

    # Gradient overlay
    for y in range(height):
        t = y / height
        alpha = int(15 * math.sin(t * math.pi))
        draw.line([(0, y), (width, y)], fill=GAME['accent'] + (alpha,))

    # Glow
    glow_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_img)
    glow_r = height * 0.35
    gd.ellipse([width // 2 - int(glow_r), height // 3 - int(glow_r),
                width // 2 + int(glow_r), height // 3 + int(glow_r)],
               fill=GAME['glow'] + (20,))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=50))
    img = Image.alpha_composite(img, glow_img)
    draw = ImageDraw.Draw(img)

    cx, cy = width // 2, height // 3

    # Scene content
    if scene_type == "title":
        draw_bell_tower(draw, cx, cy - height // 12, scale=width / 1080)

        # Title
        title_font = get_font(width // 12, bold=True)
        bbox = draw.textbbox((0, 0), title, font=title_font)
        tw = bbox[2] - bbox[0]
        draw.text(((width - tw) // 2 + 2, cy + height // 8 + 2), title, fill=(0, 0, 0, 80), font=title_font)
        draw.text(((width - tw) // 2, cy + height // 8), title, fill=GAME['text_color'] + (255,), font=title_font)

    elif scene_type == "combat":
        # Mock combat UI
        bar_w = width * 0.7
        bar_h = 12
        bx = (width - bar_w) // 2

        # Enemy bar
        draw.text((bx, cy - 60), "L'Eco del Guardiano" if lang == "it" else "The Guardian's Echo",
                  fill=GAME['text_color'], font=get_font(width // 28))
        draw.rounded_rectangle([bx, cy - 30, bx + bar_w, cy - 30 + bar_h], radius=4, fill=(40, 40, 50))
        draw.rounded_rectangle([bx, cy - 30, bx + int(bar_w * 0.65), cy - 30 + bar_h], radius=4, fill=GAME['red'])

        # Party bars
        names = ["Elia", "Toma", "Iria"]
        colors = [GAME['red'], GAME['blue'], GAME['green']]
        hp = [95, 120, 78]
        maxhp = [120, 150, 110]
        for i, (name, color, h, m) in enumerate(zip(names, colors, hp, maxhp)):
            py = cy + 20 + i * 45
            draw.text((bx, py), f"{name}  {h}/{m}", fill=GAME['text_color'], font=get_font(width // 32))
            draw.rounded_rectangle([bx, py + 22, bx + bar_w, py + 22 + bar_h], radius=4, fill=(40, 40, 50))
            draw.rounded_rectangle([bx, py + 22, bx + int(bar_w * h / m), py + 22 + bar_h], radius=4, fill=color)

        # Parry ring
        ring_cx, ring_cy = width // 2, cy + height // 4
        ring_r = 60
        draw.ellipse([ring_cx - ring_r, ring_cy - ring_r, ring_cx + ring_r, ring_cy + ring_r],
                     outline=GAME['accent'], width=4)
        # Gold zone
        draw.arc([ring_cx - ring_r, ring_cy - ring_r, ring_cx + ring_r, ring_cy + ring_r],
                 -90, 0, fill=GAME['glow'], width=8)

        # PARRY text
        parry_font = get_font(width // 10, bold=True)
        bbox = draw.textbbox((0, 0), "PARA!", font=parry_font)
        ptw = bbox[2] - bbox[0]
        draw.text(((width - ptw) // 2, ring_cy + ring_r + 20), "PARA!",
                  fill=GAME['glow'], font=parry_font)

    elif scene_type == "narrative":
        # Narrative card mock
        card_w = int(width * 0.85)
        card_h = int(height * 0.3)
        card_x = (width - card_w) // 2
        card_y = height // 3

        draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h],
                               radius=12, fill=GAME['accent_dark'] + (180,), outline=GAME['accent'] + (100,))

        # Speaker
        draw.text((card_x + 20, card_y + 20), "Elia", fill=GAME['accent'], font=get_font(width // 24))

        # Text
        text = ("Mara è morta. L'ho vista cadere. "
                "Perché la campana torna a dire il suo nome?" if lang == "it"
                else "Mara is dead. I watched her fall. "
                "Why does the bell call her name again?")
        text_font = get_font(width // 30)
        # Simple word wrap
        words = text.split()
        lines = []
        line = ""
        for word in words:
            test = line + " " + word if line else word
            bbox = draw.textbbox((0, 0), test, font=text_font)
            if bbox[2] - bbox[0] > card_w - 40:
                lines.append(line)
                line = word
            else:
                line = test
        if line:
            lines.append(line)

        for i, ln in enumerate(lines[:6]):
            draw.text((card_x + 20, card_y + 60 + i * (width // 22)), ln,
                      fill=GAME['text_color'], font=text_font)

    # Subtitle overlay at bottom
    sub_font = get_font(width // 28, bold=True)
    bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
    stw = bbox[2] - bbox[0]
    sub_y = height - height // 8
    # Dark strip
    draw.rectangle([0, sub_y - 20, width, sub_y + 40], fill=(0, 0, 0, 160))
    draw.text(((width - stw) // 2, sub_y - 10), subtitle, fill=GAME['accent'], font=sub_font)

    # Developer name
    dev_font = get_font(width // 36)
    dev_text = "Luca Gandolfi"
    bbox = draw.textbbox((0, 0), dev_text, font=dev_font)
    dtw = bbox[2] - bbox[0]
    draw.text(((width - dtw) // 2, height - height // 16), dev_text,
              fill=GAME['text_dim'] if 'text_dim' in GAME else GAME['text_color'] + (120,), font=dev_font)

    return img.convert('RGB')


def generate():
    os.makedirs(OUT_DIR, exist_ok=True)

    screenshots = [
        ("phone-title.png", 1080, 1920, "L'ULTIMO\nRINTOCCO",
         "Un JRPG di Amore e Memoria", "title", "it"),
        ("phone-title-en.png", 1080, 1920, "ECHOES OF\nTHE LAST DAWN",
         "A JRPG of Love & Memory", "title", "en"),
        ("phone-combat.png", 1080, 1920, "",
         "Parry in Tempo Reale", "combat", "it"),
        ("phone-combat-en.png", 1080, 1920, "",
         "Real-Time Parry Combat", "combat", "en"),
        ("phone-narrative.png", 1080, 1920, "",
         "Una Storia di Scelte", "narrative", "it"),
        ("phone-narrative-en.png", 1080, 1920, "",
         "A Story of Choices", "narrative", "en"),
        ("tablet-title.png", 1200, 1920, "L'ULTIMO\nRINTOCCO",
         "Un JRPG di Amore e Memoria", "title", "it"),
        ("tablet-combat.png", 1200, 1920, "",
         "Parry in Tempo Reale", "combat", "it"),
    ]

    for filename, w, h, title, subtitle, scene, lang in screenshots:
        img = make_screenshot(w, h, title, subtitle, scene, lang)
        img.save(os.path.join(OUT_DIR, filename), 'PNG')
        print(f"  {filename}")

    print(f"\n{len(screenshots)} screenshots saved to marketing/")


if __name__ == '__main__':
    generate()
