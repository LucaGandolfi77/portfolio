# Builders for the two new settings: Colline del Vino (vigneto) and Base
# Lunare (luna). Loaded by build_kit.py after props_themes.py, so bumpy(),
# figure() and car() are available. The procedural backups of the same props
# live in src/world/props-new.js and share their frame and radius.
import math
from mathutils import Vector

TAU = math.pi * 2
GRAPE = 0x5a2a5e
GRAPE_LIGHT = 0x7a3f7e


# ======================================================== COLLINE DEL VINO

@kit
def cipresso():
    p = Prop('cipresso', ao=0.3)
    p.add(tube([(0, 0, 0), (0.0, 0.55, 0)], lambda t: 0.13 - 0.03 * t, 8), 'chocolate')
    prof = [(0.12, 0.35), (0.38, 0.7), (0.45, 1.3), (0.42, 2.0), (0.32, 2.7), (0.16, 3.25), (0.0, 3.5)]
    flame = lathe(prof, 14)
    for v in flame.verts:  # a slightly twisted, tufted flame of foliage
        a = math.atan2(v.co.z, v.co.x)
        v.co.x += 0.04 * math.sin(v.co.y * 5 + a * 3)
        v.co.z += 0.04 * math.cos(v.co.y * 4 + a * 2)
    p.add(flame, lambda c: 'palmDark' if int((c.y + 5) / 0.35) % 2 else 0x355228)
    return p


@kit
def filare():
    p = Prop('filare', ao=0.3)
    for x in (-1.2, 0.0, 1.2):
        p.add(box(0.08, 1.35, 0.08), 'wood', bevel=0.015, x=x, y=0.67, rz=0.03 * x)
    for y in (0.6, 1.0, 1.3):
        p.add(cyl(0.008, 0.008, 2.5, 3), 'stoneDark', y=y, rz=math.pi / 2)
    for k in range(5):
        x = -1.0 + k * 0.5
        p.add(tube([(x, 0, 0), (x + 0.05, 0.4, 0.02), (x - 0.03, 0.6, 0)], lambda t: 0.045 - 0.015 * t, 5), 'chocolate')
    for k in range(9):
        x = -1.15 + k * 0.29
        p.add(bumpy(ico(0.24 + 0.04 * (k % 2), 1), 0.04, k), 'palm' if k % 2 else 'leaf', x=x, y=0.98 + 0.06 * (k % 3), z=0.02 * (k % 2), sz=0.75)
    for k, x in enumerate((-0.85, -0.3, 0.25, 0.8)):
        for s in (-1, 1):
            for i in range(6):
                row = i // 3 if i < 3 else (1 if i < 5 else 2)
                gx = x + (i % 3 - 1) * 0.06 * (1 - row * 0.35)
                p.add(sphere(0.05, 6, 4), GRAPE if (i + k) % 3 else GRAPE_LIGHT, x=gx, y=0.82 - row * 0.08, z=0.17 * s)
    return p


@kit
def botte():
    p = Prop('botte', ao=0.15)
    prof = [(0.0, -0.45), (0.33, -0.45)] + [(0.33 + 0.07 * math.sin(math.pi * k / 8), -0.45 + 0.9 * k / 8) for k in range(1, 8)] + [(0.33, 0.45), (0.0, 0.45)]
    staves = lambda c: 'terraDark' if int((math.atan2(c.z, c.x) % TAU) / (TAU / 18)) % 2 else 0x8a3f28
    p.add(lathe(prof, 18), staves, y=0.5, rz=math.pi / 2)
    for x in (-0.36, -0.15, 0.15, 0.36):
        p.add(torus(0.36 + 0.06 * math.cos(x * 3.5), 0.022, 20, 4), 'stoneDark', x=x, y=0.5, rz=math.pi / 2)
    p.add(cyl(0.29, 0.29, 0.02, 16), 0xb08050, x=0.45, y=0.5, rz=math.pi / 2)
    p.add(cyl(0.03, 0.03, 0.06, 6), 'chocolate', x=0.47, y=0.32, rz=math.pi / 2)
    for x in (-0.3, 0.3):
        p.add(prism([(-0.35, 0), (0.35, 0), (0.25, 0.18), (-0.25, 0.18)], 0.08), 'wood', bevel=0.01, x=x, ry=math.pi / 2)
    return p


def tiled_gable(p, w, h, d, y, x=0.0, z=0.0, ry=0.0, eave=0.22):
    """A gable roof of coppi: alternating rows catch the light."""
    p.add(gable(w + eave * 2, h, d + eave * 2), lambda c: 'terra' if int((c.x + 10) / 0.22) % 2 else 'terraDark', x=x, y=y, z=z, ry=ry)
    p.add(box(w + eave * 2 + 0.04, 0.1, 0.16), 'terraDark', x=x, y=y + h, z=z, ry=ry)


