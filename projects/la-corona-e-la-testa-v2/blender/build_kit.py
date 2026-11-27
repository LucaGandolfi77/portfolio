"""
Builds blender/kit.raw.glb (packed by npm run kit into public/models/kit.glb): the sculpted parts of the actors and the carved
pieces of the sets, with ambient occlusion baked in Cycles into the vertex
colours. Run it headless from the project folder:

    blender -b --factory-startup --python blender/build_kit.py

Everything is generated from code, so the result is the same on every run.
Shapes are written in the film's own frame (x right, y up, z towards the
camera); the export turns them into glTF's Y-up axes.

Each mesh keeps the local frame of the part it replaces in figure.ts / kit.ts:
  head     centre of the skull, face towards +z, radii about .108/.125/.112
  hand     wrist at the origin, fingers towards -y, palm towards -x (left
           side of the screen gets a mirrored copy in three.js)
  foot     centre of the old shoe box, toes towards +z
  torso    lathe of figure.ts TORSO, y 0..0.56, before the build scale
  skirt_K  robe from the waist, length K (0.5, 0.75, 1.0)
  cape     the old CAPE cylinder, folds added
  col_base / col_shaft / col_cap   a column of radius 1: base y 0..0.45,
           shaft unit height, capital hanging below y=0
  throne_gold / throne_cloth, amphora, brazier
"""
import bpy
import bmesh
import math
import os
import sys

OUT = os.path.join(os.getcwd(), 'blender', 'kit.raw.glb')
TAU = math.pi * 2


def gauss(d, s):
    return math.exp(-(d * d) / (2 * s * s))


def smooth(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def catmull(points, n):
    """Smooth a polyline profile [(r, y)] into n points."""
    out = []
    pts = [points[0]] + list(points) + [points[-1]]
    segs = len(points) - 1
    for i in range(n):
        f = i / (n - 1) * segs
        k = min(int(f), segs - 1)
        t = f - k
        p0, p1, p2, p3 = pts[k], pts[k + 1], pts[k + 2], pts[k + 3]
        def c(a, b, cc, d):
            return 0.5 * ((2 * b) + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t * t + (-a + 3 * b - 3 * cc + d) * t * t * t)
        out.append((c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])))
    return out


# ---------------------------------------------------------------- mesh kit

