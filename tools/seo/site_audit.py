#!/usr/bin/env python3
"""Repository-wide SEO, link integrity, and crawlability audit for static HTML projects.

Outputs are written to:
- seo/reports/link-audit.csv
- seo/reports/link-audit-report.md
- seo/reports/metadata-audit.csv
- seo/reports/orphan-pages.txt
- seo/reports/sitemap-robots-audit.md
"""

from __future__ import annotations

import argparse
import csv
from datetime import datetime, timezone
import fnmatch
import html
import json
import os
import re
import socket
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set, Tuple
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse, urldefrag
from urllib.request import Request, urlopen


EXCLUDED_DIR_NAMES = {
    ".git",
    ".venv",
    "node_modules",
    "__pycache__",
}

ASSET_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".svg",
    ".ico",
    ".css",
    ".js",
    ".mjs",
    ".json",
    ".xml",
    ".txt",
    ".csv",
    ".pdf",
    ".epub",
    ".mp3",
    ".mid",
    ".midi",
    ".wav",
    ".ogg",
    ".mp4",
    ".webm",
    ".mov",
    ".zip",
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
    ".map",
}

HTML_TAGS_WITH_URLS = {
    "img": ["src", "srcset"],
    "script": ["src"],
    "link": ["href"],
    "source": ["src", "srcset"],
    "video": ["src", "poster"],
    "audio": ["src"],
    "iframe": ["src"],
    "embed": ["src"],
    "track": ["src"],
    "input": ["src"],
    "object": ["data"],
    "form": ["action"],
}

FAKE_LINK_TAGS = {"button", "div", "span", "li", "p"}

NAV_HINT_RE = re.compile(r"(?:^|[\s_-])(nav|menu|header|footer)(?:$|[\s_-])", re.IGNORECASE)
TARGET_IN_ONCLICK_RE = re.compile(
    r"(?:location\.(?:href|assign|replace)\s*=\s*|window\.open\s*\(|location\s*=\s*)(['\"])(?P<target>[^'\"]+)\1",
    re.IGNORECASE,
)


@dataclass
class LinkRecord:
    source_file: str
    source_line: int
    source_tag: str
    identifier: str
    target: str
    in_nav: bool
    from_fake_link: bool = False
    explicit_anchor_without_href: bool = False


@dataclass
class AuditRow:
    source_file: str
    source_line: int
    link_text_or_identifier: str
    target_url_or_path: str
    link_type: str
    status: str
    issue_description: str
    recommended_fix: str


@dataclass
class MetadataRecord:
    file: str
    title: str
    title_ok: bool
    description: str
    description_ok: bool
    canonical: str
    canonical_ok: bool
    og_count: int
    jsonld_count: int
    robots_meta: str


class DocumentParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: Set[str] = set()
        self.link_records: List[LinkRecord] = []
        self.fake_link_records: List[LinkRecord] = []

        self.title_text: str = ""
        self.description: str = ""
        self.robots_meta: str = ""
        self.canonical: str = ""
        self.og_properties: Dict[str, str] = {}
        self.jsonld_count: int = 0

        self._stack: List[Tuple[str, Dict[str, str]]] = []
        self._in_title = False
        self._title_chunks: List[str] = []
        self._anchor_stack: List[Dict[str, object]] = []

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]) -> None:
        attrs_dict = {k.lower(): (v if v is not None else "") for k, v in attrs}
        self._stack.append((tag.lower(), attrs_dict))
        line, _ = self.getpos()

        element_id = attrs_dict.get("id", "").strip()
        if element_id:
            self.ids.add(element_id)

        if tag.lower() == "title":
            self._in_title = True
            return

        if tag.lower() == "meta":
            name = attrs_dict.get("name", "").strip().lower()
            prop = attrs_dict.get("property", "").strip().lower()
            content = attrs_dict.get("content", "").strip()
            if name == "description" and not self.description:
                self.description = content
            if name == "robots" and not self.robots_meta:
                self.robots_meta = content
            if prop.startswith("og:"):
                self.og_properties[prop] = content
            return

        skip_link_url_check = False
        if tag.lower() == "link":
            rel = attrs_dict.get("rel", "").lower()
            href = attrs_dict.get("href", "").strip()
            if "canonical" in rel and href and not self.canonical:
                self.canonical = href
                skip_link_url_check = True
            if "preconnect" in rel or "dns-prefetch" in rel:
                skip_link_url_check = True

        if tag.lower() == "script":
            script_type = attrs_dict.get("type", "").strip().lower()
            if "ld+json" in script_type:
                self.jsonld_count += 1

        in_nav = self._is_nav_context()

        if tag.lower() == "a":
            href = attrs_dict.get("href", "").strip()
            anchor_context = {
                "line": line,
                "href": href,
                "identifier": self._build_identifier(tag.lower(), attrs_dict),
                "text_chunks": [],
                "in_nav": in_nav,
                "had_href": "href" in attrs_dict,
            }
            self._anchor_stack.append(anchor_context)

            if "href" not in attrs_dict:
                self.link_records.append(
                    LinkRecord(
                        source_file="",
                        source_line=line,
                        source_tag="a",
                        identifier=self._build_identifier(tag.lower(), attrs_dict),
                        target="",
                        in_nav=in_nav,
                        explicit_anchor_without_href=True,
                    )
                )
            return

        # Generic URL-bearing tags for assets and actions
        url_attrs = HTML_TAGS_WITH_URLS.get(tag.lower(), [])
        if tag.lower() == "link" and skip_link_url_check:
            url_attrs = []
        for attr_name in url_attrs:
            raw_value = attrs_dict.get(attr_name, "").strip()
            if not raw_value:
                continue
            for candidate in self._split_attr_targets(attr_name, raw_value):
                self.link_records.append(
                    LinkRecord(
                        source_file="",
                        source_line=line,
                        source_tag=tag.lower(),
                        identifier=self._build_identifier(tag.lower(), attrs_dict),
                        target=candidate,
                        in_nav=in_nav,
                    )
                )

        # Fake-link detection
        if tag.lower() in FAKE_LINK_TAGS:
            onclick = attrs_dict.get("onclick", "").strip()
            data_href = attrs_dict.get("data-href", "").strip()
            role = attrs_dict.get("role", "").strip().lower()

            extracted = self._extract_target_from_onclick(onclick)
            target = extracted or data_href
            has_nav_intent = bool(target) or role == "link"
            if has_nav_intent:
                self.fake_link_records.append(
                    LinkRecord(
                        source_file="",
                        source_line=line,
                        source_tag=tag.lower(),
                        identifier=self._build_identifier(tag.lower(), attrs_dict),
                        target=target,
                        in_nav=in_nav,
                        from_fake_link=True,
                    )
                )

    def handle_endtag(self, tag: str) -> None:
        low = tag.lower()

        if low == "title":
            self._in_title = False
            self.title_text = " ".join(x.strip() for x in self._title_chunks if x.strip()).strip()
            self._title_chunks = []

        if low == "a" and self._anchor_stack:
            anchor = self._anchor_stack.pop()
            href = str(anchor.get("href", "")).strip()
            if href:
                anchor_text = " ".join(
                    x.strip() for x in anchor.get("text_chunks", []) if isinstance(x, str) and x.strip()
                ).strip()
                identifier = anchor_text or str(anchor.get("identifier", "")).strip() or "anchor"
                self.link_records.append(
                    LinkRecord(
                        source_file="",
                        source_line=int(anchor.get("line", 1)),
                        source_tag="a",
                        identifier=identifier,
                        target=href,
                        in_nav=bool(anchor.get("in_nav", False)),
                    )
                )

        # Pop latest matching tag from stack
        for i in range(len(self._stack) - 1, -1, -1):
            if self._stack[i][0] == low:
                self._stack.pop(i)
                break

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self._title_chunks.append(data)
        if self._anchor_stack:
            self._anchor_stack[-1]["text_chunks"].append(data)

    @staticmethod
    def _split_attr_targets(attr_name: str, value: str) -> List[str]:
        if attr_name != "srcset":
            return [html.unescape(value).strip()]

        parts = []
        for item in value.split(","):
            candidate = item.strip().split(" ", 1)[0].strip()
            if candidate:
                parts.append(html.unescape(candidate))
        return parts

    @staticmethod
    def _extract_target_from_onclick(onclick: str) -> str:
        if not onclick:
            return ""
        m = TARGET_IN_ONCLICK_RE.search(onclick)
        if m:
            return m.group("target").strip()
        return ""

    def _is_nav_context(self) -> bool:
        for tag, attrs in reversed(self._stack):
            if tag == "nav":
                return True
            class_attr = attrs.get("class", "")
            id_attr = attrs.get("id", "")
            if class_attr and NAV_HINT_RE.search(class_attr):
                return True
            if id_attr and NAV_HINT_RE.search(id_attr):
                return True
        return False

    @staticmethod
    def _build_identifier(tag: str, attrs: Dict[str, str]) -> str:
        bits = [tag]
        if attrs.get("id"):
            bits.append(f"#{attrs['id'].strip()}")
        if attrs.get("class"):
            cls = ".".join(x for x in attrs["class"].split() if x)
            if cls:
                bits.append(f".{cls}")
        if attrs.get("aria-label"):
            bits.append(f"aria={attrs['aria-label'].strip()}")
        if attrs.get("title"):
            bits.append(f"title={attrs['title'].strip()}")
        return " ".join(bits).strip()


def iter_html_files(root: Path) -> Iterable[Path]:
    for path in root.rglob("*.html"):
        if any(part in EXCLUDED_DIR_NAMES for part in path.parts):
            continue
        yield path


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def load_seo_config(repo_root: Path) -> Dict[str, object]:
    config_file = repo_root / "config" / "seo.json"
    if not config_file.exists():
        return {}

    try:
        payload = json.loads(read_text(config_file))
    except json.JSONDecodeError:
        return {}

    if isinstance(payload, dict):
        return payload
    return {}


def resolve_repo_path_from_config(repo_root: Path, configured_path: object, fallback: str) -> Path:
    raw = fallback
    if isinstance(configured_path, str) and configured_path.strip():
        raw = configured_path.strip()

    normalized = raw.lstrip("/") if raw.startswith("/") else raw
    return (repo_root / normalized).resolve()