@kit
def casale():
    p = Prop('casale', ao=1.0)
    stone = lambda c: 'stone' if (int((c.y + 5) / 0.3) + int((c.x + c.z + 10) / 0.5)) % 3 else 0xcbb894
    p.add(box(4.0, 2.6, 3.0), stone, bevel=0.04, y=1.3)
    tiled_gable(p, 4.0, 1.0, 3.0, 2.6)
    # the dovecote tower
    p.add(box(1.4, 1.5, 1.4), stone, bevel=0.03, x=1.2, y=3.35, z=0.0)
    p.add(cone(1.12, 0.6, 4), 'terra', x=1.2, y=4.42, ry=math.pi / 4)
    for k in range(3):
        p.add(box(0.14, 0.14, 0.05), 'ink', x=1.0 + k * 0.2, y=3.6, z=0.72)
    # door, windows with green shutters, loggia arch
    p.add(box(0.85, 1.4, 0.06), 'chocolate', y=0.7, z=1.52)
    p.add(prism([(-0.55, 0), (0.55, 0), (0.55, 0.15), (0.0, 0.35), (-0.55, 0.15)], 0.08), 'stoneDark', y=1.42, z=1.53)
    for x in (-1.3, 1.2):
        for y in (0.9, 2.0):
            window(p, x, y, 1.51, '+z', w=0.42, h=0.55)
    for z in (-0.7, 0.7):
        window(p, 2.01, 1.9, z, '+x', w=0.4, h=0.5)
    # pergola with vines over a stone bench
    for x in (-1.9, -0.6):
        p.add(box(0.1, 2.0, 0.1), 'wood', x=x, y=1.0, z=2.5)
    p.add(box(1.6, 0.06, 1.1), 'wood', x=-1.25, y=2.0, z=2.0)
    for k in range(4):
        p.add(bumpy(ico(0.3, 1), 0.05, k), 'leaf', x=-1.85 + k * 0.4, y=2.1, z=2.1 + 0.2 * (k % 2), sy=0.5)
    p.add(box(1.2, 0.4, 0.4), 'stone', bevel=0.03, x=-1.25, y=0.2, z=2.2)
    for k in range(3):
        p.add(lathe([(0.0, 0), (0.12, 0), (0.16, 0.3), (0.13, 0.36), (0.0, 0.34)], 10), 'terra', x=1.5 + k * 0.4, z=1.8)
        p.add(bumpy(ico(0.15, 1), 0.03, k), 'leaf', x=1.5 + k * 0.4, y=0.45, z=1.8)
    return p


@kit
def torre():
    p = Prop('torre', ao=1.0)
    stone = lambda c: 'stone' if (int((c.y + 10) / 0.35) + int((c.x + c.z + 10) / 0.6)) % 3 else 0xc7b48e
    p.add(box(2.6, 0.6, 2.6), 'stoneDark', bevel=0.05, y=0.3)
    p.add(box(2.4, 6.0, 2.4), stone, bevel=0.04, y=3.5)
    p.add(box(2.7, 0.2, 2.7), 'stoneDark', bevel=0.03, y=6.5)
    for k in range(4):
        for s in (-1, 1):
            p.add(box(0.42, 0.55, 0.42), stone, bevel=0.02, x=-0.95 + k * 0.63, y=6.87, z=1.12 * s)
            p.add(box(0.42, 0.55, 0.42), stone, bevel=0.02, x=1.12 * s, y=6.87, z=-0.95 + k * 0.63)
    for y in (2.2, 3.9):
        p.add(box(0.32, 0.6, 0.05), 'ink', y=y, z=1.22)
        p.add(cyl(0.16, 0.16, 0.05, 10), 'ink', y=y + 0.3, z=1.22, rx=math.pi / 2)
    p.add(box(0.5, 0.9, 0.05), 'ink', y=5.4, z=1.22)
    p.add(cyl(0.25, 0.25, 0.05, 10), 'ink', y=5.85, z=1.22, rx=math.pi / 2)
    p.add(sphere(0.18, 10, 6), 'goldDark', y=5.45, z=1.0)
    p.add(box(0.9, 1.4, 0.06), 'chocolate', y=1.3, z=1.22)
    p.add(cyl(0.45, 0.45, 0.06, 12), 'chocolate', y=2.0, z=1.22, rx=math.pi / 2)
    p.add(cyl(0.42, 0.42, 0.05, 16), 'white', y=4.75, z=1.23, rx=math.pi / 2)
    p.add(box(0.03, 0.3, 0.02), 'ink', y=4.85, z=1.27)
    p.add(box(0.2, 0.03, 0.02), 'ink', x=0.08, y=4.75, z=1.27)
    return p


