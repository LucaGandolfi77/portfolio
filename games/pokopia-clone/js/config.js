/* DITTOPIA — game data and expanded content */

export const TILE = { GRASS:0, TGRASS:1, DIRT:2, PATH:3, WATER:4, SAND:5, PAVE:6, DARKGRASS:7, ROCK:8, CAVEFLOOR:9, CAVEWALL:10, FLOWER:11, SNOW:12, BRICK:13 };
export const TILE_WALK = { 0:1,1:1,2:1,3:1,4:0,5:1,6:1,7:1,8:0,9:1,10:0,11:1,12:1,13:1 };
export const TILE_CAT = { 4:'water', 6:'ruin', 8:'rock', 1:'grass', 7:'grass', 9:'cave', 13:'ruin' };
export const SHINY_CHANCE = 1/128;
export const FULL_MOON_MINUTES = [3,6,11,17,22];

export const ITEMS = {
  rametto:{name:'Rametto',kind:'res'}, ciottolo:{name:'Ciottolo',kind:'res'},
  legno:{name:'Legno',kind:'res'}, pietra:{name:'Pietra',kind:'res'},
  fibra:{name:'Fibra',kind:'res'}, bacca:{name:'Bacca',kind:'res'},
  fiore:{name:'Fiore',kind:'res'}, metallo:{name:'Metallo',kind:'res'},
  caramella:{name:'Caramella Rara',kind:'res'}, cristallo:{name:'Cristallo',kind:'res'},
  flauto:{name:'Poké Flauto',kind:'res',desc:'Una melodia che sveglia ogni Pokémon addormentato.'},
  banco:{name:'Banco da lavoro',kind:'place',cost:{rametto:5,ciottolo:5},move:'base'},
  falò:{name:'Falò',kind:'place',cost:{legno:2,rametto:3},move:'base',light:true},
  torcia:{name:'Torcia',kind:'place',cost:{legno:1,rametto:2},move:'base',light:true},
  panchina:{name:'Panchina',kind:'place',cost:{legno:3},move:'base'},
  letto:{name:'Letto',kind:'place',cost:{legno:4,fibra:6},move:'base'},
  aiuola:{name:'Aiuola',kind:'place',cost:{fiore:3,fibra:2},move:'base'},
  cespuglio:{name:'Cespuglio',kind:'place',cost:{fibra:4,rametto:2},move:'fogliame'},
  vaso:{name:'Vaso di fiori',kind:'place',cost:{pietra:2,fiore:1},move:'base'},
  sacco:{name:'Sacco da boxe',kind:'place',cost:{fibra:6,legno:2},move:'base'},
  stereo:{name:'Stereo',kind:'place',cost:{metallo:4,legno:3},move:'base'},
  statua:{name:'Statua',kind:'place',cost:{pietra:6},move:'base',light:'dim'},
  altare:{name:'Altare mistico',kind:'place',cost:{pietra:8,caramella:1},move:'base',light:'dim'},
  fontana:{name:'Fontana',kind:'place',cost:{pietra:6,cristallo:2},move:'base',light:'dim'},
  capanna:{name:'Capanna',kind:'place',cost:{legno:10,fibra:8,pietra:4},move:'base',light:true},
  albero:{name:'Albero',kind:'natural',drops:'legno'},
  roccia:{name:'Roccia',kind:'natural',drops:'pietra'},
  detrito:{name:'Detrito',kind:'natural',drops:'mix'},
  cespuglio_nat:{name:'Cespuglio',kind:'natural',drops:'fibra'},
  spruzzabacche:{name:'Cespuglio di bacche',kind:'natural',drops:'bacca'},
  rovina_metallo:{name:'Rottame metallico',kind:'natural',drops:'metallo'},
  cristallo_nat:{name:'Cristallo lucente',kind:'natural',drops:'cristallo'}
};

