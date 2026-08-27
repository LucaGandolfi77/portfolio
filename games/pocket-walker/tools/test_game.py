#!/usr/bin/env python3
"""Headless automated test for pocket-walker.gba using the mGBA Python
bindings: boots the ROM, verifies the intro dialog, walks the character
around, collects a berry, reads a sign, enters/exits the house, and saves
screenshots to build/shots/.

Environment:
  MGBA_PYTHON  - directory containing the 'mgba' python package
                 (default: /tmp/mgba-build/python/lib.linux-x86_64-cpython-312)
  ROM          - path to the ROM (default: ../pocket-walker.gba)
"""
import os
import struct
import sys
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROM = os.environ.get("ROM", os.path.join(HERE, "..", "pocket-walker.gba"))
SHOTS = os.path.join(HERE, "..", "build", "shots")

sys.path.insert(0, os.environ.get(
    "MGBA_PYTHON", "/tmp/mgba-build/python/lib.linux-x86_64-cpython-312"))

import mgba  # noqa: E402
from mgba import log  # noqa: E402
log.silence()
from mgba import core  # noqa: E402
from mgba._pylib import ffi, lib  # noqa: E402
from mgba.image import Image  # noqa: E402

# mGBA key bits: A=0 B=1 SELECT=2 START=3 RIGHT=4 LEFT=5 UP=6 DOWN=7
KEY_A, KEY_B, KEY_SEL, KEY_STA = 0, 1, 2, 3
KEY_R, KEY_L, KEY_U, KEY_D = 4, 5, 6, 7

BASE = 0x03000000          # Game struct sits at the start of .iwram_bss
STATE_EXPLORE, STATE_DIALOG = 0, 1
MAP_TOWN, MAP_HOUSE = 0, 1

fails = []


def png_write(path, w, h, rgba):
    def chunk(t, d):
        c = t + d
        return struct.pack(">I", len(d)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    raw = b"".join(b"\x00" + rgba[y * w * 4:(y + 1) * w * 4] for y in range(h))
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)))
        f.write(chunk(b"IDAT", zlib.compress(raw, 6)))
        f.write(chunk(b"IEND", b""))


