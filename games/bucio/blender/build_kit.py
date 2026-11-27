"""
Builds blender/kit.raw.glb (packed by `npm run kit` into public/models/kit.glb):
the 35 props of Portomarina modelled again in Blender, with bevelled edges,
smooth-by-angle normals and ambient occlusion baked in Cycles. The baked
occlusion is multiplied into the palette colours, so every vertex carries its
final colour and the game needs no textures.

Run it headless from the game folder:

    blender -b --factory-startup --python blender/build_kit.py

Everything is generated from code, so every run gives the same result.
Shapes are written in the game's frame (x right, y up, z towards the sea) and
keep the footprint of the procedural prop they replace in src/world/props.js:
same origin on the ground, same front (+x for vehicles), same radius `r`.
"""
import bpy
import bmesh
import math
import os
from mathutils import Matrix, Vector

OUT = os.path.join(os.getcwd(), 'blender', 'kit.raw.glb')
TAU = math.pi * 2

# The palette of src/world/palette.js (Portomarina has no overrides).
P = dict(
    sand=0xf0dcb0, sandDark=0xdcbf8d, wetSand=0xc9a878, sea=0x2fa8c9, seaDeep=0x1b7fa4,
    foam=0xdff4f8, cream=0xf7f1e3, white=0xfffdf6, bone=0xe6dcc6, terra=0xd4784f,
    terraDark=0xa9563a, rose=0xef9a8c, pink=0xf6b7c3, lemon=0xffd15c, coral=0xef7d6b,
    palm=0x5fa860, palmDark=0x3f7f4a, olive=0x8aab5b, mint=0x9fd6b5, asphalt=0x5b5f68,
    stone=0xa9a396, stoneDark=0x7d776c, glass=0x8fc7d8, ink=0x0a0f18, night=0x0d1b2a,
    navy=0x16304d, sun=0xffe6a8, chocolate=0x7a4a2e, gold=0xffc93c,
    # a few extra tones that only the kit uses
    shutter=0x3d7a5a, wood=0x9b6a43, glassDark=0x4f7f95, chrome=0xd9dde0, leaf=0x4e9a4f,
    goldDark=0xd99a1c, skin=0xe9b48c, hair=0x4a2f22,
)


def lin(hexv):
    """sRGB hex to linear RGBA, as three.js does for vertex colours."""
    out = []
    for s in (16, 8, 0):
        c = ((hexv >> s) & 255) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (out[0], out[1], out[2], 1.0)


# ------------------------------------------------------------ primitives
# Every primitive returns a bmesh in the game frame, centred where noted.

def lathe(profile, seg=12, th0=0.0):
    """Surface of revolution around +y. profile: [(radius, y), ...] bottom to top."""
    bm = bmesh.new()
    rings = []
    for r, y in profile:
        if r < 1e-6:
            v = bm.verts.new((0, y, 0))
            rings.append([v] * seg)
        else:
            rings.append([bm.verts.new((r * math.cos(th0 + TAU * i / seg), y,
                                        r * math.sin(th0 + TAU * i / seg))) for i in range(seg)])
    for a, b in zip(rings, rings[1:]):
        for i in range(seg):
            j = (i + 1) % seg
            vs = []
            for v in (a[i], a[j], b[j], b[i]):
                if v not in vs:
                    vs.append(v)
            if len(vs) >= 3:
                bm.faces.new(vs)
    if profile[0][0] > 1e-6:
        bm.faces.new(rings[0])
    if profile[-1][0] > 1e-6:
        bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def cyl(rt, rb, h, seg=12):
    """Cylinder centred on the origin, like THREE.CylinderGeometry."""
    return lathe([(rb, -h / 2), (rt, h / 2)], seg)


def cone(r, h, seg=12):
    return lathe([(r, -h / 2), (0, h / 2)], seg)


def sphere(r, seg=12, rings=8):
    prof = [(r * math.sin(math.pi * k / rings), -r * math.cos(math.pi * k / rings)) for k in range(rings + 1)]
    return lathe(prof, seg)


def ico(r, sub=1):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=r)
    return bm


def box(w, h, d):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(w, h, d), verts=bm.verts)
    return bm


