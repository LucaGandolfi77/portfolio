/* Arena Royale 2 — bilingual UI strings */

import { getLang } from './store.js';

const DICT = {
  en: {
    back: 'Portfolio', play: 'TAP TO PLAY', tutorial: 'How to play', sound: 'Sound',
    home: 'Home', ready: 'Ready! Tap to play', loading: 'Loading…', webgl: 'WebGL unavailable.',
    rotate: 'Rotate your phone!', rotateHint: 'Arena Royale 2 is played in <b>landscape</b>.',
    pause: 'PAUSED', pauseHint: 'Take a breath — the arena waits.', resume: 'RESUME',
    restart: 'RESTART', quit: 'QUIT',
    gameover: 'GAME OVER', victory: 'VICTORY!', abandoned: 'MATCH ABANDONED',
    position: 'Place', eliminations: 'Eliminations', shots: 'Shots', accuracy: 'Accuracy',
    streak: 'Streak', survivor: 'You are the last survivor!',
    records: 'Record', wins: 'wins', totalKills: 'total kills', bestPlace: 'best place',
    joystickMove: 'LEFT joystick: move', joystickAim: 'RIGHT joystick: aim & shoot',
    pcControls: 'PC: WASD to move, mouse to aim, click to shoot',
    switchWeapon: 'Switch fists / weapon (Q on PC)',
    pickupWeapon: 'Weapons on the ground: stand still for 2s',
    pickupAmmo: 'Ammo pickups add partial rounds',
    botAmmo: 'Bots have limited ammo too',
    supply: 'Supply drops with special weapons',
    storm: 'The storm closes in — stay inside!',
    konami: 'Secret: try the KONAMI code…',
    landscape: 'Rotate your phone: play in landscape',
    inArena: 'IN THE ARENA! Find a weapon!',
    stormComing: 'THE STORM IS CLOSING!', stormFinal: 'Final circle!',
    stormIn: 'Storm in', collecting: 'PICKING UP', ammo: 'AMMO',
    needWeapon: 'Find a weapon first', noAmmo: 'NO AMMO',
    newWeapon: 'Weapon equipped', legendary: '★ LEGENDARY!',
    legendOn: 'LEGEND MODE! ×3 damage (20s)', legendOff: 'Legend mode over…',
    legend: 'LEGENDARY', common: 'COMMON', fists: 'FISTS',
    kill1: 'DOUBLE!', kill2: 'RAGE!', kill3: 'UNSTOPPABLE!', kill4: 'GODLIKE!',
    supplyIncoming: 'SUPPLY DROP INCOMING!', fps: 'FPS', quality: 'Quality'
  },
  it: {
    back: 'Portfolio', play: 'TOCCA PER GIOCARE', tutorial: 'Come si gioca', sound: 'Suoni',
    home: 'Home', ready: 'Pronto! Tocca per giocare', loading: 'Caricamento…', webgl: 'WebGL non disponibile.',
    rotate: 'Ruota il telefono!', rotateHint: 'Arena Royale 2 si gioca in <b>orizzontale</b>.',
    pause: 'PAUSA', pauseHint: "Prenditi un respiro, l'arena aspetta.", resume: 'RIPRENDI',
    restart: 'RIGIOCA', quit: 'ABBANDONA',
    gameover: 'GAME OVER', victory: 'VITTORIA!', abandoned: 'PARTITA ABBANDONATA',
    position: 'Posizione', eliminations: 'Eliminazioni', shots: 'Colpi', accuracy: 'Precisione',
    streak: 'Streak', survivor: 'Sei l’ultimo sopravvissuto!',
    records: 'Record', wins: 'vittorie', totalKills: 'eliminazioni', bestPlace: 'miglior piazzamento',
    joystickMove: 'Joystick sinistro: muovi', joystickAim: 'Joystick destro: mira e spara',
    pcControls: 'PC: WASD per muoverti, mouse per mirare, click per sparare',
    switchWeapon: 'Cambia pugni/arma (Q su PC)',
    pickupWeapon: 'Armi a terra: fermati sopra per 2s',
    pickupAmmo: 'Le munizioni aggiungono colpi parziali',
    botAmmo: 'Anche i bot hanno munizioni limitate',
    supply: 'Supply drop con armi speciali',
    storm: 'La tempesta si restringe: stai dentro!',
    konami: 'Segreto: prova la KONAMI code…',
    landscape: 'Ruota il telefono: si gioca in orizzontale',
    inArena: 'IN ARENA! Trova un’arma!',
    stormComing: 'LA TEMPESTA ARRIVA!', stormFinal: 'Cerchio finale!',
    stormIn: 'Tempesta fra', collecting: 'RACCOLTA', ammo: 'MUNIZIONI',
    needWeapon: 'Serve un’arma per le munizioni', noAmmo: 'NO MUNIZIONI',
    newWeapon: 'Arma equipaggiata', legendary: '★ LEGGENDARIA!',
    legendOn: 'MODALITÀ LEGGENDA! Danno ×3 (20s)', legendOff: 'Fine della modalità leggenda…',
    legend: 'LEGGENDARIA', common: 'COMUNE', fists: 'PUGNI',
    kill1: 'DOPPIO!', kill2: 'RAGE!', kill3: 'IMPLACABILE!', kill4: 'GODLIKE!',
    supplyIncoming: 'SUPPLY DROP IN ARRIVO!', fps: 'FPS', quality: 'Qualità'
  }
};

export function t(key) {
  const lang = getLang();
  return (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;
}

export function applyLanguage() {
  document.documentElement.lang = getLang();
  document.querySelectorAll('[data-i18n]').forEach(node => {
    const key = node.getAttribute('data-i18n');
    node.textContent = t(key);
  });
}

export { DICT };
