"use strict";

const FP = (function () {

  const NAMES = [
    "Gennaro","Cristian","Sandro","Erling","Marco","Antonio","Diego",
    "Luca","Matteo","Davide","Alessandro","Giacomo","Federico","Francesco",
    "Lorenzo","Nicolò","Riccardo","Simone","Andrea","Giovanni","Giuseppe",
    "Roberto","Paolo","Stefano","Carlo","Filippo","Alberto","Pietro",
    "Gianluca","Vincenzo","Salvatore","Fabio","Sergio","Marco","Mattia",
    "Leonardo","Raffaele","Pasquale","Michele","Umberto","Tiziano","Sergiusz",
    "Lukas","Karim","João","Rafa","Mats","Kevin","Olivier","Ibrahim"
  ];

  const SURNAMES = [
    "Esposito","Rossi","Bianchi","Romano","Colombo","Ricci","Marino",
    "Greco","Bruno","Gallo","Conti","De Luca","Mancini","Costa",
    "Giordano","Rizzo","Lombardi","Moretti","Barbieri","Fontana",
    "Santoro","Caruso","Marchetti","Rinaldi","Serra","Coppola",
    "De Rossi","Ferrari","Neri","Bianco","Vitale","Palumbo","Martini"
  ];

  const NICKNAMES = [
    "O Regista","Il Bidone","O Scugnizzo","Il Fantasma","Re della Panchina",
    "Il Terminator","Lo Pazzo","O Maestro","Il Magnifico","Il Muratore",
    "Il Professore","Il Rocket","Il Toro","La Rotella","Il Cinese",
    "O Guerriero","Il Fantasista","Il Capitano","Il Difensore","Il Piatto",
    "Il Metronomo","L'Ingegnere","Il Fenomeno","Il Campione","Il Maiale",
    "Il Tecnicone","Il Barista","Il Paninaro","Il Cane","L'Idolo",
    "Il Martello","Il Gatto","Il Codardo","Il Biondo","Il Rosso",
    "O Comandante","Il Tarzan","Il Timido","Il Carpentiere","Il Mago"
  ];

  const TEAMS_AI = [
    { id:"real_mentica", name:"Real Mentica", emoji:"🧠", skill:2.0 },
    { id:"atletico_no", name:"Atletico Ma Non Troppo", emoji:"🐌", skill:2.2 },
    { id:"dinamo_divano", name:"Dinamo Divano", emoji:"🛋️", skill:1.8 },
    { id:"fc_scapoli", name:"FC Scapoli", emoji:"👤", skill:1.6 },
    { id:"virtus_napoli", name:"Virtus Napoli Ma Non Frega", emoji:"🎰", skill:2.4 },
    { id:"lazio_lentamente", name:"Lazio Lentamente", emoji:"🐢", skill:1.5 },
    { id:"inter_desk", name:"Inter Desk", emoji:"💻", skill:2.1 },
    { id:"juventus_latte", name:"Juventus del Latte", emoji:"🥛", skill:1.9 },
    { id:"roma_vera", name:"Roma Vera di Fanta", emoji:"🐺", skill:2.3 }
  ];

  const FORMATIONS = ["4-3-3","4-4-2","3-5-2","4-2-3-1","5-3-2","3-4-3","4-1-4-1"];

  const ROLES = { P:1, D:4, C:4, A:2 };

  const ROLE_NAMES = { P:"Portiere", D:"Difensore", C:"Centrocampista", A:"Attaccante" };

  const ROLE_EMOJI = { P:"🧤", D:"🛡️", C:"⚙️", A:"⚔️" };

  const UPGRADES = [
    { id:"stadio", name:"Stadio La Fossa", emoji:"🏟️", desc:"La tifoseria urla più forte", baseCost:500, costMul:1.18, effect:{ type:"mult", stat:"fcPerSec", pct:0.12 }, maxLevel:50 },
    { id:"bar", name:"Bar dello Sport", emoji:"🍺", desc:"Birra e scommesse tra gli avventori", baseCost:200, costMul:1.15, effect:{ type:"flat", stat:"fcPerSec", val:0.5 }, maxLevel:80 },
    { id:"tv", name:"Diritti TV", emoji:"📺", desc:"La Gazzetta ti paga per esistere", baseCost:2000, costMul:1.20, effect:{ type:"mult", stat:"fcPerSec", pct:0.25 }, maxLevel:40 },
    { id:"giovani", name:"Settore Giovanile", emoji:"🧒", desc:"Ragazzi wild che costano poco", baseCost:800, costMul:1.22, effect:{ type:"chance", stat:"freePlayer", pct:0.08 }, maxLevel:25 },
    { id:"prep", name:"Preparatore Atletico", emoji:"💪", desc:"Meno strappi, più corsa", baseCost:600, costMul:1.17, effect:{ type:"flat", stat:"votoBonus", val:0.3 }, maxLevel:30 },
    { id:"massaggi", name:"Massaggiatore", emoji:"💆", desc:"I calciatori tornano più freschi", baseCost:400, costMul:1.16, effect:{ type:"flat", stat:"recoveryRate", val:0.1 }, maxLevel:30 },
    { id:"osservatore", name:"Osservatore", emoji:"🕵️", desc:"Rivela la vera quotazione", baseCost:3000, costMul:1.25, effect:{ type:"reveal", stat:"bidoniRevealed" }, maxLevel:10 },
    { id:"pullman", name:"Pullman Ufficiale", emoji:"🚌", desc:"Fuoricasco bonus (+20% voti in trasferta)", baseCost:1500, costMul:1.19, effect:{ type:"mult", stat:"awayBonus", pct:0.20 }, maxLevel:20 },
    { id:"drone", name:"Drone Tattico", emoji:"🛸", desc:"Il VAR locale", baseCost:5000, costMul:1.30, effect:{ type:"mult", stat:"votoBonus", pct:0.05 }, maxLevel:15 }
  ];

  const EVENT_TEMPLATES = {
    goal: [
      "⚽ GOOOOL! {name} inventa un tiro da 40 metri e il portiere se lo pappa!",
      "⚽ {name} tira da fuori area: RETE! Il portiere stava ancora leggendo il giornale!",
      "⚽ GOAL DI {name}! Cross perfetto, testa fragorosa, bandiere che volano!",
      "⚽ {name} ruba il pallone e scappa da solo. Nessuno lo insegue. GOAL!",
      "⚽ {name} tira in托纳迪利: ERRORE DEL PORTIERE! 1-0!",
      "⚽ {name} inventa un tunnel, poi un-controls, poi il gol. Gente che piange in tribuna.",
      "⚽ {name} segna di testa! Il suo primo gol in carriera. I compagni non lo riconoscono."
    ],
    assist: [
      "🅰️ {name} crossa alla perfezione: gol dell'assistente!",
      "🅰️ {name} serve un pallone impossibile: compagni increduli.",
      "🅰️ {name} gioca il destro e trova {target} libero."
    ],
    yellow: [
      "🟨 {name} protesta col Guardalinee: 'Ma lei non ci vede?!' → giallo!",
      "🟨 {name} fa un fallo su {target}. Il fischiatore è infastidito dal suo grido.",
      "🟨 Giallo a {name} per aver applaudito sarcasticamente l'arbitro."
    ],
    red: [
      "🟥 {name} riceve il secondo giallo per aver guardato l'arbitro troppo insistente.",
      "🟥 {name} si toglie le scarpette e le lancia verso la tribuna. ESPULSO!",
      "🟥 Cartellone rosso! {name} ha toccato il pallone con le mani... per farsi una carezza."
    ],
    injury: [
      "🏥 {name} si stira mentre festeggia un gol. È fuori per 2 settimane.",
      "🏥 {name} si infortuna scendendo dal pullman. Il massaggiatore si licenzia.",
      "🏥 {name} si è svegliato storto oggi. Fuori per Giornata.",
      "🏥 {name} si rompe l'alluce col muro dello spogliatoio. Medico: 'capita'."
    ],
    save: [
      "🧤 PARATA! Il portiere respinge con un piede che non doveva essere lì.",
      "🧤 {name} parata ECCEZIONALE! Il tiro era alto 3 metri.",
      "🧤 {name} parata fortunata: il pallone gli rimbalza sulla faccia e va fuori."
    ],
    miss: [
      "❌ {name} tira: fuori di un metro. Il pubblico lo salva con un applauso ironico.",
      "❌ {name} calcia di testa... il pallone va in tribuna. Dov'è finito?",
      "❌ Occasione sprecata! {name} solo con il portiere... tira in Vietnam.",
      "❌ {name} vuole fare il gol della settimana. Tira da 30 metri. Palla in tribuna."
    ],
    moment: [
      "📊 La squadra sta dominando: 65% possesso!",
      "📊 Le statistiche parlano chiaro: tiri 15 vs 2. Il resto è poesia.",
      "📊 Fase di pressing alto: il avversario soffre.",
      "📊 È l'ora della partita: si gioca forte!",
      "📊 Entusiasmo della curva: il capo ultras balla la samba."
    ],
    random: [
      "📢 Il presidente si è alzato dalla tribuna: 'MA CHE STAI FACENDO?!'",
      "📢 L'arbitro ha perso il fischietto. 5 minuti di pausa.",
      "📢 Due tifosi si contendono un pallone da 50 euro in tribuna.",
      "📢 Il commentator locale: 'RAGAZZI CI SIAMO!' (Non ci sono ancora).",
      "📢 Il campo ha più buche della luna. Il portiere si è bagnato le mani per niente.",
      "📢 Un piccione è atterrato in area di rigore. Il difensore l'ha marcato.",
      "📢 L'allenatore avversario si è seduto per terra. Nessuno ha capito perché."
    ]
  };

  const MATCH_COMMENTARY = [
    "La partita inizia! Squadre pronte, campo bagnato, pubblico nervoso.",
    "Si gioca la prima palla: pallone ancora fermo, il pubblico applaude.",
    "Giro palla veloce: passaggio, passaggio, passaggio... perditura!",
    "Occasione da rigore! Ma l'arbitro dice no.",
    "Fine del primo tempo: 0-0, tutti contenti tranne il pubblico.",
    "Si ricomincia! Il secondo tempo porta energia nuove.",
    "Gol annullato per fuorigioco! Il VAR ha parlato.",
    "Ultimo minuto: tensione massima, pubblico in piedi.",
    "Fischio finale! La partita finisce con 22 giocatori stanchi."
  ];

  const COACH_REACTIONS = [
    "Il Mister si alza dalla panchina: 'RAGAZZI, QUESTA È LA NOSTRA!'",
    "Il Mister si siede di nuovo. Non ha ancora capito il modulo.",
    "Il Mister chiede un timeout. Non esiste un timeout nel calcio.",
    "Il Mister è al bicchiere d'acqua. Poi al secondo. Poi al terzo.",
    "Il Mister fa il substitution: entra un giocatore che stava mangiando una mela.",
    "Il Mister urla dalla linea laterale. Nessuno lo sente.",
    "Il Mister si copre il viso con il fischiello. Poi lo usa per fischiare.",
    "Il Mister: 'Allora, che si fa?' Gli giocatori: 'Non lo sappiamo neanche noi.'"
  ];

  const BIDONE_COMMENTS = [
    "Il fantallenatore è entusiasta... per ora.",
    "Costa una fortuna ma gioca come un astronauts su Marte.",
    "Tutti lo vogliono. Ma è davvero un fenomeno?",
    "L'agente dice che è il prossimo Ronaldo. L'agente mente.",
    "Arriva dal mercato libero: 'Io segno 30 gol a stagione'. Risultato: 0.",
    "Firma il contratto e subito chiede un avvocato.",
    "Il suo fantagenitore dice che è un investimento sicuro.",
    "Ha il potenziale per diventare un campione. O per diventare un bidone.",
    "Acquistato a peso d'oro: ora pesa come una piuma.",
    "Non è un bidone. È un PROGETTO. Un progetto lungo 10 anni."
  ];

  const FANTANOTIZIE = [
    "ANALISI: Il Real Mentica è ancora in lotta per lo scudetto. (Spoiler: non è vero)",
    "SCAMBIO LAMPO: L'Inter Desk cede il suo portiere per un panino.",
    "Dopo 47 anni, la Juve del Latte vince un titolo. Di briscola.",
    "Il nuovo acquisto del Dinamo Divano: 'Mi chiamo Simone, ma potete chiamarmi Il Fenomeno'.",
    "La Virtus Napoli Ma Non Frega svela il nuovo modulo: 1-8-1.",
    "CRISI: L'Atletico Ma Non Troppo perde 5-0 con se stesso in allenamento.",
    "CALCIO SCONOSCIUTO: La Roma Vera di Fanta gioca una partita di basket. Vince 2-0.",
    "Il presidente del FC Scapoli si dimette: 'Non reggo più la tensione'.",
    "EXCLUSIVE: Il Cinese del Torino è stato visto in trattativa con la sua ombra.",
    "Il Lazio Lentamente è arrivato in ritardo alla propria partita. Per 3 ore.",
    "FURTO: Qualcuno ha rubato il tabellone del Real Mentica. Nessuno se n'è accorto.",
    "Il Commissario Tecnico locale è caduto dalla panchina durante un timeout.",
    "Il Ballon d'Or 2025 è stato assegnato... al bidone più costoso della storia.",
    "Una satellites ha filmato il campo da 47 km di altezza: si vedono solo buche.",
    "Il portiere della Dinamo Divano ha parlato ai giornali: 'Il pallone è pesante'."
  ];

  const PRESTIGE_NAMES = [
    "Bronzo","Argento","Oro","Platino","Diamante","Smeraldo","Rubino","Infinito"
  ];

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function generatePlayerName() {
    const first = pickRandom(NAMES);
    const surname = pickRandom(SURNAMES);
    const nickname = Math.random() < 0.6 ? ' "' + pickRandom(NICKNAMES) + '" ' : ' ';
    return first + nickname + surname;
  }

  return {
    NAMES, SURNAMES, NICKNAMES, TEAMS_AI, FORMATIONS, ROLES, ROLE_NAMES, ROLE_EMOJI,
    UPGRADES, EVENT_TEMPLATES, MATCH_COMMENTARY, COACH_REACTIONS, BIDONE_COMMENTS,
    FANTANOTIZIE, PRESTIGE_NAMES,
    pickRandom, generatePlayerName
  };

})();
