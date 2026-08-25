# Site Architecture and Link Map

> Generated from the repository with `python3 tools/seo/generate_site_link_map.py`.
> HTML links are checked against the filesystem. External URLs and browser-special schemes are documented as exceptions.

## Summary

- HTML files scanned: 185
- HTML-to-HTML edges: 231
- JavaScript-generated catalog routes: 146
- Orphan candidates: 58
- Broken or inconsistent references: 5

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

### `book-writer/index.html`
- `index.html`

### `games.html`
- `games/arcade-lab/index.html`
- `games/quotesmith/index.html`
- `index.html`
- `lab/index.html`

### `games/CDD.html`
- `index.html`

### `games/airhockey.html`
- `index.html`

### `games/arcade-lab/index.html`
- `index.html`
- `lab/index.html`

### `games/aviator.html`
- `index.html`

### `games/blackjack.html`
- `index.html`

### `games/briscola.html`
- `index.html`

### `games/cards.html`
- `index.html`

### `games/chess.html`
- `index.html`

### `games/clash_royale.html`
- `index.html`

### `games/dama.html`
- `index.html`

### `games/geom_dash.html`
- `index.html`

### `games/goose.html`
- `index.html`

### `games/guess_who.html`
- `index.html`

### `games/index.html`
- `games/arcade-lab/index.html`
- `games/quotesmith/index.html`
- `index.html`
- `lab/index.html`

### `games/kart.html`
- `index.html`

### `games/math_duel.html`
- `index.html`

### `games/memory.html`
- `index.html`

### `games/mobile_air_hockey.html`
- `index.html`

### `games/plane.html`
- `index.html`

### `games/pokedex.html`
- `index.html`

### `games/pokemon.html`
- `index.html`

### `games/poker.html`
- `index.html`

### `games/quantum_tictactoe.html`
- `index.html`

### `games/quotesmith/index.html`
- `games/index.html`
- `index.html`

### `games/scopa.html`
- `index.html`

### `games/slot.html`
- `index.html`

### `games/snake.html`
- `index.html`

### `games/tamagotchi.html`
- `games/webgl_diagnostics.html`
- `index.html`

### `games/tokyo.html`
- `index.html`

### `games/watermelon.html`
- `index.html`

### `games/yatzee.html`
- `index.html`

### `games/yatzee_solo.html`
- `index.html`

### `index.html`
- `games.html`
- `games/CDD.html`
- `games/UNO.html`
- `games/airhockey.html`
- `games/aviator.html`
- `games/backgammon.html`
- `games/battlelands_royale.html`
- `games/battleship.html`
- `games/blackjack.html`
- `games/brawl_stars.html`
- `games/briscola.html`
- `games/card-games/public/index.html`
- `games/cards.html`
- `games/chess.html`
- `games/clash_royale.html`
- `games/coloring_book.html`
- `games/dama.html`
- `games/drinking_game.html`
- `games/flappy_bird.html`
- `games/forza4.html`
- `games/geom_dash.html`
- `games/goose.html`
- `games/guess_who.html`
- `games/kart.html`
- `games/math_duel.html`
- `games/memory.html`
- `games/mobile_air_hockey.html`
- `games/pixel_runner.html`
- `games/plane.html`
- `games/poker.html`
- `games/quantum_tictactoe.html`
- `games/quotesmith/index.html`
- `games/rpg_game_dist_index.html`
- `games/scopa.html`
- `games/shogi.html`
- `games/shotmind/index.html`
- `games/slot.html`
- `games/snake.html`
- `games/space_invaders.html`
- `games/space_universe.html`
- `games/taboo.html`
- `games/tamagotchi.html`
- `games/tetris.html`
- `games/tokyo.html`
- `games/tower_defense.html`
- `games/warship.html`
- `games/wikipedia_game.html`
- `games/yatzee.html`
- `games/yatzee_solo.html`
- `lab/index.html`
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
- `pages/main/pinball.html`
- `pages/main/pokedex.html`
- `pages/main/pokemon.html`
- `pages/main/privacy-policy.html`
- `pages/main/quantum_lab.html`
- `pages/main/quotes.html`
- `pages/main/recipe.html`
- `pages/main/shop.html`
- `pages/main/technology.html`
- `pages/main/the.html`
- `pages/main/timeline.html`
- `pages/main/visualnovels.html`
- `projects.html`
- `projects/RSA.html`
- `projects/air_canvas.html`
- `projects/audio_transcriber.html`
- `projects/facemesh_camera.html`
- `projects/payamazadi.html`
- `projects/tiny_ai.html`
- `projects/vola-pwa/index.html`
- `projects/world_weather.html`

