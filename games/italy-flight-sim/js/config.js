/* Italy Flight Sim — planes, airports, missions and bilingual strings */

// The map uses a compact 1000x800 design grid scaled by 1.4 into world units.
export const WORLD = { w: 1400, h: 1120, scale: 1.4, maxAlt: 3000 };

export const loc = (value, lang = 'en') =>
  value && typeof value === 'object' ? (value[lang] ?? value.en ?? '') : String(value ?? '');

export const PLANES = [
  {
    id: 'cessna', kind: 'prop', color: '#ffd166',
    name: { en: 'Cessna 172', it: 'Cessna 172' },
    desc: { en: 'The classic trainer. Slow, stable, forgiving on landing.', it: 'L\'addestratore classico: lento, stabile e facile da atterrare.' },
    maxSpeed: 82, accel: 30, turn: 1.5, climb: 30,
    fuel: 100, burn: 1.55, landSpeed: 46, stall: 24, boost: 1.25
  },
  {
    id: 'stol', kind: 'prop', color: '#8ce99a',
    name: { en: 'STOL Bush Plane', it: 'Aereo STOL' },
    desc: { en: 'Short take-offs, tiny runways and razor-sharp turns.', it: 'Decolli corti, piste minuscole e virate precisissime.' },
    maxSpeed: 64, accel: 36, turn: 2.1, climb: 40,
    fuel: 82, burn: 1.7, landSpeed: 32, stall: 16, boost: 1.25
  },
  {
    id: 'jet', kind: 'jet', color: '#74c0fc',
    name: { en: 'Eurofighter', it: 'Eurofighter' },
    desc: { en: 'Very fast, thirsty and needs a long, aligned approach.', it: 'Velocissimo, assetato e vuole un avvicinamento lungo e allineato.' },
    maxSpeed: 180, accel: 62, turn: 1.0, climb: 56,
    fuel: 74, burn: 3.5, landSpeed: 88, stall: 46, boost: 1.4
  },
  {
    id: 'airliner', kind: 'airliner', color: '#e599f7',
    name: { en: 'Airbus A320', it: 'Airbus A320' },
    desc: { en: 'Heavy and smooth: wide turns, fast cruise, steady hands.', it: 'Pesante e morbido: curve ampie, crociera veloce, mani ferme.' },
    maxSpeed: 142, accel: 30, turn: 0.68, climb: 32,
    fuel: 110, burn: 2.5, landSpeed: 76, stall: 50, boost: 1.3
  },
  {
    id: 'heli', kind: 'heli', color: '#ffa8a8',
    name: { en: 'Helicopter', it: 'Elicottero' },
    desc: { en: 'Hover, climb straight up and land almost anywhere.', it: 'Stai fermo, sali dritto e atterra quasi ovunque.' },
    maxSpeed: 74, accel: 48, turn: 2.4, climb: 48,
    fuel: 88, burn: 2.1, landSpeed: 20, stall: 0, boost: 1.2
  },
  {
    id: 'cub', kind: 'prop', color: '#ffc9c9',
    name: { en: 'Piper Cub', it: 'Piper Cub' },
    desc: { en: 'Slowest of the bunch. Almost impossible to stall.', it: 'Il più lento del gruppo. Quasi impossibile da far stallare.' },
    maxSpeed: 55, accel: 30, turn: 2.3, climb: 34,
    fuel: 95, burn: 1.4, landSpeed: 28, stall: 14, boost: 1.2
  },
  {
    id: 'concorde', kind: 'jet', color: '#d0bfff',
    name: { en: 'Concorde', it: 'Concorde' },
    desc: { en: 'Supersonic elegance: very fast, wide turns, long approach.', it: 'Eleganza supersonica: velocissima, curve ampie, avvicinamento lungo.' },
    maxSpeed: 210, accel: 45, turn: 0.7, climb: 40,
    fuel: 90, burn: 3.2, landSpeed: 95, stall: 55, boost: 1.3
  },
  {
    id: 'f35', kind: 'jet', color: '#91a7ff',
    name: { en: 'F-35 Lightning', it: 'F-35 Lightning' },
    desc: { en: 'Agile fifth-generation fighter with a serious afterburner.', it: 'Caccia di quinta generazione agile, con un postbruciatore serio.' },
    maxSpeed: 200, accel: 70, turn: 1.35, climb: 62,
    fuel: 78, burn: 3.6, landSpeed: 92, stall: 48, boost: 1.5
  },
  {
    id: 'interceptor', kind: 'starfighter', color: '#66d9e8', starship: true,
    name: { en: 'Interceptor', it: 'Intercettore' },
    desc: { en: 'Starfighter: twice a jet\'s speed, drinks fuel like water.', it: 'Caccia stellare: il doppio di un jet e beve carburante come acqua.' },
    maxSpeed: 360, accel: 120, turn: 1.5, climb: 90,
    fuel: 100, burn: 5.5, landSpeed: 150, stall: 70, boost: 1.6
  },
  {
    id: 'starfighter', kind: 'starfighter', color: '#b197fc', starship: true,
    name: { en: 'Starfighter', it: 'Starfighter' },
    desc: { en: 'The fastest thing in the sky: 400 units per second.', it: 'La cosa più veloce nel cielo: 400 unità al secondo.' },
    maxSpeed: 400, accel: 140, turn: 1.8, climb: 100,
    fuel: 110, burn: 6.2, landSpeed: 160, stall: 80, boost: 1.7
  },
  {
    id: 'cruiser', kind: 'cruiser', color: '#ff922b', starship: true,
    name: { en: 'Warp Cruiser', it: 'Incrociatore Warp' },
    desc: { en: 'Heavy starship: huge tank, smooth turns, huge boost.', it: 'Nave pesante: serbatoio enorme, curve morbide, boost potente.' },
    maxSpeed: 340, accel: 85, turn: 0.9, climb: 70,
    fuel: 150, burn: 5.0, landSpeed: 140, stall: 60, boost: 1.8
  }
];

