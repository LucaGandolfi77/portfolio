# Ideas Pipeline — Faro Studio

> Raw ideation artifacts live here. Creativo, Trend-Hunter, and Innovatore produce content in this directory. The Director decides which ideas graduate to full Discovery (`graphs/01-discovery.json`).

## Structure

```
products/ideas/
├── README.md              ← This file
├── trends/                ← Trend-Hunter output (market signals, platform changes)
├── concepts/              ← Creativo output (raw concept briefs, 5+ per brief)
├── scores/                ← Innovatore output (scoring matrices, ranked shortlists)
└── funded/                ← Director-approved concepts heading to Innovation Sprint
```

## Workflow

1. **Trend-Hunter** (`graphs/06-ideate` step 1) writes `trends/<topic>-<date>.md`
2. **Creativo** (`graphs/06-ideate` step 2) writes `concepts/<concept-name>-brief.md`
3. **Innovatore** (`graphs/06-ideate` step 3) writes `scores/<concept-name>-score.md`
4. **Synthesizer** (`graphs/06-ideate` step 4) produces the Director's memo
5. Director funds 1-3 concepts → move to `funded/`
6. **Innovation Sprint** (`graphs/07-innovation-sprint.json`) deep-dives funded concepts
7. **Discovery** (`graphs/01-discovery.json`) produces Go/No-Go memo for top-ranked concepts

## Rules

- Ideation artifacts are **not** source code. They don't go in the product repositories.
- Ideas are free; implementation costs real studio time. Don't accumulate 50 unfunded concepts.
- Every concept must pass the **zero-backend test**: can this be built as an offline-first PWA with no server? If not, either redesign or flag as a separate project.
- Kill ideas early. A killed idea at step 2 saves a week at step 5.