def normalize_route_from_config(route: str, repo_root: Path) -> Optional[str]:
    candidate = (route or "").strip()
    if not candidate:
        return None

    parsed = urlparse(candidate)
    path = (parsed.path or "").strip()
    if not path:
        path = "/"

    if not path.startswith("/"):
        path = "/" + path

    if path == "/":
        return "/"

    if path.endswith("/"):
        return path + "index.html"

    leaf = Path(path).name
    if "." not in leaf:
        html_candidate = path + ".html"
        if (repo_root / html_candidate.lstrip("/")).exists():
            return html_candidate

    return path


def route_path_to_relative_file(route_path: str) -> str:
    if route_path == "/":
        return "index.html"
    return route_path.lstrip("/")


def build_absolute_url(site_url: str, route_path: str) -> str:
    base = (site_url or "").strip().rstrip("/")
    if not base:
        return route_path if route_path != "/" else "/"
    if route_path == "/":
        return base + "/"
    return base + route_path


def collect_sitemap_routes(seo_config: Dict[str, object], repo_root: Path) -> List[str]:
    raw_routes = seo_config.get("sitemapRoutes")
    if not isinstance(raw_routes, list) or not raw_routes:
        raw_routes = seo_config.get("primaryRoutes", [])

    ordered_routes: List[str] = []
    seen: Set[str] = set()

    if isinstance(raw_routes, list):
        for item in raw_routes:
            if not isinstance(item, str):
                continue
            normalized = normalize_route_from_config(item, repo_root)
            if not normalized or normalized in seen:
                continue
            seen.add(normalized)
            ordered_routes.append(normalized)

    if "/" not in seen:
        ordered_routes.insert(0, "/")

    return ordered_routes


def sync_sitemap_from_config(repo_root: Path, seo_config: Dict[str, object]) -> Tuple[Path, int]:
    sitemap_file = resolve_repo_path_from_config(repo_root, seo_config.get("sitemapPath"), "sitemap.xml")
    site_url = str(seo_config.get("siteUrl") or "").strip()
    routes = collect_sitemap_routes(seo_config, repo_root)

    urlset = ET.Element("urlset", {"xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9"})

    for route_path in routes:
        url_node = ET.SubElement(urlset, "url")
        loc_node = ET.SubElement(url_node, "loc")
        loc_node.text = build_absolute_url(site_url, route_path)

        rel_file = route_path_to_relative_file(route_path)
        target_file = repo_root / rel_file
        if target_file.exists():
            modified = datetime.fromtimestamp(target_file.stat().st_mtime, tz=timezone.utc)
            lastmod_node = ET.SubElement(url_node, "lastmod")
            lastmod_node.text = modified.strftime("%Y-%m-%dT%H:%M:%SZ")

    sitemap_file.parent.mkdir(parents=True, exist_ok=True)
    tree = ET.ElementTree(urlset)
    if hasattr(ET, "indent"):
        ET.indent(tree, space="  ")
    tree.write(sitemap_file, encoding="utf-8", xml_declaration=True)

    return sitemap_file, len(routes)


def parse_robots(robots_file: Path) -> Tuple[List[str], List[str]]:
    if not robots_file.exists():
        return [], []

    allow: List[str] = []
    disallow: List[str] = []
    current_agents: List[str] = []

    for raw_line in read_text(robots_file).splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if "#" in line:
            line = line.split("#", 1)[0].strip()
        if ":" not in line:
            continue

        key, value = line.split(":", 1)
        key = key.strip().lower()
        value = value.strip()

        if key == "user-agent":
            current_agents = [value.lower()]
        elif key in {"allow", "disallow"}:
            if not current_agents:
                current_agents = ["*"]
            if "*" in current_agents:
                if key == "allow":
                    allow.append(value)
                else:
                    disallow.append(value)

    return allow, disallow


def robots_pattern_to_regex(pattern: str) -> re.Pattern[str]:
    escaped = re.escape(pattern)
    escaped = escaped.replace(r"\*", ".*")
    if escaped.endswith(r"\$"):
        escaped = escaped[:-2] + r"$"
    else:
        escaped = escaped + r".*"
    return re.compile(r"^" + escaped)


def is_blocked_by_robots(path_for_robots: str, allow_patterns: List[str], disallow_patterns: List[str]) -> bool:
    # Simplified precedence: explicit allow wins over disallow when both match.
    matched_allow = False
    for p in allow_patterns:
        if not p:
            continue
        if robots_pattern_to_regex(p).match(path_for_robots):
            matched_allow = True
            break

    matched_disallow = False
    for p in disallow_patterns:
        if not p:
            continue
        if robots_pattern_to_regex(p).match(path_for_robots):
            matched_disallow = True
            break

    if matched_allow:
        return False
    return matched_disallow


def normalize_sitemap_route(path: str, repo_root: Path) -> str:
    route = (path or "").strip()
    if not route:
        route = "/"

    repo_prefix = f"/{repo_root.name}"
    if route == repo_prefix:
        route = "/"
    elif route.startswith(repo_prefix + "/"):
        route = route[len(repo_prefix):]

    if route == "/":
        return "/index.html"
    if route.endswith("/"):
        return route + "index.html"
    return route


