# WikiThriving — The Field Guide to Your Life

The Duolingo of life · 18 Realms · 326 Lessons · 145 Quiz Questions · 195 Quotes · 32 Books · 25 Poems · 180+ Countries · Offline PWA

## How to Install

1. Open `site/index.html` in Safari on iPhone
2. Safari → Share → Add to Home Screen
3. Works offline after first load

## Concept

WikiThriving is a **personalized life guide** that teaches you everything you need to thrive at every age. Select your age, gender, and nationality → get a customized curriculum across 17 life realms.

Content unlocks as you grow: a 5-year-old sees "Magic Words" and times tables; a 25-year-old sees salary negotiation, compound interest, and stoic philosophy.

## 18 Realms

### Core (10)

| Realm | Icon | Topics |
|---|---|---|
| Character & Behavior | 🤝 | Integrity, kindness, discipline, emotional intelligence |
| Learning & Mind | 🧠 | Study skills, memory, deep work, meta-learning |
| Mathematics | 🔢 | Times tables → fractions → percentages → compound interest → mortgage math |
| Money & Finance | 💰 | Wants vs needs, saving, budgeting, investing, retirement |
| Health & Body | ❤️ | Sleep, nutrition, exercise, mental health, preventive care |
| People & Communication | 🗣️ | Listening, body language, networking, negotiation, emails |
| Work & Craft | 💼 | Chores, resume, interviews, salary, leadership |
| World & Citizenship | 🌍 | News literacy, voting, misinformation, environment |
| Practical Life | 🏠 | Cooking, cleaning, laundry, first aid, taxes, car maintenance |
| Purpose & Wisdom | 🎯 | Values, journaling, ikigai, stoicism, legacy |

### Bonus Specializations (8)

| Realm | Icon | Topics |
|---|---|---|
| Art & Visual Culture | 🎨 | Cave paintings → Renaissance → Impressionism → modern art → street art → museum literacy |
| Sciences | 🔬 | Scientific method, atoms, evolution, climate, quantum, pseudoscience, longevity |
| Psychology | 🧩 | Cognitive biases, attachment, impostor syndrome, habits, therapy, burnout, grief |
| Music | 🎵 | Rhythm, orchestra, genres, theory, deep listening, music & memory, music therapy |
| Film & Storytelling | 🎬 | Hero's journey, camera angles, soundtracks, film history, visual literacy, documentary |
| Design & Visual Arts | 🖌️ | Color wheel, typography, rule of thirds, logos, photography, design thinking |
| Literature & Poetry | 📚 | Fairy tales, how to read a poem, Shakespeare, dystopias, slow reading, commonplace book |
| Travel & Experiences Abroad | ✈️ | Why travel matters, culture shock, slow travel, study abroad, cross-cultural empathy, travel as wisdom |

## 7 Life Stages (age-gated content)

| Stage | Age | Emoji |
|---|---|---|
| Sprout | 4–8 | 🌱 |
| Explorer | 9–12 | 🔭 |
| Teen | 13–17 | 🦋 |
| Young Adult | 18–25 | 🚀 |
| Adult | 26–45 | 🧭 |
| Sage | 46–64 | 🌲 |
| Elder | 65+ | 🕊️ |

## Features

### Learning Engine
- **326 lesson cards** with actionable content, quotes, and "Try This" action items — including relationship science, self-compassion, mindfulness, gratitude, financial literacy, travel wisdom, and modern safety
- **145 quiz questions** — hand-authored MCQs + auto-generated cloze fill-in-the-blank for every lesson
- **Review Garden** — spaced repetition system; completed lessons grow as plants, review them to keep them healthy

### Content Library
- **195 curated quotes** organized by theme
- **35 Big Questions** — daily philosophical prompts seeded by day
- **180+ countries** with flags, currency, driving/voting ages, emergency numbers
- **32 books + 25 poems** with heartfelt essays and interpretations

### Interactive Tools
- **Math Hub**: Times Table Trainer, Fraction Quiz, Percentage Quiz, Tip Calculator, Compound Interest, Mortgage Calculator, Unit Converter
- **5 Playground Mini-Games**: Budget Sandbox, Conversation Dojo, Bias Buster, News Detective, Emotion Reader

### Gamification
- **XP, levels, 6 ranks** (Newcomer → Luminary)
- **44 badges** including quiz, garden, league, journal, capsule, game, gratitude, habit, travel, and kindness achievements
- **Pearls currency** — earn from quizzes, quests, reviews, league; spend in the Shop
- **Hearts system** — wrong quiz answers cost hearts; refill over time or buy in shop
- **Streak Freeze** — protect your streak for one missed day
- **Weekly Ghost League** — rank among 30 seeded rivals without a server
- **Habit Tracker** — daily habit streaks with weekly view, 5 custom slots per stage

### Reflection
- **Journal** — answer the daily Big Question and keep a personal diary
- **Time Capsule** — write letters to your future self that unlock at the next life stage
- **Wisdom Cards Album** — collectible cards from every lesson completed
- **Gratitude Check-in** — "Three Good Things" daily practice (+5 XP)
- **Kindness Quests** — weekly volunteer/courtesy challenges (+15 XP +3 🦪)

### Social & Sharing
- **Wisdom Passport** — shareable card via Web Share API

## The Reading Room

### 📖 Books (32)
Curated with heartfelt essays — not reviews, but personal reflections. Each book entry includes: title, author, stage, themes, a signature quote, and a warm "why this book matters" essay in first person.

From *The Velveteen Rabbit* (Sprout) to *When Breath Becomes Air* (Elder). Featuring: Alice in Wonderland, Charlotte's Web, The Little Prince, Man's Search for Meaning, Meditations, Pride and Prejudice, Crime and Punishment, The Odyssey, Don Quixote, Tao Te Ching, and more.

### 🖋️ Poetry (25)
Public domain poems with full text and heartfelt interpretation. Read aloud feature, "A line to carry with you," and "Why this poem matters" essays.

Featuring: Shakespeare's Sonnet 18, Dickinson, Frost, Blake, Poe, Rumi, Whitman, Keats, Browning, Dylan Thomas, Henley (Invictus), Langston Hughes, Dante, Leopardi, and more.

## Tech Stack

- Vanilla HTML + CSS + JavaScript (no build step)
- Google Fonts (Playfair Display + Source Sans 3)
- LocalStorage for persistence
- Service Worker for offline
- Node.js smoke tests for engine validation

## Structure

```
wikithriving/
├── site/                    # PWA root (committato)
│   ├── index.html           # Main app
│   ├── icons/               # PWA icons
│   ├── js/
│   │   ├── data/            # realms, lessons, quotes, countries, quests, books, poems, quizq, bigquestions, gamesdata
│   │   ├── engine/          # profile, unlock, progress, daily, quiz, economy, review, league, cards
│   │   ├── tools/           # calculators, math trainers
│   │   ├── ui/              # home, realm, lesson, wisdom, math, journey, profile, onboarding, reading, poem, shop, garden, league, journal, capsule, album, games, habits
│   │   └── main.js          # entry point + state migration
│   ├── sw.js                # Service Worker (v2)
│   └── manifest.webmanifest
├── README.md
└── TODO.md
```

## Testing

```bash
node /tmp/smoke-final.js    # Validates all engines + data files + quiz generation
```
