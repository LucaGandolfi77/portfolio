# DNEVNIK — Naming & Piano di Produzione (News Editoriale)

> Sito di news con editoriali umani + redazione AI-agent driven
> Dominio nuovo indipendente
> v1.0 · Documento strategico

**Collegamenti interni**: [`newsroom/`](../newsroom/README.md) (redazione AI, 13 agenti, pipeline) · [`newsroom/run-cycle.md`](../newsroom/run-cycle.md) (manuale operativo ciclo) · [`newsroom/site/config.json`](../newsroom/site/config.json) (config sito) · [`newsroom/site/sources.json`](../newsroom/site/sources.json) (fonti) · [`docs/STUDIO-NAMING-E-PIANO.md`](STUDIO-NAMING-E-PIANO.md) (brand sorella Polifonia) · [`docs/APP-STORE-STRATEGY.md`](APP-STORE-STRATEGY.md) (finance/marketing)

---

## PARTE 1 — NAMING (Dostoevskij × giornalismo moderno)

### 1.1 Il riferimento chiave

**"Diario di uno scrittore"** (Дневник писателя, 1873-1877): Dostoevskij pubblicò la sua rivista come editore E opinionista, scrivendo articoli di fondo da solo. È il precursore esatto del modello ibrido proposto: **editoriali umani (Luigi) + redazione AI (machine-generated news)**. Il nome deve evocare quel dualismo: intimità del diario + attualità del giornale.

### 1.2 Le 10 proposte

| # | Nome | Origine Dostoevskij | Rationale | Tagline | Pro | Contro |
|---|------|---------------------|-----------|---------|-----|--------|
| 1 | **DNEVNIK** ⭐ | *Дневник* = "Diario" (cuore de "Il Diario di uno Scrittore") | Cortissimo (6 lettere), esotico, brandabile come .news/.it. Suona da gamertag moderno | *Il diario di una redazione.* | Domain-friendly, unico nel settore news, riferimento puro | Richiede 1 riga di spiegazione |
| 2 | **DIARIO** | Stessa radice, italiano puro | Immediato, italiano al 100%, .news/.it disponibili | *Ogni giorno, un diario.* | Chiaro, memorabile | Meno esotismo |
| 3 | **LO SCRITTORE** | *Il Diario di uno Scrittore* | Il sito è il diario dello scrittore-cittadino | *Lo scrivo, quindi esiste.* | Forte, identitario | Lungo per URL |
| 4 | **PISATEL'** | *Писатель* = "lo scrittore" in russo | Esotico, breve, ricorda "pittore" | *La penna della redazione.* | Corto, brandabile | Poco chiaro per non-russianisti |
| 5 | **ZAPISKI** | *Записки* = "Note" (come "Note dal Sottosuolo") | Evocativo, letterario | *Note dal fronte.* | Elegante | Non immediatamente news |
| 6 | **SVOBODA** | *Свобода* = "Libertà" | Chiaro messaggio editoriale: stampa libera | *Libera stampa.* | Forte posizione | Dominio probabilmente occupato |
| 7 | **DEN'** | *День* = "Il giorno" | Giornale = giorno. Brevissimo | *Ogni giorno.* | Ultra-corto | Troppo generico |
| 8 | **PEREDEL** | *Передель* = "Il confine" | Fact-check, confini della verità | *Il confine tra fatto e opinione.* | Evocativo per fact-check | Oscuro |
| 9 | **VECHER** | *Вечер* = "La sera" | Classico giornalistico russo ("Vecherniy") | *La sera si racconta.* | Classico | Occupato |
| 10 | **CHERNOKNIZHIE** | *Чёрная книжка* = "Il libro nero" | Editoriale hard, investigative | *La verità nera su bianco.* | Forte posizione editoriale | Troo dark per news generaliste |

### 1.3 Vincitore dichiarato: **DNEVNIK**

> *"Dnevnik — Il diario di una redazione."*

Perché vince:
1. Riferimento letterario diretto a "Diario di uno Scrittore" — non superficiale, ma centrale
2. Il concetto di "diario" incarna il dualismo **intimità editoriale + attualità quotidiana**: è il diario dove Luigi (lo scrittore) scrive e dove la redazione (AI) annota i fatti
3. Cortissimo (6 lettere), brandabile come dominio .news/.it, suona moderno
4. Scalabile: Dnevnik News, Dnevnik Editoriale, Dnevnik Investigation
5. Coerente con l'identità "redazione" già presente in `newsroom/site/config.json`

