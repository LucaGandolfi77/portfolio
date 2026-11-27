# Builders for Polvere Rossa, Nevegal, Giardino delle Nuvole and Notte Neon.
# Loaded by build_kit.py into its own namespace (primitives, Prop, P, kit, ...).
# Every model keeps the frame of its procedural twin in src/world/props-extra.js:
# origin on the ground (or at the `lift` height for floating props), same
# radius r, vehicles facing +x.
import math
from mathutils import Vector

TAU = math.pi * 2


def bumpy(bm, amount, seed=1):
    """Pushes every vertex in or out a little: rocks, snow, foliage."""
    for v in bm.verts:
        p = v.co
        n = math.sin(p.x * 7.1 + seed) * math.cos(p.y * 6.3 + seed * 2) * math.sin(p.z * 5.7 + seed * 3)
        v.co = p + p.normalized() * amount * n if p.length > 1e-6 else p
    return bm


# ============================================================ POLVERE ROSSA

def saguaro_arm(p, x0, y0, side, out, up, r, col):
    path = [(x0, y0, 0), (x0 + side * out * 0.6, y0 + 0.02, 0), (x0 + side * out, y0 + 0.18, 0),
            (x0 + side * out, y0 + up * 0.6, 0), (x0 + side * out, y0 + up, 0)]
    p.add(tube(path, lambda t: r * (1 - 0.15 * t), 10), col)
    p.add(sphere(r * 0.85, 10, 6), col, x=x0 + side * out, y=y0 + up)


def ribbed(c):
    return 'palmDark' if int((math.atan2(c.z, c.x) % TAU) / (TAU / 20) + 0.5) % 2 else 'palm'


@kit
def cactus():
    p = Prop('cactus', ao=0.25)
    p.add(lathe([(0.24, 0), (0.25, 0.4), (0.23, 1.5), (0.18, 1.68), (0.0, 1.75)], 20), ribbed)
    saguaro_arm(p, 0.18, 0.85, 1, 0.42, 0.55, 0.14, 'palmDark')
    saguaro_arm(p, -0.18, 1.05, -1, 0.36, 0.45, 0.12, 'palmDark')
    p.add(sphere(0.07, 8, 5), 'pink', y=1.75)
    p.add(sphere(0.05, 6, 4), 'lemon', x=0.6, y=1.45)
    p.add(lathe([(0.45, 0), (0.3, 0.06), (0, 0.08)], 12), 'sandDark')
    return p


@kit
def cactus_grande():
    p = Prop('cactus-grande', ao=0.5)
    p.add(lathe([(0.38, 0), (0.4, 0.5), (0.36, 2.6), (0.28, 2.85), (0.0, 2.95)], 22), ribbed)
    saguaro_arm(p, 0.3, 1.3, 1, 0.68, 1.1, 0.2, 'palm')
    saguaro_arm(p, -0.3, 2.0, -1, 0.55, 0.95, 0.17, 'palm')
    saguaro_arm(p, 0.0, 1.0, 1, 0.0, 0.0, 0.01, 'palm')
    p.add(sphere(0.12, 8, 5), 'lemon', x=0.98, y=2.45)
    p.add(sphere(0.1, 8, 5), 'pink', y=2.98)
    return p


@kit
def barile():
    p = Prop('barile', ao=0.2)
    prof = [(0.0, 0.0), (0.3, 0.0)] + [(0.3 + 0.05 * math.sin(math.pi * k / 8), 0.86 * k / 8) for k in range(1, 8)] + [(0.3, 0.86), (0.0, 0.86)]
    p.add(lathe(prof, 16), lambda c: 'terraDark' if int((math.atan2(c.z, c.x) % TAU) / (TAU / 16)) % 3 == 0 else 'terra')
    for y in (0.18, 0.68):
        p.add(torus(0.352, 0.025, 18, 4), 'stoneDark', y=y)
    p.add(cyl(0.27, 0.27, 0.02, 14), 'chocolate', y=0.86)
    return p


@kit
def roccia():
    p = Prop('roccia', ao=0.35)
    p.add(bumpy(ico(0.8, 2), 0.12, 2), 'stone', y=0.42, sy=0.72)
    p.add(bumpy(ico(0.45, 1), 0.07, 5), 'stoneDark', x=0.55, y=0.26, z=0.22, sy=0.8)
    p.add(bumpy(ico(0.3, 1), 0.05, 7), 'stone', x=-0.48, y=0.2, z=-0.25)
    return p


@kit
def mesa():
    p = Prop('mesa', ao=1.0)
    strata = [(2.15, 0.0, 0xa85436), (1.95, 0.6, 0xc2703f), (1.8, 1.15, 0xa85436), (1.72, 1.7, 0xd07a48),
              (1.6, 2.05, 0xb45f38), (1.45, 2.35, 0xd07a48)]
    for (r0, y0, col), (r1, y1, _) in zip(strata, strata[1:]):
        bm = lathe([(0, y0), (r0, y0), (r1 * 1.02, y1), (0, y1)], 9)
        p.add(bumpy(bm, 0.08, int(y0 * 10)), col)
    p.add(bumpy(lathe([(0, 2.35), (1.45, 2.35), (1.2, 2.5), (0, 2.52)], 9), 0.05, 3), 0xc98a54)
    p.add(bumpy(ico(0.7, 1), 0.1, 4), 0xb45f38, x=1.6, y=0.4, z=0.8, sy=0.7)
    p.add(bumpy(ico(0.4, 1), 0.06, 8), 0xa85436, x=-1.8, y=0.25, z=-0.6)
    return p


@kit
def tumbleweed():
    p = Prop('tumbleweed', ao=0.1)
    for k in range(14):
        a = TAU * k / 14
        b = math.pi * (k % 5) / 5
        pts = [(0.45 * math.cos(a + t * 2.2) * math.sin(b + t), 0.45 + 0.4 * math.cos(b + t * 1.7),
                0.45 * math.sin(a + t * 2.2) * math.sin(b + t)) for t in [i / 6 for i in range(7)]]
        p.add(tube(pts, 0.02, 4), 'olive' if k % 3 else 'sandDark')
    return p


@kit
def cowboy_hat():
    p = Prop('cowboy-hat', ao=0.08)
    brim = [(0.0, 0.0)] + [(0.36 * k / 8, 0.02 + 0.07 * (k / 8) ** 3) for k in range(1, 9)]
    bm = lathe(brim + [(0.35, 0.05)] + [(0.36 * k / 8 - 0.01, 0.04 + 0.07 * (k / 8) ** 3) for k in range(8, 0, -1)] + [(0, 0.04)], 20)
    for v in bm.verts:  # rolled sides: the brim curls up along z
        v.co.y += 0.12 * (v.co.z / 0.36) ** 2 * (abs(v.co.z) > 0.15)
    p.add(bm, 'chocolate')
    crown = [(0.22, 0.04), (0.2, 0.22), (0.16, 0.3), (0.05, 0.27), (0.0, 0.26)]
    p.add(lathe(crown, 16), 'chocolate', sz=0.8)
    p.add(cyl(0.215, 0.205, 0.05, 16), 0x2a1a10, y=0.08, sz=0.8)
    return p


def figure(p, shirt, pants, hat, skin='skin'):
    """A small standing person, about 1.35 m, facing +z."""
    for s in (-1, 1):
        p.add(tube([(0.09 * s, 0.05, 0), (0.09 * s, 0.32, 0), (0.09 * s, 0.56, 0)], lambda t: 0.06 + 0.015 * t, 6), pants)
        p.add(box(0.12, 0.08, 0.22), 'chocolate', bevel=0.025, x=0.09 * s, y=0.04, z=0.03)
    p.add(lathe([(0.0, 0.55), (0.19, 0.56), (0.2, 0.86), (0.24, 1.0), (0.12, 1.08), (0.0, 1.1)], 10), shirt)
    for s in (-1, 1):
        p.add(tube([(0.22 * s, 1.0, 0), (0.28 * s, 0.82, 0.02), (0.28 * s, 0.62, 0.06)], 0.045, 6), shirt)
        p.add(sphere(0.045, 6, 4), skin, x=0.28 * s, y=0.58, z=0.07)
    p.add(cyl(0.05, 0.05, 0.08, 6), skin, y=1.12)
    p.add(sphere(0.13, 12, 8), skin, y=1.25, sy=1.08)
    p.add(sphere(0.016, 5, 4), 'ink', x=0.05, y=1.27, z=0.12)
    p.add(sphere(0.016, 5, 4), 'ink', x=-0.05, y=1.27, z=0.12)
    if hat:
        hat(p)


