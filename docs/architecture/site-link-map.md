# Site Architecture and Link Map

> Generated from the repository with `python3 tools/seo/generate_site_link_map.py`.
> HTML links are checked against the filesystem. External URLs and browser-special schemes are documented as exceptions.

## Summary

- HTML files scanned: 400
- HTML-to-HTML edges: 245
- JavaScript-generated catalog routes: 216
- Orphan candidates: 260
- Broken or inconsistent references: 46

## Architecture

```text
portfolio/
├── index.html                         Main portfolio shell and curated home
├── pages/main/projects.html            Searchable project archive
├── games/index.html                    Searchable game archive
├── lab/index.html                      Browser Lab hub
├── games/arcade-lab/index.html         Arcade Lab hub
├── games/quotesmith/                   Offline quote quiz PWA
├── projects/                           Standalone tools and experiments
├── games/                              Standalone games and game collections
├── pages/content/                      Books, movies, music, poems, media
├── pages/experiments/                  Easter eggs and hidden experiments
├── assets/js/catalog-data.js            Shared project/game catalog data
├── assets/js/catalog-home.js            Curated homepage renderer
├── assets/js/catalog.js                 Archive filters and favorites
├── assets/js/projects-data.js           Project catalog source data
├── manifest.json / sw.js                Portfolio PWA shell
├── sitemap.xml / robots.txt             Crawl configuration
└── tools/seo/                           Audit and report generators
```

## Main Entry Points

| Entry point | Role | Links to |
|---|---|---|
| `index.html` | Main portfolio | Projects archive, games archive, Lab, interests, content pages |
| `pages/main/projects.html` | Full project archive | Catalog targets generated from `projects-data.js` |
| `games/index.html` | Full game archive | Catalog targets generated from `catalog-data.js` |
| `lab/index.html` | Browser experiments | Self-contained tools |
| `games/arcade-lab/index.html` | Mini-game collection | Self-contained games |
| `games/quotesmith/index.html` | Quote quiz PWA | `data.js`, `engine.js`, `script.js`, service worker |
## HTML to HTML Map

### `games.html`
- `games/arcade-lab/index.html`
- `games/quotesmith/index.html`
- `index.html`
- `projects.html`

### `games/3dgame/legacy-3dgame.html`
- `games/3dgame/index.html`

### `games/airhockey/legacy-airhockey.html`
- `games/airhockey/index.html`

### `games/animal-crossing/legacy-animal_crossing.html`
- `games/animal-crossing/index.html`

### `games/arcade-lab/index.html`
- `games/index.html`
- `index.html`

### `games/arcade-lab/offline.html`
- `games/arcade-lab/index.html`

### `games/arena-royale-2/index.html`
- `index.html`

### `games/aviator/legacy-aviator.html`
- `games/aviator/index.html`

### `games/backgammon/legacy-backgammon.html`
- `games/backgammon/index.html`

### `games/battlelands-royale/legacy-battlelands_royale.html`
- `games/battlelands-royale/index.html`

### `games/battleship/legacy-battleship.html`
- `games/battleship/index.html`

### `games/blackjack/index.html`
- `games/index.html`

### `games/blackjack/legacy-blackjack.html`
- `games/blackjack/index.html`

### `games/brawl-stars/legacy-brawl_stars.html`
- `games/brawl-stars/index.html`

### `games/briscola/index.html`
- `games/index.html`

### `games/briscola/legacy-briscola.html`
- `games/briscola/index.html`

### `games/cards/index.html`
- `games/index.html`

### `games/cards/legacy-cards.html`
- `games/cards/index.html`

### `games/cdd/index.html`
- `games/index.html`

### `games/cdd/legacy-cdd.html`
- `games/cdd/index.html`

### `games/chess/index.html`
- `games/index.html`

### `games/chess/legacy-chess.html`
- `games/chess/index.html`

### `games/city-sim/legacy-city_sim.html`
- `games/city-sim/index.html`

### `games/clash-royale/legacy-clash_royale.html`
- `games/clash-royale/index.html`

### `games/coloring_book/index.html`
- `games/index.html`

### `games/coloring_book/legacy-coloring_book.html`
- `games/coloring_book/index.html`

### `games/coop-game/legacy-coop-game.html`
- `games/coop-game/index.html`

### `games/dama/index.html`
- `games/index.html`

### `games/dama/legacy-dama.html`
- `games/dama/index.html`

### `games/drinking-game/legacy-drinking_game.html`
- `games/drinking-game/index.html`

### `games/echoes-of-the-last-dawn/legacy-echoes-of-the-last-dawn.html`
- `games/echoes-of-the-last-dawn/index.html`

### `games/esposta/offline.html`
- `games/esposta/index.html`

### `games/esposta/www/offline.html`
- `games/esposta/www/index.html`

### `games/farkle/legacy-farkle.html`
- `games/farkle/index.html`

### `games/flappy-bird/index.html`
- `games/index.html`

### `games/flappy-bird/legacy-flappy_bird.html`
- `games/flappy-bird/index.html`

### `games/forza4/index.html`
- `games/index.html`

### `games/forza4/legacy-forza4.html`
- `games/forza4/index.html`

### `games/friends-tycoon/legacy-friends-tycoon.html`
- `games/friends-tycoon/index.html`

### `games/geom_dash/index.html`
- `games/index.html`

### `games/geom_dash/legacy-geom_dash.html`
- `games/geom_dash/index.html`

### `games/goose/index.html`
- `games/index.html`

### `games/goose/legacy-goose.html`
- `games/goose/index.html`

### `games/guess-who/index.html`
- `games/index.html`

### `games/guess-who/legacy-guess_who.html`
- `games/guess-who/index.html`

### `games/index.html`
- `games/arcade-lab/index.html`
- `games/quotesmith/index.html`
- `index.html`
- `projects.html`

### `games/kart/index.html`
- `index.html`

### `games/kart/legacy-kart.html`
- `games/kart/index.html`

### `games/math-duel/legacy-math_duel.html`
- `games/math-duel/index.html`

### `games/memory/index.html`
- `games/index.html`

### `games/memory/legacy-memory.html`
- `games/memory/index.html`

### `games/mobile-air-hockey/index.html`
- `games/index.html`

### `games/mobile-air-hockey/legacy-mobile_air_hockey.html`
- `games/mobile-air-hockey/index.html`

### `games/mystic-quest/legacy-mystic-quest.html`
- `games/mystic-quest/index.html`

### `games/orlog/legacy-orlog.html`
- `games/orlog/index.html`

### `games/orto-magico/legacy-orto-magico.html`
- `games/orto-magico/index.html`

### `games/pinball-classic/index.html`
- `index.html`

### `games/pinball/legacy-pinball.html`
- `games/pinball/index.html`

### `games/pixel-runner/legacy-pixel_runner.html`
- `games/pixel-runner/index.html`

### `games/plane/legacy-plane.html`
- `games/plane/index.html`

### `games/pokedex-classic/index.html`
- `index.html`

### `games/pokedex/index.html`
- `index.html`

### `games/pokedex/legacy-pokedex.html`
- `games/pokedex/index.html`

### `games/pokemon-classic/index.html`
- `index.html`

### `games/pokemon/index.html`
- `index.html`

### `games/pokemon/legacy-pokemon.html`
- `games/pokemon/index.html`

### `games/poker/index.html`
- `games/index.html`

### `games/poker/legacy-poker.html`
- `games/poker/index.html`

### `games/pokopia-clone/legacy-pokopia-clone.html`
- `games/pokopia-clone/index.html`

### `games/quantum-forge/legacy-quantum-forge.html`
- `games/quantum-forge/index.html`

### `games/quantum-tictactoe/index.html`
- `games/index.html`

### `games/quantum-tictactoe/legacy-quantum_tictactoe.html`
- `games/quantum-tictactoe/index.html`

### `games/quotesmith/index.html`
- `games/index.html`
- `index.html`

### `games/quotesmith/www/index.html`
- `games/index.html`
- `games/quotesmith/index.html`

