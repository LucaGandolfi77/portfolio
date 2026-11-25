# ambient-lock-widget — Concept Brief

> Funded by Director 2026-09-08 (trend-scan #1, score 20/25). Zero-backend US/global.

## Meta
- **Concept name:** ambient-lock-widget
- **Date:** 2026-09-08
- **Source brief:** products/ideas/README.md (trend-scan pipeline)
- **Author agent:** trend-hunter / creativo / Director
- **Next playbook:** graphs/07-innovation-sprint.json (deep-dive) → graphs/01-discovery.json (full Discovery)

## One-line pitch
Lock-screen widget + TWA that surfaces ambient silence stats without opening the app.

## Target user fantasy
A student or knowledge worker who wants to see at a glance whether their reading environment is silent — without unlocking the phone or opening an app.

## Core mechanic / interaction
- Widget declares `activity.navigation.href` pointing to `/app/`.
- Service worker (`sw.js`) handles widget click via `message` event → opens `/app/`.
- Daily data (silence seconds, streak, noise level) is computed on-device from localStorage / IndexedDB; no server.
- User taps widget → app opens to stats tab.

## Emotional arc
Discovery (widget appears on lock screen) → quick satisfaction (glance confirms focus) → mastery (streak tracking, daily goal) → pride (silent reading habit visible without effort).

## Visual mood
Monochrome with warm amber glow on dark background; icon uses SHHH's existing icon-192 maskable. Widget uses minimal text + single number (e.g., "4m silent").

## Why now
- iOS 17+ / Android 14 expanded widget APIs in 2024–25.
- Play Store accepts TWA natively (Bubblewrap / Capacitor 7+).
- Studio already ships SHHH with widget awareness (`app.js` `_initWidget`) — extension, not restart.

## Estimated complexity
Low (MVP). Widget definition in manifest + SW message handler + on-device stats aggregation from existing `audio.js` data.

## Studio stack fit
Offline-first PWA / TWA / Capacitor. Zero backend. All stats from existing `localStorage` / `IndexedDB` / `audio.js` RMS data.

## Store review risk
Low. No new permissions (microphone already declared in SHHH). Widget uses manifest only; no data collection change.

## Open questions
- Does Apple allow TWA apps with widgets in App Store? (Verification needed: Apple TWA + widget docs)
- Exact widget `activity.navigation` + icon format for Play / iOS? (Live source verification needed)
- Should the widget pull from `audio.js` live RMS or cached daily stats? MVP = cached.
