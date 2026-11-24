# 👥 People Simulator

Un modello vivo di una giornata negli Stati Uniti: tre coorti di population con transizioni Markov orarie, eventi iniettabili e metriche emergenti. Tutto offline, senza account o servizi esterni.

## Meccaniche

- **Modello a coorti**: studenti (0–17), lavoratori (18–64), anziani (65+), ognuno con profili orari diversi per notte/mattina/giorno/sera.
- **Cicli reali**: fusi orari per stato, weekend, pausa pranzo, orario scolastico, sonno.
- **Eventi**: neve, ondata di caldo, festività, game day, blackout — alterano le transizioni in tempo reale.
- **Metriche emergenti**: felicità, traffico, consumo energetico, produttività, debito di sonno.
- **Controlli tempo**: play/pausa, 1×/4×/20×/60×, +1 ora, +1 giorno.
- **Mappa coropleta**: D3 + topojson con dati vendoriati (`data/us-states-10m.json`), zoom, selezione stato, colori per attività dominante.
- **Grafici**: donut attività, barre sorted, sparkline 24h, strip oraria, confronto tra stati, scenario editor e preferiti.
- **EN/IT** sincronizzato con il project shell, PWA installabile, accessibilità.

## Architettura

```
people-simulator/
├── index.html · css/app.css · manifest · icon.svg · icons/ · sw.js
├── vendor/{d3.min.js,topojson.min.js}   # librerie vendoriates
├── data/us-states-10m.json             # geometrie offline
├── js/
│   ├── config.js    50 stati+DC, attività, coorti, eventi, EN/IT
│   ├── i18n.js · storage.js · rng.js
│   ├── model.js     coorti Markov, mix, metriche, serie orarie (puro)
│   ├── engine.js    simulazione fixed-step
│   ├── geo.js · charts.js · ui.js · main.js
└── tests/logic-test.mjs
```

I moduli `model` ed `engine` sono puri e testati in Node. Zero CDN a runtime.

## Test

```bash
node projects/people-simulator/tests/logic-test.mjs
```

21 test su dati, transizioni, eventi, motore, grafici e struttura.

## Registro portfolio
`assets/js/projects-data.js` — id `people-simulator`, badge "Data", icona 👥.