// Coordinates are on the 1000x800 design grid; map.js scales them to world units.
export const AIRPORTS = [
  { code: 'MXP', nx: 270, ny: 125, rwy: 35, name: { en: 'Milano Malpensa', it: 'Milano Malpensa' } },
  { code: 'LIN', nx: 335, ny: 165, rwy: 90, name: { en: 'Milano Linate', it: 'Milano Linate' } },
  { code: 'GOA', nx: 330, ny: 255, rwy: 110, name: { en: 'Genova', it: 'Genova' } },
  { code: 'VCE', nx: 700, ny: 155, rwy: 100, name: { en: 'Venezia', it: 'Venezia' } },
  { code: 'BLQ', nx: 520, ny: 235, rwy: 120, name: { en: 'Bologna', it: 'Bologna' } },
  { code: 'FLR', nx: 470, ny: 340, rwy: 95, name: { en: 'Firenze', it: 'Firenze' } },
  { code: 'FCO', nx: 525, ny: 475, rwy: 130, name: { en: 'Roma Fiumicino', it: 'Roma Fiumicino' } },
  { code: 'CIA', nx: 555, ny: 485, rwy: 100, name: { en: 'Roma Ciampino', it: 'Roma Ciampino' } },
  { code: 'NAP', nx: 620, ny: 540, rwy: 60, name: { en: 'Napoli', it: 'Napoli' } },
  { code: 'BRI', nx: 890, ny: 470, rwy: 140, name: { en: 'Bari', it: 'Bari' } },
  { code: 'BDS', nx: 935, ny: 515, rwy: 110, name: { en: 'Brindisi', it: 'Brindisi' } },
  { code: 'PMO', nx: 480, ny: 715, rwy: 90, name: { en: 'Palermo', it: 'Palermo' } },
  { code: 'CTA', nx: 625, ny: 730, rwy: 95, name: { en: 'Catania', it: 'Catania' } },
  { code: 'CAG', nx: 210, ny: 540, rwy: 70, name: { en: 'Cagliari', it: 'Cagliari' } },
  { code: 'OLB', nx: 235, ny: 455, rwy: 110, name: { en: 'Olbia', it: 'Olbia' } }
];

