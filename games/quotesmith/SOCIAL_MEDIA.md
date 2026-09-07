# QuoteSmith — Social Media Content

---

## Twitter/X

### Launch Tweet

**EN:**
> Introducing QuoteSmith — an offline quote guessing game.
>
> 1000+ real quotes. 32 categories. 2 languages. Zero internet required.
>
> Movies, books, philosophy, memes — can you name who said it?
>
> Install it on your phone: [link]
>
> #quotequiz #trivia #indiegame #pwa #offline

**IT:**
> Presento QuoteSmith — il quiz di citazioni che funziona offline.
>
> Oltre 1000 citazioni reali. 32 categorie. 2 lingue. Zero internet.
>
> Film, libri, filosofia, meme — sai dire chi l'ha detto?
>
> Installalo sul telefono: [link]
>
> #quotequiz #trivia #indiegame #pwa #offline #bilingual

---

### 5-Tweet Thread — EN (Building QuoteSmith)

**1/**
> I built QuoteSmith because I wanted a quote quiz that works offline, has no accounts, no ads, and no tracking.
>
> Here's how it came together. 🧵

**2/**
> The data: 1000+ real quotes in a single JSON file. Movies, books, philosophy, science, memes — 32 categories.
>
> Each quote has text, author, category, language, and difficulty. JSON keeps data separate from logic. Editable by anyone.

**3/**
> The engine: 10 quotes per round, 4 author choices (1 correct + 3 smart distractors).
>
> Distractors come from the same category first, then same language. Difficulty controls how obscure the quotes get.

**4/**
> The UX: dark theme, mobile-first, zero dependencies. Install it as a PWA and it works entirely offline.
>
> Speech synthesis reads quotes aloud. Confetti at 8/10+. Haptic feedback on answers. Every detail matters.

**5/**
> Try it: [link]
>
> Built with vanilla HTML/CSS/JS. No frameworks. No build step. Just the web.
>
> #quotequiz #trivia #indiegame #pwa #offline #bilingual #education #knowledge

---

### 5-Tweet Thread — IT (Costruire QuoteSmith)

**1/**
> Ho costruito QuoteSmith perché volevo un quiz di citazioni che funzionasse offline, senza account, senza ads, senza tracking.

> Ecco come è nato. 🧵

**2/**
> I dati: oltre 1000 citazioni reali in un unico file JSON. Film, libri, filosofia, scienza, meme — 32 categorie.

> Ogni citazione ha testo, autore, categoria, lingua e difficoltà. JSON tiene i dati separati dalla logica.

**3/**
> Il motore: 10 citazioni per round, 4 scelte tra autori (1 giusta + 3 distrattori intelligenti).

> I distrattori vengono dalla stessa categoria prima, poi dalla stessa lingua. La difficoltà controlla quanto sono oscure le citazioni.

**4/**
> L'UX: tema scuro, mobile-first, zero dipendenze. Installala come PWA e funziona interamente offline.

> La sintesi vocale legge le citazioni ad alta voce. Confetti da 8/10+. Feedback tattile. Ogni dettaglio conta.

**5/**
> Provala: [link]

> Costruita con HTML/CSS/JS vanilla. Nessun framework. Nessuna build. Solo il web.

> #quotequiz #trivia #indiegame #pwa #offline #bilingual #education #knowledge

---

## Instagram

### Post 1 — Announcement

> Introducing QuoteSmith — the offline quote guessing game.
>
> 1000+ real quotes. 32 categories. Movies, books, philosophy, science, memes, and more. Two languages: English and Italian.
>
> No internet needed. No accounts. Just you and the quotes you know.
>
> Install it on your phone as a PWA — link in bio.
>
> #quotequiz #trivia #indiegame #pwa #offline #bilingual #education #knowledge #quotegame #mobilegame #wordgame #quiztime #learnenglish #learnitalian #culture #literature #philosophy #movies #music #science

### Post 2 — Gameplay Screenshot

> 10 quotes. 4 names. One score to beat.
>
> Can you name who said it?
>
> Every round mixes categories you choose. Smart distractors keep you on your toes. Confetti at 8/10+.
>
> Play offline. Install QuoteSmith — link in bio.
>
> #quotequiz #trivia #indiegame #pwa #offline #bilingual #education #knowledge #mobilegame #wordgame #quiztime #brainchallenge #testyourknowledge

### Post 3 — Stats / Achievement

> Over 1000 quotes curated across 32 categories.
>
> From Shakespeare to Socrates. From memes to motivational speeches. From science to songs.
>
> Every quote tested. Every answer validated. Every round fair.
>
> QuoteSmith — who said it?
>
> #quotequiz #trivia #indiegame #pwa #offline #bilingual #education #knowledge #achievementunlocked #highscore #quotalovers #bookquotes #moviequotes #philosophyquotes

---

## Reddit

### r/indiegaming — Launch Post

**Title:** I made QuoteSmith — an offline quote guessing game with 1000+ real quotes in 32 categories

**Body:**
Hey everyone,

I've been working on QuoteSmith, a PWA that lets you guess who said famous quotes entirely offline.

**What it is:**
- 10 quotes per round, 4 author choices
- 32 categories: movies, books, philosophy, science, memes, songs, history, video games, and more
- 2 languages (English + Italian), bilingual quotes
- 3 difficulty levels
- Smart distractors from the same category/language
- Confetti at 8/10+, haptic feedback, speech synthesis

**Tech:**
- Vanilla HTML/CSS/JS, zero dependencies, zero build step
- PWA with full offline support (service worker + cached JSON)
- Mobile-first, installable on any phone
- Single JSON file for all data — easy to contribute new quotes

**Why:**
I wanted a quote quiz that works on the subway, on a plane, without accounts, without ads, without tracking. Just open and play.

Try it here: [link]

Happy to answer any questions about the dev process!

---

### r/gamedev — Technical Postmortem

**Title:** Building QuoteSmith: a technical postmortem on a zero-dependency PWA quote quiz

**Body:**
I built QuoteSmith, an offline quote guessing game, and wanted to share some technical decisions.

**Data architecture:**
All 1000+ quotes live in a single `quotes.json`. Separation of data from logic means adding quotes never touches the engine. A merge script handles deduplication by text+language.

**The distractor algorithm:**
Wrong answers aren't random — they come from the same category first, then same language. This makes wrong choices feel plausible, which is the whole point of a quote quiz.

**Offline-first:**
Service worker caches all assets including the JSON. But I also embedded a 64-quote seed (one per category, both languages) so the game works even as a `file://` without a service worker. Resilient by design.

**Zero dependencies:**
No React, no Tailwind, no build step. Just browser APIs: Fetch, Cache, SpeechSynthesis, localStorage, Vibration. The result is a 30KB app that installs instantly.

**Lessons:**
- JSON as a database works fine for small, static datasets
- Smart distractors matter more than quote quantity
- PWA install UX is still confusing for many users
- Offline-first means thinking about every failure mode

Happy to discuss any of these in detail.

---

## YouTube

### 30-Second Trailer Script

**[0:00–0:03]** Black screen. Gold text fades in: "QUOTE" then "SMITH" appears below it.

**[0:03–0:06]** Quick cuts of phone screens: setup with 32 category icons, language toggle between EN/IT.

**[0:06–0:12]** Gameplay montage: quote appears in serif font, four answer buttons tap in sequence, correct answer highlights teal, streak counter increments.

**[0:12–0:16]** Results screen: score "8/10" with confetti particles falling, rating text "Great round. One more?"

**[0:16–0:20]** Feature callouts overlay:
- "1000+ real quotes"
- "32 categories"
- "2 languages"
- "100% offline"

**[0:20–0:25]** Quick montage: speech synthesis icon pulsing, difficulty selector, category grid scrolling.

**[0:25–0:30]** End card: QuoteSmith logo, "Install on your phone", link, hashtags: #quotequiz #trivia #indiegame #pwa #offline #bilingual

**Music:** Ambient, minimal, slightly sophisticated. Think lo-fi with a literary feel.

---

## Hashtags

Primary: `#quotequiz` `#trivia` `#indiegame` `#pwa` `#offline` `#bilingual` `#education` `#knowledge`

Secondary: `#mobilegame` `#wordgame` `#quiztime` `#quotelovers` `#bookquotes` `#moviequotes` `#philosophy` `#learnenglish` `#learnitalian` `#culture` `#brainchallenge`
