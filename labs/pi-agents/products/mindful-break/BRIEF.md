# mindful-break — Hourly breathing break PWA

**Slug:** `mindful-break`
**Source:** `products/ideas/concepts/mindful-break.md` (funded concept)
**Type:** App (wellness/break reminder)
**Markets:** US/global primary; IT secondary
**Distribution:** Google Play (TWA/Bubblewrap) | App Store (Capacitor) | Web PWA
**Monetization:** Freemium — 1 break/day free; €2.99 one-time unlock for unlimited breaks + ambient sounds + widget

## One-line pitch
A lightweight PWA that reminds users to pause for a 60-second breathing/grounding break every hour, with optional ambient sound and a home-screen widget — zero data collection, no backend.

## Target user
Office workers (US/global) aged 25–55 experiencing digital burnout; remote workers, students, anyone with long screen sessions. Privacy-conscious; no accounts, no servers.

## Current state
**Prototype phase.** Concept brief written. Implementation: offline-first PWA, hourly local notification, 60-second breathing screen (Canvas animation), ambient sound (Web Audio oscillator or bundled tiny loop), streak tracking (localStorage), optional widget (same pattern as ambient-lock-widget). No code written yet.

## Known constraints
- Privacy-first brand: no accounts, no backend, on-device processing only
- Microphone permission requires pre-permission UX screen (cold prompts are a defect)
- Store rules: Apple 4.2 (minimum functionality), 5.1.1 (data collection), Play Data Safety
- Ad monetization requires UMP consent in EEA
- 128 KiB max per agent .md file

## Playbook sequence
1. `graphs/01-discovery.json` — Go/No-Go memo (market, PRD, UX, financials)
2. `graphs/02-build.json` — Implement widget + notification + breathing UI
3. `graphs/03-release.json` — Release gate
4. `graphs/04-aso-audit.json` — ASO optimization (wellness niche)
5. `graphs/05-localize-it.json` — IT localization of EN source strings

## Open questions for Discovery
- Notification hourly frequency: Do Apple/Google allow hourly local notifications without backend? (live docs needed)
- Ambient sound format: bundled vs Web Audio oscillator (bundle size vs latency)
- Widget format: same manifest.activity + SW message handler as ambient-lock-widget?
- Pre-permission UX pattern for notifications (SHHH pattern replicate?)
- Burnout / digital-wellbeing stats: forum/survey citation (Reddit r/productivity, Blind, WHO reports)
- Competitor gap: existing "hourly break + widget + zero backend" apps?

## Contacts
- **Product owner:** Faro Studio Director (human)
- **Concept brief:** `products/ideas/concepts/mindful-break.md`
- **Existing assets:** copy from `shhh-reader/` as scaffold (manifest, icons, service worker pattern)
