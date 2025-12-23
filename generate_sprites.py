from PIL import Image, ImageDraw, ImageFont
import os

# Constants
SPRITE_SIZE = 32
OUTPUT_PATH = 'assets/img/pokemon/sprites.png'

# Determine image size based on the map analysis
# Max X is 15 (boat at 15,6) -> 16 columns (0-15)
# Max Y is 17 (wobbuffet at y=17) -> 18 rows (0-17)
WIDTH = 16 * SPRITE_SIZE
HEIGHT = 18 * SPRITE_SIZE

img = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

def draw_rect(x, y, color):
    draw.rectangle(
        [x * SPRITE_SIZE, y * SPRITE_SIZE, (x + 1) * SPRITE_SIZE - 1, (y + 1) * SPRITE_SIZE - 1],
        fill=color, outline='black'
    )

def draw_circle(x, y, color):
    draw.ellipse(
        [x * SPRITE_SIZE + 2, y * SPRITE_SIZE + 2, (x + 1) * SPRITE_SIZE - 3, (y + 1) * SPRITE_SIZE - 3],
        fill=color, outline='black'
    )

def draw_text(x, y, text, color='white'):
    # Simple text drawing, might be too small but helps identify
    draw.text((x * SPRITE_SIZE + 2, y * SPRITE_SIZE + 10), text[0:4], fill=color)

# --- Row 0-3: Player ---
# Down, Left, Right, Up (4 frames each)
player_colors = ['#e74c3c', '#c0392b', '#e74c3c', '#c0392b'] # Redish
for y in range(4):
    for x in range(4):
        draw_rect(x, y, player_colors[x % 2])
        draw_text(x, y, f"P{y}")
        # Add direction indicator
        cx, cy = x * SPRITE_SIZE + 16, y * SPRITE_SIZE + 16
        if y == 0: # Down
            draw.polygon([(cx-5, cy-5), (cx+5, cy-5), (cx, cy+5)], fill='white')
        elif y == 1: # Left
            draw.polygon([(cx+5, cy-5), (cx+5, cy+5), (cx-5, cy)], fill='white')
        elif y == 2: # Right
            draw.polygon([(cx-5, cy-5), (cx-5, cy+5), (cx+5, cy)], fill='white')
        elif y == 3: # Up
            draw.polygon([(cx-5, cy+5), (cx+5, cy+5), (cx, cy-5)], fill='white')

# --- Row 4: Ground Tiles ---
# grass: 0,4
draw_rect(0, 4, '#2ecc71') # Green
# water: 1,4 - 3,4
for x in range(1, 4):
    draw_rect(x, 4, '#3498db') # Blue
    draw.line([x*SPRITE_SIZE, 4*SPRITE_SIZE + x*5, (x+1)*SPRITE_SIZE, 4*SPRITE_SIZE + x*5], fill='white', width=2)
# sand: 4,4
draw_rect(4, 4, '#f1c40f') # Yellow
# snow: 5,4
draw_rect(5, 4, '#ecf0f1') # White
# rock_ground: 6,4
draw_rect(6, 4, '#95a5a6') # Grey
# dirt: 7,4
draw_rect(7, 4, '#d35400') # Brown

# --- Row 5: More Tiles ---
# bridge: 0,5
draw_rect(0, 5, '#d35400')
draw.line([0, 5*SPRITE_SIZE+10, 32, 5*SPRITE_SIZE+10], fill='black')
draw.line([0, 5*SPRITE_SIZE+22, 32, 5*SPRITE_SIZE+22], fill='black')
# floor: 1,5
draw_rect(1, 5, '#e67e22')
# mat: 2,5
draw_rect(2, 5, '#e67e22')
draw.rectangle([2*SPRITE_SIZE+4, 5*SPRITE_SIZE+8, 2*SPRITE_SIZE+28, 5*SPRITE_SIZE+24], fill='#c0392b')
# tilled: 3,5
draw_rect(3, 5, '#5d4037')
# road: 4,5
draw_rect(4, 5, '#7f8c8d')
# bar_floor: 5,5
draw_rect(5, 5, '#8e44ad')
# ice: 6,5
draw_rect(6, 5, '#81ecec')
# city_road: 7,5
draw_rect(7, 5, '#2c3e50')
# city_sidewalk: 8,5
draw_rect(8, 5, '#bdc3c7')
# cave_entrance: 9,5
draw_circle(9, 5, '#2c3e50')
# cave_floor: 10,5
draw_rect(10, 5, '#34495e')
# cave_wall: 11,5
draw_rect(11, 5, '#2c3e50')
# ladder: 12,5
draw_rect(12, 5, '#34495e')
draw.line([12*SPRITE_SIZE+10, 5*SPRITE_SIZE, 12*SPRITE_SIZE+10, 6*SPRITE_SIZE], fill='#e67e22', width=2)
draw.line([12*SPRITE_SIZE+22, 5*SPRITE_SIZE, 12*SPRITE_SIZE+22, 6*SPRITE_SIZE], fill='#e67e22', width=2)
# tunnel: 13,5
draw_circle(13, 5, 'black')