class Part:
    """A mesh being assembled from parametric grids, in film coordinates."""

    def __init__(self):
        self.v = []
        self.uv = []
        self.f = []

    def grid(self, nu, nv, fn, wrap_u=False, cap=False):
        """fn(u, v) -> (x, y, z) with u, v in 0..1. Faces have per-corner UVs."""
        base = len(self.v)
        cols = nu if wrap_u else nu + 1
        for j in range(nv + 1):
            for i in range(cols):
                self.v.append(fn(i / nu, j / nv))
        for j in range(nv):
            for i in range(nu):
                i1 = (i + 1) % cols if wrap_u else i + 1
                a = base + j * cols + i
                b = base + j * cols + i1
                c = base + (j + 1) * cols + i1
                d = base + (j + 1) * cols + i
                uvs = [(i / nu, 1 - j / nv), ((i + 1) / nu, 1 - j / nv), ((i + 1) / nu, 1 - (j + 1) / nv), (i / nu, 1 - (j + 1) / nv)]
                self.f.append(((a, b, c, d), uvs))
        return self

    def ellipsoid(self, c, r, nu=24, nv=16, deform=None, e=1.0):
        """A (super)ellipsoid: e < 1 makes it boxier."""
        def fn(u, v):
            th = u * TAU
            ph = v * math.pi
            def sp(x, p):
                return math.copysign(abs(x) ** p, x)
            sx = sp(math.sin(ph), e) * sp(math.sin(th), e)
            sy = sp(math.cos(ph), e)
            sz = sp(math.sin(ph), e) * sp(math.cos(th), e)
            p = [c[0] + r[0] * sx, c[1] + r[1] * sy, c[2] + r[2] * sz]
            if deform:
                p = deform(p, u, v)
            return tuple(p)
        return self.grid(nu, nv, fn, wrap_u=True)

    def lathe(self, profile, nu=48, deform=None, theta0=0.0, span=TAU):
        """profile [(r, y)] from top to bottom, revolved around y; theta 0 = +z."""
        n = len(profile) - 1
        wrap = abs(span - TAU) < 1e-6
        def fn(u, v):
            r, y = profile[round(v * n)]
            th = theta0 + u * span
            p = [r * math.sin(th), y, r * math.cos(th)]
            if deform:
                p = deform(p, th, r, y)
            return tuple(p)
        return self.grid(nu, n, fn, wrap_u=wrap)

    def tube(self, path, radius, nu=16, nv=12, flat=1.0, caps=True, ripple=None):
        """Sweep a circle along path(t)->(x,y,z), radius(t). Ends are closed with
        shrinking rings so the tube reads as a rounded finger or a handle."""
        def frame(t):
            e = 1e-3
            a = path(max(0.0, t - e))
            b = path(min(1.0, t + e))
            d = [b[i] - a[i] for i in range(3)]
            L = math.sqrt(sum(x * x for x in d)) or 1.0
            d = [x / L for x in d]
            ref = [0.0, 0.0, 1.0] if abs(d[2]) < 0.9 else [1.0, 0.0, 0.0]
            n1 = [d[1] * ref[2] - d[2] * ref[1], d[2] * ref[0] - d[0] * ref[2], d[0] * ref[1] - d[1] * ref[0]]
            l1 = math.sqrt(sum(x * x for x in n1)) or 1.0
            n1 = [x / l1 for x in n1]
            n2 = [d[1] * n1[2] - d[2] * n1[1], d[2] * n1[0] - d[0] * n1[2], d[0] * n1[1] - d[1] * n1[0]]
            return n1, n2
        def fn(u, v):
            # v runs along the tube; the first and last 15% round off the ends.
            if caps:
                if v < 0.15:
                    t = 0.0
                    k = math.sin(v / 0.15 * math.pi / 2)
                    back = (1 - math.cos((0.15 - v) / 0.15 * math.pi / 2))
                elif v > 0.85:
                    t = 1.0
                    k = math.sin((1 - v) / 0.15 * math.pi / 2)
                    back = -(1 - math.cos((v - 0.85) / 0.15 * math.pi / 2))
                else:
                    t = (v - 0.15) / 0.7
                    k = 1.0
                    back = 0.0
            else:
                t, k, back = v, 1.0, 0.0
            c = path(t)
            n1, n2 = frame(t)
            e = 1e-3
            a = path(max(0.0, t - e)); b = path(min(1.0, t + e))
            d = [b[i] - a[i] for i in range(3)]
            L = math.sqrt(sum(x * x for x in d)) or 1.0
            d = [x / L for x in d]
            ph = u * TAU
            r = radius(t) * (ripple(t, ph) if ripple else 1.0)
            return tuple(c[i] + r * k * (math.cos(ph) * n1[i] * flat + math.sin(ph) * n2[i]) - d[i] * back * r for i in range(3))
        return self.grid(nu, nv, fn, wrap_u=True)

    def build(self, name, smooth_shade=True, weld=True):
        me = bpy.data.meshes.new(name)
        bm = bmesh.new()
        verts = [bm.verts.new((x, -z, y)) for (x, y, z) in self.v]  # film -> Blender Z-up
        bm.verts.ensure_lookup_table()
        uvl = bm.loops.layers.uv.new('UVMap')
        for (idx, uvs) in self.f:
            vs = [verts[i] for i in idx]
            # Drop degenerate corners (poles of spheres).
            keep = []
            kuv = []
            for vv, uu in zip(vs, uvs):
                if not keep or (keep[-1].co - vv.co).length > 1e-7:
                    keep.append(vv)
                    kuv.append(uu)
            if len(keep) > 2 and (keep[0].co - keep[-1].co).length < 1e-7:
                keep.pop()
                kuv.pop()
            if len(set(keep)) < 3:
                continue
            try:
                face = bm.faces.new(keep)
            except ValueError:
                continue
            for loop, uu in zip(face.loops, kuv):
                loop[uvl].uv = uu
        if weld:
            bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
        bm.normal_update()
        bm.to_mesh(me)
        bm.free()
        ob = bpy.data.objects.new(name, me)
        bpy.context.scene.collection.objects.link(ob)
        if smooth_shade:
            for p in me.polygons:
                p.use_smooth = True
        # Faces were wound for a right-handed film frame; make them face out.
        bpy.context.view_layer.objects.active = ob
        ob.select_set(True)
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.normals_make_consistent(inside=False)
        bpy.ops.object.mode_set(mode='OBJECT')
        ob.select_set(False)
        return ob


