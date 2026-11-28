"""
Ultimo Colore — the open lagoon, painted from above.

  Blender -b --factory-startup --python blender/build_world.py

Reads blender/world.json (written by scripts/export-world.mjs from
js/world/layout.js), builds it, tips every tall thing toward the north
so facades show, renders it straight down with an orthographic camera
and passes it through the same painter as the scenes.

World units: 100 of the game = 1 Blender unit; game y grows south.
"""
import bpy, bmesh, json, math, os, sys
from mathutils import Vector, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_scenes as B  # noqa: E402

with open(os.path.join(HERE, 'world.json')) as f:
    L = json.load(f)

W, H = L['WORLD']['w'], L['WORLD']['h']
SAMPLES = int(os.environ.get('UC_SAMPLES', '32'))
SCALE = float(os.environ.get('UC_SCALE', '1.5'))
K = 100.0


def P(x, y, z=0.0):
    return (x / K, (H - y) / K, z)


# ---------------------------------------------------------------- batching
# Tens of thousands of small objects make Blender crawl, so the helpers of
# the scene builder are redirected to collect one mesh per material.
BUF = {}


def push(verts, faces, material):
    v, f = BUF.setdefault(material.name, (material, [], []))[1:]
    n = len(v)
    v.extend(verts)
    f.extend(tuple(n + i for i in face) for face in faces)


def b_mesh(name, verts, faces, material, smooth=False):
    push([tuple(p) for p in verts], faces, material)


BOX_FACES = [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]


def b_box(x, y, z, sx, sy, sz, material, rz=0.0, rx=0.0, ry=0.0):
    rot = Euler((rx, ry, rz)).to_matrix()
    c = Vector((x, y, z))
    push([tuple(c + rot @ Vector((a * sx / 2, b * sy / 2, d * sz / 2))) for a in (-1, 1) for b in (-1, 1) for d in (-1, 1)], BOX_FACES, material)


ICO = {}


def ico(sub):
    if sub not in ICO:
        bm = bmesh.new()
        bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=1.0)
        bm.verts.ensure_lookup_table()
        ICO[sub] = ([v.co.copy() for v in bm.verts], [tuple(v.index for v in f.verts) for f in bm.faces])
        bm.free()
    return ICO[sub]


def b_ball(c, r, material, sub=2, sq=(1, 1, 1), jitter=0.0):
    verts, faces = ico(min(sub, 3))
    out = []
    for v in verts:
        k = r * (1 + B.rng.uniform(-jitter, jitter))
        out.append((c[0] + v.x * sq[0] * k, c[1] + v.y * sq[1] * k, c[2] + v.z * sq[2] * k))
    push(out, faces, material)


def flush(lean):
    for name, (material, verts, faces) in BUF.items():
        # the oblique view: everything above the ground leans north
        tipped = [(x, y + max(0.0, z) * lean, z) for x, y, z in verts]
        me = bpy.data.meshes.new(name)
        me.from_pydata(tipped, [], faces)
        me.update()
        obj = bpy.data.objects.new(name, me)
        obj.data.materials.append(material)
        bpy.context.scene.collection.objects.link(obj)


B.mesh, B.box, B.ball = b_mesh, b_box, b_ball


def slab(poly, z0, z1, material, name='slab', inset=0.0):
    """A flat island: the polygon extruded, with an optional inward step on top."""
    n = len(poly)
    cx = sum(p[0] for p in poly) / n
    cy = sum(p[1] for p in poly) / n
    top = [(x + (cx - x) * inset, y + (cy - y) * inset) for x, y in poly]
    verts = [P(x, y, z0) for x, y in poly] + [P(x, y, z1) for x, y in top]
    faces = [tuple(range(n, 2 * n))]
    for i in range(n):
        j = (i + 1) % n
        faces.append((i, j, n + j, n + i))
    return B.mesh(name, verts, faces, material)


def inside(x, y, poly):
    hit = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            hit = not hit
        j = i
    return hit


def points_in(poly, n):
    xs, ys = [p[0] for p in poly], [p[1] for p in poly]
    out = []
    for _ in range(n * 4):
        if len(out) >= n:
            break
        x, y = B.rng.uniform(min(xs), max(xs)), B.rng.uniform(min(ys), max(ys))
        if inside(x, y, poly):
            out.append((x, y))
    return out


