# Pixel Stretch App

**Slug:** `pixel-stretch`
**Source:** `/workspaces/portfolio/pixel-stretch-app/`
**Type:** Tool (image editor)
**Markets:** US/global primary; IT secondary
**Distribution:** Web PWA | Google Play (TWA/Bubblewrap) | App Store (Capacitor) | Desktop (Electron)
**Monetization:** Free with optional one-time unlock

## One-line pitch
A browser-based image editor with pixel stretch and AI scouring effects. Works completely offline (except first-time AI model download). No server sends your photos anywhere.

## Target user
Mobile-first creative users who want quick photo effects on iPhone. Privacy-conscious. Works on iOS Safari as installable PWA and as Electron desktop app.

## Current state
**Shippable.** Full product with: 122/122 tests pass, zero lint errors, build OK. Complete i18n EN system (300+ keys across 15 components), clipboard/paste, onboarding tutorial, dark/light theme toggle, install banner, Bubblewrap TWA packaging. Privacy link added to ImageUploader. HTML/CSS/JS with Vite + React + TypeScript + Zustand.

## Known constraints
- iPhone-only responsive design (sidebars become drawers)
- AI models downloaded on first use (not bundled) — requires initial internet
- HEIC/HEIF conversion on iOS import
- Electron desktop uses custom `app://` protocol for SharedArrayBuffer/WASM
- Vite `base: './'` for GitHub Pages deployment compatibility
- Privacy-first: no server, no account, on-device processing

## Playbook sequence
1. `graphs/01-discovery.json` — Already completed for Play Store launch.
2. `graphs/02-build.json` — Ready for new feature authorization.
3. `graphs/03-release.json` — Ready for release gate.
4. `graphs/04-aso-audit.json` — Ready for ASO optimization.
5. `graphs/05-localize-it.json` — IT localization of EN source strings.

## Open questions for Discovery
- Electron desktop: App Store via Capacitor or separate desktop channel?
- AI model hosting: bundled in app or downloaded? Impacts install size.
- What's-next feature: what retains users after the stretch effect novelty wears off?

## Contacts
- **Product owner:** Faro Studio Director (human)
- **Source repo:** `/workspaces/portfolio/pixel-stretch-app/`
- **Existing assets:** `STORE-LISTING.md`, `DEPLOY-CHECKLIST.md`, `bubblewrap.json`, `vercel.json`