def subsurf(ob, levels=1):
    m = ob.modifiers.new('sub', 'SUBSURF')
    m.levels = levels
    m.render_levels = levels
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.modifier_apply(modifier=m.name)


# ---------------------------------------------------------------- actors

def head():
    a, b, c = 0.108, 0.125, 0.112

    def deform(p, u, v):
        x, y, z = p
        front = max(0.0, z / c)
        # Jaw narrows towards the chin; the skull is longer at the back.
        x *= 1 - 0.24 * smooth(-0.02, -0.12, y)
        if z < 0:
            z *= 1.06 - 0.06 * smooth(0.0, -0.1, y)
        # Chin and muzzle forward, temples in.
        z += front * (0.007 * gauss(y + 0.1, 0.018) * gauss(x, 0.03) + 0.005 * gauss(y + 0.055, 0.022) * gauss(x, 0.035))
        x -= math.copysign(0.004, x) * gauss(y - 0.04, 0.025) * gauss(z - 0.03, 0.04)
        # Cheekbones.
        for s in (1, -1):
            d = math.sqrt((x - 0.062 * s) ** 2 + (y + 0.008) ** 2 + (z - 0.08) ** 2)
            k = 0.006 * gauss(d, 0.02)
            x += k * s * 0.6
            z += k * 0.6
        # Eye sockets and brow ridge.
        for s in (1, -1):
            z -= front * 0.006 * gauss(x - 0.038 * s, 0.017) * gauss(y - 0.018, 0.013)
        z += front * 0.006 * gauss(y - 0.047, 0.009) * smooth(0.075, 0.03, abs(x))
        # Nose: a bridge growing into a tip with nostrils.
        t = smooth(0.032, -0.03, y)
        wid = 0.008 + 0.005 * t
        tip = gauss(y + 0.03, 0.007)
        prof = (0.002 + 0.012 * t) * smooth(-0.042, -0.032, y)
        z += front * prof * gauss(x, wid) + front * 0.003 * tip * gauss(abs(x) - 0.008, 0.005)
        # Upper and lower lip, a little forward of the mouth line.
        z += front * gauss(x, 0.022) * (0.003 * gauss(y + 0.05, 0.005) + 0.0035 * gauss(y + 0.066, 0.006))
        return [x, y, z]

    p = Part().ellipsoid((0, 0, 0), (a, b, c), nu=64, nv=48, deform=deform)
    # Ears: shells with a rim, slightly behind the middle of the head.
    for s in (1, -1):
        def ear(q, u, v, s=s):
            x, y, z = q
            # Hollow on the outside, rim around it.
            k = math.sin(v * math.pi)
            inner = 0.006 * k * gauss(u - 0.25 if s > 0 else u - 0.75, 0.16)
            return [x - inner * s, y, z]
        p.ellipsoid((0.104 * s, -0.004, -0.012), (0.014, 0.031, 0.02), nu=20, nv=14, deform=ear)
    return p.build('head')