def main():
    c = core.load_path(ROM)
    img = Image(240, 160)
    c.set_video_buffer(img)      # must be set BEFORE reset (renderer attach)
    c.set_audio_buffer_size(0)
    c.reset()
    cpu = c._core.cpu  # void* -> ARMCore* (GBAView reads through the bus)
    os.makedirs(SHOTS, exist_ok=True)

    def rd(o):
        return lib.GBAView8(cpu, BASE + o)

    def rds(o):
        return lib.GBAView16(cpu, BASE + o)

    def frame(n=1):
        for _ in range(n):
            c.run_frame()

    def shot(name):
        data = bytes(ffi.buffer(img.buffer))
        rgba = bytearray()
        for i in range(0, len(data), 4):
            rgba += bytes((data[i], data[i + 1], data[i + 2], data[i + 3]))
        png_write(os.path.join(SHOTS, name + ".png"), 240, 160, bytes(rgba))

    def hold(ks, n):
        c.set_keys(raw=sum(1 << k for k in ks))
        frame(n)
        c.clear_keys(raw=0xFFFFFFFF)
        frame(1)

    def tap(k):
        c.set_keys(raw=1 << k)
        frame(2)
        c.clear_keys(raw=0xFFFFFFFF)
        frame(2)

    def walk_towards(axis, target, maxf=200, key=None):
        """Hold a direction until the coordinate reaches target."""
        f = 0
        while f < maxf:
            if axis == 'x' and rds(0) >= target:
                return True
            if axis == 'y' and rds(2) >= target:
                return True
            hold([key], 1)
            f += 1
        return False

    def walk_up_to(target, maxf=300):
        f = 0
        while f < maxf and rds(2) > target:
            hold([KEY_U], 1)
            f += 1
        return rds(2) <= target

    def walk_down_to(target, maxf=300):
        return walk_towards('y', target, maxf, KEY_D)

    def walk_left_to(target, maxf=300):
        f = 0
        while f < maxf and rds(0) > target:
            hold([KEY_L], 1)
            f += 1
        return rds(0) <= target

    def check(name, cond, extra=""):
        print(("PASS  " if cond else "FAIL  ") + name + (("   " + extra) if extra else ""))
        if not cond:
            fails.append(name)

    # ---------------- boot ----------------
    frame(10)
    check("boot: state == DIALOG (intro)", rd(8) == STATE_DIALOG,
          "state=%d" % rd(8))
    check("boot: spawn at (112,304)", (rds(0), rds(2)) == (112, 304),
          "(%d,%d)" % (rds(0), rds(2)))
    shot("01_boot_intro")

    # dismiss the two intro pages
    tap(KEY_A)
    check("intro page 2", rd(8) == STATE_DIALOG)
    tap(KEY_A)
    check("intro dismissed -> explore", rd(8) == STATE_EXPLORE)
    shot("02_explore")

    # ---------------- walk right ----------------
    px0 = rds(0)
    ok = walk_towards('x', 112 + 48, key=KEY_R)   # move 3 cells right
    px1 = rds(0)
    check("walked right 48px", ok and px1 >= 112 + 48, "px %d->%d" % (px0, px1))

    # ---------------- collect a berry (cell 20,10) ----------------
    ok = walk_towards('y', 304 + 16, key=KEY_D)   # down 1 cell
    check("berry collected", rd(6) == 1 and rd(8) == STATE_DIALOG,
          "berries=%d state=%d" % (rd(6), rd(8)))
    shot("03_berry_dialog")
    tap(KEY_A)
    check("berry dialog closed", rd(8) == STATE_EXPLORE)

    # ---------------- status screen (START) ----------------
    tap(KEY_STA)
    check("status dialog", rd(8) == STATE_DIALOG)
    shot("04_status")
    tap(KEY_A)

    # ---------------- walk to the house door & enter ----------------
    # door cell is (15,20); stand on cell (16,20) and face up
    ok = walk_up_to(16 * 16)
    check("walked up to row 16", ok, "py=%d" % rds(2))
    ok = walk_towards('x', 20 * 16, key=KEY_R)
    check("walked right to door front", ok, "px=%d" % rds(0))
    hold([KEY_U], 1)               # face up toward the door
    frame(2)
    tap(KEY_A)
    check("entered the house", rd(5) == MAP_HOUSE,
          "map=%d px=%d py=%d facing=%d" % (rd(5), rds(0), rds(2), rd(4)))
    shot("05_house")
    frame(30)
    shot("06_house_cam")

    # ---------------- exit the house ----------------
    hold([KEY_D], 1)               # face down toward the door
    frame(2)
    tap(KEY_A)
    check("exited the house", rd(5) == MAP_TOWN,
          "map=%d px=%d py=%d" % (rd(5), rds(0), rds(2)))
    shot("07_back_town")

    # ---------------- sign interaction ----------------
    # walk back down to row 19, then left until the junction sign stops
    # us (sign tile at (38,12)); press A while facing left
    ok = walk_down_to(19 * 16)
    check("walked down to row 19", ok, "py=%d" % rds(2))
    ok = walk_left_to(4 * 16)
    check("walked left to sign front", rds(0) <= 9 * 16, "px=%d" % rds(0))
    hold([KEY_L], 1)               # ensure we face left at the sign
    frame(2)
    tap(KEY_A)
    check("sign read", rd(8) == STATE_DIALOG, "state=%d" % rd(8))
    shot("08_sign")
    tap(KEY_A)

    print()
    if fails:
        print("RESULT: %d FAILURE(S): %s" % (len(fails), ", ".join(fails)))
        sys.exit(1)
    print("RESULT: ALL TESTS PASSED")


if __name__ == "__main__":
    main()
