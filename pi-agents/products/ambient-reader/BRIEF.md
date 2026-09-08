# ambient-lock-widget — Lock-screen widget + TWA (offline-first reader)

**Slug:** `ambient-reader`  (product: `ambient-lock-widget`)
**Source:** `products/ideas/concepts/ambient-lock-widget.md` (funded 2026-09-08, score 20/25)
**Type:** App (reader with widget)
**Markets:** US/global primary; IT secondary
**Distribution:** Google Play (TWA/Bubblewrap) | App Store (Capacitor) | Web PWA
**Monetization:** Freemium — basic widget free; stats/history unlock via one-time purchase (€4.99)

## One-line pitch
Ambient-reader is an offline-first reading app that shows silence/streak stats directly on the lock screen via a native widget — no unlock needed — and opens to the full reader with one tap.

## Target user
Knowledge workers who track focus time; students preparing for exams; anyone who wants to see reading progress before unlocking their phone. Privacy-first; no accounts; no server.

## Concept origin
Funded during Playbook 06 (Ideation) trend-scan. Top-scored concept (20/25) from 5 new zero-backend US/global concepts.

## Key trends driving this
- iOS 17+ / Android 14 expanded widget APIs (2024–25)
- Play Store now accepts TWA natively (Bubblewrap / Capacitor 7+)
- On-device AI (Apple Intelligence / Gemini Nano) makes local summarization possible without cloud
- Privacy policy pressure: "collect nothing" is now a marketable App Store feature

## Known constraints
- Zero backend: all stats from localStorage / IndexedDB / `audio.js` RMS data
- Widget must use manifest `activity.navigation` + service worker `message` handler
- Microphone permission requires pre-permission UX screen (existing SHHH pattern)
- TWA packaging: Bubblewrap (Play) + Capacitor (App Store) — both supported by studio
- No new permissions beyond microphone (already declared)

## Playbook sequence
1. `graphs/07-innovation-sprint.json` — Deep-dive proto-PRD (canceled due to subagent failure; brief written manually)
2. `graphs/01-discovery.json` — Go/No-Go memo (next step: this playbook)
3. `graphs/02-build.json` — Widget interaction implementation (sw.js + manifest)
4. `graphs/03-release.json` — Store gate
5. `graphs/04-aso-audit.json` — ASO audit
5. `graphs/05-localize-it.json` — IT localization

## Open questions for Discovery
- TWA + widget acceptance criteria: Apple App Store / Google Play (live docs needed)
- Widget icon format: `default_icon` vs manifest `icons` array — spec clarification needed
- On-device AI benchmark: CoreML Lite / WebGPU summary latency (Apple developer notes needed)
- Competitor gap: is there an existing "offline-first privacy widget PWA"? (live search needed)

## Contacts
- **Product owner:** Faro Studio Director (human)
- **Concept brief:** `products/ideas/concepts/ambient-lock-widget.md`
- **Trend-scan evidence:** `products/ideas/README.md`; `/tmp/pi-multiagent-run-t0qpbs/trend-scan-final.md`
