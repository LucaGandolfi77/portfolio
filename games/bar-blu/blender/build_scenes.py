"""
Bar Blu — scene builder for Blender (headless).

  Blender -b --factory-startup --python blender/build_scenes.py -- [names...]

Builds every place of the story procedurally and renders one PNG per
lighting mood into blender/out/. scripts/pack-art.mjs turns them into
WebP for the game. No external assets: geometry, materials and text are
all made here.

Sets and moods:
  interior : mattina, pomeriggio, sera, notte, candele
  saletta  : saletta, palco
  cantina  : cantina
  exterior : esterno-notte, esterno-alba, esterno-chiuso
"""
import bpy, bmesh, math, os, sys, random
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
os.makedirs(OUT, exist_ok=True)
W, H = 1080, 1440
SAMPLES = int(os.environ.get('BB_SAMPLES', '96'))
FONT_SCRIPT = '/System/Library/Fonts/Supplemental/Brush Script.ttf'
FONT_CJK = '/System/Library/Fonts/Supplemental/Arial Unicode.ttf'
ONLY = set(sys.argv[sys.argv.index('--') + 1:]) if '--' in sys.argv else set()
rng = random.Random(7)
MATS = {}

# ---------------------------------------------------------------- basics

def reset():
    MATS.clear()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.samples = SAMPLES
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 6
    sc.render.resolution_x, sc.render.resolution_y = W, H
    sc.render.film_transparent = False
    sc.view_settings.view_transform = 'AgX'
    try:
        sc.view_settings.look = 'AgX - Medium High Contrast'
    except Exception:
        pass
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
        prefs.compute_device_type = 'METAL'
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
        sc.cycles.device = 'GPU'
    except Exception as e:
        print('GPU not available:', e)
    world = bpy.data.worlds.new('W')
    sc.world = world
    world.use_nodes = True
    return sc


def world_color(rgb, strength):
    bg = bpy.context.scene.world.node_tree.nodes['Background']
    bg.inputs[0].default_value = (*rgb, 1)
    bg.inputs[1].default_value = strength


def hexc(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(ch * 2 for ch in h)
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)



def mat(name, color='#808080', rough=0.6, metal=0.0, emit=None, strength=0.0, alpha=1.0, trans=0.0):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*hexc(color), 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*hexc(emit), 1)
        b.inputs['Emission Strength'].default_value = strength
    if trans:
        b.inputs['Transmission Weight'].default_value = trans
    if alpha < 1:
        b.inputs['Alpha'].default_value = alpha
    MATS[name] = m
    return m


def set_emit(name, strength):
    m = MATS.get(name)
    if m:
        m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = strength


