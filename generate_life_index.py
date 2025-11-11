#!/usr/bin/env python3
"""
Scan assets/life_comic/ and generate assets/life_comic/index.json listing image files in display order.
Run this script from the repository root:

  python3 generate_life_index.py

It will create (or overwrite) assets/life_comic/index.json with a JSON array of filenames.
"""
import json
from pathlib import Path

root = Path(__file__).resolve().parent
comic_dir = root / 'assets' / 'life_comic'
index_file = comic_dir / 'index.json'

if not comic_dir.exists():
    print(f"Directory not found: {comic_dir}")
    raise SystemExit(1)

# collect common image extensions
files = sorted([p.name for p in comic_dir.iterdir() if p.is_file() and p.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp', '.gif')])

# prefer files named page1,page2,... sort them by natural order if present
# fallback to alphabetical
files_sorted = []
# try to find pageN pattern
page_map = {}
for name in files:
    import re
    m = re.match(r'page(\d+)\.(jpg|jpeg|png|webp|gif)$', name, re.IGNORECASE)
    if m:
        page_map[int(m.group(1))] = name

if page_map:
    for i in sorted(page_map.keys()):
        files_sorted.append(page_map[i])
    # add remaining files not matching pageN
    for name in files:
        if name not in files_sorted:
            files_sorted.append(name)
else:
    files_sorted = files

# write index
index_file.write_text(json.dumps({"images": files_sorted}, indent=2, ensure_ascii=False), encoding='utf-8')
print(f"Wrote {len(files_sorted)} images to {index_file}")
