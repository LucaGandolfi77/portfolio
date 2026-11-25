from PIL import Image, ImageDraw
import math

# Constants
SPRITE_SIZE = 32
WIDTH = 16 * SPRITE_SIZE
HEIGHT = 18 * SPRITE_SIZE

img = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

def draw_pixel_rect(x, y, w, h, color):
    draw.rectangle([x, y, x+w-1, y+h-1], fill=color)

def draw_base_sprite(gx, gy):
    return gx * SPRITE_SIZE, gy * SPRITE_SIZE

# --- Helper Drawing Functions ---

def draw_player_sprite(gx, gy, direction, frame_idx):
    sx, sy = draw_base_sprite(gx, gy)
    
    # Skin
    draw.rectangle([sx+10, sy+4, sx+22, sy+14], fill='#ffccaa') # Head
    
    # Hat (Red cap)
    draw.rectangle([sx+8, sy+2, sx+24, sy+6], fill='#e74c3c')
    draw.rectangle([sx+8, sy+6, sx+24, sy+8], fill='#c0392b') # Brim shadow
    
    # Body (Blue shirt)
    draw.rectangle([sx+10, sy+14, sx+22, sy+24], fill='#3498db')
    
    # Legs (Black pants)
    draw.rectangle([sx+10, sy+24, sx+22, sy+30], fill='#2c3e50')
    
    # Animation bobbing
    bob = 0
    if frame_idx % 2 != 0:
        bob = 1
        draw.rectangle([sx+10, sy+24, sx+22, sy+30], fill='#2c3e50') # Redraw legs lower? No just shift
    
    # Eyes based on direction
    eye_color = 'black'
    if direction == 'down':
        draw.rectangle([sx+12, sy+8, sx+14, sy+10], fill=eye_color)
        draw.rectangle([sx+18, sy+8, sx+20, sy+10], fill=eye_color)
    elif direction == 'left':
        draw.rectangle([sx+10, sy+8, sx+12, sy+10], fill=eye_color)
    elif direction == 'right':
        draw.rectangle([sx+20, sy+8, sx+22, sy+10], fill=eye_color)
    
    # Arms/Legs movement
    if frame_idx % 2 != 0:
        if direction == 'down' or direction == 'up':
             draw.rectangle([sx+8, sy+16, sx+10, sy+22], fill='#ffccaa') # Left arm out
             draw.rectangle([sx+22, sy+16, sx+24, sy+22], fill='#ffccaa') # Right arm out

def draw_grass(gx, gy):
    sx, sy = draw_base_sprite(gx, gy)
    draw.rectangle([sx, sy, sx+31, sy+31], fill='#2ecc71') # Base
    # Blades
    for i in range(5):
        ox = (i * 7) % 24
        oy = (i * 11) % 24
        draw.rectangle([sx+ox, sy+oy, sx+ox+2, sy+oy+4], fill='#27ae60')

def draw_water(gx, gy, frame):
    sx, sy = draw_base_sprite(gx, gy)
    draw.rectangle([sx, sy, sx+31, sy+31], fill='#3498db')
    # Waves
    offset = frame * 4
    draw.line([sx+4, sy+8+offset, sx+12, sy+8+offset], fill='#85c1e9', width=2)
    draw.line([sx+18, sy+20-offset, sx+26, sy+20-offset], fill='#85c1e9', width=2)

def draw_sand(gx, gy):
    sx, sy = draw_base_sprite(gx, gy)
    draw.rectangle([sx, sy, sx+31, sy+31], fill='#f1c40f')
    # Specks
    draw.point([sx+5, sy+5], fill='#d35400')
    draw.point([sx+20, sy+15], fill='#d35400')
    draw.point([sx+10, sy+25], fill='#d35400')

def draw_tree(gx, gy):
    sx, sy = draw_base_sprite(gx, gy)
    # Trunk
    draw.rectangle([sx+12, sy+20, sx+20, sy+31], fill='#795548')
    # Leaves (3 circles)
    draw.ellipse([sx+4, sy+4, sx+28, sy+24], fill='#27ae60')
    draw.ellipse([sx+8, sy+0, sx+24, sy+16], fill='#2ecc71')

