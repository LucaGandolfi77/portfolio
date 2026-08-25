(function (root) {
  'use strict';

  const categoryByBadge = {
    AI: 'ai', 'AI Tool': 'ai', 'AI / AR': 'computer-vision', AR: 'computer-vision',
    'Camera / Tools': 'computer-vision', 'Audio / Streaming': 'audio', 'Audio / Tool': 'audio',
    Crypto: 'engineering', Data: 'data', Math: 'engineering', Sim: 'simulation',
    Utility: 'tools', 'Utility / iOS': 'tools', Game: 'games', Emu: 'games', Quiz: 'games',
    Creative: 'creative', Music: 'audio', Accessibility: 'accessibility', Tool: 'tools'
  };

  const projects = (typeof PROJECTS_DATA === 'undefined' ? [] : PROJECTS_DATA).map((project) => ({
    ...project,
    type: 'project',
    category: categoryByBadge[project.badge] || 'engineering',
    technologies: [project.badge || 'JavaScript', 'HTML', 'CSS'],
    featured: ['tiny-local-ai', 'facemesh-camera', 'p2p-walkie-talkie', 'daisy-field', 'book-writer'].includes(project.id),
    requirements: /camera|face|ar|tracker|kinect/i.test(`${project.title} ${project.description}`) ? ['camera'] : [],
    status: 'live'
  }));

  const games = [
    ['quotesmith', 'QuoteSmith', 'Bilingual quote quiz with 14 categories and offline scores.', 'games/quotesmith/', 'Q', 'quiz', ['Offline', 'PWA', 'iPhone'], true],
    ['arcade-lab', 'Arcade Lab', 'Ten small games for reaction, memory, rhythm, strategy, physics, and simulation.', 'games/arcade-lab/', 'A', 'arcade', ['10 games', 'Offline'], true],
    ['math-duel', 'Math Duel', 'Challenge a friend to a fast-paced math battle.', 'games/math_duel.html', '∑', 'multiplayer', ['PvP', 'Speed'], false],
    ['card-collector', 'Card Collector', 'Collect, upgrade, and battle with rare cards.', 'games/cards.html', '🎴', 'cards', ['Cards'], false],
    ['uno-online', 'UNO Online', 'Host a room and play classic UNO with friends in real time.', 'games/UNO.html', '🎴', 'multiplayer', ['Multiplayer', 'Cards'], false],
    ['drinking-game', 'Drinking Game', 'A simple party game with custom rules and prompts.', 'games/drinking_game.html', '🥂', 'party', ['Party'], false],
    ['briscola', 'Briscola Bluetooth', 'Play the classic Italian card game with a nearby friend.', 'games/briscola.html', '🃏', 'cards', ['Bluetooth', 'Cards'], false],
    ['scopa', 'Scopa P2P', 'Classic Italian card game Scopa in the browser.', 'games/scopa.html', '🧹', 'cards', ['P2P', 'Cards'], false],
    ['guess-who', 'Guess Who P2P', 'Ask questions and find the secret character.', 'games/guess_who.html', '🕵️', 'multiplayer', ['P2P', 'Board'], false],
    ['shogi', 'Shogi', 'Japanese chess against AI or another player.', 'games/shogi.html', '将', 'strategy', ['AI', 'Board'], false],
    ['sky-ace', 'Sky Ace', 'Side-scrolling aerial combat.', 'games/plane.html', '✈️', 'arcade', ['Arcade'], false],
    ['aviator', 'Aviator', 'Flight-themed risk and timing game.', 'games/aviator.html', '🛩️', 'arcade', ['Arcade'], false],
    ['shotmind', 'Shotmind', 'A focused browser shooting and reaction game.', 'games/shotmind/index.html', '+', 'arcade', ['Arcade', 'PWA'], false],
    ['cdd', 'CDD', 'A compact competitive card and strategy experiment.', 'games/CDD.html', '♣', 'cards', ['Cards'], false],
    ['brawl-stars', 'Brawl Stars Map', 'Action arena and map experiment.', 'games/brawl_stars.html', '★', 'arcade', ['Action'], false],
    ['tower-defense', 'Tower Defense', 'Place defenses and stop the incoming wave.', 'games/tower_defense.html', '⌂', 'strategy', ['Strategy'], false],
    ['forza4', 'Forza 4', 'Connect four pieces before your opponent.', 'games/forza4.html', '4', 'strategy', ['Board'], false],
    ['snake', 'Snake', 'Classic arcade snake with increasing speed.', 'games/snake.html', '●', 'arcade', ['Retro'], false],
    ['rpg', 'RPG Adventure', 'A browser role-playing game with exploration and combat.', 'games/rpg_game_dist_index.html', '⚔', 'story', ['RPG'], false],
    ['air-hockey', 'Air Hockey', 'Full-screen touch air hockey for two players.', 'games/mobile_air_hockey.html', '🏒', 'multiplayer', ['Touch', 'Multiplayer'], false],
    ['memory', 'Memory', 'Match pairs and keep your move count low.', 'games/memory.html', '◎', 'puzzle', ['Puzzle'], false],
    ['slot-collect', 'Slot Collect', 'Build a deck and spin to collect rewards.', 'games/slot_collect.html', '🎰', 'arcade', ['Cards'], false],
    ['geometry-dash', 'Geometry Dash', 'Jump, time, and survive the moving course.', 'games/geom_dash.html', '◇', 'arcade', ['Timing'], false],
    ['space-invaders', 'Space Invaders', 'Retro arcade defense against descending enemies.', 'games/space_invaders.html', '▦', 'arcade', ['Retro'], false],
    ['space-universe', 'Space Universe', 'Explore a small universe in the browser.', 'games/space_universe.html', '✦', 'simulation', ['Space'], false],
    ['tetris', 'Tetris', 'Fit falling pieces and clear lines.', 'games/tetris.html', '▦', 'puzzle', ['Retro'], false],
    ['poker', 'Poker', 'Classic poker hands and table play.', 'games/poker.html', '♠', 'cards', ['Cards'], false],
    ['blackjack', 'Blackjack', 'Play blackjack against the house.', 'games/blackjack.html', '21', 'cards', ['Cards'], false],
    ['chess', 'Chess', 'A classic board for focused strategy.', 'games/chess.html', '♞', 'strategy', ['Board'], false],
    ['card-games', 'Card Games Collection', 'A collection of card games with an optional local host.', 'games/card-games/public/index.html', '🂠', 'cards', ['Cards', 'Optional server'], false],
    ['dama', 'Dama', 'Italian draughts board game.', 'games/dama.html', '◈', 'strategy', ['Board'], false],
    ['backgammon', 'Backgammon', 'Classic race and capture board game.', 'games/backgammon.html', '◌', 'strategy', ['Board'], false],
    ['goose', 'Game of the Goose', 'A light classic board game.', 'games/goose.html', '◉', 'strategy', ['Board'], false],
    ['flappy-bird', 'Flappy Bird', 'Navigate the gaps and chase a high score.', 'games/flappy_bird.html', '🐦', 'arcade', ['Retro'], false],
    ['wikipedia', 'Wikipedia Game', 'Connect ideas through a playful knowledge challenge.', 'games/wikipedia_game.html', 'W', 'quiz', ['Knowledge'], false],
    ['pixel-runner', 'Pixel Runner', 'Run, jump, and avoid the next obstacle.', 'games/pixel_runner.html', '▸', 'arcade', ['Retro'], false],
    ['tamagotchi', 'Tamagotchi', 'Care for a small digital companion.', 'games/tamagotchi.html', '♥', 'simulation', ['Casual'], false],
    ['coloring-book', 'Coloring Book', 'Relax and color figures in the browser.', 'games/coloring_book.html', '✎', 'creative', ['Canvas'], false],
    ['quantum-tictactoe', 'Quantum Tic-Tac-Toe', 'Play with superposition and entanglement.', 'games/quantum_tictactoe.html', '⚛', 'strategy', ['Quantum'], false],
    ['tokyo', 'TOKYO', 'Classic dice game. Roll for Tokyo.', 'games/tokyo.html', '🎲', 'party', ['Dice'], false],
    ['pinball', 'Space Cadet Pinball', 'Launch, bounce, and chase a score.', 'pages/main/pinball.html', '🚀', 'arcade', ['Retro'], false],
    ['clash-royale', 'Royale Battle', 'Deploy troops and destroy enemy towers.', 'games/clash_royale.html', '♛', 'strategy', ['Strategy'], false],
    ['pokedex', 'Pokédex', 'Explore a searchable Pokémon database.', 'pages/main/pokedex.html', '●', 'quiz', ['Database'], false],
    ['pokemon', 'Pokémon Adventure', 'Explore the world as a Pokémon trainer.', 'pages/main/pokemon.html', '⚡', 'story', ['Adventure'], false],
    ['yatzee', 'Yatzee', 'Classic dice game for local players.', 'games/yatzee.html', '🎲', 'party', ['Dice'], false],
    ['yatzee-solo', 'Yatzee Solo', 'Challenge a browser opponent in a classic dice game.', 'games/yatzee_solo.html', '🤖', 'strategy', ['AI', 'Dice'], false],
    ['taboo', 'Taboo', 'Describe the word without using the forbidden ones.', 'games/taboo.html', '🚫', 'party', ['Party'], false],
    ['visual-novels', 'Visual Novels', 'Interactive stories and adventures.', 'pages/main/visualnovels.html', '📖', 'story', ['Story'], false],
    ['neon-kart', 'Neon Kart', 'Drift and use nitro in a fast browser racer.', 'games/kart.html', '🏎', 'arcade', ['Racing'], false],
    ['battleship', 'Battleship Commander', 'Command your fleet and find the enemy.', 'games/battleship.html', '🚢', 'strategy', ['Board'], false],
    ['warship', 'Warship Commander', 'First-person naval action in the browser.', 'games/warship.html', '⚓', 'arcade', ['Action'], false],
    ['battlelands', 'Battlelands Royale 3D', 'Survive and eliminate opponents in a 3D arena.', 'games/battlelands_royale.html', '🪖', 'arcade', ['3D', 'Action'], false],
    ['echoes-last-dawn', 'Echoes of the Last Dawn', 'A low-poly story game with turn-based combat.', 'games/echoes-of-the-last-dawn/index.html', '☼', 'story', ['Three.js', '3D'], true],
    ['coop-game', 'Slips & Catastrophes', 'A cooperative narrative board game for friends.', 'games/coop-game/index.html', '✦', 'multiplayer', ['Co-op', 'PWA'], true],
    ['friends-tycoon', 'Friends Tycoon', 'A social management game experiment.', 'games/friends-tycoon.html', '♙', 'simulation', ['Simulation'], false],
    ['orto-magico', 'Orto Magico', 'A playful garden and growing game.', 'games/orto-magico/index.html', '✿', 'simulation', ['PWA'], false],
    ['pokopia-clone', 'Pokopia Clone', 'A browser world-building experiment.', 'games/pokopia-clone/index.html', '⌂', 'simulation', ['Canvas'], false]
  ].map(([id,title,description,href,icon,category,badges,featured]) => ({ id, title, description, href, icon, category, badges, technologies: badges, featured, status: 'live', type: 'game', requirements: badges.includes('Camera') ? ['camera'] : [] }));

  root.PORTFOLIO_CATALOG = { projects, games, categories: ['ai', 'audio', 'accessibility', 'computer-vision', 'creative', 'data', 'engineering', 'games', 'simulation', 'tools', 'quiz', 'arcade', 'multiplayer', 'cards', 'party', 'strategy', 'puzzle', 'story'] };
}(window));