def parse_sitemap_paths(sitemap_file: Path, repo_root: Path) -> Set[str]:
    paths: Set[str] = set()
    if not sitemap_file.exists():
        return paths

    try:
        root = ET.fromstring(read_text(sitemap_file))
    except ET.ParseError:
        return paths

    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    loc_nodes = root.findall(".//sm:loc", ns)
    for node in loc_nodes:
        raw = (node.text or "").strip()
        if not raw:
            continue
        parsed = urlparse(raw)
        p = normalize_sitemap_route(parsed.path or "/", repo_root)
        paths.add(p)

    return paths


def classify_target(link: LinkRecord) -> str:
    target = (link.target or "").strip()
    parsed = urlparse(target)

    if link.from_fake_link:
        if not target:
            return "internal"

    if target.startswith("#"):
        return "anchor"
    if parsed.scheme:
        return "external"

    if link.source_tag in {"img", "script", "source", "video", "audio", "iframe", "embed", "track", "input", "object"}:
        return "asset"

    candidate = target.split("?", 1)[0].split("#", 1)[0]
    suffix = Path(candidate).suffix.lower()
    if suffix and suffix in ASSET_EXTENSIONS:
        return "asset"

    return "internal"


def normalize_internal_target(source_file: Path, target: str, repo_root: Path) -> Tuple[Optional[Path], str, Optional[str]]:
    """Return (resolved_path, normalized_repo_relative, fragment)."""
    unescaped = html.unescape((target or "").strip())
    if not unescaped:
        return None, "", None

    pure, fragment = urldefrag(unescaped)
    pure = pure.split("?", 1)[0].strip()
    fragment = fragment.strip() if fragment else None

    if not pure and fragment:
        # Same-page anchor
        rel = source_file.relative_to(repo_root).as_posix()
        return source_file, rel, fragment

    parsed = urlparse(pure)
    if parsed.scheme or parsed.netloc:
        return None, pure, fragment

    # Root-relative path
    if pure.startswith("/"):
        candidate = (repo_root / pure.lstrip("/")).resolve()
    else:
        candidate = (source_file.parent / pure).resolve()

    try:
        candidate.relative_to(repo_root.resolve())
    except ValueError:
        return None, pure, fragment

    # Resolve extensionless route patterns
    if candidate.exists():
        if candidate.is_dir():
            index_candidate = candidate / "index.html"
            if index_candidate.exists():
                candidate = index_candidate
        rel = candidate.relative_to(repo_root).as_posix()
        return candidate, rel, fragment

    if not candidate.suffix:
        html_candidate = Path(str(candidate) + ".html")
        if html_candidate.exists():
            rel = html_candidate.relative_to(repo_root).as_posix()
            return html_candidate, rel, fragment

        index_candidate = candidate / "index.html"
        if index_candidate.exists():
            rel = index_candidate.relative_to(repo_root).as_posix()
            return index_candidate, rel, fragment

    rel_guess = os.path.relpath(candidate, repo_root).replace("\\", "/")
    return candidate, rel_guess, fragment


def check_external_url(url: str, cache: Dict[str, Tuple[str, str]], timeout: float = 6.0) -> Tuple[str, str]:
    if url in cache:
        return cache[url]

    if not url.startswith(("http://", "https://")):
        result = ("valid", "Non-HTTP scheme")
        cache[url] = result
        return result

    headers = {"User-Agent": "Mozilla/5.0 (compatible; SEOAuditBot/1.0)"}

    def _request(method: str) -> Tuple[str, str]:
        req = Request(url, headers=headers, method=method)
        try:
            with urlopen(req, timeout=timeout) as resp:
                code = getattr(resp, "status", 200)
                if 200 <= code < 400:
                    return "valid", f"HTTP {code}"
                return "broken", f"HTTP {code}"
        except HTTPError as e:
            if e.code in {405, 403} and method == "HEAD":
                return _request("GET")
            if 200 <= e.code < 400:
                return "valid", f"HTTP {e.code}"
            return "broken", f"HTTP {e.code}"
        except (URLError, socket.timeout, TimeoutError, OSError) as e:
            return "broken", str(e)

    result = _request("HEAD")
    cache[url] = result
    return result


def infer_issue_for_malformed(target: str) -> Tuple[str, str]:
    t = (target or "").strip()
    if not t:
        return "Missing target", "Provide a valid destination URL/path."
    if t.lower().startswith("javascript:"):
        return "Javascript pseudo-URL is not crawlable", "Replace with a real URL in href and keep JS as enhancement."
    if " " in t and not t.startswith("http"):
        return "Unencoded whitespace in URL/path", "URL-encode spaces or rename file/path to avoid spaces."
    return "Malformed URL/path", "Use a valid absolute or relative URL."


def load_indexable_exclusions(repo_root: Path, seo_config: Optional[Dict[str, object]] = None) -> List[str]:
    payload = seo_config if seo_config is not None else load_seo_config(repo_root)

    raw_patterns = payload.get("indexableExclusions", [])
    if not isinstance(raw_patterns, list):
        return []

    patterns: List[str] = []
    for item in raw_patterns:
        if isinstance(item, str) and item.strip():
            patterns.append(item.strip().replace("\\", "/"))
    return patterns


