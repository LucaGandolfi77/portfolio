# silent-canvas — Offline-first silent-creation studio

> Concept funded 2026-09-25 (Studio Director authorization). Zero-backend PWA/TWA/Capacitor, privacy-first, no accounts, no server.

## Meta
- **Concept name:** silent-canvas
- **Date:** 2026-09-25
- **Source brief:** products/ideas/README.md (trend-scan pipeline, Studio Director direction)
- **Author:** Studio Director (with AI evidence synthesis from local pipeline evidence)
- **Next playbook:** graphs/07-innovation-sprint.json → graphs/01-discovery.json → graphs/02-build.json

## One-line pitch
A noise-gated, offline-first creation studio for artists — only draw, paint, or edit when ambient noise is below your threshold; silence unlocks the canvas.

## Target user fantasy
Visual artists, designers, illustrators, and digital creators who need deep-focus, interruption-free creation time but live in noisy environments (shared spaces, open-plan offices, coffee shops). They want the studio to stay silent — not just the room — but if noise hits, the canvas fades or locks, enforcing recovery time.

## Core mechanic / interaction
- **Noise-gate**: Real-time RMS→dB monitoring via device microphone (same `audio.js` engine as SHHH / ambient-lock-widget). Two modes: Lock (canvas frozen when noise > threshold) / Fade (blur/shade overlay when noisy).
- **Silent canvas**: Full-featured drawing/painting canvas (offline-first, Canvas API + localStorage for drafts). Only activates when silence is sustained for 30s.
- **Streak tracking**: Daily "quiet creation" minutes; streak counter (localStorage only).
- **Widget (optional)**: Lock screen widget showing today's quiet minutes + one-tap "Enter studio".
- **No accounts, no backend, no analytics**: All drafts, settings, and streaks stay on-device.

## Emotional arc
Discovery (canvas only opens when silence is found) → Relief (noise stops, canvas unlocks) → Flow (deep creation without interruption) → Mastery (streak builds, habit forms) → Pride (quiet studio is a habit, not a tool).

## Visual mood
Dark studio theme (#0a0a0a background) with warm amber glow (#d4a843) when silent; cool blue (#2a3f6a) when noisy/locked. Brush stroke textures via Canvas 2D. Minimal toolbar; primary action is always "draw" when unlocked. Widget uses dark theme with amber dot.

## Why now
- **Studio DNA**: SHHH noise-gate + Pixel Stretch image editor = natural fusion. Both use the same zero-backend stack.
- **Platform trends**: iOS 17+/Android 14 widget APIs, TWA/Capacitor adoption, Apple Privacy labels pushing "no collection" as feature.
- **Cultural moment**: Remote creative work grew post-2020; artists seek focus tools; privacy-first creation is a gap (most art apps have cloud sync / accounts).
- **On-device AI**: Apple Intelligence / Gemini Nano can eventually provide local style suggestions / auto-correct without server — future v1.1 stretch.

## Estimated complexity
Medium (MVP: noise-gate + canvas + streak; widget optional). Core difficulty: Canvas 2D drawing surface (existing web tech) + noise-monitoring integration (same `audio.js`). No new dependencies required for v1.0.

## Studio stack fit
Offline-first PWA / TWA (Bubblewrap) / Capacitor (App Store). Zero backend. All drafts in IndexedDB / localStorage. Microphone permission for noise-gate (same SHHH pattern — pre-permission UX screen required). Canvas data stays local; export via file download (no upload).

## Store review risk
Medium: Apple 4.2 (minimum functionality) — must demonstrate clear drawing/editing functionality beyond "just a noise monitor"; Play Data Safety — microphone only, no data collection. Mitigate by showing active drawing surface, brush tools, layer controls, and export.

## Open questions (need verification before build)
1. **Canvas 2D performance** — Large drafts (high-res PNG) may exceed IndexedDB limits; need chunked storage or file-system API (newer browsers only).
2. **Widget interaction** — Same TWA widget pattern as ambient-lock-widget; needs both platforms tested.
3. **Notification policy** — Hourly "enter studio" reminder optional; must verify with Apple/Google docs.
4. **AI / style assist** — Not in v1.0; requires CoreML/WebGPU benchmark before v1.1.
5. **Competitor gap verification** — Live search for "offline-first drawing studio noise-gate PWA" needed.

## MVP Definition (v1.0)
- **Must-have**: Noise-gate canvas (threshold/block + fade/blur modes); 60-second breathing-style session timer; streak tracking; export to PNG (local download); basic brush + erase + color picker.
- **Nice-to-have (v1.1)**: Widget (home-screen access); ambient sound during creation; auto-save draft to IndexedDB; layer support (2 layers max v1.0).
- **Excluded v1.0**: AI assist, social sharing (requires server or account), subscription model, cloud sync, video export, multi-user collaboration.

## Monetization (Freemium — €3.99 one-time unlock)
- **Free tier**: Basic noise-gate + 3 brush colors + 1 layer + 5 drafts saved.
- **Paid tier**: €3.99 unlock → unlimited colors, 5 layers, unlimited drafts, export to PNG/PDF, widget, streak export.
- **No subscription, no ads** — aligns with SHHH/ambient-lock-widget/privacy-first identity.

## Competition / Gap (estimated from training + local evidence)
- **Procreate / Adobe Fresco / Canva** — Cloud, subscription, account-required; not zero-backend; no noise-gate.
- **Autodesk / Blender Lite** — Heavy, desktop-first; not PWA.
- **Forest / Headspace / Calm** — Focus/wellness, but no creative canvas; not for artists.
- **Gap**: Zero-backend artistic studio with noise-awareness + widget. Defensible.

## Verification checklist (before Discovery / Build authorization)
1. Apple / Google widget spec for TWA + Capacitor (reuse ambient-lock-widget proof)
2. Canvas 2D + IndexedDB performance on mobile devices
3. Microphone permission pre-permission UX validated (SHHH pattern)
4. Live competitor search for "offline drawing studio noise gate PWA"
5. Storage limit: IndexedDB quota on iOS Safari / Android Chrome
6. Notification policy for optional hourly reminders (if included)

## Studio stack fit
Same as ambient-lock-widget / mindful-break / SHHH: offline-first PWA → TWA (Play) + Capacitor (iOS). Zero backend by default. Privacy-first as brand identity.
