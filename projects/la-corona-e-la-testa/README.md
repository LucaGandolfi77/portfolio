# LA CORONA E LA TESTA

La leggenda di San Donnino, patrono di Fidenza, in un film animato di circa
15 minuti disegnato dal vivo nel browser.

**Guarda:** <https://lucagandolfi77.github.io/portfolio/projects/la-corona-e-la-testa/>

Milano, anno 303. Donnino custodisce la corona dell'imperatore Massimiano.
Riceve il battesimo in una prigione, restituisce la corona davanti alla corte
e fugge lungo la via Emilia, inseguito da Valerio, il centurione suo amico.
Allo Stirone il viaggio finisce; all'alba comincia il miracolo che darà il nome
a Borgo San Donnino, l'odierna Fidenza.

- Prologo, otto atti con titoli latini, epilogo: 36 inquadrature e 119 battute
  in italiano e inglese. Le parole latine compaiono come iscrizioni.
- Palazzo imperiale con mosaici d'oro, legioni, cavalieri, la pianura con i
  pioppi, il ponte romano sullo Stirone, il cantiere e la facciata del Duomo.
- Musica originale nei modi antichi, corni imperiali, coro senza parole, voce
  narrante facoltativa.
- Verticale e orizzontale, dal telefono al desktop; installabile e offline.

L'esecuzione non è mai mostrata: la camera guarda il fiume. Il santo che porta
la propria testa è disegnato come un'icona luminosa, senza nulla di cruento.

## Sviluppo

```bash
npm install
npm run dev
npm test           # sceneggiatura, tempi e coerenza delle inquadrature
npm run build
```

| File | Contenuto |
|---|---|
| `src/film/script.ts` | La sceneggiatura: capitoli, inquadrature, battute. I tempi si calcolano da qui. |
| `src/film/shots/` | Un'immagine per inquadratura: camera, luce, attori, scene, suoni. |
| `src/film/shots/sets.ts` | I luoghi: palazzo, prigione, locanda, pianura, Stirone, Duomo. |
| `src/film/draw/` | Il manichino, il cast romano e medievale, scenografie e meteo. |
| `src/film/stage.ts` | Regia: camera, parallasse, cavalli, statue, transizioni, sottotitoli. |

Il motore è lo stesso di *Les Misérables — Le Fil d'Or*
(`projects/les-miserables-film`), con costumi e ambienti propri.

## Crediti

Dalla leggenda tradizionale di San Donnino (martire nel 304). Testo, disegni e
musica originali. Caratteri: Cormorant Garamond e Inter (SIL OFL).