export const MISSIONS = [
  {
    id: 'primo', diff: 1, stops: ['FCO', 'NAP'],
    name: { en: 'First Flight', it: 'Primo volo' },
    desc: { en: 'A short hop from Rome to Naples.', it: 'Un salto breve da Roma a Napoli.' }
  },
  {
    id: 'sole', diff: 2, stops: ['NAP', 'FLR', 'LIN'],
    name: { en: 'Autostrada del Sole', it: 'Autostrada del Sole' },
    desc: { en: 'Three landings up the peninsula to Milan.', it: 'Tre atterraggi risalendo la penisola fino a Milano.' }
  },
  {
    id: 'tacco', diff: 2, stops: ['FCO', 'BRI', 'BDS'],
    name: { en: 'The Heel', it: 'Il tacco' },
    desc: { en: 'Follow the Adriatic coast to Puglia.', it: 'Segui la costa adriatica fino in Puglia.' }
  },
  {
    id: 'isole', diff: 3, stops: ['PMO', 'CTA', 'CAG'],
    name: { en: 'Island Hopper', it: 'Island Hopper' },
    desc: { en: 'Sicily to Sardinia — all over open sea.', it: 'Dalla Sicilia alla Sardegna, tutto sopra il mare.' }
  },
  {
    id: 'grand', diff: 4, stops: ['MXP', 'VCE', 'BRI', 'CTA', 'FCO'],
    name: { en: 'Gran Tour', it: 'Gran Tour' },
    desc: { en: 'The whole boot: five stops, one tank per leg.', it: 'Tutta la penisola: cinque tappe, un serbatoio per tratta.' }
  }
];

