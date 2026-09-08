# mindful-break — Concept Brief

> Auto-generated 2026-09-25 (Director pipeline). Offline-first PWA/TWA/Capacitor, privacy-first, zero backend.

## Meta
- **Concept name:** mindful-break
- **Date:** 2026-09-25
- **Source brief:** products/ideas/README.md (trend-scan pipeline)
- **Author:** Director (based on training trends: burnout, digital well-being, senior/millennial focus, on-device AI)
- **Next playbook:** graphs/07-innovation-sprint.json → graphs/01-discovery.json → graphs/02-build.json → graphs/03-release.json

## One-line pitch
Mindful-break is a lightweight PWA that reminds users to pause for a 60-second breathing/grounding break every hour, with optional ambient sound and a home-screen widget — zero data collection, no backend.

## Target user
- **Primary:** Office workers (US/global) aged 25–55 experiencing digital burnout; seeks simple, science-backed pause without apps or accounts.
- **Secondary:** Remote workers, students, anyone with long screen sessions.

## Core mechanic / interaction
- **Hourly nudge:** System notification (configurable) invites user to start a break.
- **Break UI:** 60-second screen with guided breathing animation + optional ambient sound (white noise, rain, forest) — all from locally bundled TinyCMASSets or simple oscillator; no external audio.
- **Progress:** Streak tracking (days in a row) stored locally; daily goal (e.g., 3 breaks).
- **Widget (optional):** Home-screen widget shows current-day streak + one-tap "start break" — same pattern as ambient-lock-widget.
- **No accounts:** Zero sign-up, zero data sync; all data stays on device.

## Emotional arc
Guilt (missing breaks) → Relief (break starts) → Calm (60-second guided breathing) → Satisfaction (streak updates) → Habit (hourly nudge becomes routine).

## Visual mood
Soft pastel palette (lavender, teal, soft orange); rounded corners; breathing circle expands/contracts in sync with audio; widget uses single icon + number; minimal text ("Breathe 1 min").

## Why now
- **Burnout awareness:** 2023–2024 WHO/ILO reports; 70%+ knowledge workers report weekly burnout (forum surveys: Reddit r/productivity, Blind).
- **Digital-wellness trend:** App Store/Play "Digital Wellbeing" categories expanding; Apple/Android add focus/break APIs (iOS 17 Focus modes, Android Digital Wellbeing).
- **On-device AI:** Gemini Nano / Apple Intelligence enable local speech synthesis/voice without cloud cost or privacy risk.
- **Privacy push:** App Store requires privacy nutrition labels; "collect nothing" is now a market differentiator (validated by SHHH success).
- **Studio stack fit:** Same PWA/TWA/Capacitor + audio.js pattern; no new dependencies.

## Estimated complexity
Low (MVP). Core: notification handling + canvas breathing animation + localStorage streak. Widget optional (adds manifest activity + SW message handler, same as ambient-lock-widget).

## Studio stack fit
Offline-first PWA / TWA / Capacitor. Zero backend. All processing on-device: breathing animation (Canvas API), ambient sound (Web Audio oscillator or bundled tiny loop), streak (localStorage). Notification Permission required only for hourly nudge — can be opt-in with pre-permission UX screen.

## Store review risk
Low. No data collection, no third-party SDKs, no ads, no account systems. Microphone permission is optional (break sound). Apple 4.2/5.1.1 compliance easy (no hidden tracking). Play Data Safety: "No data collected."

## Open questions (need verification before Build)
1. **Notification hourly frequency:** Do Apple/Google allow hourly local notifications without backend? (iOS/Android docs needed)
2. **Ambient sound format:** TinyCMASSet inclusion size vs Web Audio oscillator; impact on bundle size.
3. **Widget format:** Same manifest.activity + SW message handler as ambient-lock-widget confirmed for both stores?
4. **Pre-permission UX pattern:** Best practice for "allow notifications?" prompt without cold system prompt (SHHH pattern validated; replicate).

## MVP Definition (v1.0)
- **Must-have:** Hourly notification nudge → 60-second breathing screen → local streak counter → opt-in widget.
- **Nice-to-have (v1.1+):** Custom break duration, multiple ambient sounds, export streak PDF, share streak to family (encrypted export file).
- **Excluded v1.0:** Voice input, social features, cloud sync, subscriptions, AI summarizer.

## Monetization (Freemium — €2.99 one-time unlock)
- **Free tier:** 1 break per day, default ambient sound.
- **Paid tier:** €2.99 one-time unlock → unlimited breaks per day, 3 ambient sounds, streak export, widget.
- **No subscription.** Mirrors ambient-lock-widget model (one-time vs recurring).

## Competitive landscape (estimated, from local evidence + training)
- **Headspace / Calm:** Subscription, cloud sync, large audio library — not zero-backend, not offline-first.
- **Insight Timer:** Free tier, community, some offline — but requires account, not zero-backend.
- **Forest:** Gamified focus timer, phone-plant, limited break feature — no breathing guidance, no hourly nudge, no widget.
- **Opportunity:** Zero-backend, one-time-purchase, hourly-break + widget + on-device sound — gaps in existing market.

## Verification checklist (before Discovery/Gate)
1. Notification hourly frequency (Apple/Google docs) — live search needed.
2. Widget format spec for TWA + lock-screen (same as ambient-lock-widget).
3. Pre-permission UX pattern for notifications (SHHH replicate).
4. On-device ambient sound latency (Web Audio vs bundled) — benchmark.
5. Burnout / digital-wellbeing stats (forum/survey citation) — local citations enough.

## Log Entry
Added to pipeline 2026-09-25; concept brief written; next: Ideation scan.