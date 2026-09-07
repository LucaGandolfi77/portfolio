// world.js — Paesi, città, mappa e dati geografici satirici
window.World = (() => {
  const COUNTRIES = {
    italia:     { name: 'Italia',         flag: '🇮🇹', bonus: 'food',      mult: 1.25, bonusDesc: '+25% food',    taxBase: 20, housingMult: 1.0 },
    svizzera:   { name: 'Svizzera',       flag: '🇨🇭', bonus: 'bank',      mult: 1.30, bonusDesc: '+30% banche',  taxBase: 10, housingMult: 1.8 },
    usa:        { name: 'USA',            flag: '🇺🇸', bonus: 'tech',      mult: 1.30, bonusDesc: '+30% tech',    taxBase: 25, housingMult: 1.2 },
    francia:    { name: 'Francia',        flag: '🇫🇷', bonus: 'culture',   mult: 1.25, bonusDesc: '+25% cultura',  taxBase: 30, housingMult: 1.3 },
    germania:   { name: 'Germania',       flag: '🇩🇪', bonus: 'all',       mult: 1.10, bonusDesc: '+10% tutto',    taxBase: 22, housingMult: 1.2 },
    uk:         { name: 'Regno Unito',    flag: '🇬🇧', bonus: 'bank',      mult: 1.20, bonusDesc: '+20% banche',  taxBase: 20, housingMult: 1.5 },
    giappone:   { name: 'Giappone',       flag: '🇯🇵', bonus: 'manager',   discount: 0.3, bonusDesc: 'Manager -30%', taxBase: 18, housingMult: 1.4 },
    emirati:    { name: 'Emirati Arabi',  flag: '🇦🇪', bonus: 'notax',     mult: 1.0,  bonusDesc: 'Zero tasse',    taxBase: 0,  housingMult: 2.5 },
    brasil:     { name: 'Brasile',        flag: '🇧🇷', bonus: 'random',    mult: 1.0,  bonusDesc: 'Eventi casuali', taxBase: 25, housingMult: 0.6 },
    spagna:     { name: 'Spagna',         flag: '🇪🇸', bonus: 'energy',    regen: 1.3, bonusDesc: '+30% energia',  taxBase: 20, housingMult: 0.9 },
    australia:  { name: 'Australia',      flag: '🇦🇺', bonus: 'tourism',   mult: 1.20, bonusDesc: '+20% turismo',  taxBase: 22, housingMult: 1.4 },
    canada:     { name: 'Canada',         flag: '🇨🇦', bonus: 'all',       mult: 1.05, bonusDesc: '+5% tutto',     taxBase: 20, housingMult: 1.3 },
    india:      { name: 'India',          flag: '🇮🇳', bonus: 'tech',      mult: 1.40, bonusDesc: '+40% tech',     taxBase: 15, housingMult: 0.4 },
    corea:      { name: 'Corea del Sud',  flag: '🇰🇷', bonus: 'media',     mult: 1.35, bonusDesc: '+35% media',    taxBase: 18, housingMult: 1.2 },
    messico:    { name: 'Messico',        flag: '🇲🇽', bonus: 'food',      mult: 1.30, bonusDesc: '+30% food',     taxBase: 22, housingMult: 0.5 },
    sudafrica:  { name: 'Sudafrica',      flag: '🇿🇦', bonus: 'mining',    mult: 1.50, bonusDesc: '+50% mining',   taxBase: 25, housingMult: 0.5 },
    nigeria:    { name: 'Nigeria',        flag: '🇳🇬', bonus: 'media',     mult: 1.30, bonusDesc: '+30% media',    taxBase: 20, housingMult: 0.3 },
    argentina:  { name: 'Argentina',      flag: '🇦🇷', bonus: 'random',    mult: 1.0,  bonusDesc: 'Chaos totale',   taxBase: 30, housingMult: 0.4 },
    norvegia:   { name: 'Norvegia',       flag: '🇳🇴', bonus: 'oil',       mult: 1.40, bonusDesc: '+40% petrolio', taxBase: 15, housingMult: 2.0 },
    polonia:    { name: 'Polonia',        flag: '🇵🇱', bonus: 'worker',    mult: 1.20, bonusDesc: '+20% lavoratori', taxBase: 18, housingMult: 0.7 }
  };

  const CITIES = {
    bastardo:     { name: 'Bastardo',              country: 'italia',    tier: 1, costMult: 0.5,  desc: 'Borgo umbro famoso per il nome' },
    vergate:      { name: 'Vergate sul Membro',     country: 'italia',    tier: 1, costMult: 0.6,  desc: 'Un paesino che non esiste... o forse sì?' },
    napoli:       { name: 'Napoli',                 country: 'italia',    tier: 3, costMult: 1.2,  desc: 'Pizza, mandolini e corruzione' },
    roma:         { name: 'Roma',                   country: 'italia',    tier: 4, costMult: 1.5,  desc: 'La Città Eterna: eterna come la burocrazia' },
    milano:       { name: 'Milano',                 country: 'italia',    tier: 4, costMult: 1.6,  desc: 'Moda, finanza e gente che corre' },
    ginevra:      { name: 'Ginevra',                country: 'svizzera',  tier: 3, costMult: 2.0,  desc: 'Segreto bancario e cioccolata' },
    zurigo:       { name: 'Zurigo',                 country: 'svizzera',  tier: 4, costMult: 2.5,  desc: 'Tutto costa il doppio ma è perfetto' },
    springfield:  { name: 'Springfield',            country: 'usa',       tier: 1, costMult: 0.7,  desc: 'La città più media d\'America' },
    chicago:      { name: 'Chicago',                country: 'usa',       tier: 3, costMult: 1.4,  desc: 'Pizza profonda e politica più profonda' },
    newyork:      { name: 'New York',               country: 'usa',       tier: 5, costMult: 3.0,  desc: 'La città che non dorme mai, specialmente i politici' },
    losangeles:   { name: 'Los Angeles',            country: 'usa',       tier: 4, costMult: 2.0,  desc: 'Sogni dorati e tasse d\'oro' },
    marsiglia:    { name: 'Marsiglia',              country: 'francia',   tier: 2, costMult: 1.0,  desc: 'Sapone, porto e scioperi' },
    parigi:       { name: 'Parigi',                 country: 'francia',   tier: 5, costMult: 2.8,  desc: 'La città dell\'amore... e delle tasse' },
    lione:        { name: 'Lione',                  country: 'francia',   tier: 3, costMult: 1.2,  desc: 'La gastronomia francese' },
    berlino:      { name: 'Berlino',                country: 'germania',  tier: 4, costMult: 1.5,  desc: 'Street art, techno e burocrazia efficiente' },
    monaco:       { name: 'Monaco di Baviera',      country: 'germania',  tier: 4, costMult: 1.8,  desc: 'Oktoberfest e politica conservatrice' },
    amburgo:      { name: 'Amburgo',                country: 'germania',  tier: 3, costMult: 1.3,  desc: 'Porto commerciale e ombre' },
    londra:       { name: 'Londra',                 country: 'uk',        tier: 5, costMult: 2.5,  desc: 'Big Ben, tè e multe per tutto' },
    manchester:   { name: 'Manchester',             country: 'uk',        tier: 3, costMult: 1.2,  desc: 'Calcio e musica' },
    tokyo:        { name: 'Tokyo',                  country: 'giappone',  tier: 5, costMult: 2.8,  desc: 'Futuro, neon e burocrazia antica' },
    osaka:        { name: 'Osaka',                  country: 'giappone',  tier: 3, costMult: 1.5,  desc: 'Street food e umorismo' },
    dubai:        { name: 'Dubai',                  country: 'emirati',   tier: 5, costMult: 3.5,  desc: 'Oro, grattacieli e tasse zero' },
    riodejaneiro: { name: 'Rio de Janeiro',         country: 'brasil',    tier: 3, costMult: 1.0,  desc: 'Spiagge, carnaval e politica calda' },
    saopaulo:     { name: 'San Paolo',              country: 'brasil',    tier: 4, costMult: 1.3,  desc: 'La metropoli che non dorme' },
    madrid:       { name: 'Madrid',                 country: 'spagna',    tier: 4, costMult: 1.4,  desc: 'Sangria, siesta e politica ardente' },
    barcelona:    { name: 'Barcelona',              country: 'spagna',    tier: 4, costMult: 1.5,  desc: 'Gaudì, catalani e spiagge turistiche' },
    sydney:       { name: 'Sydney',                 country: 'australia', tier: 4, costMult: 2.0,  desc: 'Canguri, surf e politica rilassata' },
    toronto:      { name: 'Toronto',                country: 'canada',    tier: 3, costMult: 1.3,  desc: 'Cortesia, maple syrup e multiculturalismo' },
    vancouver:    { name: 'Vancouver',              country: 'canada',    tier: 4, costMult: 2.0,  desc: 'Natura, tech e affitti proibitivi' },
    mumbai:       { name: 'Mumbai',                 country: 'india',     tier: 4, costMult: 0.8,  desc: 'Bollywood, startup e miliardi di opportunità' },
    bangalore:    { name: 'Bangalore',              country: 'india',     tier: 3, costMult: 0.6,  desc: 'Silicon Valley indiana' },
    seoul:        { name: 'Seoul',                  country: 'corea',     tier: 4, costMult: 1.5,  desc: 'K-pop, tech e burocrazia digitale' },
    cittamessico: { name: 'Città del Messico',      country: 'messico',   tier: 4, costMult: 1.0,  desc: 'Taco, street art e politica piccante' },
    cancun:       { name: 'Cancún',                 country: 'messico',   tier: 3, costMult: 1.2,  desc: 'Turismo, spiagge e all-inclusive' },
    johannesburg: { name: 'Johannesburg',           country: 'sudafrica', tier: 3, costMult: 0.8,  desc: 'Gold, diamonds e ambizione' },
    lagos:        { name: 'Lagos',                  country: 'nigeria',   tier: 3, costMult: 0.5,  desc: 'Nollywood, jollof rice e startup africane' },
    buenosaires:  { name: 'Buenos Aires',           country: 'argentina', tier: 4, costMult: 0.8,  desc: 'Tango, asado e inflazione cronica' },
    oslo:         { name: 'Oslo',                   country: 'norvegia',  tier: 4, costMult: 2.2,  desc: 'Fiordi, petrolio e welfare perfetto' },
    varsavia:     { name: 'Varsavia',               country: 'polonia',   tier: 3, costMult: 0.9,  desc: 'Ricostruita, resiliente, piena di energia' },
    cracovia:     { name: 'Cracovia',               country: 'polonia',   tier: 2, costMult: 0.7,  desc: 'Bellezza storica e birra buona' }
  };

  const HOMES = [
    { id: 0, name: 'Tenda',         emoji: '⛺', desc: 'Non è il lusso ma è tuo',               energyBonus: 0,   offlineHours: 2,  upgradeCost: 500 },
    { id: 1, name: 'Stanza',        emoji: '🚪', desc: 'Un letto e un water. Il lusso del terzo mondo', energyBonus: 10, offlineHours: 4,  upgradeCost: 2000 },
    { id: 2, name: 'Monolocale',    emoji: '🛋️', desc: 'Tutto in una stanza. Include parassiti gratis',  energyBonus: 20, offlineHours: 6,  upgradeCost: 8000 },
    { id: 3, name: 'Appartamento',  emoji: '🏢', desc: 'Due stanze! Puoi fare finta di essere ricco',    energyBonus: 30, offlineHours: 8,  upgradeCost: 25000 },
    { id: 4, name: 'Casa',          emoji: '🏠', desc: 'Giardino! I vicini odieranno il tuo BBQ',       energyBonus: 40, offlineHours: 12, upgradeCost: 80000 },
    { id: 5, name: 'Villa',         emoji: '🏡', desc: 'Piscina! Non hai un cameriere ma fai finta',     energyBonus: 50, offlineHours: 16, upgradeCost: 250000 },
    { id: 6, name: 'Attico',        emoji: '🌆', desc: 'Vista sulla città, ego infinito',                energyBonus: 60, offlineHours: 20, upgradeCost: 1000000 },
    { id: 7, name: 'Castello',      emoji: '🏰', desc: 'Ti serve un MAGGIORDOMO! Ti serve un MAGGIORDOMO!', energyBonus: 80, offlineHours: 24, upgradeCost: 5000000 }
  ];

  // Dot map positions for SVG rendering (approx Mercator %, 0,0 = NW)
  const MAP_DOTS = {
    italia: [50, 35], svizzera: [48, 32], usa: [18, 35], francia: [47, 30],
    germania: [50, 28], uk: [45, 25], giappone: [82, 32], emirati: [60, 42],
    brasil: [30, 65], spagna: [45, 37], australia: [80, 70], canada: [20, 22],
    india: [65, 42], corea: [80, 34], messico: [15, 45], sudafrica: [53, 72],
    nigeria: [48, 50], argentina: [28, 78], norvegia: [49, 18], polonia: [53, 25]
  };

  function getCountry(id) { return COUNTRIES[id]; }
  function getCity(id) { return CITIES[id]; }
  function getHome(id) { return HOMES[id]; }
  function getCitiesByCountry(countryId) {
    return Object.entries(CITIES).filter(([_, c]) => c.country === countryId).map(([id, c]) => ({ id, ...c }));
  }
  function getMoveCost(fromCity, toCity) {
    const from = CITIES[fromCity];
    const to = CITIES[toCity];
    if (!from || !to) return Infinity;
    const tierDiff = Math.abs(to.tier - from.tier);
    return Math.round(5000 * to.costMult * Math.pow(1.5, tierDiff));
  }

  return { COUNTRIES, CITIES, HOMES, MAP_DOTS, getCountry, getCity, getHome, getCitiesByCountry, getMoveCost };
})();
