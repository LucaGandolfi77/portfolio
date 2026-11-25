#!/usr/bin/env node
/**
 * serve-site.mjs — anteprima locale di _site/ come la serve GitHub Pages:
 * tutto sotto /portfolio/ (o /<REPO>/), 404 per il resto. Così si scoprono
 * in locale i path assoluti ("/sw.js", "/icons/...") che online si rompono.
 *
 * Uso: node scripts/build-site.mjs && node scripts/serve-site.mjs
 *      PORT=4180 REPO=portfolio node scripts/serve-site.mjs
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '_site');
const PORT = Number(process.env.PORT || 4180);
const BASE = `/${process.env.REPO || 'portfolio'}/`;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf', '.glb': 'model/gltf-binary',
  '.gba': 'application/octet-stream', '.task': 'application/octet-stream', '.tflite': 'application/octet-stream'
};

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/') { res.writeHead(302, { Location: BASE }); return res.end(); }
  if (!url.pathname.startsWith(BASE)) { res.writeHead(404); return res.end('404 (fuori da ' + BASE + ')'); }
  let file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname.slice(BASE.length))));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  try {
    const s = await stat(file);
    if (s.isDirectory()) {
      if (!url.pathname.endsWith('/')) { res.writeHead(301, { Location: url.pathname + '/' + url.search }); return res.end(); }
      file = path.join(file, 'index.html');
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404');
  }
}).listen(PORT, 'localhost', () => console.log(`_site/ su http://localhost:${PORT}${BASE}`));
