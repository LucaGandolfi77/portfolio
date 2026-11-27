"""Builds kit-shadows.raw.glb: 4 Shadow archetypes with glowing eyes."""
from common import reset_scene, load_palette, make_box, make_cyl, finish_prop, export_pack


def build():
    reset_scene()
    p = load_palette()
    for name, h in [("shadow_watcher", 2.1), ("shadow_crawler", 0.95), ("shadow_tall", 2.85), ("shadow_mimic", 1.75)]:
        finish_prop(name, [
            (make_cyl(0.14, 0.34, h * 0.62, 10), (0, h * 0.45, 0), p["shadowCore"], False),
            (make_box(0.24, 0.28, 0.22), (0, h * 0.86, 0), p["shadowCore"], False),
            (make_box(0.05, 0.03, 0.03), (-0.06, h * 0.88, 0.12), p["shadowEye"], True),
            (make_box(0.05, 0.03, 0.03), (0.06, h * 0.88, 0.12), p["shadowEye"], True),
        ], bevel_width=0.01)
    export_pack("shadows")


if __name__ == "__main__":
    build()
