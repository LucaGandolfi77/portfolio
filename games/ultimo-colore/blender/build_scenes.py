"""
Ultimo Colore — the places of Act I, built and painted in Blender (headless).

  Blender -b --factory-startup --python blender/build_scenes.py -- [names...]

Geometry, materials and light are all made here; no external assets.
Each render then goes through a painterly pass (Kuwahara smoothing,
charcoal edges, paper grain) written with numpy. PNGs land in
blender/out/; scripts/pack-art.mjs turns them into WebP.

Environment: UC_SAMPLES (default 40), UC_SCALE (default 1.0).
"""
import bpy, bmesh, math, os, sys, random
import numpy as np
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
os.makedirs(OUT, exist_ok=True)
SCALE = float(os.environ.get('UC_SCALE', '1.0'))
W, H = int(900 * SCALE), int(1200 * SCALE)
SAMPLES = int(os.environ.get('UC_SAMPLES', '40'))
ONLY = set(sys.argv[sys.argv.index('--') + 1:]) if '--' in sys.argv else set()
rng = random.Random(11)
MATS = {}

# ------------------------------------------------------------ basics

def hexc(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


def reset(seed):
    global rng
    rng = random.Random(seed)
    MATS.clear()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.samples = SAMPLES
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 5
    sc.render.resolution_x, sc.render.resolution_y = W, H
    sc.render.image_settings.file_format = 'PNG'
    sc.view_settings.view_transform = 'AgX'
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
        prefs.compute_device_type = 'METAL'
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
        sc.cycles.device = 'GPU'
    except Exception as e:
        print('GPU not available:', e)
    return sc


def sky(stops, strength=1.0):
    """World colour as a vertical gradient: [(height -0.2..1, '#hex'), ...]."""
    world = bpy.data.worlds.new('sky')
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    bg = nt.nodes['Background']
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = 2.4
    nz.inputs['Detail'].default_value = 6
    mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (1, 1, 5)
    add = nt.nodes.new('ShaderNodeMath')
    add.operation = 'MULTIPLY_ADD'
    add.inputs[1].default_value = 0.14
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    el = ramp.color_ramp.elements
    el[0].position, el[0].color = max(0, stops[0][0] + 0.07), (*hexc(stops[0][1]), 1)
    el[1].position, el[1].color = min(1, stops[-1][0] + 0.07), (*hexc(stops[-1][1]), 1)
    for pos, col in stops[1:-1]:
        e = el.new(pos + 0.07)
        e.color = (*hexc(col), 1)
    nt.links.new(tc.outputs['Generated'], sep.inputs[0])
    nt.links.new(tc.outputs['Generated'], mp.inputs['Vector'])
    nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
    nt.links.new(nz.outputs['Fac'], add.inputs[0])
    nt.links.new(sep.outputs['Z'], add.inputs[2])
    nt.links.new(add.outputs[0], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], bg.inputs[0])
    bg.inputs[1].default_value = strength


def mat(name, color, rough=0.75, metal=0.0, emit=None, strength=0.0, trans=0.0, noise=0.22, scale=3.0):
    """A slightly mottled paint, so flat faces never look like plastic."""
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    base = hexc(color)
    if noise:
        tc = nt.nodes.new('ShaderNodeNewGeometry')
        nz = nt.nodes.new('ShaderNodeTexNoise')
        nz.inputs['Scale'].default_value = scale
        nz.inputs['Detail'].default_value = 7
        ramp = nt.nodes.new('ShaderNodeValToRGB')
        el = ramp.color_ramp.elements
        el[0].position, el[0].color = 0.32, (*[max(0, c * (1 - noise * 2)) for c in base], 1)
        el[1].position, el[1].color = 0.7, (*[min(1, c * (1 + noise)) for c in base], 1)
        nt.links.new(tc.outputs['Position'], nz.inputs['Vector'])
        nt.links.new(nz.outputs['Fac'], ramp.inputs['Fac'])
        nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    else:
        b.inputs['Base Color'].default_value = (*base, 1)
    if emit:
        b.inputs['Emission Color'].default_value = (*hexc(emit), 1)
        b.inputs['Emission Strength'].default_value = strength
    if trans:
        b.inputs['Transmission Weight'].default_value = trans
    MATS[name] = m
    return m


def link(obj, material=None):
    bpy.context.scene.collection.objects.link(obj)
    if material:
        obj.data.materials.append(material)
    return obj


def mesh(name, verts, faces, material, smooth=False):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    return link(bpy.data.objects.new(name, me), material)


def box(x, y, z, sx, sy, sz, m, rz=0.0, rx=0.0, ry=0.0):
    v = [(a * sx / 2, b * sy / 2, c * sz / 2) for a in (-1, 1) for b in (-1, 1) for c in (-1, 1)]
    f = [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]
    o = mesh('box', v, f, m)
    o.location = (x, y, z)
    o.rotation_euler = (rx, ry, rz)
    return o


def cyl(a, b, r, m, r2=None, n=10, smooth=True):
    """A cylinder or cone from point a to point b."""
    a, b = Vector(a), Vector(b)
    d = b - a
    if d.length < 1e-5:
        return None
    r2 = r if r2 is None else r2
    up = Vector((0, 0, 1)) if abs(d.normalized().z) < 0.95 else Vector((1, 0, 0))
    u = d.cross(up).normalized()
    w = d.cross(u).normalized()
    verts, faces = [], []
    for i in range(n):
        t = 2 * math.pi * i / n
        off = u * math.cos(t) + w * math.sin(t)
        verts.append(tuple(a + off * r))
        verts.append(tuple(b + off * r2))
    for i in range(n):
        j = (i + 1) % n
        faces.append((2 * i, 2 * j, 2 * j + 1, 2 * i + 1))
    faces.append(tuple(2 * i for i in range(n))[::-1])
    faces.append(tuple(2 * i + 1 for i in range(n)))
    return mesh('cyl', verts, faces, m, smooth)


def ball(c, r, m, sub=2, sq=(1, 1, 1), jitter=0.0):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=r)
    for v in bm.verts:
        k = 1 + rng.uniform(-jitter, jitter)
        v.co.x *= sq[0] * k
        v.co.y *= sq[1] * k
        v.co.z *= sq[2] * k
    me = bpy.data.meshes.new('ball')
    bm.to_mesh(me)
    bm.free()
    if not jitter:
        for p in me.polygons:
            p.use_smooth = True
    o = bpy.data.objects.new('ball', me)
    o.location = c
    return link(o, m)