@kit
def cowboy():
    p = Prop('cowboy', ao=0.12)

    def hat(q):
        q.add(lathe([(0.0, 1.33), (0.29, 1.34), (0.3, 1.38), (0.14, 1.37), (0.13, 1.5), (0.0, 1.49)], 16), 'chocolate')
        q.add(torus(0.135, 0.018, 14, 4), 0x2a1a10, y=1.39)
    figure(p, 0x3f5a7a, 0x2a3a4a, hat)
    p.add(torus(0.2, 0.025, 14, 4), 'chocolate', y=0.58)
    p.add(box(0.06, 0.04, 0.05), 'gold', y=0.58, z=0.2)
    p.add(slab([(-0.12, 1.06, 0.12), (0.0, 0.98, 0.17), (0.12, 1.06, 0.12)], 0.08, 0.02, up=(0, 0, 1)), 'coral')
    return p


@kit
def cavallo():
    p = Prop('cavallo', ao=0.35)
    coat = 0x6b4a2e
    body = [(-0.6, 1.05, 0), (-0.2, 1.08, 0), (0.25, 1.08, 0), (0.55, 1.12, 0)]
    p.add(tube(body, lambda t: 0.28 + 0.04 * math.sin(math.pi * t), 12), coat)
    p.add(tube([(0.5, 1.15, 0), (0.7, 1.45, 0), (0.82, 1.65, 0)], lambda t: 0.17 - 0.05 * t, 10), coat)
    p.add(tube([(0.78, 1.7, 0), (0.95, 1.6, 0), (1.08, 1.45, 0)], lambda t: 0.11 - 0.03 * t, 10), coat)
    p.add(sphere(0.07, 8, 5), 0x3a2515, x=1.1, y=1.42)
    for s in (-1, 1):
        p.add(cone(0.04, 0.12, 6), coat, x=0.8, y=1.82, z=0.05 * s)
        p.add(sphere(0.022, 6, 4), 'ink', x=0.93, y=1.66, z=0.07 * s)
    p.add(slab([(0.55, 1.75, 0), (0.62, 1.55, 0), (0.48, 1.3, 0)], 0.05, 0.12, up=(0, 0, 1)), 0x2a1a10)
    p.add(tube([(-0.85, 1.1, 0), (-1.0, 0.85, 0), (-1.02, 0.55, 0)], lambda t: 0.07 - 0.04 * t, 6), 0x2a1a10)
    for x, s in ((0.45, 1), (0.45, -1), (-0.45, 1), (-0.45, -1)):
        p.add(tube([(x, 0.95, 0.14 * s), (x + 0.02, 0.55, 0.15 * s), (x, 0.1, 0.15 * s)], lambda t: 0.085 - 0.03 * t, 6), coat)
        p.add(cyl(0.06, 0.065, 0.1, 8), 0x2a1a10, x=x, y=0.05, z=0.15 * s)
    p.add(sphere(1.0, 12, 6), 'terra', x=0.05, y=1.33, sx=0.28, sy=0.07, sz=0.32)
    p.add(box(0.5, 0.03, 0.62), 'coral', x=0.05, y=1.3)
    return p


@kit
def carrozza():
    p = Prop('carrozza', ao=0.4)
    for x in (-0.65, 0.65):
        for z in (-0.78, 0.78):
            p.add(torus(0.42, 0.04, 20, 5), 'chocolate', x=x, y=0.45, z=z, rx=math.pi / 2)
            for k in range(6):
                p.add(box(0.8, 0.025, 0.025), 'chocolate', x=x, y=0.45, z=z, rz=k * math.pi / 6)
            p.add(cyl(0.07, 0.07, 0.1, 8), 'stoneDark', x=x, y=0.45, z=z, rx=math.pi / 2)
    p.add(box(2.1, 0.12, 1.3), 'terraDark', bevel=0.03, y=0.72)
    p.add(box(2.0, 0.42, 1.2), 'terra', bevel=0.04, y=0.98)
    # the canvas cover over its hoops
    p.add(cyl(0.62, 0.62, 2.0, 18), 'cream', y=1.2, rz=math.pi / 2, sy=1.0, sz=1.0)
    for x in (-0.9, -0.3, 0.3, 0.9):
        p.add(torus(0.63, 0.025, 18, 4), 'chocolate', x=x, y=1.2, rz=math.pi / 2)
    p.add(box(2.1, 0.62, 1.32), 'terra', y=0.86)
    p.add(tube([(1.0, 0.75, -0.3), (1.9, 0.6, -0.3)], 0.03, 5), 'chocolate')
    p.add(tube([(1.0, 0.75, 0.3), (1.9, 0.6, 0.3)], 0.03, 5), 'chocolate')
    return p


@kit
def saloon():
    p = Prop('saloon', ao=1.0)
    plank = lambda c: 'terra' if int((c.y + 5) / 0.18) % 2 else 0xc06a45
    p.add(box(4.2, 2.6, 3.4), 'terra', bevel=0.03, y=1.3)
    for k in range(13):
        p.add(box(4.22, 0.02, 3.42), 'terraDark', y=0.1 + k * 0.2)
    # false front with a stepped top
    p.add(box(4.4, 1.3, 0.14), plank, bevel=0.02, y=3.15, z=1.72)
    p.add(box(2.4, 0.5, 0.14), plank, bevel=0.02, y=4.0, z=1.72)
    p.add(box(4.5, 0.12, 0.24), 'chocolate', y=3.82, z=1.74)
    p.add(box(2.5, 0.1, 0.24), 'chocolate', y=4.28, z=1.74)
    p.add(box(2.0, 0.45, 0.05), 'lemon', bevel=0.02, y=3.2, z=1.81)
    p.add(gable(4.2, 0.7, 3.4), 'terraDark', y=2.6, ry=math.pi / 2)
    # porch: deck, posts, roof
    p.add(box(4.6, 0.12, 1.4), 'chocolate', bevel=0.02, y=0.12, z=2.35)
    for x in (-2.1, -0.7, 0.7, 2.1):
        p.add(box(0.12, 2.2, 0.12), 'chocolate', bevel=0.02, x=x, y=1.25, z=2.95)
    p.add(box(4.7, 0.1, 1.6), 'terraDark', bevel=0.02, y=2.38, z=2.4, rx=0.08)
    p.add(box(4.4, 0.06, 0.06), 'chocolate', y=0.95, z=2.95)
    # swinging doors and windows
    p.add(box(1.0, 2.0, 0.06), 'ink', y=1.0, z=1.71)
    for s in (-1, 1):
        p.add(box(0.46, 0.7, 0.05), 'wood', bevel=0.01, x=0.25 * s, y=1.1, z=1.76)
        p.add(box(0.9, 0.9, 0.05), 'glassDark', x=1.4 * s, y=1.3, z=1.71)
        p.add(box(1.0, 0.08, 0.1), 'chocolate', x=1.4 * s, y=0.82, z=1.74)
    p.add(cyl(0.3, 0.3, 0.7, 10), 'terraDark', x=-1.9, y=0.55, z=2.5)
    return p


@kit
def tepee():
    p = Prop('tepee', ao=0.4)
    band = lambda c: 0xb45f38 if 0.2 < c.y < 0.42 else (0x4a6f8a if -0.2 < c.y < 0.0 else 0xdccbb0)
    cover = lathe([(1.25 - 1.0 * k / 10, 2.1 * k / 10 - 1.05) for k in range(11)] + [(0.0, 1.06)], 12)
    p.add(cover, band, y=1.05)
    for k in range(7):
        a = TAU * k / 7
        p.add(tube([(0.15 * math.cos(a), 2.1, 0.15 * math.sin(a)), (0.45 * math.cos(a), 2.85, 0.45 * math.sin(a))], 0.025, 4), 'chocolate')
    p.add(prism([(-0.3, 0), (0.3, 0), (0.0, 0.95)], 0.06), 'ink', z=1.0, rx=-0.45, y=0.0)
    return p