@kit
def trattore():
    p = Prop('trattore', ao=0.4)
    for z in (-0.58, 0.58):
        p.add(torus(0.42, 0.18, 18, 8), 'ink', x=-0.5, y=0.6, z=z, rx=math.pi / 2, sy=1.0)
        p.add(cyl(0.3, 0.3, 0.3, 14), 'lemon', x=-0.5, y=0.6, z=z, rx=math.pi / 2)
        p.add(torus(0.24, 0.1, 14, 6), 'ink', x=0.85, y=0.35, z=z * 0.8, rx=math.pi / 2)
        p.add(cyl(0.16, 0.16, 0.2, 12), 'lemon', x=0.85, y=0.35, z=z * 0.8, rx=math.pi / 2)
    p.add(box(1.5, 0.55, 0.62), 'coral', bevel=0.1, seg=2, x=0.4, y=0.82)
    for k in range(5):
        p.add(box(0.03, 0.3, 0.64), 'ink', x=0.85 + k * 0.05, y=0.82)
    p.add(cyl(0.05, 0.05, 0.6, 8), 'stoneDark', x=0.75, y=1.35)
    p.add(box(0.9, 0.35, 1.0), 'coral', bevel=0.06, x=-0.45, y=1.0)
    for x in (-0.85, -0.05):
        for z in (-0.45, 0.45):
            p.add(box(0.05, 0.9, 0.05), 'ink', x=x, y=1.6, z=z)
    p.add(box(1.0, 0.07, 1.05), 'coral', bevel=0.03, x=-0.45, y=2.07)
    p.add(box(0.3, 0.12, 0.3), 'ink', bevel=0.03, x=-0.55, y=1.25)
    p.add(tube([(-0.2, 1.25, 0.0), (0.0, 1.5, 0.0)], 0.02, 5), 'ink')
    p.add(torus(0.14, 0.02, 12, 4), 'ink', x=0.02, y=1.52, rz=0.6)
    return p


@kit
def balla():
    p = Prop('balla', ao=0.25)
    hay = lambda c: 'sandDark' if int((math.atan2(c.y, c.x) % TAU) / 0.25 + c.z * 4) % 2 else 'sand'
    prof = [(0.0, -0.45), (0.6, -0.45), (0.65, -0.4), (0.66, 0.4), (0.6, 0.45), (0.0, 0.45)]
    roll = lathe(prof, 22)
    p.add(bumpy(roll, 0.012), hay, y=0.66, rx=math.pi / 2)
    for k in range(4):
        r = 0.15 + k * 0.13
        p.add(torus(r, 0.012, 18, 3), 'wetSand', y=0.66, z=0.452, rx=math.pi / 2)
        p.add(torus(r, 0.012, 18, 3), 'wetSand', y=0.66, z=-0.452, rx=math.pi / 2)
    return p


@kit
def pecora():
    p = Prop('pecora', ao=0.15)
    wool = sphere(1.0, 14, 9)
    p.add(bumpy(wool, 0.08, 3), 'white', y=0.58, sx=0.42, sy=0.3, sz=0.3)
    for x, z in ((0.22, 0.12), (0.22, -0.12), (-0.2, 0.12), (-0.2, -0.12)):
        p.add(tube([(x, 0.4, z), (x, 0.02, z)], 0.04, 5), 'ink')
    p.add(sphere(1.0, 10, 7), 'ink', x=0.48, y=0.68, sx=0.16, sy=0.12, sz=0.11)
    p.add(bumpy(sphere(0.11, 8, 5), 0.02), 'white', x=0.42, y=0.79)
    for s in (-1, 1):
        p.add(sphere(1.0, 6, 4), 'ink', x=0.42, y=0.73, z=0.12 * s, sx=0.07, sy=0.03, sz=0.05)
        p.add(sphere(0.02, 5, 3), 'white', x=0.58, y=0.72, z=0.06 * s)
    p.add(sphere(0.07, 6, 4), 'white', x=-0.42, y=0.65)
    return p


@kit
def ulivo():
    p = Prop('ulivo', ao=0.4)
    bark = 0x8a8070
    trunk = [(0, 0, 0), (0.1, 0.4, 0.05), (-0.05, 0.8, 0.0), (0.1, 1.15, -0.05)]
    p.add(tube(trunk, lambda t: 0.26 - 0.12 * t, 9), bark)
    p.add(tube([(0.0, 0.0, 0.0), (-0.12, 0.45, 0.1), (-0.35, 0.95, 0.15)], lambda t: 0.12 - 0.05 * t, 7), bark)
    p.add(tube([(0.05, 0.9, 0.0), (0.45, 1.25, 0.1)], 0.06, 5), bark)
    leaf = (0x8a9a6a, 0x9aab7a, 0x7a8c5c)
    for k, (x, y, z, r) in enumerate(((0.1, 1.55, 0.0, 0.6), (0.6, 1.4, 0.15, 0.42), (-0.45, 1.35, 0.15, 0.45),
                                       (0.0, 1.35, -0.45, 0.4), (-0.1, 1.85, 0.2, 0.38), (0.35, 1.7, -0.3, 0.35))):
        p.add(bumpy(ico(r, 2), 0.07, k), leaf[k % 3], x=x, y=y, z=z, sy=0.62)
    for k in range(5):
        a = TAU * k / 5
        p.add(sphere(0.03, 5, 3), 0x2e3a1e, x=0.6 * math.cos(a), y=1.2, z=0.6 * math.sin(a))
    return p