def light(kind, loc, energy, color, size=0.2, rot=None):
    d = bpy.data.lights.new('L', kind)
    d.energy = energy
    d.color = hexc(color)
    if kind == 'AREA':
        d.size = size
    elif kind == 'SUN':
        d.angle = 0.05
    else:
        d.shadow_soft_size = size
    o = bpy.data.objects.new('L', d)
    o.location = loc
    if rot:
        o.rotation_euler = rot
    bpy.context.scene.collection.objects.link(o)
    return o


def camera(loc, target, lens=32):
    cam = bpy.data.cameras.new('cam')
    cam.lens = lens
    o = bpy.data.objects.new('cam', cam)
    o.location = loc
    d = Vector(target) - Vector(loc)
    o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.collection.objects.link(o)
    bpy.context.scene.camera = o
    return o


def water(color='#1c3a40', y0=-20, y1=90, x=60, amp=0.035, rough=0.08):
    nx, ny = 180, 260
    verts, faces = [], []
    for j in range(ny + 1):
        yy = y0 + (y1 - y0) * (j / ny) ** 1.35
        for i in range(nx + 1):
            xx = -x + 2 * x * i / nx
            z = amp * (math.sin(xx * 2.1 + yy * 0.7) * math.sin(yy * 3.3 - xx * 0.4) + 0.5 * math.sin(xx * 5.7 + yy * 4.1))
            verts.append((xx, yy, z))
    for j in range(ny):
        for i in range(nx):
            a = j * (nx + 1) + i
            faces.append((a, a + 1, a + nx + 2, a + nx + 1))
    return mesh('water', verts, faces, mat('water' + color, color, rough=rough, metal=0.35, noise=0.1, scale=0.6), True)


def ground(color, z=0.0, size=80, name='ground'):
    return mesh(name, [(-size, -size, z), (size, -size, z), (size, size, z), (-size, size, z)], [(0, 1, 2, 3)], mat(name + color, color, rough=0.95, scale=1.2))

# ------------------------------------------------------------ props

LANTERN_COLOURS = ['#ff9a3c', '#ffd25a', '#ff6a4a', '#ffb45a']


def lantern(x, y, z, r=0.16, color=None, glow=2.2, lamp=8.0):
    c = color or rng.choice(LANTERN_COLOURS)
    ball((x, y, z), r, mat('lan' + c + str(glow), c, emit=c, strength=glow, noise=0), 2, (1, 1, 1.25))
    cyl((x, y, z + r * 1.1), (x, y, z + r * 1.45), r * 0.35, mat('iron', '#2a2420'))
    cyl((x, y, z - r * 1.45), (x, y, z - r * 1.1), r * 0.3, mat('iron', '#2a2420'))
    if lamp:
        light('POINT', (x, y - r * 1.6, z), lamp, c, r)


def rope_lanterns(a, b, n, sag=0.5, **kw):
    a, b = Vector(a), Vector(b)
    pts = [a.lerp(b, i / 16) - Vector((0, 0, sag * 4 * (i / 16) * (1 - i / 16))) for i in range(17)]
    for p, q in zip(pts, pts[1:]):
        cyl(p, q, 0.012, mat('rope', '#3a2c20'), n=5)
    for i in range(n):
        t = (i + 0.5) / n
        p = a.lerp(b, t) - Vector((0, 0, sag * 4 * t * (1 - t) + 0.28))
        lantern(p.x, p.y, p.z, **kw)


def house(x, y, w, h, d, wall, roof='#3a2420', lit=0.55, rz=0.0, base=0.0):
    m = mat('wall' + wall, wall, scale=2.2)
    box(x, y, base + h / 2, w, d, h, m, rz)
    rm = mat('roof' + roof, roof, scale=6)
    rh = w * 0.32
    c, s = math.cos(rz), math.sin(rz)
    local = [(-w / 2 - 0.15, -d / 2 - 0.15, 0), (w / 2 + 0.15, -d / 2 - 0.15, 0), (w / 2 + 0.15, d / 2 + 0.15, 0), (-w / 2 - 0.15, d / 2 + 0.15, 0), (0, -d / 2 - 0.15, rh), (0, d / 2 + 0.15, rh)]
    verts = [(x + a * c - b * s, y + a * s + b * c, base + h + z) for a, b, z in local]
    mesh('roof', verts, [(0, 1, 4), (1, 2, 5, 4), (2, 3, 5), (3, 0, 4, 5)], rm)
    cols = max(1, int(w / 0.85))
    rows = max(1, int((h - 0.5) / 1.05))
    for i in range(cols):
        for j in range(rows):
            wx = -w / 2 + (i + 0.5) * w / cols
            wz = base + 0.75 + j * 1.05
            on = rng.random() < lit
            color = rng.choice(['#ffb04a', '#ffd070', '#ff9040']) if on else '#121820'
            wm = mat('win' + color, color, rough=0.2, emit=color if on else None, strength=1.3 if on else 0, noise=0)
            px, py = x + wx * c - (-d / 2 - 0.02) * s, y + wx * s + (-d / 2 - 0.02) * c
            box(px, py, wz, 0.34, 0.05, 0.52, wm, rz)
            box(px, py - 0.02, wz - 0.31, 0.46, 0.1, 0.06, mat('sill', '#cdb99a'), rz)
            box(px, py - 0.03, wz, 0.025, 0.04, 0.52, mat('frame', '#2c1c14'), rz)


def tower(x, y, h, w, wall, lean=0.0, base=0.0, belfry=True):
    m = mat('tow' + wall, wall, scale=1.6)
    top = (x + math.sin(lean) * h, y, base + math.cos(lean) * h)
    box(x + math.sin(lean) * h / 2, y, base + math.cos(lean) * h / 2, w, w, h, m, ry=lean)
    if belfry:
        tx, ty, tz = top
        for dx in (-1, 1):
            for dy in (-1, 1):
                cyl((tx + dx * w * 0.42, ty + dy * w * 0.42, tz), (tx + dx * w * 0.42 + math.sin(lean) * w, ty + dy * w * 0.42, tz + w), w * 0.07, m)
        bx, bz = tx + math.sin(lean) * w, tz + w
        box(bx, ty, bz + 0.05, w * 1.15, w * 1.15, 0.14, m, ry=lean)
        mesh('spire', [(bx - w * 0.55, ty - w * 0.55, bz + 0.1), (bx + w * 0.55, ty - w * 0.55, bz + 0.1), (bx + w * 0.55, ty + w * 0.55, bz + 0.1), (bx - w * 0.55, ty + w * 0.55, bz + 0.1), (bx + math.sin(lean) * w * 1.2, ty, bz + w * 1.5)],
             [(0, 1, 4), (1, 2, 4), (2, 3, 4), (3, 0, 4)], mat('spire', '#2f3a36'))
        cyl((tx + math.sin(lean) * w * 0.55, ty, tz + w * 0.55), (tx + math.sin(lean) * w * 0.2, ty, tz + w * 0.18), w * 0.12, mat('bronze', '#8a6a30', rough=0.35, metal=0.9), w * 0.3)