@kit
def pozzo():
    p = Prop('pozzo', ao=0.4)
    stones = lambda c: 'stone' if (int((c.y + 2) / 0.2) + int((math.atan2(c.z, c.x) % TAU) / 0.4)) % 2 else 'stoneDark'
    p.add(lathe([(0.0, 0.0), (0.78, 0.0), (0.72, 0.8), (0.76, 0.86), (0.58, 0.86), (0.58, 0.3), (0.0, 0.3)], 16), stones)
    p.add(cyl(0.57, 0.57, 0.02, 16), 'seaDeep', y=0.55)
    for s in (-1, 1):
        p.add(box(0.12, 1.55, 0.12), 'chocolate', bevel=0.02, x=0.62 * s, y=1.25)
    p.add(cyl(0.08, 0.08, 1.3, 8), 'wood', y=1.65, rz=math.pi / 2)
    p.add(tube([(0.65, 1.65, 0), (0.8, 1.65, 0), (0.8, 1.45, 0.15)], 0.02, 4), 'stoneDark')
    p.add(cyl(0.01, 0.01, 0.55, 4), 'stoneDark', y=1.36)
    p.add(lathe([(0.0, 0.95), (0.1, 0.95), (0.12, 1.1), (0.0, 1.1)], 8), 'wood')
    p.add(gable(1.7, 0.5, 1.2), 'terraDark', y=2.0)
    return p


@kit
def falo():
    p = Prop('falo', ao=0.12)
    for k in range(8):
        a = TAU * k / 8
        p.add(bumpy(ico(0.11, 1), 0.02, k), 'stoneDark', x=0.42 * math.cos(a), y=0.07, z=0.42 * math.sin(a))
    for a in (0.2, 1.3, 2.4, 3.5, 4.6):
        p.add(tube([(0.32 * math.cos(a), 0.05, 0.32 * math.sin(a)), (0.05 * math.cos(a), 0.55, 0.05 * math.sin(a))], 0.055, 6), 'chocolate')
    flame = lambda h, r: lathe([(0.0, 0.0), (r, h * 0.25), (r * 0.7, h * 0.6), (0.0, h)], 8)
    p.add(bumpy(flame(0.95, 0.3), 0.04), 'coral', y=0.2)
    p.add(bumpy(flame(0.7, 0.2), 0.03, 3), 'lemon', y=0.22)
    p.add(flame(0.35, 0.1), 'white', y=0.25)
    return p


@kit
def scheletro():
    p = Prop('scheletro', ao=0.08)
    p.add(sphere(0.2, 12, 8), 'bone', x=0.0, y=0.2, z=0.35, sy=0.85)
    p.add(cone(0.12, 0.22, 8), 'bone', y=0.14, z=0.55, rx=math.pi / 2)
    for s in (-1, 1):
        p.add(sphere(0.045, 6, 4), 'ink', x=0.08 * s, y=0.24, z=0.5)
        p.add(tube([(0.12 * s, 0.32, 0.38), (0.35 * s, 0.5, 0.3), (0.45 * s, 0.62, 0.42)], 0.025, 5), 'bone')
    p.add(tube([(0, 0.08, 0.2), (0, 0.09, -0.45)], 0.035, 6), 'bone')
    for k in range(5):
        z = 0.1 - k * 0.12
        p.add(torus(0.16 - 0.015 * k, 0.018, 12, 4), 'bone', y=0.1, z=z, rx=math.pi / 2, sy=0.6)
    return p


@kit
def torre_acqua():
    p = Prop('torre-acqua', ao=0.8)
    feet = [(0.85 * math.cos(a), 0.85 * math.sin(a)) for a in (0.3, 0.3 + TAU / 3, 0.3 + 2 * TAU / 3)]
    for x, z in feet:
        p.add(tube([(x, 0, z), (x * 0.75, 4.45, z * 0.75)], 0.09, 6), 'terraDark')
    for (x1, z1), (x2, z2) in zip(feet, feet[1:] + feet[:1]):
        for y1, y2 in ((0.5, 2.2), (2.2, 0.5), (2.3, 4.0), (4.0, 2.3)):
            k1, k2 = 1 - 0.25 * y1 / 4.45, 1 - 0.25 * y2 / 4.45
            p.add(tube([(x1 * k1, y1, z1 * k1), (x2 * k2, y2, z2 * k2)], 0.03, 4), 'chocolate')
    p.add(cyl(1.15, 1.15, 0.16, 16), 'chocolate', bevel=0.02, y=4.5)
    p.add(lathe([(1.0, 4.58), (1.02, 6.1), (0, 6.1)], 18), lambda c: 'wood' if int((math.atan2(c.z, c.x) % TAU) / 0.35) % 2 else 'terra')
    for y in (4.9, 5.5):
        p.add(torus(1.03, 0.03, 20, 4), 'stoneDark', y=y)
    p.add(cone(1.18, 0.75, 16), 'terraDark', y=6.45)
    p.add(tube([(0.0, 4.6, 0.0), (0.0, 3.6, 0.6), (0.2, 3.2, 1.0)], 0.06, 6), 'stoneDark')
    p.add(box(0.5, 0.3, 0.06), 'lemon', bevel=0.01, y=5.2, z=1.03)
    return p


# ================================================================== NEVEGAL

@kit
def pino_neve():
    p = Prop('pino-neve', ao=0.4)
    p.add(cyl(0.13, 0.17, 0.7, 8), 'chocolate', y=0.35)
    for i in range(4):
        y = 0.55 + i * 0.72
        r = 1.05 - i * 0.19
        tier = lathe([(r, 0), (r * 0.55, 0.45), (0.0, 1.1)], 12)
        for v in tier.verts:  # drooping, jagged branch tips
            a = math.atan2(v.co.z, v.co.x)
            if math.hypot(v.co.x, v.co.z) > r * 0.9:
                v.co.y -= 0.1 * (0.5 + 0.5 * math.cos(a * 6))
        p.add(tier, 0x2f5a46 if i % 2 else 0x3c6e54, y=y - 0.55)
        snow = lathe([(r * 0.8, 0.0), (r * 0.5, 0.35), (r * 0.25, 0.62), (0.0, 0.75)], 12)
        p.add(bumpy(snow, 0.03, i), 'snow', y=y - 0.42)
    return p


@kit
def albero_nudo():
    p = Prop('albero-nudo', ao=0.3)
    bark = 0x5a4636
    p.add(tube([(0, 0, 0), (0.05, 0.8, 0), (0.0, 1.55, 0.02)], lambda t: 0.19 - 0.09 * t, 8), bark)
    for k in range(5):
        a = TAU * k / 5 + 0.4
        base = Vector((0.0, 1.1 + 0.08 * k, 0.0))
        tip = base + Vector((math.cos(a) * 0.75, 0.6, math.sin(a) * 0.75))
        mid = base.lerp(tip, 0.5) + Vector((0, 0.1, 0))
        p.add(tube([tuple(base), tuple(mid), tuple(tip)], lambda t: 0.06 - 0.04 * t, 5), bark)
        twig = tip + Vector((math.cos(a + 0.8) * 0.3, 0.3, math.sin(a + 0.8) * 0.3))
        p.add(tube([tuple(mid), tuple(twig)], 0.018, 4), bark)
        p.add(sphere(0.07, 6, 4), 'snow', x=tip.x, y=tip.y + 0.02, z=tip.z, sy=0.5)
    p.add(bumpy(lathe([(0.5, 0), (0.3, 0.08), (0, 0.1)], 12), 0.02), 'snow')
    return p


def snow_roof(p, w, h, d, y, eave=0.25):
    """A pitched roof (ridge along x) with a thick layer of snow on top."""
    p.add(gable(w + eave * 2, h, d + eave * 2), 'chocolate', y=y)
    p.add(bumpy(gable(w + eave * 2 + 0.08, h + 0.12, d + eave * 2 + 0.1), 0.03), 'snow', y=y + 0.06)