**Seconda scelta**: **DIARIO** (italiano puro, immediato). **Dominio**: `dnevnik.news` o `dnevnik.it` (verifica disponibilità reale). Dominio del portfolio Polifonia resta separato.

### 1.4 Identità brand

- **Name**: Dnevnik
- **Tagline**: *Il diario di una redazione.*
- **Sottotagline**: *Lo scrivo, quindi esisto.*
- **Autore editoriali**: Luigi Gandolfi (firma visibile su ogni editoriale)
- **Redazione AI**: Dnevnik Bot (firma discreta su ogni news generata)
- **Categorie**: come in `config.json` (tecnologia, politica, economia, scienza, salute, cronaca, mondo) + **Editoriali** (sezione dedicata)
- **Moto operativo**: *"Lo scrivo, quindi esiste."* — signature su ogni contenuto social

---

## PARTE 2 — ARCHITETTURA (dominio nuovo indipendente)

```
dnevnik.news (o dnevnik.it) — GitHub Pages — statico — €0-10/anno
├── /            HOME — giornale live (news AI + ultime)
├── /editoriali  SEZIONE EDITORIALI — solo contenuti firmati Luigi
├── /scritti     ARCHIVIO editoriali storici
├── /social      Clip/social content library
├── /about       Chi siamo: il diario, la redazione, l'uomo
├── /privacy     Policy editoriale + disclosure AI
└── /feed        Newsletter signup + RSS

newsroom/ (già esistente nel portfolio — resta il motore editoriale AI)
├── prompts/     13 ruoli (Scout, Writer, Fact Checker, Contradiction...)
├── site/        config.json, sources.json, publish.js, template
├── workflow/    cycle.script.js, build-cycle.js, smoke-test.js
├── state/       story-memory.json, published.json, performance.json
└── config/      editorial.json (NEWS_SCORE soglie, policy)
```

**Decisioni architetturali:**
1. Sito statico GitHub Pages (come Polifonia e il portfolio). Zero costi.
2. `newsroom/` resta **in-place** nel portfolio come motore AI. Il sito Dnevnik ne usa l'output. Nessuna duplicazione.
3. Separazione netta: **news** (AI cycle, fact-check, publish) vs **editoriali** (umano, quality gate editoriale diverso, no fact-check obbligatorio ma disclosure "opinion").
4. Le pubblicazioni AI generano pagine in `site/out/` (già gestito da `publish.js`). Gli editoriali umani hanno un percorso separato (Sezione 3).
5. Dominio nuovo = SEO separato, brand credibile, nessuna dipendenza dal portfolio Polifonia.

---

## PARTE 3 — SCHEMA EDITORIALE DETTAGLIATO: UOMO + AI

### 3.1 Tre flussi operativi

