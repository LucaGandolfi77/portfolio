# BORGO NOTTE: Quattro Stagioni

The story version of [BORGO NOTTE](../borgo-gta-pwa/): an original
open-world game on the real streets of Fidenza with a story in four
chapters, the phases of the day, the four seasons, weather and the
town's seasonal events. Mobile-first PWA.

It is an original game in the open-world driving genre (own name,
characters, story, interface and look), not affiliated with any other game
or brand. The landmarks and streets are real; the businesses and people
are invented.

## Story

Dario Corradi comes back to Fidenza after ten years. His uncle Ottavio's
taxi-and-delivery firm owes money to the Conte Bertolazzi, who wants the
family garage. Four chapters, one per season, twelve missions:

1. **Ritorno** (primavera): the station, the first fares, flowers for the
   market — and the first warning from the Conte.
2. **Notte Bianca** (estate): a street race against the Smilzo, the taxi
   rush of the Notte Bianca, tailing the Conte's van to the freight yard.
3. **San Donnino** (autunno): the stolen procession lanterns, a fragile
   relic to carry to the Duomo, the stolen festival cash box.
4. **Nebbia** (inverno): tailing the Conte in the fog, collecting the
   evidence, New Year's Eve in the square.

Mission kinds: talk, go to, timed and fragile deliveries, race against an
AI rival, tailing at the right distance, chase and ram, collect, escape.

## The world through the year

- **Day phases:** alba, mattina, mezzogiorno, pomeriggio, tramonto, sera,
  notte; sunrise and sunset move with the season (long summer evenings,
  dark winter afternoons). One in-game day lasts 24 minutes.
- **Seasons** (three in-game days each, or jumped by the story): blossom in
  spring, deep green in summer, orange and red in autumn, bare trees and
  settling snow in winter.
- **Weather** by season: clear, cloudy, rain, the Po valley fog, snow. Rain
  and snow lower the grip of the cars; fog closes the view.
- **Seasonal events** with decorations, a crowd and their own jobs: Mercato
  dei fiori, Notte Bianca, Festa di San Donnino, Mercatino di Natale,
  Capodanno with fireworks at midnight.

## Also

- An opening film rendered live in the engine (skippable, replayable from
  the title screen).
- A phone (`J` or TEL): story, calendar with upcoming events, contacts,
  collection and stats.
- A jetpack (`G` or JET): fly anywhere over the map, `Space`/SU to climb, `Q`/GIÙ to descend, `Shift`/TURBO for speed. Roof heights come from the measured building heights, so you can land and walk on roofs; walls stop you only below their roof line.
- 20 holy cards (santini) hidden near the town's landmarks.
- Officina Stirone (green beacon): repair the car and save.
- Everything from BORGO NOTTE: traffic, pedestrians, police alert, free
  jobs, four generative radio stations, touch controls, quality presets.

```bash
npm install
npm run dev     # http://localhost:5176
npm test        # calendar, story data, road graph, alert, jobs, save, physics
npm run build
```

## Credits

Map © OpenStreetMap contributors (ODbL 1.0) · DBTR © Regione Emilia-Romagna
(CC BY 4.0) · AGEA 2023 orthophoto via Regione Emilia-Romagna.
