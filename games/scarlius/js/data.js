(function () {
  'use strict';

  var SC = window.SCARLIUS = (window.SCARLIUS || {});
  SC.lang = 'it';

  function txt(o) { return o ? (o[SC.lang] || o.it || '') : ''; }
  SC.txt = txt;

  var SAVE_KEY = 'scarlius_freebeer_v1';

  SC.S = {
    lang: 'it',
    room: 'sala',
    glasses: 0,
    collected: [false, false, false, false, false],
    glassesGiven: false,
    hasKey: false,
    inferno: false,
    davideWake: false,
    kegs: false,
    djSync: false,
    playaUnlocked: false,
    finaleShown: false,
    first: true,

    reset: function () {
      SC.S.lang = SC.lang;
      SC.S.room = 'sala';
      SC.S.glasses = 0;
      SC.S.collected = [false, false, false, false, false];
      SC.S.glassesGiven = false;
      SC.S.hasKey = false;
      SC.S.inferno = false;
      SC.S.davideWake = false;
      SC.S.kegs = false;
      SC.S.djSync = false;
      SC.S.playaUnlocked = false;
      SC.S.finaleShown = false;
      SC.S.first = true;
      SC.S.save();
    },

    save: function () {
      try {
        var d = { lang: SC.lang };
        for (var k in SC.S) {
          if (k !== 'save' && k !== 'load' && k !== 'reset' && typeof SC.S[k] !== 'function') d[k] = SC.S[k];
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(d));
      } catch (e) { /* noop */ }
    },

    load: function () {
      try {
        var raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;
        var d = JSON.parse(raw);
        for (var k in d) {
          if (k in SC.S) SC.S[k] = d[k];
        }
        if (d.lang) SC.lang = d.lang;
      } catch (e) { /* noop */ }
    }
  };

  var ev = {};
  SC.on = function (name, fn) { (ev[name] = ev[name] || []).push(fn); };
  SC.emit = function (name, payload) {
    (ev[name] || []).forEach(function (fn) { try { fn(payload); } catch (e) { /* noop */ } });
  };
  SC.off = function (name, fn) {
    ev[name] = (ev[name] || []).filter(function (f) { return f !== fn; });
  };

  SC.sceneOp = (function () {
    var mgr = null;
    var plugin = null;

    function log(action, err) {
      try {
        var msg = (err && err.message) ? err.message : String(err);
        console.warn('[scarlius] sceneOp.' + action + ' -> ' + msg);
      } catch (e) { /* noop */ }
    }

    function call(owner, fn, args, action) {
      if (!owner || typeof owner[fn] !== 'function') return { ok: false };
      try {
        var r = owner[fn].apply(owner, args || []);
        return { ok: true, r: r };
      } catch (e) {
        log(action, e);
        return { ok: false, e: e };
      }
    }

    function via(fn, args, action) {
      var c = call(plugin, fn, args, action);
      if (c.ok) return c.r;
      var c2 = call(mgr, fn, args, action);
      if (c2.ok) return c2.r;
      log(action, 'method "' + fn + '" non disponibile (plugin e manager mancanti o senza supporto)');
      return undefined;
    }

    return {
      registerManager: function (m) { if (m) mgr = m; },
      registerPlugin: function (p) { if (p) plugin = p; },

      isActive: function (key) { return !!via('isActive', [key], 'isActive'); },
      isPaused: function (key) { return !!via('isPaused', [key], 'isPaused'); },

      pause: function (key) {
        try { if (this.isPaused(key)) return; } catch (e) { log('pause', e); }
        via('pause', [key], 'pause');
      },
      resume: function (key) {
        try { if (!this.isPaused(key)) return; } catch (e) { log('resume', e); }
        via('resume', [key], 'resume');
      },
      stop: function (key) {
        try { if (!this.isActive(key)) return; } catch (e) { log('stop', e); }
        via('stop', [key], 'stop');
      },
      start: function (key, data) { via('start', [key, data], 'start'); },
      launch: function (key, data) {
        var c = call(plugin, 'launch', [key, data], 'launch');
        if (c.ok) return c.r;
        log('launch', 'plugin.launch non disponibile per "' + key + '" (Phaser espone launch solo sullo ScenePlugin, non sul SceneManager)');
        return undefined;
      },
      getScene: function (key) {
        var v = via('get', [key], 'getScene');
        if (v) return v;
        var m = call(mgr, 'getScene', [key], 'getScene');
        if (m.ok) return m.r;
        return null;
      }
    };
  })();

  var N = function (who, it, en, opts) {
    var node = { who: who, t: { it: it, en: en } };
    if (opts) node.opts = opts;
    return node;
  };
  var O = function (it, en, go, act) {
    var o = { l: { it: it, en: en }, go: go };
    if (act) o.act = act;
    return o;
  };

  var nodes = {};

  nodes.intro = N('narrator',
    'Milano. Mezzanotte. Benvenuto allo Scarlius, il bar dove le leggende vengono a fare due ore di straordinario. E stasera, tra una bottiglia lanciata, una doccia inopportuna e un proprietario in coma sportivo, si dice che qualcuno voglia stappare i FUSTI.',
    'Milan. Midnight. Welcome to the Scarlius, the bar where legends clock in for overtime. Tonight, between a tossed bottle, an inappropriate shower and an owner in sports-coma, word is someone wants to crack open the KEGS.',
    [O('Entra e trova un tavolo.', 'Step in and grab a table.', 'intro2')]);

  nodes.intro2 = N('narrator',
    'A ogni angolo c\'è qualcuno con un bisogno assurdo: soddisfali tutti e la notte si accenderà. In alto a destra puoi cambiare lingua; in basso si apre l\'inventario. Tocca i personaggi e gli oggetti che brillano.',
    'Every corner hides someone with an absurd need: satisfy them all and the night ignites. Top-right toggles language; bottom opens your inventory. Tap characters and shiny things.',
    [O('Inizio.', 'Let\'s go.', '@end')]);

  nodes.thomas_a = N('thomas',
    'Benvenuto allo Scarlius! Siediti dove vuoi: è scientificamente provato che sceglierai esattamente il tavolo che ho appena finito di lucidare.',
    'Welcome to the Scarlius! Sit anywhere you like: it is scientifically proven you will pick the exact table I just finished polishing.',
    [O('Vuoi una mano? Hai l\'aria di chi ne ha bisogno.', 'Need a hand? You look like you could use one.', 'thomas_b'),
     O('Che succede stasera qui?', 'What\'s going on here tonight?', 'thomas_c'),
     O('E il famoso Free Beer Party?', 'What about the legendary Free Beer Party?', 'thomas_e'),
     O('Ci vediamo dopo.', 'See you later.', '@end')]);

  nodes.thomas_b = N('thomas',
    'Cinquemila cose da fare e tre braccia, di cui due invisibili. Ho dei bicchieri vuoti sparsi per tutta la sala e la mia ansia da prestazione li conta. Uno. Per. Uno.',
    'Five thousand things to do and three arms, two of them invisible. I\'ve got empty glasses scattered all over the floor and my performance anxiety counts them. One. By. One.',
    [O('E se li raccogliessi io?', 'What if I collect them for you?', 'thomas_d'),
     O('Torno più tardi.', 'I\'ll be back later.', '@end')]);

  nodes.thomas_c = N('thomas',
    'Ufficialmente: una serata tranquilla. Ufficiosamente: Ercole canta in bagno, Davide guarda la sua squadra perdere e Luca lancia bottiglie come se il soffitto gli avesse rubato qualcosa.',
    'Officially: a quiet night. Unofficially: Ercole sings in the bathroom, Davide watches his team lose, and Luca tosses bottles like the ceiling owes him money.',
    [O('Torno al lavoro… cioè, al bar.', 'Back to work… I mean, the bar.', '@end')]);

  nodes.thomas_e = N('thomas',
    'Ah, il Party. Serve il permesso di Davide e il ritmo di Ercole. Due santi impossibili. Ma ogni grande notte comincia da cinque bicchieri sporchi, credimi.',
    'Ah, the Party. Needs Davide\'s approval and Ercole\'s rhythm. Two impossible saints. But every great night starts with five dirty glasses, trust me.',
    [O('Cinque bicchieri, dici…', 'Five glasses, you say…', 'thomas_d'),
     O('Ci vediamo dopo.', 'See you later.', '@end')]);

  nodes.thomas_d = N('thomas',
    'Sei serio? Cinque. Sono esattamente cinque. Brillano pure, come per dire "raccoglimi". Portami il set completo e la Chiave Dorata del Bagno è tua.',
    'Seriously? Five. Exactly five. They even sparkle, like they\'re saying "pick me up". Bring me the full set and the Golden Bathroom Key is yours.',
    [O('Affare fatto.', 'Deal.', '@end')]);

  nodes.thomas_five = N('thomas',
    'Aspetta… uno… due… tre… quattro… CINQUE. Il set completo! Dove hai trovato tanta pazienza, era in saldo?',
    'Wait… one… two… three… four… FIVE. The full set! Where did you find that much patience, was it on sale?',
    [O('Ecco i bicchieri. Ora la verità.', 'Here are the glasses. Now the truth.', 'thomas_key', 'takeGlasses'),
     O('Prima dimmi: la chiave è davvero dorata?', 'First tell me: is the key really golden?', 'thomas_key', 'takeGlasses')]);

  nodes.thomas_key = N('thomas',
    'Ecco a te la Chiave Dorata del Bagno. Sì, è dorata. Sì, è del bagno. No, non chiedere. L\'ultima volta Ercole si è chiuso dentro e hanno dovuto chiamare un fabbro E un mediatore culturale.',
    'Here\'s your Golden Bathroom Key. Yes, it\'s golden. Yes, it\'s for the bathroom. No, don\'t ask. Last time Ercole locked himself in, they had to call a locksmith AND a cultural mediator.',
    [O('Grazie, Thomas. Sei un eroe.', 'Thanks, Thomas. You\'re a hero.', '@end')]);

  nodes.thomas_generic = N('thomas',
    'Bicchieri raccolti, sala sotto controllo… e adesso? I fusti sono da Davide. Ma per svegliare Davide serve il cocktail di Luca. E per il cocktail di Luca serve un pollice con il groove.',
    'Glasses collected, floor under control… now what? The kegs are with Davide. But waking Davide needs Luca\'s cocktail. And Luca\'s cocktail needs a groovy thumb.',
    [O('E tu intanto?', 'What about you?', 'thomas_gen2')]);

  nodes.thomas_gen2 = N('thomas',
    'Io intanto lucido il bancone. È il mio modo di meditare. Un tavolo pulito è un pensiero in pace.',
    'Meanwhile I polish the counter. It\'s my way of meditating. A clean table is a thought at peace.',
    [O('Continua a meditare.', 'Keep meditating.', '@end')]);

  nodes.luca_intro = N('luca',
    'Shhh. Senti il ritmo? La bottiglia sale, la bottiglia scende, e io nel mezzo ci metto lo stile. Chiedimi un cocktail, ma chiedilo A TEMPO.',
    'Shhh. Feel the rhythm? The bottle rises, the bottle falls, and in between I pour the style. Ask me for a cocktail, but ask it ON THE BEAT.',
    [O('Accetto la sfida: Flair Master Touch.', 'I accept the challenge: Flair Master Touch.', '@flair'),
     O('Serve un cocktail per svegliare Davide.', 'I need a cocktail to wake Davide up.', 'luca_davide'),
     O('Che succede stasera qui?', 'What\'s going on here tonight?', 'luca_c'),
     O('Ci vediamo.', 'See you.', '@end')]);

  nodes.luca_davide = N('luca',
    'Davide? Quello è in catalessi sportiva. L\'unica cosa che lo risveglia è un cocktail con un kick da cinghia. Io ho la ricetta. Tu hai il pollice?',
    'Davide? That guy is in sports catalepsy. The only thing that wakes him is a cocktail with a belt-slap kick. I have the recipe. Do you have the thumb?',
    [O('Allora diamoci dentro.', 'Then let\'s do this.', '@flair'),
     O('Devo pensarci.', 'Let me think about it.', '@end')]);

  nodes.luca_c = N('luca',
    'Stanotte? Ercole in bagno, Davide in depressione, io in orbita. La Playa aspetta solo il via libera dei fusti.',
    'Tonight? Ercole in the bathroom, Davide in despair, me in orbit. The Playa is just waiting for the kegs to get the green light.',
    [O('E io che ruolo ho?', 'And what\'s my role?', 'luca_c2')]);

  nodes.luca_c2 = N('luca',
    'Tu sei il catalizzatore, baby. Ogni grande festa ha bisogno di qualcuno che faccia accadere le cose. Oggi quel qualcuno sei tu. Che ritmo.',
    'You\'re the catalyst, baby. Every great party needs someone who makes things happen. Today that someone is you. What a vibe.',
    [O('Grazie, credo.', 'Thanks, I guess.', '@end')]);

  nodes.luca_offer_game = N('luca',
    'Allora: sopra le bottiglie appaiono degli anelli che si stringono. Tocca quando l\'anello è perfetto sul bersaglio. Tempismo, non velocità. Capito?',
    'So: rings appear over the flying bottles and shrink. Tap when the ring lands perfectly on the target. Timing, not speed. Got it?',
    [O('Tocca a me.', 'My turn.', '@flair'),
     O('Un attimo, mi scaldo il pollice.', 'Hold on, warming up my thumb.', '@end')]);

  nodes.luca_win = N('luca',
    'AAAH! Visto?! La bottiglia ti AMA! Tempismo perfetto, campione. Ecco a te lo Scarlius Inferno: il risveglio ufficiale per proprietari in coma da highlights. Maneggialo con cura: pesta più di un derby.',
    'AAAH! See?! The bottle LOVES you! Perfect timing, champ. Here\'s your Scarlius Inferno: the official wake-up for owners in highlight-coma. Handle with care: it hits harder than a derby.',
    [O('Lo terrò da conto.', 'I\'ll keep it safe.', '@end')]);

  nodes.luca_lose = N('luca',
    'Quasi! Ma "quasi" non riempie i bicchieri. Il pollice ha bisogno di più groove. Riprova quando sei pronto.',
    'So close! But "so close" doesn\'t fill glasses. That thumb needs more groove. Try again when you\'re ready.',
    [O('Riprovo.', 'Let me try again.', '@flair'),
     O('Più tardi.', 'Later.', '@end')]);

  nodes.luca_generic = N('luca',
    'Inferno consegnato, missione compiuta. Ricorda: se Davide si sveglia, la palla passa a lui. E la palla, lì, è di carta.',
    'Inferno delivered, mission accomplished. Remember: once Davide wakes up, the ball is in his court. And that ball, there, is made of paper.',
    [O('A dopo, maestro.', 'Later, maestro.', '@end')]);

  nodes.davide_cat = N('davide',
    '…Ciao. Sì. No. Forse. La mia squadra perde di trenta e l\'unica partita che vinco stasera è contro la mia pazienza.',
    '…Hey. Yes. No. Maybe. My team is down thirty and the only game I\'m winning tonight is against my own patience.',
    [O('Davide, reagisci.', 'Davide, snap out of it.', 'davide_cat2'),
     O('Ho sentito parlare di un Free Beer Party.', 'I heard about a Free Beer Party.', 'davide_cat3'),
     O('Ci vediamo dopo.', 'See you later.', '@end')]);

  nodes.davide_cat2 = N('davide',
    'Dimmi qualcosa di più forte di un contropiede in zona Cesarini. Ti ascolto. Ho tutto il tempo di una partita che non finisce mai.',
    'Tell me something stronger than a fast break in the clutch. I\'m listening. I have all the time of a game that never ends.',
    [O('Torno più tardi.', 'I\'ll come back later.', '@end')]);

  nodes.davide_cat3 = N('davide',
    'Per il Free Beer serve il Permesso Ufficiale. Io sono l\'ufficiale. E sono in riunione permanente col mio telefono. Portami qualcosa che mi faccia alzare gli occhi dallo schermo.',
    'For the Free Beer you need the Official Permit. I am the official. And I\'m in a permanent meeting with my phone. Bring me something that makes me look up from this screen.',
    [O('Tipo un cocktail infernale?', 'Like an infernal cocktail?', '@end'),
     O('Capito.', 'Got it.', '@end')]);

  nodes.davide_wake = N('davide',
    '(Sorseggia lo Scarlius Inferno. Silenzio. Un cigolio. Un lampo negli occhi.) Che… che cos\'è? FUOCO? No. GENIO LIQUIDO! Mi sento rinato! Ok. Parliamo. Vuoi la Playa?',
    '(He sips the Scarlius Inferno. Silence. A creak. A spark in his eyes.) What… what is this? FIRE? No. LIQUID GENIUS! I feel reborn! Okay. Let\'s talk. You want the Playa?',
    [O('Voglio la Playa.', 'I want the Playa.', 'davide_challenge'),
     O('Voglio un altro di questi.', 'I want another one of those.', 'davide_fun')]);

  nodes.davide_fun = N('davide',
    'Questo cocktail è un pezzo unico, figliolo. Come il mio jumper. Torna a parlarmi di Playa.',
    'That cocktail is a one-of-a-kind piece, kid. Like my jumper. Come talk to me about the Playa instead.',
    [O('Ok, ok.', 'Okay, okay.', 'davide_challenge')]);

  nodes.davide_challenge = N('davide',
    'Tre canestri di fila con una pallina di carta in quel cestino laggiù e ti apro i fusti. Non è basket, è DESTINO. Accetti?',
    'Three baskets in a row with a paper ball into that bin over there and I crack open the kegs. This isn\'t basketball, it\'s DESTINY. Deal?',
    [O('Accetto la sfida.', 'I accept the challenge.', '@basket'),
     O('Devo scaldare il polso.', 'I need to warm up my wrist.', '@end')]);

  nodes.davide_win = N('davide',
    'TRE DI FILA! Ma questa sì che è UNA SQUADRA! Prendi i fusti: dal mio cuore, alla Playa, alla gloria. E di\' a Ercole che il Permesso Ufficiale c\'è. Tutto. Qua. Dentro.',
    'THREE IN A ROW! Now THAT\'S a team! Take the kegs: from my heart, to the Playa, to glory. And tell Ercole the Official Permit is here. All. Right. Here.',
    [O('Grazie, capitano.', 'Thanks, captain.', '@end')]);

  nodes.davide_lose = N('davide',
    'Bel tentativo. Ma il canestro non perdona. Riprova: tre di fila, come il ritmo di una partita perfetta.',
    'Nice try. But the rim does not forgive. Try again: three in a row, like the rhythm of a perfect game.',
    [O('Riprovo.', 'Let me try again.', '@basket'),
     O('Più tardi.', 'Later.', '@end')]);

  nodes.davide_generic = N('davide',
    'Fusti approvati, permesso firmato. Ora manca solo Ercole. Se quel vichingo sincronizza il pezzo, la Playa è servita su un vassoio di sabbia.',
    'Kegs approved, permit signed. Only Ercole is left. If that Viking syncs the track, the Playa gets served on a tray of sand.',
    [O('Ci vediamo alla Playa.', 'See you at the Playa.', '@end')]);

  nodes.ercole_start = N('ercole',
    '(DALLA DOCCIA, cantando come una sirena con la laringite) ♫ LA MIA ANIMA È UN WOOFER… ♫ EHI. CHI ENTRA SENZA BUSSARE?!',
    '(FROM THE SHOWER, singing like a laryngitic siren) ♫ MY SOUL IS A WOOFER… ♫ HEY. WHO WALKS IN WITHOUT KNOCKING?!',
    [O('Ercole… la doccia del bar non è una spa.', 'Ercole… the bar shower is not a spa.', 'erco_a'),
     O('Bella voce. Stonata, ma con convinzione.', 'Nice voice. Off-key, but committed.', 'erco_b'),
     O('Là fuori vogliono il Free Beer Party.', 'Out there they want the Free Beer Party.', 'erco_c')]);

  nodes.erco_a = N('ercole',
    'Un DJ non esce: si SINCRONIZZA. Io sono in fase di warm-up idrico. Finché un pezzo non mi spacca il cervello, questa tenda è il mio Valhalla.',
    'A DJ doesn\'t leave: he SYNCs. I\'m in hydro-warm-up mode. Until a track blows my mind, this curtain is my Valhalla.',
    [O('Cosa ti sblocca il warm-up?', 'What unlocks the warm-up?', 'erco_console'),
     O('Esco o chiamo Thomas col mocio.', 'I\'ll leave, or call Thomas with the mop.', 'erco_mocio'),
     O('Ripensandoci, la doccia è un\'ottima scelta.', 'On second thought, the shower is a great choice.', '@end')]);

  nodes.erco_mocio = N('ercole',
    'Thomas ha paura dei geyser. Riprova, piccolo umano. (riprende a cantare) ♫ L\'IGIENE È UN MITO, IL SAPONE È UN SUGGERIMENTO ♫',
    'Thomas is afraid of geysers. Try again, little human. (he resumes singing) ♫ HYGIENE IS A MYTH, SOAP IS A SUGGESTION ♫',
    [O('Torno al menu.', 'Back to the menu.', 'ercole_start'),
     O('Esco dal bagno.', 'I\'m leaving the bathroom.', '@end')]);

  nodes.erco_console = N('ercole',
    'La mia console è sul lavandino. Due onde da allineare: se le rendi verdi, apri le porte della percezione. Sincronizza e sono tuo.',
    'My deck is on the sink. Two waves to align: make them green and you open the doors of perception. Sync it and I\'m yours.',
    [O('Vado alla console.', 'On my way to the deck.', '@dj'),
     O('Non ora.', 'Not now.', '@end')]);

  nodes.erco_b = N('ercole',
    'Grazie! La mia voce è una B-side dei Marmot. Il problema è il BEAT: allinea le frequenze sulla console e divento un angelo del dancefloor.',
    'Thanks! My voice is a Marmot B-side. The problem is the BEAT: align the frequencies on the deck and I become a dancefloor angel.',
    [O('Accetto la sfida.', 'Challenge accepted.', '@dj'),
     O('E se il pezzo non "spacca"?', 'And if the track doesn\'t "slap"?', 'erco_spacca'),
     O('Prima parliamo del Party.', 'Let\'s talk about the Party first.', 'erco_c')]);

  nodes.erco_spacca = N('ercole',
    'Allora resto qui a cantare fino al prossimo solstizio. (la voce rimbomba) ♫ OTTO BIRRE O NIENTE ♫',
    'Then I stay here singing until the next solstice. (the voice booms) ♫ EIGHT BEERS OR NOTHING ♫',
    [O('Ok, ok, vado alla console.', 'Okay, okay, I\'m going to the deck.', '@dj'),
     O('Esco.', 'I\'m leaving.', '@end')]);

  nodes.erco_c = N('ercole',
    'Nessun party senza i fusti di Davide. Prima conquista il barista-atleta col canestro, poi parlami di Playa. Il ritmo senza birra è solo aria che si agita.',
    'No party without Davide\'s kegs. First win over the athlete-bartender with the hoop, then talk to me about the Playa. Rhythm without beer is just agitated air.',
    [O('E se i fusti ci fossero già?', 'What if the kegs were already here?', 'erco_c_kegs'),
     O('Torno quando ho i fusti.', 'I\'ll come back when I have the kegs.', '@end')]);

  nodes.erco_c_kegs = N('ercole',
    'Se i fusti ci fossero già… la mia anima entrerebbe in overdrive. Ma le parole non riempiono i fusti, piccolo umano. Fatti valere.',
    'If the kegs were already here… my soul would go into overdrive. But words don\'t fill kegs, little human. Earn your keep.',
    [O('A dopo.', 'See you.', '@end')]);

  nodes.erco_kegs = N('ercole',
    '(La voce si fa improvvisamente più interessata.) Senti che profumo? Fusti approvati… Allora manca solo il pezzo che mi spacchi il cervello. La console è sul lavandino: rendi verdi quelle onde e il DJ è tuo.',
    '(His voice suddenly perks up.) Do I smell that? Kegs approved… Then all that\'s missing is the track that blows my mind. My deck is on the sink: turn those waves green and the DJ is yours.',
    [O('Vado alla console.', 'On my way to the deck.', '@dj'),
     O('Prima finisco la doccia di controllo.', 'I\'ll finish my inspection shower first.', '@end')]);

  nodes.erco_nokegs_post = N('ercole',
    '(La tenda si muove. La voce è quasi tenera.) Bel pezzo, campione. Ma senza i fusti di Davide io non mi muovo. Vai. Portami la birra e ti porterò la Playa.',
    '(The curtain shifts. The voice is almost tender.) Great track, champ. But without Davide\'s kegs I\'m not moving. Go. Bring me the beer and I\'ll bring you the Playa.',
    [O('Vado a cercare Davide.', 'Off to find Davide.', '@end'),
     O('Esco.', 'I\'m leaving.', '@end')]);

  nodes.ercole_ready = N('ercole',
    '(La tenda si spalanca. Vapore. Un uomo. Una leggenda.) LE ONDE SONO VERDI! I FUSTI CI SONO! NIENTE PUÒ FERMARE… FREE BEER FOR EVERYONE!',
    '(The curtain bursts open. Steam. A man. A legend.) THE WAVES ARE GREEN! THE KEGS ARE HERE! NOTHING CAN STOP… FREE BEER FOR EVERYONE!',
    [O('ALLA PLAYA!', 'TO THE PLAYA!', '@finale')]);

  nodes.djdeck = N('deck',
    'La console di Ercole: due onde sonore che galleggiano come alghe impazzite. Sopra, uno slider. La scritta dice: "ALLINEA. DIVENTA VERDE. SPACCA."',
    'Ercole\'s deck: two sound waves drifting like feral seaweed. Above, a slider. The label reads: "ALIGN. TURN GREEN. SLAP."',
    [O('Allinea le onde.', 'Align the waves.', '@dj'),
     O('Meglio non toccare roba sacra.', 'Better not to touch sacred gear.', '@end')]);

  nodes.djdeck_done = N('deck',
    'Le onde sono già verdi e perfettamente sovrapposte. La console emette un ronzio soddisfatto. Ercole aspetta solo il verdetto dei fusti.',
    'The waves are already green and perfectly overlapped. The deck hums contentedly. Ercole is just waiting on the keg verdict.',
    [O('Chiudi.', 'Close.', '@end')]);

  nodes.erco_sync_win = N('ercole',
    '(La musica entra in testa. Il vapore si ferma a metà.) SPACCA. SPACCA ECCETERA ECCETERA! Ottimo lavoro, piccolo umano. Ma io sono un vichingo di parola: niente fusti, niente Playa. Vai da Davide.',
    '(The music hits. The steam freezes mid-air.) IT SLAPS. IT SLAPS ETCETERA ETCETERA! Great work, little human. But I\'m a Viking of my word: no kegs, no Playa. Go see Davide.',
    [O('Vado da Davide.', 'Off to Davide.', '@end'),
     O('Ci vediamo.', 'See you.', '@end')]);

  nodes.ercole_generic = N('ercole',
    '(Canticchia felice. Ha già l\'asciugamano in spalla.) La Playa ci aspetta, campione. Questa sarà la notte che i DJ raccontano ai nipoti.',
    '(He hums happily. Towel already on his shoulder.) The Playa awaits, champ. This will be the night DJs tell their grandkids about.',
    [O('Ci vediamo sulla sabbia.', 'See you on the sand.', '@end')]);

  nodes.lock_bathroom = N('narrator',
    'La porta del bagno è chiusa. Un cartello dice: "Occupato. Motivo: mitologico". Forse Thomas, con la sua ansia da prestazione, sa qualcosa su una chiave…',
    'The bathroom door is locked. A sign reads: "Occupied. Reason: mythological". Maybe Thomas, with his performance anxiety, knows something about a key…',
    [O('Torno in sala.', 'Back to the main room.', '@end')]);

  nodes.lock_playa = N('narrator',
    'Verso la Playa: un cartello scritto con la sabbia dice: "Sbloccati quando lo Scarlius sarà in festa". Ovvero: fusti di Davide + ritmo di Ercole + un catalizzatore (tu).',
    'Toward the Playa: a sign written in sand reads: "Unlock when the Scarlius is partying". Meaning: Davide\'s kegs + Ercole\'s rhythm + one catalyst (you).',
    [O('Torno al bar.', 'Back to the bar.', '@end')]);

  nodes.items = {};
  nodes.item_inferno_wrong = N('narrator',
    'Niente di personale: lo Scarlius Inferno non è per questo. La sua anima è destinata a un solo, specifico, catatonico proprietario.',
    'Nothing personal: the Scarlius Inferno isn\'t for this. Its soul is meant for one specific, catatonic owner.',
    [O('Giusto.', 'Right.', '@end')]);
  nodes.item_key_wrong = N('narrator',
    'La Chiave Dorata del Bagno brilla, ma qui non c\'è la serratura giusta. Il bagno è a destra del bancone. Quando la porta smetterà di essere "mitologica".',
    'The Golden Bathroom Key shines, but there\'s no right lock here. The bathroom is past the counter. Once the door stops being "mythological".',
    [O('Ok.', 'Ok.', '@end')]);
  nodes.item_keg_wrong = N('narrator',
    'I fusti sono pronti, ma scatenarli qui sarebbe un crimine contro la logistica. La Playa prima, la leggenda dopo.',
    'The kegs are ready, but unleashing them here would be a crime against logistics. The Playa first, the legend after.',
    [O('Giusto.', 'Right.', '@end')]);

  SC.DATA = {
    nodes: nodes,

    rooms: ['sala', 'bancone', 'bagno', 'playa'],
    roomMeta: {
      sala: { it: 'Sala Principale', en: 'Main Room', icon: '🪑' },
      bancone: { it: 'Il Bancone Centrale', en: 'The Central Counter', icon: '🍹' },
      bagno: { it: 'Il Bagno dello Scarlius', en: 'The Scarlius Bathroom', icon: '🚿' },
      playa: { it: 'La Playa', en: 'The Playa', icon: '🏖️' }
    },

    chars: {
      thomas: { icon: '🧽', color: 0x7b5bff, name: { it: 'Thomas', en: 'Thomas' }, role: { it: 'Il Barista Tuttofare', en: 'The Handyman Bartender' } },
      luca: { icon: '🍸', color: 0x3dfcff, name: { it: 'Luca', en: 'Luca' }, role: { it: 'Il Re del Flair', en: 'The King of Flair' } },
      davide: { icon: '🏀', color: 0xffd166, name: { it: 'Davide', en: 'Davide' }, role: { it: 'Il Proprietario Sportivo', en: 'The Sporty Owner' } },
      ercole: { icon: '🧔', color: 0xff2e88, name: { it: 'Ercole', en: 'Ercole' }, role: { it: 'Il DJ Mitologico', en: 'The Mythological DJ' } },
      deck: { icon: '🎛️', color: 0x3ddc97, name: { it: 'Console di Ercole', en: 'Ercole\'s Deck' }, role: { it: '', en: '' } },
      narrator: { icon: '🍺', color: 0xffffff, name: { it: 'Scarlius', en: 'Scarlius' }, role: { it: '', en: '' } }
    },

    items: {
      glasses: { icon: '🥛', name: { it: 'Bicchieri Vuoti', en: 'Empty Glasses' }, desc: { it: 'Set da 5. Thomas li conta uno per uno.', en: 'Set of 5. Thomas counts them one by one.' } },
      key: { icon: '🗝️', name: { it: 'Chiave Dorata del Bagno', en: 'Golden Bathroom Key' }, desc: { it: 'Apre il bagno dove Ercole fa la doccia da leggenda.', en: 'Opens the bathroom where Ercole showers like a legend.' } },
      inferno: { icon: '🍹', name: { it: 'Scarlius Inferno', en: 'Scarlius Inferno' }, desc: { it: 'Il cocktail che risveglia i proprietari in coma da highlights.', en: 'The cocktail that wakes owners from highlight-coma.' } },
      kegs: { icon: '🛢️', name: { it: 'Fusti di Birra', en: 'Beer Kegs' }, desc: { it: 'Il cuore logistico del Free Beer Party.', en: 'The logistical heart of the Free Beer Party.' } }
    },

    lockHints: {
      bagno: { it: '🔒 Occupato. Motivo: mitologico. Forse Thomas ha una chiave…', en: '🔒 Occupied. Reason: mythological. Maybe Thomas has a key…' },
      playa: { it: '🔒 La Playa si sblocca con fusti + ritmo. Tu sei il catalizzatore.', en: '🔒 The Playa unlocks with kegs + rhythm. You\'re the catalyst.' }
    },

    toast: {
      glass: { it: 'Bicchiere raccolto', en: 'Glass collected' },
      glassDone: { it: 'Set completo! Parlane con Thomas.', en: 'Full set! Talk to Thomas.' },
      glassNone: { it: 'Qui non ci sono bicchieri.', en: 'No glasses here.' },
      gotKey: { it: 'Chiave Dorata del Bagno ottenuta!', en: 'Golden Bathroom Key obtained!' },
      gotInferno: { it: 'Scarlius Inferno ottenuto!', en: 'Scarlius Inferno obtained!' },
      gotKegs: { it: 'Fusti di Birra approvati!', en: 'Beer Kegs approved!' },
      davideUp: { it: 'Davide è vivo. E ha una sfida per te.', en: 'Davide is alive. And he has a challenge for you.' },
      wrongInferno: { it: 'L\'Inferno ha un destinatario solo.', en: 'The Inferno has one recipient only.' },
      noUse: { it: 'Non c\'è nulla da fare qui con questo.', en: 'Nothing to do here with that.' },
      armed: { it: 'Oggetto selezionato: tocca un personaggio o un oggetto.', en: 'Item selected: tap a character or object.' },
      playaOpen: { it: 'LA PLAYA È APERTA!', en: 'THE PLAYA IS OPEN!' }
    }
  };

  SC.pickTalk = function (who) {
    var s = SC.S;
    if (who === 'thomas') {
      if (s.glasses >= 5 && !s.hasKey) return 'thomas_five';
      if (s.hasKey) return 'thomas_generic';
      return 'thomas_a';
    }
    if (who === 'luca') {
      if (s.inferno) return 'luca_generic';
      return 'luca_intro';
    }
    if (who === 'davide') {
      if (!s.davideWake) return 'davide_cat';
      if (!s.kegs) return 'davide_challenge';
      return 'davide_generic';
    }
    if (who === 'ercole') {
      if (s.playaUnlocked) return 'ercole_generic';
      if (s.djSync && s.kegs) return 'ercole_ready';
      if (s.kegs && !s.djSync) return 'erco_kegs';
      if (s.djSync && !s.kegs) return 'erco_nokegs_post';
      return 'ercole_start';
    }
    if (who === 'deck') {
      return s.djSync ? 'djdeck_done' : 'djdeck';
    }
    return 'intro';
  };

  SC.S.load();
  SC.lang = SC.S.lang || 'it';

})();