### `games/regno-di-moneta/privacy.html`
- `games/regno-di-moneta/index.html`

### `games/rpg/legacy-rpg.html`
- `games/rpg/index.html`

### `games/scopa/index.html`
- `games/index.html`

### `games/scopa/legacy-scopa.html`
- `games/scopa/index.html`

### `games/shogi/legacy-shogi.html`
- `games/shogi/index.html`

### `games/slot-collect/legacy-slot_collect.html`
- `games/slot-collect/index.html`

### `games/slot/index.html`
- `index.html`

### `games/slot/legacy-slot.html`
- `games/slot/index.html`

### `games/snake/index.html`
- `index.html`

### `games/snake/legacy-snake.html`
- `games/snake/index.html`

### `games/space-invaders/legacy-space_invaders.html`
- `games/space-invaders/index.html`

### `games/space-universe/legacy-space_universe.html`
- `games/space-universe/index.html`

### `games/steel-waves/index.html`
- `games/index.html`

### `games/steel-waves/legacy-steel_waves.html`
- `games/steel-waves/index.html`

### `games/taboo/legacy-taboo.html`
- `games/taboo/index.html`

### `games/tamagotchi/index.html`
- `games/index.html`

### `games/tamagotchi/legacy-tamagotchi.html`
- `games/tamagotchi/index.html`

### `games/tetris/legacy-tetris.html`
- `games/tetris/index.html`

### `games/tokyo/legacy-tokyo.html`
- `games/tokyo/index.html`

### `games/tower-defense/index.html`
- `games/index.html`

### `games/tower-defense/legacy-tower_defense.html`
- `games/tower-defense/index.html`

### `games/uno/legacy-UNO.html`
- `games/uno/index.html`

### `games/visual-novels/index.html`
- `index.html`
- `pages/content/karamazov.html`
- `pages/content/luca_life.html`
- `pages/content/proust.html`
- `pages/main/ai_tale.html`
- `pages/main/fidenzaroundabout.html`

### `games/votopoli/privacy.html`
- `games/votopoli/index.html`

### `games/warship/legacy-warship.html`
- `games/warship/index.html`

### `games/watermelon-classic/index.html`
- `index.html`

### `games/watermelon-fall.html`
- `games/watermelon-fall/index.html`

### `games/watermelon-fall/index.html`
- `index.html`

### `games/watermelon.html`
- `games/watermelon-classic/index.html`

### `games/watermelon/legacy-watermelon-fall.html`
- `games/watermelon/index.html`

### `games/watermelon/legacy-watermelon.html`
- `games/watermelon/index.html`

### `games/webgl-diagnostics/legacy-webgl_diagnostics.html`
- `games/webgl-diagnostics/index.html`

### `games/wikipedia/index.html`
- `games/index.html`

### `games/wikipedia/legacy-wikipedia_game.html`
- `games/wikipedia/index.html`

### `games/wikithriving/site/privacy.html`
- `games/wikithriving/site/index.html`

### `games/yatzee-solo/index.html`
- `index.html`

### `games/yatzee-solo/legacy-yatzee_solo.html`
- `games/yatzee-solo/index.html`

### `games/yatzee/index.html`
- `index.html`

### `games/yatzee/legacy-yatzee.html`
- `games/yatzee/index.html`

### `index.html`
- `games.html`
- `pages/content/movies.html`
- `pages/content/music.html`
- `pages/content/photobook.html`
- `pages/content/poem.html`
- `pages/content/tvshows.html`
- `pages/main/archive.html`
- `pages/main/blog.html`
- `pages/main/books.html`
- `pages/main/cookie-policy.html`
- `pages/main/life_comic.html`
- `pages/main/piano.html`
- `pages/main/privacy-policy.html`
- `pages/main/quantum_lab.html`
- `pages/main/quotes.html`
- `pages/main/recipe.html`
- `pages/main/shop.html`
- `pages/main/technology.html`
- `pages/main/the.html`
- `projects.html`
- `projects/air-canvas/index.html`
- `projects/atlas/index.html`
- `projects/audio-transcriber/index.html`
- `projects/payamazadi/index.html`
- `projects/rsa/index.html`
- `projects/tiny-ai/index.html`
- `projects/vision-lab/index.html`
- `projects/vola-pwa/index.html`

### `pages/content/poem.html`
- `index.html`

### `pages/experiments/aviator_viper.html`
- `index.html`

### `pages/experiments/easter_egg.html`
- `index.html`

### `pages/main/archive.html`
- `games/3dgame/index.html`
- `games/animal-crossing/index.html`
- `games/city-sim/index.html`
- `games/pinball-classic/index.html`
- `games/pokedex-classic/index.html`
- `games/pokemon-classic/index.html`
- `games/referendum-game/index.html`
- `index.html`
- `pages/experiments/8.html`
- `pages/experiments/aviator_viper.html`
- `pages/experiments/easter_egg.html`
- `pages/main/luca_quiz.html`
- `pages/main/places.html`
- `pages/main/quantum_lab.html`
- `projects/beer/index.html`
- `projects/quizzes/engineer_quiz.html`
- `projects/quizzes/quiz01.html`
- `projects/quizzes/quiz02.html`
- `projects/quizzes/quiz_fastfood.html`
- `projects/quizzes/taylor_swift_quiz.html`
- `projects/text-image-researcher/index.html`

### `pages/main/blog.html`
- `index.html`

### `pages/main/cookie-policy.html`
- `index.html`

### `pages/main/fidenzaroundabout.html`
- `pages/main/visualnovels.html`

### `pages/main/life_comic.html`
- `index.html`

### `pages/main/offline.html`
- `index.html`

### `pages/main/pinball.html`
- `games/pinball-classic/index.html`

### `pages/main/places.html`
- `index.html`

### `pages/main/pokedex.html`
- `games/pokedex-classic/index.html`

### `pages/main/pokemon.html`
- `games/pokemon-classic/index.html`

### `pages/main/privacy-policy.html`
- `index.html`

### `pages/main/python.html`
- `index.html`

### `pages/main/quantum_lab.html`
- `index.html`

### `pages/main/technology.html`
- `index.html`
- `projects/air-canvas/index.html`
- `projects/gba-emulator/index.html`
- `projects/kinect/index.html`
- `projects/morse/index.html`
- `projects/sierpinski/index.html`
- `projects/walkietalkie/index.html`

### `pages/main/timeline.html`
- `index.html`

### `pages/main/visualnovels.html`
- `games/visual-novels/index.html`

### `projects/ai-colorizer/index.html`
- `index.html`

### `projects/apollo-11/index.html`
- `projects.html`

### `projects/armochromy/index.html`
- `index.html`

### `projects/atlas/index.html`
- `projects.html`

### `projects/atlas/legacy-gps.html`
- `projects/atlas/index.html`

### `projects/atlas/legacy-world_weather.html`
- `projects/atlas/index.html`

### `projects/gba-emulator/index.html`
- `index.html`

### `projects/kinect/index.html`
- `index.html`

### `projects/kinect/offline.html`
- `projects/kinect/index.html`

### `projects/nails/index.html`
- `index.html`

### `projects/nba_simulator/legacy-nba_simulator.html`
- `projects/nba_simulator/index.html`

### `projects/nba_simulator/offline.html`
- `projects/nba_simulator/index.html`

### `projects/neural-style-transfer/offline.html`
- `projects/neural-style-transfer/index.html`

### `projects/offline-editor-studio/index.html`
- `index.html`

### `projects/offline-library/index.html`
- `index.html`

### `projects/privacy-audit/index.html`
- `index.html`

### `projects/qr-studio/index.html`
- `projects.html`

### `projects/qr-studio/legacy-create_qrcode.html`
- `projects/qr-studio/index.html`

### `projects/qr-studio/legacy-qrcode.html`
- `projects/qr-studio/index.html`

### `projects/quiz-lab/index.html`
- `projects.html`

### `projects/radio/index.html`
- `index.html`

### `projects/radio/legacy-radio.html`
- `projects/radio/index.html`