def statue(x, y, z=0.0, s=1.0, pose='stand', rz=0.0):
    """A person turned to salt, caught in a gesture."""
    salt = mat('salt', '#e9e6df', rough=0.55, noise=0.1, scale=14)
    c, sn = math.cos(rz), math.sin(rz)
    P = lambda a, b, h: (x + (a * c - b * sn) * s, y + (a * sn + b * c) * s, z + h * s)
    hip, neck = P(0, 0, 0.9), P(0.03, -0.03, 1.5)
    if pose == 'run':
        cyl(P(-0.32, 0.12, 0), hip, 0.07 * s, salt, 0.12 * s)
        cyl(P(0.36, -0.16, 0.22), hip, 0.06 * s, salt, 0.12 * s)
        neck = P(0.16, -0.12, 1.42)
    elif pose == 'sit':
        hip = P(0, 0.1, 0.55)
        neck = P(0, 0.05, 1.15)
        for dx in (-0.14, 0.14):
            cyl(P(dx, -0.35, 0.52), hip, 0.09 * s, salt)
            cyl(P(dx, -0.35, 0), P(dx, -0.35, 0.52), 0.07 * s, salt)
    else:
        # a long skirt or coat
        cyl(P(0, 0, 0), hip, 0.3 * s, salt, 0.13 * s)
    cyl(hip, neck, 0.17 * s, salt, 0.13 * s)
    nx, ny, nz = neck
    ball((nx, ny - 0.01 * s, nz + 0.2 * s), 0.14 * s, salt)
    arms = {
        'stand': [((-0.3, -0.1, 1.15), (-0.28, -0.32, 0.95)), ((0.3, -0.1, 1.15), (0.2, -0.38, 1.05))],
        'reach': [((-0.34, -0.2, 1.5), (-0.34, -0.5, 1.95)), ((0.34, -0.2, 1.5), (0.3, -0.5, 1.95))],
        'bread': [((-0.28, -0.2, 1.12), (-0.08, -0.42, 1.18)), ((0.28, -0.2, 1.12), (0.08, -0.42, 1.18))],
        'run': [((-0.36, 0.14, 1.2), (-0.5, 0.26, 0.98)), ((0.4, -0.3, 1.3), (0.52, -0.5, 1.5))],
        'sit': [((-0.3, -0.18, 0.88), (-0.14, -0.45, 0.82)), ((0.3, -0.18, 0.88), (0.16, -0.45, 0.82))],
    }[pose]
    for i, (elbow, hand) in enumerate(arms):
        sh = P((-1 if i == 0 else 1) * 0.15, -0.02, 1.38 if pose != 'sit' else 1.04)
        cyl(sh, P(*elbow), 0.065 * s, salt, 0.05 * s)
        cyl(P(*elbow), P(*hand), 0.05 * s, salt, 0.038 * s)
        ball(P(*hand), 0.045 * s, salt)
    if pose == 'bread':
        ball(P(0, -0.46, 1.2), 0.1 * s, salt, 2, (1.7, 0.8, 0.7))


def boat(x, y, z=0.0, L=5.0, w=1.5, rz=0.0, color='#4a2c1c', mast=True):
    n = 18
    verts, faces = [], []
    c, s = math.cos(rz), math.sin(rz)
    for i in range(n + 1):
        t = i / n * 2 - 1
        half = w / 2 * math.sqrt(max(0, 1 - abs(t) ** 2.4))
        sheer = 0.55 + 0.35 * abs(t) ** 3
        for a, b, h in ((-half, t * L / 2, sheer), (-half * 0.55, t * L / 2, 0.02), (half * 0.55, t * L / 2, 0.02), (half, t * L / 2, sheer)):
            verts.append((x + a * c - b * s, y + a * s + b * c, z + h))
    for i in range(n):
        a = i * 4
        for k in range(3):
            faces.append((a + k, a + k + 1, a + k + 5, a + k + 4))
    mesh('hull', verts, faces, mat('hull' + color, color, rough=0.6, scale=5))
    for k in (0, 3):
        for i in range(n):
            cyl(verts[i * 4 + k], verts[(i + 1) * 4 + k], 0.05, mat('gunwale', '#2a180e'), n=6)
    for t in (-0.45, 0.0, 0.45):
        b = t * L / 2
        box(x - b * s, y + b * c, z + 0.38, w * 0.82, 0.22, 0.05, mat('thwart', '#6b4526'), rz)
    if mast:
        cyl((x, y, z + 0.1), (x, y, z + 3.4), 0.06, mat('mast', '#33221a'), 0.04)
        sail = mat('sail', '#c9bda0', rough=0.9, scale=2)
        mesh('sail', [(x + 0.02, y, z + 3.25), (x + 0.04, y + L * 0.3 * c, z + 1.2), (x + 0.02, y, z + 1.0), (x + 0.35, y + L * 0.14 * c, z + 2.0)], [(0, 3, 1), (3, 2, 1), (0, 2, 3)], sail)


def reeds(cx, cy, rx, ry, n, h=1.0, color='#4c6a35'):
    m = mat('reed' + color, color, rough=0.9)
    for _ in range(n):
        x, y = cx + rng.uniform(-rx, rx), cy + rng.uniform(-ry, ry)
        hh = h * rng.uniform(0.5, 1.25)
        tip = (x + rng.uniform(-0.2, 0.2), y + rng.uniform(-0.1, 0.1), hh)
        cyl((x, y, -0.05), tip, 0.015, m, 0.003, n=4)
        if rng.random() < 0.12:
            ball((tip[0], tip[1], tip[2]), 0.04, mat('cattail', '#6a4424'), 1, (1, 1, 2.6))