export const MOVES = {
  base:{name:'Mani (Trasformazione)'}, fogliame:{name:'Fogliame'},
  pistolacqua:{name:'Pistolacqua'}, taglio:{name:'Taglio'}, spaccaroccia:{name:'Spaccaroccia'},
  braciere:{name:'Braciere'}, energia:{name:'Energia'}, scava:{name:'Scava'}, splash:{name:'Splash'},
  neve:{name:'Nevica'}, ghiaccio:{name:'Ghiaccio'}
};
export const MOVE_ORDER = ['base','pistolacqua','fogliame','taglio','spaccaroccia','braciere','energia','scava','splash','neve','ghiaccio'];

export const SPECIES = {
  squirtle:{name:'Squirtle',n:7,type:'Acqua',cry:[120,380,120,440,120,500],teaches:'pistolacqua',follows:true,questOnly:true,flavor:'Una tartarughina sturdy. Quando si spaventa ritira il guscio e sputa acqua.'},
  bulbasaur:{name:'Bulbasaur',n:1,type:'Erba',cry:[100,330,140,392,160,294],teaches:'fogliame',follows:true,flavor:"C'è un seme piantato sulla schiena fin dalla nascita."},
  charmander:{name:'Charmander',n:4,type:'Fuoco',cry:[160,440,200,523,120,392],teaches:'braciere',follows:true,flavor:'La fiamma sulla coda mostra la sua salute. Non si spegne mai.'},
  oddish:{name:'Oddish',n:43,type:'Erba',cry:[180,294,180,247,220,330],teaches:null,follows:true,flavor:'Di notte vaga seminando i suoi semi.'},
  caterpie:{name:'Caterpie',n:10,type:'Coleottero',cry:[100,660,100,880,100,740],teaches:null,follows:false,flavor:'Mangia voracemente foglie.'},
  butterfree:{name:'Butterfree',n:12,type:'Coleottero',cry:[200,587,160,698,200,784],teaches:null,follows:false,flavor:'Ali coperte di polvere idrorepellente.'},
  pidgey:{name:'Pidgey',n:16,type:'Normale',cry:[140,440,120,494,140,392],teaches:null,follows:false,flavor:'Pokémon docile. Se si spaventa fa tornado di sabbia.'},
  farfetchd:{name:"Farfetch'd",n:83,type:'Normale',cry:[160,392,160,440,160,392],teaches:'taglio',follows:true,questOnly:true,flavor:'Combatte con un porro usato come spada.'},
  geodude:{name:'Geodude',n:74,type:'Roccia',cry:[200,220,200,196,200,247],teaches:'spaccaroccia',follows:true,flavor:'Lo scambiano per un sasso.'},
  diglett:{name:'Diglett',n:50,type:'Terra',cry:[80,330,80,294,80,330,80,294],teaches:'scava',follows:true,flavor:'Vive sotto terra. Quando emerge fa crepare il suolo.'},
  pikachu:{name:'Peakychu',n:25,type:'Elettro',cry:[60,880,40,988,40,880,80,1046],teaches:'energia',follows:true,questOnly:true,flavor:'Un Pikachu che ha perso la scintilla. Ma dentro batte un cuore elettrico.'},
  meowth:{name:'Meowth',n:52,type:'Normale',cry:[180,523,180,440,180,523],teaches:null,follows:true,flavor:'Adora gli oggetti luccicanti.'},
  jigglypuff:{name:'Jigglypuff',n:39,type:'Fata',cry:[300,392,200,440,400,523],teaches:null,follows:false,flavor:'Il suo canto fa addormentare i nemici.'},
  psyduck:{name:'Psyduck',n:54,type:'Acqua',cry:[300,247,200,294,300,247],teaches:null,follows:true,flavor:'Soffre di mal di testa costanti.'},
  magikarp:{name:'Magikarp',n:129,type:'Acqua',cry:[80,196,80,220,80,196],teaches:'splash',follows:false,flavor:'Debole e inutile. Salta e basta. Splash!'},
  gastly:{name:'Gastly',n:92,type:'Spettro',cry:[400,180,200,164,400,196],teaches:null,follows:true,flavor:'Avvolge i nemici in un gas tossico.'},
  snorlax:{name:'Mosslax',n:143,type:'Normale',cry:[600,160,400,147,600,160],teaches:null,follows:true,questOnly:true,flavor:'Uno Snorlax dormito così a lungo che muschi gli crescono addosso.'},
  dratini:{name:'Dratini',n:147,type:'Drago',cry:[200,698,160,784,200,698],teaches:null,follows:true,caveOnly:true,flavor:'Serpente drago leggendario. Muta pelle nella grotta nascosta.'},
  mew:{name:'Mew',n:151,type:'Psico',cry:[120,1046,120,1175,120,1319,120,1046],teaches:null,follows:true,special:true,flavor:'Si dice possieda il DNA di tutti i Pokémon. Solo a un cuore puro.'},
  // nuove specie delle zone espansionate
  chikorita:{name:'Chikorita',n:152,type:'Erba',cry:[140,392,160,440,140,392],teaches:'fogliame',follows:true,flavor:'Il grande foglio sulla testa percepisce l’umidità dell’aria.'},
  cyndaquil:{name:'Cyndaquil',n:155,type:'Fuoco',cry:[120,523,120,587,160,523],teaches:'braciere',follows:true,flavor:'Le fiamme sulla schiena si accendono quando è sorpreso.'},
  totodile:{name:'Totodile',n:158,type:'Acqua',cry:[100,347,120,392,100,347],teaches:'pistolacqua',follows:true,flavor:'Piccolo e irrequieto. I suoi morsi sono sorprendentemente forti.'},
  mareep:{name:'Mareep',n:179,type:'Elettro',cry:[220,587,220,659,220,587],teaches:'energia',follows:true,flavor:'Il vello accumula elettricità durante le tempeste.'},
  pichu:{name:'Pichu',n:172,type:'Elettro',cry:[80,988,60,1046,80,988],teaches:null,follows:true,flavor:'Troppo giovane per controllare l’elettricità. Fa scintille quando ride.'},
  togepi:{name:'Togepi',n:175,type:'Fata',cry:[200,784,200,880,200,784],teaches:null,follows:true,flavor:'Si dice porti fortuna a chi lo tratta con gentilezza.'},
  natu:{name:'Natu',n:177,type:'Psico',cry:[160,698,140,784,160,698],teaches:null,follows:false,flavor:'Non vola: salta e si arrampica con il becco.'},
  sentret:{name:'Sentret',n:161,type:'Normale',cry:[180,440,180,494,180,440],teaches:null,follows:true,flavor:'Si erge sulla coda per guardare in lontananza.'},
  delibird:{name:'Delibird',n:225,type:'Ghiaccio',cry:[220,523,220,587,220,523],teaches:'neve',follows:true,flavor:'Porta regali e neve ovunque vada.'},
  snover:{name:'Snover',n:459,type:'Ghiaccio',cry:[300,294,300,330,300,294],teaches:'ghiaccio',follows:true,flavor:'Vive nelle zone più fredde. Il pelo è sempre ricoperto di brina.'}
};