@kit
def chalet():
    p = Prop('chalet', ao=1.0)
    p.add(box(3.7, 0.7, 3.1), 'stone', bevel=0.05, y=0.35)
    logs = lambda c: 'terra' if int((c.y + 5) / 0.16) % 2 else 'terraDark'
    p.add(box(3.6, 1.7, 3.0), logs, bevel=0.03, y=1.55)
    for k in range(10):
        y = 0.8 + k * 0.17
        for x in (-1.8, 1.8):
            for z in (-1.5, 1.5):
                p.add(cyl(0.08, 0.08, 0.3, 6), 'terraDark', x=x, y=y, z=z, rx=math.pi / 2 if k % 2 else 0, rz=0 if k % 2 else math.pi / 2)
    # the gable faces +z: ridge along z so the end wall is the front
    p.add(prism([(-1.8, 0), (1.8, 0), (0, 1.3)], 3.0), 'terra', y=2.4)
    p.add(prism([(-2.2, -0.05), (2.2, -0.05), (0, 1.55)], 3.6), 'chocolate', y=2.35)
    p.add(bumpy(prism([(-2.28, 0.05), (2.28, 0.05), (0, 1.72)], 3.7), 0.025), 'snow', y=2.35)
    for x in (-1.0, 0.0, 1.0):
        p.add(box(0.5, 0.6, 0.05), 'glassDark', x=x, y=1.7, z=1.53)
        for s in (-1, 1):
            p.add(box(0.24, 0.62, 0.04), 'coral', x=x + 0.38 * s, y=1.7, z=1.55)
        p.add(box(0.6, 0.15, 0.2), 'coral', x=x, y=1.32, z=1.6)
        for k in range(3):
            p.add(sphere(0.06, 6, 4), 'pink' if k % 2 else 'white', x=x - 0.15 + 0.15 * k, y=1.43, z=1.62)
    p.add(box(0.9, 1.2, 0.05), 'chocolate', y=1.3, z=-1.53)
    # balcony on the front
    p.add(box(3.4, 0.08, 0.6), 'wood', y=2.45, z=1.8)
    for k in range(18):
        p.add(box(0.1, 0.5, 0.03), 'wood', x=-1.62 + k * 0.19, y=2.75, z=2.08)
    p.add(box(3.4, 0.06, 0.06), 'chocolate', y=3.02, z=2.08)
    p.add(box(0.45, 1.2, 0.45), 'stoneDark', bevel=0.03, x=0.9, y=3.6, z=-0.5)
    p.add(box(0.55, 0.1, 0.55), 'snow', x=0.9, y=4.22, z=-0.5)
    return p


@kit
def cabana():
    p = Prop('cabana', ao=0.6)
    logs = lambda c: 'terraDark' if int((c.y + 5) / 0.15) % 2 else 0x8a4a30
    p.add(box(2.2, 1.5, 2.0), logs, bevel=0.03, y=0.75)
    p.add(prism([(-1.4, 0), (1.4, 0), (0, 1.0)], 2.4), 'chocolate', y=1.5, ry=math.pi / 2)
    p.add(bumpy(prism([(-1.46, 0.08), (1.46, 0.08), (0, 1.14)], 2.5), 0.025), 'snow', y=1.5, ry=math.pi / 2)
    p.add(box(0.55, 1.05, 0.05), 'chocolate', bevel=0.01, y=0.53, z=1.02)
    p.add(box(0.45, 0.4, 0.05), 'neonYellow', x=-0.6, y=1.0, z=1.02)
    p.add(box(0.5, 0.9, 0.5), 'stoneDark', bevel=0.03, x=0.7, y=2.2, z=-0.4)
    p.add(bumpy(lathe([(0.7, 0), (0.5, 0.2), (0, 0.25)], 12), 0.03), 'snow', x=-1.3, z=0.7)
    return p


@kit
def palla_neve():
    p = Prop('palla-neve', ao=0.12)
    p.add(bumpy(sphere(0.42, 14, 9), 0.015), 'snow', y=0.38)
    p.add(bumpy(sphere(0.27, 12, 8), 0.012, 3), 'snow', y=0.9)
    p.add(sphere(0.19, 12, 8), 'snow', y=1.25)
    for s in (-1, 1):
        p.add(sphere(0.03, 6, 4), 'ink', x=0.07 * s, y=1.3, z=0.16)
        p.add(tube([(0.25 * s, 0.95, 0), (0.45 * s, 1.15, 0.05), (0.55 * s, 1.3, 0.02)], 0.022, 4), 'chocolate')
    p.add(cone(0.04, 0.22, 8), 'coral', y=1.25, z=0.26, rx=math.pi / 2)
    for k in range(3):
        p.add(sphere(0.03, 6, 4), 'ink', y=0.75 + k * 0.14, z=0.26 - 0.02 * k)
    p.add(torus(0.17, 0.05, 14, 6), 'coral', y=1.08)
    p.add(slab([(0.12, 1.06, 0.12), (0.18, 0.85, 0.2)], 0.1, 0.03, up=(0, 0, 1)), 'coral')
    p.add(lathe([(0.0, 1.38), (0.15, 1.38), (0.12, 1.62), (0.0, 1.62)], 12), 'ink')
    p.add(cyl(0.2, 0.2, 0.02, 14), 'ink', y=1.39)
    return p


@kit
def slitta():
    p = Prop('slitta', ao=0.15)
    for x in (-0.3, 0.3):
        path = [(x, 0.06, -0.7), (x, 0.04, 0.4), (x, 0.08, 0.6), (x, 0.25, 0.72), (x, 0.4, 0.64)]
        p.add(tube(path, 0.03, 6), 'coral')
        for z in (-0.5, 0.0, 0.4):
            p.add(box(0.04, 0.22, 0.04), 'coral', x=x, y=0.17, z=z)
    for k in range(6):
        p.add(box(0.72, 0.04, 0.18), 'wood', bevel=0.01, y=0.3, z=-0.6 + k * 0.21)
    p.add(box(0.72, 0.3, 0.05), 'wood', bevel=0.01, y=0.45, z=-0.66)
    p.add(tube([(-0.3, 0.42, 0.62), (0.0, 0.45, 0.7), (0.3, 0.42, 0.62)], 0.015, 4), 'chocolate')
    return p


@kit
def sci():
    p = Prop('sci', ao=0.08)
    for x, col in ((-0.12, 'coral'), (0.12, 'lemon')):
        path = [(x, 0.06, -0.75), (x, 0.06, 0.5), (x, 0.1, 0.68), (x, 0.18, 0.76)]
        p.add(slab(path, 0.16, 0.035, up=(1, 0, 0)), col)
        p.add(box(0.14, 0.12, 0.26), 'ink', bevel=0.03, x=x, y=0.14)
    for s in (-1, 1):
        p.add(cyl(0.012, 0.012, 1.2, 5), 'chrome', x=0.38 * s, y=0.08, z=-0.1, rx=math.pi / 2)
        p.add(torus(0.05, 0.008, 8, 3), 'ink', x=0.38 * s, y=0.08, z=-0.6, rx=math.pi / 2)
    return p


@kit
def igloo():
    p = Prop('igloo', ao=0.6)
    dome = [(1.3 * math.cos(math.pi / 2 * k / 8), 1.0 * math.sin(math.pi / 2 * k / 8)) for k in range(9)]
    bm = lathe(dome, 20)
    p.add(bm, lambda c: 'snow' if (int((c.y + 5) / 0.2) + int((math.atan2(c.z, c.x) % TAU) / 0.32 + (int((c.y + 5) / 0.2) % 2) * 0.5)) % 2 else 'ice')
    for k in range(5):
        y = 0.1 + k * 0.2
        r = 1.3 * math.cos(math.asin(min(1, y / 1.0)))
        p.add(torus(r + 0.005, 0.012, 24, 3), 0xb9cde0, y=y)
    # entrance tunnel along +z
    p.add(cyl(0.48, 0.48, 0.9, 14), 'snow', y=0.0, z=1.25, rx=math.pi / 2)
    p.add(cyl(0.34, 0.34, 0.92, 14), 0x2a3a4a, y=0.0, z=1.27, rx=math.pi / 2)
    p.add(box(1.2, 0.6, 1.2), 'snow', y=-0.3, z=1.25)
    return p


@kit
def legnaio():
    p = Prop('legnaio', ao=0.2)
    for r0 in range(3):
        for c in range(4 - r0):
            x = (c - (3 - r0) / 2) * 0.3
            y = 0.16 + r0 * 0.26
            p.add(cyl(0.14, 0.14, 0.96, 10), 'chocolate', x=x, y=y, rx=math.pi / 2)
            for s in (-1, 1):
                p.add(cyl(0.12, 0.12, 0.02, 10), 0xd9b98a, x=x, y=y, z=0.48 * s, rx=math.pi / 2)
    p.add(bumpy(box(1.3, 0.12, 1.05), 0.02), 'snow', y=0.98)
    for s in (-1, 1):
        p.add(box(0.06, 1.0, 0.06), 'wood', x=0.65 * s, y=0.5, z=0.5)
    return p