def painted(name, c1, c2, scale=5.0, rough=0.85):
    """Brushy two-tone paint: noise drives a colour ramp and a little bump."""
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    b.inputs['Roughness'].default_value = rough
    tc = nt.nodes.new('ShaderNodeTexCoord')
    nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = scale
    nz.inputs['Detail'].default_value = 9
    nz.inputs['Roughness'].default_value = 0.62
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (*hexc(c1), 1)
    ramp.color_ramp.elements[1].color = (*hexc(c2), 1)
    ramp.color_ramp.elements[0].position = 0.35
    ramp.color_ramp.elements[1].position = 0.68
    bump = nt.nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.12
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    nt.links.new(nz.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    nt.links.new(nz.outputs['Fac'], bump.inputs['Height'])
    nt.links.new(bump.outputs['Normal'], b.inputs['Normal'])
    MATS[name] = m
    return m


def seascape(name, sea, sky):
    """A blue painting: dark sea below a lighter sky, a thin horizon of light, brushy noise."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    b.inputs['Roughness'].default_value = 0.8
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = 7
    nz.inputs['Detail'].default_value = 8
    mix = nt.nodes.new('ShaderNodeMath')
    mix.operation = 'MULTIPLY_ADD'
    mix.inputs[1].default_value = 0.18
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    el = ramp.color_ramp.elements
    el[0].position, el[0].color = 0.25, (*hexc(sea), 1)
    el[1].position, el[1].color = 0.62, (*hexc(sky), 1)
    mid = el.new(0.5)
    mid.color = (*hexc('#9cc3f0'), 1)
    el.new(0.47).color = (*hexc(sea), 1)
    nt.links.new(tc.outputs['UV'], sep.inputs[0])
    nt.links.new(tc.outputs['UV'], nz.inputs['Vector'])
    nt.links.new(nz.outputs['Fac'], mix.inputs[0])
    nt.links.new(sep.outputs['Y'], mix.inputs[2])
    nt.links.new(mix.outputs[0], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    MATS[name] = m
    return m


def image_emit(name, path, strength):
    """An emissive picture: used to see the bar's interior through its own shop window."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != 'OUTPUT_MATERIAL':
            nt.nodes.remove(n)
    tex = nt.nodes.new('ShaderNodeTexImage')
    if os.path.exists(path):
        tex.image = bpy.data.images.load(path)
    # crop a horizontal band of the portrait render so it is not squashed on a wide window
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping')
    band = (2.2 / 3.6) * (W / H)
    mp.inputs['Scale'].default_value = (1, band, 1)
    mp.inputs['Location'].default_value = (0, 0.36, 0)
    nt.links.new(tc.outputs['UV'], mp.inputs['Vector'])
    nt.links.new(mp.outputs['Vector'], tex.inputs['Vector'])
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Strength'].default_value = strength
    nt.links.new(tex.outputs['Color'], em.inputs['Color'])
    nt.links.new(em.outputs['Emission'], nt.nodes['Material Output'].inputs['Surface'])
    MATS[name] = m
    return m


def stripes(name, c1, c2, scale):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    b.inputs['Roughness'].default_value = 0.8
    wave = nt.nodes.new('ShaderNodeTexWave')
    wave.inputs['Scale'].default_value = scale
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.interpolation = 'CONSTANT'
    ramp.color_ramp.elements[0].color = (*hexc(c1), 1)
    ramp.color_ramp.elements[1].color = (*hexc(c2), 1)
    ramp.color_ramp.elements[1].position = 0.5
    tc = nt.nodes.new('ShaderNodeTexCoord')
    nt.links.new(tc.outputs['Object'], wave.inputs['Vector'])
    nt.links.new(wave.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    MATS[name] = m
    return m


def checker(name, c1, c2, scale):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    b.inputs['Roughness'].default_value = 0.35
    ch = nt.nodes.new('ShaderNodeTexChecker')
    ch.inputs['Scale'].default_value = scale
    ch.inputs['Color1'].default_value = (*hexc(c1), 1)
    ch.inputs['Color2'].default_value = (*hexc(c2), 1)
    tc = nt.nodes.new('ShaderNodeTexCoord')
    nt.links.new(tc.outputs['Object'], ch.inputs['Vector'])
    nt.links.new(ch.outputs['Color'], b.inputs['Base Color'])
    MATS[name] = m
    return m


def link(obj, m):
    obj.data.materials.clear()
    obj.data.materials.append(m)
    return obj


def box(name, loc, size, m, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        md = o.modifiers.new('bev', 'BEVEL')
        md.width = bevel
        md.segments = 3
    return link(o, m)


def cyl(name, loc, r, h, m, verts=32, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    bpy.ops.object.shade_smooth()
    return link(o, m)


def cone(name, loc, r1, r2, h, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=r1, radius2=r2, depth=h, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    bpy.ops.object.shade_smooth()
    return link(o, m)


def sphere(name, loc, r, m, seg=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=loc)
    o = bpy.context.object
    o.name = name
    bpy.ops.object.shade_smooth()
    return link(o, m)


def plane(name, loc, size, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.scale = (size[0] / 2, size[1] / 2, 1)
    bpy.ops.object.transform_apply(scale=True)
    return link(o, m)


def text(name, body, loc, size, m, font=None, rot=(math.radians(90), 0, 0), extrude=0.01, align='CENTER'):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.data.body = body
    o.data.size = size
    o.data.extrude = extrude
    o.data.align_x = align
    o.data.align_y = 'CENTER'
    if font and os.path.exists(font):
        o.data.font = bpy.data.fonts.load(font)
    o.data.materials.append(m)
    return o


def curtain(name, x0, y0, z0, width, height, m, axis='x', folds=9, depth=0.07):
    """A hanging cloth with soft folds, as a grid mesh."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    nx, nz = 60, 12
    grid = []
    for j in range(nz + 1):
        row = []
        for i in range(nx + 1):
            u = i / nx
            v = j / nz
            off = depth * math.sin(u * folds * math.pi * 2) * (0.6 + 0.4 * v)
            if axis == 'x':
                co = (x0 + u * width, y0 + off, z0 + v * height)
            else:
                co = (x0 + off, y0 + u * width, z0 + v * height)
            row.append(bm.verts.new(co))
        grid.append(row)
    for j in range(nz):
        for i in range(nx):
            bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    for p in me.polygons:
        p.use_smooth = True
    md = o.modifiers.new('solid', 'SOLIDIFY')
    md.thickness = 0.02
    return link(o, m)


def light(name, kind, loc, energy, color='#ffffff', size=0.2, rot=(0, 0, 0)):
    ld = bpy.data.lights.new(name, kind)
    ld.energy = energy
    ld.color = hexc(color)
    if kind == 'AREA':
        ld.size = size
    elif kind in ('POINT', 'SPOT'):
        ld.shadow_soft_size = size
    elif kind == 'SUN':
        ld.angle = size
    o = bpy.data.objects.new(name, ld)
    o.location = loc
    o.rotation_euler = rot
    bpy.context.collection.objects.link(o)
    return o


def camera(loc, rot_deg, lens=28, focus=None, fstop=2.8):
    cd = bpy.data.cameras.new('cam')
    cd.lens = lens
    cd.sensor_fit = 'VERTICAL'
    cd.sensor_height = 36
    if focus:
        cd.dof.use_dof = True
        cd.dof.focus_distance = focus
        cd.dof.aperture_fstop = fstop
    o = bpy.data.objects.new('cam', cd)
    o.location = loc
    o.rotation_euler = tuple(math.radians(a) for a in rot_deg)
    bpy.context.collection.objects.link(o)
    bpy.context.scene.camera = o
    return o


def glare():
    """Soft bloom on bright things (neon, bulbs) through the compositor, if available."""
    sc = bpy.context.scene
    try:
        tree = bpy.data.node_groups.new('Bloom', 'CompositorNodeTree')
        sc.compositing_node_group = tree
        inp = tree.nodes.new('CompositorNodeRLayers')
        gl = tree.nodes.new('CompositorNodeGlare')
        out = tree.nodes.new('NodeGroupOutput')
        tree.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
        for sock, val in (('Type', 'Bloom'), ('Quality', 'High')):
            try:
                gl.inputs[sock].default_value = val
            except Exception as e:
                print('glare option', sock, e)
        for sock, val in (('Threshold', 1.0), ('Size', 0.6), ('Strength', 0.45)):
            if sock in gl.inputs:
                gl.inputs[sock].default_value = val
        tree.links.new(inp.outputs['Image'], gl.inputs['Image'])
        tree.links.new(gl.outputs['Image'], out.inputs[0])
        return True
    except Exception as e:
        print('no bloom:', e)
        return False


def render(name):
    if ONLY and name not in ONLY:
        return
    sc = bpy.context.scene
    sc.render.filepath = os.path.join(OUT, name + '.png')
    sc.render.image_settings.file_format = 'PNG'
    bpy.ops.render.render(write_still=True)
    print('RENDERED', name)


def show(objs, visible):
    for o in objs:
        o.hide_render = not visible

# ---------------------------------------------------------------- interior

def build_interior():
    reset()
    glare()
    wall = painted('wall', '#173c69', '#2f6aa8', 3.5)
    wain = mat('wainscot', '#3a2418', 0.45)
    floor = checker('floor', '#8f877a', '#2b2a2e', 15)
    ceil = mat('ceiling', '#1b1a1f', 0.9)
    wood = mat('counterwood', '#4a2a1a', 0.35)
    zinc = mat('zinc', '#c9ccd1', 0.22, 1.0)
    chrome = mat('chrome', '#e6e6ea', 0.08, 1.0)
    china = mat('china', '#f2efe8', 0.15)
    glass = mat('glass', '#dfe9f2', 0.02, trans=1.0)
    velvet = mat('velvet', '#6b0f1c', 0.95)
    tablewood = mat('tablewood', '#5a3a26', 0.4)
    darkmetal = mat('darkmetal', '#1d1f24', 0.4, 0.8)
    neon = mat('neon', '#8fd0ff', 0.3, emit='#4fb2ff', strength=22)
    bulb = mat('bulb', '#ffe7b8', 0.3, emit='#ffcf8a', strength=18)
    shade = mat('shade', '#2c6e5a', 0.4, 0.3)
    street = mat('street', '#000000', 1.0, emit='#2a3f66', strength=1.0)
    frame = mat('frame', '#b08a4a', 0.3, 0.8)
    photo = painted('photo', '#3b342c', '#a69882', 30)
    red = mat('redpaper', '#b3121b', 0.6)
    candle_m = mat('candle', '#c0141c', 0.5)
    flame = mat('flame', '#ffb347', 0.2, emit='#ff9a2e', strength=30)

    D = 8.2  # depth of the room
    # floor, walls, ceiling
    plane('floor', (0, D / 2, 0), (7.4, D + 1), floor)
    plane('ceil', (0, D / 2, 3.3), (7.4, D + 1), ceil, rot=(math.pi, 0, 0))
    plane('wall_l', (-3.7, D / 2, 1.65), (D + 1, 3.3), wall, rot=(math.radians(90), 0, math.radians(90)))
    plane('wall_r', (3.7, D / 2, 1.65), (D + 1, 3.3), wall, rot=(math.radians(90), 0, math.radians(-90)))
    box('wain_l', (-3.66, D / 2, 0.5), (0.06, D + 1, 1.0), wain)
    box('wain_r', (3.66, D / 2, 0.5), (0.06, D + 1, 1.0), wain)
    # back wall with a window (left) and a door (right)
    bw = []
    for nm, x, w_, z, h_ in (('bw_left', -3.25, 0.9, 1.65, 3.3), ('bw_mid', 0.4, 0.8, 1.65, 3.3), ('bw_right', 3.15, 1.1, 1.65, 3.3),
                             ('bw_under', -1.4, 2.8, 0.45, 0.9), ('bw_over', -1.4, 2.8, 3.05, 0.5), ('bw_curt_over', 1.7, 1.8, 2.85, 0.9)):
        bw.append(box(nm, (x, D, z), (w_, 0.12, h_), wall))
    box('wain_b', (-1.4, D - 0.08, 0.45), (2.8, 0.06, 0.9), wain)
    # window glass + frame + street glow behind
    plane('win_glass', (-1.4, D - 0.02, 1.75), (2.8, 1.8), glass, rot=(math.radians(90), 0, 0))
    for i, x in enumerate((-2.8, -1.4, 0.0)):
        box('win_mullion%d' % i, (x, D - 0.05, 1.75), (0.06, 0.08, 1.8), darkmetal)
    box('win_sill', (-1.4, D - 0.12, 0.88), (2.9, 0.25, 0.05), wood)
    plane('street', (-0.5, D + 3.0, 1.6), (12, 6), street, rot=(math.radians(90), 0, 0))
    street_lights = []
    for i in range(14):
        street_lights.append(sphere('sl%d' % i, (rng.uniform(-4, 3), D + 2.6 + rng.uniform(0, 0.5), rng.uniform(0.6, 2.8)), rng.uniform(0.05, 0.12),
                                    mat('sl%d' % i, '#000000', 1, emit=rng.choice(['#ffb35c', '#ff6a3c', '#9ad0ff', '#ffe0a0']), strength=rng.uniform(15, 40))))
    # door on the left wall, near the back
    box('door', (-3.64, 7.0, 1.3), (0.08, 1.1, 2.6), mat('doorwood', '#24160f', 0.4))
    plane('door_glass', (-3.59, 7.0, 1.75), (0.7, 1.2), mat('doorglass', '#000000', 0.1, emit='#24365c', strength=0.6), rot=(math.radians(90), 0, math.radians(90)))
    sphere('door_bell', (-3.5, 6.35, 2.5), 0.05, mat('brass', '#d4a548', 0.25, 1.0))
    # neon sign over the window
    sign = text('sign', 'Bar Blu', (-1.4, D - 0.1, 3.02), 0.62, neon, FONT_SCRIPT)
    sign_light = light('sign_light', 'POINT', (-1.4, D - 0.5, 2.9), 120, '#4fb2ff', 0.4)
    # the curtain to the saletta: an opening in the back wall, two velvet halves with a slit
    curtain('curtain_l', 0.8, D - 0.1, 0.06, 0.86, 2.34, velvet, axis='x', folds=4, depth=0.05)
    curtain('curtain_r', 1.74, D - 0.1, 0.06, 0.86, 2.34, velvet, axis='x', folds=4, depth=0.05)
    box('curtain_rod', (1.7, D - 0.14, 2.42), (2.0, 0.04, 0.04), mat('brass', '#d4a548', 0.25, 1.0))
    plane('saletta_back', (1.7, D + 1.2, 1.2), (2.4, 2.4), mat('saletta_back', '#000', 0.8, emit='#3a0a14', strength=0.6), rot=(math.radians(90), 0, 0))
    glow_r = light('glow_r', 'AREA', (1.4, D + 0.5, 1.0), 260, '#ff3352', 1.0, rot=(math.radians(90), 0, 0))
    glow_g = light('glow_g', 'AREA', (2.0, D + 0.5, 1.4), 160, '#38ff9c', 0.8, rot=(math.radians(90), 0, 0))
    # tables and chairs
    def table(x, y):
        cyl('tt_%d_%d' % (x * 10, y * 10), (x, y, 0.74), 0.38, 0.04, mat('marble', '#e7e2d8', 0.25))
        cyl('tl_%d_%d' % (x * 10, y * 10), (x, y, 0.37), 0.04, 0.74, darkmetal)
        cyl('tb_%d_%d' % (x * 10, y * 10), (x, y, 0.02), 0.22, 0.04, darkmetal)
        for k, a in enumerate((0.3, 3.4)):
            cx, cy = x + 0.6 * math.cos(a), y + 0.6 * math.sin(a)
            box('cs_%d_%d_%d' % (x * 10, y * 10, k), (cx, cy, 0.46), (0.42, 0.42, 0.05), tablewood, 0.01)
            box('cb_%d_%d_%d' % (x * 10, y * 10, k), (cx + 0.2 * math.cos(a), cy + 0.2 * math.sin(a), 0.75), (0.08 if abs(math.cos(a)) > 0.5 else 0.42, 0.42 if abs(math.cos(a)) > 0.5 else 0.08, 0.55), tablewood, 0.01)
            for lx in (-0.17, 0.17):
                for ly in (-0.17, 0.17):
                    cyl('cl_%d_%d_%d_%d_%d' % (x * 10, y * 10, k, lx * 100, ly * 100), (cx + lx, cy + ly, 0.22), 0.015, 0.45, darkmetal)
    table(-2.3, 6.9)   # Elvira's table by the window
    table(-0.6, 4.6)
    table(2.3, 3.3)
    cups_elvira = [cyl('cupE1', (-2.42, 6.8, 0.79), 0.04, 0.06, china), cyl('cupE2', (-2.12, 7.0, 0.79), 0.04, 0.06, china)]
    # left wall: shelf with bottles, father's photo, calendar
    box('shelf', (-3.55, 3.0, 1.9), (0.25, 2.6, 0.04), wood)
    for i in range(13):
        h_ = rng.uniform(0.25, 0.4)
        cyl('bottle%d' % i, (-3.55, 1.85 + i * 0.19, 1.92 + h_ / 2), 0.045, h_,
            mat('bot%d' % (i % 5), rng.choice(['#2f5d2a', '#6b3a12', '#d7c9a0', '#3d1f3a', '#9fb7c2']), 0.05, trans=0.6), verts=16)
    box('photo_frame', (-3.62, 5.4, 1.85), (0.03, 0.5, 0.62), frame)
    plane('photo', (-3.6, 5.4, 1.85), (0.42, 0.54), photo, rot=(math.radians(90), 0, math.radians(90)))
    plane('calendar', (-3.6, 6.6, 1.6), (0.38, 0.55), red, rot=(math.radians(90), 0, math.radians(90)))
    # pendant lamps
    pend, pend_l = [], []
    for i, y in enumerate((2.2, 4.4, 6.5)):
        cyl('cord%d' % i, (0, y, 3.0), 0.006, 0.6, darkmetal, 8)
        cone('shade%d' % i, (0, y, 2.62), 0.28, 0.06, 0.22, shade)
        pend.append(sphere('bulb%d' % i, (0, y, 2.53), 0.06, bulb))
        pend_l.append(light('pl%d' % i, 'POINT', (0, y, 2.45), 160, '#ffc880', 0.15))
    # the counter (foreground)
    box('counter', (0, -0.05, 0.52), (7.4, 0.62, 1.04), wood, 0.01)
    box('counter_top', (0, -0.05, 1.065), (7.4, 0.7, 0.05), zinc, 0.01)
    box('counter_lip', (0, 0.29, 1.07), (7.4, 0.04, 0.07), chrome, 0.005)
    # espresso machine (left), cups, sugar bowl, napkins, saucer
    box('espresso', (-2.6, -0.15, 1.42), (1.1, 0.5, 0.65), chrome, 0.03)
    box('espresso_top', (-2.6, -0.15, 1.78), (1.0, 0.45, 0.06), mat('cupwarm', '#2a2a2a', 0.4, 0.6))
    for i in range(4):
        cyl('topcup%d' % i, (-2.95 + i * 0.22, -0.15, 1.86), 0.04, 0.07, china)
    cyl('group1', (-2.8, 0.12, 1.2), 0.05, 0.1, chrome, rot=(math.radians(90), 0, 0))
    cyl('group2', (-2.35, 0.12, 1.2), 0.05, 0.1, chrome, rot=(math.radians(90), 0, 0))
    sugar = cyl('sugar', (0.34, 0.12, 1.16), 0.075, 0.13, mat('sugarglass', '#e9f0f2', 0.05, trans=0.9))
    cyl('sugarlid', (0.34, 0.12, 1.235), 0.08, 0.02, chrome)
    receipt = plane('receipt', (0.27, 0.07, 1.093), (0.07, 0.12), mat('receipt', '#f4f1ea', 0.7), rot=(0, 0, math.radians(28)))
    for i, (x, y) in enumerate(((-0.32, 0.14), (-2.0, 0.0))):
        cyl('saucer%d' % i, (x, y, 1.095), 0.075, 0.012, china)
        cyl('cup%d' % i, (x, y, 1.13), 0.042, 0.06, china)
    box('napkins', (0.72, 0.2, 1.16), (0.22, 0.12, 0.14), chrome, 0.01)
    # candles (only lit in the blackout)
    candles, candle_lights = [], []
    for i, (x, y, z) in enumerate(((-1.2, 0.0, 1.09), (0.3, 0.05, 1.09), (1.25, -0.08, 1.09), (-2.3, 6.9, 0.76), (-0.6, 4.6, 0.76), (2.3, 3.3, 0.76), (-1.4, D - 0.15, 0.91), (-0.9, D - 0.15, 0.91))):
        candles.append(cyl('candle%d' % i, (x, y, z + 0.08), 0.028, 0.16, candle_m, 12))
        candles.append(sphere('flame%d' % i, (x, y, z + 0.185), 0.016, flame, 10))
        candle_lights.append(light('cl%d' % i, 'POINT', (x, y, z + 0.25), 9 if y < 1 else 14, '#ff9a40', 0.03))
    # coat rack near the door
    cyl('rack', (3.2, D - 0.6, 0.9), 0.025, 1.8, darkmetal, 12)
    sphere('coat', (3.2, D - 0.65, 1.45), 0.25, mat('coat', '#3d3a46', 0.9))

    cam = camera((0, -0.95, 1.6), (85, 0, 0), lens=27, focus=6.0, fstop=4.0)
    sun = light('sun', 'SUN', (0, 20, 10), 3, '#fff1d6', 0.05, rot=(math.radians(-62), 0, math.radians(180)))
    fill = light('fill', 'AREA', (0, 2.5, 3.2), 140, '#bcd3ff', 5, rot=(0, 0, 0))

    def mood(name, world, wstr, sun_e, sun_col, sun_rot, street_col, street_e, pend_e, neon_e, glow_e, fill_e, cand):
        world_color(hexc(world), wstr)
        sun.data.energy = sun_e
        sun.data.color = hexc(sun_col)
        sun.rotation_euler = tuple(math.radians(a) for a in sun_rot)
        MATS['street'].node_tree.nodes['Principled BSDF'].inputs['Emission Color'].default_value = (*hexc(street_col), 1)
        set_emit('street', street_e)
        for l in pend_l:
            l.data.energy = pend_e
        set_emit('bulb', 18 if pend_e else 0)
        set_emit('neon', neon_e)
        sign_light.data.energy = neon_e * 5
        glow_r.data.energy = glow_e
        glow_g.data.energy = glow_e * 0.6
        fill.data.energy = fill_e
        show(candles + candle_lights, cand)
        show(street_lights, street_e < 3)
        render(name)

    #     name         world      wstr  sun  sun_col    sun_rot           street     se   pend neon glow  fill cand
    mood('mattina',    '#c8dcff', 0.8, 4.0, '#fff4e0', (-55, 0, 180),   '#dfe8f5', 6.0, 0,   6,   60,  90,  False)
    mood('pomeriggio', '#ffd9a8', 0.6, 6.0, '#ffb36b', (-78, 0, 160),   '#ffcf96', 5.0, 30,  8,   80,  50,  False)
    mood('sera',       '#3a3f73', 0.3, 0.0, '#ffffff', (-70, 0, 180),   '#4b3f8a', 1.6, 160, 22,  260, 25,  False)
    mood('notte',      '#0a1230', 0.15, 0.0, '#ffffff', (-70, 0, 180),  '#16244a', 0.9, 85,  30,  420, 8,   False)
    mood('candele',    '#05070f', 0.05, 0.0, '#ffffff', (-70, 0, 180),  '#0c1428', 0.5, 0,   0,   0,   0,   True)

# ---------------------------------------------------------------- saletta

def build_saletta():
    reset()
    glare()
    carpet = painted('carpet', '#3a0710', '#5c1220', 14, 0.98)
    wallp = painted('wallpaper', '#2a1013', '#4a1d22', 2.0, 0.9)
    darkmetal = mat('darkmetal', '#121318', 0.35, 0.8)
    gold = mat('gold', '#e0b450', 0.25, 1.0)
    red = mat('redpaper', '#c2121c', 0.55)
    ceil = mat('ceiling', '#140c0d', 0.9)
    plane('floor', (0, 2, 0), (5, 5), carpet)
    plane('ceil', (0, 2, 2.7), (5, 5), ceil, rot=(math.pi, 0, 0))
    plane('back', (0, 3.6, 1.35), (5, 2.7), wallp, rot=(math.radians(90), 0, 0))
    plane('wl', (-2.2, 2, 1.35), (5, 2.7), wallp, rot=(math.radians(90), 0, math.radians(90)))
    plane('wr', (2.2, 2, 1.35), (5, 2.7), wallp, rot=(math.radians(90), 0, math.radians(-90)))
    machines = []
    names = (('福', '#ff3d5a', '#ffd23d'), ('禄', '#3dff9e', '#3db4ff'), ('寿', '#b83dff', '#ff8a3d'))
    for i, (glyph, c1, c2) in enumerate(names):
        x = (i - 1) * 1.12
        parts = []
        parts.append(box('cab%d' % i, (x, 3.2, 0.9), (0.9, 0.7, 1.8), darkmetal, 0.03))
        parts.append(box('topper%d' % i, (x, 3.12, 1.98), (0.86, 0.5, 0.36), mat('topper%d' % i, '#111', 0.3, emit=c1, strength=6), 0.03))
        parts.append(plane('screen%d' % i, (x, 2.84, 1.25), (0.7, 0.5), mat('screen%d' % i, '#000', 0.2, emit=c2, strength=4.5), rot=(math.radians(80), 0, 0)))
        for r in range(3):
            parts.append(plane('reel%d_%d' % (i, r), (x - 0.22 + r * 0.22, 2.83, 1.27), (0.17, 0.32), mat('reel%d' % r, '#fff6e0', 0.4, emit='#ffe9c0', strength=0.9), rot=(math.radians(80), 0, 0)))
        for side in (-1, 1):
            parts.append(box('trim%d_%d' % (i, side), (x + side * 0.455, 2.86, 0.95), (0.025, 0.04, 1.75), mat('trim%d' % i, '#111', 0.3, emit=c1, strength=7)))
        parts.append(box('base%d' % i, (x, 2.86, 0.05), (0.9, 0.04, 0.03), mat('trim%d' % i, '#111', 0.3, emit=c1, strength=7)))
        parts.append(box('cabface%d' % i, (x, 2.855, 0.45), (0.86, 0.01, 0.7), painted('cabface', '#1a1220', '#2c1d33', 6, 0.5)))
        parts.append(box('deck%d' % i, (x, 2.78, 0.85), (0.86, 0.22, 0.08), mat('deck', '#1a1a1f', 0.3, 0.6)))
        for b_ in range(4):
            parts.append(cyl('btn%d_%d' % (i, b_), (x - 0.27 + b_ * 0.18, 2.73, 0.9), 0.035, 0.03, mat('btn%d' % b_, '#000', 0.3, emit=['#ff2d2d', '#ffd02d', '#2dff6a', '#2db8ff'][b_], strength=8), rot=(0, 0, 0)))
        parts.append(plane('paper%d' % i, (x, 2.84, 1.66), (0.36, 0.36), red, rot=(math.radians(90), 0, math.radians(45))))
        parts.append(text('glyph%d' % i, glyph, (x, 2.825, 1.645), 0.26, gold, FONT_CJK, extrude=0.004))
        parts.append(light('mglow%d' % i, 'AREA', (x, 2.5, 1.3), 90, c2, 0.6, rot=(math.radians(-90), 0, 0)))
        machines += parts
    # sofa for Ugo, stool, ashtray
    sofa_m = mat('sofa', '#3c2a24', 0.85)
    sofa = [box('sofa_seat', (-1.85, 1.6, 0.25), (0.75, 1.6, 0.4), sofa_m, 0.05), box('sofa_back', (-2.12, 1.6, 0.6), (0.2, 1.6, 0.7), sofa_m, 0.05)]
    stool = [cyl('stool_seat', (0.2, 2.2, 0.72), 0.19, 0.06, mat('stoolred', '#7a1018', 0.6)), cyl('stool_leg', (0.2, 2.2, 0.36), 0.025, 0.7, darkmetal, 12)]
    bulb = sphere('bulb', (0, 1.6, 2.35), 0.06, mat('bulb', '#ffe0a8', 0.3, emit='#ffbf70', strength=25))
    bulb_l = light('bulbl', 'POINT', (0, 1.6, 2.25), 60, '#ffb870', 0.1)
    # stage version: canvases, string lights, chairs, microphone, stars
    stage = []
    blues = [('#0e2a52', '#3f7fc4'), ('#13213f', '#6aa6e8'), ('#0b1d3a', '#2a6fb5'), ('#1d3b66', '#9cc6f0'), ('#081631', '#4b86c9')]
    for i, (c1, c2) in enumerate(blues):
        x = -1.7 + i * 0.85
        stage.append(box('frame%d' % i, (x, 3.56, 1.45), (0.66, 0.04, 0.86 if i % 2 else 0.66), gold))
        stage.append(plane('canvas%d' % i, (x, 3.53, 1.45), (0.6, 0.8 if i % 2 else 0.6), painted('canvas%d' % i, c1, c2, rng.uniform(1.5, 4), 0.8), rot=(math.radians(90), 0, 0)))
    for i in range(18):
        t = i / 17
        x = -2.0 + t * 4.0
        z = 2.45 - 0.25 * math.sin(t * math.pi)
        stage.append(sphere('sbulb%d' % i, (x, 2.9, z), 0.03, mat('sbulb', '#fff', 0.3, emit='#ffd38a', strength=40), 8))
    for row in range(2):
        for k in range(3):
            cx, cy = -0.9 + k * 0.9, 1.0 + row * 0.8
            cw = mat('chairw', '#6a4a30', 0.5)
            stage.append(box('chair%d%d' % (row, k), (cx, cy, 0.45), (0.4, 0.4, 0.04), cw, 0.01))
            stage.append(box('chairb%d%d' % (row, k), (cx, cy - 0.19, 0.72), (0.4, 0.04, 0.5), cw, 0.01))
            for lx in (-0.17, 0.17):
                for ly in (-0.17, 0.17):
                    stage.append(cyl('chl%d%d%d%d' % (row, k, lx * 100, ly * 100), (cx + lx, cy + ly, 0.22), 0.015, 0.44, darkmetal, 8))
    stage += [cyl('micstand', (0, 3.0, 0.8), 0.012, 1.6, darkmetal, 8), sphere('mic', (0, 3.0, 1.62), 0.04, mat('micm', '#333', 0.3, 0.9))]
    for i in range(40):
        stage.append(sphere('star%d' % i, (rng.uniform(-2, 2), rng.uniform(0.5, 3.4), 2.69), rng.uniform(0.008, 0.02), mat('starm', '#fff', 0.3, emit='#cfe6ff', strength=60), 6))
    stage_light = light('stagel', 'SPOT', (0, 0.2, 2.5), 300, '#ffd8a0', 0.3, rot=(math.radians(60), 0, 0))
    camera((0.15, -0.6, 1.45), (84, 0, 0), lens=24, focus=3.4, fstop=3.5)
    world_color(hexc('#020203'), 0.1)
    show(stage + [stage_light], False)
    render('saletta')
    show(machines, False)
    show(stage + [stage_light], True)
    set_emit('bulb', 8)
    bulb_l.data.energy = 25
    render('palco')

# ---------------------------------------------------------------- cantina

def build_cantina():
    reset()
    glare()
    stone = painted('stone', '#2a2622', '#4a443c', 6, 0.95)
    plane('floor', (0, 2, 0), (5, 5), painted('cfloor', '#1e1b18', '#35302a', 8))
    plane('back', (0, 3.4, 1.3), (5, 2.6), stone, rot=(math.radians(90), 0, 0))
    plane('wl', (-2.1, 2, 1.3), (5, 2.6), stone, rot=(math.radians(90), 0, math.radians(90)))
    plane('wr', (2.1, 2, 1.3), (5, 2.6), stone, rot=(math.radians(90), 0, math.radians(-90)))
    plane('ceil', (0, 2, 2.6), (5, 5), mat('cceil', '#141210', 0.9), rot=(math.pi, 0, 0))
    canvases = [('#0a1f44', '#5d9ad8'), ('#0f2b57', '#2f6db3'), ('#13284d', '#a7c8ee'), ('#071733', '#3a78c0'), ('#1b335c', '#7fb0e6'), ('#091a38', '#2b5c9e')]
    for i, (c1, c2) in enumerate(canvases):
        x = -1.55 + i * 0.62
        tilt = math.radians(rng.uniform(6, 11))
        h_ = rng.uniform(1.0, 1.35)
        y = 2.55 - (i % 2) * 0.3
        rz = rng.uniform(-0.12, 0.12)
        plane('canvasback%d' % i, (x, y + 0.015, h_ / 2 + 0.02), (0.82, h_ + 0.05), mat('stretcher', '#2a2016', 0.8), rot=(math.radians(90) - tilt, 0, rz))
        plane('canvas%d' % i, (x, y, h_ / 2 + 0.02), (0.78, h_), seascape('cv%d' % i, c1, c2), rot=(math.radians(90) - tilt, 0, rz))
    for i in range(4):
        box('crate%d' % i, (rng.uniform(-1.8, 1.8), rng.uniform(1.0, 2.2), 0.18 + (i == 3) * 0.36), (0.5, 0.35, 0.36), mat('crate', '#6b5134', 0.8), 0.01)
    easel = [box('easel_l', (1.3, 1.6, 0.8), (0.04, 0.04, 1.6), mat('easel', '#8a6a44', 0.6)), plane('easel_canvas', (1.3, 1.55, 1.15), (0.55, 0.7), painted('wenzhou', '#0c2550', '#79aee6', 2.2, 0.75), rot=(math.radians(82), 0, 0))]
    sphere('bulb', (0, 1.8, 2.3), 0.05, mat('bulb', '#ffe0a8', 0.3, emit='#ffbf70', strength=30))
    light('bulbl', 'POINT', (0, 1.8, 2.2), 70, '#ffb870', 0.05)
    light('bluefill', 'AREA', (0, 0, 1.0), 20, '#4b7fd4', 2.0, rot=(math.radians(90), 0, 0))
    camera((0.1, -0.6, 1.35), (82, 0, 0), lens=24, focus=3.0, fstop=3.0)
    world_color(hexc('#010102'), 0.05)
    render('cantina')

# ---------------------------------------------------------------- exterior

def build_exterior():
    reset()
    glare()
    plaster = painted('plaster', '#8a6a4a', '#b08b60', 2.5, 0.9)
    asphalt = painted('asphalt', '#111114', '#26262c', 20, 0.25)
    sidewalk = painted('sidewalk', '#4a4846', '#6a6764', 12, 0.5)
    darkmetal = mat('darkmetal', '#16181d', 0.35, 0.8)
    neon = mat('neon', '#8fd0ff', 0.3, emit='#4fb2ff', strength=30)
    plane('street', (0, 3, 0), (30, 12), asphalt)
    box('kerb', (0, 6.9, 0.07), (30, 0.2, 0.14), sidewalk)
    box('sidewalk', (0, 8.4, 0.07), (30, 2.8, 0.14), sidewalk)
    box('facade', (0, 10.0, 4.5), (30, 0.4, 9), plaster)
    box('facade_r', (-8.5, 10, 4.5), (0.1, 0.1, 9), plaster)
    # storefront
    inside_night = image_emit('inside_night', os.path.join(OUT, 'sera.png'), 1.6)
    inside_day = image_emit('inside_day', os.path.join(OUT, 'mattina.png'), 1.1)
    window = plane('window', (-0.9, 9.78, 1.55), (3.6, 2.2), inside_night, rot=(math.radians(90), 0, 0))
    plane('window_glass', (-0.9, 9.7, 1.55), (3.6, 2.2), mat('shopglass', '#cfe0ff', 0.03, trans=0.85), rot=(math.radians(90), 0, 0))
    door = plane('doorglow', (1.9, 9.78, 1.4), (1.1, 2.4), mat('doorglow', '#000', 0.1, emit='#d98a4a', strength=0.8), rot=(math.radians(90), 0, 0))
    box('frame_top', (0.0, 9.74, 2.75), (5.8, 0.12, 0.12), darkmetal)
    box('frame_bot', (-0.9, 9.74, 0.45), (3.8, 0.12, 0.12), darkmetal)
    for x in (-2.75, 0.95, 1.35, 2.45):
        box('frame_v%d' % int(x * 10), (x, 9.74, 1.55), (0.1, 0.12, 2.5), darkmetal)
    box('signboard', (0.0, 9.72, 3.3), (5.4, 0.15, 0.8), mat('signboard', '#101626', 0.5))
    sign = text('sign', 'Bar Blu', (0.0, 9.62, 3.26), 0.86, neon, FONT_SCRIPT)
    sign_light = light('signl', 'AREA', (0, 9.0, 3.3), 220, '#4fb2ff', 3.0, rot=(math.radians(-90), 0, 0))
    awning = box('awning', (0.0, 9.3, 2.86), (5.9, 0.9, 0.04), stripes('awn', '#1d4a8a', '#e9e4d8', 6))
    awning.rotation_euler = (math.radians(-18), 0, 0)
    cyl('downpipe', (3.3, 9.75, 4.5), 0.06, 9, darkmetal, 12)
    plane('poster', (-3.8, 9.79, 1.7), (0.9, 1.25), painted('poster', '#c8b28a', '#e8dcc0', 18, 0.9), rot=(math.radians(90), 0, 0))
    for bx in (-2.2, 0.2, 2.6):
        cyl('bollard%d' % int(bx * 10), (bx, 7.25, 0.5), 0.07, 0.72, darkmetal, 12)
    for ry in (2.6, 3.9):
        box('rail%d' % int(ry * 10), (0, ry, 0.005), (30, 0.07, 0.01), mat('rail', '#9aa0a8', 0.15, 1.0))
    # upper windows
    for i in range(5):
        x = -6 + i * 3
        box('uw%d' % i, (x, 9.78, 5.5), (1.2, 0.05, 1.6), mat('uw%d' % i, '#0a0f1a', 0.2, emit=rng.choice(['#000000', '#ffcf8a', '#000000', '#9ab8ff']), strength=rng.choice([0, 1.5, 0, 0.8])))
        box('uws%d' % i, (x, 9.7, 4.65), (1.4, 0.2, 0.08), plaster)
    # shutters (closed version)
    shutter_m = painted('shutter', '#5a5f66', '#7c828a', 40, 0.4)
    shutters = [box('shutter_w', (-0.9, 9.68, 1.55), (3.7, 0.04, 2.3), shutter_m), box('shutter_d', (1.9, 9.68, 1.4), (1.15, 0.04, 2.5), shutter_m)]
    lucky = text('lucky', 'LUCKY STAR', (-0.9, 9.64, 1.6), 0.38, mat('lucky', '#ffd23d', 0.3, emit='#ff9e2d', strength=12), 'Arial Black.ttf' if False else None)
    shutters.append(lucky)
    # street lamp, tram pole, bench
    cyl('lamp_pole', (-3.4, 7.5, 2.4), 0.06, 4.8, darkmetal, 12)
    cyl('lamp_arm', (-2.9, 7.5, 4.75), 0.04, 1.0, darkmetal, 12, rot=(0, math.radians(90), 0))
    lamp = sphere('lamp', (-2.4, 7.5, 4.65), 0.16, mat('lampg', '#fff', 0.3, emit='#ffcf8a', strength=25))
    lamp_l = light('lampl', 'SPOT', (-2.4, 7.5, 4.5), 900, '#ffc27a', 0.3, rot=(0, 0, 0))
    cyl('tram_pole', (4.2, 6.6, 3.5), 0.08, 7, darkmetal, 12)
    box('bench', (3.2, 8.6, 0.45), (1.6, 0.4, 0.06), mat('benchw', '#3b2a1c', 0.6))
    camera((0.2, 3.4, 1.45), (89, 0, 0), lens=22, focus=6.3, fstop=4.0)

    def mood(name, world, wstr, win, sign_e, lamp_e, closed):
        world_color(hexc(world), wstr)
        window.data.materials[0] = inside_night
        set_emit('doorglow', win * 0.7)
        set_emit('neon', sign_e)
        sign_light.data.energy = sign_e * 8
        lamp_l.data.energy = lamp_e
        set_emit('lampg', 25 if lamp_e else 0)
        show(shutters, closed)
        render(name)

    mood('esterno-notte', '#0b1430', 0.25, 1.0, 30, 900, False)
    # dawn: a pink-blue sky through a gradient world
    w = bpy.context.scene.world.node_tree
    sky = w.nodes.new('ShaderNodeTexGradient')
    tc = w.nodes.new('ShaderNodeTexCoord')
    mp = w.nodes.new('ShaderNodeMapping')
    mp.inputs['Rotation'].default_value = (0, math.radians(-90), 0)
    ramp = w.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (*hexc('#ffb38a'), 1)
    ramp.color_ramp.elements[1].color = (*hexc('#3b5fa8'), 1)
    ramp.color_ramp.elements[0].position = 0.45
    ramp.color_ramp.elements[1].position = 0.62
    w.links.new(tc.outputs['Generated'], mp.inputs['Vector'])
    w.links.new(mp.outputs['Vector'], sky.inputs['Vector'])
    w.links.new(sky.outputs['Fac'], ramp.inputs['Fac'])
    w.links.new(ramp.outputs['Color'], w.nodes['Background'].inputs['Color'])
    sun = light('sun', 'SUN', (0, 0, 10), 2.2, '#ffc39a', 0.1, rot=(math.radians(-80), 0, math.radians(200)))
    w.nodes['Background'].inputs['Strength'].default_value = 0.9
    window.data.materials[0] = inside_day
    set_emit('doorglow', 0.8)
    set_emit('neon', 22)
    sign_light.data.energy = 120
    lamp_l.data.energy = 0
    set_emit('lampg', 0)
    show(shutters, False)
    render('esterno-alba')
    sun.data.energy = 0.4
    w.links.remove(w.nodes['Background'].inputs['Color'].links[0])
    world_color(hexc('#1a2238'), 0.35)
    set_emit('doorglow', 0)
    set_emit('neon', 0)
    sign_light.data.energy = 0
    lamp_l.data.energy = 600
    set_emit('lampg', 25)
    show(shutters, True)
    render('esterno-chiuso')


for builder, names in ((build_interior, {'mattina', 'pomeriggio', 'sera', 'notte', 'candele'}),
                       (build_saletta, {'saletta', 'palco'}),
                       (build_cantina, {'cantina'}),
                       (build_exterior, {'esterno-notte', 'esterno-alba', 'esterno-chiuso'})):
    if not ONLY or ONLY & names:
        builder()
print('DONE')