### `projects/rock-paper-scissors/index.html`
- `pages/main/technology.html`

### `projects/sierpinski/index.html`
- `pages/main/technology.html`

### `projects/slot-machine/index.html`
- `projects.html`

### `projects/smile_detection/index.html`
- `projects/vision-lab/index.html`

### `projects/text-lab/index.html`
- `projects.html`

### `projects/text-lab/legacy-text_recognition.html`
- `projects/text-lab/index.html`

### `projects/tracker/index.html`
- `index.html`

### `projects/tracker/legacy-tracker.html`
- `projects/tracker/index.html`

### `projects/virtual-drums/index.html`
- `pages/main/technology.html`

### `projects/virtual-puppeteer/index.html`
- `pages/main/technology.html`

### `projects/vision-lab/index.html`
- `projects.html`

### `projects/vision-lab/legacy-facemesh_camera.html`
- `projects/vision-lab/index.html`

### `projects/vision-lab/legacy-smile_detection.html`
- `projects/vision-lab/index.html`

### `projects/vite-carrere/privacy.html`
- `projects/vite-carrere/index.html`

## JavaScript-Generated Routes

| Source | Line | Raw target | Resolved target | Status |
|---|---:|---|---|---|
| `assets/js/catalog-data.js` | 24 | `projects/beer/index.html` | `projects/beer/index.html` | valid |
| `assets/js/catalog-data.js` | 25 | `projects/due-lumi/index.html` | `projects/due-lumi/index.html` | valid |
| `assets/js/catalog-data.js` | 26 | `projects/quizzes/engineer_quiz.html` | `projects/quizzes/engineer_quiz.html` | valid |
| `assets/js/catalog-data.js` | 27 | `projects/quizzes/luca_quiz.html` | `projects/quizzes/luca_quiz.html` | valid |
| `assets/js/catalog-data.js` | 28 | `projects/quizzes/quiz01.html` | `projects/quizzes/quiz01.html` | valid |
| `assets/js/catalog-data.js` | 29 | `projects/quizzes/quiz02.html` | `projects/quizzes/quiz02.html` | valid |
| `assets/js/catalog-data.js` | 30 | `projects/quizzes/quiz_fastfood.html` | `projects/quizzes/quiz_fastfood.html` | valid |
| `assets/js/catalog-data.js` | 31 | `projects/quizzes/taylor_swift_quiz.html` | `projects/quizzes/taylor_swift_quiz.html` | valid |
| `assets/js/catalog-data.js` | 32 | `projects/quizzes/milanese_quiz.html` | `projects/quizzes/milanese_quiz.html` | valid |
| `assets/js/catalog-data.js` | 33 | `projects/quizzes/toothpaste_quiz.html` | `projects/quizzes/toothpaste_quiz.html` | valid |
| `assets/js/catalog-data.js` | 34 | `projects/quiz-lab/index.html` | `projects/quiz-lab/index.html` | valid |
| `assets/js/catalog-data.js` | 35 | `projects/quizzes/pasta_quiz.html` | `projects/quizzes/pasta_quiz.html` | valid |
| `assets/js/catalog-data.js` | 36 | `projects/quizzes/gabbiano_quiz.html` | `projects/quizzes/gabbiano_quiz.html` | valid |
| `assets/js/catalog-data.js` | 37 | `projects/quizzes/cinghiale_quiz.html` | `projects/quizzes/cinghiale_quiz.html` | valid |
| `assets/js/catalog-data.js` | 38 | `projects/quizzes/notifica_quiz.html` | `projects/quizzes/notifica_quiz.html` | valid |
| `assets/js/catalog-data.js` | 39 | `projects/phonetic-transcriber/index.html` | `projects/phonetic-transcriber/index.html` | valid |
| `assets/js/catalog-data.js` | 40 | `projects/neural-vision/index.html` | `projects/neural-vision/index.html` | valid |
| `assets/js/catalog-data.js` | 41 | `projects/neural-style-transfer/index.html` | `projects/neural-style-transfer/index.html` | valid |
| `assets/js/catalog-data.js` | 42 | `projects/audio-neural-analysis/index.html` | `projects/audio-neural-analysis/index.html` | valid |
| `assets/js/catalog-data.js` | 43 | `projects/quizzes/ikea_quiz.html` | `projects/quizzes/ikea_quiz.html` | valid |
| `assets/js/catalog-data.js` | 44 | `projects/quizzes/collega_quiz.html` | `projects/quizzes/collega_quiz.html` | valid |
| `assets/js/catalog-data.js` | 45 | `projects/quizzes/treno_quiz.html` | `projects/quizzes/treno_quiz.html` | valid |
| `assets/js/catalog-data.js` | 46 | `projects/quizzes/scusa_quiz.html` | `projects/quizzes/scusa_quiz.html` | valid |
| `assets/js/catalog-data.js` | 47 | `projects/quizzes/gelato_quiz.html` | `projects/quizzes/gelato_quiz.html` | valid |
| `assets/js/catalog-data.js` | 48 | `projects/quizzes/iq_quiz.html` | `projects/quizzes/iq_quiz.html` | valid |
| `assets/js/catalog-data.js` | 49 | `projects/slot-machine/index.html` | `projects/slot-machine/index.html` | valid |
| `assets/js/catalog-data.js` | 50 | `projects/rave/index.html` | `projects/rave/index.html` | valid |
| `assets/js/catalog-data.js` | 51 | `projects/shhh-reader/index.html` | `projects/shhh-reader/index.html` | valid |
| `assets/js/catalog-data.js` | 52 | `projects/text-image-researcher/index.html` | `projects/text-image-researcher/index.html` | valid |
| `assets/js/catalog-data.js` | 53 | `projects/vola-pwa/index.html` | `projects/vola-pwa/index.html` | valid |
| `assets/js/catalog-data.js` | 54 | `projects/flashcards-studio/index.html` | `projects/flashcards-studio/index.html` | valid |
| `assets/js/catalog-data.js` | 55 | `projects/focus-lens-privacy-dashboard/index.html` | `projects/focus-lens-privacy-dashboard/index.html` | valid |
| `assets/js/catalog-data.js` | 56 | `projects/hourly-wellness-widget/index.html` | `projects/hourly-wellness-widget/index.html` | valid |
| `assets/js/catalog-data.js` | 57 | `projects/offline-editor-studio/index.html` | `projects/offline-editor-studio/index.html` | valid |
| `assets/js/catalog-data.js` | 58 | `projects/offline-library/index.html` | `projects/offline-library/index.html` | valid |
| `assets/js/catalog-data.js` | 59 | `projects/privacy-audit/index.html` | `projects/privacy-audit/index.html` | valid |
| `assets/js/catalog-data.js` | 60 | `projects/puzzle-scale/index.html` | `projects/puzzle-scale/index.html` | valid |
| `assets/js/catalog-data.js` | 61 | `projects/silent-journal/index.html` | `projects/silent-journal/index.html` | valid |
| `assets/js/catalog-data.js` | 62 | `projects/silent-voice-reader/index.html` | `projects/silent-voice-reader/index.html` | valid |
| `assets/js/catalog-data.js` | 63 | `projects/solar-system-tracker/index.html` | `projects/solar-system-tracker/index.html` | valid |
| `assets/js/catalog-data.js` | 64 | `projects/soundscape-studio/index.html` | `projects/soundscape-studio/index.html` | valid |
| `assets/js/catalog-data.js` | 65 | `projects/verso-il-17/index.html` | `projects/verso-il-17/index.html` | valid |
| `assets/js/catalog-data.js` | 66 | `projects/countdown-to-san-dunen/index.html` | `projects/countdown-to-san-dunen/index.html` | valid |
| `assets/js/catalog-data.js` | 67 | `projects/web-linux/index.html` | `projects/web-linux/index.html` | valid |
| `assets/js/catalog-data.js` | 68 | `projects/quizzes/panettone_quiz.html` | `projects/quizzes/panettone_quiz.html` | valid |
| `assets/js/catalog-data.js` | 76 | `games/esposta/index.html` | `games/esposta/index.html` | valid |
| `assets/js/catalog-data.js` | 77 | `games/tramonto/index.html` | `games/tramonto/index.html` | valid |
| `assets/js/catalog-data.js` | 78 | `games/de-rerum-gatta/index.html` | `games/de-rerum-gatta/index.html` | valid |
| `assets/js/catalog-data.js` | 79 | `games/zero-assoluto/index.html` | `games/zero-assoluto/index.html` | valid |
| `assets/js/catalog-data.js` | 80 | `games/coverage-galaxy/site/index.html` | `games/coverage-galaxy/site/index.html` | valid |
| `assets/js/catalog-data.js` | 81 | `games/wikithriving/site/index.html` | `games/wikithriving/site/index.html` | valid |
| `assets/js/catalog-data.js` | 82 | `games/quotesmith/` | `games/quotesmith/index.html` | valid |
| `assets/js/catalog-data.js` | 83 | `games/kalaazu/` | `games/kalaazu/index.html` | valid |
| `assets/js/catalog-data.js` | 84 | `games/arrowmatic/index.html` | `games/arrowmatic/index.html` | valid |
| `assets/js/catalog-data.js` | 85 | `games/csi-fidenza-christmas-dlc/index.html` | `games/csi-fidenza-christmas-dlc/index.html` | valid |
| `assets/js/catalog-data.js` | 86 | `games/csi-fidenza-christmas-dlc-02/index.html` | `games/csi-fidenza-christmas-dlc-02/index.html` | valid |
| `assets/js/catalog-data.js` | 87 | `games/csi-milano/` | `games/csi-milano/index.html` | valid |
| `assets/js/catalog-data.js` | 88 | `games/csi-fidenza/` | `games/csi-fidenza/index.html` | valid |
| `assets/js/catalog-data.js` | 89 | `games/sinibbio/` | `games/sinibbio/index.html` | valid |
| `assets/js/catalog-data.js` | 90 | `games/math-duel/index.html` | `games/math-duel/index.html` | valid |
| `assets/js/catalog-data.js` | 91 | `games/cards/index.html` | `games/cards/index.html` | valid |
| `assets/js/catalog-data.js` | 92 | `games/uno/index.html` | `games/uno/index.html` | valid |
| `assets/js/catalog-data.js` | 93 | `games/drinking-game/index.html` | `games/drinking-game/index.html` | valid |
| `assets/js/catalog-data.js` | 94 | `games/briscola/index.html` | `games/briscola/index.html` | valid |
| `assets/js/catalog-data.js` | 95 | `games/scopa/index.html` | `games/scopa/index.html` | valid |
| `assets/js/catalog-data.js` | 96 | `games/guess-who/index.html` | `games/guess-who/index.html` | valid |
| `assets/js/catalog-data.js` | 97 | `games/shogi/index.html` | `games/shogi/index.html` | valid |
| `assets/js/catalog-data.js` | 98 | `games/italy-flight-sim/index.html` | `games/italy-flight-sim/index.html` | valid |
| `assets/js/catalog-data.js` | 99 | `games/plane/index.html` | `games/plane/index.html` | valid |
| `assets/js/catalog-data.js` | 100 | `games/aviator/index.html` | `games/aviator/index.html` | valid |
| `assets/js/catalog-data.js` | 101 | `games/shotmind/index.html` | `games/shotmind/index.html` | valid |
| `assets/js/catalog-data.js` | 102 | `games/cdd/index.html` | `games/cdd/index.html` | valid |
| `assets/js/catalog-data.js` | 103 | `games/brawl-stars/index.html` | `games/brawl-stars/index.html` | valid |
| `assets/js/catalog-data.js` | 104 | `games/tower-defense/index.html` | `games/tower-defense/index.html` | valid |
| `assets/js/catalog-data.js` | 105 | `games/forza4/index.html` | `games/forza4/index.html` | valid |
| `assets/js/catalog-data.js` | 106 | `games/snake/index.html` | `games/snake/index.html` | valid |
| `assets/js/catalog-data.js` | 107 | `games/rpg/index.html` | `games/rpg/index.html` | valid |
| `assets/js/catalog-data.js` | 108 | `games/mobile-air-hockey/index.html` | `games/mobile-air-hockey/index.html` | valid |
| `assets/js/catalog-data.js` | 109 | `games/memory/index.html` | `games/memory/index.html` | valid |
| `assets/js/catalog-data.js` | 110 | `games/slot-collect/index.html` | `games/slot-collect/index.html` | valid |
| `assets/js/catalog-data.js` | 111 | `games/geom_dash/index.html` | `games/geom_dash/index.html` | valid |
| `assets/js/catalog-data.js` | 112 | `games/space-invaders/index.html` | `games/space-invaders/index.html` | valid |
| `assets/js/catalog-data.js` | 113 | `games/space-universe/index.html` | `games/space-universe/index.html` | valid |
| `assets/js/catalog-data.js` | 114 | `games/blackhole-orbit/index.html` | `games/blackhole-orbit/index.html` | valid |
| `assets/js/catalog-data.js` | 115 | `games/tetris/index.html` | `games/tetris/index.html` | valid |
| `assets/js/catalog-data.js` | 116 | `games/poker/index.html` | `games/poker/index.html` | valid |
| `assets/js/catalog-data.js` | 117 | `games/blackjack/index.html` | `games/blackjack/index.html` | valid |
| `assets/js/catalog-data.js` | 118 | `games/chess/index.html` | `games/chess/index.html` | valid |
| `assets/js/catalog-data.js` | 119 | `games/card-games/public/index.html` | `games/card-games/public/index.html` | valid |
| `assets/js/catalog-data.js` | 120 | `games/dama/index.html` | `games/dama/index.html` | valid |
| `assets/js/catalog-data.js` | 121 | `games/backgammon/index.html` | `games/backgammon/index.html` | valid |
| `assets/js/catalog-data.js` | 122 | `games/goose/index.html` | `games/goose/index.html` | valid |
| `assets/js/catalog-data.js` | 123 | `games/flappy-bird/index.html` | `games/flappy-bird/index.html` | valid |
| `assets/js/catalog-data.js` | 124 | `games/wikipedia/index.html` | `games/wikipedia/index.html` | valid |
| `assets/js/catalog-data.js` | 125 | `games/pixel-runner/index.html` | `games/pixel-runner/index.html` | valid |
| `assets/js/catalog-data.js` | 126 | `games/tamagotchi/index.html` | `games/tamagotchi/index.html` | valid |
| `assets/js/catalog-data.js` | 127 | `games/coloring_book/index.html` | `games/coloring_book/index.html` | valid |
| `assets/js/catalog-data.js` | 128 | `games/quantum-tictactoe/index.html` | `games/quantum-tictactoe/index.html` | valid |
| `assets/js/catalog-data.js` | 129 | `games/quantum-forge/index.html` | `games/quantum-forge/index.html` | valid |
| `assets/js/catalog-data.js` | 130 | `games/tokyo/index.html` | `games/tokyo/index.html` | valid |
| `assets/js/catalog-data.js` | 131 | `games/pinball-classic/index.html` | `games/pinball-classic/index.html` | valid |
| `assets/js/catalog-data.js` | 132 | `games/clash-royale/index.html` | `games/clash-royale/index.html` | valid |
| `assets/js/catalog-data.js` | 133 | `games/pokedex-classic/index.html` | `games/pokedex-classic/index.html` | valid |
| `assets/js/catalog-data.js` | 134 | `games/pokemon-classic/index.html` | `games/pokemon-classic/index.html` | valid |
| `assets/js/catalog-data.js` | 135 | `games/yatzee/index.html` | `games/yatzee/index.html` | valid |
| `assets/js/catalog-data.js` | 136 | `games/yatzee-solo/index.html` | `games/yatzee-solo/index.html` | valid |
| `assets/js/catalog-data.js` | 137 | `games/orlog/index.html` | `games/orlog/index.html` | valid |
| `assets/js/catalog-data.js` | 138 | `games/taboo/index.html` | `games/taboo/index.html` | valid |
| `assets/js/catalog-data.js` | 139 | `games/visual-novels/index.html` | `games/visual-novels/index.html` | valid |
| `assets/js/catalog-data.js` | 140 | `pages/content/karamazov.html` | `pages/content/karamazov.html` | valid |
| `assets/js/catalog-data.js` | 141 | `games/kart/index.html` | `games/kart/index.html` | valid |
| `assets/js/catalog-data.js` | 142 | `games/battleship/index.html` | `games/battleship/index.html` | valid |
| `assets/js/catalog-data.js` | 143 | `games/warship/index.html` | `games/warship/index.html` | valid |
| `assets/js/catalog-data.js` | 144 | `games/battlelands-royale/index.html` | `games/battlelands-royale/index.html` | valid |
| `assets/js/catalog-data.js` | 145 | `games/arena-royale-2/index.html` | `games/arena-royale-2/index.html` | valid |
| `assets/js/catalog-data.js` | 146 | `games/echoes-of-the-last-dawn/index.html` | `games/echoes-of-the-last-dawn/index.html` | valid |
| `assets/js/catalog-data.js` | 147 | `games/coop-game/index.html` | `games/coop-game/index.html` | valid |
| `assets/js/catalog-data.js` | 148 | `games/friends-tycoon/index.html` | `games/friends-tycoon/index.html` | valid |
| `assets/js/catalog-data.js` | 149 | `games/orto-magico/index.html` | `games/orto-magico/index.html` | valid |
| `assets/js/catalog-data.js` | 150 | `games/pokopia-clone/index.html` | `games/pokopia-clone/index.html` | valid |
| `assets/js/catalog-data.js` | 151 | `games/3dgame/index.html` | `games/3dgame/index.html` | valid |
| `assets/js/catalog-data.js` | 152 | `games/airhockey/index.html` | `games/airhockey/index.html` | valid |
| `assets/js/catalog-data.js` | 153 | `games/animal-crossing/index.html` | `games/animal-crossing/index.html` | valid |
| `assets/js/catalog-data.js` | 154 | `games/city-sim/index.html` | `games/city-sim/index.html` | valid |
| `assets/js/catalog-data.js` | 155 | `games/pinball/index.html` | `games/pinball/index.html` | valid |
| `assets/js/catalog-data.js` | 156 | `games/pokedex/index.html` | `games/pokedex/index.html` | valid |
| `assets/js/catalog-data.js` | 157 | `games/pokemon/index.html` | `games/pokemon/index.html` | valid |
| `assets/js/catalog-data.js` | 158 | `games/referendum-game/index.html` | `games/referendum-game/index.html` | valid |
| `assets/js/catalog-data.js` | 159 | `games/slot/index.html` | `games/slot/index.html` | valid |
| `assets/js/catalog-data.js` | 160 | `games/warorbit/index.html` | `games/warorbit/index.html` | valid |
| `assets/js/catalog-data.js` | 161 | `games/watermelon.html` | `games/watermelon.html` | valid |
| `assets/js/catalog-data.js` | 162 | `games/watermelon-fall.html` | `games/watermelon-fall.html` | valid |
| `assets/js/catalog-data.js` | 163 | `games/watermelon/index.html` | `games/watermelon/index.html` | valid |
| `assets/js/catalog-data.js` | 164 | `games/steel-waves/index.html` | `games/steel-waves/index.html` | valid |
| `assets/js/catalog-data.js` | 165 | `games/rivincita/index.html` | `games/rivincita/index.html` | valid |
| `assets/js/catalog-data.js` | 166 | `games/miraggio-hotel/index.html` | `games/miraggio-hotel/index.html` | valid |
| `assets/js/catalog-data.js` | 167 | `games/stanza9/index.html` | `games/stanza9/index.html` | valid |
| `assets/js/catalog-data.js` | 168 | `games/webgl-diagnostics/index.html` | `games/webgl-diagnostics/index.html` | valid |
| `assets/js/catalog-data.js` | 169 | `games/arcade-lab/index.html` | `games/arcade-lab/index.html` | valid |
| `assets/js/catalog-data.js` | 170 | `games/farkle/index.html` | `games/farkle/index.html` | valid |
| `assets/js/catalog-data.js` | 171 | `games/regno-di-moneta/index.html` | `games/regno-di-moneta/index.html` | valid |
| `assets/js/catalog-data.js` | 172 | `games/petali-parametri/index.html` | `games/petali-parametri/index.html` | valid |
| `assets/js/catalog-data.js` | 173 | `games/scarlius/index.html` | `games/scarlius/index.html` | valid |
| `assets/js/catalog-data.js` | 174 | `games/scalpel/index.html` | `games/scalpel/index.html` | valid |
| `assets/js/catalog-data.js` | 175 | `games/votopoli/index.html` | `games/votopoli/index.html` | valid |
| `assets/js/catalog-data.js` | 176 | `games/mystic-quest/index.html` | `games/mystic-quest/index.html` | valid |
| `assets/js/catalog-data.js` | 177 | `games/scalpel-2/index.html` | `games/scalpel-2/index.html` | valid |
| `assets/js/catalog-data.js` | 178 | `games/voidbound/index.html` | `games/voidbound/index.html` | valid |
| `assets/js/catalog-data.js` | 179 | `games/precision-skating-game/index.html` | `games/precision-skating-game/index.html` | valid |
| `assets/js/catalog-data.js` | 180 | `games/miraggio-pass/index.html` | `games/miraggio-pass/index.html` | valid |
| `assets/js/projects-data.js` | 9 | `projects/atlas/` | `projects/atlas/index.html` | valid |
| `assets/js/projects-data.js` | 18 | `projects/payamazadi/index.html` | `projects/payamazadi/index.html` | valid |
| `assets/js/projects-data.js` | 27 | `projects/tiny-ai/index.html` | `projects/tiny-ai/index.html` | valid |
| `assets/js/projects-data.js` | 36 | `projects/audio-transcriber/index.html` | `projects/audio-transcriber/index.html` | valid |
| `assets/js/projects-data.js` | 45 | `projects/radio/legacy-radio.html` | `projects/radio/legacy-radio.html` | valid |
| `assets/js/projects-data.js` | 54 | `pages/main/python.html` | `pages/main/python.html` | valid |
| `assets/js/projects-data.js` | 63 | `projects/scraping/index.html` | `projects/scraping/index.html` | valid |
| `assets/js/projects-data.js` | 72 | `projects/seconds-distance/index.html` | `projects/seconds-distance/index.html` | valid |
| `assets/js/projects-data.js` | 81 | `projects/streaming/index.html` | `projects/streaming/index.html` | valid |
| `assets/js/projects-data.js` | 90 | `projects/sankey/index.html` | `projects/sankey/index.html` | valid |
| `assets/js/projects-data.js` | 99 | `projects/rsa/index.html` | `projects/rsa/index.html` | valid |
| `assets/js/projects-data.js` | 108 | `projects/walkietalkie/index.html` | `projects/walkietalkie/index.html` | valid |
| `assets/js/projects-data.js` | 117 | `projects/vision-lab/` | `projects/vision-lab/index.html` | valid |
| `assets/js/projects-data.js` | 126 | `projects/camera-compression/index.html` | `projects/camera-compression/index.html` | valid |
| `assets/js/projects-data.js` | 135 | `projects/camera-sentinel/index.html` | `projects/camera-sentinel/index.html` | valid |
| `assets/js/projects-data.js` | 144 | `projects/face-compare/index.html` | `projects/face-compare/index.html` | valid |
| `assets/js/projects-data.js` | 153 | `projects/armochromy/index.html` | `projects/armochromy/index.html` | valid |
| `assets/js/projects-data.js` | 162 | `projects/mesh-camera2/index.html` | `projects/mesh-camera2/index.html` | valid |
| `assets/js/projects-data.js` | 171 | `projects/morse/index.html` | `projects/morse/index.html` | valid |
| `assets/js/projects-data.js` | 180 | `projects/longest-midi/index.html` | `projects/longest-midi/index.html` | valid |
| `assets/js/projects-data.js` | 189 | `projects/reader/index.html` | `projects/reader/index.html` | valid |
| `assets/js/projects-data.js` | 198 | `projects/iqos-timer/index.html` | `projects/iqos-timer/index.html` | valid |
| `assets/js/projects-data.js` | 207 | `projects/draw/index.html` | `projects/draw/index.html` | valid |
| `assets/js/projects-data.js` | 216 | `projects/fashion-detect/index.html` | `projects/fashion-detect/index.html` | valid |
| `assets/js/projects-data.js` | 225 | `projects/workout/index.html` | `projects/workout/index.html` | valid |
| `assets/js/projects-data.js` | 234 | `projects/sierpinski/index.html` | `projects/sierpinski/index.html` | valid |
| `assets/js/projects-data.js` | 243 | `projects/people-simulator/index.html` | `projects/people-simulator/index.html` | valid |
| `assets/js/projects-data.js` | 252 | `projects/tracker/legacy-tracker.html` | `projects/tracker/legacy-tracker.html` | valid |
| `assets/js/projects-data.js` | 261 | `projects/kinect/index.html` | `projects/kinect/index.html` | valid |
| `assets/js/projects-data.js` | 270 | `projects/kinect-2/index.html` | `projects/kinect-2/index.html` | valid |
| `assets/js/projects-data.js` | 279 | `projects/air-canvas/index.html` | `projects/air-canvas/index.html` | valid |
| `assets/js/projects-data.js` | 288 | `projects/rock-paper-scissors/index.html` | `projects/rock-paper-scissors/index.html` | valid |
| `assets/js/projects-data.js` | 297 | `projects/virtual-puppeteer/index.html` | `projects/virtual-puppeteer/index.html` | valid |
| `assets/js/projects-data.js` | 306 | `projects/virtual-drums/index.html` | `projects/virtual-drums/index.html` | valid |
| `assets/js/projects-data.js` | 315 | `projects/qr-studio/` | `projects/qr-studio/index.html` | valid |
| `assets/js/projects-data.js` | 324 | `projects/birds/index.html` | `projects/birds/index.html` | valid |
| `assets/js/projects-data.js` | 333 | `projects/croquet/index.html` | `projects/croquet/index.html` | valid |
| `assets/js/projects-data.js` | 342 | `projects/lyrics-finder/index.html` | `projects/lyrics-finder/index.html` | valid |
| `assets/js/projects-data.js` | 351 | `projects/nba_simulator/index.html` | `projects/nba_simulator/index.html` | valid |
| `assets/js/projects-data.js` | 360 | `projects/horse-simulator/index.html` | `projects/horse-simulator/index.html` | valid |
| `assets/js/projects-data.js` | 369 | `projects/seriea-simulator/index.html` | `projects/seriea-simulator/index.html` | valid |
| `assets/js/projects-data.js` | 378 | `projects/fantapanchina/index.html` | `projects/fantapanchina/index.html` | valid |
| `assets/js/projects-data.js` | 387 | `projects/vite-carrere/index.html` | `projects/vite-carrere/index.html` | valid |
| `assets/js/projects-data.js` | 396 | `games/slot-collect/index.html` | `games/slot-collect/index.html` | valid |
| `assets/js/projects-data.js` | 405 | `projects/text-lab/` | `projects/text-lab/index.html` | valid |
| `assets/js/projects-data.js` | 414 | `projects/ai-colorizer/index.html` | `projects/ai-colorizer/index.html` | valid |
| `assets/js/projects-data.js` | 423 | `projects/coloring/index.html` | `projects/coloring/index.html` | valid |
| `assets/js/projects-data.js` | 432 | `projects/nails/index.html` | `projects/nails/index.html` | valid |
| `assets/js/projects-data.js` | 441 | `projects/gba-emulator/index.html` | `projects/gba-emulator/index.html` | valid |
| `assets/js/projects-data.js` | 450 | `projects/quiz-lab/index.html` | `projects/quiz-lab/index.html` | valid |
| `assets/js/projects-data.js` | 459 | `projects/daisy-field/index.html` | `projects/daisy-field/index.html` | valid |
| `assets/js/projects-data.js` | 468 | `book-writer/index.html` | `book-writer/index.html` | valid |
| `assets/js/projects-data.js` | 477 | `projects/ai-chat/index.html` | `projects/ai-chat/index.html` | valid |
| `assets/js/projects-data.js` | 486 | `projects/ecommerce/index.html` | `projects/ecommerce/index.html` | valid |
| `assets/js/projects-data.js` | 495 | `projects/file-manager/index.html` | `projects/file-manager/index.html` | valid |
| `assets/js/projects-data.js` | 504 | `projects/genetic-art/legacy-genetic-art.html` | `projects/genetic-art/legacy-genetic-art.html` | valid |
| `assets/js/projects-data.js` | 513 | `projects/tsne-3d/legacy-tsne-3d.html` | `projects/tsne-3d/legacy-tsne-3d.html` | valid |
| `assets/js/projects-data.js` | 522 | `projects/face-lab/legacy-face-lab.html` | `projects/face-lab/legacy-face-lab.html` | valid |
| `assets/js/projects-data.js` | 531 | `projects/neural-flock/legacy-neural-flock.html` | `projects/neural-flock/legacy-neural-flock.html` | valid |
| `assets/js/projects-data.js` | 540 | `projects/alcohol-tracker/index.html` | `projects/alcohol-tracker/index.html` | valid |
| `assets/js/projects-data.js` | 549 | `projects/pocket-wild/legacy-pocket-wild.html` | `projects/pocket-wild/legacy-pocket-wild.html` | valid |
| `assets/js/projects-data.js` | 558 | `projects/apollo-11/index.html` | `projects/apollo-11/index.html` | valid |
| `assets/js/projects-data.js` | 567 | `projects/cello-browser/index.html` | `projects/cello-browser/index.html` | valid |
| `assets/js/projects-data.js` | 577 | `projects/cabriolo-5am/index.html` | `projects/cabriolo-5am/index.html` | valid |
| `assets/js/projects-data.js` | 586 | `projects/pi-pwa-wrapper/public/index.html` | `projects/pi-pwa-wrapper/public/index.html` | valid |
| `assets/js/projects-data.js` | 595 | `projects/road-to-paraguay/index.html` | `projects/road-to-paraguay/index.html` | valid |

