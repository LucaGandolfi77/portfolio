/**
 * Genera sitemap.xml da config/seo.json (pagine principali) + catalogo
 * (tutte le app di projects/ e games/). Prima la sitemap era scritta a mano
 * e copriva 36 URL su oltre 200 pagine pubblicate.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadCatalog } from './catalog.mjs';

function globToRe(glob) {
  const re = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\0').replace(/\*/g, '[^/]*').replace(/\0/g, '.*');
  return new RegExp(`^${re}$`);
}

function lastmod(root, rel) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', rel], { cwd: root, encoding: 'utf8' }).trim();
    return out ? new Date(out).toISOString().replace(/\.\d{3}Z$/, 'Z') : null;
  } catch { return null; }
}

export function generateSitemap({ root, out }) {
  const seo = JSON.parse(fs.readFileSync(path.join(root, 'config/seo.json'), 'utf8'));
  const base = seo.siteUrl.replace(/\/$/, '');
  const excluded = (seo.indexableExclusions || []).map(globToRe);
  const { projects, games } = loadCatalog(root);

  const routes = new Set((seo.sitemapRoutes || seo.primaryRoutes || ['/']).map((r) => r.replace(/^\//, '')));
  routes.add('projects.html');
  routes.add('games.html');
  for (const item of [...projects, ...games]) {
    if (item.href && !/^https?:/.test(item.href)) routes.add(item.href.replace(/^\.\//, ''));
  }

  const entries = [];
  for (const r of [...routes].sort((a, b) => (a === '' ? -1 : b === '' ? 1 : a.localeCompare(b)))) {
    const file = r === '' || r.endsWith('/') ? `${r}index.html` : r;
    if (excluded.some((re) => re.test(r) || re.test(file))) continue;
    if (!fs.existsSync(path.join(root, file)) && !fs.existsSync(path.join(path.dirname(out), file))) continue;
    entries.push({ loc: `${base}/${r}`, lastmod: lastmod(root, file) });
  }

  const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  for (const e of entries) {
    xml.push('  <url>', `    <loc>${e.loc.replace(/&/g, '&amp;')}</loc>`);
    if (e.lastmod) xml.push(`    <lastmod>${e.lastmod}</lastmod>`);
    xml.push('  </url>');
  }
  xml.push('</urlset>', '');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, xml.join('\n'));
  return entries.length;
}
