#!/usr/bin/env python3
"""Generate marketing screenshots for QuoteSmith.
Creates phone (1080x1920) and tablet (1200x1920) mock screenshots."""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math

GAME = {
    "bg": (16, 20, 23),
    "bg_deep": (11, 15, 17),
    "panel": (23, 29, 32),
    "panel_strong": (29, 37, 40),
    "line": (52, 64, 68),
    "line_soft": (39, 50, 54),
    "ink": (243, 240, 232),
    "muted": (155, 168, 168),
    "accent": (233, 196, 106),
    "teal": (114, 184, 168),
    "red": (228, 122, 101),
}

CATEGORIES_DATA = [
    ("▣", "Movies", "Film"), ("▤", "TV series", "Serie TV"),
    ("✦", "Animation", "Animazione"), ("♫", "Songs", "Canzoni"),
    ("▥", "Books", "Libri"), ("◇", "History", "Storia"),
    ("⌘", "Video games", "Videogiochi"), ("↔", "Proverbs", "Proverbi"),
    ("◎", "Anime", "Anime"), ("∑", "Science", "Scienza"),
    ("△", "Sports", "Sport"), ("#", "Internet", "Internet"),
    ("?", "Philosophy", "Filosofia"), ("◇", "Food", "Cucina"),
    ("▦", "Literature", "Letteratura"), ("✎", "Poetry", "Poesia"),
]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(BASE_DIR, "marketing")

FONT_PATH = "/System/Library/Fonts/Helvetica.ttc"


def get_font(size, bold=False):
    try:
        if bold:
            return ImageFont.truetype(FONT_PATH + ",Bold", size)
        return ImageFont.truetype(FONT_PATH, size)
    except Exception:
        return ImageFont.load_default()


def draw_rounded_rect(draw, xy, radius, fill, outline=None, width=1):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)