export const HABITATS = [
  {mon:'bulbasaur',req:[{k:'aiuola',count:1,r:2},{k:'grass',count:4,r:2}],time:'day',limit:1},
  {mon:'oddish',req:[{k:'aiuola',count:1,r:3}],time:'night',limit:2},
  {mon:'caterpie',req:[{k:'cespuglio',count:1,r:2}],time:'any',limit:2},
  {mon:'butterfree',req:[{k:'aiuola',count:2,r:3}],time:'day',needDex:5,limit:1},
  {mon:'pidgey',req:[{k:'tree',count:2,r:3}],time:'day',limit:2},
  {mon:'geodude',req:[{k:'rock',count:2,r:3}],time:'day',limit:2},
  {mon:'charmander',req:[{k:'falò',count:1,r:2}],time:'any',limit:1},
  {mon:'meowth',req:[{k:'statua',count:1,r:2}],time:'night',limit:1},
  {mon:'jigglypuff',req:[{k:'stereo',count:1,r:2}],time:'any',needDex:6,limit:1},
  {mon:'psyduck',req:[{k:'water',count:4,r:2}],time:'any',limit:1},
  {mon:'magikarp',req:[{k:'water',count:4,r:1}],time:'any',limit:2},
  {mon:'gastly',req:[{k:'ruin',count:4,r:3}],time:'night',limit:2},
  {mon:'chikorita',req:[{k:'fontana',count:1,r:2}],time:'day',limit:1},
  {mon:'cyndaquil',req:[{k:'falò',count:2,r:3}],time:'any',limit:1},
  {mon:'totodile',req:[{k:'water',count:6,r:3}],time:'any',limit:1},
  {mon:'mareep',req:[{k:'fontana',count:1,r:4}],time:'any',limit:1},
  {mon:'pichu',req:[{k:'capanna',count:1,r:3}],time:'any',limit:1},
  {mon:'togepi',req:[{k:'aiuola',count:3,r:3}],time:'day',limit:1},
  {mon:'natu',req:[{k:'ruin',count:3,r:3}],time:'day',limit:1},
  {mon:'sentret',req:[{k:'panchina',count:1,r:2}],time:'any',limit:1},
  {mon:'delibird',req:[{k:'statua',count:1,r:4}],time:'night',limit:1},
  {mon:'snover',req:[{k:'rock',count:3,r:3}],time:'any',limit:1},
  {mon:'mew',req:[{k:'altare',count:1,r:1}],time:'night',needFriends:12,limit:1,special:true}
];