def willow(x, y, s=1.0, leaf='#6d8a3a', trunk='#2e2219', strands=110):
    tm = mat('trunk' + trunk, trunk, scale=5)
    lm = mat('leaf' + leaf, leaf, rough=0.85, noise=0.3)
    top = (x + rng.uniform(-0.3, 0.3) * s, y, 2.6 * s)
    cyl((x, y, -0.2), top, 0.3 * s, tm, 0.16 * s)
    crowns = []
    for _ in range(6):
        e = (top[0] + rng.uniform(-1.5, 1.5) * s, top[1] + rng.uniform(-0.8, 0.8) * s, top[2] + rng.uniform(0.2, 1.3) * s)
        cyl(top, e, 0.11 * s, tm, 0.03 * s)
        crowns.append(e)
    for _ in range(strands):
        e = Vector(rng.choice(crowns)) + Vector((rng.uniform(-0.6, 0.6) * s, rng.uniform(-0.4, 0.4) * s, rng.uniform(-0.1, 0.3) * s))
        length = rng.uniform(0.9, 2.5) * s
        prev = e
        drift = rng.uniform(-0.12, 0.12)
        for k in range(1, 7):
            p = e + Vector((drift * k / 3, 0, -length * k / 6))
            if p.z < 0.15:
                break
            cyl(prev, p, 0.006, lm, n=3, smooth=False)
            for side in (-1, 1):
                q = p + Vector((side * 0.07 * s, rng.uniform(-0.03, 0.03), -0.1 * s))
                mesh('leaf', [tuple(prev), tuple(q), tuple(p)], [(0, 1, 2)], lm)
            prev = p


def person_shadow(x, y, z=0.0, s=1.0, color='#181418', lamp=False):
    """A small figure seen from behind."""
    m = mat('shade' + color, color, rough=0.9)
    cyl((x, y, z), (x, y, z + 0.9 * s), 0.24 * s, m, 0.14 * s)
    cyl((x, y, z + 0.9 * s), (x, y, z + 1.35 * s), 0.18 * s, m, 0.12 * s)
    ball((x, y, z + 1.52 * s), 0.14 * s, m)
    if lamp:
        cyl((x + 0.2 * s, y, z + 1.0 * s), (x + 0.5 * s, y - 0.1, z + 1.35 * s), 0.025 * s, m)
        lantern(x + 0.5 * s, y - 0.1, z + 1.12 * s, 0.09 * s, '#ffae45', 3.5, 18)


def moon(x, y, z, r, color='#fff3d0', glow=6):
    ball((x, y, z), r, mat('moon' + color, color, emit=color, strength=glow, noise=0.12, scale=1.5))


def stars(n, y=70, zmin=14, zmax=55, x=40):
    m = mat('star', '#fff6dd', emit='#fff6dd', strength=7, noise=0)
    for _ in range(n):
        ball((rng.uniform(-x, x), y + rng.uniform(-3, 3), rng.uniform(zmin, zmax)), rng.uniform(0.03, 0.1), m, 1)


def skyline(y, spread, n, base=0.0, walls=('#7a4a3a', '#8a6a4a', '#5a4450', '#9a5a40'), lit=0.5, hmin=1.6, hmax=4.5):
    for i in range(n):
        x = -spread + 2 * spread * (i + rng.uniform(0.1, 0.9)) / n
        house(x, y + rng.uniform(-3, 3), rng.uniform(1.4, 2.8), rng.uniform(hmin, hmax), rng.uniform(1.4, 2.4), rng.choice(walls), rng.choice(['#3a2420', '#4a2a22', '#2c2630']), lit, rng.uniform(-0.25, 0.25), base)

# ------------------------------------------------------------ scenes

def scene_titolo():
    sky([(-0.05, '#241a33'), (0.0, '#ff9a55'), (0.12, '#f4705a'), (0.28, '#7a4a78'), (0.6, '#1d1c44')], 0.9)
    water('#16303a', y1=110, amp=0.045)
    skyline(26, 16, 17, 0.15)
    skyline(34, 22, 16, 0.2, hmin=3, hmax=6.5, lit=0.35)
    box(0, 28, 0.05, 40, 8, 0.3, mat('quay', '#2c2228'))
    tower(-4.5, 27, 9.5, 1.5, '#8a5a48')
    tower(7.5, 33, 7.5, 1.1, '#6a4a5a')
    boat(1.2, 8.5, 0.0, 4.6, 1.4, 0.35)
    person_shadow(1.5, 8.2, 0.45, 0.85, lamp=True)
    for x, y in ((-3.4, 11), (3.8, 14), (-1.0, 19), (5.4, 21), (-6, 17)):
        lantern(x, y, 0.28, 0.17)
    rope_lanterns((-6.5, 6.5, 5.4), (6.5, 7.5, 5.9), 7, 0.9, r=0.19)
    moon(7, 60, 24, 1.5, '#ffe9c0', 4)
    light('SUN', (0, 0, 10), 2.2, '#ff8a50', rot=(math.radians(82), 0, math.radians(-14)))
    camera((0, -3.5, 2.7), (0, 18, 3.4), 30)


def scene_forno():
    sky([(-0.05, '#403038'), (0.0, '#f0c49a'), (0.3, '#9a98b0'), (0.7, '#4a5478')], 1.0)
    ground('#8a7c70', 0)
    for i in range(240):
        box(rng.uniform(-3.4, 3.4), rng.uniform(1, 22), 0.025, rng.uniform(0.2, 0.4), rng.uniform(0.15, 0.3), 0.03, mat('cobble', '#8e8076', scale=9), rng.uniform(0, 1))
    house(-4.4, 8.0, 3.4, 5.4, 3, '#a8654a', rz=1.45, lit=0.35)
    house(-4.6, 13, 3.2, 4.6, 3, '#c2a070', rz=1.5, lit=0.3)
    house(4.5, 9.5, 3.8, 5.8, 3, '#7a7468', rz=-1.45, lit=0.25)
    house(4.7, 15, 3.0, 4.2, 3, '#946a5a', rz=-1.55, lit=0.3)
    skyline(24, 9, 8, lit=0.3, walls=('#8a6a5a', '#a08a70', '#6a6070'))
    # the bakery: counter, awning, bread
    box(-2.55, 6.4, 0.5, 0.7, 2.4, 1.0, mat('counter', '#6a3e22'))
    for i in range(7):
        ball((-2.5, 5.45 + i * 0.32, 1.12), 0.13, mat('bread', '#c98a3a', rough=0.8), 2, (1.2, 1.4, 0.8))
    for i in range(9):
        box(-2.3, 5.2 + i * 0.3, 2.45, 1.0, 0.28, 0.05, mat('awn' + str(i % 2), '#b8402e' if i % 2 else '#e8ddc4'), ry=0.42)
    light('POINT', (-2.9, 6.4, 1.9), 60, '#ffb060', 0.25)
    statue(-1.35, 6.1, 0, 1.05, 'bread', 0.75)
    statue(1.9, 11.5, 0, 0.9, 'run', -0.5)
    rope_lanterns((-3.0, 9.5, 4.0), (3.0, 10.5, 4.3), 5, 0.5, r=0.15, lamp=5)
    for i in range(4):
        statue(rng.uniform(-1.8, 2.2), 15 + i * 2.0, 0, 0.9, rng.choice(['stand', 'reach']), rng.uniform(-1, 1))
    light('SUN', (0, 0, 10), 3.2, '#ffd0a0', rot=(math.radians(58), 0, math.radians(38)))
    camera((0.5, -0.5, 2.15), (-0.5, 8, 1.75), 31)


