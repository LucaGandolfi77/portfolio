// events.js — Eventi satirici casuali e notizie
window.Events = (() => {
  const CITY_EVENTS = [
    { title: 'Fontana di Nutella inaugurata', emoji: '⛲', desc: 'Il sindaco ha inaugurato una fontana di Nutella al centro della città. Le api sono arrabbiate.', effect: 'tax_boost', value: 5, duration: 86400000 },
    { title: 'Sciopero dei Netturbini', emoji: '🗑️', desc: 'I netturbini hanno smesso di lavorare. La città puzza. Turismo -50%.', effect: 'income_penalty', value: 0.5, duration: 43200000 },
    { title: 'Festa del Comune', emoji: '🎉', desc: 'Festa di paese! Tutti guadagnano il doppio per 6 ore.', effect: 'income_boost', value: 2, duration: 21600000 },
    { title: 'Sagra della Polenta', emoji: '🌽', desc: 'La sagra della polenta attira turisti. Food +50%.', effect: 'food_boost', value: 1.5, duration: 21600000 },
    { title: 'Palio dei Consiglieri', emoji: '🏇', desc: 'I consiglieri corrono il palio. +20 influenza per tutti.', effect: 'influence_boost', value: 20, duration: 0 },
    { title: 'Proclama di Emergenza', emoji: '🚨', desc: 'Emergenza nazionale! +50 energia per tutti.', effect: 'energy_boost', value: 50, duration: 0 },
    { title: 'Il Presidente twitta per errore', emoji: '🐦', desc: 'Il presidente ha twittato per errore. Borsa in tilt per 10 minuti.', effect: 'income_penalty', value: 0.3, duration: 600000 },
    { title: 'Un piccione eletto consigliere', emoji: '🐦', desc: 'Un piccione è stato eletto consigliere onorario. Nessuno ha notato la differenza.', effect: null, value: 0, duration: 0 },
    { title: 'Busto della Serie A', emoji: '⚽', desc: 'La squadra locale ha vinto! Euforia, turismo +30%.', effect: 'income_boost', value: 1.3, duration: 43200000 },
    { title: 'Scandalo: bustarella scoperta', emoji: '📰', desc: 'SCANDALO: il sindaco è stato beccato con una bustarella. Multa -€1000.', effect: 'fine', value: 1000, duration: 0 },
    { title: 'Tempesta di neve', emoji: '❄️', desc: 'La neve ha bloccato tutto. Income -40% per 12 ore.', effect: 'income_penalty', value: 0.6, duration: 43200000 },
    { title: 'Festival del Gelato', emoji: '🍦', desc: 'Festival del gelato! Food +40% per 6 ore.', effect: 'food_boost', value: 1.4, duration: 21600000 },
    { title: 'Il sindaco in vacanza', emoji: '🏖️', desc: 'Il sindaco è in vacanza a Dubai. Nessuno gestisce la città.', effect: null, value: 0, duration: 0 },
    { title: 'Hacking del sistema elettorale', emoji: '💻', desc: 'Qualcuno ha hackerato le macchine per votare. Bonus +€500 per tutti.', effect: 'money_bonus', value: 500, duration: 0 },
    { title: 'Greve dei tassisti', emoji: '🚕', desc: 'I tassisti scioperano. Transporti pubblici pieni, ma il morale è alto.', effect: 'influence_boost', value: 15, duration: 0 },
    { title: 'Scoperta di petrolio', emoji: '🛢️', desc: 'Hanno trovato petrolio sotto il municipio! Income +100% per 24h.', effect: 'income_boost', value: 2, duration: 86400000 },
    { title: 'Invasione di gatti', emoji: '🐱', desc: 'La città è invasa dai gatti. Nessuno è arrabbiato.', effect: null, value: 0, duration: 0 },
    { title: 'Terremoto di livello 3', emoji: '🌍', desc: 'Un terremoto lieve ha scosso la città. Niente di grave, ma la gente è scossa.', effect: 'income_penalty', value: 0.7, duration: 21600000 }
  ];

  const NATIONAL_EVENTS = [
    { title: 'Crisi di governo', emoji: '🏛️', desc: 'Il governo è caduto per la 47esima volta. Le borse non reagiscono.', effect: 'income_penalty', value: 0.8, duration: 43200000 },
    { title: 'Olimpiadi', emoji: '🏅', desc: 'Le Olimpiadi sono iniziate! Turismo +50% in tutto il paese.', effect: 'income_boost', value: 1.5, duration: 604800000 },
    { title: 'Pandemia di influenza', emoji: '🤒', desc: 'L\'influenza sta paralizzando il paese. Income -30%.', effect: 'income_penalty', value: 0.7, duration: 259200000 },
    { title: 'Crollo del mercato', emoji: '📉', desc: 'Il mercato è crollato del 20%. Svalutazione globale.', effect: 'income_penalty', value: 0.5, duration: 86400000 },
    { title: 'Boom economico', emoji: '📈', desc: 'Il PIL cresce del 5%! Tutti guadagnano di più.', effect: 'income_boost', value: 1.3, duration: 259200000 },
    { title: 'Festival nazionale della pizza', emoji: '🍕', desc: 'Festival nazionale della pizza! Food +100% per 3 giorni.', effect: 'food_boost', value: 2, duration: 259200000 }
  ];

  const PRESIDENTIAL_PROMISES = [
    { text: 'Abbassare le tasse del 10%', effect: 'tax_reduction', value: 10 },
    { text: 'Bonus di €1000 per tutti', effect: 'money_bonus', value: 1000 },
    { text: 'Costruire ponti ovunque', effect: 'income_boost', value: 1.2 },
    { text: 'Legalizzare le gambling house', effect: 'income_boost', value: 1.5 },
    { text: 'Taglio del 20% alla burocrazia', effect: 'energy_boost', value: 30 },
    { text: 'Garantire il diritto alla siesta', effect: 'energy_regen_boost', value: 2 }
  ];

  function pickRandom(arr, seed) {
    const rng = seededRandom(seed || Date.now());
    return arr[Math.floor(rng() * arr.length)];
  }

  function seededRandom(seed) {
    let s = seed;
    return function() {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  function getCityEvent(seed) {
    return pickRandom(CITY_EVENTS, seed);
  }

  function getNationalEvent(seed) {
    return pickRandom(NATIONAL_EVENTS, seed);
  }

  function getPresidentialPromise(seed) {
    return pickRandom(PRESIDENTIAL_PROMISES, seed);
  }

  function shouldTriggerEvent(chance) {
    return Math.random() < (chance || 0.3);
  }

  return { CITY_EVENTS, NATIONAL_EVENTS, PRESIDENTIAL_PROMISES,
           getCityEvent, getNationalEvent, getPresidentialPromise, shouldTriggerEvent };
})();