def torus(R, r, seg=16, sides=6):
    bm = bmesh.new()
    rings = []
    for i in range(seg):
        a = TAU * i / seg
        c = Vector((math.cos(a), 0, math.sin(a)))
        rings.append([bm.verts.new(c * (R + r * math.cos(TAU * k / sides)) + Vector((0, r * math.sin(TAU * k / sides), 0)))
                      for k in range(sides)])
    for i in range(seg):
        a, b = rings[i], rings[(i + 1) % seg]
        for k in range(sides):
            bm.faces.new((a[k], b[k], b[(k + 1) % sides], a[(k + 1) % sides]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def _frames(path):
    """Parallel-transport frames along a polyline."""
    pts = [Vector(p) for p in path]
    tans = []
    for i in range(len(pts)):
        a = pts[max(i - 1, 0)]
        b = pts[min(i + 1, len(pts) - 1)]
        tans.append((b - a).normalized())
    up = Vector((0, 1, 0)) if abs(tans[0].y) < 0.9 else Vector((1, 0, 0))
    n = tans[0].cross(up).normalized()
    frames = []
    for t in tans:
        n = (n - t * n.dot(t)).normalized()
        frames.append((t, n, t.cross(n).normalized()))
    return pts, frames


def tube(path, radius, seg=8, caps=True):
    """A tube along a polyline. radius: float or function of t in 0..1."""
    pts, frames = _frames(path)
    bm = bmesh.new()
    rings = []
    for i, (p, (t, n, b)) in enumerate(zip(pts, frames)):
        rr = radius(i / (len(pts) - 1)) if callable(radius) else radius
        rings.append([bm.verts.new(p + (n * math.cos(TAU * k / seg) + b * math.sin(TAU * k / seg)) * rr)
                      for k in range(seg)])
    for a, b in zip(rings, rings[1:]):
        for k in range(seg):
            bm.faces.new((a[k], a[(k + 1) % seg], b[(k + 1) % seg], b[k]))
    if caps:
        bm.faces.new(rings[0])
        bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def slab(path, width, thick, up=(0, 1, 0)):
    """A thin closed ribbon along a path (leaves, sails, fronds).
    width: float or function of t; the ribbon lies across `up`."""
    pts = [Vector(p) for p in path]
    upv = Vector(up)
    bm = bmesh.new()
    rows = []
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        side = t.cross(upv)
        if side.length < 1e-6:
            side = Vector((1, 0, 0))
        side.normalize()
        nrm = side.cross(t).normalized()
        w = (width(i / (len(pts) - 1)) if callable(width) else width) / 2
        w = max(w, 0.004)
        h = thick / 2
        rows.append([bm.verts.new(p - side * w + nrm * h), bm.verts.new(p + side * w + nrm * h),
                     bm.verts.new(p + side * w - nrm * h), bm.verts.new(p - side * w - nrm * h)])
    for a, b in zip(rows, rows[1:]):
        for k in range(4):
            bm.faces.new((a[k], a[(k + 1) % 4], b[(k + 1) % 4], b[k]))
    bm.faces.new(rows[0])
    bm.faces.new(rows[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def prism(poly, depth):
    """Extrudes a 2D polygon in the xy plane along z (centred)."""
    bm = bmesh.new()
    front = [bm.verts.new((x, y, depth / 2)) for x, y in poly]
    back = [bm.verts.new((x, y, -depth / 2)) for x, y in poly]
    n = len(poly)
    bm.faces.new(front)
    bm.faces.new(list(reversed(back)))
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((front[i], back[i], back[j], front[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def gable(w, h, d):
    """Pitched roof: ridge along x, eaves at y=0, total width d (z)."""
    return prism_x([(-d / 2, 0), (d / 2, 0), (0, h)], w)


def prism_x(poly_zy, length):
    """Extrudes a polygon given in the (z, y) plane along x."""
    bm = bmesh.new()
    a = [bm.verts.new((-length / 2, y, z)) for z, y in poly_zy]
    b = [bm.verts.new((length / 2, y, z)) for z, y in poly_zy]
    bm.faces.new(a)
    bm.faces.new(list(reversed(b)))
    n = len(poly_zy)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((a[i], a[j], b[j], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def hull(L, W, H, nx=16, nu=8, bow=1.0, stern=0.55):
    """A boat hull, bow towards +x, deck at y=H, keel near y=0, closed on top."""
    bm = bmesh.new()
    rings = []
    for i in range(nx + 1):
        t = i / nx                    # 0 stern .. 1 bow
        x = (t - 0.5) * L
        # half width: full in the middle, pointed bow, cut stern
        if t > 0.5:
            k = (t - 0.5) / 0.5
            hw = W / 2 * max(0.02, math.sqrt(max(0.0, 1 - k ** (2.2 / bow))))
        else:
            k = (0.5 - t) / 0.5
            hw = W / 2 * (1 - (1 - stern) * k ** 2)
        sheer = H + 0.12 * H * ((t - 0.5) * 2) ** 2 * (1.6 if t > 0.5 else 0.6)
        keel = 0.08 * H + 0.35 * H * max(0.0, (t - 0.75) / 0.25) ** 2
        ring = []
        for u in range(nu + 1):
            a = math.pi * u / nu       # 0 port deck .. pi starboard deck
            z = -hw * math.cos(a)
            depth = math.sin(a) ** 0.7
            y = sheer - (sheer - keel) * depth
            ring.append(bm.verts.new((x, y, z)))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for u in range(nu):
            bm.faces.new((a[u], a[u + 1], b[u + 1], b[u]))
        bm.faces.new((a[0], b[0], b[nu], a[nu]))      # deck strip
    bm.faces.new(rings[0])
    bm.faces.new(rings[-1])
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


# ------------------------------------------------------------ assembling

def _matrix(o):
    sx = o.get('sx', o.get('s', 1))
    sy = o.get('sy', o.get('s', 1))
    sz = o.get('sz', o.get('s', 1))
    S = Matrix.Diagonal((sx, sy, sz, 1))
    R = (Matrix.Rotation(o.get('rz', 0), 4, 'Z') @ Matrix.Rotation(o.get('ry', 0), 4, 'Y')
         @ Matrix.Rotation(o.get('rx', 0), 4, 'X'))
    T = Matrix.Translation((o.get('x', 0), o.get('y', 0), o.get('z', 0)))
    return T @ R @ S


class Prop:
    """One prop: parts painted with palette colours, joined into one mesh."""

    def __init__(self, name, ground=True, ao=None):
        self.name = name
        self.ground = ground
        self.ao = ao
        self.bm = bmesh.new()
        self.col = self.bm.verts.layers.float_color.new('Albedo')

    def add(self, src, color, bevel=0.0, seg=1, angle=0.5, **o):
        """Scale, rotate X/Y/Z, translate (like part() in geometry.js), then
        bevel the sharp edges by `bevel` metres. `color` is a palette key or a
        function of the face centre in the part's own frame."""
        local = {f.index: f.calc_center_median().copy() for f in src.faces} if callable(color) else None
        if local is not None:
            src.faces.ensure_lookup_table()
            tag = src.faces.layers.int.new('tag')
            for f in src.faces:
                f[tag] = f.index
        bmesh.ops.transform(src, matrix=_matrix(o), verts=src.verts)
        if bevel > 0:
            edges = [e for e in src.edges if e.is_manifold and e.calc_face_angle(0) > angle]
            if edges:
                bmesh.ops.bevel(src, geom=edges, offset=bevel, offset_type='OFFSET', segments=seg,
                                profile=0.5, affect='EDGES', clamp_overlap=True)
        bmesh.ops.recalc_face_normals(src, faces=src.faces)
        mapping = {}
        for f in src.faces:
            if local is not None:
                c = local.get(f[tag])
                if c is None:  # a bevel face: take the colour of a neighbour
                    c = next((local[g[tag]] for e in f.edges for g in e.link_faces
                              if g is not f and g[tag] in local), Vector())
                key = color(c)
            else:
                key = color
            rgba = lin(P[key])
            vs = []
            for v in f.verts:
                k = (v.index, key)
                nv = mapping.get(k)
                if nv is None:
                    p = v.co
                    nv = self.bm.verts.new((p.x, -p.z, p.y))   # game frame -> Blender
                    nv[self.col] = rgba
                    mapping[k] = nv
                vs.append(nv)
            if len(set(vs)) == len(vs):
                self.bm.faces.new(vs)
        src.free()
        return self

    def build(self, smooth_angle=38):
        me = bpy.data.meshes.new(self.name)
        self.bm.normal_update()
        self.bm.to_mesh(me)
        self.bm.free()
        ob = bpy.data.objects.new(self.name, me)
        bpy.context.scene.collection.objects.link(ob)
        for p in me.polygons:
            p.use_smooth = True
        me.set_sharp_from_angle(angle=math.radians(smooth_angle))
        ob['ground'] = self.ground
        ob['ao'] = self.ao or 0.0
        return ob


def stripes(n, a, b, axis='angle', offset=0.0):
    """Colour function: n alternating sectors (around y) or bands."""
    def fn(c):
        if axis == 'angle':
            k = int(math.floor(((math.atan2(c.z, c.x) + offset) % TAU) / (TAU / n)))
        else:
            k = int(math.floor((getattr(c, axis) + offset) / n))
        return a if k % 2 == 0 else b
    return fn


def pane(p, w, h, d=0.02, col='glassDark', **o):
    """A window pane laid on a flat face (the big faces of a box have one colour each)."""
    p.add(box(w, h, d), col, **o)


# ------------------------------------------------------------ the props
KIT = []


def kit(fn):
    KIT.append(fn)
    return fn


@kit
def sedia():
    p = Prop('sedia', ao=0.25)
    seat = stripes(0.12, 'coral', 'cream', axis='x', offset=0.36)
    p.add(box(0.7, 0.04, 0.6), seat, bevel=0.012, y=0.3, rx=-0.12)
    p.add(box(0.7, 0.5, 0.04), seat, bevel=0.012, y=0.54, z=-0.27, rx=0.5)
    for x in (-0.36, 0.36):
        p.add(box(0.05, 0.05, 0.72), 'wood', bevel=0.01, x=x, y=0.32, z=-0.02, rx=-0.12)
        p.add(box(0.045, 0.045, 0.5), 'wood', bevel=0.01, x=x, y=0.42, z=0.04)
        for z in (-0.2, 0.22):
            p.add(box(0.045, 0.3, 0.045), 'wood', bevel=0.01, x=x, y=0.15, z=z)
    p.add(box(0.05, 0.62, 0.05), 'wood', bevel=0.01, x=-0.36, y=0.56, z=-0.27, rx=0.5)
    p.add(box(0.05, 0.62, 0.05), 'wood', bevel=0.01, x=0.36, y=0.56, z=-0.27, rx=0.5)
    return p


def umbrella(p, R, H, y, n, a, b, pole=0.05):
    p.add(cyl(pole, pole * 1.15, y + 0.1, 8), 'bone', y=(y + 0.1) / 2 - 0.05)
    prof = [(0, H), (R * 0.35, H * 0.86), (R * 0.7, H * 0.52), (R, 0.02), (R * 0.97, -0.05),
            (R * 0.68, H * 0.42), (R * 0.33, H * 0.74), (0, H - 0.06)]
    # The top rises to the apex then folds back underneath into a closed shell.
    bm = bmesh.new()
    seg = n * 3
    rings = []
    for r, hh in prof:
        if r < 1e-6:
            rings.append([bm.verts.new((0, hh, 0))] * seg)
        else:
            rings.append([bm.verts.new((r * math.cos(TAU * i / seg), hh, r * math.sin(TAU * i / seg)))
                          for i in range(seg)])
    for ra, rb in zip(rings, rings[1:]):
        for i in range(seg):
            j = (i + 1) % seg
            vs = []
            for v in (ra[i], ra[j], rb[j], rb[i]):
                if v not in vs:
                    vs.append(v)
            bm.faces.new(vs)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    # Scallops: every rib dips a little between the spokes.
    for v in bm.verts:
        rr = math.hypot(v.co.x, v.co.z)
        if rr > R * 0.6:
            ang = math.atan2(v.co.z, v.co.x)
            v.co.y -= 0.06 * (rr / R) ** 2 * (0.5 - 0.5 * math.cos(ang * n))
    p.add(bm, stripes(n, a, b), y=y)
    p.add(sphere(0.07, 8, 5), 'lemon', y=y + H + 0.04)


@kit
def ombrellone():
    p = Prop('ombrellone', ao=0.4)
    umbrella(p, 1.15, 0.5, 2.0, 10, 'coral', 'cream')
    return p


@kit
def ombrellone_xl():
    p = Prop('ombrellone-xl', ao=0.6)
    umbrella(p, 1.75, 0.75, 2.4, 12, 'lemon', 'terra', pole=0.07)
    p.add(torus(1.62, 0.035, 36, 5), 'terraDark', y=2.33)
    p.add(cyl(0.3, 0.4, 0.12, 12), 'stone', bevel=0.02, y=0.06)
    return p


@kit
def tavolino():
    p = Prop('tavolino', ao=0.25)
    p.add(lathe([(0.0, 0.42), (0.42, 0.42), (0.44, 0.45), (0.42, 0.48), (0.0, 0.48)], 20), 'white')
    p.add(lathe([(0.05, 0.03), (0.04, 0.2), (0.05, 0.42)], 10), 'terraDark')
    p.add(lathe([(0.0, 0.0), (0.24, 0.0), (0.24, 0.02), (0.1, 0.05), (0.0, 0.05)], 14), 'terraDark')
    p.add(lathe([(0.0, 0.48), (0.06, 0.48), (0.08, 0.64), (0.0, 0.62)], 10), 'coral', x=0.14, z=0.1)
    p.add(cyl(0.004, 0.004, 0.2, 4), 'lemon', x=0.16, y=0.68, z=0.1, rz=0.3)
    p.add(lathe([(0.0, 0.48), (0.13, 0.48), (0.14, 0.5), (0.0, 0.495)], 14), 'cream', x=-0.15, z=-0.12)
    p.add(sphere(0.05, 8, 5), 'rose', x=-0.15, y=0.53, z=-0.12)
    return p


def waffle(c):
    k = int(math.floor((math.atan2(c.z, c.x) % TAU) / (TAU / 8))) + int(math.floor(c.y / 0.06))
    return 'sandDark' if k % 2 else 'sand'


@kit
def gelato():
    p = Prop('gelato', ao=0.1)
    p.add(lathe([(0, 0.0), (0.12, 0.3), (0.17, 0.34), (0.16, 0.37), (0, 0.37)], 16), waffle)
    p.add(sphere(0.16, 12, 8), 'rose', y=0.45, sy=0.9)
    p.add(torus(0.14, 0.035, 14, 5), 'rose', y=0.39)
    p.add(sphere(0.125, 12, 8), 'lemon', y=0.6, x=0.02, sy=0.9)
    p.add(sphere(0.085, 10, 6), 'mint', y=0.7, x=-0.01)
    p.add(sphere(0.03, 6, 4), 'coral', y=0.79)
    p.add(cyl(0.012, 0.012, 0.12, 4), 'chocolate', x=0.07, y=0.73, rz=-0.6)
    return p


@kit
def gelataio():
    p = Prop('gelataio', ao=0.35)
    p.add(box(1.25, 0.72, 0.78), 'cream', bevel=0.06, seg=2, y=0.52)
    p.add(box(1.29, 0.12, 0.82), 'terra', bevel=0.03, y=0.9)
    p.add(box(1.3, 0.1, 0.84), 'terra', bevel=0.03, y=0.2)
    for x in (-0.38, 0.0, 0.38):
        p.add(lathe([(0, 0.94), (0.13, 0.94), (0.14, 1.04), (0, 1.04)], 12), 'bone', x=x, z=-0.12)
    p.add(sphere(0.11, 10, 6), 'pink', x=-0.38, y=1.05, z=-0.12, sy=0.6)
    p.add(sphere(0.11, 10, 6), 'mint', x=0.0, y=1.05, z=-0.12, sy=0.6)
    p.add(sphere(0.11, 10, 6), 'lemon', x=0.38, y=1.05, z=-0.12, sy=0.6)
    p.add(box(1.36, 0.04, 0.7), stripes(0.17, 'coral', 'cream', axis='x', offset=0.68),
          bevel=0.01, y=1.62, rx=-0.18)
    for x in (-0.6, 0.6):
        for z in (-0.3, 0.3):
            p.add(cyl(0.022, 0.022, 0.68, 6), 'stoneDark', x=x, y=1.27, z=z)
    for x in (-0.42, 0.42):
        p.add(torus(0.22, 0.045, 16, 6), 'ink', x=x, y=0.22, z=0.42, rx=math.pi / 2)
        p.add(cyl(0.18, 0.18, 0.05, 14), 'stone', x=x, y=0.22, z=0.42, rx=math.pi / 2)
    p.add(tube([(0.62, 0.7, -0.25), (0.85, 0.72, -0.25), (0.85, 0.72, 0.25), (0.62, 0.7, 0.25)], 0.025, 6),
          'stoneDark')
    p.add(box(0.5, 0.26, 0.02), 'lemon', bevel=0.008, y=0.55, z=0.4)
    return p


@kit
def tavola():
    p = Prop('tavola', ao=0.2)
    board = lambda c: 'sea' if abs(c.x) > 0.03 else 'white'
    p.add(sphere(1.0, 16, 10), board, sx=0.18, sy=0.95, sz=0.045, y=0.62, rz=0.08, rx=0.06)
    p.add(prism([(0, 0), (0.12, 0), (0.0, 0.12)], 0.012), 'coral', x=0.0, y=-0.1, z=-0.05, ry=math.pi / 2)
    p.add(lathe([(0.5, 0.0), (0.32, 0.1), (0, 0.14)], 16), 'sandDark', sy=0.8)
    return p


@kit
def barca():
    p = Prop('barca', ground=False, ao=0.4)
    paint = lambda c: 'sea' if c.y < 0.22 else ('coral' if c.y < 0.3 else 'cream')
    p.add(hull(2.9, 1.15, 0.6), paint, y=-0.05)
    p.add(box(2.5, 0.04, 0.95), 'wood', bevel=0.01, y=0.5)
    p.add(box(0.75, 0.44, 0.8), 'white', bevel=0.05, seg=2, x=-0.35, y=0.7)
    for z in (-0.4, 0.4):
        pane(p, 0.5, 0.16, x=-0.35, y=0.76, z=z)
    pane(p, 0.02, 0.16, 0.6, x=0.025, y=0.76)
    p.add(box(0.85, 0.06, 0.9), 'sea', bevel=0.02, x=-0.35, y=0.95)
    p.add(cyl(0.03, 0.04, 1.2, 6), 'bone', x=0.2, y=1.2)
    p.add(slab([(0.23, 1.72, 0), (0.6, 1.62, 0)], lambda t: 0.3 * (1 - t), 0.02, up=(0, 0, 1)), 'coral')
    p.add(torus(0.12, 0.035, 12, 5), 'coral', x=-0.9, y=0.62, z=0.47, rx=math.pi / 2)
    return p


@kit
def veliero():
    p = Prop('veliero', ground=False, ao=0.6)
    paint = lambda c: 'navy' if c.y < 0.3 else ('terra' if c.y < 0.42 else 'white')
    p.add(hull(4.6, 1.5, 0.82, nx=20), paint, y=-0.05)
    p.add(box(4.0, 0.05, 1.25), 'wood', bevel=0.01, y=0.72)
    p.add(box(1.0, 0.45, 0.85), 'bone', bevel=0.05, seg=2, x=-0.8, y=0.98)
    for z in (-0.425, 0.425):
        pane(p, 0.7, 0.15, x=-0.8, y=1.02, z=z)
    p.add(cyl(0.06, 0.08, 4.8, 8), 'terraDark', x=0.15, y=3.1)
    p.add(cyl(0.04, 0.04, 2.0, 6), 'terraDark', x=-0.75, y=1.35, rz=math.pi / 2)
    # Mainsail and jib, each a thin bellied slab.
    sail_w = lambda t: 1.9 * (1 - t) + 0.05
    sail = [(0.1 - sail_w(i / 10) / 2, 1.45 + 3.8 * i / 10, 0.2 * math.sin(math.pi * i / 10) * (1 - i / 10))
            for i in range(11)]
    p.add(slab(sail, sail_w, 0.03, up=(0, 0, 1)), lambda c: 'white' if int((c.y + 10) / 0.76) % 2 else 'cream')
    p.add(slab([(0.2, 5.2, 0), (2.4, 0.8, 0)], lambda t: 0.08 + 1.3 * t * (1 - t) * 2, 0.025, up=(0, 0, 1)),
          'cream')
    p.add(slab([(0.15, 5.45, 0), (0.6, 5.35, 0)], lambda t: 0.25 * (1 - t), 0.02, up=(0, 0, 1)), 'coral')
    p.add(tube([(2.4, 0.8, 0), (0.15, 5.3, 0)], 0.012, 4), 'stoneDark')
    p.add(tube([(-2.2, 0.8, 0), (0.15, 5.3, 0)], 0.012, 4), 'stoneDark')
    return p


@kit
def gabbiano():
    p = Prop('gabbiano', ao=0.12)
    p.add(sphere(0.16, 12, 8), 'white', y=0.34, sx=1.4, sz=0.85)
    p.add(sphere(0.1, 10, 6), 'white', x=0.22, y=0.44)
    p.add(cone(0.035, 0.14, 6), 'lemon', x=0.36, y=0.43, rz=-math.pi / 2)
    p.add(sphere(0.018, 6, 4), 'ink', x=0.28, y=0.47, z=0.07)
    p.add(sphere(0.018, 6, 4), 'ink', x=0.28, y=0.47, z=-0.07)
    for s in (1, -1):
        wing = [(0.0, 0.4, 0.08 * s), (-0.05, 0.47, 0.3 * s), (-0.15, 0.44, 0.52 * s)]
        p.add(slab(wing, lambda t: 0.2 * (1 - 0.7 * t), 0.025, up=(0, 1, 0)),
              lambda c: 'stoneDark' if abs(c.z) > 0.4 else 'bone')
        p.add(tube([(0.0, 0.0, 0.04 * s), (0.02, 0.25, 0.04 * s)], 0.012, 4), 'lemon')
    p.add(cone(0.08, 0.2, 6), 'stone', x=-0.27, y=0.36, rz=math.pi / 2, sy=1.0, sz=0.4)
    return p


@kit
def boa():
    p = Prop('boa', ground=False, ao=0.15)
    p.add(sphere(0.3, 14, 9), stripes(0.12, 'coral', 'white', axis='y', offset=0.06), y=0.1)
    p.add(cyl(0.05, 0.08, 0.32, 8), 'white', y=0.48)
    p.add(sphere(0.06, 8, 5), 'lemon', y=0.68)
    p.add(torus(0.3, 0.025, 18, 5), 'stoneDark', y=0.1)
    return p


@kit
def faro():
    p = Prop('faro', ground=False, ao=1.2)
    for i, (rx, rz, s) in enumerate([(1.4, 0.4, 0.7), (-1.2, 0.9, 0.6), (0.3, -1.5, 0.8), (-0.6, -1.2, 0.5),
                                      (1.0, -0.9, 0.55), (-1.5, -0.2, 0.65)]):
        p.add(ico(s, 1), 'stoneDark' if i % 2 else 'stone', x=rx, y=0.1, z=rz, sy=0.6)
    p.add(lathe([(1.55, 0.0), (1.55, 0.35), (1.45, 0.4), (0, 0.4)], 16), 'stone', bevel=0.04)
    tower = lambda c: 'terra' if int(c.y / 1.05) % 2 == 0 else 'cream'
    p.add(lathe([(1.25 - 0.43 * k / 12, 0.4 + 6.0 * k / 12) for k in range(13)] + [(0, 6.4)], 16), tower)
    p.add(lathe([(0.84, 6.4), (1.25, 6.45), (1.25, 6.6), (0, 6.6)], 16), 'terraDark')
    for k in range(16):
        a = TAU * k / 16
        p.add(cyl(0.025, 0.025, 0.45, 4), 'stoneDark', x=1.18 * math.cos(a), y=6.82, z=1.18 * math.sin(a))
    p.add(torus(1.18, 0.03, 24, 4), 'stoneDark', y=7.05)
    p.add(cyl(0.72, 0.72, 0.95, 12), lambda c: 'glass' if abs(c.y) < 0.4 else 'stoneDark', y=7.1)
    p.add(sphere(0.38, 10, 7), 'sun', y=7.1)
    p.add(lathe([(0.85, 7.55), (0.85, 7.62), (0.4, 8.2), (0, 8.35)], 16), 'terraDark')
    p.add(sphere(0.12, 8, 5), 'stoneDark', y=8.4)
    p.add(box(0.5, 0.85, 0.06), 'terraDark', bevel=0.02, y=0.85, z=1.18, rx=-0.07)
    for y in (2.4, 4.4):
        p.add(box(0.3, 0.45, 0.06), 'glassDark', y=y, z=1.25 - 0.07 * y, rx=-0.07)
    return p


@kit
def gru():
    p = Prop('gru', ao=1.0)
    legs = [(0, 0), (3.2, 1.8), (0, 3.6), (-3.2, 1.8)]
    for x, z in legs:
        p.add(box(0.45, 6.9, 0.45), 'lemon', bevel=0.05, x=x, y=3.45, z=z)
        p.add(box(0.8, 0.3, 0.8), 'stoneDark', bevel=0.04, x=x, y=0.15, z=z)
    for (x1, z1), (x2, z2) in zip(legs, legs[1:] + legs[:1]):
        for y1, y2 in ((0.8, 3.6), (3.6, 0.8), (3.8, 6.4), (6.4, 3.8)):
            p.add(tube([(x1, y1, z1), (x2, y2, z2)], 0.07, 5), 'lemon')
    p.add(box(11, 0.5, 0.5), 'terra', bevel=0.05, y=7.1, z=1.8)
    p.add(box(0.4, 0.4, 7), 'terra', bevel=0.05, y=6.7, z=3)
    for i in range(12):
        x = -5.0 + i * 0.9
        p.add(tube([(x, 7.35, 1.8), (x + 0.45, 7.75, 1.8), (x + 0.9, 7.35, 1.8)], 0.04, 4), 'terraDark')
    p.add(box(11, 0.08, 0.08), 'terraDark', y=7.75, z=1.8)
    p.add(box(1.2, 1.0, 1.0), 'cream', bevel=0.06, seg=2, x=-1.0, y=6.3, z=1.8)
    for z in (1.3, 2.3):
        pane(p, 0.9, 0.42, x=-1.0, y=6.45, z=z)
    pane(p, 0.02, 0.42, 0.8, x=-0.4, y=6.45, z=1.8)
    p.add(box(0.7, 0.3, 0.7), 'stoneDark', bevel=0.03, x=4.4, y=7.0, z=1.8)
    p.add(cyl(0.03, 0.03, 2.4, 4), 'stoneDark', x=4.4, y=5.6, z=1.8)
    p.add(box(0.85, 0.75, 0.85), stripes(0.25, 'terraDark', 'lemon', axis='x', offset=0.43),
          bevel=0.04, x=4.4, y=4.05, z=1.8)
    return p


# ---- buildings

def window(p, x, y, z, face, w=0.42, h=0.6, shutters=True):
    """A window on a wall facing `face` ('+z', '-z', '+x', '-x'), with frame,
    sill and a pair of green shutters."""
    ry = {'+z': 0, '-z': math.pi, '+x': math.pi / 2, '-x': -math.pi / 2}[face]
    c, s = math.cos(ry), math.sin(ry)

    def at(dx, dz):
        # local (dx along the wall, dz out of the wall) to world
        return dict(x=x + dx * c + dz * s, z=z - dx * s + dz * c, ry=ry)
    p.add(box(w + 0.1, h + 0.1, 0.04), 'white', **at(0, 0.01), y=y)
    p.add(box(w, h, 0.04), 'glassDark', **at(0, 0.025), y=y)
    p.add(box(0.03, h, 0.03), 'white', **at(0, 0.05), y=y)
    p.add(box(w + 0.18, 0.06, 0.12), 'bone', bevel=0.012, **at(0, 0.05), y=y - h / 2 - 0.05)
    if shutters:
        for side in (-1, 1):
            sh = box(w / 2 + 0.02, h + 0.04, 0.035)
            p.add(sh, lambda cc: 'shutter' if int((cc.y + 1) / 0.07) % 2 else 'palmDark',
                  **at(side * (w / 2 + w / 4 + 0.07), 0.04), y=y)


def hip_roof(p, w, d, h, y, rows=4, a='terra', b='terraDark', over=0.18):
    """A hipped tile roof made of stepped rows, so the tiles catch the light."""
    W, D = w / 2 + over, d / 2 + over
    for k in range(rows):
        t0, t1 = k / rows, (k + 1) / rows
        w0, d0 = W * (1 - t0), D * (1 - t0)
        w1, d1 = W * (1 - t1) + 0.03, D * (1 - t1) + 0.03
        y0, y1 = y + h * t0, y + h * t1
        bm = bmesh.new()
        lo = [bm.verts.new(v) for v in ((-w0, y0, -d0), (w0, y0, -d0), (w0, y0, d0), (-w0, y0, d0))]
        lip = [bm.verts.new(v) for v in ((-w0, y0 + 0.07, -d0), (w0, y0 + 0.07, -d0), (w0, y0 + 0.07, d0), (-w0, y0 + 0.07, d0))]
        if k == rows - 1:
            top = [bm.verts.new((-max(w1 - d1, 0.0), y1, 0)), bm.verts.new((max(w1 - d1, 0.0), y1, 0))]
            bm.faces.new(lo)
            for i in range(4):
                j = (i + 1) % 4
                bm.faces.new((lo[i], lo[j], lip[j], lip[i]))
            bm.faces.new((lip[0], lip[1], top[1], top[0]))
            bm.faces.new((lip[2], lip[3], top[0], top[1]))
            bm.faces.new((lip[1], lip[2], top[1]))
            bm.faces.new((lip[3], lip[0], top[0]))
        else:
            hi = [bm.verts.new(v) for v in ((-w1, y1, -d1), (w1, y1, -d1), (w1, y1, d1), (-w1, y1, d1))]
            bm.faces.new(lo)
            bm.faces.new(hi)
            for i in range(4):
                j = (i + 1) % 4
                bm.faces.new((lo[i], lo[j], lip[j], lip[i]))
                bm.faces.new((lip[i], lip[j], hi[j], hi[i]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        p.add(bm, a if k % 2 == 0 else b)


@kit
def palazzo():
    p = Prop('palazzo', ao=1.0)
    p.add(box(3.6, 0.4, 3.6), 'stone', bevel=0.04, y=0.2)
    p.add(box(3.4, 4.0, 3.4), 'cream', bevel=0.05, y=2.2)
    for y in (1.55, 2.85):
        p.add(box(3.46, 0.08, 3.46), 'bone', y=y)
    p.add(box(3.62, 0.24, 3.62), 'bone', bevel=0.04, y=4.25)
    hip_roof(p, 3.4, 3.4, 1.15, 4.37)
    p.add(box(0.36, 0.7, 0.36), 'terraDark', bevel=0.03, x=0.9, y=5.2, z=-0.6)
    p.add(box(0.46, 0.08, 0.46), 'stoneDark', x=0.9, y=5.58, z=-0.6)
    for f in range(3):
        y = 1.0 + f * 1.3
        for i in range(4):
            if f == 0 and i in (1, 2):
                continue
            window(p, -1.05 + i * 0.7, y, 1.71, '+z')
            window(p, -1.05 + i * 0.7, y, -1.71, '-z')
        for i in range(3):
            window(p, 1.71, y, -0.7 + i * 0.7, '+x')
            window(p, -1.71, y, -0.7 + i * 0.7, '-x')
    # door with an arched top
    p.add(prism([(-0.42, 0), (0.42, 0), (0.42, 1.0)] + [(0.42 * math.cos(math.pi * k / 8), 1.0 + 0.42 * math.sin(math.pi * k / 8)) for k in range(1, 8)] + [(-0.42, 1.0)], 0.06),
          'white', y=0.38, z=1.72)
    p.add(prism([(-0.34, 0), (0.34, 0), (0.34, 0.98)] + [(0.34 * math.cos(math.pi * k / 8), 0.98 + 0.34 * math.sin(math.pi * k / 8)) for k in range(1, 8)] + [(-0.34, 0.98)], 0.06),
          'chocolate', y=0.38, z=1.75)
    # balcony
    p.add(box(1.7, 0.1, 0.5), 'stone', bevel=0.02, y=2.32, z=1.94)
    p.add(box(1.7, 0.05, 0.05), 'ink', y=2.82, z=2.17)
    for k in range(13):
        p.add(box(0.025, 0.45, 0.025), 'ink', x=-0.82 + k * 0.137, y=2.6, z=2.17)
    for s in (-1, 1):
        p.add(box(0.05, 0.05, 0.5), 'ink', x=0.83 * s, y=2.82, z=1.94)
    for x in (-0.55, 0.0, 0.55):
        p.add(lathe([(0.08, 2.37), (0.11, 2.52), (0.0, 2.52)], 8), 'terra', x=x, z=2.0)
        p.add(ico(0.12, 1), 'leaf', x=x, y=2.6, z=2.0)
        p.add(ico(0.05, 0), 'coral', x=x + 0.05, y=2.7, z=2.06)
    return p


@kit
def palazzo_alto():
    p = Prop('palazzo-alto', ao=1.0)
    p.add(box(3.0, 0.35, 3.0), 'stone', bevel=0.04, y=0.17)
    p.add(box(2.9, 5.85, 2.9), 'rose', bevel=0.05, y=3.1)
    p.add(box(3.1, 0.28, 3.1), 'cream', bevel=0.04, y=6.1)
    p.add(box(2.9, 0.35, 0.1), 'cream', y=6.4, z=1.4)
    p.add(box(2.9, 0.35, 0.1), 'cream', y=6.4, z=-1.4)
    p.add(box(0.1, 0.35, 2.9), 'cream', y=6.4, x=1.4)
    p.add(box(0.1, 0.35, 2.9), 'cream', y=6.4, x=-1.4)
    p.add(cyl(0.38, 0.38, 0.7, 12), 'bone', x=-0.6, y=6.6, z=-0.5)
    p.add(box(0.5, 0.9, 0.5), 'terraDark', bevel=0.03, x=0.8, y=6.7, z=0.6)
    p.add(tube([(0.2, 6.25, -0.2), (0.2, 7.0, -0.2), (0.2, 7.3, 0.3)], 0.02, 4), 'stoneDark')
    for f in range(5):
        y = 1.0 + f * 1.15
        if f == 0:
            # ground-floor shop with a striped awning
            p.add(box(2.2, 1.0, 0.05), 'glassDark', y=0.95, z=1.47)
            p.add(box(2.4, 0.06, 0.06), 'white', y=1.47, z=1.49)
            p.add(box(2.5, 0.04, 0.7), stripes(0.25, 'mint', 'white', axis='x', offset=1.25),
                  bevel=0.01, y=1.75, z=1.75, rx=0.35)
        else:
            for i in range(3):
                window(p, -0.8 + i * 0.8, y, 1.46, '+z', w=0.4, h=0.55)
        for i in range(3):
            window(p, -0.8 + i * 0.8, y, -1.46, '-z', w=0.4, h=0.55)
            window(p, 1.46, y, -0.8 + i * 0.8, '+x', w=0.4, h=0.55)
            window(p, -1.46, y, -0.8 + i * 0.8, '-x', w=0.4, h=0.55)
    for y in (2.45, 4.75):
        p.add(box(2.6, 0.1, 0.42), 'stone', bevel=0.02, y=y, z=1.66)
        p.add(box(2.6, 0.04, 0.04), 'ink', y=y + 0.45, z=1.86)
        for k in range(17):
            p.add(box(0.022, 0.4, 0.022), 'ink', x=-1.28 + k * 0.16, y=y + 0.25, z=1.86)
    return p


@kit
def chiesa():
    p = Prop('chiesa', ao=1.0)
    p.add(box(3.8, 0.3, 2.6), 'stone', bevel=0.04, y=0.15)
    p.add(box(3.6, 2.4, 2.4), 'cream', bevel=0.04, y=1.5)
    p.add(box(3.76, 0.18, 2.56), 'bone', bevel=0.03, y=2.75)
    p.add(gable(3.9, 0.9, 2.7), 'terra', y=2.83)
    p.add(gable(3.94, 0.06, 2.74), 'terraDark', y=2.8)
    # facade on +x: pediment, rose window, door
    p.add(prism_x([(-1.2, 0), (1.2, 0), (0, 0.95)], 0.12), 'white', x=1.82, y=2.84)
    p.add(cyl(0.34, 0.34, 0.06, 16), 'glassDark', x=1.83, y=2.15, rz=math.pi / 2)
    p.add(torus(0.36, 0.05, 16, 5), 'white', x=1.84, y=2.15, rz=math.pi / 2)
    for k in range(4):
        p.add(box(0.03, 0.66, 0.03), 'white', x=1.86, y=2.15, rx=k * math.pi / 4)
    p.add(box(0.08, 1.15, 0.8), 'chocolate', bevel=0.02, x=1.81, y=0.88)
    p.add(prism_x([(-0.4, 0), (0.4, 0), (0, 0.25)], 0.1), 'white', x=1.84, y=1.48)
    for z in (-0.95, 0.95):
        p.add(box(0.12, 2.3, 0.18), 'white', x=1.82, y=1.45, z=z)
    for x in (-0.9, 0.2):
        for z in (1.21, -1.21):
            p.add(box(0.36, 0.9, 0.05), 'glassDark', x=x, y=1.6, z=z)
            p.add(cyl(0.18, 0.18, 0.05, 10), 'glassDark', x=x, y=2.05, z=z, rx=math.pi / 2)
    # dome on a drum
    p.add(cyl(1.0, 1.05, 0.55, 20), lambda c: 'glassDark' if abs(c.y) < 0.16 and int((math.atan2(c.z, c.x) % TAU) / (TAU / 20)) % 2 else 'cream',
          x=0.2, y=3.35)
    p.add(cyl(1.08, 1.08, 0.08, 20), 'bone', x=0.2, y=3.65)
    dome = [(1.02 * math.cos(math.pi / 2 * k / 6), 3.68 + 0.95 * math.sin(math.pi / 2 * k / 6)) for k in range(7)]
    p.add(lathe(dome, 16), stripes(16, 'terra', 'terraDark'), x=0.2)
    p.add(cyl(0.16, 0.18, 0.35, 8), 'cream', x=0.2, y=4.78)
    p.add(cone(0.2, 0.3, 8), 'terraDark', x=0.2, y=5.1)
    p.add(sphere(0.06, 6, 4), 'gold', x=0.2, y=5.3)
    # bell tower
    p.add(box(1.3, 5.0, 1.3), 'cream', bevel=0.04, x=-1.65, y=2.5, z=-0.6)
    for y in (1.8, 3.4):
        p.add(box(1.38, 0.1, 1.38), 'bone', x=-1.65, y=y, z=-0.6)
    for face, (dx, dz) in {'+x': (0.66, 0), '-x': (-0.66, 0), '+z': (0, 0.66), '-z': (0, -0.66)}.items():
        ry = 0 if face in ('+z', '-z') else math.pi / 2
        p.add(box(0.5, 0.8, 0.05), 'night', x=-1.65 + dx, y=4.35, z=-0.6 + dz, ry=ry)
        p.add(cyl(0.25, 0.25, 0.05, 10), 'night', x=-1.65 + dx, y=4.75, z=-0.6 + dz,
              rx=math.pi / 2 if face in ('+z', '-z') else 0, rz=0 if face in ('+z', '-z') else math.pi / 2)
    p.add(sphere(0.25, 10, 6), 'goldDark', x=-1.65, y=4.4, z=-0.6, sy=1.2)
    p.add(box(1.6, 0.2, 1.6), 'bone', bevel=0.03, x=-1.65, y=5.1, z=-0.6)
    p.add(cone(0.82, 1.4, 4), 'terraDark', x=-1.65, y=5.9, z=-0.6, ry=math.pi / 4)
    p.add(box(0.05, 0.6, 0.05), 'gold', x=-1.65, y=6.85, z=-0.6)
    p.add(box(0.3, 0.05, 0.05), 'gold', x=-1.65, y=6.95, z=-0.6)
    return p


@kit
def fontana():
    p = Prop('fontana', ao=0.6)
    p.add(lathe([(0, 0), (1.42, 0), (1.42, 0.38), (1.32, 0.5), (1.22, 0.5), (1.18, 0.2), (0, 0.2)], 24), 'stone',
          bevel=0.02)
    p.add(cyl(1.18, 1.18, 0.04, 24), 'sea', y=0.42)
    p.add(torus(0.8, 0.02, 24, 4), 'foam', y=0.45)
    p.add(lathe([(0.32, 0.2), (0.3, 0.4), (0.2, 0.55), (0.16, 0.9), (0.24, 1.08), (0.18, 1.2)], 12), 'stone')
    p.add(lathe([(0.12, 1.15), (0.62, 1.28), (0.64, 1.36), (0.56, 1.38), (0, 1.32)], 16), 'stoneDark')
    p.add(cyl(0.54, 0.54, 0.03, 16), 'sea', y=1.35)
    p.add(lathe([(0.1, 1.35), (0.13, 1.55), (0.08, 1.75), (0, 1.8)], 10), 'stone')
    p.add(lathe([(0, 1.78), (0.07, 1.86), (0.04, 2.05), (0, 2.12)], 8), 'foam')
    for k in range(6):
        a = TAU * k / 6
        path = [(0.5 * math.cos(a) * t + 0.0, 1.36 - 0.95 * t ** 2, 0.5 * math.sin(a) * t) for t in [0.0, 0.25, 0.5, 0.75, 1.0]]
        path = [(x * 1.4, y, z * 1.4) for x, y, z in path]
        p.add(tube(path, 0.035, 5), 'foam')
    return p


@kit
def gazebo():
    p = Prop('gazebo', ao=0.5)
    for x in (-0.9, 0.9):
        for z in (-0.9, 0.9):
            p.add(cyl(0.045, 0.055, 1.95, 6), 'bone', x=x, z=z, y=0.97)
    canopy = cone(1.0, 1.0, 4)
    p.add(canopy, stripes(8, 'olive', 'cream', offset=math.pi / 4), y=2.12, sx=1.35, sz=1.35, sy=0.6,
          ry=math.pi / 4)
    for k in range(4):
        a = TAU * k / 4
        p.add(box(1.85, 0.16, 0.03), stripes(0.23, 'olive', 'cream', axis='x', offset=0.92),
              x=0.95 * math.cos(a), z=0.95 * math.sin(a), y=1.78, ry=-a + math.pi / 2)
    p.add(box(2.0, 0.08, 1.2), 'wood', bevel=0.02, y=0.8)
    p.add(box(1.9, 0.7, 0.06), 'wood', y=0.42, z=0.55)
    for i, (x, col) in enumerate([(-0.6, 'lemon'), (0.0, 'coral'), (0.6, 'leaf')]):
        p.add(box(0.5, 0.2, 0.45), 'wood', bevel=0.015, x=x, y=0.94)
        for k in range(5):
            p.add(sphere(0.085, 8, 5), col, x=x - 0.15 + (k % 3) * 0.15, y=1.08 + 0.05 * (k // 3), z=-0.08 + 0.15 * (k // 3))
    return p


@kit
def chiosco():
    p = Prop('chiosco', ao=0.5)
    p.add(cyl(1.0, 1.05, 1.7, 8), 'shutter', bevel=0.02, y=0.85)
    p.add(cyl(1.08, 1.08, 0.14, 8), 'cream', bevel=0.02, y=0.07)
    p.add(cyl(1.03, 1.03, 0.1, 8), 'cream', y=1.5)
    p.add(lathe([(0, 1.7), (1.18, 1.72), (1.2, 1.84), (0.95, 2.25), (0.5, 2.38), (0, 2.42)], 8), 'cream', bevel=0.02)
    p.add(cyl(0.06, 0.08, 0.3, 6), 'terraDark', y=2.55)
    p.add(sphere(0.09, 8, 5), 'gold', y=2.75)
    p.add(cyl(0.04, 0.04, 0.7, 5), 'terraDark', x=0.8, y=2.5, rz=-0.3)
    p.add(box(0.55, 0.3, 0.04), 'coral', bevel=0.01, x=1.02, y=2.78)
    for i, col in enumerate(['lemon', 'coral', 'sea', 'rose', 'white', 'palm']):
        p.add(box(0.2, 0.28, 0.02), col, x=-0.5 + (i % 3) * 0.25, y=0.8 + 0.32 * (i // 3), z=1.04, rx=-0.1)
    p.add(box(0.85, 0.06, 0.25), 'wood', y=0.55, z=1.05)
    return p


@kit
def lampione():
    p = Prop('lampione', ao=0.2)
    p.add(lathe([(0.16, 0), (0.16, 0.08), (0.11, 0.14), (0.09, 0.32), (0.07, 0.36)], 10), 'stoneDark')
    p.add(lathe([(0.065, 0.35), (0.05, 2.6), (0.07, 2.65), (0.05, 2.72)], 8), 'stoneDark')
    p.add(tube([(0.0, 2.62, 0), (0.12, 2.82, 0), (0.3, 2.86, 0), (0.42, 2.78, 0)], 0.028, 6), 'stoneDark')
    p.add(lathe([(0.03, 2.5), (0.15, 2.58), (0.2, 2.72), (0, 2.8)], 8), 'stoneDark', x=0.42)
    p.add(sphere(0.12, 10, 6), 'sun', x=0.42, y=2.56)
    return p


@kit
def cestino():
    p = Prop('cestino', ao=0.12)
    p.add(lathe([(0.0, 0.03), (0.22, 0.03), (0.27, 0.62), (0.0, 0.62)], 16), stripes(16, 'palmDark', 'palm'))
    p.add(torus(0.27, 0.03, 16, 5), 'stoneDark', y=0.62)
    p.add(torus(0.23, 0.025, 16, 5), 'stoneDark', y=0.15)
    p.add(lathe([(0.0, 0.6), (0.24, 0.6), (0.24, 0.63), (0.0, 0.63)], 16), 'ink')
    return p


@kit
def panchina():
    p = Prop('panchina', ao=0.25)
    for k in range(4):
        p.add(box(1.3, 0.045, 0.09), 'terra', bevel=0.012, y=0.43, z=0.15 - k * 0.1)
    for k in range(3):
        p.add(box(1.3, 0.09, 0.04), 'terra', bevel=0.012, y=0.6 + k * 0.12, z=-0.2 - k * 0.03, rx=0.22)
    for x in (-0.55, 0.55):
        p.add(prism([(-0.2, 0), (-0.12, 0), (-0.05, 0.38), (0.18, 0.38), (0.18, 0.44), (-0.28, 0.9), (-0.34, 0.88), (-0.18, 0.44)], 0.06),
              'stoneDark', bevel=0.012, x=x, ry=-math.pi / 2)
        p.add(box(0.06, 0.05, 0.42), 'stoneDark', bevel=0.012, x=x, y=0.62, z=0.06)
    return p


@kit
def vaso():
    p = Prop('vaso', ao=0.12)
    p.add(lathe([(0.0, 0.0), (0.2, 0.0), (0.27, 0.3), (0.31, 0.32), (0.31, 0.38), (0.26, 0.38), (0.0, 0.36)], 14), 'terra',
          bevel=0.01)
    p.add(cyl(0.25, 0.25, 0.02, 14), 'chocolate', y=0.35)
    for x, y, z, r in ((0, 0.5, 0, 0.2), (0.12, 0.45, 0.1, 0.14), (-0.12, 0.47, -0.08, 0.15), (0.05, 0.62, -0.06, 0.12)):
        p.add(ico(r, 1), 'leaf', x=x, y=y, z=z)
    for x, y, z, col in ((0.14, 0.62, 0.12, 'coral'), (-0.15, 0.6, 0.1, 'lemon'), (0.0, 0.72, 0.0, 'pink'),
                         (-0.1, 0.58, -0.17, 'coral'), (0.18, 0.55, -0.1, 'white')):
        p.add(ico(0.055, 1), col, x=x, y=y, z=z)
    return p


@kit
def persona():
    p = Prop('persona', ao=0.12)
    for s in (-1, 1):
        p.add(tube([(0.09 * s, 0.02, 0), (0.09 * s, 0.3, 0), (0.09 * s, 0.52, 0)], lambda t: 0.055 + 0.02 * t, 6), 'skin')
        p.add(box(0.11, 0.06, 0.2), 'white', bevel=0.02, x=0.09 * s, y=0.03, z=0.03)
    p.add(lathe([(0.0, 0.42), (0.17, 0.42), (0.19, 0.6), (0.0, 0.62)], 10), 'glass')
    p.add(lathe([(0.0, 0.58), (0.19, 0.6), (0.2, 0.86), (0.23, 1.0), (0.12, 1.08), (0.0, 1.1)], 10),
          stripes(0.09, 'coral', 'white', axis='y'))
    for s in (-1, 1):
        p.add(tube([(0.21 * s, 1.0, 0), (0.27 * s, 0.82, 0.02), (0.28 * s, 0.62, 0.06)], 0.045, 6), 'skin')
    p.add(cyl(0.05, 0.05, 0.08, 6), 'skin', y=1.12)
    p.add(sphere(0.13, 12, 8), 'skin', y=1.25, sy=1.08)
    p.add(sphere(0.135, 12, 8), 'hair', y=1.28, z=-0.02, sy=0.95)
    p.add(lathe([(0.0, 1.32), (0.27, 1.32), (0.28, 1.345), (0.13, 1.35), (0.12, 1.47), (0.0, 1.48)], 14), 'lemon')
    p.add(torus(0.125, 0.018, 14, 4), 'terra', y=1.37)
    p.add(sphere(0.016, 5, 4), 'ink', x=0.05, y=1.27, z=0.12)
    p.add(sphere(0.016, 5, 4), 'ink', x=-0.05, y=1.27, z=0.12)
    return p


def wheel(p, x, y, z, r, w, tyre='ink', hub='chrome', axis='z'):
    rot = dict(rx=math.pi / 2) if axis == 'z' else dict(rz=math.pi / 2)
    p.add(torus(r * 0.72, r * 0.3, 16, 6), tyre, x=x, y=y, z=z, sy=w / (r * 0.6), **rot)
    p.add(cyl(r * 0.5, r * 0.5, w * 0.8, 12), hub, x=x, y=y, z=z, **rot)


@kit
def vespa():
    p = Prop('vespa', ao=0.2)
    wheel(p, 0.45, 0.19, 0, 0.19, 0.1)
    wheel(p, -0.42, 0.19, 0, 0.19, 0.1)
    p.add(box(0.62, 0.06, 0.32), 'ink', bevel=0.02, x=0.05, y=0.24)
    p.add(sphere(1.0, 14, 9), 'mint', x=-0.3, y=0.42, sx=0.36, sy=0.24, sz=0.24)
    p.add(sphere(1.0, 10, 6), 'mint', x=0.46, y=0.36, sx=0.2, sy=0.12, sz=0.14)
    p.add(slab([(0.36, 0.24, 0), (0.42, 0.6, 0), (0.48, 0.92, 0)], lambda t: 0.46 - 0.16 * t, 0.07, up=(1, 0, 0)), 'mint')
    p.add(sphere(1.0, 10, 6), 'chocolate', x=-0.28, y=0.67, sx=0.28, sy=0.07, sz=0.16)
    p.add(cyl(0.025, 0.025, 0.36, 6), 'stoneDark', x=0.5, y=0.82, rz=0.25)
    p.add(tube([(0.52, 1.0, -0.26), (0.55, 1.03, 0), (0.52, 1.0, 0.26)], 0.022, 6), 'chrome')
    p.add(cyl(0.075, 0.08, 0.06, 10), 'chrome', x=0.57, y=0.98, rz=math.pi / 2)
    p.add(cyl(0.06, 0.06, 0.03, 10), 'sun', x=0.6, y=0.98, rz=math.pi / 2)
    p.add(tube([(0.5, 1.02, 0.22), (0.47, 1.16, 0.26)], 0.01, 4), 'chrome')
    p.add(sphere(0.035, 6, 4), 'chrome', x=0.47, y=1.18, z=0.26)
    p.add(box(0.12, 0.1, 0.24), 'chrome', bevel=0.015, x=-0.58, y=0.5)
    return p


@kit
def auto():
    p = Prop('auto', ao=0.35)
    for x in (-0.55, 0.6):
        for z in (-0.56, 0.56):
            wheel(p, x, 0.28, z, 0.27, 0.18)
    p.add(box(1.95, 0.5, 1.12), 'lemon', bevel=0.16, seg=3, y=0.58)
    p.add(box(1.12, 0.5, 1.0), 'lemon', bevel=0.14, seg=3, x=-0.12, y=1.02)
    for z in (-0.5, 0.5):
        pane(p, 0.36, 0.2, x=0.1, y=1.03, z=z, col='glass')
        pane(p, 0.36, 0.2, x=-0.34, y=1.03, z=z, col='glass')
    pane(p, 0.02, 0.2, 0.68, x=0.445, y=1.03, col='glass')
    pane(p, 0.02, 0.2, 0.6, x=-0.685, y=1.03, col='glass')
    p.add(box(0.7, 0.03, 0.62), 'cream', bevel=0.01, x=-0.14, y=1.27)
    for z in (-0.33, 0.33):
        p.add(cyl(0.1, 0.1, 0.05, 12), 'chrome', x=0.96, y=0.66, z=z, rz=math.pi / 2)
        p.add(cyl(0.075, 0.075, 0.06, 12), 'sun', x=0.97, y=0.66, z=z, rz=math.pi / 2)
        p.add(box(0.05, 0.08, 0.14), 'coral', bevel=0.01, x=-0.97, y=0.66, z=z)
    for x in (0.99, -0.99):
        p.add(box(0.05, 0.08, 1.1), 'chrome', bevel=0.02, x=x, y=0.42)
    p.add(box(0.03, 0.06, 0.3), 'chrome', x=0.98, y=0.55)
    return p


@kit
def bici():
    p = Prop('bici', ao=0.15)
    for x in (0.42, -0.42):
        p.add(torus(0.27, 0.025, 20, 5), 'ink', x=x, y=0.3, rx=math.pi / 2)
        p.add(torus(0.24, 0.008, 16, 3), 'chrome', x=x, y=0.3, rx=math.pi / 2)
        for k in range(4):
            p.add(box(0.48, 0.008, 0.008), 'chrome', x=x, y=0.3, rz=k * math.pi / 4)
    frame = [((-0.42, 0.3, 0), (-0.05, 0.3, 0)), ((-0.05, 0.3, 0), (-0.12, 0.68, 0)), ((-0.42, 0.3, 0), (-0.12, 0.68, 0)),
             ((-0.12, 0.66, 0), (0.33, 0.66, 0)), ((-0.05, 0.3, 0), (0.33, 0.66, 0)), ((0.42, 0.3, 0), (0.33, 0.78, 0))]
    for a, b in frame:
        p.add(tube([a, b], 0.018, 5), 'sea')
    p.add(tube([(0.3, 0.82, -0.2), (0.33, 0.8, 0), (0.3, 0.82, 0.2)], 0.014, 5), 'chrome')
    p.add(sphere(1.0, 8, 5), 'chocolate', x=-0.14, y=0.74, sx=0.12, sy=0.035, sz=0.07)
    p.add(box(0.22, 0.14, 0.26), 'lemon', bevel=0.015, x=0.47, y=0.74)
    p.add(ico(0.05, 1), 'coral', x=0.47, y=0.84, z=0.05)
    p.add(ico(0.045, 1), 'pink', x=0.45, y=0.83, z=-0.06)
    return p


@kit
def palma():
    p = Prop('palma', ao=0.35)
    trunk = [(0.38 * t ** 1.6, 3.0 * t, 0.2 * t ** 1.6) for t in [i / 8 for i in range(9)]]
    p.add(tube(trunk, lambda t: 0.2 - 0.07 * t, 9), lambda c: 'terraDark' if int(c.y / 0.22) % 2 else 'wood')
    for i in range(9):
        t = i / 9
        a, b = trunk[int(t * 8)], trunk[min(int(t * 8) + 1, 8)]
        p.add(torus(0.2 - 0.07 * t + 0.01, 0.025, 10, 4), 'terraDark', x=a[0], y=a[1] + 0.05, z=a[2])
    top = Vector(trunk[-1])
    for k in range(9):
        a = TAU * k / 9 + 0.3
        L = 1.6 + 0.25 * math.sin(k * 2.3)
        path = []
        for j in range(7):
            t = j / 6
            out = L * t
            path.append((top.x + math.cos(a) * out, top.y + 0.25 + 0.55 * t - 1.25 * t * t, top.z + math.sin(a) * out))
        p.add(slab(path, lambda t: 0.42 * math.sin(math.pi * min(1.0, 0.15 + t)) + 0.04, 0.03, up=(0, 1, 0)),
              'palm' if k % 2 else 'palmDark')
    for k in range(3):
        a = TAU * k / 3
        p.add(sphere(0.11, 8, 6), 'chocolate', x=top.x + 0.13 * math.cos(a), y=top.y - 0.05, z=top.z + 0.13 * math.sin(a))
    return p


@kit
def pino():
    """The Mediterranean stone pine: a bare, leaning trunk and a flat crown."""
    p = Prop('pino', ao=0.4)
    trunk = [(0.25 * t ** 1.5, 2.6 * t, -0.1 * t) for t in [i / 6 for i in range(7)]]
    p.add(tube(trunk, lambda t: 0.17 - 0.06 * t, 8), 'chocolate')
    top = Vector(trunk[-1])
    p.add(tube([tuple(Vector(trunk[4])), (top.x - 0.5, top.y + 0.2, top.z + 0.2)], 0.05, 5), 'chocolate')
    for k, (dx, dz, r) in enumerate([(0, 0, 0.9), (0.6, 0.2, 0.6), (-0.55, 0.3, 0.6), (0.1, -0.6, 0.6), (-0.2, 0.55, 0.55)]):
        p.add(ico(r, 1), 'palmDark' if k % 2 else 'palm', x=top.x + dx, y=top.y + 0.35 + 0.05 * k, z=top.z + dz, sy=0.42)
    return p


@kit
def albero():
    p = Prop('albero', ao=0.4)
    p.add(tube([(0, 0, 0), (0.05, 0.7, 0.02), (0.0, 1.35, 0.0)], lambda t: 0.2 - 0.08 * t, 8), 'chocolate')
    p.add(tube([(0.03, 0.9, 0.01), (0.4, 1.4, 0.1)], 0.06, 5), 'chocolate')
    p.add(tube([(0.0, 1.0, 0.0), (-0.38, 1.35, -0.1)], 0.05, 5), 'chocolate')
    for k, (x, y, z, r, col) in enumerate([(0, 1.85, 0, 0.8, 'olive'), (0.5, 1.6, 0.2, 0.55, 'palm'),
                                            (-0.45, 1.55, -0.15, 0.5, 'leaf'), (0.1, 2.3, -0.1, 0.5, 'olive'),
                                            (-0.1, 1.7, 0.5, 0.45, 'palm')]):
        p.add(ico(r, 1), col, x=x, y=y, z=z)
    return p


@kit
def paracarro():
    p = Prop('paracarro', ao=0.1)
    p.add(lathe([(0.0, 0.0), (0.19, 0.0), (0.18, 0.08), (0.15, 0.1), (0.13, 0.62), (0.14, 0.66), (0.14, 0.7),
                 (0.11, 0.8), (0.06, 0.86), (0.0, 0.87)], 10), 'stone')
    p.add(torus(0.135, 0.02, 10, 4), 'stoneDark', y=0.64)
    return p


@kit
def secchio():
    p = Prop('secchio', ao=0.08)
    p.add(lathe([(0.0, 0.0), (0.17, 0.0), (0.24, 0.3), (0.21, 0.3), (0.15, 0.04), (0.0, 0.04)], 14), 'coral')
    p.add(lathe([(0.0, 0.04), (0.15, 0.04), (0.2, 0.24), (0.0, 0.24)], 14), 'sandDark')
    p.add(torus(0.235, 0.02, 14, 4), 'cream', y=0.3)
    half = [(0.24 * math.cos(math.pi * t), 0.3 + 0.16 * math.sin(math.pi * t), 0.0) for t in [i / 8 for i in range(9)]]
    p.add(tube(half, 0.01, 4), 'cream', rz=0.0, ry=0.4)
    p.add(box(0.05, 0.34, 0.02), 'lemon', x=0.3, y=0.17, rz=-0.3)
    p.add(box(0.12, 0.12, 0.02), 'lemon', bevel=0.01, x=0.36, y=0.02, rz=-0.3)
    return p


# ---- gold (500 points): metallic yellow, a little brighter than the rest

@kit
def oro_gelato():
    p = Prop('oro-gelato', ao=0.4)
    gold_waffle = lambda c: 'goldDark' if waffle(c) == 'sandDark' else 'sandDark'
    p.add(lathe([(0, 0.0), (0.72, 1.45), (0.98, 1.5), (0.95, 1.6), (0, 1.6)], 16), gold_waffle)
    p.add(sphere(0.95, 16, 10), 'lemon', y=1.95, sy=0.85)
    p.add(torus(0.9, 0.16, 20, 6), 'lemon', y=1.62)
    for k in range(7):
        a = TAU * k / 7
        p.add(sphere(0.16, 8, 5), 'lemon', x=0.85 * math.cos(a), y=1.45, z=0.85 * math.sin(a), sy=1.5)
    p.add(sphere(0.7, 14, 9), 'gold', y=2.7, sy=0.85)
    p.add(sphere(0.2, 10, 6), 'coral', y=3.35)
    p.add(tube([(0, 3.5, 0), (0.12, 3.75, 0.05)], 0.02, 4), 'palmDark')
    return p


@kit
def oro_statua():
    p = Prop('oro-statua', ao=0.6)
    p.add(box(1.6, 0.35, 1.6), 'stone', bevel=0.05, y=0.17)
    p.add(box(1.25, 0.5, 1.25), 'stoneDark', bevel=0.05, y=0.6)
    p.add(box(1.4, 0.1, 1.4), 'stone', bevel=0.03, y=0.9)
    # the figure: robe, torso, bearded head, raised trident
    p.add(lathe([(0.5, 0.95), (0.42, 1.4), (0.34, 1.9), (0.36, 2.3), (0.46, 2.55), (0.2, 2.75), (0, 2.78)], 14), 'gold')
    p.add(sphere(0.25, 12, 8), 'gold', y=2.98)
    p.add(cone(0.2, 0.35, 10), 'goldDark', y=2.8, z=0.08, rx=math.pi)
    for k in range(7):
        a = math.pi * k / 6
        p.add(cone(0.06, 0.25, 4), 'gold', x=0.2 * math.cos(a), y=3.25 + 0.06 * math.sin(a), z=0.2 * math.sin(a) * 0.4 - 0.05)
    p.add(tube([(0.38, 2.5, 0), (0.62, 2.82, 0), (0.72, 3.2, 0)], 0.08, 6), 'gold')
    p.add(tube([(-0.38, 2.5, 0), (-0.55, 2.1, 0.1), (-0.5, 1.8, 0.25)], 0.08, 6), 'gold')
    p.add(cyl(0.035, 0.035, 2.6, 6), 'goldDark', x=0.75, y=2.75, z=0.0)
    p.add(box(0.5, 0.06, 0.06), 'goldDark', x=0.75, y=4.0)
    for dx in (-0.22, 0.0, 0.22):
        p.add(cone(0.06, 0.35, 6), 'gold', x=0.75 + dx, y=4.2)
    p.add(sphere(0.55, 12, 7), 'gold', x=-0.2, y=1.25, z=0.45, sx=0.9, sy=0.35, sz=0.5, ry=0.5)
    return p


@kit
def oro_bus():
    p = Prop('oro-bus', ao=0.8)
    for x in (-1.6, 1.6):
        for z in (-0.92, 0.92):
            wheel(p, x, 0.42, z, 0.42, 0.22)
    p.add(box(4.5, 1.7, 2.0), 'gold', bevel=0.18, seg=3, y=1.3)
    p.add(box(4.2, 0.16, 2.04), 'coral', y=0.95)
    for z in (-1.0, 1.0):
        for k in range(6):
            pane(p, 0.55, 0.45, x=-1.75 + k * 0.68, y=1.6, z=z)
    pane(p, 0.02, 0.6, 1.5, x=2.25, y=1.5)
    # the open top deck: rail and two rows of seats
    p.add(box(4.3, 0.06, 1.85), 'goldDark', y=2.18)
    for z in (-0.95, 0.95):
        p.add(box(4.3, 0.06, 0.06), 'chrome', y=2.65, z=z)
        for k in range(12):
            p.add(cyl(0.02, 0.02, 0.48, 4), 'chrome', x=-2.1 + k * 0.38, y=2.42, z=z)
    for k in range(5):
        for z in (-0.45, 0.45):
            p.add(box(0.36, 0.3, 0.6), 'coral', bevel=0.04, x=-1.6 + k * 0.75, y=2.36, z=z)
            p.add(box(0.08, 0.4, 0.6), 'coral', bevel=0.03, x=-1.78 + k * 0.75, y=2.55, z=z)
    for z in (-0.65, 0.65):
        p.add(cyl(0.13, 0.13, 0.06, 12), 'sun', x=2.25, y=0.75, z=z, rz=math.pi / 2)
    p.add(box(0.06, 0.16, 1.7), 'chrome', bevel=0.02, x=2.28, y=0.5)
    return p


# ------------------------------------------------------------ bake + export

def bake_ao(ob, distance, ground):
    sc = bpy.context.scene
    me = ob.data
    attr = me.color_attributes.new('AO', 'BYTE_COLOR', 'POINT')
    me.color_attributes.active_color = attr
    m = bpy.data.materials.get('bake') or bpy.data.materials.new('bake')
    me.materials.append(m)
    for o in sc.objects:
        o.hide_render = not (o is ob or (ground and o.name == '__ground'))
        o.select_set(o is ob)
    bpy.context.view_layer.objects.active = ob
    sc.world.light_settings.distance = distance
    bpy.ops.object.bake(type='AO', target='VERTEX_COLORS')
    albedo = me.color_attributes['Albedo']
    out = me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
    for i in range(len(me.vertices)):
        a = albedo.data[i].color
        k = 0.4 + 0.6 * attr.data[i].color[0]
        out.data[i].color = (a[0] * k, a[1] * k, a[2] * k, 1.0)
    me.color_attributes.remove(me.color_attributes['AO'])
    me.color_attributes.remove(me.color_attributes['Albedo'])
    me.color_attributes.active_color = me.color_attributes['Col']
    me.color_attributes.render_color_index = me.color_attributes.active_color_index
    me.materials.clear()


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 64
    if not sc.world:
        sc.world = bpy.data.worlds.new('w')

    gm = bpy.data.meshes.new('__ground')
    gb = bmesh.new()
    bmesh.ops.create_grid(gb, x_segments=1, y_segments=1, size=40)
    gb.to_mesh(gm)
    gb.free()
    ground = bpy.data.objects.new('__ground', gm)
    sc.collection.objects.link(ground)
    gm.materials.append(bpy.data.materials.new('g'))

    only = os.environ.get('KIT_ONLY')
    obs = []
    for fn in KIT:
        prop = fn()
        if only and prop.name not in only.split(','):
            prop.bm.free()
            continue
        ob = prop.build()
        obs.append((ob, prop))
    for ob, prop in obs:
        bake_ao(ob, prop.ao, prop.ground)
        print('baked', ob.name, len(ob.data.vertices), len(ob.data.polygons), flush=True)

    bpy.data.objects.remove(ground)
    for o in sc.objects:
        o.hide_render = False
        o.select_set(True)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=OUT, export_format='GLB', use_selection=False, export_apply=True,
        export_normals=True, export_texcoords=False, export_materials='NONE',
        export_vertex_color='NAME', export_vertex_color_name='Col', export_all_vertex_colors=False,
        export_active_vertex_color_when_no_material=True,
    )
    print('wrote', OUT, os.path.getsize(OUT))


main()