def hand():
    """Palm, four curled fingers and the thumb, as one soft hand."""
    p = Part()
    p.ellipsoid((0, -0.04, 0.0), (0.016, 0.042, 0.04), nu=28, nv=18, e=0.6,
                deform=lambda q, u, v: [q[0] * (1 - 0.2 * smooth(-0.01, -0.08, q[1])), q[1], q[2] * (1 - 0.06 * smooth(-0.02, -0.08, q[1]))])
    # Thenar pad under the thumb.
    p.ellipsoid((-0.006, -0.028, 0.024), (0.014, 0.026, 0.016), nu=16, nv=10)
    for k, (zz, ln) in enumerate([(0.026, 0.06), (0.009, 0.068), (-0.008, 0.064), (-0.024, 0.05)]):
        curl = 0.55 + 0.08 * k
        r0 = 0.0095 - 0.0006 * abs(k - 1.2)
        def path(t, zz=zz, ln=ln, curl=curl):
            a = curl * t
            # bend towards the palm (-x) as the finger goes down
            return (-ln * (1 - math.cos(a)) / max(curl, 1e-3) * 0.9, -0.072 - ln * math.sin(a) / max(curl, 1e-3), zz * (1 - 0.15 * t))
        p.tube(path, lambda t, r0=r0: r0 * (1 - 0.22 * t), nu=12, nv=14, flat=0.85)
    def thumb(t):
        return (-0.006 - 0.018 * t * t, -0.035 - 0.045 * t, 0.034 + 0.016 * t - 0.012 * t * t)
    p.tube(thumb, lambda t: 0.0115 * (1 - 0.2 * t), nu=12, nv=12)
    p.ellipsoid((0, 0.004, 0), (0.019, 0.022, 0.032), nu=16, nv=10)
    return p.build('hand')


def foot():
    """A closed sandal shoe: sole flat, toes rounded, centre at the old box."""
    def deform(q, u, v):
        x, y, z = q
        front = smooth(-0.06, 0.09, z)
        y = max(y, -0.028)
        y -= 0.012 * front * max(0.0, y + 0.028) / 0.058  # lower at the toes
        x *= 1 + 0.12 * gauss(z - 0.04, 0.05) - 0.18 * smooth(0.06, 0.1, z)
        return [x, y, z]
    p = Part().ellipsoid((0, 0.0, 0.0), (0.045, 0.034, 0.104), nu=28, nv=16, e=0.75, deform=deform)
    # Sole.
    p.ellipsoid((0, -0.03, 0.002), (0.047, 0.006, 0.106), nu=28, nv=6, e=0.4)
    return p.build('foot')


def sleeve():
    """Upper arm in a tunic sleeve: round over the shoulder, a little flared at
    the elbow, with soft folds. Shoulder joint at the origin, elbow at y=-0.29."""
    p = Part()
    p.tube(lambda t: (-0.012 * (1 - t), -0.03 - t * 0.27, 0.0), lambda t: 0.05 - 0.004 * t + 0.014 * smooth(0.55, 1.0, t),
           nu=28, nv=26, ripple=lambda t, ph: 1 + 0.06 * smooth(0.3, 1.0, t) * math.sin(ph * 5 + 2.0 * t))
    return p.build('sleeve')


def forearm():
    """Forearm from the elbow (origin) to the wrist at y=-0.27."""
    p = Part()
    p.tube(lambda t: (0.0, 0.03 - t * 0.29, 0.004 * math.sin(t * math.pi)), lambda t: 0.047 - 0.011 * t + 0.004 * math.sin(t * math.pi * 1.4),
           nu=24, nv=22, flat=0.88)
    return p.build('forearm')


# Wider, rounder shoulders than figure.ts, so the sleeves sit inside them.
TORSO = [(0.05, 0.575), (0.09, 0.56), (0.17, 0.53), (0.205, 0.48), (0.2, 0.4), (0.19, 0.32), (0.175, 0.2), (0.155, 0.08), (0.13, 0.0)]


def torso():
    prof = catmull(TORSO, 34)

    def deform(p, th, r, y):
        front = math.cos(th)
        k = 1.0
        # Chest, shoulder blades and a softer waist.
        k += 0.05 * max(0.0, front) * gauss(y - 0.38, 0.06) * (gauss(th - 0.5, 0.35) + gauss(th + 0.5, 0.35))
        k += 0.035 * max(0.0, -front) * gauss(y - 0.4, 0.06) * (gauss(abs(th) - 2.55, 0.35))
        # Drapery: soft vertical folds below the chest, deeper near the belt.
        fold = math.sin(th * 7 + 1.3 * math.sin(th * 3)) + 0.4 * math.sin(th * 13 + 0.7)
        k += 0.022 * fold * smooth(0.36, 0.08, y)
        # A diagonal fold across the front.
        k += 0.012 * max(0.0, front) * math.sin((y * 22 + th * 2.5)) * smooth(0.45, 0.2, y)
        return [p[0] * k, p[1], p[2] * k]

    return Part().lathe(prof, nu=72, deform=deform).build('torso')