def scene_ponte():
    sky([(-0.05, '#10181c'), (0.0, '#d8a060'), (0.18, '#5a7a74'), (0.6, '#16283c')], 0.8)
    water('#183c34', y1=90, amp=0.03)
    house(-6.4, 9, 4, 6.0, 3.4, '#8a4a3c', rz=1.35)
    house(-6.6, 16, 3.6, 5.0, 3.0, '#5a6a58', rz=1.5)
    house(6.4, 8.5, 4, 5.2, 3.4, '#b0885a', rz=-1.35)
    house(6.6, 15, 3.4, 6.2, 3.0, '#6a4a50', rz=-1.5)
    for x in (-5.1, 5.1):
        box(x, 12, 0.3, 1.2, 18, 0.7, mat('bank', '#4a423c'))
    stone = mat('stone', '#7a6a5a', scale=4)
    n = 28
    for i in range(n):
        t = i / (n - 1) * 2 - 1
        x = t * 4.8
        z = 2.15 - 1.55 * t * t
        ang = math.atan(3.1 * t / 4.8)
        box(x, 11.5, z, 0.42, 1.7, 0.38, stone, ry=ang)
        if i % 3 == 1:
            for yy in (10.75, 12.25):
                cyl((x, yy, z + 0.15), (x, yy, z + 0.95), 0.045, stone)
        cyl((x, 10.75, z + 0.95), (x + 0.36, 10.75, z + 0.95 - 3.1 * t * 0.36 / 4.8), 0.045, stone)
    rope_lanterns((-4.6, 10.6, 4.7), (4.6, 10.6, 4.7), 8, 0.85, r=0.18)
    skyline(27, 12, 11, 0.1)
    tower(2.5, 30, 8, 1.3, '#7a5a4a')
    boat(-2.4, 6.4, 0.0, 3.4, 1.1, -0.3, '#3a2a30', False)
    statue(1.2, 11.3, 2.32, 0.75, 'reach', 0.2)
    reeds(-3.8, 5, 0.7, 2, 70, 0.9)
    reeds(3.9, 6, 0.7, 2.5, 80, 1.0)
    moon(-6, 55, 22, 1.2, '#e8f0d8', 3)
    light('SUN', (0, 0, 10), 1.2, '#a8d0c0', rot=(math.radians(50), 0, math.radians(30)))
    camera((0.2, -1.2, 2.4), (0, 11, 2.0), 31)


def scene_darsena():
    sky([(-0.05, '#202830'), (0.0, '#cfd8c8'), (0.2, '#8aa4a8'), (0.7, '#3a5068')], 1.0)
    water('#28484a', y1=100, amp=0.025)
    wood = mat('plank', '#6a4a30', scale=7)
    for i in range(30):
        box(-2.3 + rng.uniform(-0.04, 0.04), 1.5 + i * 0.42, 0.42, 2.6, 0.36, 0.1, wood, rng.uniform(-0.03, 0.03))
    for y in (2, 5, 8, 11, 14):
        for x in (-3.5, -1.0):
            cyl((x, y, -0.3), (x, y, 0.9), 0.13, mat('post', '#3a2a1e'), 0.11)
        if y % 6 == 2:
            cyl((-3.5, y, 0.9), (-3.5, y, 2.2), 0.05, mat('iron', '#2a2420'))
            lantern(-3.5, y, 2.4, 0.2, lamp=14)
    boat(1.5, 8.8, 0.0, 6.6, 2.3, 0.18, '#5a2e20')
    for k in range(3):
        box(1.2 + k * 0.28, 7.2 + k * 0.5, 0.75, 0.5, 0.5, 0.45, mat('crate', '#7a5a34'), k * 0.4)
    for x, y, s in ((-2.8, 5.2, 0.5), (-2.2, 5.6, 0.4)):
        ball((x, y, 0.65), 0.35 * s * 1.4, mat('sack', '#a89a74'), 2, (1, 1, 1.15), 0.08)
    statue(-1.7, 12.4, 0.47, 0.95, 'stand', 0.4)
    person_shadow(-2.2, 7.4, 0.47, 1.0, '#241c28')
    skyline(34, 18, 13, 0.1, ('#6a7478', '#7a7068', '#58606a'), 0.2)
    tower(-9, 31, 7, 1.2, '#6a6870')
    reeds(5.4, 10, 1.4, 5, 150, 1.2, '#5a7040')
    light('SUN', (0, 0, 10), 2.4, '#e0f0e0', rot=(math.radians(55), 0, math.radians(-35)))
    camera((-1.0, -2.0, 2.8), (0.2, 9, 1.4), 31)