@kit
def carretto():
    p = Prop('carretto', ao=0.35)
    for z in (-0.55, 0.55):
        p.add(torus(0.4, 0.04, 20, 5), 'chocolate', y=0.42, z=z, rx=math.pi / 2)
        for k in range(5):
            p.add(box(0.78, 0.03, 0.03), 'chocolate', y=0.42, z=z, rz=k * math.pi / 5)
    p.add(box(1.4, 0.08, 1.0), 'wood', bevel=0.02, y=0.62)
    for s in (-1, 1):
        p.add(box(1.4, 0.3, 0.05), 'terra', bevel=0.015, y=0.8, z=0.5 * s)
        p.add(box(0.05, 0.3, 1.0), 'terra', bevel=0.015, x=0.7 * s, y=0.8)
    p.add(bumpy(sphere(0.6, 12, 6), 0.05), GRAPE, y=0.85, sx=1.0, sy=0.45, sz=0.7)
    for k in range(10):
        a = TAU * k / 10
        p.add(sphere(0.06, 6, 4), GRAPE_LIGHT, x=0.5 * math.cos(a), y=1.05 + 0.04 * (k % 3), z=0.32 * math.sin(a))
    for k in range(4):
        p.add(bumpy(ico(0.12, 1), 0.02, k), 'leaf', x=-0.4 + k * 0.27, y=1.12, z=0.1 * (k % 2), sy=0.4)
    for s in (-1, 1):
        p.add(tube([(0.7, 0.62, 0.3 * s), (1.6, 0.5, 0.3 * s)], 0.035, 5), 'chocolate')
    return p


@kit
def girasole():
    p = Prop('girasole', ao=0.08)
    p.add(tube([(0, 0, 0), (0.02, 0.7, 0), (0.0, 1.3, 0.05)], 0.03, 6), 'palm')
    for y, s in ((0.5, 1), (0.85, -1)):
        p.add(slab([(0, y, 0), (0.15 * s, y + 0.05, 0.05), (0.3 * s, y - 0.02, 0.08)], lambda t: 0.16 * math.sin(math.pi * min(1, t + 0.1)), 0.015), 'leaf')
    p.add(cyl(0.12, 0.13, 0.06, 14), 'chocolate', y=1.37, z=0.07, rx=1.2)
    for k in range(14):
        a = TAU * k / 14
        p.add(slab([(0.1 * math.cos(a), 0.1 * math.sin(a), 0), (0.27 * math.cos(a), 0.27 * math.sin(a), -0.02)],
                   lambda t: 0.09 * math.sin(math.pi * min(1, t * 0.9 + 0.1)), 0.012, up=(0, 0, 1)),
              'lemon', y=1.37, z=0.07, rx=1.2 - math.pi / 2)
    return p


@kit
def oro_grappolo():
    p = Prop('oro-grappolo', ao=0.4)
    p.add(lathe([(0.0, 0), (0.6, 0), (0.6, 0.2), (0.45, 0.32), (0.0, 0.32)], 12), 'stone', bevel=0.02)
    p.add(cyl(0.05, 0.06, 1.0, 6), 'stoneDark', y=0.8)
    rows = [(5, 2.3), (4, 2.0), (4, 1.7), (3, 1.42), (2, 1.17), (1, 0.97)]
    for row, (n, y) in enumerate(rows):
        for i in range(n):
            a = TAU * i / n + row * 0.5
            rr = 0.1 * n
            p.add(sphere(0.22, 10, 7), 'gold' if (i + row) % 3 else 'goldDark', x=rr * math.cos(a), y=y, z=rr * math.sin(a) * 0.8)
    p.add(tube([(0, 2.4, 0), (0.05, 2.75, 0.02), (0.2, 2.95, 0)], 0.05, 6), 'chocolate')
    p.add(slab([(0.1, 2.75, 0), (0.45, 2.85, 0.1), (0.75, 2.7, 0.05)], lambda t: 0.45 * math.sin(math.pi * min(1, t + 0.1)), 0.03), 'leaf')
    p.add(tube([(-0.05, 2.7, 0), (-0.3, 2.9, 0.1), (-0.4, 2.7, 0.2), (-0.3, 2.6, 0.15)], 0.015, 4), 'palm')
    return p


