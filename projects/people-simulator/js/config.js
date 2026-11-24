/* People Simulator — data, activities and bilingual strings */

// [name, abbr, population 2023, capital, largest city, nickname, since, GDP $B, income $, area mi²]
export const STATES = [
  ['Alabama','AL',5108468,'Montgomery','Huntsville','Yellowhammer State',1819,305,59609,52420],
  ['Alaska','AK',733406,'Juneau','Anchorage','The Last Frontier',1959,64,86370,665384],
  ['Arizona','AZ',7431344,'Phoenix','Phoenix','Grand Canyon State',1912,491,76872,113990],
  ['Arkansas','AR',3067732,'Little Rock','Little Rock','The Natural State',1836,156,56335,53179],
  ['California','CA',38965193,'Sacramento','Los Angeles','The Golden State',1850,3786,95521,163696],
  ['Colorado','CO',5877610,'Denver','Denver','The Centennial State',1876,456,87698,104094],
  ['Connecticut','CT',3617176,'Hartford','Bridgeport','Constitution State',1788,346,90213,5543],
  ['Delaware','DE',1031890,'Dover','Wilmington','The First State',1787,98,82174,2489],
  ['District of Columbia','DC',678972,'Washington','Washington',"The Nation's Capital",1790,163,106821,68],
  ['Florida','FL',22610726,'Tallahassee','Jacksonville','Sunshine State',1845,1596,73311,65758],
  ['Georgia','GA',11029227,'Atlanta','Atlanta','The Peach State',1788,832,74091,59425],
  ['Hawaii','HI',1435138,'Honolulu','Honolulu','The Aloha State',1959,111,95322,10932],
  ['Idaho','ID',1964726,'Boise','Boise','The Gem State',1890,122,72733,83569],
  ['Illinois','IL',12549689,'Springfield','Chicago','The Prairie State',1818,1090,80306,57914],
  ['Indiana','IN',6862199,'Indianapolis','Indianapolis','The Hoosier State',1816,502,72353,36420],
  ['Iowa','IA',3207004,'Des Moines','Des Moines','The Hawkeye State',1846,259,72429,56273],
  ['Kansas','KS',2940546,'Topeka','Wichita','The Sunflower State',1861,230,71406,82278],
  ['Kentucky','KY',4526154,'Frankfort','Louisville','The Bluegrass State',1792,300,62417,40408],
  ['Louisiana','LA',4573749,'Baton Rouge','New Orleans','The Pelican State',1812,340,58229,52378],
  ['Maine','ME',1395722,'Augusta','Portland','The Pine Tree State',1820,93,71963,35380],
  ['Maryland','MD',6180253,'Annapolis','Baltimore','The Old Line State',1788,516,101652,12406],
  ['Massachusetts','MA',7001399,'Boston','Boston','The Bay State',1788,736,104828,10554],
  ['Michigan','MI',10037261,'Lansing','Detroit','The Great Lakes State',1837,706,69183,96714],
  ['Minnesota','MN',5737915,'Saint Paul','Minneapolis','The North Star State',1858,479,90374,86936],
  ['Mississippi','MS',2939690,'Jackson','Jackson','The Magnolia State',1817,152,54203,48432],
  ['Missouri','MO',6196156,'Jefferson City','Kansas City','The Show-Me State',1821,448,68420,69707],
  ['Montana','MT',1132812,'Helena','Billings','Big Sky Country',1889,77,67631,147040],
  ['Nebraska','NE',1978379,'Lincoln','Omaha','The Cornhusker State',1867,177,74985,77348],
  ['Nevada','NV',3194176,'Carson City','Las Vegas','The Silver State',1864,266,79198,110572],
  ['New Hampshire','NH',1402054,'Concord','Manchester','The Granite State',1788,121,94662,9349],
  ['New Jersey','NJ',9290841,'Trenton','Newark','The Garden State',1787,748,99751,8723],
  ['New Mexico','NM',2114371,'Santa Fe','Albuquerque','Land of Enchantment',1912,135,59726,121590],
  ['New York','NY',19571216,'Albany','New York City','The Empire State',1788,2172,84878,54555],
  ['North Carolina','NC',10835491,'Raleigh','Charlotte','The Tar Heel State',1789,788,70522,53819],
  ['North Dakota','ND',783926,'Bismarck','Fargo','Peace Garden State',1889,82,74528,70698],
  ['Ohio','OH',11785935,'Columbus','Columbus','The Buckeye State',1803,885,66800,44826],
  ['Oklahoma','OK',4053824,'Oklahoma City','Oklahoma City','The Sooner State',1907,264,63206,69899],
  ['Oregon','OR',4233358,'Salem','Portland','The Beaver State',1859,331,80145,98379],
  ['Pennsylvania','PA',12961683,'Harrisburg','Philadelphia','Keystone State',1787,1024,73170,46054],
  ['Rhode Island','RI',1095962,'Providence','Providence','The Ocean State',1790,79,84842,1545],
  ['South Carolina','SC',5373555,'Columbia','Charleston','The Palmetto State',1788,332,66818,32020],
  ['South Dakota','SD',919318,'Pierre','Sioux Falls','The Mount Rushmore State',1889,76,71851,77116],
  ['Tennessee','TN',7126489,'Nashville','Nashville','The Volunteer State',1796,543,67633,42144],
  ['Texas','TX',30503301,'Austin','Houston','The Lone Star State',1845,2592,75780,268596],
  ['Utah','UT',3417734,'Salt Lake City','Salt Lake City','The Beehive State',1896,291,91750,84896],
  ['Vermont','VT',647464,'Montpeller','Burlington','The Green Mountain State',1791,45,81211,9616],
  ['Virginia','VA',8715698,'Richmond','Virginia Beach','Old Dominion',1788,748,89331,42775],
  ['Washington','WA',7812880,'Olympia','Seattle','The Evergreen State',1889,813,94605,71298],
  ['West Virginia','WV',1770071,'Charleston','Charleston','The Mountain State',1863,103,57912,24230],
  ['Wisconsin','WI',5910955,'Madison','Milwaukee',"America's Dairyland",1848,441,72458,65496],
  ['Wyoming','WY',584057,'Cheyenne','Cheyenne','The Equality State',1890,54,72795,97813]
];

