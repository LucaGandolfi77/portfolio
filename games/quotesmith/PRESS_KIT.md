# QuoteSmith — Press Kit

---

## Game Info

| Field | Value |
|---|---|
| Title | QuoteSmith |
| Subtitle | Who Said It? |
| Developer | Luca Gandolfi |
| Platform | Web (PWA), iOS, Android |
| Genre | Trivia / Quiz |
| Price | Free |
| Languages | English, Italian |
| Version | 1.0 |
| Quotes | 1,284 in 32 categories |
| Connectivity | Fully offline |
| Data Collection | None |

---

## One-Line Pitch

A bilingual offline quote quiz where you guess who said 1,284 famous quotes across 32 categories.

---

## Short Description (150 chars)

Offline quote quiz with 1,284 real quotes in 32 categories. Play in English or Italian. Guess the author from 4 options. Works completely offline.

---

## Long Description

QuoteSmith is an offline quote quiz that challenges players to identify who said famous quotes from movies, books, history, science, philosophy, and more.

Each round presents 10 quotes. For each quote, the player selects the correct author from 4 options — one correct, three smart distractors drawn from the same category and language. The game is fully bilingual (English and Italian), supports 3 difficulty levels, and lets you mix any combination of 32 categories in a single round.

QuoteSmith is a Progressive Web App that works completely offline — no internet, no accounts, no data collection. Install it on your home screen and play anytime. Features include text-to-speech for listening to quotes aloud, haptic feedback on answers, confetti celebrations for high scores, and personal best tracking.

Built with zero dependencies and zero build tools. Just open and play.

---

## Key Features

| Feature | Description |
|---|---|
| Bilingual | Full English and Italian support. Every quote is available in both languages. |
| Offline | Works without internet. No API calls, no cloud sync, no accounts required. |
| 1,284 Quotes | Real quotes from history, literature, film, science, philosophy, and more. |
| 32 Categories | Film, TV Series, Literature, Science, Philosophy, Humor, Cats, Coffee, and 24 more. |
| 3 Difficulty Levels | Easy (iconic), Medium (deeper), Hard (connoisseur). |
| Multi-Category Play | Combine any number of categories in a single round. |
| Text-to-Speech | Listen to quotes read aloud using device voice synthesis. |
| Haptic Feedback | Feel vibrations on correct and incorrect answers. |
| Confetti | Celebrate scores of 8/10 or higher with a colorful animation. |
| Smart Distractors | Wrong options are drawn from the same category and language. |
| PWA | Install as a native-like app on any device. Updates are instant. |
| Personal Best | Track your best score and best streak across sessions. |
| Dark Theme | Comfortable dark UI, mobile-first, with large readable text. |
| Zero Dependencies | Pure HTML, CSS, and vanilla JavaScript. No frameworks, no build step. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, grid, flexbox) |
| Logic | Vanilla JavaScript (ES6+) |
| Data | JSON (`quotes.json`) |
| Offline | Service Worker (`sw.js`) |
| Install | Web App Manifest (`manifest.webmanifest`) |
| Accessibility | ARIA live regions, semantic HTML, keyboard navigation |
| Voice | Web Speech API (SpeechSynthesis) |
| Haptics | Vibration API |
| Persistence | localStorage |
| Mobile | Capacitor (iOS, Android) |

---

## Links

| Link | URL |
|---|---|
| Play Online | https://lucagandolfi77.github.io/portfolio/games/quotesmith/ |
| Source Code | https://github.com/LucaGandolfi77/portfolio/tree/main/games/quotesmith |
| Developer Portfolio | https://lucagandolfi77.github.io/portfolio/ |
| Privacy Policy | https://lucagandolfi77.github.io/portfolio/privacy-policy.html |
| Issues & Support | https://github.com/LucaGandolfi77/portfolio/issues |

---

## Contact

| Method | Detail |
|---|---|
| Developer | Luca Gandolfi |
| GitHub | https://github.com/LucaGandolfi77 |
| Email | Via GitHub Issues |
| Portfolio | https://lucagandolfi77.github.io/portfolio/ |

---

## Screenshot Specifications

### Required Sizes

| Device | Resolution | Aspect Ratio |
|---|---|---|
| iPhone 6.7" (iPhone 15 Pro Max) | 1290 × 2796 | 9:19.5 |
| iPhone 6.5" (iPhone 11 Pro Max) | 1242 × 2688 | 9:19.5 |
| iPhone 5.5" (iPhone 8 Plus) | 1242 × 2208 | 9:16 |
| iPad 12.9" (iPad Pro) | 2048 × 2732 | 3:4 |
| Android Phone | 1080 × 1920 | 9:16 |
| Android Tablet | 1200 × 1920 | 5:8 |
| Play Store Feature Graphic | 1024 × 500 | ~2:1 |

### Recommended Screenshots (min 3 per device)

1. **Setup screen** — showing language toggle, category grid with icons, difficulty selector
2. **Gameplay screen** — a quote displayed with 4 author options, streak counter visible
3. **Results screen** — score, confetti (if 8+), full round review with correct/incorrect marks

### Screenshot Tips
- Use the dark theme
- Show a mix of English and Italian screenshots
- Include variety across categories (film, science, philosophy)
- Ensure text is legible at thumbnail size
- No personal data visible

---

## Branding

### Icon

- **Source**: `icons/icon.svg` (vector, resolution-independent)
- **Style**: Minimalist quote mark design on dark background
- **Usage**: Scale to any size; export as PNG for store listings
- **Do**: Use as-is, maintain proportions, keep dark background
- **Do not**: Add effects, change colors, crop, or distort

### Color Palette

| Name | Hex | Usage |
|---|---|---|
| Background | `#1a1a2e` | Primary dark background |
| Surface | `#16213e` | Cards, panels |
| Primary | `#e9c46a` | Accents, highlights, correct answers |
| Secondary | `#2a9d8f` | Secondary actions, streaks |
| Accent | `#e76f51` | Incorrect answers, warnings |
| Text | `#f4f1de` | Primary text |
| Muted | `#6d9dc5` | Secondary text, borders |
| Success | `#2a9d8f` | Correct answer highlight |
| Error | `#e76f51` | Incorrect answer highlight |

### Typography

- **Headings**: System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
- **Body**: System font stack (same as headings)
- **Monospace**: For scores and counters (`'SF Mono', 'Fira Code', monospace`)
- **Size**: Large, readable text optimized for mobile screens
- **Weight**: Bold for quotes, semibold for labels, regular for body text

### Tone

- **Playful but intelligent** — the game is about knowledge and culture, not intimidation
- **Clean and minimal** — dark theme, no clutter, focus on the quotes
- **Welcoming** — works for casual players and trivia experts alike