@kit
def oro_damigiana():
    p = Prop('oro-damigiana', ao=0.4)
    weave = lambda c: 'goldDark' if (int((math.atan2(c.z, c.x) % TAU) / 0.3) + int((c.y + 5) / 0.15)) % 2 else 'gold'
    body = [(0.0, 0.0), (0.6, 0.02), (0.92, 0.35), (0.98, 0.8), (0.85, 1.3), (0.45, 1.65), (0.22, 1.8)]
    p.add(lathe(body, 20), weave)
    p.add(lathe([(0.2, 1.75), (0.18, 2.15), (0.22, 2.2), (0.0, 2.22)], 12), 'gold')
    p.add(cyl(0.14, 0.12, 0.18, 10), 'chocolate', y=2.28)
    for s in (-1, 1):
        p.add(tube([(0.55 * s, 1.5, 0), (0.75 * s, 1.85, 0), (0.45 * s, 1.95, 0)], 0.05, 6), 'goldDark')
    return p


# ============================================================== BASE LUNARE

def panel_lines(c, step=0.4):
    return 'white' if (int((c.x + 10) / step) + int((c.y + 10) / step) + int((c.z + 10) / step)) % 4 else 'mint'


@kit
def cupola():
    p = Prop('cupola', ao=1.0)
    p.add(lathe([(0.0, 0), (2.45, 0), (2.4, 0.5), (0, 0.5)], 24), 'stoneDark', bevel=0.04)
    dome = [(2.2 * math.cos(math.pi / 2 * k / 8), 0.5 + 2.0 * math.sin(math.pi / 2 * k / 8)) for k in range(9)]
    geo = lambda c: 'glass' if (int((math.atan2(c.z, c.x) % TAU) / (TAU / 12)) + int((c.y + 5) / 0.45)) % 3 == 0 else 'white'
    p.add(lathe(dome, 24), geo)
    for k in range(12):
        a = TAU * k / 12
        arc = [(2.21 * math.cos(math.pi / 2 * t / 6) * math.cos(a), 0.5 + 2.01 * math.sin(math.pi / 2 * t / 6), 2.21 * math.cos(math.pi / 2 * t / 6) * math.sin(a)) for t in range(7)]
        p.add(tube(arc, 0.035, 4), 'stone')
    # airlock tunnel to +z
    p.add(cyl(0.6, 0.6, 1.4, 14), panel_lines, y=0.75, z=2.4, rx=math.pi / 2)
    p.add(cyl(0.68, 0.68, 0.12, 14), 'coral', y=0.75, z=3.1, rx=math.pi / 2)
    p.add(box(0.6, 0.85, 0.05), 'ink', bevel=0.02, y=0.7, z=3.17)
    p.add(sphere(0.06, 6, 4), 'neonBlue', x=0.4, y=1.2, z=3.17)
    p.add(cyl(0.05, 0.05, 0.9, 6), 'stone', x=-0.8, y=2.8)
    p.add(sphere(0.08, 6, 4), 0xff4d6a, x=-0.8, y=3.28)
    return p


@kit
def modulo():
    p = Prop('modulo', ao=0.7)
    p.add(cyl(0.9, 0.9, 3.4, 18), panel_lines, y=1.15, rz=math.pi / 2)
    for x in (-1.75, 1.75):
        p.add(lathe([(0.0, 0), (0.95, 0), (0.95, 0.12), (0.6, 0.35), (0.0, 0.4)], 18), 'coral', x=x, y=1.15, rz=-math.pi / 2 * (1 if x > 0 else -1))
    for x in (-1.2, -0.4, 0.4, 1.2):
        p.add(torus(0.905, 0.03, 20, 4), 'stoneDark', x=x, y=1.15, rz=math.pi / 2)
    for x in (-1.1, 1.1):
        p.add(box(0.2, 0.3, 1.4), 'stoneDark', bevel=0.03, x=x, y=0.15)
    p.add(box(1.8, 0.32, 0.05), 'neonBlue', y=1.35, z=0.9)
    for z in (-0.6, 0.6):
        p.add(box(1.6, 0.04, 0.9), 'navy', x=0.0, y=2.25, z=z * 1.2, rx=0.3 * (1 if z > 0 else -1))
    p.add(cyl(0.04, 0.04, 0.5, 5), 'stone', y=2.05)
    return p


