"""Master headless Blender runner for all After Dusk GLB kits."""
import os
import sys

sys.path.insert(0, os.path.join(os.getcwd(), "blender"))
import build_home
import build_street
import build_shadows


def main():
    build_home.build()
    build_street.build()
    build_shadows.build()


if __name__ == "__main__":
    main()