export const STR = {
  en: {
    title: 'ITALY FLIGHT SIM',
    subtitle: 'Fly the boot — free flight & point-to-point missions',
    freeFlight: 'FREE FLIGHT',
    missions: 'MISSIONS',
    hangar: 'HANGAR',
    howto: 'HOW TO PLAY',
    back: 'BACK',
    play: 'PLAY',
    select: 'SELECT',
    selected: 'SELECTED',
    speed: 'SPEED',
    agility: 'AGILITY',
    range: 'RANGE',
    airspeed: 'SPEED',
    altitude: 'ALT',
    fuel: 'FUEL',
    heading: 'HDG',
    next: 'NEXT',
    distance: 'DIST',
    km: 'km',
    view: 'VIEW',
    pause: 'PAUSE',
    throttle: 'THROTTLE',
    boost: 'BOOST',
    boostHint: 'Hold BOOST (or B) for a speed surge — it burns fuel twice as fast.',
    starship: 'STARSHIP',
    aircraft: 'AIRCRAFT',
    climb: 'CLIMB',
    steer: 'STEER',
    resume: 'RESUME',
    restart: 'RESTART',
    changePlane: 'CHANGE PLANE',
    quit: 'QUIT TO MENU',
    sound: 'SOUND',
    on: 'ON',
    off: 'OFF',
    stops: 'STOPS',
    best: 'BEST',
    time: 'TIME',
    used: 'FUEL USED',
    retry: 'RETRY',
    nextMission: 'NEXT MISSION',
    missionDone: 'MISSION COMPLETE',
    step: 'CHECKPOINT',
    landingOk: 'Perfect landing!',
    refueled: 'Refuelled at {code}',
    crash: 'Crash — restarted at {code}',
    stall: 'STALL — lower the nose',
    noFuel: 'OUT OF FUEL — glide to a runway',
    landHere: 'Line up with the runway, slow down and touch down',
    howto1: 'Drag the left half of the screen to steer: left/right turns, up/down climbs and dives.',
    howto2: 'Use + and - on the right to set throttle. Tap the bar to jump to a value.',
    howto3: 'To land: line up with the runway, get slow and low, then touch down gently.',
    howto4: 'Every landing refuels you. Missions ask you to land at each airport in order.',
    howto5: 'Keyboard: A/D steer, W/S climb, Q/E throttle, V view, P pause.',
    flightTime: 'FLIGHT TIME',
    landings: 'LANDINGS',
    from: 'FROM',
    freeTitle: 'FREE FLIGHT',
    freeHint: 'Pick a plane and an airport, then just fly.',
    difficulty: 'DIFFICULTY',
    easy: 'EASY',
    medium: 'MEDIUM',
    hard: 'HARD'
  },
  it: {
    title: 'ITALY FLIGHT SIM',
    subtitle: 'Voli lo stivale — volo libero e missioni da aeroporto a aeroporto',
    freeFlight: 'VOLO LIBERO',
    missions: 'MISSIONI',
    hangar: 'HANGAR',
    howto: 'COME SI GIOCA',
    back: 'INDIETRO',
    play: 'GIOCA',
    select: 'SCEGLI',
    selected: 'SELEZIONATO',
    speed: 'VELOCITÀ',
    agility: 'AGILITÀ',
    range: 'AUTONOMIA',
    airspeed: 'VELOCITÀ',
    altitude: 'QUOTA',
    fuel: 'CARBURANTE',
    heading: 'ROTTA',
    next: 'PROSSIMA',
    distance: 'DIST',
    km: 'km',
    view: 'VEDUTA',
    pause: 'PAUSA',
    throttle: 'MANETTA',
    boost: 'BOOST',
    boostHint: 'Tieni premuto BOOST (o B) per una spinta: consuma il doppio del carburante.',
    starship: 'ASTRONAVE',
    aircraft: 'AEREO',
    climb: 'SALITA',
    steer: 'STERZO',
    resume: 'RIPRENDI',
    restart: 'RICOMINCIA',
    changePlane: 'CAMBIA AEREO',
    quit: 'TORNA AL MENU',
    sound: 'AUDIO',
    on: 'SÌ',
    off: 'NO',
    stops: 'TAPPE',
    best: 'RECORD',
    time: 'TEMPO',
    used: 'CARBURANTE USATO',
    retry: 'RIPROVA',
    nextMission: 'MISSIONE SUCCESSIVA',
    missionDone: 'MISSIONE COMPLETATA',
    step: 'CHECKPOINT',
    landingOk: 'Atterraggio perfetto!',
    refueled: 'Rifornito a {code}',
    crash: 'Incidente — ripartito da {code}',
    stall: 'STALLO — abbassa il muso',
    noFuel: 'CARBURANTE FINITO — plana verso una pista',
    landHere: 'Allineati alla pista, rallenta e tocca terra',
    howto1: 'Trascina la metà sinistra dello schermo per sterzare: destra/sinistra giri, su/giù sali e scendi.',
    howto2: 'Usa + e - a destra per la manetta. Tocca la barra per impostare un valore.',
    howto3: 'Per atterrare: allineati alla pista, vai piano e basso, poi tocca terra dolcemente.',
    howto4: 'Ogni atterraggio ti rifornisce. Le missioni chiedono di atterrare in ogni aeroporto nell\'ordine.',
    howto5: 'Tastiera: A/D sterzo, W/S salita, Q/E manetta, V veduta, P pausa.',
    flightTime: 'TEMPO DI VOLO',
    landings: 'ATTERRAGGI',
    from: 'DA',
    freeTitle: 'VOLO LIBERO',
    freeHint: 'Scegli aereo e aeroporto, poi voli e basta.',
    difficulty: 'DIFFICOLTÀ',
    easy: 'FACILE',
    medium: 'MEDIO',
    hard: 'DIFFICILE'
  }
};
