#!/usr/bin/env python3
"""Verifica i link interni di tutte le pagine HTML del repository.

Non controlla i file su GitHub Pages: risolve i riferimenti relativi rispetto
alla pagina che li contiene e segnala i target mancanti. È il controllo che ha
trovato i 45 target rotti citati nelle guide, quindi vale la pena eseguirlo
dopo ogni spostamento di file.

Uso:
    python3 tools/seo/check_links.py
    python3 tools/seo/check_links.py --verbose     # elenca anche i path assoluti
    python3 tools/seo/check_links.py --quiet       # solo exit code
"""

from __future__ import annotations

import argparse
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

SKIP_DIRS = {".git", "node_modules", "dist", "site", "www", ".venv",
             "__pycache__", "build", "android", "ios"}

# href/src che non sono richieste di file: frammenti, protocolli, javascript:,
# template literals e-mail, ecc.
SKIP_SCHEMES = ("http:", "https:", "mailto:", "tel:", "data:", "javascript:",
                "about:", "#", "//", "blob:", "sms:", "geo:")

ATTR_RE = re.compile(r'''(?:href|src)\s*=\s*["']([^"']+)["']''', re.I)
CSS_URL_RE = re.compile(r'''url\(\s*['"]?([^'")]+)['"]?\s*\)''', re.I)

# Entry point Vite: `/src/main.tsx` non esiste su disco finche' il progetto non
# viene buildato, e il bundle risultante non porta piu' quel nome. Non e' un
# link rotto, e' un riferimento al sorgente.
BUILD_TIME_RE = re.compile(r"^(/)?src/(main|index)\.(tsx|ts|jsx|js)$")

# URL di browser che non sono richieste di file (chrome://, edge://, ...).
BROWSER_SCHEME_RE = re.compile(r"^[a-z][a-z0-9+.-]*://", re.I)

# Path serviti dal backend a runtime, non file statici del repo.
# socket.io li espande dal server Express (games/card-games/server/index.js).
RUNTIME_SERVED_RE = re.compile(r"^/?socket\.io/")


def html_files() -> list[Path]:
    out = []
    for p in ROOT.rglob("*.html"):
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        out.append(p)
    return sorted(out)


def is_external_or_dynamic(target: str) -> bool:
    t = target.strip()
    if not t or t.startswith(SKIP_SCHEMES):
        return True
    # Template literal JS, es. ${url} o href="#{x}"
    if "${" in t or "#{" in t or t.startswith("{{") or t.startswith("<%="):
        return True
    if t == "about:blank":
        return True
    # chrome://gpu, edge://inspect e simili: esistono solo nel browser.
    if BROWSER_SCHEME_RE.match(t):
        return True
    if BUILD_TIME_RE.match(t):
        return True
    if RUNTIME_SERVED_RE.match(t):
        return True
    return False


def deploys_elsewhere(page: Path) -> bool:
    """True se il sotto-progetto viene pubblicato su un altro host.

    `projects/shhh-reader` ha un vercel.json (deploy su shhhreader.app) e un
    capacitor.config.json (app nativa). In quel contesto public/ e' la root del
    deploy, quindi i path come /icons/icon-192.png sono corretti e risolverli
    rispetto alla repo darebbe un falso positivo.
    """
    for parent in list(page.parents)[:3]:
        for marker in ("vercel.json", "netlify.toml", "capacitor.config.json"):
            if (parent / marker).exists():
                return True
    return False


def resolve(page: Path, target: str) -> Path | None:
    """Restituisce il path su disco che il riferimento dovrebbe raggiungere."""
    clean = target.split("#", 1)[0].split("?", 1)[0]
    if not clean:
        return None
    if clean.startswith("/"):
        # Path assoluto: sotto /portfolio/ questo è rotto a meno che non
        # punti a qualcosa che esiste davvero alla root del repo.
        return ROOT / clean.lstrip("/")
    return (page.parent / clean)


def served_from_public(page: Path, target: Path) -> bool:
    """True se il file esiste in un `public/` che il bundler copia alla root.

    Nei progetti Vite l'index.html sorgente fa riferimento a /favicon.svg,
    /icons/*.png ecc. che stanno in public/: sono file validi a runtime, dopo
    la build, non link rotti in sorgente. Vale anche il viceversa: una pagina
    dentro public/ che linka index.html raggiunge l'entry point del progetto,
    che il build copia nella stessa root.
    """
    try:
        rel = target.relative_to(ROOT)
    except ValueError:
        return False
    for parent in list(page.parents)[:3]:
        public = parent / "public"
        if not public.is_dir():
            continue
        if (public / rel.name).exists():
            return True
        parts = rel.parts
        for i in range(len(parts)):
            if public.joinpath(*parts[i:]).exists():
                return True
        # index.html vive nella radice del progetto e finisce in dist/ accanto
        # ai file di public/, quindi un link a index.html da public/ funziona.
        if rel.name == "index.html" and (parent / "index.html").exists():
            return True
    return False


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--verbose", action="store_true")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()

    files = html_files()
    broken: dict[str, list[str]] = defaultdict(list)
    absolute: dict[str, list[str]] = defaultdict(list)
    checked = 0

    for page in files:
        try:
            text = page.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        rel_page = page.relative_to(ROOT)

        targets = list(ATTR_RE.findall(text))
        # Anche i riferimenti dentro i <style> inline.
        for style in re.findall(r"<style[^>]*>(.*?)</style>", text,
                                 re.I | re.S):
            targets += CSS_URL_RE.findall(style)

        for raw in targets:
            if is_external_or_dynamic(raw):
                continue
            checked += 1
            target_path = resolve(page, raw)
            if target_path is None:
                continue
            if raw.startswith("/"):
                absolute[str(rel_page)].append(raw)
                # Path assoluti verso la root: validi solo se il progetto non
                # viene pubblicato su un altro host (vedi deploys_elsewhere).
                if deploys_elsewhere(page):
                    continue
            if target_path.exists():
                continue
            if served_from_public(page, target_path):
                continue
            broken[str(rel_page)].append(raw)

    if not args.quiet:
        print(f"Pagine HTML analizzate: {len(files)}")
        print(f"Riferimenti interni controllati: {checked}")

        total_broken = sum(len(v) for v in broken.values())
        print(f"\nLink rotti: {total_broken} su {len(broken)} pagine")
        for page in sorted(broken):
            for t in sorted(set(broken[page])):
                print(f"  {page}  ->  {t}")

        if absolute:
            n = sum(len(v) for v in absolute.values())
            print(f"\nPath assoluti (/...): {n} — su GitHub Pages il sito vive "
                  f"sotto /portfolio/, quindi vanno verificati")
            if args.verbose:
                for page in sorted(absolute):
                    for t in sorted(set(absolute[page])):
                        exists = "esiste" if (ROOT / t.lstrip('/')).exists() \
                                 else "NON esiste"
                        print(f"  {page}  ->  {t}  [{exists}]")

    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())