@kit
def orso():
    p = Prop('orso', ao=0.4)
    fur = 0x6b5340
    p.add(sphere(1.0, 16, 10), fur, y=0.98, sx=0.72, sy=0.45, sz=0.48)
    p.add(sphere(0.42, 14, 9), fur, x=-0.25, y=1.12, sy=1.05)
    for x, s in ((0.42, 1), (0.42, -1), (-0.45, 1), (-0.45, -1)):
        p.add(tube([(x, 0.9, 0.22 * s), (x, 0.45, 0.24 * s), (x + 0.04, 0.08, 0.24 * s)], lambda t: 0.16 - 0.03 * t, 8), fur)
        p.add(sphere(0.12, 8, 5), 0x4a3828, x=x + 0.06, y=0.06, z=0.24 * s, sy=0.5)
    p.add(sphere(0.3, 12, 8), fur, x=0.85, y=1.2)
    p.add(sphere(0.15, 10, 6), 0xd8c9b2, x=1.1, y=1.12, sx=1.2)
    p.add(sphere(0.05, 6, 4), 'ink', x=1.25, y=1.16)
    for s in (-1, 1):
        p.add(sphere(0.1, 8, 5), fur, x=0.78, y=1.45, z=0.17 * s)
        p.add(sphere(0.03, 6, 4), 'ink', x=1.05, y=1.27, z=0.12 * s)
    p.add(sphere(0.09, 8, 5), fur, x=-0.75, y=1.05)
    return p


@kit
def sciovia():
    p = Prop('sciovia', ao=0.8)
    for x, z, h in ((0, 0, 5.5), (4.5, 2.2, 5.5)):
        p.add(lathe([(0.25, 0), (0.18, 0.4), (0.15, h)], 10), 'stoneDark', x=x, z=z)
        p.add(box(1.3, 0.16, 0.18), 'stoneDark', bevel=0.02, x=x, y=h + 0.05, z=z, ry=-math.atan2(2.2, 4.5))
        for s in (-1, 1):
            p.add(cyl(0.18, 0.18, 0.08, 12), 'chrome', x=x + 0.27 * s * 0.9, y=h + 0.18, z=z + 0.27 * s * -0.44,
                  rx=math.pi / 2, ry=-math.atan2(2.2, 4.5))
    for dz in (-0.25, 0.25):
        a = (0.0 + 0.11 * (1 if dz > 0 else -1), 5.65, dz * 2 - 0.0)
        b = (4.5 + 0.11 * (1 if dz > 0 else -1), 5.65, 2.2 + dz * 2)
        mid = ((a[0] + b[0]) / 2, 5.35, (a[2] + b[2]) / 2)
        p.add(tube([a, mid, b], 0.025, 4), 'ink')
    for t, col in ((0.3, 'coral'), (0.7, 'lemon')):
        x, z = 4.5 * t, 2.2 * t + 0.5
        p.add(cyl(0.012, 0.012, 0.7, 4), 'ink', x=x, y=5.1, z=z)
        p.add(box(0.7, 0.08, 0.32), col, bevel=0.02, x=x, y=4.7, z=z)
        p.add(box(0.7, 0.4, 0.06), col, bevel=0.02, x=x, y=4.9, z=z - 0.16)
    p.add(box(1.6, 1.4, 1.4), 'wood', bevel=0.04, x=-1.2, y=0.7, z=-0.6)
    p.add(gable(1.9, 0.6, 1.8), 'snow', x=-1.2, y=1.4, z=-0.6)
    return p


@kit
def ghiaccio():
    p = Prop('ghiaccio', ao=0.12)
    for (x, z, h, r, col) in ((0, 0, 1.1, 0.28, 'ice'), (0.3, 0.2, 0.7, 0.2, 0xe8f8ff), (-0.25, 0.15, 0.6, 0.17, 'ice'),
                              (0.05, -0.3, 0.8, 0.2, 0xe8f8ff), (-0.15, -0.15, 0.45, 0.15, 'white')):
        p.add(lathe([(r, 0), (r * 1.05, h * 0.7), (0.0, h)], 6, th0=x * 3), col, x=x, z=z, rz=x * 0.4, rx=z * 0.4)
    p.add(bumpy(lathe([(0.65, 0), (0.4, 0.1), (0, 0.12)], 12), 0.02), 'snow')
    return p


@kit
def pennone():
    p = Prop('pennone', ao=0.1)
    p.add(lathe([(0.12, 0), (0.1, 0.1), (0.05, 0.12), (0.04, 2.4), (0.0, 2.42)], 8), 'cream')
    p.add(sphere(0.07, 8, 5), 'lemon', y=2.47)
    flag = [(0.05 + 0.8 * t, 2.2 + 0.05 * math.sin(t * 5), 0.08 * math.sin(t * 6)) for t in [i / 8 for i in range(9)]]
    p.add(slab(flag, 0.5, 0.025, up=(0, 0, 1)), lambda c: 'coral' if c.x < 0.45 else 'white')
    p.add(bumpy(lathe([(0.35, 0), (0.2, 0.08), (0, 0.1)], 10), 0.02), 'snow')
    return p


# ===================================================== GIARDINO DELLE NUVOLE

@kit
def ciliegio():
    p = Prop('ciliegio', ao=0.4)
    p.add(tube([(0, 0, 0), (0.1, 0.8, 0.0), (0.0, 1.5, 0.05)], lambda t: 0.2 - 0.08 * t, 8), 'chocolate')
    for k in range(4):
        a = TAU * k / 4 + 0.3
        p.add(tube([(0.05, 1.2, 0.0), (0.5 * math.cos(a), 1.75, 0.5 * math.sin(a))], 0.06, 5), 'chocolate')
    for i in range(8):
        a = TAU * i / 8
        rr = 0.45 + 0.1 * (i % 3)
        p.add(bumpy(ico(0.42 + 0.06 * (i % 2), 2), 0.05, i), 0xf7b8cf if i % 2 else 0xffd6e4,
              x=math.cos(a) * rr, z=math.sin(a) * rr, y=1.85 + (i % 3) * 0.2)
    p.add(bumpy(ico(0.55, 2), 0.05, 9), 0xffd6e4, y=2.35)
    for k in range(6):
        a = TAU * k / 6 + 0.5
        p.add(sphere(0.05, 5, 3), 0xffd6e4, x=0.9 * math.cos(a), y=0.02, z=0.9 * math.sin(a), sy=0.3)
    return p


@kit
def torii():
    p = Prop('torii', ao=0.6)
    for s in (-1, 1):
        p.add(lathe([(0.2, 0), (0.16, 0.25), (0.15, 3.0)], 12), 'terra', x=1.0 * s)
        p.add(cyl(0.24, 0.24, 0.3, 12), 'ink', x=1.0 * s, y=0.15)
    p.add(box(2.6, 0.18, 0.24), 'terra', bevel=0.02, y=2.55)
    p.add(box(0.2, 0.42, 0.22), 'terra', y=2.85)
    beam = [(-1.75, 3.25, 0), (-0.9, 3.12, 0), (0.0, 3.1, 0), (0.9, 3.12, 0), (1.75, 3.25, 0)]
    p.add(slab(beam, 0.4, 0.2, up=(0, 0, 1)), 'terraDark', y=0.0)
    beam2 = [(x, y + 0.2, 0) for x, y, _ in beam]
    beam2 = [(x * 1.06, y, z) for x, y, z in beam2]
    p.add(slab(beam2, 0.52, 0.12, up=(0, 0, 1)), 'ink')
    p.add(box(0.5, 0.5, 0.06), 'lemon', bevel=0.02, y=2.85, z=0.12)
    return p


@kit
def lanterna():
    # origin is `lift` (0.9 m) above the ground: the pole goes down to it
    p = Prop('lanterna', ground=False, ao=0.12)
    p.add(cyl(0.05, 0.06, 1.6, 8), 'chocolate', y=-0.8)
    p.add(tube([(0, 0.0, 0), (0, 0.15, 0), (0.0, 0.2, 0)], 0.02, 4), 'chocolate')
    paper = lambda c: 'terraDark' if int((c.y + 5) / 0.09) % 4 == 0 else 'lemon'
    p.add(lathe([(0.12, 0.08), (0.27, 0.2), (0.3, 0.36), (0.27, 0.52), (0.12, 0.62)], 14), paper)
    p.add(cyl(0.13, 0.13, 0.06, 12), 'terraDark', y=0.06)
    p.add(cyl(0.13, 0.13, 0.06, 12), 'terraDark', y=0.64)
    p.add(cyl(0.015, 0.015, 0.18, 4), 'coral', y=-0.04)
    return p