### `lab/index.html`
- `games/index.html`
- `index.html`

### `pages/content/movies.html`
- `index.html`

### `pages/content/music.html`
- `index.html`

### `pages/content/poem.html`
- `index.html`

### `pages/content/tvshows.html`
- `index.html`

### `pages/experiments/aviator_viper.html`
- `index.html`

### `pages/experiments/easter_egg.html`
- `index.html`

### `pages/main/archive.html`
- `games/3dgame.html`
- `games/animal_crossing.html`
- `games/city_sim.html`
- `games/referendum-game/index.html`
- `index.html`
- `pages/experiments/8.html`
- `pages/experiments/aviator_viper.html`
- `pages/experiments/easter_egg.html`
- `pages/main/luca_quiz.html`
- `pages/main/pinball.html`
- `pages/main/places.html`
- `pages/main/pokedex.html`
- `pages/main/pokemon.html`
- `pages/main/quantum_lab.html`
- `projects/beer.html`
- `projects/quizzes/engineer_quiz.html`
- `projects/quizzes/quiz01.html`
- `projects/quizzes/quiz02.html`
- `projects/quizzes/quiz_fastfood.html`
- `projects/quizzes/taylor_swift_quiz.html`
- `projects/text_image_researcher.html`

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
- `index.html`

### `pages/main/places.html`
- `index.html`

### `pages/main/pokedex.html`
- `index.html`

### `pages/main/pokemon.html`
- `index.html`

### `pages/main/privacy-policy.html`
- `index.html`

### `pages/main/projects.html`
- `index.html`
- `lab/index.html`

### `pages/main/python.html`
- `index.html`

### `pages/main/quantum_lab.html`
- `index.html`

### `pages/main/recipe.html`
- `index.html`

### `pages/main/technology.html`
- `index.html`
- `projects/air_canvas.html`
- `projects/birds.html`
- `projects/croquet.html`
- `projects/gba-emulator.html`
- `projects/gps.html`
- `projects/iqos_timer.html`
- `projects/kinect.html`
- `projects/kinect_2.html`
- `projects/morse.html`
- `projects/people_simulator.html`
- `projects/qrcode.html`
- `projects/reader.html`
- `projects/rock_paper_scissors.html`
- `projects/sierpinski.html`
- `projects/tracker.html`
- `projects/virtual_drums.html`
- `projects/virtual_puppeteer.html`
- `projects/walkietalkie.html`
- `projects/workout.html`

### `pages/main/timeline.html`
- `index.html`

### `pages/main/visualnovels.html`
- `index.html`
- `pages/content/karamazov.html`
- `pages/content/luca_life.html`
- `pages/content/proust.html`
- `pages/main/ai_tale.html`
- `pages/main/fidenzaroundabout.html`

### `projects.html`
- `index.html`
- `lab/index.html`

### `projects/ai_colorizer.html`
- `index.html`

### `projects/armochromy.html`
- `index.html`

### `projects/facemesh_camera.html`
- `index.html`

### `projects/gps.html`
- `pages/main/technology.html`

### `projects/horse_simulator.html`
- `index.html`

### `projects/iqos_timer.html`
- `pages/main/technology.html`

### `projects/kinect.html`
- `pages/main/technology.html`

### `projects/lyrics_finder.html`
- `index.html`

### `projects/nails.html`
- `index.html`

### `projects/nba_simulator.html`
- `index.html`

### `projects/qrcode.html`
- `pages/main/technology.html`

### `projects/quizzes/luca_quiz.html`
- `projects/quiz.html`

### `projects/quizzes/quiz01.html`
- `projects/quiz.html`

### `projects/quizzes/quiz02.html`
- `projects/quiz.html`

### `projects/quizzes/quiz_fastfood.html`
- `projects/quiz.html`

### `projects/rock_paper_scissors.html`
- `pages/main/technology.html`

### `projects/seconds_distance.html`
- `index.html`

### `projects/sierpinski.html`
- `pages/main/technology.html`