def skirt(k):
    h = 0.93 * k
    base = [(0.0, 0.12), (0.15, 0.12), (0.165, 0.02), (0.2, -h * 0.3), (0.245, -h * 0.7), (0.27 + k * 0.03, -h), (0.2, -h - 0.005)]
    prof = catmull(base[1:6], 30)
    prof = [base[0]] + prof + [base[6]]
    hem = -h

    def deform(p, th, r, y):
        t = smooth(0.02, hem, y)
        fold = math.sin(th * 10 + 0.8 * math.sin(th * 3)) + 0.45 * math.sin(th * 17 + 2.0)
        kk = 1 + 0.12 * k * (t ** 1.3) * fold / 1.45
        yy = y + (0.012 * fold * t ** 3 if y > hem - 0.001 else 0.0)
        return [p[0] * kk, yy, p[2] * kk]

    return Part().lathe(prof, nu=96, deform=deform).build('skirt_%d' % round(k * 100))


def cape():
    t0 = math.pi - 1.35
    span = 2.7

    def fn(u, v):
        th = t0 + u * span
        y = 0.005 - v * 1.25
        r = 0.2 + (0.42 - 0.2) * v
        fold = math.sin(u * span * 9 + 1.1 * math.sin(u * 7)) + 0.4 * math.sin(u * span * 15)
        r *= 1 + 0.1 * (v ** 1.2) * fold
        y += 0.02 * v ** 3 * fold
        return (r * math.sin(th), y, r * math.cos(th) - 0.02)

    return Part().grid(64, 28, fn).build('cape')


# ---------------------------------------------------------------- sets

def column_parts():
    # Attic base above the square plinth: torus, scotia, torus, fillet.
    base = catmull([(0.92, 0.45), (1.0, 0.43), (1.06, 0.38), (1.02, 0.33), (0.96, 0.27), (1.04, 0.2), (1.16, 0.12), (1.14, 0.04), (1.1, 0.0)], 30)
    Part().lathe(base, nu=48).build('col_base')

    flutes = 24

    def shaft(u, v):
        th = u * TAU
        R = 1.0 - 0.12 * v + 0.025 * math.sin(v * math.pi)  # taper with a slight entasis
        f = (th * flutes / TAU) % 1.0
        fade = smooth(0.0, 0.04, v) * smooth(1.0, 0.96, v)
        depth = 0.075 * fade * math.sqrt(max(0.0, math.sin(math.pi * min(1.0, f / 0.86))))
        r = R * (1 - depth)
        return (r * math.sin(th), v, r * math.cos(th))
    Part().grid(flutes * 6, 8, shaft, wrap_u=True).build('col_shaft')

    # Capital (y from -1.1 at the neck to 0 at the top): an astragal bead,
    # the neck, an echinus carved with eggs and darts, and a moulded abacus.
    eggs = 16

    def cap(u, v):
        th = u * TAU
        y = -1.1 + v * 0.76
        r = 0.9
        r += 0.07 * gauss(y + 1.05, 0.025)                     # astragal
        t = smooth(-0.78, -0.36, y)
        r += 0.42 * (t ** 1.6)                                  # echinus flare
        band = gauss(y + 0.52, 0.06)
        ph = ((th / TAU) * eggs) % 1.0
        egg = math.sin(math.pi * ph) ** 2
        dart = gauss(ph, 0.04) + gauss(ph - 1.0, 0.04)
        r += band * (0.06 * egg - 0.04 * dart)
        r += 0.04 * gauss(y + 0.4, 0.015)                       # fillet under the abacus
        return (r * math.sin(th), y, r * math.cos(th))
    p = Part().grid(eggs * 10, 40, cap, wrap_u=True)
    p.ellipsoid((0, -0.2, 0), (1.42, 0.16, 1.42), nu=48, nv=12, e=0.18)
    p.ellipsoid((0, -0.05, 0), (1.36, 0.05, 1.36), nu=48, nv=8, e=0.22)
    p.build('col_cap')