@kit
def mongolfiera():
    # origin is `lift` (3.4 m) above the ground
    p = Prop('mongolfiera', ground=False, ao=0.6)
    env = [(0.35, -2.0), (0.7, -1.5), (1.3, -0.8), (1.55, 0.0), (1.45, 0.7), (1.0, 1.25), (0.0, 1.45)]
    p.add(lathe(env, 18), stripes(9, 'coral', 'lemon'), y=-0.2)
    p.add(torus(1.55, 0.04, 30, 4), 'mint', y=-0.2)
    p.add(torus(0.36, 0.04, 14, 4), 'terraDark', y=-2.2)
    for k in range(4):
        a = TAU * k / 4 + math.pi / 4
        p.add(tube([(0.33 * math.cos(a), -2.2, 0.33 * math.sin(a)), (0.32 * math.cos(a), -2.75, 0.32 * math.sin(a))], 0.012, 4), 'chocolate')
    basket = lambda c: 'wood' if int((c.y + 5) / 0.08) % 2 else 'terra'
    p.add(box(0.62, 0.5, 0.62), basket, bevel=0.04, y=-3.0)
    p.add(torus(0.42, 0.04, 4, 4), 'chocolate', y=-2.75, ry=math.pi / 4)
    p.add(lathe([(0.12, -2.4), (0.18, -2.3), (0.0, -2.2)], 8), 'coral')
    return p


@kit
def mulino():
    p = Prop('mulino', ao=0.8)
    p.add(lathe([(1.1, 0), (1.08, 0.2), (0.82, 3.2), (0, 3.2)], 16), 'cream', bevel=0.02)
    p.add(torus(1.0, 0.04, 20, 4), 'stoneDark', y=1.1)
    p.add(lathe([(0.95, 3.15), (1.0, 3.25), (0.6, 3.95), (0.0, 4.25)], 16), 'terra')
    p.add(sphere(0.1, 8, 5), 'gold', y=4.3)
    p.add(cyl(0.09, 0.09, 0.6, 8), 'terraDark', z=0.85, y=3.5, rx=math.pi / 2)
    p.add(sphere(0.14, 8, 6), 'terraDark', z=1.15, y=3.5)
    for i in range(4):
        a = TAU * i / 4 + 0.3
        c, s = math.cos(a), math.sin(a)
        p.add(box(0.06, 1.7, 0.06), 'chocolate', x=c * 0.9, y=3.5 + s * 0.9, z=1.12, rz=a - math.pi / 2)
        lattice = lambda cc: 'cream' if (int((cc.y + 5) / 0.16) + int((cc.x + 5) / 0.12)) % 2 else 'white'
        p.add(box(0.38, 1.45, 0.025), lattice, x=c * 1.0 + s * 0.2, y=3.5 + s * 1.0 - c * 0.2, z=1.1, rz=a - math.pi / 2)
    p.add(box(0.5, 0.95, 0.06), 'chocolate', bevel=0.02, y=0.48, z=1.07)
    p.add(box(0.4, 0.45, 0.05), 'glassDark', y=2.0, z=0.93, rx=-0.08)
    for s in (-1, 1):
        p.add(box(0.2, 0.45, 0.04), 'shutter', x=0.3 * s, y=2.0, z=0.95, rx=-0.08)
    return p


@kit
def serra():
    p = Prop('serra', ao=0.7)
    p.add(box(3.5, 0.2, 2.6), 'cream', bevel=0.03, y=0.1)
    p.add(box(3.4, 1.5, 2.5), 0xbfe8d8, y=0.95)
    arch = [(1.25 * math.cos(math.pi * k / 10), 1.7 + 0.75 * math.sin(math.pi * k / 10)) for k in range(11)]
    for i in range(-2, 3):
        x = i * 0.85
        p.add(box(0.07, 1.5, 0.07), 'white', x=x, y=0.95, z=1.25)
        p.add(box(0.07, 1.5, 0.07), 'white', x=x, y=0.95, z=-1.25)
        p.add(tube([(x, y, z) for z, y in arch], 0.035, 4), 'white')
    p.add(cyl(1.25, 1.25, 3.4, 20), 0xbfe8d8, y=1.7, rz=math.pi / 2, sy=0.6)
    p.add(box(3.46, 0.08, 2.56), 'white', y=1.7)
    for k in range(5):
        x = -1.3 + k * 0.65
        p.add(box(0.5, 0.35, 0.5), 'terra', bevel=0.03, x=x, y=0.38, z=0.6)
        p.add(bumpy(ico(0.3, 1), 0.05, k), 'leaf' if k % 2 else 'olive', x=x, y=0.7, z=0.6)
        p.add(sphere(0.08, 6, 4), 'coral' if k % 2 else 'pink', x=x + 0.1, y=0.95, z=0.65)
    p.add(box(0.7, 1.3, 0.05), 'white', x=1.73, y=0.85, rx=0.0, ry=math.pi / 2)
    return p


@kit
def santuario():
    p = Prop('santuario', ao=1.0)
    p.add(box(3.6, 0.3, 2.8), 'stone', bevel=0.04, y=0.15)
    p.add(box(3.3, 0.2, 2.5), 'stoneDark', bevel=0.03, y=0.4)
    for k in range(3):
        p.add(box(1.0, 0.1, 0.3), 'stone', y=0.05 + k * 0.12, z=1.55 - k * 0.2)
    p.add(box(2.8, 2.1, 2.2), 'cream', bevel=0.03, y=1.55)
    for x in (-1.35, -0.45, 0.45, 1.35):
        for z in (-1.05, 1.05):
            p.add(cyl(0.09, 0.09, 2.1, 8), 'terra', x=x, y=1.55, z=z)
    p.add(box(3.1, 0.18, 2.5), 'terra', bevel=0.02, y=2.68)
    roof = prism_x([(-1.75, 0.0), (1.75, 0.0), (0.6, 0.75), (0.0, 0.85), (-0.6, 0.75)], 3.8)
    for v in roof.verts:  # turned-up eaves at the corners
        v.co.y += 0.2 * (abs(v.co.x) / 1.9) ** 4 * (abs(v.co.z) > 1.0)
    p.add(roof, 'terraDark', y=2.75)
    p.add(box(4.0, 0.12, 0.2), 'terraDark', y=3.62)
    p.add(box(0.9, 1.4, 0.05), 'terraDark', y=1.2, z=1.12)
    for s in (-1, 1):
        p.add(box(0.6, 0.6, 0.05), 'lemon', x=0.95 * s, y=1.7, z=1.12)
        p.add(box(0.03, 0.6, 0.06), 'terraDark', x=0.95 * s, y=1.7, z=1.13)
        p.add(box(0.6, 0.03, 0.06), 'terraDark', x=0.95 * s, y=1.7, z=1.13)
    p.add(lathe([(0.0, 0.0), (0.1, 0.0), (0.08, 1.4), (0.0, 1.5)], 8), 'chocolate', x=1.3, y=2.8)
    return p


@kit
def fungo():
    p = Prop('fungo', ao=0.08)
    p.add(lathe([(0.0, 0.0), (0.13, 0.0), (0.1, 0.2), (0.08, 0.45), (0.0, 0.46)], 10), 'cream')
    p.add(torus(0.09, 0.025, 10, 4), 'white', y=0.36)
    cap = [(0.0, 0.42), (0.3, 0.42), (0.36, 0.48), (0.32, 0.6), (0.18, 0.72), (0.0, 0.75)]
    p.add(lathe(cap, 16), 'coral')
    for k, (x, z) in enumerate(((0.12, 0.05), (-0.13, 0.08), (0.0, -0.16), (0.2, -0.12), (-0.18, -0.08), (0.02, 0.2))):
        p.add(sphere(0.045, 6, 4), 'white', x=x, y=0.72 - 0.25 * (x * x + z * z), z=z, sy=0.5)
    p.add(lathe([(0.0, 0.0), (0.07, 0.0), (0.05, 0.18), (0.0, 0.19)], 8), 'cream', x=0.25, z=0.15)
    p.add(lathe([(0.0, 0.16), (0.12, 0.16), (0.1, 0.24), (0.0, 0.27)], 10), 'coral', x=0.25, z=0.15)
    return p


@kit
def scala():
    p = Prop('scala', ao=0.3)
    for i in range(5):
        p.add(box(1.4, 0.16, 0.44), 'cream', bevel=0.03, y=0.2 + i * 0.42, z=0.9 - i * 0.36)
        p.add(box(1.2, 0.04, 0.3), 'leaf', y=0.3 + i * 0.42, z=0.9 - i * 0.36)
    for s in (-1, 1):
        rail = [(0.72 * s, 0.9 + i * 0.42, 0.9 - i * 0.36) for i in range(5)]
        p.add(tube(rail, 0.035, 6), 'terra')
        for i in range(5):
            p.add(cyl(0.03, 0.03, 0.62, 6), 'terra', x=0.72 * s, y=0.55 + i * 0.42, z=0.9 - i * 0.36)
    return p


