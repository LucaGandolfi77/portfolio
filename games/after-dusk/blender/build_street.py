"""Builds kit-street.raw.glb: gooseneck streetlamps, parked cars, maple trees."""
from common import reset_scene, load_palette, make_box, make_cyl, finish_prop, export_pack


def build():
    reset_scene()
    p = load_palette()
    finish_prop("streetlamp_gooseneck", [
        (make_cyl(0.06, 0.09, 3.6, 10), (0, 1.8, 0), p["plasticDark"], False),
        (make_box(0.07, 0.07, 0.52), (0, 3.55, -0.24), p["plasticDark"], False),
        (make_cyl(0.14, 0.14, 0.18, 12), (0, 3.42, -0.45), p["bulbGlow"], True),
    ])
    finish_prop("sedan_parked", [
        (make_box(2.8, 0.65, 1.45), (0, 0.48, 0), p["plasticDark"], False),
        (make_box(1.55, 0.48, 1.32), (-0.1, 0.98, 0), p["glassTint"], False),
    ])
    finish_prop("maple_tree_a", [
        (make_cyl(0.14, 0.22, 2.8, 8), (0, 1.4, 0), p["darkWood"], False),
        (make_cyl(0.05, 1.25, 2.4, 9), (0, 3.4, 0), 0x243829, False),
    ])
    export_pack("street")


if __name__ == "__main__":
    build()