# --- Row 6: Objects ---
# tree: 0,6
draw_circle(0, 6, '#27ae60') # Green top
draw.rectangle([0*SPRITE_SIZE+12, 6*SPRITE_SIZE+20, 0*SPRITE_SIZE+20, 6*SPRITE_SIZE+32], fill='#795548') # Trunk
# rock: 1,6
draw_circle(1, 6, '#7f8c8d')
# flower: 2,6
draw_circle(2, 6, '#e91e63')
# tall_grass: 3,6
draw_rect(3, 6, '#16a085')
# cactus: 4,6
draw_rect(4, 6, '#2ecc71')
# pine: 5,6
draw.polygon([(5*SPRITE_SIZE+16, 6*SPRITE_SIZE), (5*SPRITE_SIZE, 6*SPRITE_SIZE+32), (5*SPRITE_SIZE+32, 6*SPRITE_SIZE+32)], fill='#145a32')
# palm: 6,6
draw_circle(6, 6, '#f1c40f') # Coconut?
# house_roof: 7,6
draw_rect(7, 6, '#c0392b')
# house_wall: 8,6
draw_rect(8, 6, '#ecf0f1')
# house_door: 9,6
draw_rect(9, 6, '#795548')
# stump: 10,6
draw_circle(10, 6, '#795548')
# bar_counter: 11,6
draw_rect(11, 6, '#8d6e63')
# bar_table: 12,6
draw_circle(12, 6, '#8d6e63')
# bar_chair: 13,6
draw_circle(13, 6, '#d35400')
# puddle: 14,6
draw_circle(14, 6, '#3498db')
# boat: 15,6
draw_rect(15, 6, '#ecf0f1')
draw.rectangle([15*SPRITE_SIZE+4, 6*SPRITE_SIZE+4, 15*SPRITE_SIZE+28, 6*SPRITE_SIZE+28], fill='#34495e')

# --- Row 7: Pikachu ---
for x in range(4):
    draw_circle(x, 7, '#f1c40f') # Yellow
    draw_text(x, 7, "Pika", 'black')

# --- Row 8: Charmander ---
for x in range(4):
    draw_circle(x, 8, '#e67e22') # Orange
    draw_text(x, 8, "Char", 'black')

# --- Row 9: Squirtle ---
for x in range(4):
    draw_circle(x, 9, '#3498db') # Blue
    draw_text(x, 9, "Squi", 'white')

# --- Row 10: Bulbasaur (8 frames) ---
for x in range(8):
    draw_circle(x, 10, '#2ecc71') # Green
    draw_text(x, 10, "Bulb", 'black')

# --- Row 11: Lapras ---
for x in range(4):
    draw_circle(x, 11, '#2980b9') # Dark Blue
    draw_text(x, 11, "Lapr", 'white')

# --- Row 12: Sandshrew ---
for x in range(4):
    draw_circle(x, 12, '#f39c12') # Yellow/Brown
    draw_text(x, 12, "Sand", 'black')

# --- Row 13: Spheal ---
for x in range(4):
    draw_circle(x, 13, '#81ecec') # Light Blue
    draw_text(x, 13, "Sphe", 'black')

# --- Row 14: Caterpie ---
for x in range(4):
    draw_circle(x, 14, '#27ae60') # Green
    draw_text(x, 14, "Cate", 'white')

# --- Row 15: Geodude ---
for x in range(4):
    draw_circle(x, 15, '#7f8c8d') # Grey
    draw_text(x, 15, "Geod", 'white')

# --- Row 16: Onix ---
for x in range(4):
    draw_circle(x, 16, '#95a5a6') # Light Grey
    draw_text(x, 16, "Onix", 'black')

# --- Row 17: Wobbuffet ---
for x in range(4):
    draw_circle(x, 17, '#3498db') # Blue
    draw_text(x, 17, "Wobb", 'white')

# Save
img.save(OUTPUT_PATH)
print(f"Generated {OUTPUT_PATH}")
