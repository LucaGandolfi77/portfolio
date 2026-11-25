# WikiThriving — The Field Guide to Your Life

**Slug:** `wikithriving`
**Source:** `/workspaces/portfolio/games/wikithriving/`
**Type:** Game (learning/trivia PWA)
**Markets:** US/global primary; IT secondary
**Distribution:** Web PWA | App Store (Capacitor) | Google Play (TWA)
**Monetization:** Free

## One-line pitch
The Duolingo of life. A personalized life guide that teaches you everything you need to thrive at every age through 18 realms, 506 lessons, 18 games, and 62 badges.

## Target user
Users of all ages who want to learn practical life skills — from times tables to salary negotiation. Customizable by age, gender, nationality. Parents for children, adults for self-improvement.

## Current state
**Shippable.** Full product with: 506 lessons, 18 games, 62 badges, 17 life realms, age/gender/nationality customization, offline-first PWA, i18n system, Plausible analytics, dark mode, SW v4. Capacitor wrapper configured for App Store. 18 Realms across 10 core + 8 elective topics. Content ranges from age 5 (Magic Words, times tables) to adult (salary negotiation, compound interest, stoic philosophy).

## Known constraints
- Content is extensive: 506 lessons across 18 realms — any change risks regressions
- Age-based content gating requires careful curriculum design
- Plausible analytics (privacy-first) already integrated
- Capacitor wrapper exists but Play Store TWA via Bubblewrap may need separate config
- Content quality is paramount — educational material must be accurate

## Playbook sequence
1. `graphs/01-discovery.json` — Already completed for Play Store launch.
2. `graphs/02-build.json` — Ready for new lesson/realm content authorization.
3. `graphs/03-release.json` — Ready for release gate.
4. `graphs/04-aso-audit.json` — Ready for ASO optimization (education niche).
5. `graphs/05-localize-it.json` — IT localization of EN source strings.

## Open questions for Discovery
- App Store vs Google Play priority: which market first?
- Age-gating UX: how to handle the 5→adult curriculum transition smoothly?
- Content expansion: who writes new lessons? Studio team or community?
- Monetization: currently free — when does paid make sense without betraying the educational mission?

## Contacts
- **Product owner:** Faro Studio Director (human)
- **Source repo:** `/workspaces/portfolio/games/wikithriving/`
- **Existing assets:** `README.md`, `site/`, `capacitor.config.json`, `package.json`