### `projects/text_recognition.html`
- `index.html`

### `projects/tracker.html`
- `pages/main/technology.html`

### `projects/virtual_drums.html`
- `pages/main/technology.html`

### `projects/virtual_puppeteer.html`
- `pages/main/technology.html`

## JavaScript-Generated Routes

| Source | Line | Raw target | Resolved target | Status |
|---|---:|---|---|---|
| `assets/js/catalog-data.js` | 23 | `projects/audio-editor-pwa.html` | `projects/audio-editor-pwa.html` | valid |
| `assets/js/catalog-data.js` | 24 | `projects/audio-editor-pwa/index.html` | `projects/audio-editor-pwa/index.html` | valid |
| `assets/js/catalog-data.js` | 25 | `projects/beer.html` | `projects/beer.html` | valid |
| `assets/js/catalog-data.js` | 26 | `projects/due-lumi.html` | `projects/due-lumi.html` | valid |
| `assets/js/catalog-data.js` | 27 | `projects/due-lumi/index.html` | `projects/due-lumi/index.html` | valid |
| `assets/js/catalog-data.js` | 28 | `projects/quizzes/engineer_quiz.html` | `projects/quizzes/engineer_quiz.html` | valid |
| `assets/js/catalog-data.js` | 29 | `projects/quizzes/luca_quiz.html` | `projects/quizzes/luca_quiz.html` | valid |
| `assets/js/catalog-data.js` | 30 | `projects/quizzes/quiz01.html` | `projects/quizzes/quiz01.html` | valid |
| `assets/js/catalog-data.js` | 31 | `projects/quizzes/quiz02.html` | `projects/quizzes/quiz02.html` | valid |
| `assets/js/catalog-data.js` | 32 | `projects/quizzes/quiz_fastfood.html` | `projects/quizzes/quiz_fastfood.html` | valid |
| `assets/js/catalog-data.js` | 33 | `projects/quizzes/taylor_swift_quiz.html` | `projects/quizzes/taylor_swift_quiz.html` | valid |
| `assets/js/catalog-data.js` | 34 | `projects/rave.html` | `projects/rave.html` | valid |
| `assets/js/catalog-data.js` | 35 | `projects/rave/index.html` | `projects/rave/index.html` | valid |
| `assets/js/catalog-data.js` | 36 | `projects/shhh-reader.html` | `projects/shhh-reader.html` | valid |
| `assets/js/catalog-data.js` | 37 | `projects/shhh-reader/index.html` | `projects/shhh-reader/index.html` | valid |
| `assets/js/catalog-data.js` | 38 | `projects/smile_detection.html` | `projects/smile_detection.html` | valid |
| `assets/js/catalog-data.js` | 39 | `projects/smile_detection/index.html` | `projects/smile_detection/index.html` | valid |
| `assets/js/catalog-data.js` | 40 | `projects/text_image_researcher.html` | `projects/text_image_researcher.html` | valid |
| `assets/js/catalog-data.js` | 41 | `projects/vola-pwa/index.html` | `projects/vola-pwa/index.html` | valid |
| `assets/js/catalog-data.js` | 50 | `games/quotesmith/` | `games/quotesmith/index.html` | valid |
| `assets/js/catalog-data.js` | 51 | `games/arcade-lab/` | `games/arcade-lab/index.html` | valid |
| `assets/js/catalog-data.js` | 52 | `games/math_duel.html` | `games/math_duel.html` | valid |
| `assets/js/catalog-data.js` | 53 | `games/cards.html` | `games/cards.html` | valid |
| `assets/js/catalog-data.js` | 54 | `games/UNO.html` | `games/UNO.html` | valid |
| `assets/js/catalog-data.js` | 55 | `games/drinking_game.html` | `games/drinking_game.html` | valid |
| `assets/js/catalog-data.js` | 56 | `games/briscola.html` | `games/briscola.html` | valid |
| `assets/js/catalog-data.js` | 57 | `games/scopa.html` | `games/scopa.html` | valid |
| `assets/js/catalog-data.js` | 58 | `games/guess_who.html` | `games/guess_who.html` | valid |
| `assets/js/catalog-data.js` | 59 | `games/shogi.html` | `games/shogi.html` | valid |
| `assets/js/catalog-data.js` | 60 | `games/plane.html` | `games/plane.html` | valid |
| `assets/js/catalog-data.js` | 61 | `games/aviator.html` | `games/aviator.html` | valid |
| `assets/js/catalog-data.js` | 62 | `games/shotmind/index.html` | `games/shotmind/index.html` | valid |
| `assets/js/catalog-data.js` | 63 | `games/CDD.html` | `games/CDD.html` | valid |
| `assets/js/catalog-data.js` | 64 | `games/brawl_stars.html` | `games/brawl_stars.html` | valid |
| `assets/js/catalog-data.js` | 65 | `games/tower_defense.html` | `games/tower_defense.html` | valid |
| `assets/js/catalog-data.js` | 66 | `games/forza4.html` | `games/forza4.html` | valid |
| `assets/js/catalog-data.js` | 67 | `games/snake.html` | `games/snake.html` | valid |
| `assets/js/catalog-data.js` | 68 | `games/rpg_game_dist_index.html` | `games/rpg_game_dist_index.html` | valid |
| `assets/js/catalog-data.js` | 69 | `games/mobile_air_hockey.html` | `games/mobile_air_hockey.html` | valid |
| `assets/js/catalog-data.js` | 70 | `games/memory.html` | `games/memory.html` | valid |
| `assets/js/catalog-data.js` | 71 | `games/slot_collect.html` | `games/slot_collect.html` | valid |
| `assets/js/catalog-data.js` | 72 | `games/geom_dash.html` | `games/geom_dash.html` | valid |
| `assets/js/catalog-data.js` | 73 | `games/space_invaders.html` | `games/space_invaders.html` | valid |
| `assets/js/catalog-data.js` | 74 | `games/space_universe.html` | `games/space_universe.html` | valid |
| `assets/js/catalog-data.js` | 75 | `games/tetris.html` | `games/tetris.html` | valid |
| `assets/js/catalog-data.js` | 76 | `games/poker.html` | `games/poker.html` | valid |
| `assets/js/catalog-data.js` | 77 | `games/blackjack.html` | `games/blackjack.html` | valid |
| `assets/js/catalog-data.js` | 78 | `games/chess.html` | `games/chess.html` | valid |
| `assets/js/catalog-data.js` | 79 | `games/card-games/public/index.html` | `games/card-games/public/index.html` | valid |
| `assets/js/catalog-data.js` | 80 | `games/dama.html` | `games/dama.html` | valid |
| `assets/js/catalog-data.js` | 81 | `games/backgammon.html` | `games/backgammon.html` | valid |
| `assets/js/catalog-data.js` | 82 | `games/goose.html` | `games/goose.html` | valid |
| `assets/js/catalog-data.js` | 83 | `games/flappy_bird.html` | `games/flappy_bird.html` | valid |
| `assets/js/catalog-data.js` | 84 | `games/wikipedia_game.html` | `games/wikipedia_game.html` | valid |
| `assets/js/catalog-data.js` | 85 | `games/pixel_runner.html` | `games/pixel_runner.html` | valid |
| `assets/js/catalog-data.js` | 86 | `games/tamagotchi.html` | `games/tamagotchi.html` | valid |
| `assets/js/catalog-data.js` | 87 | `games/coloring_book.html` | `games/coloring_book.html` | valid |
| `assets/js/catalog-data.js` | 88 | `games/quantum_tictactoe.html` | `games/quantum_tictactoe.html` | valid |
| `assets/js/catalog-data.js` | 89 | `games/tokyo.html` | `games/tokyo.html` | valid |
| `assets/js/catalog-data.js` | 90 | `pages/main/pinball.html` | `pages/main/pinball.html` | valid |
| `assets/js/catalog-data.js` | 91 | `games/clash_royale.html` | `games/clash_royale.html` | valid |
| `assets/js/catalog-data.js` | 92 | `pages/main/pokedex.html` | `pages/main/pokedex.html` | valid |
| `assets/js/catalog-data.js` | 93 | `pages/main/pokemon.html` | `pages/main/pokemon.html` | valid |
| `assets/js/catalog-data.js` | 94 | `games/yatzee.html` | `games/yatzee.html` | valid |
| `assets/js/catalog-data.js` | 95 | `games/yatzee_solo.html` | `games/yatzee_solo.html` | valid |
| `assets/js/catalog-data.js` | 96 | `games/taboo.html` | `games/taboo.html` | valid |
| `assets/js/catalog-data.js` | 97 | `pages/main/visualnovels.html` | `pages/main/visualnovels.html` | valid |
| `assets/js/catalog-data.js` | 98 | `games/kart.html` | `games/kart.html` | valid |
| `assets/js/catalog-data.js` | 99 | `games/battleship.html` | `games/battleship.html` | valid |
| `assets/js/catalog-data.js` | 100 | `games/warship.html` | `games/warship.html` | valid |
| `assets/js/catalog-data.js` | 101 | `games/battlelands_royale.html` | `games/battlelands_royale.html` | valid |
| `assets/js/catalog-data.js` | 102 | `games/echoes-of-the-last-dawn/index.html` | `games/echoes-of-the-last-dawn/index.html` | valid |
| `assets/js/catalog-data.js` | 103 | `games/coop-game/index.html` | `games/coop-game/index.html` | valid |
| `assets/js/catalog-data.js` | 104 | `games/friends-tycoon.html` | `games/friends-tycoon.html` | valid |
| `assets/js/catalog-data.js` | 105 | `games/orto-magico/index.html` | `games/orto-magico/index.html` | valid |
| `assets/js/catalog-data.js` | 106 | `games/pokopia-clone/index.html` | `games/pokopia-clone/index.html` | valid |
| `assets/js/catalog-data.js` | 107 | `games/3dgame.html` | `games/3dgame.html` | valid |
| `assets/js/catalog-data.js` | 108 | `games/airhockey.html` | `games/airhockey.html` | valid |
| `assets/js/catalog-data.js` | 109 | `games/animal_crossing.html` | `games/animal_crossing.html` | valid |
| `assets/js/catalog-data.js` | 110 | `games/city_sim.html` | `games/city_sim.html` | valid |
| `assets/js/catalog-data.js` | 111 | `games/coop-game.html` | `games/coop-game.html` | valid |
| `assets/js/catalog-data.js` | 112 | `games/echoes-of-the-last-dawn.html` | `games/echoes-of-the-last-dawn.html` | valid |
| `assets/js/catalog-data.js` | 113 | `games/friends-tycoon/index.html` | `games/friends-tycoon/index.html` | valid |
| `assets/js/catalog-data.js` | 114 | `games/orto-magico.html` | `games/orto-magico.html` | valid |
| `assets/js/catalog-data.js` | 115 | `games/pinball.html` | `games/pinball.html` | valid |
| `assets/js/catalog-data.js` | 116 | `games/pokedex.html` | `games/pokedex.html` | valid |
| `assets/js/catalog-data.js` | 117 | `games/pokemon.html` | `games/pokemon.html` | valid |
| `assets/js/catalog-data.js` | 118 | `games/pokopia-clone.html` | `games/pokopia-clone.html` | valid |
| `assets/js/catalog-data.js` | 119 | `games/referendum-game/index.html` | `games/referendum-game/index.html` | valid |
| `assets/js/catalog-data.js` | 120 | `games/slot.html` | `games/slot.html` | valid |
| `assets/js/catalog-data.js` | 121 | `games/watermelon.html` | `games/watermelon.html` | valid |
| `assets/js/catalog-data.js` | 122 | `games/webgl_diagnostics.html` | `games/webgl_diagnostics.html` | valid |
| `assets/js/projects-data.js` | 9 | `projects/world_weather.html` | `projects/world_weather.html` | valid |
| `assets/js/projects-data.js` | 18 | `projects/payamazadi.html` | `projects/payamazadi.html` | valid |
| `assets/js/projects-data.js` | 27 | `projects/tiny_ai.html` | `projects/tiny_ai.html` | valid |
| `assets/js/projects-data.js` | 36 | `projects/audio_transcriber.html` | `projects/audio_transcriber.html` | valid |
| `assets/js/projects-data.js` | 45 | `projects/radio.html` | `projects/radio.html` | valid |
| `assets/js/projects-data.js` | 54 | `pages/main/python.html` | `pages/main/python.html` | valid |
| `assets/js/projects-data.js` | 63 | `projects/scraping.html` | `projects/scraping.html` | valid |
| `assets/js/projects-data.js` | 72 | `projects/seconds_distance.html` | `projects/seconds_distance.html` | valid |
| `assets/js/projects-data.js` | 81 | `projects/streaming.html` | `projects/streaming.html` | valid |
| `assets/js/projects-data.js` | 90 | `projects/sankey.html` | `projects/sankey.html` | valid |
| `assets/js/projects-data.js` | 99 | `projects/RSA.html` | `projects/RSA.html` | valid |
| `assets/js/projects-data.js` | 108 | `projects/walkietalkie.html` | `projects/walkietalkie.html` | valid |
| `assets/js/projects-data.js` | 117 | `projects/facemesh_camera.html` | `projects/facemesh_camera.html` | valid |
| `assets/js/projects-data.js` | 126 | `projects/camera_compression.html` | `projects/camera_compression.html` | valid |
| `assets/js/projects-data.js` | 135 | `projects/face_compare.html` | `projects/face_compare.html` | valid |
| `assets/js/projects-data.js` | 144 | `projects/armochromy.html` | `projects/armochromy.html` | valid |
| `assets/js/projects-data.js` | 153 | `projects/mesh_camera2.html` | `projects/mesh_camera2.html` | valid |
| `assets/js/projects-data.js` | 162 | `projects/morse.html` | `projects/morse.html` | valid |
| `assets/js/projects-data.js` | 171 | `projects/longest_midi.html` | `projects/longest_midi.html` | valid |
| `assets/js/projects-data.js` | 180 | `projects/reader.html` | `projects/reader.html` | valid |
| `assets/js/projects-data.js` | 189 | `projects/iqos_timer.html` | `projects/iqos_timer.html` | valid |
| `assets/js/projects-data.js` | 198 | `projects/gps.html` | `projects/gps.html` | valid |
| `assets/js/projects-data.js` | 207 | `projects/draw.html` | `projects/draw.html` | valid |
| `assets/js/projects-data.js` | 216 | `projects/fashion_detect.html` | `projects/fashion_detect.html` | valid |
| `assets/js/projects-data.js` | 225 | `projects/workout.html` | `projects/workout.html` | valid |
| `assets/js/projects-data.js` | 234 | `projects/sierpinski.html` | `projects/sierpinski.html` | valid |
| `assets/js/projects-data.js` | 243 | `projects/people_simulator.html` | `projects/people_simulator.html` | valid |
| `assets/js/projects-data.js` | 252 | `projects/tracker.html` | `projects/tracker.html` | valid |
| `assets/js/projects-data.js` | 261 | `projects/kinect.html` | `projects/kinect.html` | valid |
| `assets/js/projects-data.js` | 270 | `projects/kinect_2.html` | `projects/kinect_2.html` | valid |
| `assets/js/projects-data.js` | 279 | `projects/air_canvas.html` | `projects/air_canvas.html` | valid |
| `assets/js/projects-data.js` | 288 | `projects/rock_paper_scissors.html` | `projects/rock_paper_scissors.html` | valid |
| `assets/js/projects-data.js` | 297 | `projects/virtual_puppeteer.html` | `projects/virtual_puppeteer.html` | valid |
| `assets/js/projects-data.js` | 306 | `projects/virtual_drums.html` | `projects/virtual_drums.html` | valid |
| `assets/js/projects-data.js` | 315 | `projects/qrcode.html` | `projects/qrcode.html` | valid |
| `assets/js/projects-data.js` | 324 | `projects/create_qrcode.html` | `projects/create_qrcode.html` | valid |
| `assets/js/projects-data.js` | 333 | `projects/birds.html` | `projects/birds.html` | valid |
| `assets/js/projects-data.js` | 342 | `projects/croquet.html` | `projects/croquet.html` | valid |
| `assets/js/projects-data.js` | 351 | `projects/lyrics_finder.html` | `projects/lyrics_finder.html` | valid |
| `assets/js/projects-data.js` | 360 | `projects/nba_simulator.html` | `projects/nba_simulator.html` | valid |
| `assets/js/projects-data.js` | 369 | `projects/horse_simulator.html` | `projects/horse_simulator.html` | valid |
| `assets/js/projects-data.js` | 378 | `projects/seriea_simulator.html` | `projects/seriea_simulator.html` | valid |
| `assets/js/projects-data.js` | 387 | `games/slot_collect.html` | `games/slot_collect.html` | valid |
| `assets/js/projects-data.js` | 396 | `projects/text_recognition.html` | `projects/text_recognition.html` | valid |
| `assets/js/projects-data.js` | 405 | `projects/ai_colorizer.html` | `projects/ai_colorizer.html` | valid |
| `assets/js/projects-data.js` | 414 | `projects/coloring.html` | `projects/coloring.html` | valid |
| `assets/js/projects-data.js` | 423 | `projects/nails.html` | `projects/nails.html` | valid |
| `assets/js/projects-data.js` | 432 | `projects/gba-emulator.html` | `projects/gba-emulator.html` | valid |
| `assets/js/projects-data.js` | 441 | `projects/quiz.html` | `projects/quiz.html` | valid |
| `assets/js/projects-data.js` | 450 | `projects/daisy-field/index.html` | `projects/daisy-field/index.html` | valid |
| `assets/js/projects-data.js` | 459 | `book-writer/index.html` | `book-writer/index.html` | valid |
| `assets/js/projects-data.js` | 468 | `projects/ai_chat.html` | `projects/ai_chat.html` | valid |
| `assets/js/projects-data.js` | 477 | `projects/ecommerce.html` | `projects/ecommerce.html` | valid |
| `assets/js/projects-data.js` | 486 | `projects/file_manager.html` | `projects/file_manager.html` | valid |

