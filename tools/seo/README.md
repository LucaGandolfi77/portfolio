# SEO and Link Audit Tooling

This folder contains repository-wide SEO auditing tools used to keep the static PWA crawlable and maintainable.

## Available script

- `site_audit.py`: crawls HTML files and reports link integrity, crawlability issues, metadata gaps, and orphan pages.

## Usage

```bash
python3 tools/seo/site_audit.py --repo . --output seo/reports
```

Optional:

```bash
python3 tools/seo/site_audit.py --repo . --output seo/reports --no-external-check
```

## Automatic sitemap generation

Before running link checks, `site_audit.py` now synchronizes `sitemap.xml` from `config/seo.json`.

- `siteUrl`: base URL used in `<loc>` entries.
- `sitemapPath`: output file path for the generated sitemap.
- `sitemapRoutes`: explicit route list to publish in sitemap.
- Fallback behavior: if `sitemapRoutes` is missing or empty, the tool uses `primaryRoutes`.

This makes sitemap updates deterministic and config-driven: edit routes in `seo.json`, then run the audit.

## Generated reports

- `seo/reports/link-audit.csv`
- `seo/reports/link-audit-report.md`
- `seo/reports/metadata-audit.csv`
- `seo/reports/orphan-pages.txt`
- `seo/reports/sitemap-robots-audit.md`

## Notes

- The audit favors strict crawlability checks and flags fake links (`button/div/span` used for navigation).
- It validates internal paths against the repository structure and optionally validates external URLs over HTTP.