```
┌──────────────────────────────────────────────────────────────┐
│                    FLUSSO A — NEWS (100% AI)                 │
│  DISCOVER → CLASSIFY → DEDUP → RANK → RESEARCH → VERIFY     │
│  → ATTACK → DECIDE → WRITE → EDIT → SEO → GATE → PUBLISH   │
│  → MONITOR → UPDATE                                          │
│  Firma: "Dnevnik Bot" · Gate: Fact-check + Contradiction     │
│  Policy: nessuna opinione, solo fatti verificati              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    FLUSSO B — EDITORIALI (100% UMANO)        │
│  PROPOSTA → BOZZA → QUALITY GATE EDITORIALE → PUBBLICA      │
│  Firma: "Luigi Gandolfi" · Gate: Disclosure + tono          │
│  Policy: OPINIONE, disclosure obbligatoria, nessun fact-check│
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    FLUSSO C — IBRIDO                          │
│  AI DOSSIER → LUIGI EDITORIALE → QUALITY GATE → PUBBLICA   │
│  Firma: "Luigi Gandolfi (dossier AI)" · Gate: editoriale    │
│  Policy: opinione su dati verificati, disclosure "Opinione"  │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Flusso A — NEWS (100% AI, già in `newsroom/`)

- **Pipeline**: `newsroom/workflow/cycle.script.js` (DISCOVER→UPDATE completo)
- **Agenti**: 13 ruoli (Site Scout, Scout, Editor-in-Chief, Researcher, Fact Checker, Contradiction Agent, Writer, Copy Editor, SEO Editor, Visual Editor, Publisher, Monitor, Site Manager)
- **Quality gate**: Fact-check + Contradiction Agent + Publisher checklist (come definito in `newsroom/README.md`)
- **NEWS_SCORE** = 0.30×IMPORTANCE + 0.25×RECENCY + 0.20×SOURCE_RELIABILITY + 0.15×AUDIENCE_RELEVANCE + 0.10×TREND_VELOCITY
- **Confidence**: 0-39 BLOCK · 40-59 MORE_RESEARCH · 60-79 PUBLISH_WITH_CAUTION · 80-94 PUBLISH · 95-100 HIGH_CONFIDENCE
- **Firma**: "Dnevnik Bot" (discreta, in fondo all'articolo)
- **Costo**: 10-18 subagent per storia (`run-cycle.md` §8)
- **Policy**: nessuna opinione, solo fatti verificati

### 3.3 Flusso B — EDITORIALI (100% umano, Luigi scrive)

#### 3.3.1 Policy editoriale (regole non negoziabili)

| Regola | Dettaglio |
|--------|-----------|
| **Disclosure obbligatoria** | Ogni editoriale riporta: *"Opinione. L'autore è Luigi Gandolfi."* |
| **Nessun fact-check obbligatorio** | È opinione, non news. Non si fact-checka un'opinione |
| **Tono** | Personale, coraggioso, non clickbait |
| **Lunghezza** | 800-2500 parole |
| **Firma** | "Luigi Gandolfi" (in primo piano, visibile) |
| **Pubblicazione** | Entra in `/editoriali/` del sito, NON in `site/out/` della news pipeline |
| **NO Discovery AI** | Nessun agente AI partecipa alla creazione dell'editoriale |
| **NO Contradiction Agent** | Non si attacca un'opinione |
| **SEO Editor** | Sì (copy-editor, title/description) — senza alterare il significato |
| **Visual Editor** | Opzionale (immagine) |
| **Cross-link** | "Leggi anche: [titolo news correlata]" verso Flusso A |

#### 3.3.2 Template operativo editoriale (playbook per Luigi)

Il seguente template è il procedimento passo-passo che Luigi segue per ogni editoriale. Ogni editoriale viene creato inviando un'issue o un documento markdown seguendo questa struttura:

```markdown
# EDITORIALE — [TITOLO WORKING]

## METADATI
- **Autore**: Luigi Gandolfi
- **Data**: [YYYY-MM-DD]
- **Categoria**: [tecnologia | politica | economia | scienza | salute | cronaca | mondo]
- **Tone**: [personale | coraggioso | riflessivo | polemico]
- **Lunghezza target**: [800-2500 parole]
- **Status**: [BOZZA → REVIEW → PUBLISHED → ARCHIVED]

## DISCLOSURE
> Opinione. L'autore è Luigi Gandolfi. Questo editoriale esprime il punto di vista personale dell'autore e non rappresenta la linea editoriale della redazione AI di Dnevnik.

## PROPOSTA (2-3 righe)
[Argomento + angle + perché ora]