## Broken or Inconsistent References

| Source | Line | Target | Status | Detail |
|---|---:|---|---|---|
| `games/webgl_diagnostics.html` | 36 | `/games/tamagotchi.html` | **inconsistent** | Root-absolute path bypasses the GitHub Pages /portfolio/ prefix. |
| `index.html` | 239 | `./assets/CV_Gandolfi_Luca.pdf` | **broken** | Target HTML file or directory index does not exist. |
| `index.html` | 258 | `./assets/CV_Gandolfi_Luca.pdf` | **broken** | Target HTML file or directory index does not exist. |
| `projects/longest_midi.html` | 20 | `../assets/midi/symphony_9_1.mid` | **broken** | Target HTML file or directory index does not exist. |
| `projects/sankey.html` | 34 | `/` | **inconsistent** | Root-absolute path bypasses the GitHub Pages /portfolio/ prefix. |

## Orphan Candidates

These files have no incoming HTML-to-HTML link in the scanned graph. Some are intentional direct-entry apps or build artifacts.

- `book-writer/index.html`
- `games/coop-game.html`
- `games/coop-game/index.html`
- `games/echoes-of-the-last-dawn.html`
- `games/echoes-of-the-last-dawn/index.html`
- `games/friends-tycoon.html`
- `games/friends-tycoon/index.html`
- `games/orto-magico.html`
- `games/orto-magico/index.html`
- `games/pinball.html`
- `games/pokedex.html`
- `games/pokemon.html`
- `games/pokopia-clone.html`
- `games/pokopia-clone/index.html`
- `games/slot_collect.html`
- `games/watermelon.html`
- `pages/content/memes.html`
- `pages/content/proust_fixed.html`
- `pages/main/offline.html`
- `pages/main/projects.html`
- `pages/main/python.html`
- `projects/ai_chat.html`
- `projects/ai_colorizer.html`
- `projects/armochromy.html`
- `projects/audio-editor-pwa.html`
- `projects/audio-editor-pwa/index.html`
- `projects/camera_compression.html`
- `projects/coloring.html`
- `projects/create_qrcode.html`
- `projects/daisy-field/index.html`
- `projects/draw.html`
- `projects/due-lumi.html`
- `projects/due-lumi/index.html`
- `projects/ecommerce.html`
- `projects/face_compare.html`
- `projects/fashion_detect.html`
- `projects/file_manager.html`
- `projects/horse_simulator.html`
- `projects/longest_midi.html`
- `projects/lyrics_finder.html`
- `projects/mesh_camera2.html`
- `projects/nails.html`
- `projects/nba_simulator.html`
- `projects/quizzes/luca_quiz.html`
- `projects/radio.html`
- `projects/rave.html`
- `projects/rave/index.html`
- `projects/sankey.html`
- `projects/scraping.html`
- `projects/seconds_distance.html`
- `projects/seriea_simulator.html`
- `projects/shhh-reader.html`
- `projects/shhh-reader/index.html`
- `projects/smile_detection.html`
- `projects/smile_detection/index.html`
- `projects/streaming.html`
- `projects/text_recognition.html`
- `rpg_game/index.html`

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

