# Pixel Stretch — Changelog

> Product: Pixel Stretch App | Type: Tool (image editor) | Status: Shippable

## Format
Each entry: `## [YYYY-MM-DD] <version|event>` — features, fixes, metrics, and decision context.

## Timeline

### [2026-09-08] Studio founded
- Added to Faro Studio product portfolio.
- Source: `/workspaces/portfolio/pixel-stretch-app/`
- Type: Tool (image editor)
- Monetization: Free with optional one-time unlock
- Markets: US/global primary; IT secondary
- Distribution: Web PWA | Google Play (TWA) | App Store (Capacitor) | Desktop (Electron)

### [2026-09-08] Testing complete
- 122/122 tests pass, zero lint errors, build OK
- Complete i18n EN system (300+ keys across 15 components)
- Clipboard/paste, onboarding tutorial, dark/light theme toggle
- Install banner, Bubblewrap TWA packaging
- Privacy link added to ImageUploader

### [2026-09-08] Ideation pipeline connected
- Brief: `products/pixel-stretch/BRIEF.md`
- Activity log: `.pi/agents/logs/creativo.md`
- Next steps: ASO audit, release gate

### [2026-09-08] Known features
- Pixel stretch and AI scouring effects
- 100% offline (except first-time AI model download)
- HEIC/HEIF conversion on iOS
- Electron desktop with `app://` protocol for SharedArrayBuffer/WASM
- Vite `base: './'` for GitHub Pages compatibility

