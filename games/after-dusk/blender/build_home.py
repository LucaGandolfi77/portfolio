"""Builds kit-home.raw.glb: cozy lived-in apartment furniture & props."""
from common import reset_scene, load_palette, make_box, make_cyl, finish_prop, export_pack


def build():
    reset_scene()
    p = load_palette()
    finish_prop("sofa_cozy", [
        (make_box(2.4, 0.42, 0.95), (0, 0.28, 0), p["fabricBlue"], False),
        (make_box(2.4, 0.68, 0.22), (0, 0.72, -0.38), p["fabricBlue"], False),
        (make_box(0.45, 0.34, 0.34), (-0.75, 0.62, 0.05), p["fabricWine"], False),
    ])
    finish_prop("bedside_lamp", [
        (make_cyl(0.08, 0.1, 0.22, 12), (0, 0.11, 0), p["darkWood"], False),
        (make_cyl(0.14, 0.2, 0.24, 14), (0, 0.34, 0), p["bulbGlow"], True),
    ])
    export_pack("home")


if __name__ == "__main__":
    build()
