// politicians.js — Generatore candidati satirici
window.Politicians = (() => {
  const FIRST_NAMES = [
    'Giancarlo', 'Patrizia', 'On. Bruno', 'Dott.ssa Maria', 'Prof. Aldo',
    'Contessa', 'Ing. Luigi', 'Avv. Francesca', 'Sen. Tiziano', 'Dott. Rocco',
    'Marco', 'Giulia', 'Paolo', 'Anna', 'Francesco', 'Sara', 'Luca', 'Chiara',
    'Alessandro', 'Valentina', 'Roberto', 'Elena', 'Matteo', 'Giorgia'
  ];

  const LAST_NAMES = [
    'Tangentopoli', 'Pancrazio', 'Bustarella', 'Verbale', 'Carruba',
    'Promesso', 'Rimborsato', 'Fornero', 'Mennea', 'Grilli',
    'Rossi', 'Bianchi', 'Romano', 'Colombo', 'Ricci',
    'Ferrari', 'Esposito', 'Bruno', 'Gallo', 'Conti'
  ];

  const PARTIES = [
    { name: 'Movimento 5 Pizze',     emoji: '🍕', color: '#FF6B35', desc: 'Promettono pizza gratis per tutti' },
    { name: 'Lega dei Pigri',        emoji: '😴', color: '#4ECDC4', desc: 'Il lavoro è overrated' },
    { name: 'Partito del Buonumore', emoji: '😂', color: '#FFE66D', desc: 'Risata garantita, risultati no' },
    { name: 'Forza Bancomat',        emoji: '💳', color: '#95E1D3', desc: 'Prelevano dai soldi pubblici' },
    { name: 'La Sinistra del Mattino', emoji: '🌅', color: '#FF6B6B', desc: 'Colazione €50, colazioni per tutti €0' },
    { name: 'Il Centro Assoluto',    emoji: '⚖️', color: '#A8D8EA', desc: 'Non sanno se sono di sinistra o destra' },
    { name: 'Partito dell\'Amore',   emoji: '💕', color: '#FF9FF3', desc: 'Ti vogliono bene... con le tasse' },
    { name: 'Fratelli di Moneta',    emoji: '💰', color: '#FFA502', desc: 'Soldi per tutti, ma soprattutto per noi' },
    { name: 'Partito Green Washing',  emoji: '🌿', color: '#2ED573', desc: 'Fanno finta di essere ecologisti' },
    { name: 'Coalizione del Popolo',  emoji: '🏛️', color: '#3742FA', desc: 'Il popolo... chi è il popolo?' }
  ];

  const PROMISES = {
    tax: [
      { text: 'Tasse al 0% (poi vediamo)', value: 0, desc: 'Le tasse sono un optional!' },
      { text: 'Tasse al 10%', value: 10, desc: 'Basse ma non zero' },
      { text: 'Tasse al 20%', value: 20, desc: 'Il compromesso perfetto' },
      { text: 'Tasse al 30%', value: 30, desc: 'Abbiamo bisogno di strade, no?' },
      { text: 'Tasse al 40%', value: 40, desc: 'Ilelfare non si paga da solo!' },
      { text: 'Tasse al 50%', value: 50, desc: 'Benvenuti in Svezia (ma senza il welfare)' }
    ],
    favor: [
      { name: 'Vacanza Fiscale',    emoji: '🏖️', desc: '1 giorno di tasse zero', type: 'tax_holiday', value: 1 },
      { name: 'Bonus Cavaliere',    emoji: '🐴', desc: 'Upgrade casa gratis', type: 'free_upgrade', value: 1 },
      { name: 'Appalto Pubblico',   emoji: '🏗️', desc: '3x income per 24h', type: 'income_boost', value: 3 },
      { name: 'Decreto Flussi',     emoji: '📋', desc: '50% sconto prossimo business', type: 'discount', value: 0.5 },
      { name: 'Permesso Edilizio',  emoji: '🔨', desc: 'Casa migliora 1 tier gratis', type: 'home_upgrade', value: 1 },
      { name: 'Bustarella Silver',  emoji: '💰', desc: '+€5000 bonus', type: 'money_bonus', value: 5000 }
    ],
    event: [
      { text: 'Inaugurazione Fontana di Nutella', emoji: '⛲', effect: 'tax_boost', value: 5, desc: 'Le tasse aumentano del 5% per un giorno' },
      { text: 'Festa del Comune', emoji: '🎉', effect: 'income_boost', value: 2, desc: 'Tutti guadagnano il doppio per 6 ore' },
      { text: 'Sciopero dei Netturbini', emoji: '🗑️', effect: 'income_penalty', value: 0.5, desc: 'La città puzza, turismo -50%' },
      { text: 'Sagra della Polenta', emoji: '🌽', effect: 'food_boost', value: 1.5, desc: 'Food business +50% per 6 ore' },
      { text: 'Palio dei Consiglieri', emoji: '🏇', effect: 'influence_boost', value: 20, desc: '+20 influenza per tutti' },
      { text: 'Proclama di Emergenza', emoji: '🚨', effect: 'energy_boost', value: 50, desc: '+50 energia per tutti' }
    ]
  };

  const CITY_NAMES = [
    'Borgo Vaniglia', 'Città della Pizza', 'Paese dei Gatti', 'Villaggio dell\'Orso',
    'Città delle Fontane', 'Paese del Vino', 'Borgo dei Mulini', 'Città del Sole',
    'Villaggio delle Stelle', 'Città della Pace', 'Borgo della Neve', 'Paese dell\'Olivo',
    'Città del Fiume', 'Villaggio della Costa', 'Borgo delle Montagne'
  ];

  function seededRandom(seed) {
    let s = seed;
    return function() {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  function generateCandidate(seed, idx) {
    const rng = seededRandom(seed + idx * 1000);
    const pick = arr => arr[Math.floor(rng() * arr.length)];

    const party = pick(PARTIES);
    const taxPromise = pick(PROMISES.tax);
    const favor = pick(PROMISES.favor);
    const event = pick(PROMISES.event);

    return {
      id: `c${idx}`,
      name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      party: party.name,
      partyEmoji: party.emoji,
      partyColor: party.color,
      partyDesc: party.desc,
      taxRate: taxPromise.value,
      taxDesc: taxPromise.text,
      favor: favor,
      specialEvent: event,
      charisma: 0.3 + rng() * 0.7,
      scandalChance: rng() * 0.15,
      votes: 0
    };
  }

  function generateCandidates(seed, count) {
    const candidates = [];
    for (let i = 0; i < (count || 4); i++) {
      candidates.push(generateCandidate(seed, i));
    }
    return candidates;
  }

  function generateMayorName(seed) {
    const rng = seededRandom(seed);
    return `${FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)]}`;
  }

  function generateMayorPromises(seed) {
    const rng = seededRandom(seed);
    const pick = arr => arr[Math.floor(rng() * arr.length)];
    return {
      taxRate: pick(PROMISES.tax),
      favor: pick(PROMISES.favor),
      event: pick(PROMISES.event)
    };
  }

  return { COUNTRIES: null, CITIES: null, HOMES: null, PARTIES, PROMISES, CITY_NAMES,
           generateCandidates, generateMayorName, generateMayorPromises };
})();