## Broken or Inconsistent References

| Source | Line | Target | Status | Detail |
|---|---:|---|---|---|
| `games/shogi/index.html` | 22 | `../games/index.html` | **broken** | Target HTML file or directory index does not exist. |
| `games/tamagotchi/index.html` | 513 | `../webgl_diagnostics.html` | **broken** | Target HTML file or directory index does not exist. |
| `games/tower-defense/index.html` | 22 | `../games/index.html` | **broken** | Target HTML file or directory index does not exist. |
| `games/tower-defense/index.html` | 27 | `../games/index.html` | **broken** | Target HTML file or directory index does not exist. |
| `games/webgl-diagnostics/index.html` | 35 | `../tamagotchi.html` | **broken** | Target HTML file or directory index does not exist. |
| `games/wikipedia/index.html` | 16 | `../games/index.html` | **broken** | Target HTML file or directory index does not exist. |
| `games/wikipedia/index.html` | 21 | `../games/index.html` | **broken** | Target HTML file or directory index does not exist. |
| `index.html` | 285 | `./assets/CV_Gandolfi_Luca.pdf` | **broken** | Target HTML file or directory index does not exist. |
| `index.html` | 308 | `./assets/CV_Gandolfi_Luca.pdf` | **broken** | Target HTML file or directory index does not exist. |
| `index.html` | 591 | `./assets/CV_Gandolfi_Luca.pdf` | **broken** | Target HTML file or directory index does not exist. |
| `newsroom/site/template.html` | 29 | `{{SITE_URL}}` | **broken** | Target HTML file or directory index does not exist. |
| `pi-agents/dashboard/index.html` | 47 | `../tracker/index.json` | **broken** | Target HTML file or directory index does not exist. |
| `pi-agents/dashboard/index.html` | 48 | `../TRACEABILITY.md` | **broken** | Target HTML file or directory index does not exist. |
| `pi-agents/dashboard/index.html` | 49 | `../tracker/README.md` | **broken** | Target HTML file or directory index does not exist. |
| `pi-agents/dashboard/index.html` | 50 | `../README.md` | **broken** | Target HTML file or directory index does not exist. |
| `pi-agents/deploy/ambient-lock-widget/public/index.html` | 72 | `/app/` | **inconsistent** | Root-absolute path bypasses the GitHub Pages /portfolio/ prefix. |
| `pi-agents/deploy/ambient-lock-widget/public/index.html` | 134 | `/app/` | **inconsistent** | Root-absolute path bypasses the GitHub Pages /portfolio/ prefix. |
| `pixel-stretch-app/public/privacy.html` | 22 | `index.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/longest-midi/index.html` | 221 | `../../assets/midi/Vattene_amore.mid` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/cinghiale_quiz.html` | 41 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/collega_quiz.html` | 41 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/gabbiano_quiz.html` | 41 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/gelato_quiz.html` | 41 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/ikea_quiz.html` | 41 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/iq_quiz.html` | 59 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/luca_quiz.html` | 32 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/milanese_quiz.html` | 41 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/notifica_quiz.html` | 41 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/panettone_quiz.html` | 41 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/pasta_quiz.html` | 41 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/quiz01.html` | 45 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/quiz02.html` | 45 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/quiz_fastfood.html` | 53 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/scusa_quiz.html` | 41 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/stem-ai.html` | 5 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/stem-biology.html` | 5 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/stem-climate.html` | 5 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/stem-food.html` | 5 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/stem-logic.html` | 5 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/stem-math.html` | 5 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/stem-physics.html` | 5 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/stem-space.html` | 5 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/toothpaste_quiz.html` | 41 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/quizzes/treno_quiz.html` | 41 | `../quiz.html` | **broken** | Target HTML file or directory index does not exist. |
| `projects/shhh-reader/public/index.html` | 72 | `/app/` | **inconsistent** | Root-absolute path bypasses the GitHub Pages /portfolio/ prefix. |
| `projects/shhh-reader/public/index.html` | 134 | `/app/` | **inconsistent** | Root-absolute path bypasses the GitHub Pages /portfolio/ prefix. |

## Orphan Candidates

These files have no incoming HTML-to-HTML link in the scanned graph. Some are intentional direct-entry apps or build artifacts.

- `book-writer/index.html`
- `emberfall/client/index.html`
- `fantasy-manager/index.html`
- `games/3dgame/legacy-3dgame.html`
- `games/_kit/template/index.html`
- `games/airhockey/legacy-airhockey.html`
- `games/animal-crossing/legacy-animal_crossing.html`
- `games/arcade-lab/offline.html`
- `games/arena-royale-2/index.html`
- `games/arrowmatic/index.html`
- `games/aviator/legacy-aviator.html`
- `games/backgammon/legacy-backgammon.html`
- `games/battlelands-royale/legacy-battlelands_royale.html`
- `games/battleship/legacy-battleship.html`
- `games/blackhole-orbit/index.html`
- `games/blackjack/legacy-blackjack.html`
- `games/brawl-stars/legacy-brawl_stars.html`
- `games/briscola/legacy-briscola.html`
- `games/card-games/public/index.html`
- `games/cards/legacy-cards.html`
- `games/cdd/legacy-cdd.html`
- `games/chess/legacy-chess.html`
- `games/city-sim/legacy-city_sim.html`
- `games/clash-royale/legacy-clash_royale.html`
- `games/coloring_book/legacy-coloring_book.html`
- `games/coop-game/legacy-coop-game.html`
- `games/coverage-galaxy/index.html`
- `games/coverage-galaxy/site/index.html`
- `games/csi-fidenza-christmas-dlc-02/index.html`
- `games/csi-fidenza-christmas-dlc/index.html`
- `games/csi-fidenza/index.html`
- `games/csi-milano/index.html`
- `games/dama/legacy-dama.html`
- `games/de-rerum-gatta/index.html`
- `games/de-rerum-gatta/www/index.html`
- `games/drinking-game/legacy-drinking_game.html`
- `games/echoes-of-the-last-dawn/legacy-echoes-of-the-last-dawn.html`
- `games/echoes-of-the-last-dawn/www/index.html`
- `games/esposta/offline.html`
- `games/esposta/www/offline.html`
- `games/farkle/legacy-farkle.html`
- `games/flappy-bird/legacy-flappy_bird.html`
- `games/forza4/legacy-forza4.html`
- `games/friends-tycoon/legacy-friends-tycoon.html`
- `games/geom_dash/legacy-geom_dash.html`
- `games/goose/legacy-goose.html`
- `games/guess-who/legacy-guess_who.html`
- `games/italy-flight-sim/index.html`
- `games/kalaazu/index.html`
- `games/kart/legacy-kart.html`
- `games/math-duel/legacy-math_duel.html`
- `games/memory/legacy-memory.html`
- `games/miraggio-hotel/index.html`
- `games/miraggio-pass/index.html`
- `games/mobile-air-hockey/legacy-mobile_air_hockey.html`
- `games/mystic-quest/legacy-mystic-quest.html`
- `games/orlog/legacy-orlog.html`
- `games/orto-magico/legacy-orto-magico.html`
- `games/orto-magico/www/index.html`
- `games/petali-parametri/index.html`
- `games/pinball/legacy-pinball.html`
- `games/pixel-runner/legacy-pixel_runner.html`
- `games/plane/legacy-plane.html`
- `games/pokedex/legacy-pokedex.html`
- `games/pokemon/legacy-pokemon.html`
- `games/poker/legacy-poker.html`
- `games/pokopia-clone/legacy-pokopia-clone.html`
- `games/precision-skating-game/index.html`
- `games/quantum-forge/legacy-quantum-forge.html`
- `games/quantum-tictactoe/legacy-quantum_tictactoe.html`
- `games/quotesmith/www/index.html`
- `games/regno-di-moneta/privacy.html`
- `games/rivincita/index.html`
- `games/rpg/legacy-rpg.html`
- `games/scalpel-2/index.html`
- `games/scalpel/index.html`
- `games/scarlius/index.html`
- `games/scopa/legacy-scopa.html`
- `games/shogi/legacy-shogi.html`
- `games/shotmind/index.html`
- `games/sinibbio/index.html`
- `games/slot-collect/legacy-slot_collect.html`
- `games/slot/legacy-slot.html`
- `games/slot/offline.html`
- `games/snake/legacy-snake.html`
- `games/snake/offline.html`
- `games/space-invaders/legacy-space_invaders.html`
- `games/space-universe/legacy-space_universe.html`
- `games/stanza9/index.html`
- `games/steel-waves/legacy-steel_waves.html`
- `games/taboo/legacy-taboo.html`
- `games/tamagotchi/legacy-tamagotchi.html`
- `games/tetris/legacy-tetris.html`
- `games/tokyo/legacy-tokyo.html`
- `games/tower-defense/legacy-tower_defense.html`
- `games/tramonto/index.html`
- `games/uno/legacy-UNO.html`
- `games/voidbound/index.html`
- `games/votopoli/privacy.html`
- `games/warorbit/index.html`
- `games/warship/legacy-warship.html`
- `games/watermelon-fall.html`
- `games/watermelon.html`
- `games/watermelon/legacy-watermelon-fall.html`
- `games/watermelon/legacy-watermelon.html`
- `games/webgl-diagnostics/legacy-webgl_diagnostics.html`
- `games/wikipedia/legacy-wikipedia_game.html`
- `games/wikithriving/site/privacy.html`
- `games/yatzee-solo/legacy-yatzee_solo.html`
- `games/yatzee/legacy-yatzee.html`
- `games/zero-assoluto/index.html`
- `newsroom/site/template.html`
- `pages/content/memes.html`
- `pages/content/proust_fixed.html`
- `pages/experiments/next-movie.html`
- `pages/main/offline.html`
- `pages/main/pinball.html`
- `pages/main/pokedex.html`
- `pages/main/pokemon.html`
- `pages/main/python.html`
- `pages/main/timeline.html`
- `pi-agents/dashboard/index.html`
- `pi-agents/deploy/ambient-lock-widget/index.html`
- `pi-agents/deploy/ambient-lock-widget/landing.html`
- `pi-agents/deploy/ambient-lock-widget/public/app.html`
- `pi-agents/deploy/ambient-lock-widget/public/index.html`
- `pi-agents/deploy/ambient-lock-widget/public/privacy.html`
- `pi-agents/deploy/mindful-break/index.html`
- `pi-agents/deploy/silent-canvas/index.html`
- `projects/_shared/_template.html`
- `projects/ai-chat/index.html`
- `projects/ai-colorizer/index.html`
- `projects/alcohol-tracker/index.html`
- `projects/apollo-11/index.html`
- `projects/armochromy/index.html`
- `projects/atlas/legacy-gps.html`
- `projects/atlas/legacy-world_weather.html`
- `projects/audio-editor-pwa/index.html`
- `projects/audio-editor-pwa/legacy-audio-editor-pwa.html`
- `projects/audio-neural-analysis/index.html`
- `projects/audio-neural-analysis/legacy-audio-neural-analysis.html`
- `projects/birds/index.html`
- `projects/cabriolo-5am/index.html`
- `projects/camera-compression/index.html`
- `projects/camera-sentinel/index.html`
- `projects/cello-browser/index.html`
- `projects/coloring/index.html`
- `projects/countdown-to-san-dunen/index.html`
- `projects/croquet/index.html`
- `projects/daisy-field/index.html`
- `projects/draw/index.html`
- `projects/due-lumi/index.html`
- `projects/due-lumi/legacy-due-lumi.html`
- `projects/ecommerce/index.html`
- `projects/face-compare/index.html`
- `projects/face-lab/index.html`
- `projects/face-lab/legacy-face-lab.html`
- `projects/fantapanchina/index.html`
- `projects/fashion-detect/index.html`
- `projects/file-manager/index.html`
- `projects/flashcards-studio/index.html`
- `projects/flashcards-studio/public/index.html`
- `projects/focus-lens-privacy-dashboard/index.html`
- `projects/focus-lens-privacy-dashboard/public/index.html`
- `projects/genetic-art/index.html`
- `projects/genetic-art/legacy-genetic-art.html`
- `projects/horse-simulator/index.html`
- `projects/hourly-wellness-widget/index.html`
- `projects/iqos-timer/index.html`
- `projects/kinect-2/index.html`
- `projects/kinect/offline.html`
- `projects/longest-midi/index.html`
- `projects/lyrics-finder/index.html`
- `projects/mesh-camera2/index.html`
- `projects/nails/index.html`
- `projects/nba_simulator/legacy-nba_simulator.html`
- `projects/nba_simulator/offline.html`
- `projects/neural-flock/index.html`
- `projects/neural-flock/legacy-neural-flock.html`
- `projects/neural-style-transfer/legacy-neural-style-transfer.html`
- `projects/neural-style-transfer/offline.html`
- `projects/neural-vision/index.html`
- `projects/neural-vision/legacy-neural-vision.html`
- `projects/offline-editor-studio/index.html`
- `projects/offline-library/index.html`
- `projects/people-simulator/index.html`
- `projects/phonetic-transcriber/index.html`
- `projects/phonetic-transcriber/legacy-phonetic-transcriber.html`
- `projects/pi-pwa-wrapper/public/index.html`
- `projects/pocket-wild/index.html`
- `projects/pocket-wild/legacy-pocket-wild.html`
- `projects/privacy-audit/index.html`
- `projects/puzzle-scale/index.html`
- `projects/puzzle-scale/public/index.html`
- `projects/qr-studio/legacy-create_qrcode.html`
- `projects/qr-studio/legacy-qrcode.html`
- `projects/quiz-lab/index.html`
- `projects/quizzes/cinghiale_quiz.html`
- `projects/quizzes/collega_quiz.html`
- `projects/quizzes/gabbiano_quiz.html`
- `projects/quizzes/gelato_quiz.html`
- `projects/quizzes/ikea_quiz.html`
- `projects/quizzes/iq_quiz.html`
- `projects/quizzes/luca_quiz.html`
- `projects/quizzes/milanese_quiz.html`
- `projects/quizzes/notifica_quiz.html`
- `projects/quizzes/panettone_quiz.html`
- `projects/quizzes/pasta_quiz.html`
- `projects/quizzes/scusa_quiz.html`
- `projects/quizzes/stem-ai.html`
- `projects/quizzes/stem-biology.html`
- `projects/quizzes/stem-climate.html`
- `projects/quizzes/stem-food.html`
- `projects/quizzes/stem-logic.html`
- `projects/quizzes/stem-math.html`
- `projects/quizzes/stem-physics.html`
- `projects/quizzes/stem-space.html`
- `projects/quizzes/toothpaste_quiz.html`
- `projects/quizzes/treno_quiz.html`
- `projects/radio/legacy-radio.html`
- `projects/radio/offline.html`
- `projects/rave/index.html`
- `projects/rave/legacy-rave.html`
- `projects/reader/index.html`
- `projects/road-to-paraguay/index.html`
- `projects/rock-paper-scissors/index.html`
- `projects/sankey/index.html`
- `projects/scraping/index.html`
- `projects/seconds-distance/index.html`
- `projects/seriea-simulator/index.html`
- `projects/shhh-reader/index.html`
- `projects/shhh-reader/landing.html`
- `projects/shhh-reader/legacy-shhh-reader.html`
- `projects/shhh-reader/public/app.html`
- `projects/shhh-reader/public/index.html`
- `projects/shhh-reader/public/privacy.html`
- `projects/silent-journal/index.html`
- `projects/silent-journal/public/index.html`
- `projects/silent-voice-reader/index.html`
- `projects/silent-voice-reader/public/index.html`
- `projects/slot-machine/index.html`
- `projects/smile_detection/index.html`
- `projects/solar-system-tracker/index.html`
- `projects/soundscape-studio/index.html`
- `projects/soundscape-studio/public/index.html`
- `projects/streaming/index.html`
- `projects/text-lab/legacy-text_recognition.html`
- `projects/tracker/legacy-tracker.html`
- `projects/tsne-3d/index.html`
- `projects/tsne-3d/legacy-tsne-3d.html`
- `projects/verso-il-17/index.html`
- `projects/virtual-drums/index.html`
- `projects/virtual-puppeteer/index.html`
- `projects/vision-lab/legacy-facemesh_camera.html`
- `projects/vision-lab/legacy-smile_detection.html`
- `projects/vite-carrere/privacy.html`
- `projects/web-linux/index.html`
- `projects/workout/index.html`
- `rpg_game/index.html`
- `tools/quality/playwright-report/index.html`

## Link Rules

- Use relative paths for all internal links; GitHub Pages serves this repository below `/portfolio/`.
- Prefer directory routes such as `games/quotesmith/` only when the directory contains `index.html`.
- Keep catalog routes in `assets/js/catalog-data.js` and project routes in `assets/js/projects-data.js`.
- Treat `mailto:`, `tel:`, CDN URLs, `data:`, and `chrome://` as explicit exceptions.
- Re-run the generator after adding or moving an HTML page.

## Related Reports

- `seo/reports/link-audit-report.md` - full repository SEO/link audit
- `seo/reports/orphan-pages.txt` - orphan detection from the SEO auditor
- `seo/reports/sitemap-robots-audit.md` - sitemap and robots checks
- `config/seo.json` - primary and sitemap route configuration