@kit
def razzo():
    p = Prop('razzo', ao=1.0)
    p.add(lathe([(0.0, 0), (2.0, 0), (2.0, 0.25), (0.0, 0.25)], 8), 'stoneDark', bevel=0.04)
    hull_col = lambda c: 'coral' if (abs(c.y - 1.4) < 0.25 or abs(c.y + 1.6) < 0.2) else 'white'
    body = [(0.55, 0.0), (0.75, 0.35), (0.8, 1.0), (0.8, 4.5), (0.72, 5.2), (0.5, 6.0), (0.22, 6.6), (0.0, 6.85)]
    p.add(lathe(body, 20), hull_col, y=0.9)
    for k in range(4):
        a = TAU * k / 4 + math.pi / 4
        p.add(prism([(0.0, 0.0), (0.9, -0.2), (0.9, 0.6), (0.0, 2.0)], 0.1), 'coral', bevel=0.02,
              x=0.65 * math.cos(a), y=0.9, z=0.65 * math.sin(a), ry=-a)
        p.add(tube([(0.7 * math.cos(a), 0.9, 0.7 * math.sin(a)), (1.5 * math.cos(a), 0.25, 1.5 * math.sin(a))], 0.06, 5), 'stone')
    p.add(lathe([(0.3, 0.9), (0.55, 0.55), (0.6, 0.45), (0.0, 0.5)], 14), 'stoneDark')
    for y in (3.0, 3.8, 4.6):
        p.add(cyl(0.18, 0.18, 0.05, 12), 'neonBlue', y=y, z=0.79, rx=math.pi / 2)
    # gantry tower
    for x, z in ((1.6, -0.3), (1.6, 0.3), (2.2, -0.3), (2.2, 0.3)):
        p.add(box(0.08, 6.0, 0.08), 'lemon', x=x, y=3.25, z=z)
    for k in range(10):
        p.add(box(0.7, 0.05, 0.05), 'lemon', x=1.9, y=0.6 + k * 0.6, z=0.3)
        p.add(tube([(1.6, 0.6 + k * 0.6, 0.3), (2.2, 1.2 + k * 0.6, 0.3)], 0.02, 3), 'lemon')
    p.add(box(0.8, 0.08, 0.3), 'lemon', x=1.2, y=5.0)
    return p


@kit
def rover():
    p = Prop('rover', ao=0.35)
    for x in (-0.6, 0.0, 0.6):
        for z in (-0.62, 0.62):
            p.add(torus(0.2, 0.08, 14, 6), 'stoneDark', x=x, y=0.27, z=z, rx=math.pi / 2)
            p.add(cyl(0.14, 0.14, 0.16, 10), 'gold', x=x, y=0.27, z=z, rx=math.pi / 2)
            p.add(tube([(x, 0.27, z * 0.8), (x * 0.9, 0.5, z * 0.65)], 0.03, 4), 'stone')
    p.add(box(1.7, 0.36, 1.0), 'white', bevel=0.08, seg=2, y=0.66)
    p.add(box(0.75, 0.45, 0.82), 'white', bevel=0.12, seg=2, x=0.38, y=1.05)
    pane(p, 0.02, 0.24, 0.6, x=0.76, y=1.08, col='glassDark')
    for z in (-0.42, 0.42):
        pane(p, 0.4, 0.2, x=0.38, y=1.1, z=z, col='glassDark')
    p.add(box(0.9, 0.04, 0.9), 'navy', x=-0.45, y=0.9)
    p.add(cyl(0.02, 0.02, 0.7, 4), 'stone', x=-0.6, y=1.2, z=0.3)
    p.add(lathe([(0.0, 0.0), (0.22, 0.06), (0.24, 0.1), (0.0, 0.08)], 12), 'white', x=-0.6, y=1.55, z=0.3, rx=0.5)
    p.add(box(0.12, 0.08, 0.5), 'neonYellow', x=0.86, y=0.72)
    return p


@kit
def astronauta():
    p = Prop('astronauta', ao=0.12)
    for s in (-1, 1):
        p.add(tube([(0.1 * s, 0.08, 0), (0.1 * s, 0.3, 0), (0.1 * s, 0.5, 0)], lambda t: 0.08 + 0.01 * t, 8), 'white')
        p.add(box(0.15, 0.1, 0.22), 'stone', bevel=0.03, x=0.1 * s, y=0.05, z=0.02)
    p.add(lathe([(0.0, 0.45), (0.2, 0.46), (0.23, 0.75), (0.24, 0.95), (0.14, 1.02), (0.0, 1.03)], 12), 'white')
    p.add(torus(0.22, 0.03, 14, 4), 'coral', y=0.62)
    for s in (-1, 1):
        p.add(tube([(0.24 * s, 0.92, 0), (0.3 * s, 0.72, 0.04), (0.3 * s, 0.55, 0.1)], 0.065, 8), 'white')
        p.add(sphere(0.06, 6, 4), 'stone', x=0.3 * s, y=0.52, z=0.11)
    p.add(box(0.34, 0.45, 0.2), 'stone', bevel=0.04, y=0.78, z=-0.23)
    p.add(box(0.14, 0.1, 0.03), 'neonBlue', y=0.85, z=0.24)
    p.add(sphere(0.2, 14, 10), 'white', y=1.18)
    face = sphere(0.165, 12, 8)
    for v in face.verts:
        if v.co.z < 0.02:
            v.co.z = 0.02
    p.add(face, 'goldDark', y=1.18, z=0.05)
    p.add(cyl(0.012, 0.012, 0.3, 4), 'stone', x=-0.08, y=1.4, z=-0.15)
    return p