## ANGLE / THESIS
[La tesi centrale dell'editoriale. 1-2 frasi.]

## BOZZA

### Titolo (SEO)
[Title ottimizzato, max 60 caratteri]

### Meta description
[Description max 160 caratteri]

### Slug
[dnevnik-slug-italiano]

### Corpo editoriale

[Introduzione — hook personale, Dostoevskij-style]

[Sviluppo — argomentazioni, dati, esperienza personale]

[Conclusione — call-to-action, domanda al lettore]

### Disclosure finale
(Opinione. L'autore è Luigi Gandolfi.)

## QUALITY GATE EDITORIALE (checklist)
- [ ] Disclosure "Opinione" presente in apertura E chiusura
- [ ] Firma "Luigi Gandolfi" visibile
- [ ] Tono: personale, non clickbait
- [ ] Lunghezza: 800-2500 parole
- [ ] Nessun fatto presentato come certezza senza sorgente (anche nelle opinioni)
- [ ] Title/description SEO (SEO Editor)
- [ ] Immagine opzionale (Visual Editor)
- [ ] Cross-link a news correlate (se applicabile)
- [ ] NO fact-check richiesto (è opinione)
- [ ] NO Disclosure falsata

## PUBBLICAZIONE
- Destinazione: `/editoriali/[slug].md`
- Formato: Markdown → sito statico
- Firma visibile: Sì
- Social clip estratto: [sì/no + link]
```

#### 3.3.3 Workflow operativo (step-by-step)

```
1. Luigi apre un nuovo file seguendo il template sopra
2. Compila BOZZA (800-2500 parole, tone definito)
3. Auto-valuta con la Quality Gate checklist (paragrafo 3.3.2)
4. Se tutto OK → stato PUBLISHED → publish su /editoriali/
5. Se manca qualcosa → stato REVIEW → correzione → ripeti
6. Eventuale cross-link con news correlate (Flusso A)
7. Estrazione quote/clip per social (Flusso D — Social)
8. Newsletter preview (se incluso nel calendario)
```

#### 3.3.4 Come bypassa il ciclo AI

Gli editoriali **non** passano mai per `newsroom/workflow/cycle.script.js`. Motivo: fact-checkare un'opinione è un non-sense. Il fact-check è per i fatti. L'editoriale è opinione, responsabilità dell'autore, disclosure obbligatoria. Il percorso è indipendente e segue il template operativo sopra.

### 3.4 Flusso C — IBRIDO (AI ricerca, Luigi scrive)

```
AI DOSSIER (Flusso A mode: research) → LUIGI EDITORIALE (template Flusso B) → QUALITY GATE EDITORIALE → PUBBLICA
```

- **AI dossier**: Researcher + Fact Checker + Trend-Hunter producono dossier verificato (come `mode: research` del newsroom)
- **Luigi scrive**: usa il dossier come base per editoriale opinativo
- **Quality Gate**: come Flusso B (editoriale)
- **Tag**: "Dossier + Opinione"
- **Disclosure**: *"Opinione su dati verificati. L'autore è Luigi Gandolfi."*
- **Risultato**: editoriale informato dai dati, non neutrale — il meglio di entrambi i mondi

### 3.5 Policy editoriale complessiva (da aggiungere a `newsroom/site/config.json`)

```json
{
  "site": {
    "name": "Dnevnik",
    "url": "https://dnevnik.news",
    "language": "it",
    "default_author": "Redazione",
    "categories": ["tecnologia", "politica", "economia", "scienza", "salute", "cronaca", "mondo", "editoriali"],
    "tagline": "Il diario di una redazione."
  },
  "editorial_policy": {
    "news": {
      "gate": "newsroom_factcheck",
      "signature": "Dnevnik Bot",
      "opinion": false,
      "disclosure": "Fatti verificati dalla redazione AI"
    },
    "editorial": {
      "gate": "editorial_quality",
      "signature": "Luigi Gandolfi",
      "opinion": true,
      "disclosure": "Opinione. L'autore è Luigi Gandolfi.",
      "note": "Quality gate editoriale separato. Nessun fact-check obbligatorio. Template: docs/editorial-template.md"
    },
    "hybrid": {
      "gate": "editorial_quality",
      "signature": "Luigi Gandolfi (dossier AI)",
      "opinion": true,
      "disclosure": "Opinione su dati verificati. L'autore è Luigi Gandolfi."
    }
  },
  "publishing": {
    "mode": "file",
    "editorial_out_dir": "editoriali",
    "editorial_template": "docs/editorial-template.md"
  }
}
```

---

## PARTE 4 — STRATEGIA SOCIAL-FIRST

### 4.1 Il paradigma: Social è la prima pagina

Ogni contenuto nasce per i social e viene ampliato per il sito. Non il contrario.

### 4.2 Content calendar (settimanale)

| Giorno | Social (TikTok/Reels/Shorts/X) | Sito (long-form) | Newsletter |
|--------|-------------------------------|-------------------|------------|
| Lun | "La settimana in 60s" (news AI) | — | Recap |
| Mar | "Fact-check rapido" (15s) | News AI | — |
| Mer | **"Editoriale in 3 minuti"** (Luigi) | **Editoriale Luigi** | Preview |
| Gio | "Cosa succede oggi" (news AI) | News AI | — |
| Ven | **"Dibattito"** (thread X) | News AI | — |
| Sab | **"L'editoriale lungo"** (YouTube/Luigi) | **Editoriale Luigi** | Full |
| Dom | "Il diario della settimana" (recap) | — | Digest |

### 4.3 Canali e format

- **TikTok/Reels/Shorts**: 3 video/settimana (60-90s). Formato: "La notizia in 60 secondi" (AI) + "L'editoriale in 3 minuti" (Luigi). Hook: "3 cose che [giornale mainstream] non ti dice" — coerente con il posizionamento Dostoevskij (chi dice la verità agli idioti).
- **YouTube**: 1 lungo/week (15-25min). **"Il Diario dello Scrittore"** — editoriale Luigi come video-essay. Luigi parla alla camera, dati sullo schermo, no faccia stock. Formato: esatto il riferimento Dostoevskij, carico di branding.
- **Twitter/X**: 2-3 thread/settimana. Fact-check rapidi, editoriali sintetici, engagement sui temi caldi.
- **Instagram**: visual news cards (grafici, infographic) + reels repost.
- **Newsletter**: gratuita, 2-3 email/settimana. Segmento automatico (news vs editoriali). Premium option futuro (editoriali esclusivi).
- **Podcast**: gli editoriali Luigi come audio (estensione naturale di YouTube).

### 4.4 Funnel social → site → community

```
TikTok/Reels/Shorts (hook) → Sito Dnevnik (letture complete) → Newsletter (feed) → Community (Discord/Reddit) → Feedback → Nuovo editoriale
```

- Ogni clip social punta a un articolo del sito (link in bio/descrizione)
- Ogni editoriale genera 2-3 clip social (estrazione quote)
- Cross-promo: editoriali → news correlate → news → editoriali correlati

### 4.5 Il twist Dostoevskij sui social

Ogni contenuto social porta un tag: *"Lo scrivo, quindi esiste."* — il motto di Luigi che diventa signature del brand. I social sono il diario pubblico dello scrittore: diretto, personale, senza filtri.

---

## PARTE 5 — PIANO FINANCE (voce: Nico)

### 5.1 Costi Anno 1

| Voce | Costo | Note |
|------|-------|------|
| Dominio (.news/.it) | ~€10-30/anno | |
| GitHub Pages hosting | €0 | Statico |
| newsroom engine | €0 | Già in portfolio |
| SEO strumenti | €0 (free) | |
| Canali social | €0 | |
| **TOTALE** | **~€30/anno** | |

### 5.2 Revenue model (fase 1: organico, zero ads)

| Fonte | Timing | Target |
|-------|--------|--------|
| Newsletter premium (editoriali esclusivi) | Anno 2 | €5/mese, 500 subs → €2.5K/mese |
| Sponsorship editoriale (b2b) | Anno 2 | €500-2K/post — solo dopo trust provata |
| Affiliate (libri, tool) | Anno 1 | marginale |
| Ads (AdSense/Mediavine) | Anno 2+ | solo dopo 50K+ pageviews/mese |
| B2B white-label (redazione AI per altre testate) | Anno 3 | |

### 5.3 P&L 3 anni

| Anno | Prudente | Base | Ottimista |
|------|----------|------|-----------|
| 1 | €0 | €0-2K (sponsorship minori) | €5K |
| 2 | €2K | €5-15K | €30K |
| 3 | €10K | €20-50K | €80K |

### 5.4 Unit economics

| Contenuto | Costo generazione | LTV | Note |
|-----------|-------------------|-----|------|
| News AI | ~€0 (agenti) | pageview/ad | |
| Editoriale Luigi | ~1-2 ore (umano) | premium subs, sponsorship | Il prodotto premium |
| Social clip | ~10min (estrazione) | funnel | Costo-zero |
| Newsletter | ~30min (Luigi) | retention | |

**Regole non negoziabili:**
- **Nessun ads Anno 1**: l'esperienza utente e la trust sono prioritarie. Il diario non è un tabloid.
- **Newsletter prima di ads**: il modello premium funziona prima delle monetizzazioni invasive.
- **Regola 90 giorni**: nessun spend in UA prima di engagement provato. Organico solo.

### 5.5 KPI dashboard

| Categoria | KPI | Target Anno 1 |
|-----------|-----|---------------|
| **News AI** | pageviews, D1/D7 retention, fact-check pass rate | |
| **Editoriali** | letture complete (scroll >80%), premium conversion | |
| **Social** | views, engagement rate, CTR al sito | |
| **Newsletter** | open rate >30%, CTR >5%, unsub <1%/mese | |
| **North Star** | **WER (Weekly Engaged Readers)** — chi ha letto ≥1 editoriale + ≥3 news nella settimana | **2.000 WER** |

---

## PARTE 6 — PIANO MARKETING (voce: Marta)

### 6.1 Posizionamento

**"Lo scrivo, quindi esisto."** In un media landscape di AI-hallucination e clickbait, Dnevnik è il diario di uno scrittore che dice la verità — con una redazione AI che verifica i fatti. Il messaggio: **umano + verificato = trust**.

### 6.2 Differenziazione chiave

Ogni competitor news AI si presenta come "AI-powered news". Dnevnik si presenta come **"Uno scrittore con una redazione"** — l'umano è il fronte, la macchina è il motore. Questo è il punto di forza unico:
- Gli editoriali sono scritti da Luigi (nome, volto, storia) → trust umano
- Le news sono verificate da 13 agenti AI → accuratezza macchina
- Il mix: **"Scritto da un uomo, informato da una redazione"**

### 6.3 Canali e cadence

Come in Sezione 4. Dettagli:
- **TikTok/Reels**: hook emotional + fact-check rapido. "Luigi ti dice perché [notizia] è vera/falsa in 60 secondi".
- **YouTube**: "Il Diario dello Scrittore" — editoriale Luigi come video-essay. Formato: Luigi parla alla camera, dati sullo schermo, no faccia stock.
- **Twitter/X**: Luigi thread personali + fact-check veloci. Il tono è diretto, Dostoevskij-style ("E allora, idioti, ecco la verità").
- **Newsletter**: 2-3/settimana. Segmento automatico (news vs editoriali).

### 6.4 SEO editoriale

- Keyword cluster: "opinion [tema]", "perché [evento]", "analisi [argomento]"
- Long-form editoriali = lead magnets per SEO
- Cross-link: editoriali → news correlate → news → editoriali
- News AI: SEO naturale (tempestività, fact-check = E-E-A-T)

### 6.5 Roadmap lanci

| Fase | Azione |
|------|--------|
| Fase 1 (30gg) | Dominio + Sito statico (home + editoriali + about) + primo editoriale Luigi pubblicato + profile TikTok/X/YouTube |
| Fase 2 (60gg) | Integrazione newsroom cycle (news AI live) + primi 10 clip social + newsletter signup |
| Fase 3 (90gg) | YouTube long-form avviato + newsletter premium preview + community (Discord/Reddit) |

---

## PARTE 7 — 10 COMANDAMENTI: genialità, sopravvivenza, sfondamento

1. **L'umano è il brand, la macchina è il motore.** Non nascondere che Luigi scrive gli editoriali. La fiducia è il tuo asset più prezioso — e si costruisce con il nome, la foto, la storia.

2. **Il diario non mente mai.** Gli editoriali sono OPINIONI, con disclosure obbligatoria. Mai far passare un'opinione per news. Mai fact-checkare un'opinione. Mai nascondere la natura opinionista. La trasparenza è la reputazione.

3. **Ship editoriale prima di ship news.** Il primo contenuto che pubblica è un editoriale di Luigi. Non una news AI. Il brand si costruisce sullo scrittore, non sulla macchina. Il giornale arriva dopo.

4. **Zero burn = sopravvivenza infinita.** ~€30/anno di costi fissi. Non puoi morire di cassa. Prima di spendere in ads: 90 giorni di engagement provato.

5. **Social è la prima pagina, non il diapositiva.** Ogni contenuto nasce per TikTok/Reels. Il sito è il luogo dove si leggono le cose che i social hanno promesso. Non il contrario.

6. **Genialità regolamentata.** Ogni settimana 1 "scommessa editoriale" (Angolo: 1 editoriale coraggioso su un tema scomodo). Genialità ≠ clickbait: è coraggio + disclosure.

7. **Il twist Dostoevskij è il marketing.** "Lo scrivo, quindi esisto" — questo è il messaggio che i media vogliono raccontare. Uno scrittore con una redazione AI in un'era di AI-news: è una storia. La stampa ne parlerà gratis.

8. **Diversifica revenue prima del Q2.** Newsletter premium (Anno 1 come preview), sponsorship (Anno 2), ads (Anno 2+), B2B white-label (Anno 3). Mai >50% da una fonte.

9. **Compliance editoriale day-1.** Disclosure "Opinione" su ogni editoriale. Fact-check sui fatti. Mai nascondere errori: policy RETRACT come in `newsroom/`. Un errore nascosto = fine del diario.

10. **All-in quando sfondi.** Se un editoriale di Luigi diventa virale (1M+ views), smetti di pubblicare news AI e all-in sul formato editoriale + YouTube. La disciplina di concentrazione è la mossa più geniale.

---

## PARTE 8 — CHECKLIST 30 / 60 / 90 GIORNI

### 30 giorni — Dominio & Brand
- [ ] Registrare dominio (dnevnik.news o variante — verifica disponibilità: DNEVNIK prima, DIARIO fallback)
- [ ] Sito statico (home + editoriali + about + privacy) su GitHub Pages
- [ ] Primo editoriale Luigi pubblicato (sezione `/editoriali/`, template operativo Flusso B)
- [ ] Profile TikTok/X/YouTube attivi con branding Dnevnik
- [ ] Newsletter signup page
- [ ] Aggiornare `newsroom/site/config.json` con identity Dnevnik

### 60 giorni — News AI & Social
- [ ] Integrazione `newsroom/` cycle in produzione (news AI live su home)
- [ ] Primi 10 clip social pubblicati (estrazioni da editoriali/news)
- [ ] YouTube "Il Diario dello Scrittore" primo episodio
- [ ] Newsletter invio primo recap
- [ ] Config `site/config.json` con `editorial_policy` aggiornato

### 90 giorni — Community & Revenue
- [ ] Community (Discord/Reddit) avviata
- [ ] Newsletter premium preview (early access editoriali)
- [ ] Sponsorship primi contatti (se traction)
- [ ] Analytics dashboard (WER, engagement, social CTR)
- [ ] Decisione GO/NO-GO per revenue model (subscription/sponsorship)

---

## PARTE 9 — MATRICE DI DECISIONE RAPIDA

| Domanda | Risposta |
|---------|----------|
| Nome pubblico? | **DNEVNIK** (fallback: DIARIO) |
| Tagline? | *Il diario di una redazione.* · *Lo scrivo, quindi esisto.* |
| Dominio? | Nuovo indipendente (dnevnik.news / dnevnik.it) |
| Engine news? | `newsroom/` esistente (in-place, nessuna duplicazione) |
| Editoriali? | Flusso B/C (umano) — quality gate editoriale separato + template operativo incluso |
| Social? | First-class: TikTok/Reels/Shorts/X/YouTube + newsletter |
| Primo contenuto? | Editoriale Luigi (il diario inizia con lo scrittore) |
| Costo Anno 1? | ~€30 |
| North Star? | WER (Weekly Engaged Readers) |
| Quality gate editoriale? | Disclosure + tono + lunghezza (NO fact-check) |

---

## PARTE 10 — COLLEGAMENTI INTERNO

- `newsroom/README.md` — motore editoriale AI (13 agenti, pipeline)
- `newsroom/run-cycle.md` — manuale operativo ciclo
- `newsroom/site/config.json` — config sito (aggiornare con nome Dnevnik)
- `newsroom/site/sources.json` — fonti news
- `docs/STUDIO-NAMING-E-PIANO.md` — branding Polifonia (sorella)
- `docs/APP-STORE-STRATEGY.md` — strategia app store (finance/marketing)
- `docs/WIKITHRIVING-LAUNCH.md` — go-to-market (finance/marketing)

---

## APPENDICE — Identity governance

| Elemento | Flusso A (News) | Flusso B (Editoriali) | Flusso C (Ibrido) |
|----------|-----------------|----------------------|-------------------|
| Autore | Dnevnik Bot | Luigi Gandolfi | Luigi Gandolfi |
| Firma | "Dnevnik Bot" | "Luigi Gandolfi" | "Luigi Gandolfi (dossier AI)" |
| Disclosure | "Fatti verificati dalla redazione AI" | "Opinione. L'autore è Luigi Gandolfi." | "Opinione su dati verificati. L'autore è Luigi Gandolfi." |
| Gate | Fact-check + Contradiction | Editorial quality (disclosure + tono) | Editorial quality |
| Lunghezza | Articolo news standard | 800-2500 parole | 800-2500 parole |
| Template | `newsroom/` schema | Flusso B template (§3.3.2) | Flusso B template + dossier AI |
| Pubblicazione | `/` (home news) | `/editoriali/` | `/editoriali/` |

> *"Lo scrivo, quindi esiste."* — Dnevnik