export const ZONES = [
  {id:'meadow',name:'Prato di Kanto',bounds:[0,0,80,32],accent:'#8fe38a',weather:'clear'},
  {id:'ruins',name:'Rovine di Celestopoli',bounds:[48,55,80,80],accent:'#e0b878',weather:'dust'},
  {id:'cave',name:'Grotta di Levantania',bounds:[34,8,47,19],accent:'#b49be8',weather:'cave'},
  {id:'frost',name:'Distesa Gelata',bounds:[58,2,79,20],accent:'#9fd8ff',weather:'snow'}
];

export const QUESTS = [
  {id:'q1',title:'Il risveglio di Ditto',giver:'tangrowth',lines:['Sciocco piccolo blob viola... ma guardati!','Sei un Ditto trasformato in umano!','Gli umani hanno lasciato la Kanto molto tempo fa. Ma noi Pokémon siamo ancora qui.','Io sono il Professor Tangrowth. Tu lo coltiverai. Avanti!'],goal:'Parla col Professor Tangrowth',next:'q2'},
  {id:'q2',title:'Una tartarughina assetata',lines:['Vedi quello Squirtle là? È disidratato, poverino.','Prima raccogli ciò che trovi nei detriti. Premi E davanti a un cumulo!'],goal:'Raccogli 5 Rametti e 5 Ciottoli',need:{rametto:5,ciottolo:5},next:'q3'},
  {id:'q3',title:'La prima amicizia',lines:['Porta acqua a Squirtle! Avvicinati e premi E.','Un Ditto impara le mosse dai Pokémon amici. Lui ti insegnerà Pistolacqua.'],goal:'Aiuta Squirtle disidratato',flag:'squirtle_helped',next:'q4'},
  {id:'q4',title:'Innaffia il giardino',lines:['Squirtle ti ha insegnato Pistolacqua! Selezionala con il tasto 2.','Innaffia le piantine secche: l’erba crescerà e attirerà nuovi amici.'],goal:'Innaffia 3 piantine secche',flag:'watered3',next:'q5'},
  {id:'q5',title:'Costruisci un Falò',lines:['Viene notte, fa freddo. Servirà del legno... e un Banco da lavoro.','Costruisci un Banco (C) poi un Falò. La notte attira qualcuno di scaglioso!'],goal:'Costruisci un Banco e un Falò',place:['banco','falò'],next:'q6'},
  {id:'q6',title:'Non puoi passare!',lines:['Un Mosslax intrappola il passaggio a nord. Serve il Poké Flauto!','Trova il Farfetch’d tra i giunchi, scopri Taglio. Recupera Metallo dalle rovine.','Crafta il Poké Flauto.'],goal:'Crafta il Poké Flauto',craft:'flauto',next:'q7'},
  {id:'q7',title:'La melodia del risveglio',lines:['Il Poké Flauto! Vai a nord dal Mosslax e premi E.','Una sequenza di note... ricordale e ripetile!'],goal:'Sveglia Mosslax con la melodia',flag:'snorlax_awake',next:'q8'},
  {id:'q8',title:'La grotta segreta',lines:['Mosslax si sveglia e si unisce a te! Oltre lui, una grotta leggendaria.','Completa il Pokédex con 12 amici ed esplora la grotta.'],goal:'Pokédex a 12 amici ed esplora la grotta',flag:'cave_explored',needFriends:12,next:'q9'},
  {id:'q9',title:"L'aurora della rinascita",lines:['Un altare. Una notte limpida. E tu, Ditto, cuore puro.','Posa un Altare mistico e attendi la mezzanotte...','La Kanto tornerà a fiorire. Grazie, da parte di tutti i Pokémon.'],goal:"Incontra Mew all'altare di notte",flag:'mew_met',next:'q10'},
  {id:'q10',title:'Nuove frontiere',lines:['La Kanto è rinata, ma c’è ancora molto da scoprire.','A nord-est, una distesa gelata. A sud, le rovine risplendono di nuovo.','Costruisci una Fontana e trova un Cristallo nelle rovine.'],goal:'Costruisci una Fontana',place:['fontana'],next:'q11'},
  {id:'q11',title:'Il freddo dell’oblio',lines:['I cristalli cantano. Il ghiaccio ricorda cose antiche.','Esplora la Distesa Gelata e fai amicizia con un Pokémon di ghiaccio.'],goal:'Fai amicizia con Delibird o Snover',flag:'ice_friend',next:'q12'},
  {id:'q12',title:'La casa degli amici',lines:['Hai costruito un mondo. Ora dai a tutti un posto dove tornare.','Costruisci una Capanna e raduna 18 amici nel Pokédex.'],goal:'Costruisci una Capanna e 18 amici',place:['capanna'],needFriends:18}
];