def scene_stiva():
    sky([(-0.1, '#060404'), (0.9, '#0a0808')], 0.2)
    wood = mat('hold', '#5a3820', scale=5)
    dark = mat('beam', '#321e12', scale=6)
    box(0, 6, -0.06, 7, 14, 0.1, mat('floor', '#432a18', scale=8))
    for i in range(16):
        box(-3.3 + i * 0.44, 6, 0.001, 0.02, 14, 0.015, dark)
    for y in range(0, 13, 2):
        for s in (-1, 1):
            cyl((s * 3.2, y, 0), (s * 3.0, y, 2.2), 0.16, dark)
            cyl((s * 3.0, y, 2.2), (s * 2.1, y, 3.2), 0.16, dark)
        box(0, y, 3.28, 4.6, 0.24, 0.24, dark)
    for s in (-1, 1):
        for k in range(6):
            box(s * (3.34 - max(0, k - 4) * 0.4), 6, 0.2 + k * 0.45, 0.1, 14, 0.4, wood, ry=-s * max(0, k - 3) * 0.2)
    box(0, 13, 1.7, 7, 0.2, 3.6, wood)
    for x, y, s in ((-2.3, 5, 1.0), (-2.4, 6.3, 0.8), (-1.5, 5.8, 0.6), (2.3, 8, 1.1), (2.2, 9.4, 0.9), (2.4, 8.2, 0.55)):
        box(x, y, s * 0.4 + (0.9 if s < 0.6 else 0), s, s, s * 0.8, mat('crate', '#7a5a34'), rng.uniform(-0.4, 0.4))
    for _ in range(9):
        ball((rng.uniform(1.4, 2.7), rng.uniform(3.4, 5.4), rng.uniform(0.25, 0.4)), 0.34, mat('sack', '#8a7a54'), 2, (1, 1.1, 0.9), 0.1)
    for x, y in ((-2.0, 9.6), (-1.2, 10.4)):
        cyl((x, y, 0), (x, y, 1.1), 0.46, mat('barrel', '#5a3a22'), 0.4, 16)
        for z in (0.2, 0.9):
            cyl((x, y, z), (x, y, z + 0.08), 0.48, mat('hoop', '#2a2624', metal=0.7), n=16)
    # a small figure curled up behind the crates, with a yellow scarf
    skin = mat('skin', '#c89474')
    cyl((0.75, 8.4, 0.05), (0.55, 8.5, 0.65), 0.26, mat('coat', '#2e3a52'), 0.18)
    ball((0.48, 8.42, 0.9), 0.17, skin)
    ball((0.5, 8.5, 0.98), 0.19, mat('hair', '#24160e'), 2, (1, 1, 0.9))
    cyl((0.52, 8.34, 0.68), (0.8, 8.1, 0.3), 0.07, mat('scarf', '#f0c030'), 0.04)
    cyl((0, 6.2, 3.2), (0, 6.2, 2.65), 0.012, mat('iron', '#2a2420'))
    lantern(0, 6.2, 2.45, 0.17, '#ffa840', 4, 320)
    light('AREA', (0, 1.5, 2.8), 90, '#ff9a50', 2.0, (math.radians(55), 0, 0))
    light('AREA', (0.8, 12.4, 2.6), 14, '#6a90c0', 1.2, (math.radians(-60), 0, 0))
    camera((0, -0.7, 1.9), (0.1, 8, 1.25), 28)


def scene_canale():
    sky([(-0.05, '#202428'), (0.0, '#e8d4a8'), (0.25, '#88a8b8'), (0.7, '#3a5880')], 1.1)
    water('#1e4440', y1=80, amp=0.022)
    colours = ['#b85a42', '#d0a060', '#7a8a6a', '#a87488', '#c8b088']
    for i in range(5):
        y = 4.6 + i * 3.9
        house(-5.0, y, 3.8, rng.uniform(4.5, 7), 2.6, colours[i % 5], rz=1.5, lit=0.18)
        house(5.0, y + 1.2, 3.8, rng.uniform(4.2, 6.6), 2.6, colours[(i + 2) % 5], rz=-1.5, lit=0.18)
    for x in (-3.9, 3.9):
        box(x, 13, 0.2, 0.9, 24, 0.55, mat('bank', '#5a504a'))
    for y, z in ((6.4, 3.6), (9.8, 4.3), (13.5, 3.4)):
        cyl((-3.7, y, z), (3.7, y, z - 0.25), 0.014, mat('rope', '#3a2c20'), n=5)
        x = -3.0
        while x < 3.0:
            w = rng.uniform(0.4, 0.8)
            col = rng.choice(['#e8e0cc', '#c04a38', '#e0b040', '#5a7a50', '#f0ece0'])
            h = rng.uniform(0.5, 1.0)
            zz = z - 0.25 * (x + 3.7) / 7.4
            mesh('cloth', [(x, y, zz), (x + w, y, zz - 0.02), (x + w - 0.04, y + rng.uniform(-0.15, 0.15), zz - h), (x + 0.05, y + rng.uniform(-0.1, 0.1), zz - h * 0.94)], [(0, 1, 2, 3)], mat('cloth' + col, col, rough=0.95))
            x += w + rng.uniform(0.15, 0.55)
    statue(-3.75, 6.5, 0.47, 1.05, 'reach', 1.1)
    statue(3.85, 10.2, 0.47, 0.95, 'sit', -1.2)
    boat(1.4, 9.0, 0.0, 3.6, 1.2, 0.5, '#3a3038', False)
    rope_lanterns((-3.4, 17, 4.0), (3.4, 17, 4.0), 6, 0.5, r=0.14, lamp=3)
    skyline(30, 10, 8, 0.1, lit=0.25)
    light('SUN', (0, 0, 10), 3.4, '#ffe0b0', rot=(math.radians(36), 0, math.radians(24)))
    camera((0.1, -1.0, 2.3), (0, 11, 2.2), 30)


def scene_campanile():
    sky([(-0.05, '#1a2424'), (0.0, '#b8c8a8'), (0.15, '#6a8478'), (0.5, '#2a3a48')], 0.85)
    water('#1c3a34', y1=100, amp=0.035)
    tower(-0.6, 14, 6.4, 2.6, '#8a7866', lean=0.13, base=-0.5)
    for k in range(3):
        z = 1.2 + k * 1.5
        box(-0.6 + math.sin(0.13) * z, 12.66, z, 0.5, 0.1, 0.8, mat('hole', '#0c0e10'), ry=0.13)
    for x, y, h in ((-7, 24, 2.4), (6.5, 20, 1.6), (9, 30, 3.0)):
        house(x, y, 2.4, h, 2, '#6a6258', lit=0.05, rz=rng.uniform(-0.3, 0.3), base=-0.7)
    for _ in range(26):
        x, y = rng.uniform(-7, 7), rng.uniform(5, 20)
        box(x, y, 0.0, rng.uniform(0.15, 0.7), rng.uniform(0.05, 0.12), rng.uniform(0.05, 0.12), mat('drift', '#4a3626'), rng.uniform(0, 3), ry=rng.uniform(-0.2, 0.2))
    reeds(-4.4, 7, 1.6, 3, 170, 1.4, '#566a38')
    reeds(4.6, 9, 1.8, 3.5, 190, 1.2, '#667a40')
    reeds(2.4, 4, 0.8, 0.8, 40, 0.8, '#566a38')
    cyl((3.2, 8, -0.2), (2.9, 8, 1.7), 0.08, mat('post', '#3a2a1e'))
    lantern(2.85, 7.95, 1.85, 0.16, '#ffd25a', 3, 14)
    moon(5, 60, 25, 1.7, '#dce8d0', 3)
    for i in range(40):
        light_x = rng.uniform(-9, 9)
        ball((light_x, rng.uniform(8, 30), rng.uniform(0.3, 2.2)), 0.025, mat('firefly', '#c8f080', emit='#c8f080', strength=10, noise=0), 1)
    light('SUN', (0, 0, 10), 2.0, '#c8e0d0', rot=(math.radians(64), 0, math.radians(-40)))
    camera((0.3, -1.5, 2.2), (0, 13, 3.4), 31)


