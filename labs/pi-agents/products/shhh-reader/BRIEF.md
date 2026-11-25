# SHHH — Leggi in silenzio

**Slug:** `shhh-reader`
**Source:** `/workspaces/portfolio/projects/shhh-reader/` (+ `../../shhh-reader/`)
**Type:** App (reader)
**Markets:** US/global primary; IT secondary
**Distribution:** Google Play (TWA/Bubblewrap) | App Store (Capacitor) | Web PWA
**Monetization:** One-time €6.99 + ads (per user choice)

## One-line pitch
SHHH is a reader that monitors ambient noise via the device microphone and blocks/fades content when noise exceeds your threshold — forcing you to find silence before you can read.

## Target user
Students, knowledge workers, and anyone who wants to read deeply in noisy environments. Privacy-conscious; no accounts, no servers.

## Current state
**Shippable.** Full product with: offline-first PWA, PDF/ePub/TXT/MD/HTML browser, real-time noise monitoring (RMS→dB), two modes (Threshold block / Fade blur), streak & stats, widget support, notification system, UMP consent for ads, AdMob integration, micro-permission screen. All syntax checks pass. SW v2 with CDN precache. PNG icons generated. Bubblewrap TWA configured. Capacitor wrapper proposed.

## Known constraints
- Privacy-first brand: no accounts, no backend, on-device processing only
- Microphone permission requires pre-permission UX screen (cold prompts are a defect)
- Store rules: Apple 4.2 (minimum functionality), 5.1.1 (data collection), Play Data Safety
- Ad monetization requires UMP consent in EEA
- 128 KiB max per agent .md file (already verified)

## Playbook sequence
1. `graphs/01-discovery.json` — Already completed. Go/No-Go memo exists in session context.
2. `graphs/02-build.json` — Ready for new feature authorization.
3. `graphs/03-release.json` — Ready for release gate when listing is final.
4. `graphs/04-aso-audit.json` — Ready for ASO optimization.
5. `graphs/05-localize-it.json` — IT localization of EN source strings.

## Open questions for Discovery
- Italian market: worth the localization effort? (Answer: yes for Play Store IT category)
- Ad placement: how many ads without hurting retention?
- Widget interaction: what's the minimum viable widget action?

## Contacts
- **Product owner:** Faro Studio Director (human)
- **Source repo:** `/workspaces/portfolio/projects/shhh-reader/`
- **Existing assets:** `STORE-LISTING.md`, `DEPLOY-CHECKLIST.md`, `bubblewrap.json`, `manifest.webmanifest`
