/* Miraggio Pass — catalogo giochi e adapter localStorage.
   Ogni voce: id, nome, icona, categoria, percorso, root, metrica, XP multiplier.
   Le metriche leggono i SALVATAGGI REALI dei giochi del portfolio: nessuna modifica
   ai giochi esistenti è necessaria per il rilevamento di base. */
(function(){
  'use strict';

  var num = function(k){ return function(ls){
    var v = parseFloat(ls.getItem(k));
    return isFinite(v) && v > 0 ? v : 0;
  }; };

  var prefMax = function(prefix){ return function(ls){
    var max = 0;
    for(var i=0;i<ls.length;i++){
      var k = ls.key(i);
      if(k && k.indexOf(prefix) === 0){
        var v = parseFloat(ls.getItem(k));
        if(isFinite(v) && v > max) max = v;
      }
    }
    return max;
  }; };

  var jsonFields = function(key, fields){ return function(ls){
    try {
      var o = JSON.parse(ls.getItem(key) || 'null');
      if(!o) return 0;
      var max = 0;
      for(var i=0;i<fields.length;i++){
        var v = Number(o[fields[i]]);
        if(isFinite(v) && v > max) max = v;
      }
      return max;
    } catch(e){ return 0; }
  }; };

  var jsonMaxField = function(key, field){ return function(ls){
    try {
      var o = JSON.parse(ls.getItem(key) || 'null');
      if(!o) return 0;
      var v = o[field];
      if(v && typeof v === 'object'){
        var max = 0;
        for(var k in v){ var n = Number(v[k]); if(isFinite(n) && n > max) max = n; }
        return max;
      }
      var x = Number(v); return isFinite(x) ? x : 0;
    } catch(e){ return 0; }
  }; };

  var exists = function(keys){ return function(ls){
    for(var i=0;i<keys.length;i++){
      var v = ls.getItem(keys[i]);
      if(v !== null && v !== '' && v !== '0') return 1;
    }
    return 0;
  }; };

  var scalpel = function(ls){
    try {
      var s = JSON.parse(ls.getItem('scalpel_save') || 'null');
      if(!s) return 0;
      var scores = s.scores || {};
      return (Number(s.chapter) || 1) * 10 + Object.keys(scores).length * 5;
    } catch(e){ return 0; }
  };

  var G = function(id, name, icon, cat, path, root, metric, label, xp){
    return { id:id, name:name, icon:icon, cat:cat, path:path, root:root || 'games',
             metric:metric, label:label || 'Record', xp:xp || 4 };
  };

  var CATALOG = [
    /* ── Arcade ── */
    G('snake','Snake Neon','🐍','arcade','snake.html','games',num('snake_highScore'),'Punteggio',5),
    G('tetris','Tetris Apocalypse','🧱','arcade','tetris.html','games',prefMax('tetris_apocalypse_best_'),'Record',5),
    G('invaders','Space Invaders','👾','arcade','space_invaders.html','games',num('si_high'),'Record',5),
    G('pinball','Pinball','🎯','arcade','pinball.html','games',num('pb_high'),'Record',5),
    G('pixelrunner','Pixel Runner','🏃','arcade','pixel_runner.html','games',num('pixelRunnerHighScore'),'Record',5),
    G('geomdash','Geometry Dash','⚡','arcade','geom_dash.html','games',num('geom_dash_bestScore'),'Record',5),
    G('flappy','Flappy Bird','🐦','arcade','flappy_bird.html','games',jsonFields('flappy-neon-v1',['best','highScore','bestScore','coins']),'Record',4),
    G('sinibbio','Sinibbio','🦢','arcade','sinibbio/index.html','games',num('sinibbio.best'),'Record',4),
    G('arcadelab','Arcade Lab','🕹️','arcade','arcade-lab/index.html','games',exists(['arcade_active_game','arcade_difficulty']),'Giocato',3),
    G('airhockey','Air Hockey','🏒','arcade','airhockey.html','games',jsonFields('airhockey_neon',['highScore','wins']),'Record',4),
    G('kart','Kart Royale','🏎️','arcade','kart.html','games',exists(['kart_save','kart_scores']),'Giocato',3),
    G('vola','Vola PWA','🪂','arcade','../projects/vola-pwa/index.html','projects',num('vola_best_v1'),'Record',4),
    G('kinect','Kinect Runner','🤖','arcade','../projects/kinect/app.js','projects',num('kinect_best'),'Record',4),

    /* ── Strategia ── */
    G('chess','Chess','♟️','strategia','chess.html','games',exists(['chess-prefs','chess_save','chess-v1']),'Giocato',6),
    G('dama','Dama','🎲','strategia','dama.html','games',exists(['dama-v1','dama-prefs']),'Giocato',6),
    G('backgammon','Backgammon','🎲','strategia','backgammon.html','games',exists(['backgammon-v1','backgammon_save']),'Giocato',6),
    G('forza4','Forza 4','🔴','strategia','forza4.html','games',exists(['forza4_scores','forza4_lang']),'Giocato',5),
    G('shogi','Shogi','🌸','strategia','shogi.html','games',exists(['shogi_save','shogi-prefs']),'Giocato',5),
    G('battleship','Battleship','🚢','strategia','battleship.html','games',exists(['battleship_save','bs_save']),'Giocato',5),
    G('citysim','City Sim','🏙️','strategia','city_sim.html','games',jsonFields('city-sim-v3',['day','population','money']),'Giorni',5),
    G('towerdefense','Tower Defense','🗼','strategia','tower_defense.html','games',exists(['td_save','tower_defense_save']),'Giocato',5),
    G('clashroyale','Royale Lab','👑','strategia','clash_royale.html','games',jsonFields('royale-lab-v1',['trophies','level','wins','gold']),'Trofei',6),
    G('quantumforge','Quantum Forge','⚛️','strategia','quantum-forge/index.html','games',exists(['quantum-forge','quantum_forge_save']),'Giocato',5),
    G('qttt','Quantum Tic Tac Toe','❓','strategia','quantum_tictactoe.html','games',exists(['qttt_save','quantum_tictactoe']),'Giocato',5),
    G('warship','Warship','⚓','strategia','warship.html','games',exists(['warship_save','warship_high']),'Giocato',4),
    G('pocketwild','Pocket Wild','🌿','strategia','../projects/pocket-wild/index.html','projects',num('pocketwild_speedrun_best'),'Record',5),
    G('nba','NBA Simulator','🏀','strategia','../projects/nba_simulator/legacy-nba_simulator.html','projects',exists(['nba_save','nba.lang']),'Giocato',4),
    G('seriea','Serie A Simulator','⚽','strategia','../projects/seriea-simulator/index.html','projects',exists(['seriea_save','seriea_sim']),'Giocato',4),

    /* ── Avventura / Sim ── */
    G('scalpel','Scalpel — Surgical Stories','🔪','avventura','scalpel/index.html','games',scalpel,'Capi chirurgici',7),
    G('scalpel2','Scalpel 2','🩺','avventura','scalpel-2/index.html','games',exists(['scalpel2_quiz','scalpel2_save']),'Giocato',6),
    G('animalcrossing','Animal Crossing','🏝️','avventura','animal_crossing.html','games',jsonFields('animal_crossing_save_v1',['days','bells','day','score']),'Progresso',5),
    G('goose','Goose Game','🪿','avventura','goose.html','games',exists(['gg_ext_v1','gg_muted','gg_save_v1']),'Giocato',4),
    G('tamagotchi','Tamagotchi','🥚','avventura','tamagotchi.html','games',exists(['tama_v3','tama_music_off','tama_sfx_off']),'Giocato',4),
    G('rpg','Mystic Quest','🗡️','avventura','rpg.html','games',exists(['rpg_save','mystic_quest_save']),'Giocato',5),
    G('echoes','Echoes of the Last Dawn','🌅','avventura','echoes-of-the-last-dawn/www/index.html','games',exists(['echoes_lang','echoes_save']),'Giocato',5),
    G('csimilano','CSI Milano','🔍','avventura','csi-milano/index.html','games',exists(['csi-milano.save.v2']),'Giocato',5),
    G('csifidenza','CSI Fidenza','🕵️','avventura','csi-fidenza/index.html','games',exists(['csifid_mute','csifid_save']),'Giocato',4),
    G('wikithriving','WikiThriving','📚','avventura','wikithriving/site/index.html','games',exists(['wikithriving_state','wt_uid']),'Giocato',4),
    G('shhh','Shhh Reader','🤫','avventura','../projects/shhh-reader/index.html','projects',exists(['shhh_hist','shhh_lastSuccessDay']),'Giocato',4),
    G('roadparaguay','Road to Paraguay','🛣️','avventura','../projects/road-to-paraguay/index.html','projects',exists(['rtp.theme.v1','rtp_save']),'Giocato',4),

    /* ── Party / Quiz ── */
    G('memory','Memory Garden','🌻','party','memory.html','games',jsonFields('memory-garden-v1',['best','moves','level','score']),'Record',4),
    G('drinking','Drinking Game','🍻','party','drinking_game.html','games',exists(['drinking-game-v2']),'Giocato',4),
    G('taboo','Taboo','🚫','party','taboo.html','games',exists(['taboo_muted','taboo_best']),'Giocato',4),
    G('guesswho','Guess Who?','🕵️','party','guess_who.html','games',exists(['gw_save','guesswho_save']),'Giocato',4),
    G('wikipedia','Wikipedia Game','🌐','party','wikipedia_game.html','games',exists(['wg_save','wikipedia_game_save']),'Giocato',4),
    G('quiz','Quiz Studio','🧠','party','../projects/quiz-lab/index.html','projects',exists(['quiz_progress','quiz_stats']),'Giocato',4),
    G('mathduel','Math Duel','➗','party','math_duel.html','games',exists(['mathduel_best','math_duel_save']),'Giocato',4),

    /* ── Scommesse / Fortuna ── */
    G('yatzee','Yatzy','🎲','scommesse','yatzee.html','games',jsonFields('yatzee.save.v1',['best','score','gamesPlayed']),'Record',4),
    G('yatzeesolo','Yatzy Solo','🎲','scommesse','yatzee_solo.html','games',jsonFields('yatzee.solo.save.v1',['best','score','gamesPlayed']),'Record',4),
    G('poker','Poker','♠️','scommesse','poker.html','games',num('pk_chips'),'Chips',3),
    G('blackjack','Blackjack','🃏','scommesse','blackjack.html','games',num('bj_chips'),'Chips',3),
    G('slot','Slot Machine','🎰','scommesse','slot.html','games',num('slot_wins'),'Vittorie',3),
    G('aviator','Aviator','✈️','scommesse','aviator.html','games',num('av_balance'),'Saldo',3),
    G('briscola','Briscola','🃏','scommesse','briscola.html','games',exists(['briscola_save','briscola_scores']),'Giocato',4),
    G('scopa','Scopa','🃏','scommesse','scopa.html','games',exists(['scopa_save','scopa_scores']),'Giocato',4),
    G('uno','UNO','🌈','scommesse','UNO.html','games',exists(['uno_save','uno_scores']),'Giocato',4),

    /* ── Creatività ── */
    G('draw','Draw Studio','🎨','creativita','../projects/draw/index.html','projects',exists(['draw-save','draw_project','draw_history']),'Giocato',4),
    G('aiColorizer','AI Colorizer','🖼️','creativita','../projects/ai-colorizer/index.html','projects',num('aic2_adj'),'Adjust',4),
    G('geneticart','Genetic Art','🧬','creativita','../projects/genetic-art/legacy-genetic-art.html','projects',exists(['genetic_art_save','genetic-art']),'Giocato',4),
    G('birds','Neural Flock','🐦','creativita','../projects/birds/index.html','projects',exists(['birds_save','bird_flock_save']),'Giocato',4),
    G('sierpinski','Sierpinski Lab','🔺','creativita','../projects/sierpinski/index.html','projects',exists(['fractal_obs_v1']),'Giocato',4),
    G('facelab','Face Lab','😊','creativita','../projects/face-lab/index.html','projects',exists(['facelab_sketches']),'Sketch',4),
    G('coloringbook','Coloring Book','🖍️','creativita','coloring_book.html','games',exists(['coloring_book_save','coloring-save']),'Giocato',3),
    G('audioeditor','Audio Editor','🎧','creativita','../projects/audio-editor-pwa/legacy-audio-editor-pwa.html','projects',exists(['audio_editor_save']),'Giocato',4),
    G('filemanager','File Manager','📁','creativita','../projects/file-manager/index.html','projects',exists(['fm_tree_v2']),'Giocato',3),
    G('esposta','Esposta','🎭','creativita','esposta/index.html','games',exists(['esposta_state','esposta_agency']),'Giocato',4),
    G('regno','Regno di Moneta','👑','creativita','regno-di-moneta/index.html','games',exists(['rdm_achievements_v1','rdm_onboarding_done']),'Giocato',4),
    G('votopoli','Votopoli','🗳️','creativita','votopoli/index.html','games',exists(['votopoli_monetization']),'Giocato',4),
    G('referendum','Referendum Game','🗳️','creativita','referendum-game/index.html','games',exists(['rr-nickname']),'Giocato',3),

    /* ── Educazione / PWA ── */
    G('quantumtictactoe2','Quantum Lab','⚛️','educazione','quantum-forge/index.html','games',exists(['quantum-forge']),'Giocato',4),
    G('weblinux','Web Linux','💻','educazione','../projects/web-linux/index.html','projects',exists(['web_linux_save']),'Giocato',4),
    G('rsa','RSA Lab','🔐','educazione','RSA.html','projects',exists(['rsa_save']),'Giocato',4),
    G('solar','Solar System','🪐','educazione','../projects/solar-system-tracker/index.html','projects',exists(['solar_save']),'Giocato',4),
    G('wellness','Hourly Wellness','🧘','educazione','../projects/hourly-wellness-widget/index.html','projects',exists(['hww_stats','hww_settings']),'Giocato',4),
    G('morse','Morse Trainer','📡','educazione','../projects/morse/index.html','projects',exists(['morse_best','morse_stats']),'Giocato',4),
    G('tinyai','Tiny AI','🤖','educazione','../projects/tiny-ai/index.html','projects',exists(['tiny_ai_save']),'Giocato',4)
  ];

    /* ── Nuovi giochi modulari / potenziati ── */
    G('tokyo2','Tokyo Dice','🎲','arcade','tokyo/index.html','games',jsonMaxField('tokyo.save.v1','best'),'Record',5),
    G('watermelon2','Watermelon Merge','🍉','puzzle','watermelon/index.html','games',jsonMaxField('watermelon.save.v1','best'),'Record',5),
    G('slotcollect2','Slot Collect','🎰','scommesse','slot-collect/index.html','games',jsonMaxField('slotcollect.save.v1','best'),'Record',4),
    G('aviator2','Aviator Pro','🛩️','scommesse','aviator/index.html','games',jsonMaxField('aviator.save.v1','best'),'Record',4),
    G('mathduel2','Math Duel','⚡','educazione','math-duel/index.html','games',jsonMaxField('mathduel.save.v1','best'),'Record',5),
    G('pixelrunner2','Pixel Runner','▸','arcade','pixel-runner/index.html','games',jsonMaxField('pixelrunner.save.v1','best'),'Record',5),
    G('rpg2','RPG Adventure','⚔','avventura','rpg/index.html','games',jsonMaxField('rpg-adventure.save.v1','xp'),'XP',5),
    G('cdd2','CDD Run','⛩️','arcade','cdd.html','games',num('cddHighScore'),'Record',5),
    G('shotmind2','Shotmind','🍸','party','shotmind/index.html','games',exists(['shotmind.meta.v1']),'Giocato',4),
    G('quotesmith2','QuoteSmith','❝','quiz','quotesmith/index.html','games',exists(['quotesmith.meta.v1']),'Giocato',4),
    G('skyace','Sky Ace','✈️','arcade','plane.html','games',exists(['skyace.save.v1']),'Giocato',5),
    G('precision','Precision Skating','⛸️','simulazione','precision-skating-game/index.html','games',exists(['ps_state','precision.save.v1']),'Giocato',4),
    G('tramonto','Sunset Compass','🌅','educazione','tramonto/index.html','games',exists(['lang']),'Giocato',3),
    G('chess2','Chess Ranked','♟️','strategia','chess.html','games',exists(['chess.campaign.v1']),'Campagna',6),
    G('dama2','Dama Ranked','🎲','strategia','dama.html','games',exists(['dama.campaign.v1']),'Campagna',6),
    G('backgammon2','Backgammon Ranked','◌','strategia','backgammon.html','games',exists(['backgammon.campaign.v1']),'Campagna',6),
    G('forza42','Forza 4 Ranked','🔴','strategia','forza4.html','games',exists(['forza4.campaign.v1']),'Campagna',5),
    G('battleship2','Battleship Ranked','🚢','strategia','battleship.html','games',exists(['battleship.campaign.v1']),'Campagna',5),
    G('scopa2','Scopa','🧹','cards','scopa.html','games',exists(['scopa.campaign.v1']),'Campagna',4),
    G('farkle2','Farkle','🎲','party','farkle.html','games',exists(['farkle.campaign.v1']),'Campagna',4),
    G('orlog2','Orlog','🪓','strategia','orlog.html','games',exists(['orlog.campaign.v1']),'Campagna',4),
    G('quantumtt','Quantum Tic-Tac-Toe','⚛','strategia','quantum_tictactoe.html','games',exists(['quantum_tictactoe.campaign.v1']),'Campagna',4),
    G('blackjack2','Blackjack','🃏','cards','blackjack.html','games',exists(['blackjack.campaign.v1']),'Campagna',4),
    G('poker2','Poker','♠','cards','poker.html','games',exists(['poker.campaign.v1']),'Campagna',4),
    G('uno2','UNO','🎴','cards','UNO.html','games',exists(['UNO.campaign.v1']),'Campagna',4)

    /* ── Wave P3: arcade rankati ── */
    G('flappy3','Flappy Bird','🐦','arcade','flappy_bird.html','games',exists(['flappy_bird.campaign.v1']),'Campagna',5),
    G('geom3','Geometry Dash','◆','arcade','geom_dash.html','games',exists(['geom_dash.campaign.v1']),'Campagna',5),
    G('invaders3','Space Invaders','👾','arcade','space_invaders.html','games',exists(['space_invaders.campaign.v1']),'Campagna',5),
    G('kart3','Kart','🏎️','arcade','kart.html','games',exists(['kart.meta.v1']),'Giocato',3),
    G('airhockey3','Air Hockey','🏒','arcade','airhockey.html','games',exists(['airhockey.campaign.v1']),'Campagna',5),
    G('brawl3','Brawl Stars','★','arcade','brawl_stars.html','games',exists(['brawl_stars.campaign.v1']),'Campagna',5),
    G('clash3','Clash Royale','♜','strategia','clash_royale.html','games',exists(['clash_royale.meta.v1']),'Giocato',3),
    G('battlelands3','Battlelands','🪖','arcade','battlelands_royale.html','games',exists(['battlelands_royale.campaign.v1']),'Campagna',5),
    G('pinball3','Pinball','🎯','arcade','pinball.html','games',exists(['pinball.campaign.v1']),'Campagna',5),
    G('tetris3','Tetris','🧱','puzzle','tetris.html','games',exists(['tetris.campaign.v1']),'Campagna',5)

    /* ── Wave P4: simulazione / narrativa ── */
    G('animal4','Animal Crossing','🌿','simulazione','animal_crossing.html','games',exists(['animal_crossing.campaign.v1']),'Campagna',5),
    G('tama4','Tamagotchi','♥','simulazione','tamagotchi.html','games',exists(['tamagotchi.campaign.v1']),'Campagna',5),
    G('city4','City Sim','▦','simulazione','city_sim.html','games',exists(['city_sim.campaign.v1']),'Campagna',5),
    G('universe4','Space Universe','🪐','simulazione','space_universe.html','games',exists(['space_universe.meta.v1']),'Giocato',4),
    G('lumina4','Lumina 3D','◇','avventura','3dgame.html','games',exists(['3dgame.campaign.v1']),'Campagna',6),
    G('mystic4','Mystic Quest','🗡️','avventura','mystic-quest.html','games',exists(['mystic-quest.campaign.v1']),'Campagna',5),
    G('pokedex4','Pokédex','●','educazione','pokedex.html','games',exists(['pokedex.meta.v1']),'Giocato',3),
    G('sinibbio4','Sinibbio','🦢','avventura','sinibbio/index.html','games',exists(['sinibbio.meta.v1']),'Giocato',4),
    G('kalaazu4','Kalaazu','🛰️','simulazione','kalaazu/index.html','games',exists(['kalaazu.meta.v1']),'Giocato',4),
    G('warorbit4','War Orbit','🛸','strategia','warorbit/index.html','games',exists(['warorbit.meta.v1']),'Giocato',4),
    G('rivincita4','Rivincita 2D','🏙️','avventura','rivincita/index.html','games',exists(['rivincita.meta.v1']),'Giocato',4),
    G('stanza4','Stanza 9','🛎️','avventura','stanza9/index.html','games',exists(['stanza9.meta.v1']),'Giocato',5),
    G('csiF4','CSI Fidenza','🕵️','avventura','csi-fidenza/index.html','games',exists(['csi-fidenza.meta.v1']),'Giocato',5),
    G('csiM4','CSI Milano','🔎','avventura','csi-milano/index.html','games',exists(['csi-milano.meta.v1']),'Giocato',5),
    G('friends4','Friends Tycoon','♙','simulazione','friends-tycoon/index.html','games',exists(['friends-tycoon.meta.v1']),'Giocato',4)

  /* dedupe by id, just in case */
  var seen = {}, out = [];
  for(var i=0;i<CATALOG.length;i++){
    if(!seen[CATALOG[i].id]){ seen[CATALOG[i].id] = 1; out.push(CATALOG[i]); }
  }
  window.MIRAGGIO_CATALOG = out;
})();