def draw_rock(gx, gy):
    sx, sy = draw_base_sprite(gx, gy)
    draw.ellipse([sx+4, sy+8, sx+28, sy+28], fill='#95a5a6')
    draw.ellipse([sx+6, sy+10, sx+24, sy+24], fill='#bdc3c7')

def draw_flower(gx, gy):
    sx, sy = draw_base_sprite(gx, gy)
    # Stem
    draw.rectangle([sx+15, sy+16, sx+17, sy+31], fill='#2ecc71')
    # Petals
    draw.ellipse([sx+8, sy+8, sx+24, sy+24], fill='#e91e63')
    # Center
    draw.ellipse([sx+14, sy+14, sx+18, sy+18], fill='#f1c40f')

def draw_house_parts(gx, gy, part):
    sx, sy = draw_base_sprite(gx, gy)
    if part == 'roof':
        draw.polygon([(sx, sy+31), (sx+16, sy), (sx+31, sy+31)], fill='#c0392b')
        draw.line([(sx, sy+31), (sx+16, sy), (sx+31, sy+31)], fill='#922b21', width=1)
    elif part == 'wall':
        draw.rectangle([sx, sy, sx+31, sy+31], fill='#ecf0f1')
        draw.rectangle([sx+4, sy+4, sx+12, sy+12], fill='#bdc3c7') # Window
    elif part == 'door':
        draw.rectangle([sx, sy, sx+31, sy+31], fill='#ecf0f1')
        draw.rectangle([sx+8, sy+8, sx+24, sy+31], fill='#795548') # Door
        draw.ellipse([sx+20, sy+18, sx+22, sy+20], fill='#f1c40f') # Knob

def draw_pokemon_blob(gx, gy, color, name):
    sx, sy = draw_base_sprite(gx, gy)
    # Body
    draw.ellipse([sx+4, sy+8, sx+28, sy+28], fill=color)
    # Eyes
    draw.rectangle([sx+10, sy+14, sx+12, sy+16], fill='black')
    draw.rectangle([sx+20, sy+14, sx+22, sy+16], fill='black')
    # Name hint
    # draw.text((sx+2, sy), name[0], fill='black')

def draw_pikachu(gx, gy):
    sx, sy = draw_base_sprite(gx, gy)
    # Ears
    draw.polygon([(sx+6, sy+4), (sx+10, sy+12), (sx+4, sy+12)], fill='#f1c40f')
    draw.polygon([(sx+26, sy+4), (sx+22, sy+12), (sx+28, sy+12)], fill='#f1c40f')
    # Body
    draw.ellipse([sx+6, sy+10, sx+26, sy+28], fill='#f1c40f')
    # Cheeks
    draw.ellipse([sx+8, sy+18, sx+10, sy+20], fill='#e74c3c')
    draw.ellipse([sx+22, sy+18, sx+24, sy+20], fill='#e74c3c')
    # Eyes
    draw.rectangle([sx+10, sy+14, sx+12, sy+16], fill='black')
    draw.rectangle([sx+20, sy+14, sx+22, sy+16], fill='black')

def draw_charmander(gx, gy):
    sx, sy = draw_base_sprite(gx, gy)
    draw.ellipse([sx+6, sy+8, sx+26, sy+28], fill='#e67e22')
    draw.rectangle([sx+10, sy+14, sx+12, sy+16], fill='black')
    draw.rectangle([sx+20, sy+14, sx+22, sy+16], fill='black')
    # Tail flame
    draw.ellipse([sx+24, sy+20, sx+30, sy+26], fill='#e74c3c')
    draw.ellipse([sx+25, sy+21, sx+29, sy+25], fill='#f1c40f')

