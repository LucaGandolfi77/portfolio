# VITE — Le molte vite di Emmanuel Carrère

**Slug:** `vite-carrere`
**Source:** `/workspaces/portfolio/projects/vite-carrere/`
**Type:** Game (interactive literary experience)
**Markets:** US/global primary; IT secondary
**Distribution:** Web PWA | Google Play (TWA/Bubblewrap) | App Store (Capacitor)
**Monetization:** Free

## One-line pitch
An interactive literary experience that walks through 8 works by Emmanuel Carrère through 8 unique mini-games. Zero dependencies. Offline-first. Only reading and wonder.

## Target user
Literary enthusiasts, students of contemporary French/Italian literature, and anyone who wants to experience Carrère's writing through play. Adults 18+.

## Current state
**Shippable.** Full product with: 8 chapters, 8 unique mini-games (puzzle, spot-the-difference, swipe, tower, fragments, gentle words, breathing, listening), vanilla JS (IIFE modules), CSS custom properties, Web Audio API, localStorage for save, Service Worker (offline-first). Complete i18n EN/IT system. 15 achievements. Store listing prepared. Bubblewrap TWA configured. Deploy checklist complete — 25 files, 151KB.

## Known constraints
- Pure client-side: no server, no backend, zero dependencies
- Literary content is copyrighted (Carrère's works) — personal use only
- Web Audio API for synthesized sounds (no external audio files)
- localStorage for persistence — data lost on clear
- Italian localization is complete (native IT by Irene)

## Playbook sequence
1. `graphs/01-discovery.json` — Already completed for Play Store launch.
2. `graphs/02-build.json` — Ready for new chapter/feature authorization.
3. `graphs/03-release.json` — Ready for release gate.
4. `graphs/04-aso-audit.json` — Ready for ASO optimization (literary niche).
5. `graphs/05-localize-it.json` — IT localization already complete.

## Open questions for Discovery
- Literary game market is small: expand to other authors?
- More chapters? Carrère has many more works.
- Social/multiplayer reading experience? (Requires backend — conflicts with zero-backend stack)

## Contacts
- **Product owner:** Faro Studio Director (human)
- **Source repo:** `/workspaces/portfolio/projects/vite-carrere/`
- **Existing assets:** `DEPLOY-CHECKLIST.md`, `bubblewrap.json`, `vercel.json`
