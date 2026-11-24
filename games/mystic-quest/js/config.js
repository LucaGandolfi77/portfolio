/* Mystic Quest — realms, story, collectibles and EN/IT strings */
export const VERSION = 1;
export const WORLD = { w:420, h:640 };

export const REALMS = [
  {
    id:'meadow', en:'Whispering Meadows', it:'Prati Sussurranti',
    sky:['#7eccf5','#2c5aa0'], ground:'#1e6b45', accent:'#8ef0b0', spirit:'leaf',
    enStory:'The meadow remembers every step of Luma. Three stars sleep in the grass — find them and wake its gentle spirit.',
    itStory:'Il prato ricorda ogni passo di Luma. Tre stelle dormono nell’erba: trovale e risveglia il suo spirito gentile.'
  },
  {
    id:'marsh', en:'Luminous Marshes', it:'Paludi Luminose',
    sky:['#a8e65d','#274d2c'], ground:'#1b3f34', accent:'#c8ff7a', spirit:'water',
    enStory:'Fireflies weave the path ahead. The marsh spirit hides between the reeds, waiting for a steady lantern.',
    itStory:'Le lucciole intrecciano il sentiero. Lo spirito della palude si nasconde tra le canne, in attesa di una lanterna salda.'
  },
  {
    id:'cliffs', en:'Cinder Cliffs', it:'Rupe di Braci',
    sky:['#f3b5a7','#5c1d14'], ground:'#3a1a1a', accent:'#ff9a72', spirit:'fire',
    enStory:'Warm stone and drifting ash. The cliff spirit is shy, not fierce — calm it with patience.',
    itStory:'Pietra calda e cenere fluttuante. Lo spirito della rupe è timido, non feroce: calmalo con pazienza.'
  },
  {
    id:'vale', en:'Frostbloom Vale', it:'Valle dei Ghiacci',
    sky:['#a9e6ff','#204a7a'], ground:'#1d3550', accent:'#bfe9ff', spirit:'frost',
    enStory:'Frozen petals ring like small bells. The vale spirit has waited centuries for the dawn to return.',
    itStory:'Petali ghiacciati suonano come campanelle. Lo spirito della valle ha atteso secoli che l’alba tornasse.'
  },
  {
    id:'spire', en:'Celestial Spire', it:'Guglia Celeste',
    sky:['#fff3b0','#6b4bb0'], ground:'#2a2050', accent:'#ffe98a', spirit:'star',
    enStory:'The last stars orbit the spire. Free its spirit and the sky will remember its light once more.',
    itStory:'Le ultime stelle orbitano attorno alla guglia. Libera il suo spirito e il cielo ricorderà la sua luce.'
  }
];

export const OBJECTIVES = [
  { id:'stars', en:'Starlight collector', it:'Collezionista di stelle', goal:15 },
  { id:'spirits', en:'Spirit guide', it:'Guida degli spiriti', goal:5 },
  { id:'realms', en:'Realm walker', it:'Camminatore dei regni', goal:5 }
];

export const STR = {
  it: {
    skip:'Vai al contenuto', title:'MYSTIC QUEST', tagline:'Riporta la luce nel cielo',
    continue:'Continua', newGame:'Nuova avventura', realms:'Regni', journal:'Diario',
    settings:'Impostazioni', help:'Guida', lang:'IT / EN', theme:'Tema', back:'Indietro',
    stars:'Stelle', spirits:'Spiriti', realm:'Regno', lantern:'Lanterna', calm:'Calma lo spirito',
    hold:'Tieni premuto', pause:'Pausa', resume:'Riprendi', restart:'Ricomincia', menu:'Menu',
    collected:'Stella raccolta!', freed:'Spirito liberato!', unlock:'Nuovo regno sbloccato!',
    complete:'Avventura completata', finale:'Il cielo è di nuovo intero. Luma è la nuova guardiana dell’Alba Celeste.',
    sound:'Suono', vibration:'Vibrazione', motion:'Effetti ridotti', quality:'Qualità',
    low:'Bassa', high:'Alta', close:'Chiudi', reset:'Cancella partita', confirmReset:'Cancellare tutti i progressi?',
    ok:'OK', cancel:'Annulla', tap:'Tocca per muoverti', move:'Muoviti',
    realmLocked:'Regno bloccato', enter:'Entra', progress:'Progressi', objectives:'Obiettivi',
    helpText:'Tocca il mondo per muovere Luma. Raccogli le 3 stelle di ogni regno, poi avvicinati allo spirito e tieni premuto il pulsante della lanterna per calmarlo. Ogni spirito liberato apre il regno successivo.',
    chapter:'Capitolo', of:'di', diary:'Diario di viaggio', empty:'Ancora nessun ricordo',
    newBest:'Nuovo ricordo', travel:'Viaggia', current:'Attuale'
  },
  en: {
    skip:'Skip to content', title:'MYSTIC QUEST', tagline:'Bring the light back to the sky',
    continue:'Continue', newGame:'New adventure', realms:'Realms', journal:'Journal',
    settings:'Settings', help:'Help', lang:'IT / EN', theme:'Theme', back:'Back',
    stars:'Stars', spirits:'Spirits', realm:'Realm', lantern:'Lantern', calm:'Calm the spirit',
    hold:'Hold', pause:'Pause', resume:'Resume', restart:'Restart', menu:'Menu',
    collected:'Star collected!', freed:'Spirit freed!', unlock:'New realm unlocked!',
    complete:'Adventure complete', finale:'The sky is whole again. Luma is the new guardian of the Celestial Dawn.',
    sound:'Sound', vibration:'Vibration', motion:'Reduced motion', quality:'Quality',
    low:'Low', high:'High', close:'Close', reset:'Delete save', confirmReset:'Delete all progress?',
    ok:'OK', cancel:'Cancel', tap:'Tap to move', move:'Move',
    realmLocked:'Realm locked', enter:'Enter', progress:'Progress', objectives:'Objectives',
    helpText:'Tap the world to move Luma. Collect the 3 stars in each realm, then approach the spirit and hold the lantern button to calm it. Every freed spirit opens the next realm.',
    chapter:'Chapter', of:'of', diary:'Travel journal', empty:'No memories yet',
    newBest:'New memory', travel:'Travel', current:'Current'
  }
};

export const realm = index => REALMS[Math.max(0, Math.min(REALMS.length - 1, index))];
