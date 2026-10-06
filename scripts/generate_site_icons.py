#!/usr/bin/env python3
"""Genera le icone PWA e il favicon del sito.

Il problema che risolve: le icone precedenti erano tutte lo stesso file
(byte-identiche via MD5) dichiarato come 4 nomi diversi, incluso
`icon-192-maskable.png`. Un'icona "maskable" non puo' essere identica a una
normale: il logo deve stare nella safe zone interna (80% centrale), altrimenti
Android lo ritaglia. Inoltre `favicon.ico` era un PNG 192x192 dichiarato come
`image/x-icon`, e i colori erano quelli del vecchio schema (ciano) invece di
quello attuale (lime su fondo scuro).

Uso:
    python3 scripts/generate_site_icons.py            # scrive in assets/
    python3 scripts/generate_site_icons.py --check    # verifica senza scrivere
"""

from __future__ import annotations

import argparse
import io
import struct
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets"

# Palette allineata agli altri generatori del sito.
BG = (10, 13, 11)
ACCENT = (179, 232, 54)
FG = (255, 255, 255)

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def font(size: int):
    from PIL import ImageFont

    for path in (FONT_BOLD, "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                 "DejaVuSans-Bold.ttf"):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    raise SystemExit("Serve un font bold TTF: imposta FONT_BOLD in questo file.")


def draw_mark(size: int, maskable: bool):
    """Logo 'LG' centrato.

    `maskable` True  -> fondo pieno fino ai bordi, logo rimpicciolito nella
                       safe zone interna (80%): il launcher Android puo'
                       ritagliare tutto cio' che esce dal cerchio centrale.
    `maskable` False -> bordo arrotondato, logo piu' grande.
    """
    from PIL import Image, ImageDraw

    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    if maskable:
        d.rectangle([0, 0, size - 1, size - 1], fill=BG + (255,))
        logo_scale = 0.40
    else:
        d.rounded_rectangle([0, 0, size - 1, size - 1],
                            radius=int(size * 0.22), fill=BG + (255,))
        logo_scale = 0.46

    cx = size / 2
    f = font(int(size * logo_scale))

    # Monogramma centrato: il bounding box di PIL ha un baseline offset, quindi
    # si centra sul box e non sull'origine. Nessun elemento aggiuntivo sotto il
    # testo: a 16px una barra d'accento diventa rumore e si legge male.
    bbox = d.textbbox((0, 0), "LG", font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text((cx - tw / 2 - bbox[0], cx - th / 2 - bbox[1]),
           "LG", font=f, fill=ACCENT + (255,))
    return img


def save_png(img, path: Path) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG", optimize=True)
    return path.stat().st_size


def encode_ico(images, path: Path) -> int:
    """ICO reale (non un PNG mascherato): directory + immagini BMP embedded."""
    path.parent.mkdir(parents=True, exist_ok=True)
    entries, blobs = [], []
    offset = 6 + 16 * len(images)

    for img in images:
        buf = io.BytesIO()
        img.convert("RGBA").save(buf, "PNG", optimize=True)
        data = buf.getvalue()
        entries.append(struct.pack(
            "<BBBBHHII",
            img.width if img.width < 256 else 0,
            img.height if img.height < 256 else 0,
            0, 0, 1, 32, len(data), offset,
        ))
        blobs.append(data)
        offset += len(data)

    header = struct.pack("<HHH", 0, 1, len(images))
    path.write_bytes(header + b"".join(entries) + b"".join(blobs))
    return path.stat().st_size


def targets() -> list[tuple[str, object]]:
    return [
        ("assets/icon-192.png",               lambda: draw_mark(192, False)),
        ("assets/icon-512.png",               lambda: draw_mark(512, False)),
        ("assets/icon-192-maskable.png",      lambda: draw_mark(192, True)),
        ("assets/icon-512-maskable.png",      lambda: draw_mark(512, True)),
        ("assets/apple-touch-icon.png",       lambda: draw_mark(180, False)),
        # Usati dai sotto-progetti PWA in projects/ (hourly-wellness-widget,
        # silent-journal, flashcards-studio) che referenziano
        # ../../assets/icon-180.png. Senza questo file quei link erano rotti.
        ("assets/icon-180.png",               lambda: draw_mark(180, False)),
        ("assets/favicon.svg",                "svg"),
    ]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true",
                    help="non scrivere, riporta solo cosa cambierebbe")
    args = ap.parse_args()

    try:
        from PIL import Image
    except ImportError:
        print("Pillow mancante: pip install Pillow", file=sys.stderr)
        return 1

    written = []
    for rel, maker in targets():
        dest = OUT.parent / rel
        if maker == "svg":
            continue  # favicon.svg e' gia' scritto a mano e va bene
        img = maker()
        if args.check:
            print(f"[check] {rel} ({img.width}x{img.height})")
            continue
        size = save_png(img, dest)
        written.append((rel, size))
        print(f"  {rel:<34} {size:>7,} B")

    if not args.check:
        icos = [draw_mark(s, False).convert("RGBA") for s in (16, 32, 48)]
        size = encode_ico(icos, OUT / "favicon.ico")
        written.append(("assets/favicon.ico", size))
        print(f"  {'assets/favicon.ico':<34} {size:>7,} B  (ICO 16/32/48, header 0x0001)")

    total = sum(s for _, s in written)
    print(f"\n{len(written)} file, {total:,} B totali")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())