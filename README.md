# Luca Gandolfi — Portfolio

Personal portfolio, projects and games by Luca Gandolfi: a static homepage plus
about 220 independent browser apps, most of them installable PWAs, all served
from GitHub Pages.

- Portfolio: <https://lucagandolfi77.github.io/portfolio/>
- Projects index: <https://lucagandolfi77.github.io/portfolio/projects.html>
- Games index: <https://lucagandolfi77.github.io/portfolio/games.html>

## Repository layout

```text
portfolio/
├── index.html, games.html, projects.html   # homepage and indexes
├── manifest.json, sw.js                    # PWA of the homepage only
├── top_buttons.js                          # shared top bar for older apps
├── assets/                                 # homepage CSS/JS, images, CV, shared icons
│   └── js/projects-data.js, catalog-data.js   # the catalog (single source)
├── i18n/                                   # homepage translations (11 languages)
├── pages/                                  # content pages (blog, books, music, …)
├── projects/<slug>/                        # one self-contained app per folder
│   └── _shared/                            # project kit: tokens, base, shell
├── games/<slug>/                           # one self-contained game per folder
│   ├── _kit/                               # game kit: loop, storage, i18n, PWA, tests
│   └── _vendor/                            # shared libraries (three, pixi, …)
├── labs/                                   # NOT published: servers, desktop tools, drafts
├── scripts/                                # build, tests, audits, maintenance
├── tools/quality/                          # Playwright E2E and audit baseline
├── config/seo.json                         # sitemap routes and exclusions
└── docs/                                   # notes, store listings, architecture
```

Only what `scripts/build-site.mjs` copies into `_site/` is published. See
[labs/README.md](labs/README.md) for the projects that are kept out.

## Commands

Node 22.12 or newer is required. The root has no dependencies.

```bash
npm run build        # build _site/ (also runs npm ci, tests and builds of the Vite apps)
npm run build:fast   # same, without the Vite apps
npm run serve        # preview _site/ at http://localhost:4180/portfolio/
npm test             # every app's tests, discovered by convention
npm run check        # syntax of all JS + tests + audits (what CI runs)
npm run e2e          # Playwright suites in tools/quality
```

`npm run serve` mounts the site under `/portfolio/`, exactly like GitHub Pages, so
root-relative paths (`/sw.js`, `/icons/…`) fail locally instead of only online.

## How deployment works

`.github/workflows/deploy.yml` runs on every push to `main`:

1. **Quality gate** (`quality.yml`, also on every PR):
   - `node --check` on every tracked JS file;
   - all app tests;
   - the projects audit against `tools/quality/audit-baseline.json`;
   - the Pages audit (catalog paths, manifests, service workers);
   - Playwright E2E.
2. **Build** (`scripts/build-site.mjs`) creates `_site/`:
   - it copies only files tracked in git: root files, `assets/`, `i18n/`, `pages/`, `projects/`, `games/`;
   - it leaves out package files, TS/Vite/Capacitor config, tests, `android/`, `ios/`, `www/`, keystores, scripts and `*.md`;
   - it builds the apps that declare a `"portfolio"` block in their `package.json`;
   - it replaces `__BUILD_ID__` in every service worker with the commit SHA, or adds a build comment;
   - it generates `sitemap.xml` from `config/seo.json` and the whole catalog.
3. **Deploy** uploads `_site/` to GitHub Pages.

### Apps with a build step

```jsonc
// projects/verso-il-17/package.json
"portfolio": {
  "build": "build",            // npm script that builds the app
  "test": "test",              // optional npm script run before the build
  "out": "dist",               // build output folder
  "publishAt": "verso-il-17",  // where it is published inside _site/
  "basePath": true             // pass BASE_PATH=/<repo>/<publishAt>/ to the build
}
```

Build output is never committed (`.gitignore`). Today this applies to
`projects/verso-il-17` and `games/coverage-galaxy`.

## Adding a new app

1. Create `projects/<slug>/` or `games/<slug>/` with `index.html`,
   `manifest.webmanifest` and `sw.js`. Good starting points are
   [`games/_kit/template/`](games/_kit/template/) and
   [`projects/_shared/_template.html`](projects/_shared/_template.html).
2. Use **relative paths only**. The site lives under `/portfolio/`, so `/foo`
   points to the domain root and breaks.