export const TIMEZONES = {
  Alabama:-1,Alaska:-4,Arizona:-2,Arkansas:-1,California:-3,Colorado:-2,Connecticut:0,
  Delaware:0,'District of Columbia':0,Florida:0,Georgia:0,Hawaii:-5,Idaho:-2,Illinois:-1,
  Indiana:0,Iowa:-1,Kansas:-1,Kentucky:0,Louisiana:-1,Maine:0,Maryland:0,Massachusetts:0,
  Michigan:0,Minnesota:-1,Mississippi:-1,Missouri:-1,Montana:-2,Nebraska:-1,Nevada:-3,
  'New Hampshire':0,'New Jersey':0,'New Mexico':-2,'New York':0,'North Carolina':0,
  'North Dakota':-1,Ohio:0,Oklahoma:-1,Oregon:-3,Pennsylvania:0,'Rhode Island':0,
  'South Carolina':0,'South Dakota':-1,Tennessee:-1,Texas:-1,Utah:-2,Vermont:0,Virginia:0,
  Washington:-3,'West Virginia':0,Wisconsin:-1,Wyoming:-2
};

export const ACTIVITIES = [
  { id:'sleep', icon:'😴', en:'Sleeping', it:'Dormono', color:'#6366f1' },
  { id:'work', icon:'💼', en:'At work', it:'Al lavoro', color:'#f59e0b' },
  { id:'school', icon:'🎓', en:'At school', it:'A scuola', color:'#ec4899' },
  { id:'travel', icon:'🚗', en:'Commuting', it:'In viaggio', color:'#eab308' },
  { id:'home', icon:'🏠', en:'At home', it:'A casa', color:'#0ea5e9' },
  { id:'chores', icon:'🧺', en:'Household', it:'Faccende', color:'#fb7185' },
  { id:'leisure', icon:'📺', en:'Leisure', it:'Tempo libero', color:'#a855f7' },
  { id:'shopping', icon:'🛍️', en:'Shopping', it:'Shopping', color:'#f97316' },
  { id:'eating', icon:'🍽️', en:'Eating', it:'Mangiano', color:'#22c55e' },
  { id:'personal', icon:'🛁', en:'Personal care', it:'Cura personale', color:'#2dd4bf' },
  { id:'civic', icon:'⛪', en:'Civic / Religious', it:'Civico / Religioso', color:'#94a3b8' },
  { id:'sport', icon:'🏃', en:'Sports', it:'Sport', color:'#84cc16' },
  { id:'retirement', icon:'👴', en:'Retirement', it:'Pensionati', color:'#c084fc' }
];