@kit
def antenna():
    p = Prop('antenna', ao=0.4)
    p.add(lathe([(0.0, 0), (0.4, 0), (0.4, 0.2), (0.25, 0.35), (0.0, 0.35)], 10), 'stoneDark')
    p.add(cyl(0.07, 0.08, 1.3, 8), 'stone', y=1.0)
    p.add(box(0.3, 0.3, 0.3), 'stone', bevel=0.04, y=1.7)
    dish = [(0.0, 0.0), (0.4, 0.04), (0.75, 0.18), (0.95, 0.38), (0.9, 0.4), (0.7, 0.22), (0.38, 0.09), (0.0, 0.06)]
    p.add(lathe(dish, 20), 'white', y=1.85, rx=-0.6, z=0.1)
    for k in range(3):
        a = TAU * k / 3
        p.add(tube([(0.85 * math.cos(a), 2.25 + 0.3 * math.sin(a), 0.4 + 0.3 * math.sin(a)), (0.0, 2.6, 0.62)], 0.012, 3), 'stone')
    p.add(sphere(0.06, 6, 4), 0xff4d6a, y=2.62, z=0.64)
    return p


@kit
def pannello():
    p = Prop('pannello', ao=0.25)
    p.add(lathe([(0.0, 0), (0.25, 0), (0.2, 0.1), (0.0, 0.1)], 8), 'stoneDark')
    p.add(cyl(0.05, 0.05, 0.85, 6), 'stone', y=0.5)
    cells = lambda c: 'navy' if (int((c.x + 5) / 0.24) + int((c.z + 5) / 0.24)) % 2 else 0x203a5e
    p.add(box(2.0, 0.04, 1.1), cells, y=0.95, rx=-0.4)
    p.add(box(2.06, 0.06, 0.04), 'stone', y=0.95 + 0.55 * math.sin(0.4), z=0.55 * math.cos(0.4) * 0.98, rx=-0.4)
    p.add(box(2.06, 0.06, 0.04), 'stone', y=0.95 - 0.55 * math.sin(0.4), z=-0.55 * math.cos(0.4) * 0.98, rx=-0.4)
    p.add(box(0.04, 0.06, 1.12), 'stone', x=1.02, y=0.95, rx=-0.4)
    p.add(box(0.04, 0.06, 1.12), 'stone', x=-1.02, y=0.95, rx=-0.4)
    return p


@kit
def roccia_lunare():
    p = Prop('roccia-lunare', ao=0.3)
    p.add(bumpy(ico(0.6, 2), 0.1, 4), 'stone', y=0.3, sy=0.6)
    p.add(bumpy(ico(0.3, 1), 0.05, 9), 'stoneDark', x=0.45, y=0.15, z=0.2)
    p.add(bumpy(ico(0.18, 1), 0.03, 2), 'stone', x=-0.42, y=0.08, z=-0.3)
    p.add(cyl(0.12, 0.12, 0.02, 10), 'stoneDark', y=0.62, x=0.1, rz=0.1)
    return p


@kit
def serbatoio():
    p = Prop('serbatoio', ao=0.3)
    p.add(box(1.7, 0.14, 0.9), 'stoneDark', bevel=0.03, y=0.07)
    for x, col in ((-0.4, 'white'), (0.4, 'coral')):
        p.add(lathe([(0.0, 0.14), (0.34, 0.16), (0.36, 0.3), (0.36, 1.2), (0.3, 1.38), (0.12, 1.45), (0.0, 1.46)], 14), col, x=x)
        p.add(torus(0.365, 0.02, 14, 4), 'stoneDark', x=x, y=0.7)
    p.add(tube([(-0.4, 1.4, 0), (0.0, 1.6, 0), (0.4, 1.4, 0)], 0.04, 6), 'stone')
    p.add(cyl(0.06, 0.06, 0.08, 8), 'lemon', y=1.62)
    p.add(box(0.2, 0.2, 0.03), 'lemon', x=-0.4, y=0.9, z=0.36)
    return p


@kit
def lander():
    p = Prop('lander', ao=0.5)
    for k in range(4):
        a = TAU * k / 4 + math.pi / 4
        c, s = math.cos(a), math.sin(a)
        p.add(tube([(0.55 * c, 1.0, 0.55 * s), (1.1 * c, 0.12, 1.1 * s)], 0.045, 6), 'stone')
        p.add(tube([(0.55 * c, 0.6, 0.55 * s), (1.0 * c, 0.3, 1.0 * s)], 0.025, 4), 'stone')
        p.add(lathe([(0.0, 0.0), (0.2, 0.0), (0.18, 0.06), (0.0, 0.08)], 10), 'stone', x=1.1 * c, z=1.1 * s)
    foil = lambda cc: 'gold' if (int((cc.x + 5) / 0.3) + int((cc.y + 5) / 0.25) + int((cc.z + 5) / 0.3)) % 3 else 'goldDark'
    p.add(box(1.4, 0.75, 1.4), foil, bevel=0.03, y=1.25, ry=math.pi / 4)
    cabin = [(0.0, 1.6), (0.7, 1.62), (0.75, 1.9), (0.6, 2.4), (0.3, 2.6), (0.0, 2.62)]
    p.add(lathe(cabin, 8, th0=math.pi / 8), 'stone')
    for k in range(2):
        a = k * math.pi
        p.add(box(0.28, 0.24, 0.04), 'glassDark', x=0.0, y=2.15, z=0.7 if k == 0 else -0.7, ry=a)
    p.add(cyl(0.02, 0.02, 0.7, 4), 'stone', x=0.3, y=2.9)
    p.add(lathe([(0.3, 0.85), (0.45, 0.7), (0.0, 0.75)], 10), 'stoneDark')
    return p