def load_primary_routes(repo_root: Path, seo_config: Optional[Dict[str, object]] = None) -> Set[str]:
    payload = seo_config if seo_config is not None else load_seo_config(repo_root)

    raw_routes = payload.get("primaryRoutes", [])
    if not isinstance(raw_routes, list):
        return set()

    routes: Set[str] = set()
    for item in raw_routes:
        if not isinstance(item, str):
            continue

        route_path = normalize_route_from_config(item, repo_root)
        if not route_path:
            continue
        routes.add(route_path_to_relative_file(route_path))

    return routes


def is_excluded_from_indexing(rel_path: str, exclusion_patterns: List[str]) -> bool:
    normalized = rel_path.replace("\\", "/")
    return any(fnmatch.fnmatch(normalized, pattern) for pattern in exclusion_patterns)


def run_audit(repo_root: Path, output_dir: Path, check_external: bool) -> None:
    html_files = sorted(iter_html_files(repo_root))
    if not html_files:
        raise SystemExit("No HTML files found in repository.")

    seo_config = load_seo_config(repo_root)
    sitemap_file, synced_route_count = sync_sitemap_from_config(repo_root, seo_config)
    robots_file = resolve_repo_path_from_config(repo_root, seo_config.get("robotsPath"), "robots.txt")

    docs: Dict[str, DocumentParser] = {}
    raw_link_records: List[LinkRecord] = []

    for html_file in html_files:
        parser = DocumentParser()
        parser.feed(read_text(html_file))
        parser.close()

        rel = html_file.relative_to(repo_root).as_posix()

        for rec in parser.link_records:
            rec.source_file = rel
            raw_link_records.append(rec)
        for rec in parser.fake_link_records:
            rec.source_file = rel
            raw_link_records.append(rec)

        docs[rel] = parser

    ids_by_file = {k: v.ids for k, v in docs.items()}

    allow_patterns, disallow_patterns = parse_robots(robots_file)
    sitemap_paths = parse_sitemap_paths(sitemap_file, repo_root)
    indexable_exclusions = load_indexable_exclusions(repo_root, seo_config)
    primary_routes = load_primary_routes(repo_root, seo_config)

    noindex_files: Set[str] = set()
    metadata_records: List[MetadataRecord] = []

    for rel, doc in docs.items():
        robots_meta = (doc.robots_meta or "").lower()
        if "noindex" in robots_meta:
            noindex_files.add(rel)

        metadata_records.append(
            MetadataRecord(
                file=rel,
                title=doc.title_text,
                title_ok=bool(doc.title_text.strip()),
                description=doc.description,
                description_ok=bool(doc.description.strip()),
                canonical=doc.canonical,
                canonical_ok=bool(doc.canonical.strip()),
                og_count=len(doc.og_properties),
                jsonld_count=doc.jsonld_count,
                robots_meta=doc.robots_meta,
            )
        )

    indexable_pages: Set[str] = {
        rel
        for rel in docs
        if rel not in noindex_files and not is_excluded_from_indexing(rel, indexable_exclusions)
    }

    metadata_scope_pages = {p for p in primary_routes if p in indexable_pages}
    if not metadata_scope_pages:
        metadata_scope_pages = set(indexable_pages)

    sitemap_scope_pages = set(primary_routes) if primary_routes else set(indexable_pages)

    # Title uniqueness check
    title_to_files: Dict[str, List[str]] = {}
    for m in metadata_records:
        if m.file not in metadata_scope_pages:
            continue
        title = (m.title or "").strip().lower()
        if title:
            title_to_files.setdefault(title, []).append(m.file)

    duplicate_titles = {t: files for t, files in title_to_files.items() if len(files) > 1}

    audit_rows: List[AuditRow] = []
    external_cache: Dict[str, Tuple[str, str]] = {}

    # Internal graph for orphan detection
    html_nodes = {p.relative_to(repo_root).as_posix() for p in html_files}
    incoming: Dict[str, int] = {k: 0 for k in html_nodes}

    for rec in raw_link_records:
        source_path = repo_root / rec.source_file
        target = (rec.target or "").strip()

        if rec.explicit_anchor_without_href:
            audit_rows.append(
                AuditRow(
                    source_file=rec.source_file,
                    source_line=rec.source_line,
                    link_text_or_identifier=rec.identifier or "a",
                    target_url_or_path="",
                    link_type="anchor",
                    status="missing",
                    issue_description="<a> element without href",
                    recommended_fix="Add a valid href or replace with button if it is an action.",
                )
            )
            continue

        if rec.from_fake_link:
            if target:
                issue = "Non-crawlable fake link on non-anchor element"
                fix = "Use <a href=\"...\"> for navigation; keep JS event only as enhancement."
            else:
                issue = "Element behaves as link without explicit crawlable destination"
                fix = "Convert to <a href> for navigation or keep as button for action only."

            audit_rows.append(
                AuditRow(
                    source_file=rec.source_file,
                    source_line=rec.source_line,
                    link_text_or_identifier=rec.identifier,
                    target_url_or_path=target,
                    link_type="internal",
                    status="suspicious",
                    issue_description=issue,
                    recommended_fix=fix,
                )
            )
            # Continue evaluating extracted target if present
            if not target:
                continue

        link_type = classify_target(rec)

        if target.lower().startswith("javascript:"):
            issue, fix = infer_issue_for_malformed(target)
            audit_rows.append(
                AuditRow(
                    source_file=rec.source_file,
                    source_line=rec.source_line,
                    link_text_or_identifier=rec.identifier,
                    target_url_or_path=target,
                    link_type=link_type,
                    status="malformed",
                    issue_description=issue,
                    recommended_fix=fix,
                )
            )
            continue

        if link_type == "anchor":
            if target == "#":
                audit_rows.append(
                    AuditRow(
                        source_file=rec.source_file,
                        source_line=rec.source_line,
                        link_text_or_identifier=rec.identifier,
                        target_url_or_path=target,
                        link_type="anchor",
                        status="suspicious",
                        issue_description="Anchor points to top/placeholder only",
                        recommended_fix="Point to a meaningful section id or convert to button for JS action.",
                    )
                )
                continue

            fragment = target[1:]
            if fragment and fragment in ids_by_file.get(rec.source_file, set()):
                audit_rows.append(
                    AuditRow(
                        source_file=rec.source_file,
                        source_line=rec.source_line,
                        link_text_or_identifier=rec.identifier,
                        target_url_or_path=target,
                        link_type="anchor",
                        status="valid",
                        issue_description="",
                        recommended_fix="",
                    )
                )
            else:
                audit_rows.append(
                    AuditRow(
                        source_file=rec.source_file,
                        source_line=rec.source_line,
                        link_text_or_identifier=rec.identifier,
                        target_url_or_path=target,
                        link_type="anchor",
                        status="broken",
                        issue_description="Anchor target id not found in source document",
                        recommended_fix="Add matching id to destination element or fix href fragment.",
                    )
                )
            continue

        if link_type == "external":
            if target.startswith(("mailto:", "tel:")):
                status, issue, fix = "valid", "", ""
            elif check_external and target.startswith(("http://", "https://")):
                status, detail = check_external_url(target, external_cache)
                issue = "" if status == "valid" else f"External URL check failed ({detail})"
                fix = "" if status == "valid" else "Update or replace the external URL; verify final destination."
            else:
                status, issue, fix = "suspicious", "External URL not checked", "Validate external target availability."

            audit_rows.append(
                AuditRow(
                    source_file=rec.source_file,
                    source_line=rec.source_line,
                    link_text_or_identifier=rec.identifier,
                    target_url_or_path=target,
                    link_type="external",
                    status=status,
                    issue_description=issue,
                    recommended_fix=fix,
                )
            )
            continue

        # Internal or asset path resolution
        resolved_path, normalized_rel, fragment = normalize_internal_target(source_path, target, repo_root)
        normalized_rel = normalized_rel.replace("\\", "/") if normalized_rel else normalized_rel

        if resolved_path is None:
            issue, fix = infer_issue_for_malformed(target)
            audit_rows.append(
                AuditRow(
                    source_file=rec.source_file,
                    source_line=rec.source_line,
                    link_text_or_identifier=rec.identifier,
                    target_url_or_path=target,
                    link_type=link_type,
                    status="malformed",
                    issue_description=issue,
                    recommended_fix=fix,
                )
            )
            continue

        if not resolved_path.exists():
            issue = "Broken relative/internal path"
            if rec.in_nav and link_type == "internal":
                issue = "Route referenced in navigation but missing in codebase"

            if re.search(r"old|previous|temp|backup|zold", target, re.IGNORECASE):
                issue = "Likely link to legacy/removed page"

            rec_fix = "Create target file or update href/src to an existing path."
            audit_rows.append(
                AuditRow(
                    source_file=rec.source_file,
                    source_line=rec.source_line,
                    link_text_or_identifier=rec.identifier,
                    target_url_or_path=target,
                    link_type=link_type,
                    status="broken",
                    issue_description=issue,
                    recommended_fix=rec_fix,
                )
            )
            continue

        # HTML graph edge for orphan analysis
        if link_type == "internal" and normalized_rel in html_nodes and normalized_rel != rec.source_file:
            incoming[normalized_rel] += 1

        # Fragment check on cross-page internal links
        if link_type == "internal" and fragment:
            target_ids = ids_by_file.get(normalized_rel, set())
            if fragment not in target_ids:
                audit_rows.append(
                    AuditRow(
                        source_file=rec.source_file,
                        source_line=rec.source_line,
                        link_text_or_identifier=rec.identifier,
                        target_url_or_path=target,
                        link_type="anchor",
                        status="broken",
                        issue_description="Cross-page anchor target id not found",
                        recommended_fix="Add destination id or correct fragment in link.",
                    )
                )
                continue

        # Robots / noindex / sitemap consistency checks
        robots_path = "/" + normalized_rel
        blocked = is_blocked_by_robots(robots_path, allow_patterns, disallow_patterns)
        noindex = normalized_rel in noindex_files
        in_sitemap = robots_path in sitemap_paths
        target_is_html = normalized_rel in html_nodes
        target_indexable = target_is_html and normalized_rel in indexable_pages

        if blocked:
            if not (target_is_html and not target_indexable):
                audit_rows.append(
                    AuditRow(
                        source_file=rec.source_file,
                        source_line=rec.source_line,
                        link_text_or_identifier=rec.identifier,
                        target_url_or_path=target,
                        link_type=link_type,
                        status="suspicious",
                        issue_description="Link points to robots-blocked resource/page",
                        recommended_fix="Allow in robots.txt if indexable or remove from primary navigation.",
                    )
                )
                continue

        if link_type == "internal" and target_indexable and noindex:
            audit_rows.append(
                AuditRow(
                    source_file=rec.source_file,
                    source_line=rec.source_line,
                    link_text_or_identifier=rec.identifier,
                    target_url_or_path=target,
                    link_type=link_type,
                    status="suspicious",
                    issue_description="Link points to noindex page",
                    recommended_fix="Remove noindex or avoid linking as primary crawl path.",
                )
            )
            continue

        if (
            link_type == "internal"
            and target_indexable
            and normalized_rel in sitemap_scope_pages
            and not in_sitemap
        ):
            audit_rows.append(
                AuditRow(
                    source_file=rec.source_file,
                    source_line=rec.source_line,
                    link_text_or_identifier=rec.identifier,
                    target_url_or_path=target,
                    link_type=link_type,
                    status="suspicious",
                    issue_description="Internal page is not present in sitemap.xml",
                    recommended_fix="Add page to sitemap.xml if it should be indexed.",
                )
            )
            continue

        audit_rows.append(
            AuditRow(
                source_file=rec.source_file,
                source_line=rec.source_line,
                link_text_or_identifier=rec.identifier,
                target_url_or_path=target,
                link_type=link_type,
                status="valid",
                issue_description="",
                recommended_fix="",
            )
        )

    # Metadata quality findings into link audit format for visibility
    for meta in metadata_records:
        if meta.file not in metadata_scope_pages:
            continue
        if not meta.title_ok:
            audit_rows.append(
                AuditRow(
                    source_file=meta.file,
                    source_line=1,
                    link_text_or_identifier="metadata:title",
                    target_url_or_path=meta.file,
                    link_type="internal",
                    status="missing",
                    issue_description="Missing <title>",
                    recommended_fix="Add a unique, descriptive title tag.",
                )
            )
        if not meta.description_ok:
            audit_rows.append(
                AuditRow(
                    source_file=meta.file,
                    source_line=1,
                    link_text_or_identifier="metadata:description",
                    target_url_or_path=meta.file,
                    link_type="internal",
                    status="missing",
                    issue_description="Missing meta description",
                    recommended_fix="Add a concise meta description (about 140-160 chars).",
                )
            )
        if not meta.canonical_ok:
            audit_rows.append(
                AuditRow(
                    source_file=meta.file,
                    source_line=1,
                    link_text_or_identifier="metadata:canonical",
                    target_url_or_path=meta.file,
                    link_type="internal",
                    status="suspicious",
                    issue_description="Missing canonical tag",
                    recommended_fix="Add <link rel=\"canonical\"> for indexable pages.",
                )
            )
        if meta.og_count == 0:
            audit_rows.append(
                AuditRow(
                    source_file=meta.file,
                    source_line=1,
                    link_text_or_identifier="metadata:og",
                    target_url_or_path=meta.file,
                    link_type="internal",
                    status="suspicious",
                    issue_description="Missing Open Graph metadata",
                    recommended_fix="Add og:title, og:description, og:url, og:image where relevant.",
                )
            )

    for title, files in duplicate_titles.items():
        for f in files:
            audit_rows.append(
                AuditRow(
                    source_file=f,
                    source_line=1,
                    link_text_or_identifier="metadata:title",
                    target_url_or_path=f,
                    link_type="internal",
                    status="suspicious",
                    issue_description=f"Duplicate title used across {len(files)} pages",
                    recommended_fix="Ensure each indexable page has a unique title.",
                )
            )

    # Orphan pages
    orphan_pages = sorted(
        p
        for p, count in incoming.items()
        if p != "index.html" and p in indexable_pages and count == 0
    )
    for orphan in orphan_pages:
        audit_rows.append(
            AuditRow(
                source_file=orphan,
                source_line=1,
                link_text_or_identifier="ORPHAN_PAGE",
                target_url_or_path=orphan,
                link_type="internal",
                status="suspicious",
                issue_description="Page has no incoming internal links",
                recommended_fix="Link this page from navigation or another indexable page, or remove it.",
            )
        )

    # Sitemap consistency checks (missing files and robots-blocked entries)
    sitemap_report_lines: List[str] = []
    for sp in sorted(sitemap_paths):
        target = (repo_root / sp.lstrip("/")).resolve()
        exists = target.exists()
        blocked = is_blocked_by_robots(sp, allow_patterns, disallow_patterns)
        if not exists:
            sitemap_report_lines.append(f"- MISSING in filesystem: {sp}")
        if blocked:
            sitemap_report_lines.append(f"- BLOCKED by robots but present in sitemap: {sp}")

    for rel_route in sorted(sitemap_scope_pages):
        route_path = "/" + rel_route
        if route_path not in sitemap_paths:
            sitemap_report_lines.append(f"- MISSING in sitemap.xml (primary route): {route_path}")

    # Write CSV: full audit
    output_dir.mkdir(parents=True, exist_ok=True)
    link_csv = output_dir / "link-audit.csv"
    with link_csv.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "source_file/page",
            "source_line",
            "link_text_or_identifier",
            "target_url/path",
            "link_type",
            "status",
            "issue_description",
            "recommended_fix",
        ])
        for row in sorted(audit_rows, key=lambda r: (r.status, r.source_file, r.source_line, r.target_url_or_path)):
            writer.writerow([
                row.source_file,
                row.source_line,
                row.link_text_or_identifier,
                row.target_url_or_path,
                row.link_type,
                row.status,
                row.issue_description,
                row.recommended_fix,
            ])

    # Write metadata CSV
    metadata_csv = output_dir / "metadata-audit.csv"
    with metadata_csv.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "file",
            "title",
            "title_ok",
            "description",
            "description_ok",
            "canonical",
            "canonical_ok",
            "og_count",
            "jsonld_count",
            "robots_meta",
        ])
        for m in sorted(metadata_records, key=lambda x: x.file):
            writer.writerow([
                m.file,
                m.title,
                str(m.title_ok),
                m.description,
                str(m.description_ok),
                m.canonical,
                str(m.canonical_ok),
                m.og_count,
                m.jsonld_count,
                m.robots_meta,
            ])

    # Write orphan pages file
    orphan_file = output_dir / "orphan-pages.txt"
    orphan_file.write_text("\n".join(orphan_pages) + ("\n" if orphan_pages else ""), encoding="utf-8")

    # Markdown report for non-valid findings
    non_valid = [r for r in audit_rows if r.status != "valid"]
    counts = {
        "valid": sum(1 for r in audit_rows if r.status == "valid"),
        "missing": sum(1 for r in audit_rows if r.status == "missing"),
        "broken": sum(1 for r in audit_rows if r.status == "broken"),
        "malformed": sum(1 for r in audit_rows if r.status == "malformed"),
        "suspicious": sum(1 for r in audit_rows if r.status == "suspicious"),
    }

    md_path = output_dir / "link-audit-report.md"
    with md_path.open("w", encoding="utf-8") as f:
        f.write("# Link Audit Report\n\n")
        f.write("## Summary\n\n")
        f.write(f"- Total audited references: {len(audit_rows)}\n")
        f.write(f"- Valid: {counts['valid']}\n")
        f.write(f"- Missing: {counts['missing']}\n")
        f.write(f"- Broken: {counts['broken']}\n")
        f.write(f"- Malformed: {counts['malformed']}\n")
        f.write(f"- Suspicious: {counts['suspicious']}\n\n")

        f.write("## Findings (non-valid only)\n\n")
        f.write("| source file/page | line | link text or identifier | target URL/path | link type | status | issue description | recommended fix |\n")
        f.write("|---|---:|---|---|---|---|---|---|\n")
        for r in sorted(non_valid, key=lambda x: (x.status, x.source_file, x.source_line, x.target_url_or_path)):
            f.write(
                "| {sf} | {ln} | {idn} | {tgt} | {lt} | {st} | {iss} | {fix} |\n".format(
                    sf=r.source_file.replace("|", "\\|"),
                    ln=r.source_line,
                    idn=r.link_text_or_identifier.replace("|", "\\|")[:200],
                    tgt=r.target_url_or_path.replace("|", "\\|")[:200],
                    lt=r.link_type,
                    st=r.status,
                    iss=r.issue_description.replace("|", "\\|")[:240],
                    fix=r.recommended_fix.replace("|", "\\|")[:240],
                )
            )

    sitemap_md = output_dir / "sitemap-robots-audit.md"
    with sitemap_md.open("w", encoding="utf-8") as f:
        f.write("# Sitemap and Robots Consistency\n\n")
        if not sitemap_report_lines:
            f.write("No sitemap/robots contradictions detected.\n")
        else:
            for line in sitemap_report_lines:
                f.write(line + "\n")

    print("Audit completed.")
    print(f"HTML files scanned: {len(html_files)}")
    print(f"Total references audited: {len(audit_rows)}")
    print(f"Non-valid findings: {len(non_valid)}")
    try:
        sitemap_display = sitemap_file.relative_to(repo_root).as_posix()
    except ValueError:
        sitemap_display = str(sitemap_file)
    print(f"Sitemap synchronized from seo.json: {sitemap_display} ({synced_route_count} routes)")
    print(f"Report: {md_path}")
    print(f"CSV: {link_csv}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run repository-wide link and SEO audit.")
    parser.add_argument("--repo", type=Path, default=Path.cwd(), help="Repository root path")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("seo/reports"),
        help="Output directory for reports",
    )
    parser.add_argument(
        "--no-external-check",
        action="store_true",
        help="Skip live HTTP checks for external links",
    )
    args = parser.parse_args()

    repo_root = args.repo.resolve()
    output_dir = (repo_root / args.output).resolve() if not args.output.is_absolute() else args.output

    run_audit(repo_root, output_dir, check_external=not args.no_external_check)


if __name__ == "__main__":
    main()