def scene_campo():
    sky([(-0.05, '#0a0c18'), (0.0, '#2a3658'), (0.3, '#121a38'), (0.8, '#060814')], 0.9)
    water('#0e1a2a', y1=110, amp=0.02, rough=0.05)
    ball((0, 7.6, -1.5), 4.8, mat('islet', '#2c3a24', rough=0.95, scale=3), 4, (1, 1, 0.34), 0.03)
    # the fire lantern in the middle
    for a in range(7):
        t = a * 0.9
        cyl((0.65 * math.cos(t), 7 + 0.65 * math.sin(t), 0.14), (0, 7, 0.45), 0.07, mat('log', '#3a2416'))
    for k in range(14):
        ball((rng.uniform(-0.18, 0.18), 7 + rng.uniform(-0.18, 0.18), 0.35 + k * 0.05), 0.17 * (1 - k / 17), mat('flame' + str(k % 3), ['#ff6a18', '#ffb030', '#ffe070'][k % 3], emit=['#ff6a18', '#ffb030', '#ffe070'][k % 3], strength=2.4, noise=0), 1, (0.7, 0.7, 1.4), 0.3)
    light('POINT', (0, 6.5, 0.9), 170, '#ff9434', 0.3)
    for x, s in ((-2.6, 1.0), (2.8, 0.85)):
        mesh('tent', [(x - 1.0 * s, 8.6, 0.05), (x + 1.0 * s, 8.6, 0.05), (x + 1.0 * s, 10.2, 0.05), (x - 1.0 * s, 10.2, 0.05), (x, 8.6, 1.5 * s), (x, 10.2, 1.5 * s)], [(1, 2, 5, 4), (3, 0, 4, 5), (2, 3, 5)], mat('tent', '#8a7456', rough=0.95))
        box(x, 8.9, 0.45 * s, 0.5, 0.05, 0.8 * s, mat('tentdoor', '#171008'))
    person_shadow(-1.35, 6.3, 0.0, 0.8, '#241a24')
    person_shadow(1.45, 7.2, 0.0, 0.9, '#1c1a28')
    ball((0.9, 5.9, 0.28), 0.3, mat('dog', '#100e14'), 2, (1.5, 0.9, 0.8))
    ball((0.42, 5.75, 0.5), 0.17, mat('dog', '#100e14'))
    willow(-4.8, 11, 0.85, '#34503a', strands=60)
    boat(5.2, 6.4, -0.1, 3.8, 1.2, 0.7, '#2a1c18', False)
    reeds(-3.8, 4.6, 1.0, 1.2, 70, 0.8, '#26381e')
    reeds(3.9, 4.8, 0.9, 1.2, 60, 0.7, '#26381e')
    stars(240)
    moon(-9, 62, 30, 1.4, '#e8eeff', 5)
    for x, y in ((-12, 34), (8, 40), (15, 28)):
        lantern(x, y, 0.3, 0.22, '#ffb45a', 4, 0)
    light('SUN', (0, 0, 10), 0.35, '#8aa8ff', rot=(math.radians(45), 0, math.radians(35)))
    camera((0, -1.0, 2.3), (0, 8, 1.7), 32)


def scene_secche():
    sky([(-0.05, '#202c20'), (0.0, '#d8e0b8'), (0.2, '#90a888'), (0.7, '#485868')], 1.0)
    water('#34503a', y1=90, amp=0.012, rough=0.06)
    willow(-4.2, 9, 1.35, '#78943c', strands=170)
    willow(4.6, 12, 1.5, '#8a9c3c', strands=170)
    willow(-1.8, 21, 1.1, '#9aa84a', strands=100)
    willow(8.5, 24, 1.2, '#7a8c48', strands=80)
    willow(-9, 22, 1.3, '#6a8440', strands=80)
    for _ in range(14):
        x, y = rng.uniform(-6, 6), rng.uniform(4, 22)
        ball((x, y, -0.08), rng.uniform(0.3, 1.1), mat('shoal', '#8a8a5a', rough=0.95), 3, (1.4, 1.0, 0.2), 0.05)
    reeds(-3.6, 4.8, 1.0, 1.6, 130, 1.1, '#7a8e3a')
    reeds(3.4, 5.6, 1.2, 2.0, 150, 1.0, '#8a9a42')
    reeds(0, 18, 5, 3, 200, 0.8, '#6a7e3c')
    statue(1.3, 12.5, 0.02, 1.0, 'reach', -0.3)
    for _ in range(60):
        ball((rng.uniform(-7, 7), rng.uniform(5, 28), rng.uniform(0.2, 3.5)), 0.02, mat('mote', '#e8ffa0', emit='#e8ffa0', strength=8, noise=0), 1)
    light('SUN', (0, 0, 10), 3.0, '#f4ffc8', rot=(math.radians(62), 0, math.radians(28)))
    camera((0.0, -1.2, 2.0), (0, 12, 2.3), 29)


def scene_cervo():
    sky([(-0.05, '#041008'), (0.0, '#2e6a4a'), (0.2, '#12382e'), (0.7, '#040c14')], 0.9)
    water('#0c2c20', y1=100, amp=0.016, rough=0.04)
    glass = mat('shard', '#4ce08a', rough=0.08, trans=0.85, emit='#1a8a50', strength=0.8, noise=0)
    for _ in range(80):
        side = rng.choice([-1, 1])
        x = side * rng.uniform(2.3, 9)
        y = rng.uniform(5, 28)
        h = rng.uniform(0.5, 3.4) * (0.5 + abs(x) / 8)
        cyl((x, y, -0.2), (x + rng.uniform(-0.6, 0.6), y + rng.uniform(-0.4, 0.4), h), rng.uniform(0.06, 0.28), glass, 0.002, 5, False)
    for x, y, s in ((-6.5, 17, 1.2), (6.8, 19, 1.3)):
        willow(x, y, s, '#2c5a38', '#0e120e', 50)
    ball((0, 14, -0.7), 3.8, mat('mound', '#14261a', rough=0.95), 4, (1.4, 1, 0.28), 0.04)
    reeds(-3.6, 8, 1.2, 2.5, 100, 1.1, '#1e4a2a')
    reeds(3.7, 9, 1.2, 2.5, 100, 1.0, '#1e4a2a')
    moon(0, 55, 17, 4.4, '#c8ffd8', 1.8)
    for _ in range(70):
        ball((rng.uniform(-8, 8), rng.uniform(6, 30), rng.uniform(0.2, 6)), 0.03, mat('spark', '#a0ffc0', emit='#a0ffc0', strength=12, noise=0), 1)
    light('POINT', (0, 13, 3.2), 150, '#60ffa0', 1.0)
    light('SUN', (0, 0, 10), 0.8, '#a0ffd0', rot=(math.radians(58), 0, math.radians(180 - 25)))
    camera((0, -1.5, 2.1), (0, 14, 3.0), 30)


