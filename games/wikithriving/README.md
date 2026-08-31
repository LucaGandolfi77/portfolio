# 📖 WikiThriving — The Field Guide to Your Life

The Duolingo of life · 17 Realms · 270+ Lessons · 195 Quotes · 32 Books · 25 Poems · 180+ Countries · Offline PWA

## How to Install

1. Open `site/index.html` in Safari on iPhone
2. Safari → Share → Add to Home Screen
3. Works offline after first load

## Concept

WikiThriving is a **personalized life guide** that teaches you everything you need to thrive at every age. Select your age, gender, and nationality → get a customized curriculum across 17 life realms.

Content unlocks as you grow: a 5-year-old sees "Magic Words" and times tables; a 25-year-old sees salary negotiation, compound interest, and stoic philosophy.

## 17 Realms

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

### Bonus Specializations (7)

| Realm | Icon | Topics |
|---|---|---|
| Art & Visual Culture | 🎨 | Cave paintings → Renaissance → Impressionism → modern art → street art → museum literacy |
| Sciences | 🔬 | Scientific method, atoms, evolution, climate, quantum, pseudoscience, longevity |
| Psychology | 🧩 | Cognitive biases, attachment, impostor syndrome, habits, therapy, burnout, grief |
| Music | 🎵 | Rhythm, orchestra, genres, theory, deep listening, music & memory, music therapy |
| Film & Storytelling | 🎬 | Hero's journey, camera angles, soundtracks, film history, visual literacy, documentary |
| Design & Visual Arts | 🖌️ | Color wheel, typography, rule of thirds, logos, photography, design thinking |
| Literature & Poetry | 📚 | Fairy tales, how to read a poem, Shakespeare, dystopias, slow reading, commonplace book |

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

## The Reading Room

### 📖 Books (32)
Curated with heartfelt essays — not reviews, but personal reflections. Each book entry includes: title, author, stage, themes, a signature quote, and a warm "why this book matters" essay in first person.

From *The Velveteen Rabbit* (Sprout) to *When Breath Becomes Air* (Elder). Featuring: Alice in Wonderland, Charlotte's Web, The Little Prince, Man's Search for Meaning, Meditations, Pride and Prejudice, Crime and Punishment, The Odyssey, Don Quixote, Tao Te Ching, and more.

### 🖋️ Poetry (25)
Public domain poems with full text and heartfelt interpretation. Read aloud feature, "A line to carry with you," and "Why this poem matters" essays.

Featuring: Shakespeare's Sonnet 18, Dickinson, Frost, Blake, Poe, Rumi, Whitman, Keats, Browning, Dylan Thomas, Henley (Invictus), Langston Hughes, Dante, Leopardi, and more.

## Features

- **270+ lesson cards** with actionable content, quotes, and "Try This" action items
- **195 curated quotes** organized by theme (character, learning, math, money, health, comm, work, world, purpose, art, science, psychology, music, film, literature)
- **180+ countries** with flags, currency, driving/voting ages, emergency numbers
- **Math Hub**: Times Table Trainer, Fraction Quiz, Percentage Quiz, Tip Calculator, Compound Interest, Mortgage Calculator, Unit Converter
- **Gamification**: XP, 6 ranks, 29 badges, streaks, 65+ daily quests
- **Your Journey**: visual timeline from age 4 to 100
- **Wisdom Library**: browse quotes by theme
- **Reading Room**: 32 books + 25 poems with heartfelt essays
- **Poem Reader**: meditative typography, "read aloud" prompts, interpretation
- **Profile**: export progress JSON, switch life stages
- **100% offline** — no internet required

## Tech Stack

- Vanilla HTML + CSS + JavaScript (no build step)
- Google Fonts (Playfair Display + Source Sans 3)
- LocalStorage for persistence
- Service Worker for offline

## Structure

```
wikithriving/
├── site/                    # PWA root (committato)
│   ├── index.html           # Main app
│   ├── icons/               # PWA icons
│   ├── js/
│   │   ├── data/            # realms, lessons, quotes, countries, quests, books, poems
│   │   ├── engine/          # profile, unlock, progress, daily
│   │   ├── tools/           # calculators, math trainers
│   │   ├── ui/              # home, realm, lesson, wisdom, math, journey, profile, onboarding, reading, poem
│   │   └── main.js          # entry point
│   ├── sw.js
│   └── manifest.webmanifest
└── README.md
```