def throne():
    gold = Part()
    cloth = Part()
    # Seat block with a moulded top edge.
    gold.ellipsoid((0, 0.27, 0), (0.55, 0.25, 0.4), nu=32, nv=16, e=0.25)
    gold.ellipsoid((0, 0.5, 0.0), (0.57, 0.035, 0.42), nu=32, nv=8, e=0.3)
    # Lion paws at the corners.
    for sx in (1, -1):
        for sz in (1, -1):
            gold.ellipsoid((0.5 * sx, 0.05, 0.36 * sz + 0.04), (0.08, 0.06, 0.1), nu=16, nv=10)
            for t in (-1, 0, 1):
                gold.ellipsoid((0.5 * sx + 0.035 * t, 0.03, 0.36 * sz + 0.12), (0.022, 0.025, 0.035), nu=10, nv=6)
    # Back: a panel with an arched top and a raised frame.
    def back(u, v, inset=0.0, zoff=0.0):
        x = (u - 0.5) * (1.1 - inset)
        top = 1.62 + 0.24 * math.sqrt(max(0.0, 1 - (2 * x / (1.1 - inset)) ** 2)) - inset * 0.6
        y = 0.5 + v * (top - 0.5)
        return (x, y, zoff)
    gold.grid(24, 16, lambda u, v: back(u, v, 0.0, -0.29))
    gold.grid(24, 16, lambda u, v: (lambda p: (p[0], p[1], -0.43))(back(1 - u, v, 0.0, 0.0)))
    # Frame mouldings along the arch.
    def rim(u, v, z):
        a = math.pi * u
        rx, ry = 0.56, 0.25
        cx, cy = 0.0, 1.62
        r = 0.035
        px = cx - math.cos(a) * rx
        py = cy + math.sin(a) * ry
        phi = v * TAU
        return (px + math.cos(phi) * r * math.cos(a) * -1, py + math.cos(phi) * r * math.sin(a), z + math.sin(phi) * r)
    gold.grid(40, 10, lambda u, v: rim(u, v, -0.28), wrap_u=False)
    for sx in (1, -1):
        gold.ellipsoid((0.56 * sx, 1.06, -0.3), (0.045, 0.56, 0.06), nu=12, nv=12)
    # Finial: a pine cone on a ball.
    gold.ellipsoid((0, 1.9, -0.32), (0.08, 0.08, 0.08), nu=16, nv=10)
    gold.ellipsoid((0, 2.02, -0.32), (0.05, 0.08, 0.05), nu=16, nv=10,
                   deform=lambda q, u, v: [q[0] * (1 + 0.15 * math.sin(v * 30)), q[1], q[2] * (1 + 0.15 * math.sin(v * 30))])
    # Arms ending in scrolls and lion heads.
    for sx in (1, -1):
        gold.ellipsoid((0.52 * sx, 0.7, -0.02), (0.065, 0.06, 0.36), nu=16, nv=10, e=0.6)
        gold.ellipsoid((0.52 * sx, 0.58, 0.28), (0.05, 0.14, 0.05), nu=12, nv=10)
        gold.ellipsoid((0.52 * sx, 0.8, 0.33), (0.07, 0.075, 0.08), nu=16, nv=12)
        gold.ellipsoid((0.52 * sx, 0.79, 0.41), (0.035, 0.03, 0.03), nu=10, nv=8)
    gold.build('throne_gold')
    # Cushions, soft and slightly pressed.
    cloth.ellipsoid((0, 0.57, 0.03), (0.48, 0.06, 0.36), nu=28, nv=12, e=0.45,
                    deform=lambda q, u, v: [q[0], q[1] - 0.02 * gauss(q[0], 0.25) * gauss(q[2], 0.2) * (1 if q[1] > 0.57 else 0), q[2]])
    cloth.grid(20, 16, lambda u, v: (lambda p: (p[0] * 0.8, 0.62 + (p[1] - 0.5) * 0.85, -0.26 + 0.03 * math.sin(math.pi * u) * math.sin(math.pi * v)))(back(u, v, 0.2, 0.0)))
    cloth.build('throne_cloth')