export const COHORTS = [
  { id:'young', en:'Students (0–17)', it:'Studenti (0–17)', share:0.22 },
  { id:'adult', en:'Workers (18–64)', it:'Lavoratori (18–64)', share:0.63 },
  { id:'senior', en:'Seniors (65+)', it:'Anziani (65+)', share:0.15 }
];

export const EVENTS = [
  { id:'none', en:'Normal day', it:'Giornata normale', icon:'➖', effect:{} },
  { id:'snow', en:'Snow day', it:'Neve', icon:'❄️', effect:{ school:-40, travel:-15, home:+25 } },
  { id:'heat', en:'Heat wave', it:'Ondata di caldo', icon:'🌡️', effect:{ home:+12, leisure:-10, work:-5 } },
  { id:'holiday', en:'Holiday', it:'Festività', it2:'', icon:'🎉', effect:{ work:-45, leisure:+25, shopping:+15 } },
  { id:'gameday', en:'Game day', it:'Giornata di partita', icon:'🏟️', effect:{ leisure:+18, sport:+10, work:-8 } },
  { id:'blackout', en:'Blackout', it:'Blackout', icon:'🔌', effect:{ home:+30, work:-20, leisure:-15 } }
];

export const DEFAULT_SETTINGS = Object.freeze({ wpm: 0, speed: 4, event: 'none', theme: 'dark', lang: 'en' });

export const STR = {
  en: {
    title:'PEOPLE SIMULATOR', tagline:'A living model of a day in the United States', skip:'Skip to content', metrics:'Live metrics',
    play:'Play', pause:'Pause', speed:'Speed', clock:'Simulated time', today:'Today',
    dominant:'Right now, most people are', people:'people', state:'State', national:'United States',
    compare:'Compare', reset:'Reset view', events:'Event', scenario:'Scenario',
    population:'Population', density:'Density', gdp:'GDP', income:'Median income',
    activity:'Activity', ranking:'Ranking', timeline:'Timeline', sparkline:'Last 24 hours',
    sectors:'Activity mix', happiness:'Happiness', traffic:'Traffic', energy:'Energy use',
    sleepDebt:'Sleep debt', productivity:'Productivity', eventsLabel:'Active event',
    settings:'Settings', theme:'Theme', lang:'Language', favorites:'Favorites',
    tutorial:'How it works', tutorialText:'People are modelled in cohorts with hourly transition probabilities. Pick a state, watch the day unfold, inject an event and compare regions.',
    stepHour:'+1 hour', stepDay:'+1 day', sunrise:'Sunrise', noon:'Noon', dusk:'Dusk',
    offline:'Vendored map & data — works offline', loading:'Loading model…',
    sortedBy:'Sorted by', when:'When', ok:'OK', cancel:'Cancel'
  },
  it: {
    title:'PEOPLE SIMULATOR', tagline:'Un modello vivace di una giornata negli Stati Uniti', skip:'Vai al contenuto', metrics:'Metriche live',
    play:'Riproduci', pause:'Pausa', speed:'Velocità', clock:'Ora simulata', today:'Oggi',
    dominant:'In questo momento la maggior parte delle persone è', people:'persone', state:'Stato', national:'Stati Uniti',
    compare:'Confronta', reset:'Reimposta vista', events:'Evento', scenario:'Scenario',
    population:'Popolazione', density:'Densità', gdp:'PIL', income:'Reddito mediano',
    activity:'Attività', ranking:'Classifica', timeline:'Timeline', sparkline:'Ultime 24 ore',
    sectors:'Mix attività', happiness:'Felicità', traffic:'Traffico', energy:'Consumo energetico',
    sleepDebt:'Debito di sonno', productivity:'Produttività', eventsLabel:'Evento attivo',
    settings:'Impostazioni', theme:'Tema', lang:'Lingua', favorites:'Preferiti',
    tutorial:'Come funziona', tutorialText:'Le persone sono modellate in coorti con probabilità di transizione orarie. Scegli uno stato, osserva la giornata, inietta un evento e confronta le regioni.',
    stepHour:'+1 ora', stepDay:'+1 giorno', sunrise:'Alba', noon:'Mezzogiorno', dusk:'Tramonto',
    offline:'Mappa e dati inclusi — funziona offline', loading:'Caricamento modello…',
    sortedBy:'Ordina per', when:'Quando', ok:'OK', cancel:'Annulla'
  }
};