def grow(poly, d):
    """The polygon pushed outward by d units from its middle."""
    cx = sum(p[0] for p in poly) / len(poly)
    cy = sum(p[1] for p in poly) / len(poly)
    out = []
    for x, y in poly:
        l = math.hypot(x - cx, y - cy) or 1
        out.append((x + (x - cx) / l * d, y + (y - cy) / l * d))
    return out


def along(poly, step):
    """Points every `step` units round the edge."""
    for i in range(len(poly)):
        (ax, ay), (bx, by) = poly[i], poly[(i + 1) % len(poly)]
        n = max(1, int(math.hypot(bx - ax, by - ay) / step))
        for k in range(n):
            t = k / n
            yield ax + (bx - ax) * t, ay + (by - ay) * t, math.atan2(by - ay, bx - ax)


def shores(rng):
    """Lighter water over the sandbanks, and a broken line of foam."""
    for n, isle in enumerate(L['ISLANDS']):
        grass = isle['ground'] != 'cobble'
        wide = (46, 24) if grass else (30, 15)
        slab(grow(isle['poly'], wide[0]), -0.09, -0.055 + n * 0.0001, B.mat('halo0', '#316a68', rough=0.55, noise=0.3, scale=1.1), 'halo')
        slab(grow(isle['poly'], wide[1]), -0.09, -0.0525 + n * 0.0001, B.mat('halo1', '#47847a', rough=0.6, noise=0.3, scale=1.6), 'halo')
        for x, y, a in along(grow(isle['poly'], 7), 9):
            if rng.random() < 0.55:
                B.box(*P(x + rng.uniform(-2, 2), y + rng.uniform(-2, 2), -0.044), rng.uniform(0.05, 0.15), 0.022, 0.006,
                      B.mat('foam', '#bcd8cc', rough=0.6, noise=0), -a + rng.uniform(-0.2, 0.2))


def meadow(isle, rng):
    """Patches, tufts and flowers, so no lawn is one flat green."""
    area = isle['poly']
    for x, y in points_in(grow(area, -26), 26):
        c = rng.choice(['#6a8a3e', '#4a6a34', '#78944a'])
        B.ball(P(x, y, 0.056), rng.uniform(0.12, 0.28), B.mat('patch' + c, c, rough=0.95, noise=0.3, scale=5), 2, (1.4, 1, 0.04), 0.25)
    for cx, cy in points_in(grow(area, -22), 11):
        c = rng.choice(['#f2ecd8', '#f0c648', '#e8dcc0', '#d86a50'])
        for _ in range(rng.randint(3, 8)):
            x, y = cx + rng.uniform(-11, 11), cy + rng.uniform(-7, 7)
            B.ball(P(x, y, 0.1), 0.022, B.mat('flower' + c, c, emit=c, strength=0.25, noise=0), 1)
    for x, y in points_in(grow(area, -14), 40):
        B.reeds(x / K, (H - y) / K, 0.03, 0.02, 5, 0.09, rng.choice(['#8aa84c', '#6c8c3a']))


def facade(cx, cy, wb, db, hb, rh, roof_i, cols, rng):
    """Eaves, ridge and rows of tiles on the side that faces us."""
    trim = B.mat('trim', '#d8c8a8', rough=0.9)
    dark = B.mat('eave', '#241610')
    B.box(cx, cy - db / 2 - 0.05, hb - 0.015, wb + 0.2, 0.09, 0.04, dark)
    B.cyl((cx - wb / 2 + 0.1, cy, hb + rh + 0.015), (cx + wb / 2 - 0.1, cy, hb + rh + 0.015), 0.028, B.mat('ridge', '#8a5a40'))
    tile = B.mat('tile' + str(roof_i), ['#744434', '#8a5038', '#5a465a'][roof_i], scale=9)
    rows = 5
    for r in range(1, rows):
        t = r / rows
        y = cy - (db / 2 + 0.08) * (1 - t)
        z = hb + rh * t + 0.012
        width = wb + 0.16 - 0.4 * t
        n = int(width / 0.11)
        for i in range(n):
            B.box(cx - width / 2 + (i + 0.5 + (r % 2) * 0.4) * width / n, y, z, width / n * 0.78, 0.03, 0.018, tile)
    B.box(cx, cy - db / 2 - 0.02, 0.025, 0.3, 0.1, 0.05, trim)


