#!/usr/bin/env python3
"""
gfx.py - generate GBA graphics & map data from ASCII art sources.

Reads:
  art/tiles.txt   - 8x8 BG tiles (each: [name] + 8 rows of 8 chars)
  art/hero.txt    - 16x16 OBJ frames (each: [name] + 16 rows of 16 chars)
  art/font.txt    - 5x7 font glyphs (each: [name] + 7 rows of 5 chars)
  art/maps.txt    - 32x32 cell maps (each: [map name] + 32 rows of 32 chars)

Writes:
  src/gfx_data.h  - tile indices, palette, extern decls
  src/gfx_data.c  - palette, tileset, font, hero, char map
  src/map_data.h  - expanded 64x64 tile maps + constants

Run:  python3 tools/gfx.py
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
ART = os.path.join(ROOT, "art")
SRC = os.path.join(ROOT, "src")

# ---------------------------------------------------------------- palettes
# RGB555 values, char -> palette index
BG_PAL = {
    '.': 0x0000,  # black
    '1': 0x1221,  # dark grass
    '2': 0x1AC2,  # mid grass
    '3': 0x2745,  # light grass
    '4': 0x42BA,  # path light
    '5': 0x29B0,  # path dark
    '6': 0x5101,  # water dark
    '7': 0x69C3,  # water light
    '8': 0x0D31,  # brown
    '9': 0x0981,  # canopy dark
    'A': 0x1663,  # canopy light
    'W': 0x7FFF,  # white
    'R': 0x0C7D,  # roof red
    'C': 0x46DA,  # wall cream
    'Y': 0x0F7F,  # flower yellow
    'E': 0x209F,  # flower red
}

OBJ_PAL = {
    '.': 0x0000,  # transparent
    'K': 0x0000,  # black
    'S': 0x46BF,  # skin
    'R': 0x109E,  # red cap
    'B': 0x7104,  # blue shirt
    'H': 0x1552,  # brown hair
    'W': 0x7FFF,  # white
    'D': 0x0854,  # dark shade
}

# cell -> 2x2 tiles (tile names, resolved after tileset parse)
CELLS = {
    '.': ['grass1', 'grass2', 'grass3', 'grass1'],  # replaced with seeded grass below
    '#': ['tree_tl', 'tree_tr', 'tree_bl', 'tree_br'],
    '~': ['water1', 'water2', 'water1', 'water2'],
    '+': ['path1', 'path2', 'path1', 'path2'],
    'F': ['flower', 'grass2', 'grass3', 'grass1'],
    'B': ['berry', 'berry', 'berry', 'berry'],
    'W': ['wall', 'wall', 'wall', 'wall'],
    'R': ['roof', 'roof', 'roof', 'roof'],
    'D': ['door', 'door', 'door', 'door'],
    'N': ['window', 'window', 'window', 'window'],
    'S': ['sign', 'grass2', 'grass3', 'grass1'],
    '_': ['floor', 'floor', 'floor', 'floor'],
    'X': ['iwall', 'iwall', 'iwall', 'iwall'],
}
GRASS = ['grass1', 'grass2', 'grass3']

BERRY_CELL = 'B'


# ---------------------------------------------------------------- parsing
def parse_blocks(path, rows, cols):
    """Parse an art file into [(name, [rows of char lists])]."""
    blocks = []
    name = None
    grid = []
    with open(path) as f:
        for raw in f:
            line = raw.rstrip("\n")
            if not line.strip() or line.startswith("# ") or line == "#":
                continue
            if line.startswith("[") and line.endswith("]"):
                if name is not None:
                    blocks.append((name, grid))
                name = line[1:-1].strip()
                grid = []
                continue
            if name is None:
                continue
            if len(line) != cols:
                sys.exit("gfx: %s: row has %d chars, expected %d:\n%s"
                         % (path, len(line), cols, line))
            grid.append(list(line))
    if name is not None:
        blocks.append((name, grid))
    for n, g in blocks:
        if len(g) != rows:
            sys.exit("gfx: %s: block [%s] has %d rows, expected %d"
                     % (path, n, len(g), rows))
    return blocks


def encode_tile_4bpp(grid, idx, x0, y0, w=8, h=8):
    """Encode an (w x h) region of the art grid as 4bpp tile bytes."""
    out = bytearray()
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w, 2):
            p0 = idx[grid[y][x]]
            p1 = idx[grid[y][x + 1]]
            out.append((p1 << 4) | p0)
    return out


# ---------------------------------------------------------------- output
def c_hex(data, per=12, indent="    "):
    lines = []
    for i in range(0, len(data), per):
        chunk = data[i:i + per]
        lines.append(indent + ", ".join("0x%04X" % v for v in chunk) + ",")
    return "\n".join(lines)


def main():
    tiles = parse_blocks(os.path.join(ART, "tiles.txt"), 8, 8)
    font = parse_blocks(os.path.join(ART, "font.txt"), 7, 5)
    hero = parse_blocks(os.path.join(ART, "hero.txt"), 16, 16)
    maps = parse_blocks(os.path.join(ART, "maps.txt"), 32, 32)

    tile_names = [n for n, _ in tiles]
    tile_index = {n: i for i, n in enumerate(tile_names)}
    for n in tile_names:
        if n not in tile_index:
            sys.exit("gfx: unknown tile name %r" % n)

    # palette in index order: 0..15 from the legend chars
    legend_order = ['.', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                    'A', 'W', 'R', 'C', 'Y', 'E']
    bg_pal = [BG_PAL[c] for c in legend_order]
    obj_pal = [OBJ_PAL[c] for c in '.KSRBHWD']
    bg_idx = {c: i for i, c in enumerate(legend_order)}
    obj_idx = {c: i for i, c in enumerate('.KSRBHWD')}

    # tile data (u16 words: 16 per 8x8 tile)
    bg_tiles = []
    for n, g in tiles:
        raw = encode_tile_4bpp(g, bg_idx, 0, 0, 8, 8)
        bg_tiles.append(struct_unpack_u16(raw))

    # font data: pad 5x7 glyph to 8x8, centered horizontally
    font_tiles = []
    glyph_index = {}
    for i, (n, g) in enumerate(font):
        glyph_index[n] = i
        grid = [['.'] * 8 for _ in range(8)]
        ox = (8 - 5) // 2
        for y in range(7):
            for x in range(5):
                grid[y][x + ox] = 'W' if g[y][x] == '#' else '.'
        raw = encode_tile_4bpp(grid, bg_idx, 0, 0, 8, 8)
        font_tiles.append(struct_unpack_u16(raw))

    # char map: ascii -> glyph index (0 = blank for unknown/space)
    char_map = [0] * 128
    special = {' ': 'space', '.': '.', '!': '!', '?': '?', ',': ',',
               ':': ':', '-': '-', "'": "'", '(': '(', ')': ')', '/': '/'}
    for c, name in special.items():
        if name in glyph_index:
            char_map[ord(c)] = glyph_index[name]
    for i in range(26):
        name = chr(ord('A') + i)
        if name in glyph_index:
            char_map[ord('A') + i] = glyph_index[name]
    for i in range(10):
        name = chr(ord('0') + i)
        if name in glyph_index:
            char_map[ord('0') + i] = glyph_index[name]

    # hero frames: 16x16 -> 4 tiles each (TL, TR, BL, BR)
    hero_tiles = []
    for n, g in hero:
        for y0, x0 in ((0, 0), (0, 8), (8, 0), (8, 8)):
            raw = encode_tile_4bpp(g, obj_idx, x0, y0, 8, 8)
            hero_tiles.append(struct_unpack_u16(raw))

    # maps: 32x32 cells -> 64x64 tiles
    map_tilesets = []
    berry_total = 0
    for n, g in maps:
        rows = []
        for cy in range(32):
            row = []
            for cx in range(32):
                cell = g[cy][cx]
                if cell not in CELLS:
                    sys.exit("gfx: map [%s]: unknown cell %r at (%d,%d)"
                             % (n, cell, cy, cx))
                if cell == BERRY_CELL:
                    berry_total += 1
                names = list(CELLS[cell])
                if cell == '.':
                    # seeded per-position grass variety
                    seed = cy * 131 + cx * 7 + 3
                    names = [GRASS[(seed + k * 5) % 3] for k in range(4)]
                quad = [tile_index[t] for t in names]
                row.append(quad)
            rows.append(row)
        tileset = [0] * (64 * 64)
        for cy in range(32):
            for cx in range(32):
                q = rows[cy][cx]
                tileset[(cy * 2) * 64 + (cx * 2)] = q[0]
                tileset[(cy * 2) * 64 + (cx * 2) + 1] = q[1]
                tileset[(cy * 2 + 1) * 64 + (cx * 2)] = q[2]
                tileset[(cy * 2 + 1) * 64 + (cx * 2) + 1] = q[3]
        map_tilesets.append(tileset)

    # palette in index order: 0..15 from the legend chars
    legend_order = ['.', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                    'A', 'W', 'R', 'C', 'Y', 'E']
    bg_pal = [BG_PAL[c] for c in legend_order]
    obj_pal = [OBJ_PAL[c] for c in '.KSRBHWD']

    font_base = len(bg_tiles)  # world tiles first, then font

    # ---------------------------------------------------------- headers
    with open(os.path.join(SRC, "gfx_data.h"), "w") as f:
        f.write("/* Generated by tools/gfx.py - do not edit. */\n")
        f.write("#ifndef GFX_DATA_H\n#define GFX_DATA_H\n\n")
        f.write("#include \"gba.h\"\n\n")
        for i, n in enumerate(tile_names):
            f.write("#define TILE_%s %d\n" % (n.upper(), i))
        f.write("\n#define TILE_COUNT %d\n" % len(tile_names))
        f.write("#define TILE_FONT_BASE %d\n" % font_base)
        f.write("#define FONT_GLYPHS %d\n" % len(font_tiles))
        f.write("#define HERO_FRAMES %d\n" % (len(hero_tiles) // 4))
        f.write("\nextern const u16 gfx_bg_pal[16];\n")
        f.write("extern const u16 gfx_obj_pal[16];\n")
        f.write("extern const u16 gfx_bg_tiles[];\n")
        f.write("extern const u16 gfx_font_tiles[];\n")
        f.write("extern const u16 gfx_hero[];\n")
        f.write("extern const u8  gfx_char_map[128];\n")
        f.write("\n#endif\n")

    with open(os.path.join(SRC, "map_data.h"), "w") as f:
        f.write("/* Generated by tools/gfx.py - do not edit. */\n")
        f.write("#ifndef MAP_DATA_H\n#define MAP_DATA_H\n\n")
        f.write("#include \"gba.h\"\n\n")
        for i, (n, g) in enumerate(maps):
            f.write("#define MAP_%s %d\n" % (n.upper(), i))
        f.write("\n#define MAP_COUNT %d\n" % len(maps))
        f.write("#define BERRY_TOTAL %d\n" % berry_total)
        f.write("\nextern const u8 gfx_maps[MAP_COUNT][4096];\n\n")
        f.write("#endif\n")

    with open(os.path.join(SRC, "gfx_data.c"), "w") as f:
        f.write("/* Generated by tools/gfx.py - do not edit. */\n")
        f.write('#include "gfx_data.h"\n')
        f.write('#include "map_data.h"\n\n')
        f.write("const u16 gfx_bg_pal[16] = {\n%s\n};\n\n" % c_hex(bg_pal, 8))
        f.write("const u16 gfx_obj_pal[16] = {\n%s\n};\n\n" % c_hex(obj_pal, 8))
        f.write("const u16 gfx_bg_tiles[] = {\n%s\n};\n\n"
                % c_hex([v for t in bg_tiles for v in t]))
        f.write("const u16 gfx_font_tiles[] = {\n%s\n};\n\n"
                % c_hex([v for t in font_tiles for v in t]))
        f.write("const u16 gfx_hero[] = {\n%s\n};\n\n"
                % c_hex([v for t in hero_tiles for v in t]))
        f.write("const u8 gfx_char_map[128] = {\n%s\n};\n\n"
                % c_hex(char_map, 16))
        f.write("const u8 gfx_maps[MAP_COUNT][4096] = {\n")
        for m in map_tilesets:
            f.write("    {\n%s\n    },\n" % c_hex(m, 16, "        "))
        f.write("};\n")

    print("gfx_data.h/c + map_data.h written: %d tiles, %d font glyphs, "
          "%d hero tiles, %d maps, %d berries"
          % (len(bg_tiles), len(font_tiles), len(hero_tiles),
             len(map_tilesets), berry_total))


def struct_unpack_u16(data):
    import struct
    return list(struct.unpack("<%dH" % (len(data) // 2), data))


if __name__ == "__main__":
    main()
