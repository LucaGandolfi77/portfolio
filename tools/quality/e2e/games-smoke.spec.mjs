import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { expect, test } from '@playwright/test';

/*
 * Smoke test for every game in the catalog: the page opens, runs for a few
 * seconds, throws no JavaScript error and asks for no missing local file.
 * Apps built with Vite (a "portfolio" block in package.json) are tested on
 * their build output and skipped when it has not been built.
 */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SETTLE_MS = 3000;
/* Missing files a game asks for on purpose, with a working fallback. */
const EXPECTED_404 = [
  /* card-games probes for its LAN server and falls back to bots. */
  '/games/card-games/public/socket.io/socket.io.js'
];

function catalogGames() {
  const sandbox = {};
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(join(ROOT, 'assets', 'js', 'catalog-data.js'), 'utf8'), sandbox);
  return sandbox.PORTFOLIO_CATALOG.games.filter((g) => g.href.startsWith('games/'));
}

/** Where to load a catalog entry from, and why to skip it if it cannot be. */
function target(href) {
  const folder = href.split('/')[1];
  const pkg = join(ROOT, 'games', folder, 'package.json');
  const app = existsSync(pkg) ? JSON.parse(readFileSync(pkg, 'utf8')).portfolio : null;
  if (!app?.build) return { path: href };
  const published = `${app.publishAt}/`;
  const rest = href.startsWith(published) ? href.slice(published.length) : href.split('/').slice(2).join('/');
  const path = `games/${folder}/${app.out}/${rest}`;
  const entry = join(ROOT, path, rest === '' || path.endsWith('/') ? 'index.html' : '');
  if (!existsSync(entry) || !statSync(entry).isFile()) return { path, skip: `not built: cd games/${folder} && npm run build` };
  return { path };
}

/* No GPU on CI runners: WebGL through SwiftShader. */
test.use({
  launchOptions: {
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
  },
  video: 'off',
  trace: 'off'
});

test.describe('games smoke', () => {
  /* One browser size is enough to find broken pages. */
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'smoke test runs on desktop Chromium only');
  });

  for (const game of catalogGames()) {
    const { path, skip } = target(game.href);
    test(`${game.id} (${game.href})`, async ({ page, baseURL }) => {
      test.skip(!!skip, skip);
      const problems = [];
      const origin = new URL(baseURL).origin;
      page.on('pageerror', (error) => problems.push(`JS error: ${error.message}`));
      page.on('dialog', (dialog) => dialog.dismiss().catch(() => undefined));
      page.on('response', (response) => {
        const url = new URL(response.url());
        /* The site root has no favicon in this local server: not a game bug. */
        if (url.origin !== origin || url.pathname === '/favicon.ico' || EXPECTED_404.includes(url.pathname)) return;
        if (response.status() >= 400) problems.push(`HTTP ${response.status()}: ${url.pathname}`);
      });
      await page.goto(`/${path}`, { waitUntil: 'load', timeout: 25000 });
      await page.waitForTimeout(SETTLE_MS);
      expect([...new Set(problems)]).toEqual([]);
    });
  }
});
