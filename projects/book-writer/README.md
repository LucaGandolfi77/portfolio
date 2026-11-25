# Book Writer — AI-Powered Novel Generator

A browser-based tool for generating complete novels chapter-by-chapter using AI language models. This is the web companion to the desktop `book-writer-gui.py` (Tkinter) application, offering the same core workflow in a responsive, mobile-friendly interface.

## Features

- **Multi-model support** — Ollama (local), OpenAI GPT-4o / GPT-3.5, Google Generative AI
- **Idea generation** — Generate 5 plot-direction ideas per chapter, pick the best one
- **Chapter writing** — Full chapter generation with title, text, and continuity summary
- **Auto-finish mode** — Automatically generate all remaining chapters (picks idea #1)
- **Writing options** — Toggle dialogue, sensory detail, metaphor, interior monologue
- **Prompt extras** — Append custom instructions to every AI prompt
- **EN / IT localization** — UI language auto-switches based on the selected book's language
- **Book management** — Add, edit, delete books; load from JSON file
- **Export** — Download finished books as `.txt` files
- **Persistent state** — Books, progress, and settings saved to `localStorage`
- **Mobile optimized** — Responsive 3-panel → single-column layout on small screens

## Getting Started

### Web UI (this folder)

1. Open `index.html` in any modern browser (or serve it via a local HTTP server).
2. Add a book manually with the **＋** button, or load a `books.json` file.
3. Select a book → **Generate 5 Ideas** → pick one → **Write Selected Chapter**.
4. Repeat, or use **Auto Finish** to complete the novel automatically.

### API Keys

| Model | Where to enter |
|-------|----------------|
| Ollama | Set the Ollama URL in the toolbar (default `http://localhost:11434/api/chat`) |
| OpenAI | Paste your `sk-...` key in the **OpenAI Key** toolbar field |
| Google AI | Paste your key in the **Google Key** toolbar field |

Keys are stored in `localStorage` only — never sent to any server other than the selected AI provider.

### books.json format

```json
[
  {
    "title": "The Last Observatory",
    "description": "A young physicist discovers...",
    "genre": "Science mystery",
    "audience": "Adult",
    "tone": "Atmospheric, tense",
    "language": "English"
  }
]
```

## Desktop version

The original Tkinter desktop GUI is in `book-writer-gui.py`. Run it with:

```bash
pip install requests
python book-writer-gui.py
```

It supports the same models and workflow, plus file-based API key loading (`api-key.txt`, `chatgpt-api-key.txt`).

## File structure

```
book-writer/
├── index.html          # Web UI entry point
├── style.css           # Styles (dark theme, responsive)
├── app.js              # Application logic
├── book-writer-gui.py  # Desktop Tkinter version
├── books.json          # Sample English books
├── libri.json          # Sample Italian books
└── README.md           # This file
```

## License

Part of the [portfolio](https://github.com/LucaGandolfi77/portfolio) project.