export const DIALOGUES = {
  youngster:['Adoro i pantaloncini! Sono comodi e facili da portare!'],
  rocket:['GIO-GIO-GIO! Team Rocket! ...aspetta, sei tu, Ditto? È solo un graffiti.'],
  oldman:['Ehi! I miei Pokémon sono pallidi! Vuoi un Ko? ...scusa, un caffè.'],
  sign:['ROVINE DI CELESTROPOLI — Vietato l’accesso (ma chi ci bada più)','ATTENZIONE: generatore fuori servizio.','La grotta a nord è bloccata da un grosso cuscino muschioso?'],
  oak:['C’è un tempo e un luogo per ogni cosa... ma non ora!'],
  missingno:['…','M̵i̵s̵s̵i̵n̵g̵N̵o̵.̵ comparso.','██████ ERROR █ DATA CORRUPT █','+1 Caramella Rara. Fortunello?']
};

export const ACHIEVEMENTS = [
  {id:'firstFriend',icon:'❤️',label:'Primo amico'},
  {id:'dex10',icon:'📘',label:'10 Pokémon visti'},
  {id:'friends12',icon:'🤝',label:'12 amici'},
  {id:'crafter',icon:'🔨',label:'10 oggetti craftati'},
  {id:'nightOwl',icon:'🌙',label:'Esplora di notte'},
  {id:'shiny',icon:'✨',label:'Shiny trovato'},
  {id:'finale',icon:'🌸',label:'Kanto rinata'}
];
