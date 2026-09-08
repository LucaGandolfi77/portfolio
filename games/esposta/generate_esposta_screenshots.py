#!/usr/bin/env python3
"""
Esposta Marketing Screenshots Generator
Generates phone and tablet screenshots for the Esposta game
Theme: vintage darkroom/sepia/gold (#d4a853 on #1a1208)
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Theme colors
GOLD = "#d4a853"
DARK_BG = "#1a1208"
DARKER_BG = "#0d0904"
CREAM = "#f5e6c8"
SEPIA = "#704214"
WHITE = "#ffffff"

# Directories
PHONE_DIR = "screenshots/phone"
TABLET_DIR = "screenshots/tablet"

def create_phone_frame():
    """Create phone device frame (1080x1920)"""
    img = Image.new('RGB', (1080, 1920), DARKER_BG)
    draw = ImageDraw.Draw(img)
    
    # Phone border
    draw.rectangle([(40, 80), (1040, 1840)], outline=GOLD, width=3)
    
    # Notch
    draw.rectangle([(420, 80), (660, 120)], fill=DARKER_BG)
    
    # Home button
    draw.ellipse([(480, 1860), (600, 1900)], outline=GOLD, width=2)
    
    return img

def create_tablet_frame():
    """Create tablet device frame (1200x1920)"""
    img = Image.new('RGB', (1200, 1920), DARKER_BG)
    draw = ImageDraw.Draw(img)
    
    # Tablet border
    draw.rectangle([(30, 60), (1170, 1860)], outline=GOLD, width=4)
    
    # Camera
    draw.ellipse([(580, 20), (620, 60)], fill=GOLD)
    
    return img

def draw_title_bar(draw, width, lang="EN"):
    """Draw game title bar"""
    # Title bar background
    draw.rectangle([(0, 80), (width, 180)], fill=DARK_BG)
    draw.line([(0, 180), (width, 180)], fill=GOLD, width=2)
    
    # Title text
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
    except:
        font = ImageFont.load_default()
    
    title = "ESPOSTA" if lang == "EN" else "ESPOSTA"
    draw.text((width//2 - 80, 110), title, fill=GOLD, font=font)
    
    # Language indicator
    lang_text = "EN" if lang == "EN" else "IT"
    draw.text((width - 80, 120), lang_text, fill=CREAM, font=font)

def draw_menu_screen(draw, width, height, lang="EN"):
    """Draw main menu mockup"""
    draw_title_bar(draw, width, lang)
    
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
        font_medium = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
    
    # Menu items
    menu_items = [
        "New Game" if lang == "EN" else "Nuova Partita",
        "Continue" if lang == "EN" else "Continua",
        "Settings" if lang == "EN" else "Impostazioni",
        "About" if lang == "EN" else "Informazioni"
    ]
    
    y_start = 300
    for i, item in enumerate(menu_items):
        # Button background
        draw.rounded_rectangle(
            [(width//2 - 200, y_start + i*120), (width//2 + 200, y_start + i*120 + 80)],
            radius=10, fill=DARK_BG, outline=GOLD
        )
        # Button text
        draw.text((width//2 - 80, y_start + i*120 + 20), item, fill=CREAM, font=font_medium)
    
    # Decorative elements
    draw.line([(100, 250), (width-100, 250)], fill=GOLD, width=1)

def draw_story_screen(draw, width, height, lang="EN"):
    """Draw story/narrative screen"""
    draw_title_bar(draw, width, lang)
    
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
        font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
    except:
        font = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Story text
    story_en = "Chapter 1: The Darkroom\n\nIn the dim light of the vintage darkroom, you discover your first photograph. The sepia tones reveal a story waiting to be told..."
    story_it = "Capitolo 1: La Camera Oscura\n\nNella luce fioca della camera oscura vintage, scopri la tua prima fotografia. I toni seppia rivelano una storia in attesa di essere raccontata..."
    
    text = story_en if lang == "EN" else story_it
    
    # Text box
    draw.rounded_rectangle(
        [(80, 250), (width-80, 800)],
        radius=15, fill=DARK_BG, outline=GOLD
    )
    
    # Story text
    y = 280
    for line in text.split('\n'):
        draw.text((120, y), line, fill=CREAM, font=font)
        y += 40
    
    # Character portrait placeholder
    draw.ellipse([(width//2 - 100, 850), (width//2 + 100, 1050)], fill=SEPIA, outline=GOLD)
    
    # Dialogue options
    draw.rounded_rectangle(
        [(100, 1100), (width-100, 1200)],
        radius=10, fill=DARK_BG, outline=GOLD
    )
    draw.text((150, 1130), "Continue..." if lang == "EN" else "Continua...", fill=GOLD, font=font)

def draw_concept_card(draw, width, height, lang="EN"):
    """Draw educational concept card"""
    draw_title_bar(draw, width, lang)
    
    try:
        font_title = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 42)
        font_body = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 26)
    except:
        font_title = ImageFont.load_default()
        font_body = ImageFont.load_default()
    
    # Concept card
    draw.rounded_rectangle(
        [(60, 250), (width-60, 1000)],
        radius=20, fill=DARK_BG, outline=GOLD
    )
    
    # Concept title
    concept_title = "Exposure Triangle" if lang == "EN" else "Triangolo dell'Esposizione"
    draw.text((width//2 - 150, 280), concept_title, fill=GOLD, font=font_title)
    
    # Diagram placeholder
    draw.polygon(
        [(width//2, 400), (width//2 - 150, 650), (width//2 + 150, 650)],
        outline=GOLD, fill=None
    )
    
    # Labels
    draw.text((width//2 - 20, 380), "ISO", fill=CREAM, font=font_body)
    draw.text((width//2 - 180, 660), "Aperture", fill=CREAM, font=font_body)
    draw.text((width//2 + 80, 660), "Shutter", fill=CREAM, font=font_body)
    
    # Description
    desc = "Master the three pillars of photography" if lang == "EN" else "Padroneggia i tre pilastri della fotografia"
    draw.text((100, 750), desc, fill=CREAM, font=font_body)
    
    # Progress indicator
    draw.rounded_rectangle(
        [(100, 1050), (width-100, 1100)],
        radius=5, fill=DARK_BG, outline=GOLD
    )
    draw.rounded_rectangle(
        [(100, 1050), (300, 1100)],
        radius=5, fill=GOLD
    )

def draw_minigame(draw, width, height, lang="EN"):
    """Draw minigame screen"""
    draw_title_bar(draw, width, lang)
    
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
        font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    except:
        font = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Game title
    game_title = "Composition Master" if lang == "EN" else "Maestro della Composizione"
    draw.text((width//2 - 180, 220), game_title, fill=GOLD, font=font)
    
    # Game area
    draw.rounded_rectangle(
        [(60, 300), (width-60, 1200)],
        radius=15, fill=DARK_BG, outline=GOLD
    )
    
    # Grid
    for i in range(3):
        x = 60 + (width-120) // 3 * (i+1)
        draw.line([(x, 300), (x, 1200)], fill=GOLD, width=1)
        y = 300 + 900 // 3 * (i+1)
        draw.line([(60, y), (width-60, y)], fill=GOLD, width=1)
    
    # Score
    score_text = "Score: 850" if lang == "EN" else "Punteggio: 850"
    draw.text((100, 1250), score_text, fill=GOLD, font=font)
    
    # Instructions
    instr = "Arrange elements using rule of thirds" if lang == "EN" else "Disponi gli elementi usando la regola dei terzi"
    draw.text((100, 1320), instr, fill=CREAM, font=font_small)

def draw_exam_screen(draw, width, height, lang="EN"):
    """Draw exam screen"""
    draw_title_bar(draw, width, lang)
    
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
        font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    except:
        font = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Exam title
    exam_title = "Final Exam" if lang == "EN" else "Esame Finale"
    draw.text((width//2 - 100, 220), exam_title, fill=GOLD, font=font)
    
    # Question
    q_text = "Question 5/12" if lang == "EN" else "Domanda 5/12"
    draw.text((100, 300), q_text, fill=CREAM, font=font_small)
    
    # Question box
    draw.rounded_rectangle(
        [(60, 360), (width-60, 600)],
        radius=10, fill=DARK_BG, outline=GOLD
    )
    
    question = "What is the primary purpose of a shallow depth of field?" if lang == "EN" else "Qual è lo scopo principale della bassa profondità di campo?"
    draw.text((100, 400), question, fill=CREAM, font=font_small)
    
    # Answer options
    answers = [
        "A) Increase sharpness",
        "B) Isolate subject",
        "C) Darken image",
        "D) Speed up shutter"
    ] if lang == "EN" else [
        "A) Aumentare la nitidezza",
        "B) Isolare il soggetto",
        "C) Scurire l'immagine",
        "D) Velocizzare l'otturatore"
    ]
    
    for i, answer in enumerate(answers):
        y = 650 + i * 100
        draw.rounded_rectangle(
            [(80, y), (width-80, y + 70)],
            radius=8, fill=DARK_BG, outline=GOLD
        )
        draw.text((120, y + 20), answer, fill=CREAM, font=font_small)

def draw_agency_screen(draw, width, height, lang="EN"):
    """Draw agency mode screen"""
    draw_title_bar(draw, width, lang)
    
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
        font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    except:
        font = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Agency title
    agency_title = "Your Agency" if lang == "EN" else "La Tua Agenzia"
    draw.text((width//2 - 120, 220), agency_title, fill=GOLD, font=font)
    
    # Stats panel
    draw.rounded_rectangle(
        [(60, 300), (width-60, 500)],
        radius=10, fill=DARK_BG, outline=GOLD
    )
    
    stats = [
        ("Clients:", "12"),
        ("Revenue:", "€45,000"),
        ("Reputation:", "★★★★☆")
    ]
    
    x = 100
    for label, value in stats:
        draw.text((x, 330), label, fill=CREAM, font=font_small)
        draw.text((x, 370), value, fill=GOLD, font=font)
        x += 250
    
    # Active projects
    draw.text((100, 530), "Active Projects", fill=GOLD, font=font)
    
    projects = [
        "Restaurant branding shoot",
        "Fashion magazine spread",
        "Product catalog"
    ] if lang == "EN" else [
        "Servizio brand ristorante",
        "Servizio moda magazine",
        "Catalogo prodotti"
    ]
    
    for i, project in enumerate(projects):
        y = 600 + i * 120
        draw.rounded_rectangle(
            [(80, y), (width-80, y + 90)],
            radius=8, fill=DARK_BG, outline=GOLD
        )
        draw.text((120, y + 30), project, fill=CREAM, font=font_small)
    
    # Timeline
    draw.line([(100, 1000), (width-100, 1000)], fill=GOLD, width=2)
    for i in range(5):
        x = 100 + (width-200) // 4 * i
        draw.ellipse([(x-8, 992), (x+8, 1008)], fill=GOLD)

def generate_screenshots():
    """Generate all screenshots"""
    # Phone screenshots (1080x1920)
    phone_screenshots = [
        ("menu", draw_menu_screen),
        ("story", draw_story_screen),
        ("concept", draw_concept_card),
        ("minigame", draw_minigame),
        ("exam", draw_exam_screen),
        ("agency", draw_agency_screen)
    ]
    
    # Tablet screenshots (1200x1920)
    tablet_screenshots = [
        ("menu", draw_menu_screen),
        ("story", draw_story_screen),
        ("concept", draw_concept_card),
        ("minigame", draw_minigame),
        ("exam", draw_exam_screen),
        ("agency", draw_agency_screen)
    ]
    
    # Generate phone screenshots
    for name, draw_func in phone_screenshots:
        for lang in ["EN", "IT"]:
            img = create_phone_frame()
            draw = ImageDraw.Draw(img)
            draw_func(draw, 1080, 1920, lang)
            
            filename = f"{PHONE_DIR}/esposta_{name}_{lang.lower()}.png"
            img.save(filename, "PNG")
            print(f"Generated: {filename}")
    
    # Generate tablet screenshots
    for name, draw_func in tablet_screenshots:
        for lang in ["EN", "IT"]:
            img = create_tablet_frame()
            draw = ImageDraw.Draw(img)
            draw_func(draw, 1200, 1920, lang)
            
            filename = f"{TABLET_DIR}/esposta_{name}_{lang.lower()}.png"
            img.save(filename, "PNG")
            print(f"Generated: {filename}")

if __name__ == "__main__":
    # Create directories
    os.makedirs(PHONE_DIR, exist_ok=True)
    os.makedirs(TABLET_DIR, exist_ok=True)
    
    # Generate screenshots
    generate_screenshots()
    
    print("\nScreenshot generation complete!")
    print(f"Phone screenshots: {PHONE_DIR}/")
    print(f"Tablet screenshots: {TABLET_DIR}/")