SCENES = {
    'titolo': scene_titolo, 'forno': scene_forno, 'ponte': scene_ponte, 'darsena': scene_darsena,
    'stiva': scene_stiva, 'canale': scene_canale, 'campanile': scene_campanile, 'campo': scene_campo,
    'secche': scene_secche, 'cervo': scene_cervo,
}

# ------------------------------------------------------------ the painter

def box_mean(a, r):
    """Mean over a (r+1)×(r+1) window ending at each pixel, via summed-area tables."""
    k = r + 1
    p = np.pad(a, ((k, 0), (k, 0)) + ((0, 0),) * (a.ndim - 2), mode='edge').astype(np.float64)
    s = p.cumsum(0).cumsum(1)
    return (s[k:, k:] - s[:-k, k:] - s[k:, :-k] + s[:-k, :-k]) / (k * k)


def kuwahara(img, r):
    """Each pixel takes the mean of its calmest neighbouring quadrant: brush strokes."""
    lum = img @ np.array([0.299, 0.587, 0.114])
    mean = box_mean(img, r)
    var = box_mean(lum ** 2, r) - box_mean(lum, r) ** 2
    best = None
    best_var = None
    h, w = lum.shape
    for dy in (0, r):
        for dx in (0, r):
            ys = np.minimum(np.arange(h) + dy, h - 1)
            xs = np.minimum(np.arange(w) + dx, w - 1)
            m = mean[ys][:, xs]
            v = var[ys][:, xs]
            if best is None:
                best, best_var = m, v
            else:
                take = v < best_var
                best = np.where(take[..., None], m, best)
                best_var = np.where(take, v, best_var)
    return best


def value_noise(h, w, cell, seed):
    g = np.random.default_rng(seed).random((h // cell + 3, w // cell + 3))
    y = np.arange(h) / cell
    x = np.arange(w) / cell
    yi, xi = y.astype(int), x.astype(int)
    fy, fx = (y - yi)[:, None], (x - xi)[None, :]
    fy, fx = fy * fy * (3 - 2 * fy), fx * fx * (3 - 2 * fx)
    a, b = g[yi][:, xi], g[yi][:, xi + 1]
    c, d = g[yi + 1][:, xi], g[yi + 1][:, xi + 1]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def paint(path, seed, border=True, brush=None, wobble=1.0):
    src = bpy.data.images.load(path, check_existing=False)
    w, h = src.size
    px = np.empty(w * h * 4, dtype=np.float32)
    src.pixels.foreach_get(px)
    img = px.reshape(h, w, 4)[..., :3].astype(np.float64)
    r = brush or max(2, int(round(4 * w / 900)))
    # wet edges: displace the picture a little with slow noise
    dx = ((value_noise(h, w, 9, seed) - 0.5) * 5 + (value_noise(h, w, 31, seed + 1) - 0.5) * 6).astype(int)
    dy = ((value_noise(h, w, 9, seed + 2) - 0.5) * 5 + (value_noise(h, w, 31, seed + 3) - 0.5) * 6).astype(int)
    yy, xx = np.mgrid[0:h, 0:w]
    dx = (dx * wobble).astype(int)
    dy = (dy * wobble).astype(int)
    img = img[np.clip(yy + dy, 0, h - 1), np.clip(xx + dx, 0, w - 1)]
    soft = kuwahara(img, r)
    lum = soft @ np.array([0.299, 0.587, 0.114])
    # charcoal: dark strokes where the painted shapes meet
    gy, gx = np.gradient(lum)
    edge = np.clip((np.hypot(gx, gy) - 0.018) * 9, 0, 1)
    grit = 0.55 + 0.9 * value_noise(h, w, 2, seed + 4)
    out = soft * (1 - 0.55 * (edge * grit)[..., None])
    # pigment pools unevenly
    pool = value_noise(h, w, 90, seed + 5) * 0.6 + value_noise(h, w, 24, seed + 6) * 0.4
    out = out * (0.9 + 0.22 * pool)[..., None]
    # a touch more saturation, then paper
    g = (out @ np.array([0.299, 0.587, 0.114]))[..., None]
    out = g + (out - g) * 1.14
    grain = value_noise(h, w, 2, seed + 7) * 0.6 + value_noise(h, w, 5, seed + 8) * 0.4
    out = out * (0.93 + 0.13 * grain)[..., None]
    paper = np.array([0.93, 0.89, 0.80])
    nx = (xx / (w - 1)) * 2 - 1
    ny = (yy / (h - 1)) * 2 - 1
    ragged = (value_noise(h, w, 46, seed + 9) - 0.5) * 0.09 + (value_noise(h, w, 11, seed + 10) - 0.5) * 0.035
    edge_dist = np.maximum(np.abs(nx) ** 1.0, np.abs(ny) ** 1.0) + ragged
    bleed = np.clip((edge_dist - 0.975) / 0.026, 0, 1)[..., None]
    if border:
        out = out * (1 - bleed) + paper * bleed
    out = np.clip(out, 0, 1)
    rgba = np.ones((h, w, 4), dtype=np.float32)
    rgba[..., :3] = out
    src.pixels.foreach_set(rgba.ravel())
    src.filepath_raw = path
    src.file_format = 'PNG'
    src.save()


def main():
    for i, (name, build) in enumerate(SCENES.items()):
        if ONLY and name not in ONLY:
            continue
        sc = reset(100 + i)
        build()
        path = os.path.join(OUT, name + '.png')
        sc.render.filepath = path
        bpy.ops.render.render(write_still=True)
        paint(path, 500 + i * 13)
        print('PAINTED', name, flush=True)


if __name__ == '__main__':
    main()