def draw_squirtle(gx, gy):
    sx, sy = draw_base_sprite(gx, gy)
    draw.ellipse([sx+6, sy+8, sx+26, sy+28], fill='#3498db')
    # Shell
    draw.ellipse([sx+8, sy+16, sx+24, sy+26], fill='#e67e22')
    draw.rectangle([sx+10, sy+12, sx+12, sy+14], fill='black')
    draw.rectangle([sx+20, sy+12, sx+22, sy+14], fill='black')

def draw_bulbasaur(gx, gy):
    sx, sy = draw_base_sprite(gx, gy)
    # Bulb
    draw.ellipse([sx+10, sy+4, sx+22, sy+16], fill='#2ecc71')
    # Body
    draw.ellipse([sx+6, sy+12, sx+26, sy+28], fill='#1abc9c')
    draw.rectangle([sx+10, sy+18, sx+12, sy+20], fill='black')
    draw.rectangle([sx+20, sy+18, sx+22, sy+20], fill='black')

# --- Execution ---

# 1. Player (Rows 0-3)
directions = ['down', 'left', 'right', 'up']
for row, direction in enumerate(directions):
    for col in range(4):
        draw_player_sprite(col, row, direction, col)

# 2. Tiles (Row 4)
draw_grass(0, 4)
for i in range(3): draw_water(1+i, 4, i)
draw_sand(4, 4)
# Snow
draw.rectangle([5*SPRITE_SIZE, 4*SPRITE_SIZE, 6*SPRITE_SIZE-1, 5*SPRITE_SIZE-1], fill='#ecf0f1')
# Rock Ground
draw.rectangle([6*SPRITE_SIZE, 4*SPRITE_SIZE, 7*SPRITE_SIZE-1, 5*SPRITE_SIZE-1], fill='#7f8c8d')
draw.ellipse([6*SPRITE_SIZE+5, 4*SPRITE_SIZE+5, 6*SPRITE_SIZE+15, 4*SPRITE_SIZE+15], fill='#95a5a6')
# Dirt
draw.rectangle([7*SPRITE_SIZE, 4*SPRITE_SIZE, 8*SPRITE_SIZE-1, 5*SPRITE_SIZE-1], fill='#d35400')

