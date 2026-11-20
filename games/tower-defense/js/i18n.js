/* Dizionario bilingue autonomo: nessuna dipendenza dai file i18n del sito,
   cosi' il gioco resta completamente offline. */

const DICT = {
  it: {
    'app.title': 'Tower Defense',
    'app.subtitle': 'Difendi il percorso. Comanda il campo.',
    'nav.games': '🎮 Giochi',
    'nav.home': '← Home',
    'lang.label': 'Lingua',

    'menu.title': 'TOWER DEFENSE',
    'menu.tagline': 'Costruisci. Potenzia. Resisti.',
    'menu.subtitle': 'Scegli una modalità e difendi il percorso dalle ondate nemiche.',
    'menu.modes': 'MODALITÀ DI GIOCO',
    'menu.start': 'INIZIA',
    'menu.records': 'RECORD PERSONALI',
    'menu.noRecord': 'Nessun record — gioca la tua prima partita!',
    'menu.best': 'Onda {wave} · Punteggio {score}',
    'menu.bestTime': 'Tempo {time}',
    'menu.howto': 'COME SI GIOCA',
    'menu.install': 'Installa app',
    'menu.installed': 'App installata ✓',

    'mode.campaign.name': 'Campagna',
    'mode.campaign.desc': 'Onde infinite, potenza che cresce e un boss ogni 5 ondate.',
    'mode.endless.name': 'Endless',
    'mode.endless.desc': 'Sopravvivenza senza fine con ritmo aggressivo e record personale.',
    'mode.challenge.name': 'Challenge 20',
    'mode.challenge.desc': 'Venti ondate, un cronometro e la schermata di vittoria finale.',
    'mode.hardcore.name': 'Hardcore',
    'mode.hardcore.desc': 'Solo 5 vite, nemici più forti, ma ricompense doppie.',
    'mode.sandbox.name': 'Sandbox',
    'mode.sandbox.desc': 'Denaro illimitato e nessuna sconfitta. Sperimenta liberamente.',

    'hud.lives': 'Vite',
    'hud.money': 'Denaro',
    'hud.wave': 'Onda',
    'hud.score': 'Punteggio',
    'hud.time': 'Tempo',
    'hud.speed': 'Velocità',
    'hud.nextWave': 'Prossima onda',
    'hud.waveActive': 'Onda in corso',
    'hud.pause': 'Pausa',
    'hud.mute': 'Audio',
    'hud.soundOn': 'Audio attivo',
    'hud.soundOff': 'Audio disattivato',
    'hud.enemies': 'Nemici',

    'shop.title': 'ARSENALE',
    'tower.basic.name': 'Fucile',
    'tower.basic.desc': 'Economico e affidabile. Buon equilibrio di danno e portata.',
    'tower.sniper.name': 'Cecchino',
    'tower.sniper.desc': 'Gittata enorme, colpi potenti e lenti. Ideale contro i tank.',
    'tower.rapid.name': 'Mitra',
    'tower.rapid.desc': 'Fuoco rapidissimo a corto raggio. Perfetto sugli sciami.',
    'tower.frost.name': 'Gelo',
    'tower.frost.desc': 'Rallenta i nemici colpiti. Un alleato di tutte le torri.',
    'tower.cannon.name': 'Cannone',
    'tower.cannon.desc': 'Danno ad area: colpisce più nemici in una volta.',
    'tower.laser.name': 'Laser',
    'tower.laser.desc': 'Fascio continuo che brucia il bersaglio senza fermarsi.',
    'tower.tesla.name': 'Tesla',
    'tower.tesla.desc': 'Scariche a catena che rimbalzano tra i nemici vicini.',

    'target.label': 'Bersaglio',
    'target.close': 'Vicino',
    'target.first': 'In testa',
    'target.strong': 'Più forte',
    'upgrade.title': 'POTENZIA TORRE',
    'upgrade.level': 'Livello',
    'upgrade.damage': 'Danno',
    'upgrade.range': 'Portata',
    'upgrade.rate': 'Cadenza',
    'upgrade.button': 'Potenzia',
    'upgrade.max': 'Livello massimo',
    'upgrade.sell': 'Vendi',
    'upgrade.dps': 'DPS',

    'pause.title': 'IN PAUSA',
    'pause.resume': 'Riprendi',
    'pause.restart': 'Riavvia',
    'pause.menu': 'Menu principale',

    'over.title': 'GAME OVER',
    'over.victory': 'VITTORIA!',
    'over.defeat': 'Il percorso è caduto.',
    'over.complete': 'Hai completato tutte le 20 ondate!',
    'over.score': 'Punteggio',
    'over.wave': 'Onda raggiunta',
    'over.kills': 'Nemici sconfitti',
    'over.time': 'Tempo',
    'over.best': 'Record personale',
    'over.newRecord': 'NUOVO RECORD!',
    'over.retry': 'Riprova',
    'over.menu': 'Menu principale',

    'howto.title': 'Come si gioca',
    'howto.p1': 'Tocca una torre nell’arsenale, poi tocca un punto libero della mappa per piazzarla. Non puoi costruire sul percorso.',
    'howto.p2': 'Tocca una torre già piazzata per potenziarla, cambiarne il bersaglio o venderla. Le torri guadagnano livello fino a 8.',
    'howto.p3': 'Premi “Prossima onda” per iniziare. I nemici che raggiungono la fine tolgono vite: a zero vite la partita finisce.',
    'howto.keys': 'Scorciatoie: 1–7 seleziona torre · Spazio onda · P pausa · Esc annulla · + / − velocità',
    'howto.close': 'Ho capito',

    'msg.noMoney': 'Denaro insufficiente!',
    'msg.blocked': 'Non puoi costruire qui!',
    'msg.placed': 'Torre piazzata',
    'msg.upgraded': 'Torre potenziata',
    'msg.sold': 'Torre venduta',
    'msg.waveStart': 'Onda {wave} in arrivo!',
    'msg.boss': '⚠ BOSS IN ARRIVO!',
    'msg.waveClear': 'Onda {wave} completata +{bonus}',
    'msg.leak': 'Un nemico è passato!',
    'msg.speed': 'Velocità {speed}×',
    'msg.unlocked': 'Nuova torre sbloccata: {name}!',
    'msg.locked': 'Torre non ancora sbloccata!',
    'msg.newBest': 'Nuovo record!',

    'status.offline': 'Offline — modalità senza connessione attiva',
    'status.online': 'Online',
    'update.title': 'Nuova versione disponibile',
    'update.button': 'Aggiorna',
    'common.close': 'Chiudi',
    'common.seconds': '{s}s',
    'common.level': 'Lv {n}'
  },

  en: {
    'app.title': 'Tower Defense',
    'app.subtitle': 'Defend the path. Command the field.',
    'nav.games': '🎮 Games',
    'nav.home': '← Home',
    'lang.label': 'Language',

    'menu.title': 'TOWER DEFENSE',
    'menu.tagline': 'Build. Upgrade. Survive.',
    'menu.subtitle': 'Pick a mode and defend the path from enemy waves.',
    'menu.modes': 'GAME MODES',
    'menu.start': 'START',
    'menu.records': 'PERSONAL RECORDS',
    'menu.noRecord': 'No records yet — play your first match!',
    'menu.best': 'Wave {wave} · Score {score}',
    'menu.bestTime': 'Time {time}',
    'menu.howto': 'HOW TO PLAY',
    'menu.install': 'Install app',
    'menu.installed': 'App installed ✓',

    'mode.campaign.name': 'Campaign',
    'mode.campaign.desc': 'Endless waves, steady scaling and a boss every 5 waves.',
    'mode.endless.name': 'Endless',
    'mode.endless.desc': 'Non-stop survival with aggressive pacing and a personal best.',
    'mode.challenge.name': 'Challenge 20',
    'mode.challenge.desc': 'Twenty waves, a stopwatch and a final victory screen.',
    'mode.hardcore.name': 'Hardcore',
    'mode.hardcore.desc': 'Only 5 lives, tougher enemies, but double rewards.',
    'mode.sandbox.name': 'Sandbox',
    'mode.sandbox.desc': 'Unlimited money and no defeat. Experiment freely.',

    'hud.lives': 'Lives',
    'hud.money': 'Money',
    'hud.wave': 'Wave',
    'hud.score': 'Score',
    'hud.time': 'Time',
    'hud.speed': 'Speed',
    'hud.nextWave': 'Next wave',
    'hud.waveActive': 'Wave in progress',
    'hud.pause': 'Pause',
    'hud.mute': 'Sound',
    'hud.soundOn': 'Sound on',
    'hud.soundOff': 'Sound off',
    'hud.enemies': 'Enemies',

    'shop.title': 'ARSENAL',
    'tower.basic.name': 'Rifle',
    'tower.basic.desc': 'Cheap and reliable. Balanced damage and range.',
    'tower.sniper.name': 'Sniper',
    'tower.sniper.desc': 'Huge range, powerful slow shots. Great against tanks.',
    'tower.rapid.name': 'SMG',
    'tower.rapid.desc': 'Extremely fast fire at short range. Perfect for swarms.',
    'tower.frost.name': 'Frost',
    'tower.frost.desc': 'Slows enemies on hit. A great ally for every tower.',
    'tower.cannon.name': 'Cannon',
    'tower.cannon.desc': 'Area damage: hits several enemies at once.',
    'tower.laser.name': 'Laser',
    'tower.laser.desc': 'Continuous beam that burns its target without stopping.',
    'tower.tesla.name': 'Tesla',
    'tower.tesla.desc': 'Chain lightning bouncing between nearby enemies.',

    'target.label': 'Targeting',
    'target.close': 'Closest',
    'target.first': 'First',
    'target.strong': 'Strongest',
    'upgrade.title': 'UPGRADE TOWER',
    'upgrade.level': 'Level',
    'upgrade.damage': 'Damage',
    'upgrade.range': 'Range',
    'upgrade.rate': 'Rate',
    'upgrade.button': 'Upgrade',
    'upgrade.max': 'Max level',
    'upgrade.sell': 'Sell',
    'upgrade.dps': 'DPS',

    'pause.title': 'PAUSED',
    'pause.resume': 'Resume',
    'pause.restart': 'Restart',
    'pause.menu': 'Main menu',

    'over.title': 'GAME OVER',
    'over.victory': 'VICTORY!',
    'over.defeat': 'The path has fallen.',
    'over.complete': 'You cleared all 20 waves!',
    'over.score': 'Score',
    'over.wave': 'Wave reached',
    'over.kills': 'Enemies defeated',
    'over.time': 'Time',
    'over.best': 'Personal best',
    'over.newRecord': 'NEW RECORD!',
    'over.retry': 'Retry',
    'over.menu': 'Main menu',

    'howto.title': 'How to play',
    'howto.p1': 'Tap a tower in the arsenal, then tap a free spot on the map to place it. You cannot build on the path.',
    'howto.p2': 'Tap an already placed tower to upgrade it, change its targeting or sell it. Towers reach level 8.',
    'howto.p3': 'Press "Next wave" to start. Enemies reaching the end cost lives: at zero lives the game ends.',
    'howto.keys': 'Shortcuts: 1–7 select tower · Space wave · P pause · Esc cancel · + / − speed',
    'howto.close': 'Got it',

    'msg.noMoney': 'Not enough money!',
    'msg.blocked': 'You cannot build here!',
    'msg.placed': 'Tower placed',
    'msg.upgraded': 'Tower upgraded',
    'msg.sold': 'Tower sold',
    'msg.waveStart': 'Wave {wave} incoming!',
    'msg.boss': '⚠ BOSS INCOMING!',
    'msg.waveClear': 'Wave {wave} cleared +{bonus}',
    'msg.leak': 'An enemy slipped through!',
    'msg.speed': 'Speed {speed}×',
    'msg.unlocked': 'New tower unlocked: {name}!',
    'msg.locked': 'Tower not unlocked yet!',
    'msg.newBest': 'New record!',

    'status.offline': 'Offline — running without connection',
    'status.online': 'Online',
    'update.title': 'New version available',
    'update.button': 'Update',
    'common.close': 'Close',
    'common.seconds': '{s}s',
    'common.level': 'Lv {n}'
  }
};

const listeners = new Set();
let current = readStoredLang();

function readStoredLang() {
  try {
    const saved = localStorage.getItem('td_lang');
    if (saved === 'it' || saved === 'en') return saved;
  } catch (e) { /* storage disabled */ }
  try {
    return (navigator.language || 'en').toLowerCase().startsWith('it') ? 'it' : 'en';
  } catch (e) { return 'en'; }
}

export function getLang() { return current; }

export function setLang(lang) {
  if (lang !== 'it' && lang !== 'en') return;
  current = lang;
  try { localStorage.setItem('td_lang', lang); } catch (e) { /* ignore */ }
  listeners.forEach(fn => { try { fn(lang); } catch (e) { /* ignore */ } });
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function t(key, vars) {
  let value = (DICT[current] && DICT[current][key]) || DICT.en[key] || key;
  if (vars) {
    Object.keys(vars).forEach(k => {
      value = value.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k]));
    });
  }
  return value;
}

export function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return (m > 0 ? m + ':' : '') + String(s).padStart(m > 0 ? 2 : 1, '0') + (m > 0 ? '' : 's');
}