def amphora():
    prof = catmull([(0.0, 0.0), (0.05, 0.02), (0.17, 0.25), (0.2, 0.45), (0.16, 0.62), (0.06, 0.72), (0.05, 0.85), (0.075, 0.88), (0.06, 0.9), (0.0, 0.89)], 40)
    prof = list(reversed(prof))
    p = Part().lathe(prof, nu=40, deform=lambda q, th, r, y: [q[0] * (1 + 0.006 * math.sin(y * 90)), q[1], q[2] * (1 + 0.006 * math.sin(y * 90))])
    for s in (1, -1):
        def handle(u, v, s=s):
            a = math.pi * 0.15 + u * math.pi * 0.75
            cx, cy = 0.06 * s, 0.74
            px = cx + math.cos(a) * 0.1 * s
            py = cy + math.sin(a) * 0.12 - 0.02
            phi = v * TAU
            tube = 0.016
            return (px + math.cos(phi) * tube * math.cos(a) * s, py + math.cos(phi) * tube * math.sin(a), math.sin(phi) * tube * 1.6)
        p.grid(24, 8, handle)
    return p.build('amphora')


def brazier():
    p = Part()
    for i in range(3):
        a = i / 3 * TAU
        def leg(u, v, a=a):
            # A curved leg with a paw at the bottom.
            y = 1.05 - u * 1.05
            out = 0.16 + 0.1 * math.sin(u * math.pi * 0.9)
            r = 0.022 + 0.008 * math.sin(u * math.pi)
            phi = v * TAU
            cx, cz = math.cos(a) * out, math.sin(a) * out
            return (cx + math.cos(phi) * r, y, cz + math.sin(phi) * r)
        p.grid(20, 10, leg)
        p.ellipsoid((math.cos(a) * 0.17, 0.03, math.sin(a) * 0.17), (0.045, 0.035, 0.045), nu=12, nv=8)
    p.lathe(list(reversed(catmull([(0.0, 0.99), (0.08, 1.0), (0.3, 1.12), (0.37, 1.22), (0.39, 1.25), (0.35, 1.25), (0.3, 1.16), (0.05, 1.08)], 24))), nu=48)
    p.lathe([(0.11, 0.55), (0.12, 0.53), (0.11, 0.51)], nu=24)
    return p.build('brazier')


# ---------------------------------------------------------------- bake + export

def bake_ao(ob, distance):
    sc = bpy.context.scene
    me = ob.data
    attr = me.color_attributes.new('AO', 'BYTE_COLOR', 'POINT')
    me.color_attributes.active_color = attr
    if not me.materials:
        m = bpy.data.materials.get('bake') or bpy.data.materials.new('bake')
        me.materials.append(m)
    for o in sc.objects:
        o.hide_render = o is not ob
        o.select_set(o is ob)
    bpy.context.view_layer.objects.active = ob
    sc.world.light_settings.distance = distance
    bpy.ops.object.bake(type='AO', target='VERTEX_COLORS')


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 96
    if not sc.world:
        sc.world = bpy.data.worlds.new('w')

    obs = []
    obs.append((head(), 0.05))
    obs.append((hand(), 0.03))
    obs.append((foot(), 0.04))
    obs.append((torso(), 0.08))
    obs.append((sleeve(), 0.05))
    obs.append((forearm(), 0.04))
    for k in (0.5, 0.75, 1.0):
        obs.append((skirt(k), 0.1))
    obs.append((cape(), 0.12))
    column_parts()
    for n in ('col_base', 'col_shaft', 'col_cap'):
        obs.append((bpy.data.objects[n], 0.25 if n != 'col_shaft' else 0.06))
    throne()
    obs.append((bpy.data.objects['throne_gold'], 0.25))
    obs.append((bpy.data.objects['throne_cloth'], 0.2))
    obs.append((amphora(), 0.08))
    obs.append((brazier(), 0.15))

    for ob, dist in obs:
        bake_ao(ob, dist)
        print('baked', ob.name, len(ob.data.vertices), flush=True)
    for o in sc.objects:
        o.hide_render = False
        o.select_set(True)
        o.data.materials.clear()

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=OUT, export_format='GLB', use_selection=False, export_apply=True,
        export_normals=True, export_texcoords=True, export_materials='NONE',
        export_vertex_color='ACTIVE', export_all_vertex_colors=False,
        export_active_vertex_color_when_no_material=True,
    )
    print('wrote', OUT, os.path.getsize(OUT))


main()