# 3. More Tiles (Row 5)
# Bridge
draw.rectangle([0, 5*SPRITE_SIZE, 31, 6*SPRITE_SIZE-1], fill='#d35400')
draw.line([0, 5*SPRITE_SIZE+5, 31, 5*SPRITE_SIZE+5], fill='#a04000')
draw.line([0, 5*SPRITE_SIZE+25, 31, 5*SPRITE_SIZE+25], fill='#a04000')
# Floor
draw.rectangle([1*SPRITE_SIZE, 5*SPRITE_SIZE, 2*SPRITE_SIZE-1, 6*SPRITE_SIZE-1], fill='#e67e22')
draw.rectangle([1*SPRITE_SIZE+2, 5*SPRITE_SIZE+2, 2*SPRITE_SIZE-3, 6*SPRITE_SIZE-3], outline='#d35400')
# Mat
draw.rectangle([2*SPRITE_SIZE, 5*SPRITE_SIZE, 3*SPRITE_SIZE-1, 6*SPRITE_SIZE-1], fill='#e67e22')
draw.rectangle([2*SPRITE_SIZE+6, 5*SPRITE_SIZE+10, 3*SPRITE_SIZE-6, 6*SPRITE_SIZE-6], fill='#c0392b')
# Tilled
draw.rectangle([3*SPRITE_SIZE, 5*SPRITE_SIZE, 4*SPRITE_SIZE-1, 6*SPRITE_SIZE-1], fill='#5d4037')
draw.line([3*SPRITE_SIZE, 5*SPRITE_SIZE+8, 4*SPRITE_SIZE, 5*SPRITE_SIZE+8], fill='#3e2723')
draw.line([3*SPRITE_SIZE, 5*SPRITE_SIZE+24, 4*SPRITE_SIZE, 5*SPRITE_SIZE+24], fill='#3e2723')
# Road
draw.rectangle([4*SPRITE_SIZE, 5*SPRITE_SIZE, 5*SPRITE_SIZE-1, 6*SPRITE_SIZE-1], fill='#95a5a6')
# Bar Floor
draw.rectangle([5*SPRITE_SIZE, 5*SPRITE_SIZE, 6*SPRITE_SIZE-1, 6*SPRITE_SIZE-1], fill='#8e44ad')
# Ice
draw.rectangle([6*SPRITE_SIZE, 5*SPRITE_SIZE, 7*SPRITE_SIZE-1, 6*SPRITE_SIZE-1], fill='#81ecec')
draw.line([6*SPRITE_SIZE+5, 5*SPRITE_SIZE+5, 6*SPRITE_SIZE+25, 6*SPRITE_SIZE+25], fill='white')
# City Road
draw.rectangle([7*SPRITE_SIZE, 5*SPRITE_SIZE, 8*SPRITE_SIZE-1, 6*SPRITE_SIZE-1], fill='#34495e')
draw.line([7*SPRITE_SIZE+16, 5*SPRITE_SIZE+4, 7*SPRITE_SIZE+16, 6*SPRITE_SIZE-4], fill='white', width=2)
# City Sidewalk
draw.rectangle([8*SPRITE_SIZE, 5*SPRITE_SIZE, 9*SPRITE_SIZE-1, 6*SPRITE_SIZE-1], fill='#bdc3c7')
# Cave Entrance
draw.ellipse([9*SPRITE_SIZE+2, 5*SPRITE_SIZE+2, 10*SPRITE_SIZE-3, 6*SPRITE_SIZE-3], fill='#2c3e50')
# Cave Floor
draw.rectangle([10*SPRITE_SIZE, 5*SPRITE_SIZE, 11*SPRITE_SIZE-1, 6*SPRITE_SIZE-1], fill='#7f8c8d')
# Cave Wall
draw.rectangle([11*SPRITE_SIZE, 5*SPRITE_SIZE, 12*SPRITE_SIZE-1, 6*SPRITE_SIZE-1], fill='#34495e')
# Ladder
draw.rectangle([12*SPRITE_SIZE, 5*SPRITE_SIZE, 13*SPRITE_SIZE-1, 6*SPRITE_SIZE-1], fill='#7f8c8d')
draw.line([12*SPRITE_SIZE+10, 5*SPRITE_SIZE, 12*SPRITE_SIZE+10, 6*SPRITE_SIZE], fill='#5d4037', width=2)
draw.line([12*SPRITE_SIZE+22, 5*SPRITE_SIZE, 12*SPRITE_SIZE+22, 6*SPRITE_SIZE], fill='#5d4037', width=2)
for i in range(4):
    y = 5*SPRITE_SIZE + 4 + i*8
    draw.line([12*SPRITE_SIZE+10, y, 12*SPRITE_SIZE+22, y], fill='#5d4037', width=2)
# Tunnel
draw.ellipse([13*SPRITE_SIZE+4, 5*SPRITE_SIZE+4, 14*SPRITE_SIZE-4, 6*SPRITE_SIZE-4], fill='black')

