/**
 * Carica il catalogo del portfolio (assets/js/projects-data.js +
 * assets/js/catalog-data.js) in Node, eseguendo i due script del browser in
 * una sandbox. Così sitemap, audit e test leggono la stessa fonte della home.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export function loadCatalog(root) {
  const ctx = vm.createContext({ console });
  ctx.window = ctx;
  for (const f of ['assets/js/projects-data.js', 'assets/js/catalog-data.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  }
  const cat = ctx.PORTFOLIO_CATALOG;
  if (!cat) throw new Error('PORTFOLIO_CATALOG non definito da catalog-data.js');
  return { projects: [...cat.projects], games: [...cat.games] };
}