def draw_phone_frame(img, draw):
    """Draw a subtle phone frame outline."""
    w, h = img.size
    frame_r = 40
    draw.rounded_rectangle([10, 10, w - 10, h - 10], radius=frame_r,
                           outline=GAME['line'], width=2)
    # Notch
    notch_w, notch_h = 120, 28
    draw.rounded_rectangle([(w - notch_w) // 2, 14, (w + notch_w) // 2, 14 + notch_h],
                           radius=14, fill=GAME['bg_deep'])
    return img


def draw_status_bar(draw, w):
    """Draw a fake status bar at top."""
    bar_h = 44
    draw.rectangle([0, 0, w, bar_h], fill=GAME['bg_deep'])
    # Time
    draw.text((20, 12), "9:41", fill=GAME['muted'], font=get_font(14))
    # Battery icon
    bx = w - 40
    draw.rounded_rectangle([bx, 15, bx + 22, 29], radius=3, outline=GAME['muted'], width=1)
    draw.rectangle([bx + 22, 20, bx + 25, 24], fill=GAME['muted'])
    draw.rectangle([bx + 2, 17, bx + 16, 27], fill=GAME['teal'])
    return bar_h


def draw_brand(draw, w, y):
    """Draw QuoteSmith brand bar."""
    bar_h = 56
    draw.rectangle([0, y, w, y + bar_h], fill=GAME['bg'])
    # Brand mark circle
    cx, cy = 40, y + bar_h // 2
    draw.ellipse([cx - 15, cy - 15, cx + 15, cy + 15], outline=GAME['accent'], width=2)
    draw.text((cx - 8, cy - 10), "Q", fill=GAME['accent'], font=get_font(16, bold=True))
    # Brand text
    draw.text((62, cy - 8), "QUOTE", fill=GAME['ink'], font=get_font(13, bold=True))
    draw.text((104, cy - 8), "SMITH", fill=GAME['accent'], font=get_font(13, bold=True))
    # Divider
    draw.line([(0, y + bar_h), (w, y + bar_h)], fill=GAME['line'], width=1)
    return y + bar_h


def draw_footer(draw, w, h):
    """Draw footer bar."""
    footer_h = 44
    y = h - footer_h
    draw.line([(0, y), (w, y)], fill=GAME['line'], width=1)
    draw.rectangle([0, y, w, h], fill=GAME['bg'])
    footer_font = get_font(10)
    texts = ["100% offline", "·", "Made for quick rounds"]
    total_w = sum(draw.textbbox((0, 0), t, font=footer_font)[2] - draw.textbbox((0, 0), t, font=footer_font)[0] + 16 for t in texts)
    fx = (w - total_w) // 2
    for t in texts:
        tw = draw.textbbox((0, 0), t, font=footer_font)[2] - draw.textbbox((0, 0), t, font=footer_font)[0]
        draw.text((fx, y + 16), t, fill=(105, 118, 120), font=footer_font)
        fx += tw + 16
    return y


def make_setup_screen(w, h, lang="en"):
    img = Image.new('RGBA', (w, h), GAME['bg'] + (255,))
    draw = ImageDraw.Draw(img)
    bar_h = draw_status_bar(draw, w)
    brand_y = draw_brand(draw, w, bar_h)

    content_y = brand_y + 24
    pad = int(w * 0.05)

    # Eyebrow
    draw.text((pad, content_y), "OFFLINE QUOTE QUIZ", fill=GAME['accent'], font=get_font(11, bold=True))
    content_y += 22

    # Title
    title = "Who said it?" if lang == "en" else "Chi l'ha detto?"
    draw.text((pad, content_y), title, fill=GAME['ink'], font=get_font(42, bold=True))
    content_y += 60

    # Subtitle
    sub = "Build a round from the worlds you know." if lang == "en" else "Costruisci un round dai mondi che conosci."
    draw.text((pad, content_y), sub, fill=GAME['muted'], font=get_font(15))
    content_y += 50

    # 10 questions badge
    badge_x = w - pad - 92
    badge_y = content_y - 55
    draw.ellipse([badge_x, badge_y, badge_x + 92, badge_y + 92], outline=GAME['line'], width=2)
    draw.text((badge_x + 30, badge_y + 16), "10", fill=GAME['accent'], font=get_font(32, bold=True))
    draw.text((badge_x + 22, badge_y + 54), "questions", fill=GAME['muted'], font=get_font(10))

    # Language section
    draw.text((pad, content_y), "01", fill=GAME['accent'], font=get_font(11, bold=True))
    draw.text((pad + 30, content_y), "Language" if lang == "en" else "Lingua", fill=GAME['ink'], font=get_font(14, bold=True))
    content_y += 28

    # Language buttons
    btn_w = (w - pad * 2 - 12) // 2
    btn_h = 54
    lang_data = [("English", "EN", True), ("Italiano", "IT", False)]
    for i, (name, code, selected) in enumerate(lang_data):
        bx = pad + i * (btn_w + 12)
        border = GAME['accent'] if selected else GAME['line']
        bg = GAME['panel_strong'] if selected else GAME['panel']
        draw.rounded_rectangle([bx, content_y, bx + btn_w, content_y + btn_h],
                               radius=12, fill=bg, outline=border, width=2)
        if selected:
            draw.rectangle([bx, content_y + 8, bx + 4, content_y + btn_h - 8], fill=GAME['accent'])
        draw.text((bx + 18, content_y + 8), code, fill=GAME['accent'], font=get_font(12, bold=True))
        draw.text((bx + 18, content_y + 26), name, fill=GAME['ink'], font=get_font(14, bold=True))
    content_y += btn_h + 30

    # Category section
    draw.text((pad, content_y), "02", fill=GAME['accent'], font=get_font(11, bold=True))
    draw.text((pad + 30, content_y), "Category" if lang == "en" else "Categoria", fill=GAME['ink'], font=get_font(14, bold=True))
    content_y += 24

    cat_hint = "Pick one or more worlds" if lang == "en" else "Scegli uno o più mondi"
    draw.text((pad, content_y), cat_hint, fill=GAME['muted'], font=get_font(12))
    content_y += 24

    # All / None chips
    chip_y = content_y
    for chip_text in ["All", "None"]:
        tw = draw.textbbox((0, 0), chip_text, font=get_font(11, bold=True))[2]
        draw.rounded_rectangle([pad, chip_y, pad + tw + 24, chip_y + 26],
                               radius=13, fill=GAME['panel'], outline=GAME['line'], width=1)
        draw.text((pad + 12, chip_y + 5), chip_text, fill=GAME['ink'], font=get_font(11, bold=True))
        pad += tw + 36
    pad = int(w * 0.05)
    content_y += 36

    # Category grid (4 columns)
    cat_w = (w - pad * 2 - 24) // 4
    cat_h = 90
    for row in range(4):
        for col in range(4):
            idx = row * 4 + col
            if idx >= len(CATEGORIES_DATA):
                break
            icon, en_name, it_name = CATEGORIES_DATA[idx]
            cx = pad + col * (cat_w + 8)
            cy = content_y + row * (cat_h + 8)
            selected = idx < 6
            border = GAME['accent'] if selected else GAME['line']
            bg = GAME['panel_strong'] if selected else GAME['panel']
            draw.rounded_rectangle([cx, cy, cx + cat_w, cy + cat_h],
                                   radius=12, fill=bg, outline=border, width=1 if not selected else 2)
            if selected:
                draw.rectangle([cx, cy + 6, cx + 3, cy + cat_h - 6], fill=GAME['accent'])
            draw.text((cx + 13, cy + 13), icon, fill=GAME['accent'], font=get_font(20))
            name = en_name if lang == "en" else it_name
            draw.text((cx + 13, cy + 50), name, fill=GAME['ink'], font=get_font(11, bold=True))
    content_y += 4 * (cat_h + 8) + 20

    # Difficulty section
    draw.text((pad, content_y), "03", fill=GAME['accent'], font=get_font(11, bold=True))
    diff_label = "Difficulty" if lang == "en" else "Difficoltà"
    draw.text((pad + 30, content_y), diff_label, fill=GAME['ink'], font=get_font(14, bold=True))
    content_y += 28

    diff_w = (w - pad * 2 - 20) // 3
    diffs = [("Easy", "Facile", "Iconic lines", "Frasi iconiche", True),
             ("Medium", "Medio", "A little deeper", "Serve memoria", False),
             ("Hard", "Difficile", "For connoisseurs", "Per intenditori", False)]
    for i, (en, it, en_hint, it_hint, sel) in enumerate(diffs):
        dx = pad + i * (diff_w + 10)
        border = GAME['accent'] if sel else GAME['line']
        bg = GAME['panel_strong'] if sel else GAME['panel']
        draw.rounded_rectangle([dx, content_y, dx + diff_w, content_y + 66],
                               radius=12, fill=bg, outline=border, width=2)
        if sel:
            draw.rectangle([dx, content_y + 6, dx + 3, content_y + 60], fill=GAME['accent'])
        label = en if lang == "en" else it
        hint = en_hint if lang == "en" else it_hint
        draw.text((dx + 12, content_y + 12), label, fill=GAME['ink'], font=get_font(13, bold=True))
        draw.text((dx + 12, content_y + 32), hint, fill=GAME['muted'], font=get_font(10))
    content_y += 86

    # Start button
    btn_text = "Start round →" if lang == "en" else "Avvia round →"
    draw.rounded_rectangle([pad, content_y, w - pad, content_y + 52],
                           radius=12, fill=GAME['accent'])
    tw = draw.textbbox((0, 0), btn_text, font=get_font(15, bold=True))[2]
    draw.text(((w - tw) // 2, content_y + 16), btn_text, fill=(23, 19, 11), font=get_font(15, bold=True))
    content_y += 66

    # Personal best
    pb = "Best: 9/10" if lang == "en" else "Miglior: 9/10"
    tw = draw.textbbox((0, 0), pb, font=get_font(12))[2]
    draw.text(((w - tw) // 2, content_y), pb, fill=GAME['muted'], font=get_font(12))

    draw_footer(draw, w, h)
    return img


def make_game_screen(w, h, lang="en"):
    img = Image.new('RGBA', (w, h), GAME['bg'] + (255,))
    draw = ImageDraw.Draw(img)
    bar_h = draw_status_bar(draw, w)
    brand_y = draw_brand(draw, w, bar_h)

    content_y = brand_y + 16
    pad = int(w * 0.05)

    # Game header: <- Menu | progress | streak
    draw.text((pad, content_y + 4), "← " + ("Menu" if lang == "en" else "Menu"), fill=GAME['muted'], font=get_font(13))

    # Progress bar
    prog_x = pad + 100
    prog_w = w - pad * 2 - 220
    draw.text((prog_x, content_y), "3 / 10", fill=GAME['muted'], font=get_font(11))
    draw.rounded_rectangle([prog_x, content_y + 20, prog_x + prog_w, content_y + 24],
                           radius=2, fill=GAME['line'])
    draw.rounded_rectangle([prog_x, content_y + 20, prog_x + int(prog_w * 0.3), content_y + 24],
                           radius=2, fill=GAME['accent'])

    # Streak
    draw.text((w - pad - 70, content_y + 4), "2 streak", fill=GAME['accent'], font=get_font(11, bold=True))
    content_y += 40

    # Category / Difficulty meta
    cat_name = "Movies" if lang == "en" else "Film"
    diff_name = "Medium" if lang == "en" else "Medio"
    draw.text((pad, content_y), cat_name.upper(), fill=GAME['muted'], font=get_font(11))
    draw.text((pad + 80, content_y), "/", fill=GAME['line'], font=get_font(11))
    draw.text((pad + 96, content_y), diff_name.upper(), fill=GAME['muted'], font=get_font(11))
    content_y += 26

    # Quote panel
    panel_h = 260
    draw.rounded_rectangle([pad, content_y, w - pad, content_y + panel_h],
                           radius=12, fill=GAME['panel'], outline=GAME['line'], width=1)

    # Quote mark
    draw.text((pad + 22, content_y + 10), "\u201c", fill=GAME['accent'], font=get_font(52, bold=True))

    # Quote text
    quote = ("To be, or not to be, that is the question" if lang == "en"
             else "Essere o non essere, questo il problema")
    q_font = get_font(28)
    words = quote.split()
    lines = []
    line = ""
    max_w = w - pad * 2 - 60
    for word in words:
        test = line + " " + word if line else word
        tw = draw.textbbox((0, 0), test, font=q_font)[2]
        if tw > max_w:
            lines.append(line)
            line = word
        else:
            line = test
    if line:
        lines.append(line)

    qy = content_y + 80
    for ln in lines[:3]:
        draw.text((pad + 30, qy), ln, fill=GAME['ink'], font=q_font)
        qy += 36

    # Listen button
    listen_y = content_y + panel_h - 44
    draw.text((pad + 30, listen_y), "◖ Listen" if lang == "en" else "◖ Ascolta", fill=GAME['teal'], font=get_font(12, bold=True))
    content_y += panel_h + 20

    # Prompt
    prompt = "Who said this?" if lang == "en" else "Chi l'ha detto?"
    draw.text((pad, content_y), prompt, fill=GAME['muted'], font=get_font(13, bold=True))
    content_y += 26

    # Answer grid (2x2)
    answers = ["William Shakespeare", "Charles Dickens", "Oscar Wilde", "Mark Twain"]
    correct_idx = 0
    ans_w = (w - pad * 2 - 12) // 2
    ans_h = 62
    for i, ans in enumerate(answers):
        ax = pad + (i % 2) * (ans_w + 12)
        ay = content_y + (i // 2) * (ans_h + 10)
        if i == correct_idx:
            border = GAME['teal']
            bg = (114, 184, 168, 36)
            text_color = GAME['teal']
        else:
            border = GAME['line']
            bg = GAME['panel']
            text_color = GAME['ink']
        draw.rounded_rectangle([ax, ay, ax + ans_w, ay + ans_h],
                               radius=12, fill=bg, outline=border, width=2)
        # Center text
        tw = draw.textbbox((0, 0), ans, font=get_font(14, bold=True))[2]
        draw.text((ax + (ans_w - tw) // 2, ay + 20), ans, fill=text_color, font=get_font(14, bold=True))
    content_y += 2 * (ans_h + 10) + 14

    # Feedback
    fb_text = "Correct! William Shakespeare wrote this in Hamlet." if lang == "en" else "Corretto! William Shakespeare lo scrisse nell'Amleto."
    draw.rounded_rectangle([pad, content_y, w - pad, content_y + 50],
                           radius=8, fill=GAME['panel'])
    draw.rectangle([pad, content_y + 8, pad + 3, content_y + 42], fill=GAME['teal'])
    draw.text((pad + 14, content_y + 14), fb_text, fill=(199, 207, 202), font=get_font(13))
    content_y += 64

    # Next button
    next_text = "Next quote →" if lang == "en" else "Prossima citazione →"
    draw.rounded_rectangle([pad, content_y, w - pad, content_y + 52],
                           radius=12, fill=GAME['accent'])
    tw = draw.textbbox((0, 0), next_text, font=get_font(15, bold=True))[2]
    draw.text(((w - tw) // 2, content_y + 16), next_text, fill=(23, 19, 11), font=get_font(15, bold=True))

    draw_footer(draw, w, h)
    return img


def make_results_screen(w, h, lang="en"):
    img = Image.new('RGBA', (w, h), GAME['bg'] + (255,))
    draw = ImageDraw.Draw(img)
    bar_h = draw_status_bar(draw, w)
    brand_y = draw_brand(draw, w, bar_h)

    content_y = brand_y + 30
    pad = int(w * 0.05)

    # Eyebrow
    draw.text((pad, content_y), "ROUND COMPLETE", fill=GAME['accent'], font=get_font(11, bold=True))
    content_y += 22

    # Title
    title = "Your result" if lang == "en" else "Il tuo risultato"
    draw.text((pad, content_y), title, fill=GAME['ink'], font=get_font(42, bold=True))
    content_y += 60

    # Score
    score_str = "8"
    score_tw = draw.textbbox((0, 0), score_str, font=get_font(100, bold=True))[2]
    total_str = "/10"
    total_tw = draw.textbbox((0, 0), total_str, font=get_font(24))[2]
    score_x = (w - score_tw - total_tw - 10) // 2
    draw.text((score_x, content_y - 10), score_str, fill=GAME['accent'], font=get_font(100, bold=True))
    draw.text((score_x + score_tw + 10, content_y + 50), total_str, fill=GAME['muted'], font=get_font(24))
    content_y += 110

    # Rating
    rating = "Great round. One more?" if lang == "en" else "Ottimo giro. Ancora una?"
    tw = draw.textbbox((0, 0), rating, font=get_font(15))[2]
    draw.text(((w - tw) // 2, content_y), rating, fill=(199, 207, 202), font=get_font(15))
    content_y += 40

    # Stats row
    stats_h = 70
    draw.line([(pad, content_y), (w - pad, content_y)], fill=GAME['line'], width=1)
    stat_w = (w - pad * 2) // 2
    # Best streak
    draw.text((pad + stat_w // 2 - 30, content_y + 10), "Best streak", fill=GAME['muted'], font=get_font(11))
    draw.text((pad + stat_w // 2 - 12, content_y + 30), "4", fill=GAME['accent'], font=get_font(20, bold=True))
    # Personal best
    draw.text((pad + stat_w + stat_w // 2 - 35, content_y + 10), "Personal best", fill=GAME['muted'], font=get_font(11))
    draw.text((pad + stat_w + stat_w // 2 - 18, content_y + 30), "8/10", fill=GAME['accent'], font=get_font(20, bold=True))
    draw.line([(pad, content_y + stats_h), (w - pad, content_y + stats_h)], fill=GAME['line'], width=1)
    content_y += stats_h + 16

    # Review list
    reviews = [
        (True, "To be, or not to be...", "William Shakespeare"),
        (True, "I think therefore I am", "René Descartes"),
        (False, "Elementary, my dear Watson", "Arthur Conan Doyle"),
        (True, "All that glitters is not gold", "William Shakespeare"),
        (True, "The only thing we have to fear...", "Franklin D. Roosevelt"),
    ]
    for correct, quote_text, author in reviews[:5]:
        item_h = 60
        mark_color = GAME['teal'] if correct else GAME['red']
        mark = "✓" if correct else "✗"
        draw.rounded_rectangle([pad, content_y, w - pad, content_y + item_h],
                               radius=8, fill=GAME['panel'], outline=GAME['line_soft'], width=1)
        draw.text((pad + 14, content_y + 10), mark, fill=mark_color, font=get_font(18, bold=True))
        draw.text((pad + 40, content_y + 8), quote_text, fill=GAME['ink'], font=get_font(14))
        draw.text((pad + 40, content_y + 32), author, fill=GAME['muted'], font=get_font(11))
        content_y += item_h + 7

    content_y += 14

    # Play again button
    btn_text = "Play again ↻" if lang == "en" else "Gioca ancora ↻"
    draw.rounded_rectangle([pad, content_y, w - pad, content_y + 52],
                           radius=12, fill=GAME['accent'])
    tw = draw.textbbox((0, 0), btn_text, font=get_font(15, bold=True))[2]
    draw.text(((w - tw) // 2, content_y + 16), btn_text, fill=(23, 19, 11), font=get_font(15, bold=True))
    content_y += 66

    # Back to menu
    menu_text = "Back to menu"
    tw = draw.textbbox((0, 0), menu_text, font=get_font(13))[2]
    draw.text(((w - tw) // 2, content_y), menu_text, fill=GAME['muted'], font=get_font(13))

    # Confetti particles (decorative)
    import random
    rng = random.Random(42)
    confetti_colors = [GAME['accent'], GAME['teal'], (228, 122, 101), (243, 240, 232)]
    for _ in range(30):
        cx = rng.randint(20, w - 20)
        cy = rng.randint(brand_y, content_y)
        size = rng.randint(4, 10)
        color = rng.choice(confetti_colors) + (140,)
        draw.ellipse([cx - size // 2, cy - size // 2, cx + size // 2, cy + size // 2], fill=color)

    draw_footer(draw, w, h)
    return img


def make_tablet_setup(w, h, lang="en"):
    img = Image.new('RGBA', (w, h), GAME['bg'] + (255,))
    draw = ImageDraw.Draw(img)

    pad = int(w * 0.06)
    content_y = 40

    # Brand
    draw.text((pad, content_y), "Q", fill=GAME['accent'], font=get_font(20, bold=True))
    draw.text((pad + 28, content_y), "QUOTE", fill=GAME['ink'], font=get_font(15, bold=True))
    draw.text((pad + 80, content_y), "SMITH", fill=GAME['accent'], font=get_font(15, bold=True))
    content_y += 50

    # Title row with badge
    draw.text((pad, content_y), "OFFLINE QUOTE QUIZ", fill=GAME['accent'], font=get_font(12, bold=True))
    content_y += 24

    title = "Who said it?" if lang == "en" else "Chi l'ha detto?"
    draw.text((pad, content_y), title, fill=GAME['ink'], font=get_font(52, bold=True))
    content_y += 72

    # Badge
    badge_x = w - pad - 110
    badge_y = content_y - 100
    draw.ellipse([badge_x, badge_y, badge_x + 110, badge_y + 110], outline=GAME['line'], width=2)
    draw.text((badge_x + 35, badge_y + 20), "10", fill=GAME['accent'], font=get_font(38, bold=True))
    draw.text((badge_x + 26, badge_y + 65), "questions", fill=GAME['muted'], font=get_font(11))

    sub = "Build a round from the worlds you know." if lang == "en" else "Costruisci un round dai mondi che conosci."
    draw.text((pad, content_y), sub, fill=GAME['muted'], font=get_font(16))
    content_y += 50

    # Language
    draw.text((pad, content_y), "01  " + ("Language" if lang == "en" else "Lingua"), fill=GAME['accent'], font=get_font(13, bold=True))
    content_y += 30

    btn_w = 180
    for i, (name, code, sel) in enumerate([("English", "EN", True), ("Italiano", "IT", False)]):
        bx = pad + i * (btn_w + 16)
        border = GAME['accent'] if sel else GAME['line']
        bg = GAME['panel_strong'] if sel else GAME['panel']
        draw.rounded_rectangle([bx, content_y, bx + btn_w, content_y + 54],
                               radius=12, fill=bg, outline=border, width=2)
        if sel:
            draw.rectangle([bx, content_y + 8, bx + 4, content_y + 46], fill=GAME['accent'])
        draw.text((bx + 18, content_y + 8), code, fill=GAME['accent'], font=get_font(12, bold=True))
        draw.text((bx + 18, content_y + 28), name, fill=GAME['ink'], font=get_font(14, bold=True))
    content_y += 74

    # Categories - wider grid for tablet
    draw.text((pad, content_y), "02  " + ("Category" if lang == "en" else "Categoria"), fill=GAME['accent'], font=get_font(13, bold=True))
    content_y += 30

    cat_w = (w - pad * 2 - 56) // 6
    cat_h = 90
    for row in range(3):
        for col in range(6):
            idx = row * 6 + col
            if idx >= len(CATEGORIES_DATA):
                break
            icon, en_name, it_name = CATEGORIES_DATA[idx]
            cx = pad + col * (cat_w + 8)
            cy = content_y + row * (cat_h + 8)
            selected = idx < 6
            border = GAME['accent'] if selected else GAME['line']
            bg = GAME['panel_strong'] if selected else GAME['panel']
            draw.rounded_rectangle([cx, cy, cx + cat_w, cy + cat_h],
                                   radius=12, fill=bg, outline=border, width=2 if selected else 1)
            if selected:
                draw.rectangle([cx, cy + 6, cx + 3, cy + cat_h - 6], fill=GAME['accent'])
            draw.text((cx + 14, cy + 14), icon, fill=GAME['accent'], font=get_font(20))
            name = en_name if lang == "en" else it_name
            draw.text((cx + 14, cy + 50), name, fill=GAME['ink'], font=get_font(12, bold=True))
    content_y += 3 * (cat_h + 8) + 20

    # Difficulty
    draw.text((pad, content_y), "03  " + ("Difficulty" if lang == "en" else "Difficoltà"), fill=GAME['accent'], font=get_font(13, bold=True))
    content_y += 30

    diff_w = (w - pad * 2 - 32) // 3
    diffs = [("Easy", "Facile", "Iconic lines", True),
             ("Medium", "Medio", "A little deeper", False),
             ("Hard", "Difficile", "For connoisseurs", False)]
    for i, (en, it, hint, sel) in enumerate(diffs):
        dx = pad + i * (diff_w + 16)
        border = GAME['accent'] if sel else GAME['line']
        bg = GAME['panel_strong'] if sel else GAME['panel']
        draw.rounded_rectangle([dx, content_y, dx + diff_w, content_y + 70],
                               radius=12, fill=bg, outline=border, width=2)
        if sel:
            draw.rectangle([dx, content_y + 6, dx + 3, content_y + 64], fill=GAME['accent'])
        label = en if lang == "en" else it
        draw.text((dx + 14, content_y + 14), label, fill=GAME['ink'], font=get_font(14, bold=True))
        draw.text((dx + 14, content_y + 36), hint, fill=GAME['muted'], font=get_font(11))
    content_y += 90

    # Start button
    btn_text = "Start round →" if lang == "en" else "Avvia round →"
    draw.rounded_rectangle([pad, content_y, w - pad, content_y + 56],
                           radius=12, fill=GAME['accent'])
    tw = draw.textbbox((0, 0), btn_text, font=get_font(16, bold=True))[2]
    draw.text(((w - tw) // 2, content_y + 17), btn_text, fill=(23, 19, 11), font=get_font(16, bold=True))

    return img


def make_tablet_game(w, h, lang="en"):
    img = Image.new('RGBA', (w, h), GAME['bg'] + (255,))
    draw = ImageDraw.Draw(img)

    pad = int(w * 0.06)
    content_y = 40

    # Brand
    draw.text((pad, content_y), "Q", fill=GAME['accent'], font=get_font(20, bold=True))
    draw.text((pad + 28, content_y), "QUOTE", fill=GAME['ink'], font=get_font(15, bold=True))
    draw.text((pad + 80, content_y), "SMITH", fill=GAME['accent'], font=get_font(15, bold=True))

    # Header right side
    draw.text((w - pad - 70, content_y + 4), "← Menu", fill=GAME['muted'], font=get_font(14))
    draw.text((w - pad - 180, content_y + 4), "2 streak", fill=GAME['accent'], font=get_font(13, bold=True))
    content_y += 50

    # Progress
    draw.text((pad, content_y), "3 / 10", fill=GAME['muted'], font=get_font(12))
    prog_x = pad + 80
    prog_w = w - pad * 2 - 300
    draw.rounded_rectangle([prog_x, content_y + 4, prog_x + prog_w, content_y + 8],
                           radius=2, fill=GAME['line'])
    draw.rounded_rectangle([prog_x, content_y + 4, prog_x + int(prog_w * 0.3), content_y + 8],
                           radius=2, fill=GAME['accent'])
    content_y += 24

    # Meta
    cat = "Movies" if lang == "en" else "Film"
    diff = "Medium" if lang == "en" else "Medio"
    draw.text((pad, content_y), cat.upper() + " / " + diff.upper(), fill=GAME['muted'], font=get_font(11))
    content_y += 30

    # Quote panel (wider on tablet)
    panel_h = 300
    draw.rounded_rectangle([pad, content_y, w - pad, content_y + panel_h],
                           radius=12, fill=GAME['panel'], outline=GAME['line'], width=1)
    draw.text((pad + 26, content_y + 14), "\u201c", fill=GAME['accent'], font=get_font(60, bold=True))

    quote = "To be, or not to be, that is the question whether 'tis nobler in the mind to suffer"
    q_font = get_font(32)
    words = quote.split()
    lines = []
    line = ""
    max_w = w - pad * 2 - 70
    for word in words:
        test = line + " " + word if line else word
        tw = draw.textbbox((0, 0), test, font=q_font)[2]
        if tw > max_w:
            lines.append(line)
            line = word
        else:
            line = test
    if line:
        lines.append(line)

    qy = content_y + 90
    for ln in lines[:4]:
        draw.text((pad + 36, qy), ln, fill=GAME['ink'], font=q_font)
        qy += 42

    draw.text((pad + 36, content_y + panel_h - 48), "◖ Listen" if lang == "en" else "◖ Ascolta",
              fill=GAME['teal'], font=get_font(13, bold=True))
    content_y += panel_h + 24

    # Prompt
    prompt = "Who said this?" if lang == "en" else "Chi l'ha detto?"
    draw.text((pad, content_y), prompt, fill=GAME['muted'], font=get_font(14, bold=True))
    content_y += 30

    # Answers - 2x2 wider on tablet
    answers = ["William Shakespeare", "Charles Dickens", "Oscar Wilde", "Mark Twain"]
    ans_w = (w - pad * 2 - 16) // 2
    ans_h = 70
    for i, ans in enumerate(answers):
        ax = pad + (i % 2) * (ans_w + 16)
        ay = content_y + (i // 2) * (ans_h + 12)
        if i == 0:
            border = GAME['teal']
            bg = (114, 184, 168, 36)
            tc = GAME['teal']
        else:
            border = GAME['line']
            bg = GAME['panel']
            tc = GAME['ink']
        draw.rounded_rectangle([ax, ay, ax + ans_w, ay + ans_h],
                               radius=12, fill=bg, outline=border, width=2)
        tw = draw.textbbox((0, 0), ans, font=get_font(15, bold=True))[2]
        draw.text((ax + (ans_w - tw) // 2, ay + 22), ans, fill=tc, font=get_font(15, bold=True))
    content_y += 2 * (ans_h + 12) + 16

    # Feedback
    fb = "Correct! William Shakespeare wrote this in Hamlet." if lang == "en" else "Corretto! William Shakespeare lo scrisse nell'Amleto."
    draw.rounded_rectangle([pad, content_y, w - pad, content_y + 54],
                           radius=8, fill=GAME['panel'])
    draw.rectangle([pad, content_y + 8, pad + 3, content_y + 46], fill=GAME['teal'])
    draw.text((pad + 16, content_y + 16), fb, fill=(199, 207, 202), font=get_font(14))

    return img


def generate():
    os.makedirs(OUT_DIR, exist_ok=True)

    screenshots = [
        ("phone-setup.png", 1080, 1920, "setup", "it"),
        ("phone-setup-en.png", 1080, 1920, "setup", "en"),
        ("phone-game.png", 1080, 1920, "game", "it"),
        ("phone-game-en.png", 1080, 1920, "game", "en"),
        ("phone-results.png", 1080, 1920, "results", "it"),
        ("phone-results-en.png", 1080, 1920, "results", "en"),
        ("tablet-setup.png", 1200, 1920, "tablet_setup", "en"),
        ("tablet-game.png", 1200, 1920, "tablet_game", "en"),
    ]

    for filename, w, h, scene, lang in screenshots:
        if scene == "setup":
            img = make_setup_screen(w, h, lang)
        elif scene == "game":
            img = make_game_screen(w, h, lang)
        elif scene == "results":
            img = make_results_screen(w, h, lang)
        elif scene == "tablet_setup":
            img = make_tablet_setup(w, h, lang)
        elif scene == "tablet_game":
            img = make_tablet_game(w, h, lang)

        img.save(os.path.join(OUT_DIR, filename), 'PNG')
        print(f"  {filename}")

    print(f"\n{len(screenshots)} screenshots saved to marketing/")


if __name__ == '__main__':
    generate()