# 4. Objects (Row 6)
draw_tree(0, 6)
draw_rock(1, 6)
draw_flower(2, 6)
# Tall Grass
draw.rectangle([3*SPRITE_SIZE, 6*SPRITE_SIZE, 4*SPRITE_SIZE-1, 7*SPRITE_SIZE-1], fill='#16a085')
# Cactus
draw.rectangle([4*SPRITE_SIZE+12, 6*SPRITE_SIZE+4, 5*SPRITE_SIZE-12, 7*SPRITE_SIZE-1], fill='#2ecc71')
draw.rectangle([4*SPRITE_SIZE+4, 6*SPRITE_SIZE+12, 5*SPRITE_SIZE-4, 6*SPRITE_SIZE+16], fill='#2ecc71')
# Pine
draw.polygon([(5*SPRITE_SIZE+16, 6*SPRITE_SIZE+2), (5*SPRITE_SIZE+4, 6*SPRITE_SIZE+28), (5*SPRITE_SIZE+28, 6*SPRITE_SIZE+28)], fill='#145a32')
draw.rectangle([5*SPRITE_SIZE+14, 6*SPRITE_SIZE+28, 5*SPRITE_SIZE+18, 7*SPRITE_SIZE-1], fill='#795548')
# Palm
draw.rectangle([6*SPRITE_SIZE+14, 6*SPRITE_SIZE+10, 7*SPRITE_SIZE-14, 7*SPRITE_SIZE-1], fill='#d35400')
draw.ellipse([6*SPRITE_SIZE+2, 6*SPRITE_SIZE+2, 7*SPRITE_SIZE-2, 6*SPRITE_SIZE+16], fill='#f1c40f')
# House Parts
draw_house_parts(7, 6, 'roof')
draw_house_parts(8, 6, 'wall')
draw_house_parts(9, 6, 'door')
# Stump
draw.ellipse([10*SPRITE_SIZE+6, 6*SPRITE_SIZE+16, 11*SPRITE_SIZE-6, 7*SPRITE_SIZE-1], fill='#795548')
draw.ellipse([10*SPRITE_SIZE+8, 6*SPRITE_SIZE+16, 11*SPRITE_SIZE-8, 6*SPRITE_SIZE+22], fill='#a1887f')
# Bar Counter
draw.rectangle([11*SPRITE_SIZE, 6*SPRITE_SIZE+10, 12*SPRITE_SIZE-1, 7*SPRITE_SIZE-1], fill='#5d4037')
# Bar Table
draw.ellipse([12*SPRITE_SIZE+4, 6*SPRITE_SIZE+10, 13*SPRITE_SIZE-4, 7*SPRITE_SIZE-10], fill='#8d6e63')
# Bar Chair
draw.ellipse([13*SPRITE_SIZE+10, 6*SPRITE_SIZE+10, 14*SPRITE_SIZE-10, 7*SPRITE_SIZE-10], fill='#d35400')
# Puddle
draw.ellipse([14*SPRITE_SIZE+4, 6*SPRITE_SIZE+12, 15*SPRITE_SIZE-4, 7*SPRITE_SIZE-4], fill='#3498db')
# Boat
draw.rectangle([15*SPRITE_SIZE+4, 6*SPRITE_SIZE+10, 16*SPRITE_SIZE-4, 7*SPRITE_SIZE-4], fill='#ecf0f1')
draw.rectangle([15*SPRITE_SIZE+8, 6*SPRITE_SIZE+14, 16*SPRITE_SIZE-8, 7*SPRITE_SIZE-8], fill='#34495e')

# 5. Pokemon (Rows 7+)
# Pikachu (Row 7)
for i in range(4): draw_pikachu(i, 7)
# Charmander (Row 8)
for i in range(4): draw_charmander(i, 8)
# Squirtle (Row 9)
for i in range(4): draw_squirtle(i, 9)
# Bulbasaur (Row 10)
for i in range(8): draw_bulbasaur(i, 10)
# Lapras (Row 11)
for i in range(4): draw_pokemon_blob(i, 11, '#2980b9', 'L')
# Sandshrew (Row 12)
for i in range(4): draw_pokemon_blob(i, 12, '#f39c12', 'S')
# Spheal (Row 13)
for i in range(4): draw_pokemon_blob(i, 13, '#81ecec', 'Sp')
# Caterpie (Row 14)
for i in range(4): draw_pokemon_blob(i, 14, '#27ae60', 'C')
# Geodude (Row 15)
for i in range(4): draw_pokemon_blob(i, 15, '#7f8c8d', 'G')
# Onix (Row 16)
for i in range(4): draw_pokemon_blob(i, 16, '#95a5a6', 'O')
# Wobbuffet (Row 17)
for i in range(4): draw_pokemon_blob(i, 17, '#3498db', 'W')

img.save('assets/img/pokemon/sprites.png')
print("Sprites generated!")
