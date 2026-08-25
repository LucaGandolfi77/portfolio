#!/usr/bin/env python3
"""Generate a static architecture and HTML-link map for the portfolio.

The output intentionally separates published HTML pages from build-only and
third-party references. It is safe to rerun after adding a page or link.
"""

from __future__ import annotations

import argparse
import re
from collections import Counter, defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urldefrag, urlparse


EXCLUDED_PARTS = {".git", "node_modules", "__pycache__", "deepseek-harness", "dist"}
HTML_EXTENSIONS = {".html", ".htm"}
SKIP_SCHEMES = {"mailto", "tel", "javascript", "data", "chrome"}


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.links: list[tuple[int, str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag.lower() == "a" and values.get("href"):
            self.links.append((self.getpos()[0], "href", values["href"] or ""))


def relative_files(root: Path, extension: str | None = None) -> list[Path]:
    files = []
    for path in root.rglob("*"):
        if not path.is_file() or any(part in EXCLUDED_PARTS for part in path.relative_to(root).parts):
            continue
        if extension and path.suffix.lower() != extension:
            continue
        files.append(path)
    return sorted(files)


def rel(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def resolve_html(source: Path, raw: str, root: Path) -> tuple[str | None, str]:
    target, fragment = urldefrag(raw.strip())
    parsed = urlparse(target)
    if raw.startswith("#"):
        return rel(source, root), fragment
    if parsed.scheme or parsed.netloc or not target:
        return None, fragment
    if target.startswith("/"):
        return None, fragment
    candidate = (source.parent / target.split("?", 1)[0]).resolve()
    if candidate.is_dir():
        candidate = candidate / "index.html"
    if not candidate.exists() and not candidate.suffix:
        candidate = Path(f"{candidate}.html")
    if candidate.exists() and candidate.suffix.lower() in HTML_EXTENSIONS:
        return rel(candidate, root), fragment
    return None, fragment


def classify(raw: str, target: str | None) -> str:
    parsed = urlparse(raw)
    if raw.startswith("/"):
        return "root-absolute"
    if parsed.scheme in SKIP_SCHEMES:
        return f"{parsed.scheme}-scheme"
    if parsed.scheme or parsed.netloc:
        return "external"
    if raw.startswith("#"):
        return "anchor"
    return "html" if target else "broken-html"


def js_routes(root: Path) -> list[tuple[str, str, str]]:
    records = []
    for filename in ("assets/js/catalog-data.js", "assets/js/projects-data.js"):
        path = root / filename
        if not path.exists():
            continue
        for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            for match in re.finditer(r'(["\'])([^"\']+?\.html(?:#[^"\']*)?|[^"\']+?/)(?:\1)', line):
                value = match.group(2)
                if "/" in value or value.endswith(".html"):
                    records.append((filename, str(line_number), value))
    return records


def make_markdown(root: Path) -> str:
    html_files = relative_files(root, ".html")
    html_nodes = {rel(path, root) for path in html_files}
    edges: list[dict[str, str]] = []
    incoming: Counter[str] = Counter()
    outgoing: defaultdict[str, list[str]] = defaultdict(list)
    findings: list[dict[str, str]] = []

    for source in html_files:
        source_rel = rel(source, root)
        parser = LinkParser()
        try:
            parser.feed(source.read_text(encoding="utf-8", errors="replace"))
        except Exception as error:
            findings.append({"source": source_rel, "line": "?", "target": "", "status": "parse-error", "detail": str(error)})
            continue
        for line, _, raw in parser.links:
            target, fragment = resolve_html(source, raw, root)
            kind = classify(raw, target)
            status = "valid"
            detail = ""
            if kind == "root-absolute":
                status, detail = "inconsistent", "Root-absolute path bypasses the GitHub Pages /portfolio/ prefix."
            elif kind == "broken-html":
                status, detail = "broken", "Target HTML file or directory index does not exist."
            elif kind in {"external", "mailto-scheme", "tel-scheme", "javascript-scheme", "data-scheme", "chrome-scheme"}:
                status = "external" if kind == "external" else "exception"
                detail = "External or browser-special destination; not resolved in the repository."
            elif kind == "anchor":
                status = "anchor"
            elif target and target not in html_nodes:
                status, detail = "broken", "Resolved target is not an HTML node."
            if target and target in html_nodes and target != source_rel:
                incoming[target] += 1
                outgoing[source_rel].append(target)
                edges.append({"source": source_rel, "target": target, "raw": raw, "status": status})
            if status in {"inconsistent", "broken"}:
                findings.append({"source": source_rel, "line": str(line), "target": raw, "status": status, "detail": detail})

    dynamic = []
    for source, line, raw in js_routes(root):
        target, _ = resolve_html(root / "index.html", raw, root)
        status = "valid" if target in html_nodes else "broken"
        dynamic.append((source, line, raw, target or "-", status))
        if status == "broken":
            findings.append({"source": source, "line": line, "target": raw, "status": "broken", "detail": "Generated catalog target does not exist."})

    published_html = [path for path in html_files if not any(part in {"pixel-stretch-app"} for part in path.relative_to(root).parts)]
    orphans = sorted(rel(path, root) for path in published_html if rel(path, root) not in incoming and rel(path, root) != "index.html")

    lines = [
        "# Site Architecture and Link Map",
        "",
        "> Generated from the repository with `python3 tools/seo/generate_site_link_map.py`.",
        "> HTML links are checked against the filesystem. External URLs and browser-special schemes are documented as exceptions.",
        "",
        "## Summary",
        "",
        f"- HTML files scanned: {len(html_files)}",
        f"- HTML-to-HTML edges: {len(edges)}",
        f"- JavaScript-generated catalog routes: {len(dynamic)}",
        f"- Orphan candidates: {len(orphans)}",
        f"- Broken or inconsistent references: {len(findings)}",
        "",
        "## Architecture",
        "",
        "```text",
        "portfolio/",
        "├── index.html                         Main portfolio shell and curated home",
        "├── pages/main/projects.html            Searchable project archive",
        "├── games/index.html                    Searchable game archive",
        "├── lab/index.html                      Browser Lab hub",
        "├── games/arcade-lab/index.html         Arcade Lab hub",
        "├── games/quotesmith/                   Offline quote quiz PWA",
        "├── projects/                           Standalone tools and experiments",
        "├── games/                              Standalone games and game collections",
        "├── pages/content/                      Books, movies, music, poems, media",
        "├── pages/experiments/                  Easter eggs and hidden experiments",
        "├── assets/js/catalog-data.js            Shared project/game catalog data",
        "├── assets/js/catalog-home.js            Curated homepage renderer",
        "├── assets/js/catalog.js                 Archive filters and favorites",
        "├── assets/js/projects-data.js           Project catalog source data",
        "├── manifest.json / sw.js                Portfolio PWA shell",
        "├── sitemap.xml / robots.txt             Crawl configuration",
        "└── tools/seo/                           Audit and report generators",
        "```",
        "",
        "## Main Entry Points",
        "",
        "| Entry point | Role | Links to |",
        "|---|---|---|",
        "| `index.html` | Main portfolio | Projects archive, games archive, Lab, interests, content pages |",
        "| `pages/main/projects.html` | Full project archive | Catalog targets generated from `projects-data.js` |",
        "| `games/index.html` | Full game archive | Catalog targets generated from `catalog-data.js` |",
        "| `lab/index.html` | Browser experiments | Self-contained tools |",
        "| `games/arcade-lab/index.html` | Mini-game collection | Self-contained games |",
        "| `games/quotesmith/index.html` | Quote quiz PWA | `data.js`, `engine.js`, `script.js`, service worker |",
        "## HTML to HTML Map",
        "",
    ]

    for source in sorted(outgoing):
        targets = sorted(set(outgoing[source]))
        lines.append(f"### `{source}`")
        for target in targets:
            lines.append(f"- `{target}`")
        lines.append("")

    lines += ["## JavaScript-Generated Routes", "", "| Source | Line | Raw target | Resolved target | Status |", "|---|---:|---|---|---|"]
    for source, line, raw, target, status in dynamic:
        lines.append(f"| `{source}` | {line} | `{raw}` | `{target}` | {status} |")
    lines += ["", "## Broken or Inconsistent References", ""]
    if findings:
        lines += ["| Source | Line | Target | Status | Detail |", "|---|---:|---|---|---|"]
        for finding in findings:
            lines.append(f"| `{finding['source']}` | {finding['line']} | `{finding['target']}` | **{finding['status']}** | {finding['detail']} |")
    else:
        lines.append("No broken or inconsistent HTML references found.")

    lines += ["", "## Orphan Candidates", "", "These files have no incoming HTML-to-HTML link in the scanned graph. Some are intentional direct-entry apps or build artifacts.", ""]
    lines.extend(f"- `{item}`" for item in orphans)
    lines += ["", "## Link Rules", "", "- Use relative paths for all internal links; GitHub Pages serves this repository below `/portfolio/`.", "- Prefer directory routes such as `games/quotesmith/` only when the directory contains `index.html`.", "- Keep catalog routes in `assets/js/catalog-data.js` and project routes in `assets/js/projects-data.js`.", "- Treat `mailto:`, `tel:`, CDN URLs, `data:`, and `chrome://` as explicit exceptions.", "- Re-run the generator after adding or moving an HTML page.", "", "## Related Reports", "", "- `seo/reports/link-audit-report.md` - full repository SEO/link audit", "- `seo/reports/orphan-pages.txt` - orphan detection from the SEO auditor", "- `seo/reports/sitemap-robots-audit.md` - sitemap and robots checks", "- `config/seo.json` - primary and sitemap route configuration", ""]
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", type=Path, default=Path.cwd())
    parser.add_argument("--output", type=Path, default=Path("docs/architecture/site-link-map.md"))
    args = parser.parse_args()
    root = args.repo.resolve()
    output = args.output if args.output.is_absolute() else root / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(make_markdown(root), encoding="utf-8")
    print(f"Generated {output}")


if __name__ == "__main__":
    main()