3. Write the manifest with `"start_url": "./"`, `"scope": "./"`, `"id": "./"` and
   192 and 512 px icons. If the app has no icons of its own, use
   `../../assets/icon-192.png`, `../../assets/icon-512.png` and
   `../../assets/icon-512-maskable.png`.
4. Register the service worker with a relative URL:
   `navigator.serviceWorker.register('sw.js', { scope: './' })`.
5. Give the service worker its own cache prefix, and in `activate` **delete only
   that app's caches**. Every app shares the `lucagandolfi77.github.io` origin, so
   deleting "every cache except mine" wipes the offline data of all the other
   apps. The audit fails the build if it finds that pattern.

   ```js
   const CACHE = 'my-app-__BUILD_ID__';           // stamped with the commit SHA on deploy
   self.addEventListener('activate', (e) => e.waitUntil(
     caches.keys().then((keys) => Promise.all(keys
       .filter((k) => k !== CACHE && k.startsWith('my-app-'))
       .map((k) => caches.delete(k))))
   ));
   ```
6. Put tests in `test/` or `tests/`. Files named `*.test.mjs` run with
   `node --test`; other files whose name contains `test` (for example
   `logic-test.mjs`) run with `node`. They are picked up automatically.
7. Add the app to the catalog in `assets/js/catalog-data.js` (or
   `projects-data.js`). The catalog also feeds the sitemap.
8. Run `npm run check`, `npm run build` and `npm run serve`, then open the app
   under `/portfolio/`.

## Home page styles

The home page has six complete styles, picked from the **Style** button in the
top bar or with a link such as `?style=terminal`:

| Style | Look | Theme |
|---|---|---|
| `classic` (default) | Lexend + Source Sans 3, brand lime | light or dark (user toggle) |
| `glass` | frosted glass on an animated aurora, bento grid | dark |
| `terminal` | shell session, typed headline, CRT scanlines | dark |
| `arcade` | pixel type, HUD scores, pixelated avatar | dark |
| `newspaper` | front page: blackletter masthead, rules, drop cap | light |
| `fashion` | magazine cover: Bodoni, numbered contents | light |

- All colours, fonts and motion come from `assets/css/tokens.css`. Write new
  CSS with the `--c-*` / `--f-*` tokens, never with fixed colours.
- A style is one file, `assets/css/styles/<name>.css`: it redefines the tokens
  under `:root[data-style="<name>"]`, then adds its signature rules.
- `assets/js/style-engine.js` loads that CSS and its Google Fonts only when
  the style is chosen. It switches styles with the View Transitions API and
  runs the style's motion module. The inline script in `index.html` applies
  the saved style before the first paint.
- With `prefers-reduced-motion`, every style shows its final state: no
  transitions, no typing effect, no entrance animations.
- To add a style, add it to `window.PORTFOLIO_STYLES` in `index.html`, to
  `META`/`ORDER` in `style-engine.js`, and create its CSS file. Then add it to
  `tools/quality/e2e/home-styles.spec.mjs`.

The interactive preview used to choose the styles is in `labs/style-preview/`.

## Hosting notes

- GitHub Pages serves static files only. Projects that need Node, Python,
  WebSocket or database servers live in `labs/` and are not published.
- Pages cannot set custom HTTP headers: CSP, referrer and nosniff are set as
  `<meta>` tags. `frame-ancestors` cannot be set this way. Clickjacking
  protection needs a proxy such as Cloudflare in front of the site.
- Camera, microphone, geolocation, service workers and WebRTC require HTTPS
  or `localhost`.
- Android TWA `assetlinks.json` only works at the root of the domain (the
  `lucagandolfi77.github.io` repository), not under `/portfolio/`.

## Privacy

Most apps process data locally in the browser: scores, notes and settings stay in
`localStorage`/IndexedDB, and camera, microphone, motion and location are
requested only after a user action. Apps that call external APIs or download
models say so on their own page.

## Contact

- GitHub: [LucaGandolfi77](https://github.com/LucaGandolfi77)
- LinkedIn: [luca-gandolfi7](https://it.linkedin.com/in/luca-gandolfi7)

## License

There is no repository-wide license yet. Third-party libraries, fonts, models and
media keep their own licenses.