@kit
def bandiera():
    p = Prop('bandiera', ao=0.1)
    p.add(lathe([(0.0, 0), (0.12, 0), (0.08, 0.08), (0.03, 0.1), (0.025, 2.0), (0.0, 2.02)], 8), 'stone')
    p.add(cyl(0.015, 0.015, 0.85, 4), 'stone', x=0.42, y=1.97, rz=math.pi / 2)
    flag = [(0.03 + 0.8 * t, 1.7 + 0.02 * math.sin(t * 7), 0.04 * math.sin(t * 5)) for t in [i / 8 for i in range(9)]]
    # the colony's own emblem: a white ring on coral (not any real flag)
    p.add(slab(flag, 0.5, 0.02, up=(0, 0, 1)), lambda c: 'white' if abs(math.hypot(c.x - 0.43, c.y - 1.7) - 0.14) < 0.05 else 'coral')
    p.add(bumpy(lathe([(0.4, 0), (0.25, 0.05), (0, 0.06)], 10), 0.015), 'sandDark')
    return p


@kit
def cristallo_lunare():
    p = Prop('cristallo-lunare', ao=0.1)
    for (x, z, h, r, rz, rx, col) in ((0, 0, 0.85, 0.15, 0, 0, 0x8fd8ff), (0.18, 0.08, 0.55, 0.1, -0.45, 0.1, 0xc8a8ff),
                                       (-0.15, 0.05, 0.5, 0.09, 0.4, 0.2, 0x8fd8ff), (0.02, -0.17, 0.4, 0.08, 0.1, -0.5, 0xc8a8ff)):
        p.add(lathe([(r, 0), (r * 1.05, h * 0.72), (0.0, h)], 6, th0=x * 4), col, x=x, z=z, rz=rz, rx=rx)
    p.add(bumpy(ico(0.22, 1), 0.03), 'stoneDark', y=0.0, sy=0.4)
    return p


@kit
def sonda():
    p = Prop('sonda', ao=0.08)
    for s in (-1, 1):
        for t in (-1, 1):
            p.add(tube([(0.1 * s, 0.15, 0.1 * t), (0.18 * s, 0.0, 0.18 * t)], 0.012, 4), 'stone')
    foil = lambda c: 'gold' if (int((c.x + 5) / 0.1) + int((c.y + 5) / 0.1)) % 2 else 'goldDark'
    p.add(box(0.28, 0.22, 0.28), foil, bevel=0.02, y=0.26)
    cells = lambda c: 'navy' if int((c.x + 5) / 0.1) % 2 else 0x203a5e
    p.add(box(0.36, 0.02, 0.22), cells, x=0.34, y=0.3)
    p.add(box(0.36, 0.02, 0.22), cells, x=-0.34, y=0.3)
    p.add(cyl(0.008, 0.008, 0.3, 3), 'stone', y=0.5)
    p.add(sphere(0.025, 5, 3), 0xff4d6a, y=0.66)
    return p


@kit
def oro_capsula():
    p = Prop('oro-capsula', ao=0.5)
    shell = [(0.0, 0.25), (1.0, 0.3), (1.05, 0.45), (0.9, 1.0), (0.55, 1.7), (0.4, 1.95), (0.0, 2.0)]
    foil = lambda c: 'gold' if int((math.atan2(c.z, c.x) % TAU) / (TAU / 16)) % 2 else 'goldDark'
    p.add(lathe(shell, 16), foil)
    p.add(lathe([(0.0, 0.0), (1.05, 0.05), (1.05, 0.3), (0.0, 0.32)], 16), 'stoneDark')
    p.add(box(0.36, 0.36, 0.06), 'glassDark', y=1.05, z=0.8, rx=-0.45)
    p.add(cyl(0.18, 0.12, 0.25, 10), 'stoneDark', y=2.1)
    for k in range(3):
        a = TAU * k / 3
        p.add(bumpy(ico(0.2, 1), 0.03, k), 'stone', x=1.4 * math.cos(a), y=0.08, z=1.4 * math.sin(a), sy=0.5)
    return p