@kit
def koi():
    p = Prop('koi', ground=False, ao=0.05)
    spots = lambda c: 'white' if math.sin(c.z * 18) * math.cos(c.x * 22) > 0.3 else 'coral'
    p.add(sphere(1.0, 14, 8), spots, y=0.2, sx=0.16, sy=0.14, sz=0.34)
    p.add(slab([(0, 0.22, -0.32), (0, 0.24, -0.45), (0, 0.22, -0.58)], lambda t: 0.04 + 0.3 * t, 0.02, up=(0, 0, 1)), 'white')
    p.add(slab([(0, 0.33, 0.1), (0, 0.38, -0.05), (0, 0.33, -0.2)], 0.08, 0.015, up=(0, 0, 1)), 'coral')
    for s in (-1, 1):
        p.add(sphere(0.022, 6, 4), 'ink', x=0.1 * s, y=0.25, z=0.24)
        p.add(slab([(0.12 * s, 0.17, 0.1), (0.24 * s, 0.13, 0.04)], 0.1, 0.015, up=(0, 1, 0)), 'white')
    return p


@kit
def santuario_mini():
    p = Prop('santuario-mini', ao=0.2)
    p.add(lathe([(0.38, 0), (0.38, 0.12), (0.18, 0.2), (0.14, 0.45), (0.3, 0.5), (0.0, 0.5)], 6, th0=math.pi / 6), 'stone')
    p.add(box(0.36, 0.38, 0.36), 'stoneDark', bevel=0.02, y=0.7)
    p.add(box(0.2, 0.18, 0.38), 'sun', y=0.72)
    p.add(box(0.38, 0.18, 0.2), 'sun', y=0.72)
    p.add(lathe([(0.0, 0.88), (0.42, 0.9), (0.38, 0.96), (0.1, 1.12), (0.05, 1.22), (0.0, 1.24)], 6, th0=math.pi / 4), 'stone')
    p.add(sphere(0.06, 8, 5), 'stoneDark', y=1.28)
    p.add(bumpy(sphere(0.25, 8, 5), 0.02), 'leaf', x=0.25, y=0.05, z=0.15, sy=0.35)
    return p


# =============================================================== NOTTE NEON

def car(p, body, cab, roofcol=None, light='white'):
    for x in (-0.55, 0.6):
        for z in (-0.58, 0.58):
            wheel(p, x, 0.29, z, 0.28, 0.18)
    p.add(box(2.0, 0.48, 1.16), body, bevel=0.14, seg=3, y=0.6)
    p.add(box(1.1, 0.46, 1.04), cab, bevel=0.12, seg=3, x=-0.15, y=1.04)
    for z in (-0.52, 0.52):
        pane(p, 0.38, 0.2, x=0.07, y=1.06, z=z, col='neonBlue')
        pane(p, 0.38, 0.2, x=-0.37, y=1.06, z=z, col='neonBlue')
    pane(p, 0.02, 0.2, 0.7, x=0.405, y=1.06, col='neonBlue')
    pane(p, 0.02, 0.2, 0.6, x=-0.705, y=1.06, col='neonBlue')
    for z in (-0.36, 0.36):
        p.add(cyl(0.09, 0.09, 0.06, 12), light, x=1.0, y=0.66, z=z, rz=math.pi / 2)
        p.add(box(0.05, 0.08, 0.16), 0xff4d6a, x=-1.0, y=0.66, z=z)
    for x in (1.02, -1.02):
        p.add(box(0.05, 0.08, 1.12), 'chrome', bevel=0.02, x=x, y=0.42)


@kit
def taxi():
    p = Prop('taxi', ao=0.35)
    car(p, 'lemon', 'lemon')
    p.add(box(1.9, 0.06, 0.02), 'ink', y=0.62, z=0.585)
    p.add(box(1.9, 0.06, 0.02), 'ink', y=0.62, z=-0.585)
    p.add(box(0.5, 0.16, 0.24), 'white', bevel=0.03, x=-0.15, y=1.35)
    p.add(box(0.46, 0.1, 0.25), 'ink', x=-0.15, y=1.36)
    return p


@kit
def auto_polizia():
    p = Prop('auto-polizia', ao=0.35)
    car(p, 0x2b3a66, 0x24304f)
    p.add(box(1.9, 0.14, 0.02), 'white', y=0.68, z=0.585)
    p.add(box(1.9, 0.14, 0.02), 'white', y=0.68, z=-0.585)
    p.add(box(0.7, 0.1, 0.26), 'ink', bevel=0.02, x=-0.15, y=1.33)
    p.add(box(0.3, 0.14, 0.24), 0xff4d6a, bevel=0.03, x=-0.33, y=1.42)
    p.add(box(0.3, 0.14, 0.24), 0x4d8bff, bevel=0.03, x=0.03, y=1.42)
    return p


@kit
def palone():
    # a hanging neon sign; origin is `lift` (1.4 m) above the ground
    p = Prop('palone', ground=False, ao=0.1)
    p.add(cyl(0.025, 0.025, 1.4, 6), 'stoneDark', y=-0.7)
    p.add(box(0.78, 0.4, 0.14), 'ink', bevel=0.04, seg=2, y=0.05)
    p.add(box(0.66, 0.06, 0.02), 'neonPink', y=0.14, z=0.075)
    p.add(box(0.5, 0.06, 0.02), 'neonBlue', y=-0.02, z=0.075)
    p.add(box(0.66, 0.06, 0.02), 'neonPink', y=0.14, z=-0.075)
    p.add(box(0.5, 0.06, 0.02), 'neonBlue', y=-0.02, z=-0.075)
    p.add(torus(0.38, 0.02, 4, 4), 'neonYellow', y=0.05, rx=math.pi / 2, ry=math.pi / 4, sx=1.0, sz=0.55)
    return p


@kit
def cabina():
    p = Prop('cabina', ao=0.3)
    p.add(box(0.85, 1.7, 0.8), 0x2a2740, bevel=0.04, y=0.85)
    p.add(box(0.92, 0.12, 0.88), 'ink', bevel=0.03, y=1.76)
    p.add(box(0.7, 0.18, 0.05), 'neonBlue', bevel=0.01, y=1.6, z=0.42)
    for z in (-0.41, 0.41):
        pane(p, 0.62, 0.6, x=0.0, y=1.08, z=z, col=0x2f3f66)
    p.add(box(0.5, 0.42, 0.05), 'neonPink', y=0.55, z=0.42)
    p.add(box(0.12, 0.12, 0.06), 'neonYellow', x=0.28, y=0.92, z=0.43)
    p.add(box(0.12, 0.12, 0.06), 'coral', x=-0.28, y=0.92, z=0.43)
    p.add(box(0.36, 0.4, 0.12), 'stoneDark', bevel=0.02, y=1.05, z=-0.2)
    return p


@kit
def edificio_neon():
    p = Prop('edificio-neon', ao=1.2)
    p.add(box(3.3, 0.5, 3.3), 0x24203c, bevel=0.04, y=0.25)
    p.add(box(3.2, 6.0, 3.2), 0x2f2b4a, bevel=0.05, y=3.4)
    for y in (2.15, 4.15):
        p.add(box(3.26, 0.08, 3.26), 0x4a4470, y=y)
    for f in range(7):
        for i in range(3):
            lit = 'neonYellow' if (f * 3 + i * 2) % 5 == 0 else ('neonBlue' if (f + i) % 3 else 0x3a3860)
            for z in (-1.61, 1.61):
                pane(p, 0.5, 0.46, x=-0.8 + i * 0.8, y=1.0 + f * 0.8, z=z, col=lit)
            for x in (-1.61, 1.61):
                pane(p, 0.02, 0.46, 0.5, x=x, y=1.0 + f * 0.8, z=-0.8 + i * 0.8, col=lit if (f + i) % 2 else 0x3a3860)
    p.add(box(3.4, 0.3, 3.4), 0x4a4470, bevel=0.04, y=6.55)
    p.add(box(0.7, 0.9, 0.7), 0x4a4470, bevel=0.03, x=0.9, y=7.1, z=0.9)
    p.add(cyl(0.03, 0.03, 1.5, 4), 'stoneDark', x=-0.9, y=7.4, z=-0.9)
    p.add(sphere(0.07, 6, 4), 0xff4d6a, x=-0.9, y=8.15, z=-0.9)
    p.add(box(1.2, 1.5, 0.08), 0x16132b, y=1.0, z=1.62)
    p.add(box(1.5, 0.12, 0.6), 'neonPink', bevel=0.02, y=1.82, z=1.85)
    p.add(box(0.14, 5.6, 0.14), 'neonBlue', x=1.66, y=3.5, z=1.66)
    p.add(box(0.14, 5.6, 0.14), 'neonPink', x=-1.66, y=3.5, z=1.66)
    p.add(box(0.12, 1.6, 0.6), 'neonPink', bevel=0.02, x=1.7, y=4.5, z=0.6)
    return p


