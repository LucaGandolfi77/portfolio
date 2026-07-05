# Target Project Architecture

This repository currently mixes app shell files, standalone pages, experiments, scripts, and generated artifacts in root-level folders. The target structure below keeps URL compatibility while introducing a maintainable organization.

## Target structure

```text
portfolio/
  assets/
    css/
    js/
    images/
    icons/
    data/
  pages/
    core/
    content/
    tools/
    games/
  components/
    nav/
    cards/
    seo/
  services/
    pwa/
    i18n/
    analytics/
  config/
    routes.json
    seo.json
  tools/
    seo/
  seo/
    reports/
  docs/
    architecture/
  index.html
  manifest.json
  sw.js
  robots.txt
  sitemap.xml
```

## Compatibility-first migration strategy

To preserve existing external backlinks and bookmarks, migration should happen in phases:

1. Keep current public URLs stable while introducing tooling and conventions.
2. Normalize shared assets and fix broken relative links.
3. Move low-risk pages into new folders, then leave redirect stubs at old URLs.
4. Rebuild internal links and sitemap from the route manifest.

## Naming conventions

- Files: `kebab-case` for pages and assets.
- JS modules: `kebab-case.js` for browser modules.
- Data files: `snake_case.json` or `kebab-case.json` consistently per folder.
- Route aliases: use one canonical URL per page.

## Separation of concerns

- App shell and navigation: root page and shared layout scripts.
- Route pages: content-focused HTML pages.
- Reusable UI: common card/grid/top-bar components in shared JS/CSS.
- PWA logic: service worker + manifest + install/offline helpers.
- SEO logic: sitemap generation + robots policy + metadata validation.

## Current implementation status

- Added `tools/seo/site_audit.py` and report output under `seo/reports/`.
- Introduced architecture and tooling docs under `docs/architecture/`.
- Refactored high-impact broken links and core PWA/SEO files.
- Deferred mass file moves to avoid route regressions without redirect infrastructure.