def build():
    B.reset(4242)
    sc = bpy.context.scene
    sc.cycles.samples = SAMPLES
    sc.render.resolution_x, sc.render.resolution_y = int(W * SCALE), int(H * SCALE)
    B.sky([(-0.1, '#6a8a90'), (1.0, '#8aa4b0')], 0.75)
    rng = B.rng

    # the water, with darker and lighter stretches
    B.mesh('water', [(-2, -2, -0.06), (W / K + 2, -2, -0.06), (W / K + 2, H / K + 2, -0.06), (-2, H / K + 2, -0.06)], [(0, 1, 2, 3)],
           B.mat('lagoon', '#27575c', rough=0.55, noise=0.34, scale=0.42))
    for _ in range(700):
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        B.box(*P(x, y, -0.045), rng.uniform(0.12, 0.6), 0.025, 0.01, B.mat('glint', '#6aa0a0', rough=0.3, noise=0), rng.uniform(-0.12, 0.12))

    for s in L['SHALLOWS']:
        slab(s['poly'], -0.07, -0.035 + rng.uniform(0, 0.006), B.mat('shoal', '#5c8468', rough=0.7, noise=0.26, scale=1.4), 'shoal', 0.03)
        for x, y in points_in(s['poly'], 46):
            B.ball(P(x, y, -0.03), rng.uniform(0.05, 0.2), B.mat('pebble', '#8a9a6a', rough=0.9), 2, (1.5, 1, 0.14), 0.1)
        for x, y in points_in(s['poly'], 12):
            B.reeds(x / K, (H - y) / K, 0.16, 0.16, 12, 0.36, '#6a8438')

    shores(rng)

    sand = B.mat('sand', '#b7a67c', rough=0.95, scale=2.5)
    grass = B.mat('turf', '#58773a', rough=0.95, noise=0.32, scale=2.2)
    stone = B.mat('quayside', '#6e645c', rough=0.9, scale=3)
    paving = B.mat('paving', '#8d7f72', rough=0.95, noise=0.2, scale=2.4)
    for isle in L['ISLANDS']:
        if isle['ground'] == 'cobble':
            slab(isle['poly'], -0.2, 0.05, stone, 'quay')
            slab(isle['poly'], 0.0, 0.065, paving, 'paving', 0.035)
            for x, y, a in along(grow(isle['poly'], -5), 21):
                B.box(*P(x, y, 0.07), 0.17, 0.08, 0.03, B.mat('kerb', '#a89a88', noise=0.15, scale=8), -a + rng.uniform(-0.05, 0.05))
            # paving stones on a loose grid, so no two share the same spot
            xs, ys = [q[0] for q in isle['poly']], [q[1] for q in isle['poly']]
            for gy in range(int(min(ys)) + 10, int(max(ys)) - 6, 19):
                for gx in range(int(min(xs)) + 10 + (gy // 19 % 2) * 12, int(max(xs)) - 6, 25):
                    x, y = gx + rng.uniform(-3, 3), gy + rng.uniform(-2, 2)
                    if rng.random() < 0.8 and inside(x, y, isle['poly']) and inside(x + 14, y + 9, isle['poly']) and inside(x - 14, y - 9, isle['poly']):
                        shade = rng.randint(0, 2)
                        B.box(*P(x, y, 0.07 + rng.uniform(0, 0.003)), rng.uniform(0.17, 0.2), rng.uniform(0.11, 0.14), 0.008, B.mat('cobble' + str(shade), ['#8a7c6e', '#9c8e80', '#92847a'][shade], noise=0.1, scale=9), rng.uniform(-0.08, 0.08))
        else:
            slab(isle['poly'], -0.15, 0.03, sand, 'beach')
            slab(isle['poly'], 0.0, 0.055, grass, 'turf', 0.13)
            meadow(isle, rng)
            for x, y in points_in(isle['poly'], int(len(isle['poly']) * 2.2)):
                if rng.random() < 0.7:
                    B.reeds(x / K, (H - y) / K, 0.08, 0.08, 7, 0.17, '#74903c')
                else:
                    B.ball(P(x, y, 0.07), rng.uniform(0.04, 0.09), B.mat('stonelet', '#8a8478'), 1, (1, 1, 0.6), 0.2)
        for x, y in isle['poly'][::2]:
            if rng.random() < 0.6:
                B.reeds(x / K, (H - y) / K, 0.16, 0.14, 9, 0.38, '#5c7834')

    plank = [B.mat('plank' + str(i), c, scale=7) for i, c in enumerate(['#7a5636', '#6a4a30', '#8a6440'])]
    post = B.mat('pole', '#2e2016')
    for p in L['PIERS']:
        x, y, w, h = p['x'], p['y'], p['w'], p['h']
        across = h > w
        n = int((h if across else w) / 15)
        for i in range(n):
            t = (i + 0.5) / n
            cx, cy = (x + w / 2, y + h * t) if across else (x + w * t, y + h / 2)
            B.box(*P(cx, cy, 0.09), (w / K) if across else (w / n / K) * 0.86, (h / n / K) * 0.86 if across else h / K, 0.05, plank[rng.randint(0, 2)], rng.uniform(-0.03, 0.03))
        for i in range(0, int((h if across else w) / 48) + 1):
            for side in (0, 1):
                px, py = (x + side * w, y + i * 48) if across else (x + i * 48, y + side * h)
                B.cyl(P(px, py, -0.1), P(px, py, 0.34), 0.05, post)
        if p['kind'] == 'bridge':
            for side in (0, 1):
                B.cyl(P(x + side * w, y, 0.34), P(x + side * w, y + h, 0.34), 0.03, post)
            for i in range(3):
                for side in (0, 1):
                    B.lantern(*P(x + side * w, y + 24 + i * (h - 48) / 2, 0.55), 0.085, lamp=5)

    for i, house in enumerate(L['HOUSES']):
        x, y, w, d, h = house['x'], house['y'], house['w'], house['d'], house['h']
        wall = B.mat('wall' + house['color'], house['color'], scale=2.2)
        roof = B.mat('roof' + str(i % 3), ['#5a3228', '#6e3c2c', '#463844'][i % 3], scale=6)
        cx, cy = P(x + w / 2, y + d / 2)[:2]
        wb, db, hb = w / K, d / K, h / K
        B.box(cx, cy, hb / 2, wb, db, hb, wall)
        rh = hb * 0.34
        v = [(cx - wb / 2 - 0.08, cy - db / 2 - 0.08, hb), (cx + wb / 2 + 0.08, cy - db / 2 - 0.08, hb), (cx + wb / 2 + 0.08, cy + db / 2 + 0.08, hb), (cx - wb / 2 - 0.08, cy + db / 2 + 0.08, hb), (cx - wb / 2 + 0.12, cy, hb + rh), (cx + wb / 2 - 0.12, cy, hb + rh)]
        B.mesh('roof', v, [(0, 1, 5, 4), (2, 3, 4, 5), (1, 2, 5), (3, 0, 4)], roof)
        cols = max(2, int(wb / 0.38))
        for c in range(cols):
            for r in range(max(1, int((hb - 0.2) / 0.42))):
                lit = rng.random() < 0.4
                col = rng.choice(['#ffb04a', '#ffd070']) if lit else '#141a22'
                wm = B.mat('w' + col, col, emit=col if lit else None, strength=1.4 if lit else 0, noise=0, rough=0.3)
                wx, wz = cx - wb / 2 + (c + 0.5) * wb / cols, 0.3 + r * 0.42
                B.box(wx, cy - db / 2 - 0.006, wz, 0.18, 0.02, 0.26, B.mat('trim', '#d8c8a8', rough=0.9))
                B.box(wx, cy - db / 2 - 0.02, wz, 0.13, 0.02, 0.21, wm)
                B.box(wx, cy - db / 2 - 0.032, wz, 0.012, 0.01, 0.21, B.mat('trim', '#d8c8a8'))
                B.box(wx, cy - db / 2 - 0.04, wz - 0.14, 0.2, 0.06, 0.025, B.mat('sill', '#8a7a66'))
                if rng.random() < 0.45:
                    sh = rng.choice(['#3a6a5a', '#7a3428', '#35506e'])
                    for side in (-1, 1):
                        B.box(wx + side * 0.12, cy - db / 2 - 0.02, wz, 0.055, 0.02, 0.24, B.mat('shutter' + sh, sh))
                if r == 0 and rng.random() < 0.3:
                    for k in range(5):
                        B.ball((wx - 0.07 + k * 0.035, cy - db / 2 - 0.07, wz - 0.11), 0.026, B.mat('bloom' + str(k % 2), ['#d84a3c', '#5a8a3a'][k % 2], noise=0), 1)
        B.box(cx, cy - db / 2 - 0.016, 0.15, 0.2, 0.03, 0.3, B.mat('door', '#2a180e'))
        B.box(cx + wb * 0.24, cy + db * 0.1, hb + rh * 0.7, 0.14, 0.14, 0.3, B.mat('chimney', '#5a443a'))
        B.box(cx + wb * 0.24, cy + db * 0.1, hb + rh * 0.7 + 0.17, 0.19, 0.19, 0.04, B.mat('cap', '#2a201c'))
        facade(cx, cy, wb, db, hb, rh, i % 3, cols, rng)

    # Ada's counter, her bread and awning
    B.box(*P(1180, 2862, 0.12), 0.62, 0.22, 0.22, B.mat('counter', '#6a3e22'))
    for i in range(5):
        B.ball(P(1156 + i * 13, 2862, 0.27), 0.055, B.mat('bread', '#d29a42'), 2, (1.3, 1, 0.7))
    # lantern strings across the streets
    for a, b in (((590, 2858), (800, 2858)), ((1170, 2878), (1300, 2862)), ((880, 2470), (1160, 2470))):
        B.rope_lanterns(P(a[0], a[1], 0.95), P(b[0], b[1], 0.95), 4, 0.15, r=0.07, lamp=3)
    for y in (2128, 2196, 2262):
        a, b = (868, y), (1085, y + 8)
        B.cyl(P(a[0], a[1], 0.92), P(b[0], b[1], 0.92), 0.006, B.mat('line', '#2a201a'), n=4)
        for i in range(6):
            t = (i + 0.6) / 6.4
            c = rng.choice(['#e8e0cc', '#c8503c', '#4a6a8a', '#d8b050'])
            tall = rng.uniform(0.14, 0.26)
            B.box(*P(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 0.9 - tall / 2), rng.uniform(0.13, 0.2), 0.012, tall, B.mat('cloth' + c, c, rough=0.95), rng.uniform(-0.1, 0.1))
    for x, y in ((592, 2855), (743, 2866), (1286, 2850), (1112, 2850), (570, 2442), (1312, 2447)):
        for dx, dy in ((0, 0), (15, 5)):
            B.cyl(P(x + dx, y + dy, 0.05), P(x + dx, y + dy, 0.25), 0.065, B.mat('barrel', '#6a4426', scale=8))
            B.cyl(P(x + dx, y + dy, 0.2), P(x + dx, y + dy, 0.215), 0.07, B.mat('hoop', '#2a2420'))

    # crates and nets by the harbour and on the isle of nets
    for x, y in ((1545, 2408), (1560, 2455), (1520, 2330)):
        B.box(*P(x, y, 0.15), 0.22, 0.22, 0.2, B.mat('crate', '#7a5a34'), rng.uniform(0, 1))
    for x, y in ((300, 1700), (330, 1830), (420, 1720)):
        for i in range(8):
            B.cyl(P(x + i * 9, y, 0.04), P(x + i * 9 + 18, y + 4, 0.52), 0.006, B.mat('net', '#cdbb90'), n=4)
        B.cyl(P(x, y, 0.5), P(x + 86, y, 0.5), 0.012, post)

    # the boat waiting at the harbour is drawn by the game; moored boats elsewhere
    for x, y, rz in ((430, 2610, 1.4), (1700, 2620, 1.1), (590, 1790, 0.2), (1415, 1755, -0.4)):
        B.boat(*P(x, y, -0.06), 0.9, 0.34, rz, '#3a2830', False)

    t = L['TOWER']
    tx, ty = P(t['x'], t['y'])[:2]
    B.tower(tx, ty, t['h'] / K * 0.82, t['w'] / K, '#8a7866', lean=0.1, base=-0.1)
    for x, y in ((1560, 1560), (1760, 1590), (1500, 1690), (1805, 1790)):
        B.box(*P(x, y, -0.02), 0.5, 0.1, 0.08, B.mat('drift', '#4a3626'), rng.uniform(0, 3))

    for x, y, s in L['WILLOWS']:
        px, py = P(x, y)[:2]
        B.willow(px, py, 0.34 * s, '#76983a' if y < 1220 else '#587a38', strands=60)

    for camp in L['CAMPS']:
        x, y = camp['x'], camp['y']
        for a in range(7):
            q = a * 0.9
            B.cyl(P(x + 20 * math.cos(q), y + 20 * math.sin(q), 0.08), P(x, y, 0.2), 0.03, B.mat('log', '#3a2416'))
        for k in range(8):
            B.ball(P(x + rng.uniform(-5, 5), y + rng.uniform(-5, 5), 0.18 + k * 0.025), 0.085 * (1 - k / 10), B.mat('ember' + str(k % 2), ['#ff7a20', '#ffc040'][k % 2], emit=['#ff7a20', '#ffc040'][k % 2], strength=2.6, noise=0), 1, (0.7, 0.7, 1.4), 0.3)
        B.light('POINT', P(x, y - 8, 0.7), 26, '#ff9434', 0.2)
        for dx, dy in ((-78, -26), (76, -34)):
            cx, cy = P(x + dx, y + dy)[:2]
            B.mesh('tent', [(cx - 0.3, cy - 0.24, 0.05), (cx + 0.3, cy - 0.24, 0.05), (cx + 0.3, cy + 0.24, 0.05), (cx - 0.3, cy + 0.24, 0.05), (cx, cy - 0.24, 0.48), (cx, cy + 0.24, 0.48)], [(1, 2, 5, 4), (3, 0, 4, 5), (2, 3, 5), (0, 1, 4)], B.mat('canvas', '#b09a70', rough=0.95))

    # reed walls: dense enough to read as impassable
    for wall in L['WALLS']:
        gap = wall.get('gap')
        x = wall['from']
        while x < wall['to']:
            cx = x + 15
            if not (gap and gap[0] - 6 < cx < gap[1] + 6):
                cy = wall['y'] + wall['h'] / 2
                B.reeds(cx / K, (H - cy) / K, 0.2, wall['h'] / K * 0.55, 30, 0.62, ['#5f7c30', '#76903a', '#4e6a2c'][rng.randint(0, 2)])
            x += 28

    # the stag's clearing: cut green glass
    glass = B.mat('shard', '#4ce08a', rough=0.08, trans=0.8, emit='#1a8a50', strength=0.7, noise=0)
    for x, y, h in L['SHARDS']:
        B.cyl(P(x, y, -0.08), P(x + rng.uniform(-14, 14), y + rng.uniform(-6, 6), h / K), rng.uniform(0.06, 0.16), glass, 0.002, 5, False)
    for a in range(26):
        q = a / 26 * math.tau
        x, y = 960 + math.cos(q) * 262, 215 + math.sin(q) * 112
        if not (y > 270 and abs(x - 960) < 110):
            B.cyl(P(x, y, 0), P(x + math.cos(q) * 14, y, rng.uniform(0.2, 0.55)), 0.06, glass, 0.002, 5, False)

    for s in L['STATUES']:
        B.statue(*P(s['x'], s['y'] - 4, 0.04), 0.36, s['pose'], 0.0)

    # drowned posts and lily pads scattered over open water
    land = [i['poly'] for i in L['ISLANDS']] + [s['poly'] for s in L['SHALLOWS']]
    for _ in range(420):
        x, y = rng.uniform(40, W - 40), rng.uniform(40, H - 40)
        if any(inside(x, y, p) for p in land):
            continue
        if rng.random() < 0.8:
            B.ball(P(x, y, -0.045), rng.uniform(0.035, 0.085), B.mat('lily', '#4e7a44', rough=0.8), 1, (1.2, 1, 0.1), 0.15)
        else:
            B.cyl(P(x, y, -0.1), P(x + rng.uniform(-4, 4), y, rng.uniform(0.12, 0.32)), 0.04, post)

    B.light('SUN', (0, 0, 30), 3.1, '#fff0d4', rot=(math.radians(40), 0, math.radians(-38)))

    lean = L['LEAN']
    flush(lean)
    for obj in sc.collection.objects:
        if obj.type == 'LIGHT' and obj.data.type == 'POINT':
            obj.location.y += max(0.0, obj.location.z) * lean
    print('meshes', len(BUF), 'verts', sum(len(v[1]) for v in BUF.values()), flush=True)

    cam = bpy.data.cameras.new('top')
    cam.type = 'ORTHO'
    cam.ortho_scale = H / K
    o = bpy.data.objects.new('top', cam)
    o.location = (W / K / 2, H / K / 2, 80)
    sc.collection.objects.link(o)
    sc.camera = o
    path = os.path.join(B.OUT, 'world.png')
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    B.paint(path, 900, border=False, brush=max(2, round(2 * SCALE)), wobble=0.45, grain_size=SCALE)
    print('PAINTED world', flush=True)


build()
