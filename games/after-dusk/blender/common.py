"""Shared Blender 4.2+ bmesh helpers, Cycles AO vertex-color baker, and GLB exporter."""
import json
import math
import os
import bpy
import bmesh


def load_palette():
    path = os.path.join(os.getcwd(), "blender", "palette.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def lin(hexv):
    out = []
    for s in (16, 8, 0):
        c = ((hexv >> s) & 255) / 255.0
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (out[0], out[1], out[2], 1.0)


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 32
    scene.cycles.bake_type = "AO"
    scene.render.bake.target = "VERTEX_COLORS"
    return scene


def make_box(w, h, d):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(w, h, d), verts=bm.verts)
    return bm


def make_cyl(rt, rb, h, seg=12):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=rb, radius2=rt, depth=h)
    return bm


def finish_prop(name, parts, bevel_width=0.015):
    """parts: list of (bmesh, offset_xyz, hex_color, glow_bool)"""
    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)

    combined = bmesh.new()
    col_layer = combined.loops.layers.color.new("Col")

    for bm, offset, hex_col, is_glow in parts:
        bmesh.ops.translate(bm, verts=bm.verts, vec=offset)
        rgba = list(lin(hex_col))
        rgba[3] = 0.4 if is_glow else 1.0
        tmp = bpy.data.meshes.new("_tmp")
        bm.to_mesh(tmp)
        bm.free()
        tmp_bm = bmesh.new()
        tmp_bm.from_mesh(tmp)
        bpy.data.meshes.remove(tmp)
        c_lay = tmp_bm.loops.layers.color.new("Col")
        for f in tmp_bm.faces:
            for lp in f.loops:
                lp[c_lay] = rgba
        tmp_bm.to_mesh(mesh)
        tmp_bm.free()

        bm_part = bmesh.new()
        bm_part.from_mesh(mesh)
        for v in bm_part.verts:
            combined.verts.new(v.co)
        combined.verts.ensure_lookup_table()
        base = len(combined.verts) - len(bm_part.verts)
        src_col = bm_part.loops.layers.color.get("Col")
        for f in bm_part.faces:
            nf = combined.faces.new([combined.verts[base + v.index] for v in f.verts])
            for lp_s, lp_d in zip(f.loops, nf.loops):
                lp_d[col_layer] = lp_s[src_col] if src_col else rgba
        bm_part.free()

    bmesh.ops.recalc_face_normals(combined, faces=combined.faces)
    combined.to_mesh(mesh)
    combined.free()

    if bevel_width > 0:
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel_width
        mod.segments = 2
        mod.limit_method = "ANGLE"
    return obj


def export_pack(pack_id):
    out = os.path.join(os.getcwd(), "blender", f"kit-{pack_id}.raw.glb")
    bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_apply=True, export_attributes=True)
    print(f"Exported {out}")
