# Italy Glight Sim

Isometric 2.5D flight simulator PWA: a tilted, compact Italy, 11 craft (aircraft and starships), free flight and point-to-point missions with real landings.

## Play on a phone (no local server needed)

Open the HTTPS URL on the phone and use **Add to Home Screen**:

<https://lucagandolfi77.github.io/portfolio/games/italy-glight-sim/>

The first load needs a connection; after the service worker installs, the game works offline. GitHub Pages serves HTTPS, which is required for service workers and PWA installation.

## Build and preview locally

```bash
cd games/italy-glight-sim
npm run build      # writes a standalone dist/ (no dependencies to install)
npm run preview    # http://localhost:8000/
```

`build.mjs` copies the game, the shared `games/_kit` modules it uses and the site top bar into `dist/`, rewrites their relative imports, and stamps the service-worker cache name with `BUILD_ID` (defaults to `dev`). Set `BASE_PATH=/some/subpath/` if you host `dist/` at a subpath and want absolute manifest URLs. `dist/` is gitignored.

## CI/CD

- `.github/workflows/quality.yml` runs syntax checks and the logic tests; failures block deploy.
- `.github/workflows/deploy.yml` runs the build with `BUILD_ID: ${{ github.sha }}`, stamps the deployed service worker, then publishes the whole repository to GitHub Pages (`.nojekyll` keeps the `_kit` folder accessible).

The game therefore stays at `/portfolio/games/italy-glight-sim/` on the portfolio site.

## Tests

```bash
npm run check
npm test
cd ../.. && node games/_kit/test/run-all.mjs   # repo-wide catalog + service worker audit
```
