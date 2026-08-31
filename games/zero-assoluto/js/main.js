/* ZERO ASSOLUTO — gioco principale: menu, setup, duello, deck, diario, 2P */
'use strict';

(() => {
  let S = SaveSys.load();

  const $ = id => document.getElementById(id);
  const el = (tag, cls, parent) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  };

  function save() { SaveSys.store(S); }

  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
    $(id).classList.add('on');
    window.scrollTo(0, 0);
  }

  /* ---------- deck / carte sbloccate ---------- */
  function unlockedIds() {
    const beaten = Object.keys(S.beaten);
    return [...new Set(
      CARDS.filter(c => c.unlock === null || beaten.includes(c.unlock)).map(c => c.id)
    )];
  }
  function cardById(id) { return CARDS.find(c => c.id === id); }

  /* ---------- menu ---------- */
  function renderMenu() {
    const acts = $('menu-actions');
    acts.innerHTML = '';
    const play = el('button', 'btn primary big', acts);
    play.textContent = '⚔️ Sfida un boss';
    play.addEventListener('click', () => showBossMap());
    const pvp = el('button', 'btn', acts);
    pvp.textContent = '🤝 Duello locale (2 giocatori)';
    pvp.addEventListener('click', () => startPvPSetup());
    const deck = el('button', 'btn', acts);
    deck.textContent = '🃏 Costruisci il mazzo (' + (S.deck.length || unlockedIds().length) + ' carte)';
    deck.addEventListener('click', () => showDeckBuilder());
    const diary = el('button', 'btn', acts);
    diary.textContent = '🪶 Il Diario dello Zero';
    diary.addEventListener('click', () => showDiary());
    const cards = el('button', 'btn', acts);
    cards.textContent = '📖 Raccolta carte e schede';
    cards.addEventListener('click', () => showCardCollection());
    const night = el('button', 'btn small', acts);
    night.textContent = S.night ? '☀️ Modalità giorno' : '🌙 Modalità notturna';
    night.addEventListener('click', () => { S.night = !S.night; save(); setNight(S.night); renderMenu(); });
    const mute = el('button', 'btn small', acts);
    mute.textContent = S.muted ? '🔇 Suoni spenti' : '🔊 Suoni accesi';
    mute.addEventListener('click', () => { S.muted = !S.muted; AudioSys.setMuted(S.muted); save(); renderMenu(); });
  }

  function setNight(on) {
    document.body.classList.toggle('night', !!on);
  }

  /* ---------- mappa boss ---------- */
  function showBossMap() {
    show('screen-bossmap');
    const list = $('boss-list');
    list.innerHTML = '';
    BOSSES.forEach((b, i) => {
      const prev = i === 0 || S.beaten[BOSSES[i - 1].id];
      const done = S.beaten[b.id];
      const stars = S.stars[b.id] || 0;
      const card = el('button', 'boss-card' + (done ? ' done' : prev ? '' : ' locked'), list);
      card.innerHTML = '<div class="boss-emoji">' + (prev ? b.emoji : '🔒') + '</div>' +
        '<div class="boss-name">' + b.name + '</div>' +
        '<div class="boss-life">vita: ' + b.life + '</div>' +
        '<div class="boss-diff">' + b.diff + '</div>' +
        (done ? '<div class="boss-stars">' + '⭐'.repeat(stars) + '</div>' : '');
      if (prev) {
        card.addEventListener('click', () => startBossSetup(b));
      }
    });
  }

  /* ---------- setup duello vs boss ---------- */
  let currentBoss = null;
  let setupMode = 'boss'; // 'boss' | 'pvp'
  let pvpPlayer = 1;

  function startBossSetup(b) {
    currentBoss = b;
    setupMode = 'boss';
    show('screen-setup');
    $('setup-title').textContent = b.emoji + ' ' + b.name;
    $('setup-quote').textContent = b.quote;
    $('setup-enemy-label').textContent = 'Vita del boss (firma: ' + b.life + ')';
    $('setup-enemy').value = b.life;
    $('setup-enemy-val').textContent = b.life;
    $('setup-enemy-wrap').style.display = 'none';
    const customToggle = $('setup-custom-enemy');
    customToggle.checked = false;
    customToggle.onchange = () => {
      $('setup-enemy-wrap').style.display = customToggle.checked ? 'block' : 'none';
      $('setup-enemy').value = customToggle.checked ? b.life : b.life;
      $('setup-enemy-val').textContent = b.life;
    };
    renderLifeSliders();
  }

  function startPvPSetup() {
    currentBoss = null;
    setupMode = 'pvp';
    pvpPlayer = 1;
    show('screen-setup');
    $('setup-title').textContent = '🤝 Duello locale';
    $('setup-quote').textContent = 'Due giocatori, un telefono. Passatevi il telefono a ogni turno.';
    $('setup-enemy-label').textContent = 'Vita del Giocatore 2';
    $('setup-enemy-wrap').style.display = 'block';
    $('setup-custom-enemy').checked = true;
    $('setup-custom-enemy').disabled = true;
    $('setup-enemy').value = 100;
    $('setup-enemy-val').textContent = 100;
    $('setup-player-label').textContent = 'Vita del Giocatore 1';
    $('setup-player').value = 100;
    $('setup-player-val').textContent = 100;
    renderLifeSliders();
  }

  function renderLifeSliders() {
    ['player', 'enemy'].forEach(k => {
      const s = $('setup-' + k);
      const v = $('setup-' + k + '-val');
      s.addEventListener('input', () => { v.textContent = s.value; });
      // pulsanti rapidi
      const wrap = $('setup-' + k + '-quick');
      wrap.innerHTML = '';
      [1, 10, 50, 100, 500, 1000, 4096, 10000].forEach(n => {
        const b = el('button', 'btn tiny', wrap);
        b.textContent = n;
        b.addEventListener('click', () => { s.value = n; v.textContent = n; });
      });
    });
  }

  function startBattle() {
    const myLife = Math.max(0, Math.min(10000, parseInt($('setup-player').value) || 100));
    const enemyLife = setupMode === 'boss'
      ? Math.max(0, Math.min(10000, parseInt($('setup-enemy').value) || (currentBoss ? currentBoss.life : 100)))
      : Math.max(0, Math.min(10000, parseInt($('setup-enemy').value) || 100));
    beginDuel(myLife, enemyLife, myLife, enemyLife);
  }

  /* ---------- duello ---------- */
  let G = null; // stato partita

  function beginDuel(myLife, enemyLife, myMax, enemyMax) {
    const deck = (S.deck.length >= 15 ? S.deck : unlockedIds()).slice();
    // in 2P entrambi i giocatori usano lo stesso mazzo costruito
    let enemyDeck;
    if (setupMode === 'pvp') {
      enemyDeck = deck.slice();
    } else {
      // l'AI usa funzioni base; in difficoltà Difficile aggiunge carte campo
      const diff = currentBoss ? currentBoss.diff : 'medio';
      const baseFn = CARDS.filter(c => c.type === 'fn' && c.unlock === null).map(c => c.id);
      enemyDeck = baseFn.slice();
      if (diff === 'difficile') {
        const aiField = ['goccia', 'doppiagoccia', 'interesse', 'ricarica', 'paritacampo', 'zenocampo'];
        for (let i = 0; i < 6; i++) enemyDeck.push(aiField[i]);
      }
    }
    G = {
      myLife, enemyLife, myMax, enemyMax,
      myEnergy: 3, enemyEnergy: 3,
      myHand: [], enemyHand: [],
      myField: [], enemyField: [],   // carte campo attive (id)
      myCounters: {}, enemyCounters: {}, // contatori per carte incrementali
      deck, enemyDeck,
      turn: 'me',
      freeze: false,       // l'avversario salta il prossimo turno
      shield: false,       // il prossimo colpo subito è dimezzato
      double: false,       // la prossima carta-fn si applica due volte
      vampire: false,      // vampirismo attivo per questo turno
      damageTaken: 0,      // riduzione subita in questo turno (per contrattacco)
      lastEnemyCard: null, // ultima carta-fn giocata dall'avversario (per specchio/clonazione)
      lastMyCard: null,
      log: [],
      moves: 0,
      over: false,
      mode: setupMode,
      pvpPlayer: 1,
      boss: currentBoss,
    };
    draw(G.myHand, 4, G.deck);
    draw(G.enemyHand, 4, G.enemyDeck);
    show('screen-duel');
    AudioSys.click();
    if (setupMode === 'pvp') {
      G.pvpPlayer = 1;
      renderDuel();
    } else {
      renderDuel();
    }
    log('⚔️ Inizia il duello! La vita avversaria: ' + enemyLife + '. Portala ESATTAMENTE a 0.');
  }

  function draw(hand, n, deck) {
    for (let i = 0; i < n; i++) {
      if (deck.length === 0) break;
      const idx = Math.floor(Math.random() * deck.length);
      const id = deck.splice(idx, 1)[0];
      hand.push(id);
    }
  }

  function log(msg) {
    G.log.unshift(msg);
    if (G.log.length > 30) G.log.pop();
  }

  function endTurn() {
    if (G.over) return;
    if (G.turn === 'me') {
      // fine turno del giocatore 1 / umano
      G.vampire = false;
      G.turn = 'enemy';
      G.myEnergy = Math.min(10, G.myEnergy + 1);
      if (setupMode === 'pvp') {
        // alterna tra giocatore 1 e 2
        G.pvpPlayer = G.pvpPlayer === 1 ? 2 : 1;
        if (G.pvpPlayer === 2) {
          G.enemyEnergy = Math.min(10, G.enemyEnergy + 1);
          draw(G.enemyHand, 1, G.enemyDeck);
          fieldPhase(2);
          if (G.over) return;
        } else {
          G.myEnergy = Math.min(10, G.myEnergy + 1);
          draw(G.myHand, 1, G.deck);
          G.damageTaken = 0;
          fieldPhase(1);
          if (G.over) return;
        }
        G.turn = 'me';
        renderDuel();
        return;
      }
      if (!G.freeze) {
        draw(G.enemyHand, 1, G.enemyDeck);
        // campo dell'avversario (AI) si attiva
        fieldPhase(2);
        if (G.over) return;
        aiTurn();
      } else {
        G.freeze = false;
        log('❄️ L\'avversario è congelato: salta il turno.');
        G.turn = 'me';
        draw(G.myHand, 1, G.deck);
        G.myEnergy = Math.min(10, G.myEnergy + 1);
        renderDuel();
        return;
      }
    } else {
      // inizio turno del giocatore 1 / umano
      G.turn = 'me';
      G.damageTaken = 0;
      fieldPhase(1);
      if (G.over) return;
      draw(G.myHand, 1, G.deck);
      G.myEnergy = Math.min(10, G.myEnergy + 1);
      renderDuel();
    }
  }

  /* Ruolo attivo (per 2P): giocatore 1 usa myHand/myLife, giocatore 2 enemyHand/enemyLife */
  function role() {
    const p1 = setupMode !== 'pvp' || G.pvpPlayer === 1;
    return {
      p1,
      hand: p1 ? G.myHand : G.enemyHand,
      deck: p1 ? G.deck : G.enemyDeck,
      ownLife: p1 ? G.myLife : G.enemyLife,
      ownMax: p1 ? G.myMax : G.enemyMax,
      targetLife: p1 ? G.enemyLife : G.myLife,
      targetMax: p1 ? G.enemyMax : G.myMax,
      ownEnergy: p1 ? G.myEnergy : G.enemyEnergy,
    };
  }

  /* ---------- carte campo: tick a inizio turno ---------- */
  // attiva gli effetti delle carte campo di "chi" (1 = giocatore 1, 2 = giocatore 2)
  function fieldPhase(who) {
    if (G.over) return;
    const isMe = (setupMode === 'pvp') ? (who === 1) : (who === 1);
    const field = isMe ? G.myField : G.enemyField;
    const counters = isMe ? G.myCounters : G.enemyCounters;
    const targetKey = isMe ? 'enemyLife' : 'myLife';
    const ownKey = isMe ? 'myLife' : 'enemyLife';
    const maxKey = isMe ? 'myMax' : 'enemyMax';
    const ctx = {
      fieldCount: G.myField.length + G.enemyField.length,
      ownFieldCount: field.length,
      oppFieldCount: (isMe ? G.enemyField : G.myField).length,
      maxLife: G[maxKey],
    };

    for (const id of field.slice()) {
      const card = cardById(id);
      if (!card || card.type !== 'field') continue;
      const res = CardEngine.fieldTick(card, G[targetKey], counters[id] || 0, ctx);

      if (res.type === 'damage') {
        if (res.blocked) {
          log('⚠️ ' + card.name + ' [campo]: ' + res.message);
          AudioSys.blocked();
          continue;
        }
        G[targetKey] = Math.max(0, Math.min(G[maxKey], res.value));
        if (res.counter !== undefined) counters[id] = res.counter;
        log('💧 ' + card.name + ' [campo]: ' + res.message);
        AudioSys.hit();
        if (G[targetKey] <= 0) { endGame(isMe); return; }
      } else if (res.type === 'sabotage') {
        const oppField = isMe ? G.enemyField : G.myField;
        if (oppField.length > 0) {
          const victim = oppField.pop();
          log('💣 ' + card.name + ' [campo]: rimossa ' + (cardById(victim) ? cardById(victim).name : victim) + ' dal campo avversario!');
          AudioSys.click();
        } else {
          log('💣 ' + card.name + ' [campo]: campo avversario vuoto.');
        }
      } else if (res.type === 'heal') {
        G[ownKey] = Math.min(G[maxKey], G[ownKey] + res.value);
        log('🌿 ' + card.name + ' [campo]: ' + res.message);
      } else if (res.type === 'energy') {
        if (isMe) G.myEnergy = Math.min(10, G.myEnergy + res.value);
        else G.enemyEnergy = Math.min(10, G.enemyEnergy + res.value);
        log('🔋 ' + card.name + ' [campo]: ' + res.message);
      } else if (res.type === 'passive') {
        // passiva: gestita nel danno
      } else if (res.type === 'none') {
        log('💧 ' + card.name + ' [campo]: ' + res.message);
      }
    }
  }

  function aiTurn() {
    if (G.over) return;
    const diff = G.boss ? G.boss.diff : 'medio';

    // AI Difficile: prova a mettere in campo una carta campo se ne ha una in mano e abbastanza energia
    if (diff === 'difficile') {
      const fieldCards = G.enemyHand.map(cardById).filter(c => c && c.type === 'field');
      for (const fc of fieldCards) {
        if (G.enemyEnergy >= fc.cost && !G.enemyField.includes(fc.id)) {
          const idx = G.enemyHand.indexOf(fc.id);
          G.enemyHand.splice(idx, 1);
          G.enemyField.push(fc.id);
          G.enemyEnergy -= fc.cost;
          log('🤖 L\'avversario mette in campo ' + fc.name + '!');
          AudioSys.click();
          renderDuel();
          return;
        }
      }
    }

    const move = AI.chooseMove(G.enemyHand.map(cardById).filter(Boolean), G.myLife, G.myMax, diff);
    if (!move) {
      log('🤖 L\'avversario non ha mosse valide e passa.');
      G.turn = 'me';
      G.damageTaken = 0;
      fieldPhase(1);
      if (G.over) return;
      draw(G.myHand, 1, G.deck);
      G.myEnergy = Math.min(10, G.myEnergy + 1);
      renderDuel();
      return;
    }
    const card = move.card;
    const idx = G.enemyHand.indexOf(card.id);
    if (idx >= 0) G.enemyHand.splice(idx, 1);
    G.lastEnemyCard = card;
    const res = CardEngine.applyFn(card, G.myLife, G.myMax);
    if (res.ok) {
      let newLife = res.value;
      if (G.shield && newLife < G.myLife) {
        const reduction = Math.floor((G.myLife - newLife) / 2);
        newLife = G.myLife - reduction;
        G.shield = false;
        log('🛡️ Scudo attivo: il colpo è dimezzato.');
      }
      // Torre di Guardia: dimezza il danno subito
      if (G.myField.includes('torre') && newLife < G.myLife) {
        const reduction = Math.floor((G.myLife - newLife) / 2);
        newLife = G.myLife - reduction;
        log('🏰 Torre di Guardia: il colpo è dimezzato.');
      }
      const dmg = G.myLife - newLife;
      G.damageTaken += dmg;
      G.myLife = Math.max(0, Math.min(G.myMax, newLife));
      log('🤖 ' + card.name + ': ' + res.message);
      AudioSys.hit();
      if (G.myLife <= 0) { endGame(false); return; }
    } else {
      log('🤖 ' + card.name + ': ' + res.message);
    }
    // dopo l'AI, il turno torna al giocatore
    G.turn = 'me';
    G.damageTaken = 0;
    fieldPhase(1);
    if (G.over) return;
    draw(G.myHand, 1, G.deck);
    G.myEnergy = Math.min(10, G.myEnergy + 1);
    renderDuel();
  }

  /* Applica una carta del giocatore attivo. Ritorna true se la carta è stata consumata. */
  function playCard(id) {
    if (G.over || G.turn !== 'me') return;
    const card = cardById(id);
    if (!card) return;
    const r = role();
    if (r.ownEnergy < card.cost) {
      log('⚡ Energia insufficiente per ' + card.name + ' (' + card.cost + ').');
      AudioSys.wrong();
      return;
    }
    const idx = r.hand.indexOf(id);
    if (idx < 0) return;

    if (card.type === 'fn') {
      const times = G.double ? 2 : 1;
      let life = r.targetLife;
      let ok = true, lastMsg = '';
      for (let t = 0; t < times; t++) {
        const res = CardEngine.applyFn(card, life, r.targetMax);
        if (!res.ok) {
          ok = false;
          lastMsg = res.message;
          AudioSys.blocked();
          log('⚠️ ' + card.name + ': ' + lastMsg);
          renderDuel(); // aggiorna il log anche quando il colpo è bloccato
          return; // non consuma carta né energia: si può riprovare
        }
        life = res.value;
        lastMsg = res.message;
        if (res.zero) break;
      }
      G.double = false;
      // torre di guardia del difensore (in 2P e vs IA)
      const oldTarget = r.targetLife;
      if (life < oldTarget) {
        const defenderHasTower = r.p1 ? G.enemyField.includes('torre') : G.myField.includes('torre');
        if (defenderHasTower) {
          const reduction = Math.floor((oldTarget - life) / 2);
          life = oldTarget - reduction;
          log('🏰 Torre di Guardia del difensore: il colpo è dimezzato.');
        }
      }
      if (r.p1) { G.myEnergy -= card.cost; G.myHand.splice(idx, 1); G.lastMyCard = card; }
      else { G.enemyEnergy -= card.cost; G.enemyHand.splice(idx, 1); }
      if (r.p1) G.enemyLife = life; else G.myLife = life;
      G.moves++;
      const dmg = oldTarget - life;
      log((r.p1 ? '👉 Tu' : '👉 Giocatore 2') + ' ' + card.name + (times > 1 ? ' ×2' : '') + ': ' + lastMsg);
      AudioSys.hit();
      // vampirismo: metà del danno inflitto cura chi ha giocato
      if (G.vampire && dmg > 0) {
        const heal = Math.floor(dmg / 2);
        if (r.p1) G.myLife = Math.min(G.myMax, G.myLife + heal);
        else G.enemyLife = Math.min(G.enemyMax, G.enemyLife + heal);
        log('🧛 Vampirismo: +' + heal + ' vita.');
      }
      if (G.enemyLife <= 0) { endGame(true); return; }
      if (G.myLife <= 0) { endGame(false); return; }
      renderDuel();
      return;
    }

    // carta campo: resta in gioco
    if (card.type === 'field') {
      if (r.p1) { G.myEnergy -= card.cost; G.myHand.splice(idx, 1); G.myField.push(card.id); }
      else { G.enemyEnergy -= card.cost; G.enemyHand.splice(idx, 1); G.enemyField.push(card.id); }
      G.moves++;
      log((r.p1 ? '👉 Tu' : '👉 Giocatore 2') + ' mette in campo ' + card.name + ' — effetto a ogni inizio del ' + (r.p1 ? 'tuo' : 'suo') + ' turno.');
      AudioSys.click();
      renderDuel();
      return;
    }

    // abilità
    const ctx = {
      targetLife: r.targetLife,
      myLife: G.myLife, enemyLife: G.enemyLife,
      myMax: G.myMax, enemyMax: G.enemyMax,
    };
    const ev = CardEngine.applyAbility(card, ctx);
    if (r.p1) { G.myEnergy -= card.cost; G.myHand.splice(idx, 1); G.lastMyCard = card; }
    else { G.enemyEnergy -= card.cost; G.enemyHand.splice(idx, 1); }
    G.moves++;
    log('✨ ' + card.name + ': ' + ev.message);
    AudioSys.click();

    switch (ev.type) {
      case 'win':
        if (r.p1) G.enemyLife = 0; else G.myLife = 0;
        endGame(r.p1);
        return;
      case 'fail':
        log('✖️ Il colpo fallisce: nessun effetto.');
        break;
      case 'double':
        G.double = true;
        break;
      case 'freeze':
        G.freeze = true;
        break;
      case 'steal':
        if (r.p1) { G.myEnergy = Math.min(10, G.myEnergy + 3); G.enemyEnergy = Math.max(0, G.enemyEnergy - 3); }
        else { G.enemyEnergy = Math.min(10, G.enemyEnergy + 3); G.myEnergy = Math.max(0, G.myEnergy - 3); }
        break;
      case 'draw2':
        draw(r.hand, 2, r.deck);
        break;
      case 'shield':
        G.shield = true;
        break;
      case 'mirror': {
        const last = r.p1 ? G.lastEnemyCard : G.lastMyCard;
        if (last && last.type === 'fn') {
          const res = CardEngine.applyFn(last, r.targetLife, r.targetMax);
          if (res.ok) {
            if (r.p1) G.enemyLife = res.value; else G.myLife = res.value;
            log('🪞 Specchio: ' + last.name + ' riflessa: ' + res.message);
            if (G.enemyLife <= 0) { endGame(true); return; }
            if (G.myLife <= 0) { endGame(false); return; }
          } else {
            log('🪞 Lo specchio rimbalza: ' + res.message);
          }
        } else {
          log('🪞 Nessuna carta avversaria da riflettere.');
        }
        break;
      }
      case 'swap': {
        const t = G.myLife;
        G.myLife = G.enemyLife;
        G.enemyLife = t;
        log('🔁 Ora tu hai ' + G.myLife + ', l\'avversario ' + G.enemyLife + '.');
        if (G.myLife <= 0) { endGame(false); return; }
        if (G.enemyLife <= 0) { endGame(true); return; }
        break;
      }
      case 'heal':
        if (r.p1) G.myLife = Math.min(G.myMax, G.myLife + 50);
        else G.enemyLife = Math.min(G.enemyMax, G.enemyLife + 50);
        break;
      case 'earthquake':
        G.myLife = Math.floor(G.myLife / 2);
        G.enemyLife = Math.floor(G.enemyLife / 2);
        log('🌋 Vite dimezzate: tu ' + G.myLife + ', avversario ' + G.enemyLife + '.');
        if (G.myLife <= 0) { endGame(false); return; }
        if (G.enemyLife <= 0) { endGame(true); return; }
        break;
      case 'reinforce':
        while (r.hand.length < 6 && r.deck.length > 0) {
          draw(r.hand, 1, r.deck);
        }
        log('🃏 Mano rinforzata: ' + r.hand.length + ' carte.');
        break;
      case 'disarm': {
        const oppHand = r.p1 ? G.enemyHand : G.myHand;
        if (oppHand.length > 0) {
          const rnd = Math.floor(Math.random() * oppHand.length);
          const disc = oppHand.splice(rnd, 1)[0];
          log('🤚 L\'avversario scarta ' + (cardById(disc) ? cardById(disc).name : disc) + '.');
        } else {
          log('🤚 L\'avversario non ha carte da scartare.');
        }
        break;
      }
      case 'counter': {
        const taken = G.damageTaken;
        if (taken > 0) {
          const reflected = Math.floor(taken / 2);
          const target = r.p1 ? 'enemyLife' : 'myLife';
          G[target] = Math.max(0, G[target] - reflected);
          log('🪃 Contrattacco: rifletti ' + reflected + ' danni.');
          if (G.enemyLife <= 0) { endGame(true); return; }
          if (G.myLife <= 0) { endGame(false); return; }
        } else {
          log('🪃 Nessun danno subito in questo turno: il contrattacco è vuoto.');
        }
        break;
      }
      case 'vampire':
        G.vampire = true;
        break;
      case 'cancel': {
        const oppField = r.p1 ? G.enemyField : G.myField;
        if (oppField.length > 0) {
          const victim = oppField.pop();
          log('🧹 Rimossa dal campo avversario: ' + (cardById(victim) ? cardById(victim).name : victim) + '.');
        } else {
          log('🧹 Il campo avversario è vuoto: nessuna carta da cancellare.');
        }
        break;
      }
      case 'clone': {
        const last = r.p1 ? G.lastEnemyCard : G.lastMyCard;
        if (last) {
          r.hand.push(last.id);
          log('🧬 Clonata in mano: ' + last.name + '.');
        } else {
          log('🧬 Nessuna carta avversaria da clonare.');
        }
        break;
      }
      case 'recycle': {
        const ownField = r.p1 ? G.myField : G.enemyField;
        if (ownField.length > 0) {
          const victim = ownField.pop();
          if (r.p1) G.myEnergy = Math.min(10, G.myEnergy + 3);
          else G.enemyEnergy = Math.min(10, G.enemyEnergy + 3);
          log('♻️ Riciclata dal tuo campo: ' + (cardById(victim) ? cardById(victim).name : victim) + ' → +3 energia.');
        } else {
          log('♻️ Il tuo campo è vuoto: nulla da riciclare.');
        }
        break;
      }
      case 'transfer': {
        const oppField = r.p1 ? G.enemyField : G.myField;
        if (oppField.length > 0) {
          const stolen = oppField.pop();
          const ownField = r.p1 ? G.myField : G.enemyField;
          ownField.push(stolen);
          log('📦 Trasferita nel tuo campo: ' + (cardById(stolen) ? cardById(stolen).name : stolen) + '!');
        } else {
          log('📦 Il campo avversario è vuoto: nulla da trasferire.');
        }
        break;
      }
      case 'monty':
        showMontyHall();
        return; // gestito dall'overlay (turno non consumato finché non risolvi)
      case 'pascalbet': {
        const heads = Math.random() < 0.5;
        if (heads) {
          const target = r.p1 ? 'enemyLife' : 'myLife';
          const newVal = Math.floor(G[target] / 2);
          if (newVal === 0) {
            G[target] = 0;
            log('⚖️ Testa! La vita avversaria si dimezza a 0: ZERO ASSOLUTO!');
            endGame(r.p1);
            return;
          }
          G[target] = newVal;
          log('⚖️ Testa! Vita avversaria dimezzata: ' + newVal + '.');
        } else {
          log('⚖️ Croce… la scommessa di Pascal non paga. (Nessun effetto.)');
        }
        break;
      }
      case 'casino': {
        const dmg = Math.floor(Math.random() * 11); // 0..10
        const target = r.p1 ? 'enemyLife' : 'myLife';
        const newVal = G[target] - dmg;
        if (newVal < 0) {
          log('🎰 Il banco tira ' + dmg + ', ma trabocca: il colpo è bloccato (serve zero esatto).');
          break;
        }
        G[target] = newVal;
        log('🎰 Casino: −' + dmg + ' alla vita avversaria (' + newVal + ').');
        if (G[target] <= 0) { endGame(r.p1); return; }
        break;
      }
      case 'bayes': {
        // rivela la prossima carta del mazzo avversario e chiedi se scartarla
        const oppDeck = r.p1 ? G.enemyDeck : G.deck;
        if (oppDeck.length === 0) {
          log('🔬 Il mazzo avversario è vuoto: niente da rivelare.');
          break;
        }
        const next = cardById(oppDeck[0]);
        $('abil-card').innerHTML = '<div class="card big-card"><div class="card-emoji">' + next.emoji + '</div>' +
          '<div class="card-name">' + next.name + '</div><div class="card-cost">⚡' + next.cost + '</div></div>';
        $('abil-desc').textContent = '🔬 Teorema di Bayes: P(A|B) = P(B|A)·P(A)/P(B). La prossima carta del mazzo avversario è «' + next.name + '». Vuoi scartarla?';
        const acts = $('abil-acts');
        acts.innerHTML = '';
        const si = el('button', 'btn primary', acts);
        si.textContent = '🗑️ Scarta';
        si.addEventListener('click', () => {
          oppDeck.shift();
          log('🔬 Bayes: scartata «' + next.name + '» dal mazzo avversario.');
          $('abil-overlay').classList.remove('on');
          renderDuel();
        });
        const no = el('button', 'btn', acts);
        no.textContent = '🔍 Lascia';
        no.addEventListener('click', () => {
          log('🔬 Bayes: lasciata «' + next.name + '». Sapere cambia la probabilità: ora puoi prepararti.');
          $('abil-overlay').classList.remove('on');
          renderDuel();
        });
        $('abil-overlay').classList.add('on');
        return; // gestito dall'overlay
      }
      case 'valoreatteso': {
        const d1 = 1 + Math.floor(Math.random() * 6);
        const d2 = 1 + Math.floor(Math.random() * 6);
        const d3 = 1 + Math.floor(Math.random() * 6);
        const media = Math.round((d1 + d2 + d3) / 3);
        const target = r.p1 ? 'enemyLife' : 'myLife';
        const newVal = G[target] - media;
        log('📐 Dadi: ' + d1 + ', ' + d2 + ', ' + d3 + ' → media ' + media + ' (E[1d6]=3,5).');
        if (newVal < 0) {
          log('📐 Media ' + media + ', ma trabocca: bloccato (serve zero esatto).');
          break;
        }
        G[target] = newVal;
        log('📐 Valore Atteso: −' + media + ' (' + newVal + ').');
        if (G[target] <= 0) { endGame(r.p1); return; }
        break;
      }
      case 'raddoppio': {
        const heads = Math.random() < 0.5;
        if (heads) {
          if (r.p1) G.myEnergy = Math.min(10, G.myEnergy + 6);
          else G.enemyEnergy = Math.min(10, G.enemyEnergy + 6);
          log('💰 Testa! +6 energia (netto +3). E = ½·6 − 3 = 0: un gioco equo.');
        } else {
          log('💰 Croce… hai perso la scommessa di 3 energia. Il valore atteso era zero.');
          AudioSys.wrong();
        }
        break;
      }
    }
    renderDuel();
  }

  /* ---------- render duello ---------- */
  function renderDuel() {
    if (!G) return;
    const r = role();
    // vite
    const myLabel = setupMode === 'pvp' ? 'G1' : 'Tu';
    const enLabel = setupMode === 'pvp' ? 'G2' : 'Boss';
    $('duel-my-label').textContent = myLabel;
    $('duel-enemy-label').textContent = enLabel;
    $('duel-my-life').textContent = G.myLife;
    $('duel-enemy-life').textContent = G.enemyLife;
    $('duel-my-bar').style.width = (G.myLife / G.myMax * 100) + '%';
    $('duel-enemy-bar').style.width = (G.enemyLife / G.enemyMax * 100) + '%';
    // energia
    $('duel-my-energy').textContent = '⚡ ' + G.myEnergy;
    $('duel-enemy-energy').textContent = '⚡ ' + G.enemyEnergy;
    // turno
    const who = setupMode === 'pvp' ? ('Giocatore ' + G.pvpPlayer) : 'Tu';
    $('duel-turn').textContent = G.over ? '' : (G.turn === 'me' ? '🎯 Turno di ' + who : '🤖 Turno avversario');
    // stato
    const st = [];
    if (G.double) st.push('×2 prossima carta');
    if (G.shield) st.push('🛡️ scudo');
    if (G.freeze) st.push('❄️ avversario congelato');
    if (G.vampire) st.push('🧛 vampirismo');
    $('duel-status').textContent = st.join(' · ');

    // campi
    const myFieldEl = $('duel-my-field');
    myFieldEl.innerHTML = '';
    const enFieldEl = $('duel-enemy-field');
    enFieldEl.innerHTML = '';
    const renderField = (list, container) => {
      if (!list.length) {
        const e = el('span', 'field-empty', container);
        e.textContent = '—';
        return;
      }
      list.forEach(id => {
        const c = cardById(id);
        if (!c) return;
        const f = el('span', 'field-chip', container);
        f.textContent = c.emoji + ' ' + c.name;
        f.title = c.lesson;
      });
    };
    renderField(G.myField, myFieldEl);
    renderField(G.enemyField, enFieldEl);
    const myFieldLabel = $('duel-my-field-label');
    const enFieldLabel = $('duel-enemy-field-label');
    myFieldLabel.textContent = (setupMode === 'pvp' ? 'Campo G1' : 'Il tuo campo');
    enFieldLabel.textContent = (setupMode === 'pvp' ? 'Campo G2' : 'Campo avversario');
    // mano (del giocatore attivo)
    const hand = $('duel-hand');
    hand.innerHTML = '';
    r.hand.forEach(id => {
      const c = cardById(id);
      if (!c) return;
      const card = el('button', 'card' + (c.type === 'ability' ? ' ability' : c.type === 'field' ? ' field' : ''), hand);
      card.innerHTML = '<div class="card-emoji">' + c.emoji + '</div>' +
        '<div class="card-name">' + c.name + '</div>' +
        '<div class="card-cost">⚡' + c.cost + '</div>';
      card.title = c.lesson;
      card.addEventListener('click', () => {
        AudioSys.click();
        if (c.type === 'ability') showAbilityConfirm(c);
        else playCard(c.id);
      });
    });
    if (r.hand.length === 0) {
      const e = el('div', 'empty', hand);
      e.textContent = 'Mano vuota: termina il turno per pescare.';
    }
    // log
    const logEl = $('duel-log');
    logEl.innerHTML = '';
    G.log.forEach(m => {
      const p = el('div', 'log-line', logEl);
      p.textContent = m;
    });
    // abilita/disabilita termina turno
    $('btn-endturn').disabled = G.over || G.turn !== 'me';
    $('btn-endturn').textContent = setupMode === 'pvp'
      ? '🔁 Passa al Giocatore ' + (G.pvpPlayer === 1 ? 2 : 1)
      : '⏭️ Termina il turno';
  }

  function showAbilityConfirm(c) {
    $('abil-card').innerHTML = '<div class="card big-card"><div class="card-emoji">' + c.emoji + '</div>' +
      '<div class="card-name">' + c.name + '</div><div class="card-cost">⚡' + c.cost + '</div>' +
      '<div class="card-lesson">' + c.lesson + '</div></div>';
    $('abil-desc').textContent = c.desc;
    const acts = $('abil-acts');
    acts.innerHTML = '';
    const yes = el('button', 'btn primary', acts);
    yes.textContent = '✨ Usa';
    yes.addEventListener('click', () => {
      $('abil-overlay').classList.remove('on');
      playCard(c.id);
    });
    const no = el('button', 'btn', acts);
    no.textContent = 'Annulla';
    no.addEventListener('click', () => $('abil-overlay').classList.remove('on'));
    $('abil-overlay').classList.add('on');
  }

  /* ---------- Paradosso di Monty Hall ---------- */
  function showMontyHall() {
    const prize = Math.floor(Math.random() * 3);
    let picked = null, revealed = null;
    const overlay = $('monty-overlay');
    const doors = $('monty-doors');
    const info = $('monty-info');
    doors.innerHTML = '';
    info.textContent = 'Tre porte, un premio nascosto (−10 al nemico, o vittoria se la sua vita è ≤ 10). Scegli una porta.';
    // fasi: 0 = scelta iniziale, 1 = decidere se cambiare
    let phase = 0;

    function reveal(keep) {
      const finalDoor = keep ? picked : [0, 1, 2].find(d => d !== picked && d !== revealed);
      const won = finalDoor === prize;
      const r = role();
      const target = r.p1 ? 'enemyLife' : 'myLife';
      if (won) {
        const v = G[target] - 10;
        if (v <= 0) {
          G[target] = 0;
          info.innerHTML = '🚪 Il premio era dietro la porta ' + (prize + 1) + '! La vita avversaria va a ZERO — vittoria!';
          overlay.classList.remove('on');
          endGame(r.p1);
          return;
        }
        G[target] = v;
        info.innerHTML = '🚪 Il premio era dietro la porta ' + (prize + 1) + '! −10 al nemico (' + v + '). ' +
          (keep ? 'Hai tenuto: 1/3 di probabilità.' : 'Hai cambiato: vinci nel 2/3 dei casi!');
      } else {
        info.innerHTML = '🚪 Il premio era dietro la porta ' + (prize + 1) + ': hai perso. ' +
          (keep ? 'Tenere vince solo 1 volta su 3.' : 'Cambiare vince 2 volte su 3: il paradosso di Monty Hall.');
        AudioSys.wrong();
      }
      // rivela tutte le porte
      doors.querySelectorAll('.monty-door').forEach((d, i) => {
        d.textContent = i === prize ? '🏆' : '🐐';
        d.classList.add('done');
      });
      const again = el('button', 'btn primary', $('monty-acts'));
      again.textContent = 'Chiudi';
      again.addEventListener('click', () => { overlay.classList.remove('on'); renderDuel(); });
    }

    for (let i = 0; i < 3; i++) {
      const d = el('button', 'monty-door', doors);
      d.textContent = '🚪';
      d.addEventListener('click', () => {
        if (phase === 0) {
          picked = i;
          // l'host apre una porta vuota (non scelta, non premio)
          const others = [0, 1, 2].filter(x => x !== picked && x !== prize);
          revealed = others[Math.floor(Math.random() * others.length)];
          doors.querySelectorAll('.monty-door').forEach((x, j) => {
            if (j === revealed) { x.textContent = '🐐'; x.classList.add('done'); }
          });
          info.innerHTML = 'L\'host apre la porta ' + (revealed + 1) + ': una capra! Vuoi CAMBIARE porta o TENERE la ' + (picked + 1) + '?';
          phase = 1;
          const acts = $('monty-acts');
          acts.innerHTML = '';
          const keep = el('button', 'btn', acts);
          keep.textContent = '🔒 Tieni la ' + (picked + 1);
          keep.addEventListener('click', () => reveal(true));
          const swap = el('button', 'btn primary', acts);
          swap.textContent = '🔄 Cambia porta (2/3!)';
          swap.addEventListener('click', () => reveal(false));
        }
      });
    }
    $('monty-acts').innerHTML = '';
    overlay.classList.add('on');
    AudioSys.click();
  }

  function endGame(p1Won) {
    G.over = true;
    if (p1Won) AudioSys.zero(); else AudioSys.wrong();
    renderDuel();

    if (setupMode === 'pvp') {
      const winner = p1Won ? 'Giocatore 1' : 'Giocatore 2';
      showEnd('🤝', winner + ' vince il duello!', 'Colpo perfetto: zero assoluto. Il telefono può passare di mano, ma la gloria resta.');
      return;
    }

    if (p1Won) {
      const b = G.boss;
      // stelle: 3 se vita residua alta, 2 media, 1 bassa
      const ratio = G.myLife / G.myMax;
      const stars = ratio >= 0.7 ? 3 : ratio >= 0.4 ? 2 : 1;
      const first = !S.beaten[b.id];
      S.beaten[b.id] = true;
      S.stars[b.id] = Math.max(S.stars[b.id] || 0, stars);
      // sblocca carte premio (se non sono carte base già disponibili)
      [b.reward, b.reward2].filter(Boolean).forEach(rid => {
        const rewardCard = cardById(rid);
        if (rewardCard && rewardCard.unlock !== null) {
          S.unlockedCards = [...new Set([...S.unlockedCards, rid])];
        }
      });
      // best score
      S.bestScore = Math.max(S.bestScore || 0, Object.keys(S.beaten).length);
      save();
      const rewardName = b.reward ? cardById(b.reward).name : '';
      showEnd(b.emoji, b.name + ' sconfitto!', b.meditazione, '⭐'.repeat(stars), first && rewardName ? '🎁 Carta sbloccata: ' + rewardName : '');
    } else {
      showEnd('💀', 'Sei stato azzerato…', 'Ma lo zero è anche un nuovo inizio: riprova, Duellante.');
    }
  }

  function showEnd(emoji, title, text, stars, extra) {
    $('end-emoji').textContent = emoji;
    $('end-title').textContent = title;
    $('end-text').textContent = text;
    $('end-stars').textContent = stars || '';
    $('end-extra').textContent = extra || '';
    const acts = $('end-acts');
    acts.innerHTML = '';
    const again = el('button', 'btn primary', acts);
    again.textContent = '⚔️ Nuovo duello';
    again.addEventListener('click', () => { $('end-overlay').classList.remove('on'); showBossMap(); });
    const menu = el('button', 'btn', acts);
    menu.textContent = '🏠 Menu';
    menu.addEventListener('click', () => { $('end-overlay').classList.remove('on'); show('screen-menu'); renderMenu(); });
    $('end-overlay').classList.add('on');
  }

  /* ---------- deck builder ---------- */
  function showDeckBuilder() {
    show('screen-deck');
    const list = $('deck-list');
    list.innerHTML = '';
    const current = S.deck.length >= 15 ? S.deck.slice() : unlockedIds().slice();
    const base = unlockedIds();
    base.forEach(id => {
      const c = cardById(id);
      const inDeck = current.includes(id);
      const card = el('button', 'deck-card' + (inDeck ? ' in' : ''), list);
      card.innerHTML = '<div class="card-emoji">' + c.emoji + '</div>' +
        '<div class="deck-info"><div class="card-name">' + c.name + '</div>' +
        '<div class="card-cost">⚡' + c.cost + '</div></div>' +
        '<div class="deck-tick">' + (inDeck ? '✓' : '') + '</div>';
      card.addEventListener('click', () => {
        const i = current.indexOf(id);
        if (i >= 0) current.splice(i, 1);
        else current.push(id);
        showDeckBuilder();
      });
    });
    $('deck-count').textContent = 'Carte nel mazzo: ' + current.length + ' (min 15)';
    $('deck-save').disabled = current.length < 15;
    $('deck-save').onclick = () => {
      S.deck = current.slice();
      save();
      AudioSys.chime();
      $('deck-saved').textContent = '✅ Mazzo salvato!';
      setTimeout(() => { $('deck-saved').textContent = ''; }, 2000);
    };
  }

  /* ---------- raccolta carte ---------- */
  function showCardCollection() {
    show('screen-cards');
    const list = $('card-list');
    list.innerHTML = '';
    const unlocked = unlockedIds();
    CARDS.forEach(c => {
      const have = unlocked.includes(c.id);
      const card = el('button', 'collection-card' + (have ? '' : ' locked'), list);
      card.innerHTML = '<div class="card-emoji">' + (have ? c.emoji : '🔒') + '</div>' +
        '<div class="collection-info"><div class="card-name">' + c.name + '</div>' +
        '<div class="card-cost">⚡' + c.cost + ' · ' + c.desc + '</div></div>';
      if (have) {
        card.addEventListener('click', () => showCardSheet(c));
      } else {
        const b = BOSSES.find(x => x.reward === c.id);
        const t = el('div', 'card-locked-by', card);
        t.textContent = b ? 'Sconfiggi: ' + b.name : 'Carta base';
      }
    });
  }

  function showCardSheet(c) {
    $('sheet-emoji').textContent = c.emoji;
    $('sheet-name').textContent = c.name;
    $('sheet-desc').textContent = c.desc + ' · ⚡' + c.cost;
    $('sheet-lesson').textContent = c.lesson;
    $('sheet-formal').textContent = c.formal;
    $('sheet-overlay').classList.add('on');
    AudioSys.click();
  }

  /* ---------- diario ---------- */
  function showDiary() {
    show('screen-diary');
    const list = $('diary-list');
    list.innerHTML = '';
    DIARY_QUESTIONS.forEach((q, i) => {
      const card = el('div', 'diary-card', list);
      const qEl = el('div', 'diary-q', card);
      qEl.textContent = (i + 1) + '. ' + q.q;
      const hint = el('div', 'diary-hint', card);
      hint.textContent = '🌱 ' + q.hint;
      const ta = el('textarea', 'diary-ta', card);
      ta.placeholder = 'Scrivi qui il tuo pensiero…';
      ta.value = S.notes[i] || '';
      ta.addEventListener('input', () => { S.notes[i] = ta.value; save(); });
    });
    $('diary-footer').textContent = DIARY_FOOTER;
  }

  function exportDiary() {
    const lines = [];
    lines.push('ZERO ASSOLUTO — Il Diario dello Zero');
    lines.push('Generato il ' + new Date().toLocaleString('it-IT'));
    lines.push('Boss sconfitti: ' + Object.keys(S.beaten).length + ' / ' + BOSSES.length);
    lines.push('Stelle totali: ' + Object.values(S.stars).reduce((a, b) => a + b, 0));
    lines.push('');
    DIARY_QUESTIONS.forEach((q, i) => {
      lines.push((i + 1) + '. ' + q.q);
      lines.push('   Risposta: ' + ((S.notes[i] && S.notes[i].trim()) ? S.notes[i].trim() : '(nessuna risposta)'));
      lines.push('');
    });
    lines.push(DIARY_FOOTER);
    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'diario-zero-assoluto.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    $('diary-export').textContent = '✅ Esportato!';
    setTimeout(() => { $('diary-export').textContent = '📤 Esporta il Diario (.txt)'; }, 2000);
    AudioSys.click();
  }

  /* ---------- eventi globali ---------- */
  $('btn-endturn').addEventListener('click', () => { AudioSys.click(); endTurn(); });
  $('btn-start').addEventListener('click', () => startBattle());
  $('sheet-close').addEventListener('click', () => $('sheet-overlay').classList.remove('on'));
  $('abil-cancel').addEventListener('click', () => $('abil-overlay').classList.remove('on'));
  $('diary-export').addEventListener('click', () => exportDiary());
  $('btn-back-bossmap').addEventListener('click', () => { show('screen-menu'); renderMenu(); });
  $('btn-back-setup').addEventListener('click', () => showBossMap());
  $('btn-back-deck').addEventListener('click', () => { show('screen-menu'); renderMenu(); });
  $('btn-back-cards').addEventListener('click', () => { show('screen-menu'); renderMenu(); });
  $('btn-back-diary').addEventListener('click', () => { show('screen-menu'); renderMenu(); });
  $('btn-back-duel').addEventListener('click', () => { show('screen-menu'); renderMenu(); });

  document.addEventListener('pointerdown', () => AudioSys.unlock(), { once: true });

  /* ---------- avvio ---------- */
  AudioSys.setMuted(S.muted);
  setNight(S.night);
  renderMenu();
  show('screen-menu');
})();