@kit
def fontana_neon():
    p = Prop('fontana-neon', ao=0.6)
    p.add(lathe([(0, 0), (1.35, 0), (1.35, 0.4), (1.25, 0.5), (1.15, 0.5), (1.1, 0.2), (0, 0.2)], 24), 'stone', bevel=0.02)
    p.add(cyl(1.1, 1.1, 0.04, 24), 'neonBlue', y=0.42)
    p.add(torus(1.3, 0.035, 30, 4), 'neonPink', y=0.52)
    p.add(lathe([(0.3, 0.2), (0.28, 0.4), (0.18, 0.6), (0.15, 1.0), (0.22, 1.2), (0.16, 1.3)], 12), 'stone')
    p.add(lathe([(0.12, 1.25), (0.62, 1.36), (0.64, 1.44), (0.55, 1.46), (0, 1.4)], 16), 'pink')
    p.add(torus(0.63, 0.03, 24, 4), 'neonPink', y=1.44)
    p.add(sphere(0.22, 12, 8), 'neonYellow', y=1.68)
    for k in range(8):
        a = TAU * k / 8
        path = [(0.6 * math.cos(a) * t * 1.6, 1.45 - 1.0 * t ** 2, 0.6 * math.sin(a) * t * 1.6) for t in (0, 0.25, 0.5, 0.75, 1.0)]
        p.add(tube(path, 0.03, 5), 'neonBlue')
    return p


@kit
def palo_luce():
    p = Prop('palo-luce', ao=0.2)
    p.add(lathe([(0.16, 0), (0.15, 0.1), (0.09, 0.2), (0.07, 0.35)], 10), 'stoneDark')
    p.add(lathe([(0.07, 0.35), (0.055, 2.9), (0.0, 2.95)], 8), 'stoneDark')
    p.add(tube([(0.0, 2.85, 0), (0.2, 2.98, 0), (0.5, 2.95, 0)], 0.035, 6), 'stoneDark')
    p.add(box(0.5, 0.08, 0.2), 'stoneDark', bevel=0.02, x=0.55, y=2.9)
    p.add(box(0.42, 0.03, 0.14), 0xfff0c4, x=0.55, y=2.85)
    p.add(box(0.06, 0.5, 0.02), 'neonPink', x=0.0, y=1.8, z=0.07)
    return p


@kit
def ingaggio():
    p = Prop('ingaggio', ao=0.05)
    p.add(box(1.0, 0.06, 0.6), 'stoneDark', bevel=0.02, y=0.03)
    for x in (-0.3, -0.1, 0.1, 0.3):
        p.add(box(0.07, 0.03, 0.52), 'ink', x=x, y=0.07)
    p.add(cyl(0.03, 0.03, 0.5, 4), 'neonBlue', y=0.12, z=0.0, rx=0, rz=math.pi / 2, sx=1.0)
    p.add(lathe([(0.0, 0.06), (0.14, 0.08), (0.08, 0.3), (0.0, 0.45)], 8), 0xbfe8ff, x=0.35, z=-0.15)
    return p


@kit
def venditore():
    p = Prop('venditore', ao=0.35)
    for x in (-0.45, 0.45):
        wheel(p, x, 0.16, 0.42, 0.16, 0.08)
    p.add(box(1.3, 0.75, 0.8), 'ink', bevel=0.05, y=0.6)
    p.add(box(1.36, 0.08, 0.86), 'chrome', bevel=0.02, y=1.0)
    p.add(box(1.5, 0.05, 0.75), stripes(0.19, 'coral', 'white', axis='x', offset=0.75), bevel=0.01, y=1.75, rx=-0.15)
    for s in (-1, 1):
        p.add(cyl(0.02, 0.02, 0.75, 5), 'chrome', x=0.66 * s, y=1.38, z=-0.3)
    p.add(cyl(0.11, 0.11, 0.4, 10), 'chrome', x=0.4, y=1.24)
    p.add(sphere(0.12, 8, 5), 'neonPink', x=0.4, y=1.5)
    for k in range(4):
        p.add(cyl(0.025, 0.025, 0.28, 5), 'chocolate', x=-0.4 + k * 0.08, y=1.08, z=0.1, rz=math.pi / 2)
    p.add(box(0.6, 0.32, 0.04), 'neonBlue', bevel=0.01, y=0.62, z=0.42)
    p.add(box(0.3, 0.6, 0.04), 'neonYellow', x=-0.55, y=1.5, z=0.38)
    return p


# ===================================================================== GOLD

@kit
def oro_meteora():
    p = Prop('oro-meteora', ao=0.5)
    p.add(bumpy(ico(0.75, 2), 0.1, 3), 'gold', y=1.2)
    for k in range(6):
        a = TAU * k / 6
        p.add(bumpy(ico(0.2, 1), 0.04, k), 'goldDark', x=0.75 * math.cos(a), y=1.2 + 0.4 * math.sin(a * 2), z=0.75 * math.sin(a))
    p.add(torus(1.0, 0.05, 32, 5), 'lemon', y=1.2, rx=math.pi / 2.4)
    p.add(bumpy(lathe([(0.0, 0.0), (0.38, 0.3), (0.28, 0.7), (0.0, 1.2)], 10), 0.05), 0xff9a3c, x=-0.5, y=0.1, z=0.2, rz=0.7)
    p.add(bumpy(lathe([(1.1, 0), (0.7, 0.12), (0, 0.15)], 14), 0.06), 'stoneDark')
    return p


@kit
def oro_cristallo():
    p = Prop('oro-cristallo', ao=0.3)
    p.add(lathe([(0.6, 0), (0.6, 0.18), (0.5, 0.3), (0.0, 0.3)], 6), 'stone', bevel=0.02)
    for (x, z, h, r, rz, rx, col) in ((0, 0, 2.2, 0.36, 0, 0, 'ice'), (0.35, 0.15, 1.3, 0.22, -0.35, 0.1, 0x8fd8ff),
                                       (-0.32, 0.1, 1.2, 0.2, 0.4, 0.15, 0x8fd8ff), (0.05, -0.32, 1.0, 0.18, 0.1, -0.4, 'white'),
                                       (-0.15, 0.3, 0.8, 0.15, 0.3, 0.45, 'gold')):
        p.add(lathe([(r, 0), (r * 1.05, h * 0.72), (0.0, h)], 6, th0=x), col, x=x, y=0.25, z=z, rz=rz, rx=rx)
    return p


@kit
def oro_mask():
    p = Prop('oro-mask', ao=0.4)
    p.add(lathe([(0.12, 0), (0.1, 0.5), (0.14, 0.62)], 8), 'chocolate')
    face = sphere(0.55, 18, 12)
    for v in face.verts:
        if v.co.z < -0.1:
            v.co.z = -0.1 + (v.co.z + 0.1) * 0.25
    p.add(face, 'gold', y=1.12, sy=1.3)
    for s in (-1, 1):
        p.add(sphere(1.0, 10, 6), 'ink', x=0.2 * s, y=1.25, z=0.48, sx=0.15, sy=0.08, sz=0.06)
        p.add(slab([(0.1 * s, 1.42, 0.5), (0.3 * s, 1.47, 0.46)], 0.06, 0.03, up=(0, 0, 1)), 'goldDark')
    p.add(cone(0.08, 0.25, 8), 'goldDark', y=1.08, z=0.56, rx=math.pi / 2 - 0.4)
    p.add(slab([(-0.18, 0.82, 0.5), (0.0, 0.78, 0.53), (0.18, 0.82, 0.5)], 0.06, 0.03, up=(0, 0, 1)), 'ink')
    for k in range(7):
        a = math.pi * (k + 0.5) / 7
        p.add(cone(0.08, 0.45, 6), 'coral' if k % 2 else 'gold', x=0.62 * math.cos(a), y=1.2 + 0.75 * math.sin(a), z=-0.05, rz=a - math.pi / 2)
    return p
