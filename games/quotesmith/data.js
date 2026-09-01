(function (root, factory) {
  'use strict';

  // All quotes live in quotes.json. This file only loads it.
  //   - Node: read the file from disk (for tests/tools).
  //   - Browser: fetch quotes.json (cached by the service worker).
  //     If the fetch fails (first visit, opened as file://, no cache yet),
  //     fall back to a small embedded seed so the game always boots.

  if (typeof module === 'object' && module.exports) {
    // Node
    var fs = require('fs');
    var path = require('path');
    var raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'quotes.json'), 'utf8'));
    module.exports = { VERSION: (raw && typeof raw.version === 'number') ? raw.version : 3, QUOTES: raw.quotes || raw };
    return;
  }

  // Browser: expose a promise that resolves to the database.
  var SEED = [
    // Emergency seed: one iconic line per category, en + it.
    ['I\'ll be back.', 'The Terminator', 'film', 'en', 'easy'], ['Tornerò.', 'Il Terminator', 'film', 'it', 'easy'],
    ['Winter is coming.', 'Ned Stark', 'series', 'en', 'easy'], ['L\'inverno sta arrivando.', 'Ned Stark', 'series', 'it', 'easy'],
    ['D\'oh!', 'Homer Simpson', 'animation', 'en', 'easy'], ['Doh!', 'Homer Simpson', 'animation', 'it', 'easy'],
    ['Imagine all the people living life in peace.', 'John Lennon', 'songs', 'en', 'easy'], ['Immagina tutte le persone vivere in pace.', 'John Lennon', 'songs', 'it', 'easy'],
    ['Call me Ishmael.', 'Herman Melville', 'books', 'en', 'easy'], ['Chiamatemi Ismaele.', 'Herman Melville', 'books', 'it', 'easy'],
    ['Veni, vidi, vici.', 'Julius Caesar', 'history', 'en', 'easy'], ['Veni, vidi, vici.', 'Giulio Cesare', 'history', 'it', 'easy'],
    ['It\'s dangerous to go alone! Take this.', 'Old Man', 'games', 'en', 'easy'], ['È pericoloso andare da soli! Prendi questo.', 'Il Vecchio', 'games', 'it', 'easy'],
    ['Actions speak louder than words.', 'English proverb', 'proverbs', 'en', 'easy'], ['Le azioni parlano più delle parole.', 'Proverbio inglese', 'proverbs', 'it', 'easy'],
    ['Believe it!', 'Naruto Uzumaki', 'anime', 'en', 'easy'], ['Credici!', 'Naruto Uzumaki', 'anime', 'it', 'easy'],
    ['E pur si muove.', 'Galileo Galilei', 'science', 'en', 'easy'], ['E pur si muove.', 'Galileo Galilei', 'science', 'it', 'easy'],
    ['Float like a butterfly, sting like a bee.', 'Muhammad Ali', 'sports', 'en', 'easy'], ['Vola come una farfalla, pungi come un\'ape.', 'Muhammad Ali', 'sports', 'it', 'easy'],
    ['This is fine.', 'KC Green', 'internet', 'en', 'easy'], ['Va tutto bene.', 'KC Green', 'internet', 'it', 'easy'],
    ['I think, therefore I am.', 'René Descartes', 'philosophy', 'en', 'easy'], ['Penso, dunque sono.', 'René Descartes', 'philosophy', 'it', 'easy'],
    ['Anyone can cook.', 'Gusteau', 'food', 'en', 'easy'], ['Chiunque può cucinare.', 'Gusteau', 'food', 'it', 'easy'],
    ['The unexamined life is not worth living.', 'Socrates', 'literature', 'en', 'medium'], ['L\'amor che move il sole e l\'altre stelle.', 'Dante Alighieri', 'literature', 'it', 'medium'],
    ['Two roads diverged in a wood, and I took the one less traveled by.', 'Robert Frost', 'poetry', 'en', 'medium'], ['Si sta come d\'autunno sugli alberi le foglie.', 'Giuseppe Ungaretti', 'poetry', 'it', 'medium'],
    ['I dream my painting and I paint my dream.', 'Vincent van Gogh', 'art', 'en', 'medium'], ['Sogno il mio quadro e dipingo il mio sogno.', 'Vincent van Gogh', 'art', 'it', 'medium'],
    ['The heart has its reasons which reason knows nothing of.', 'Blaise Pascal', 'love', 'en', 'hard'], ['Il cuore ha le sue ragioni che la ragione non conosce.', 'Blaise Pascal', 'love', 'it', 'hard'],
    ['The journey of a thousand miles begins with a single step.', 'Lao Tzu', 'wisdom', 'en', 'easy'], ['Il viaggio di mille miglia inizia con un singolo passo.', 'Lao Tzu', 'wisdom', 'it', 'easy'],
    ['Any sufficiently advanced technology is indistinguishable from magic.', 'Arthur C. Clarke', 'technology', 'en', 'hard'], ['Qualsiasi tecnologia sufficientemente avanzata è indistinguibile dalla magia.', 'Arthur C. Clarke', 'technology', 'it', 'hard'],
    ['Look deep into nature, and then you will understand everything better.', 'Albert Einstein', 'nature', 'en', 'medium'], ['Guarda a fondo nella natura, e allora capirai tutto meglio.', 'Albert Einstein', 'nature', 'it', 'medium'],
    ['It always seems impossible until it\'s done.', 'Nelson Mandela', 'motivation', 'en', 'easy'], ['Sembra sempre impossibile finché non è fatto.', 'Nelson Mandela', 'motivation', 'it', 'easy'],
    ['I\'m on a seafood diet. I see food and I eat it.', 'Anonymous', 'humor', 'en', 'easy'], ['Sono a dieta di frutti di mare. Vedo il cibo e lo mangio.', 'Anonimo', 'humor', 'it', 'easy'],
    ['With great power comes great responsibility.', 'Uncle Ben', 'superheroes', 'en', 'medium'], ['Da un grande potere derivano grandi responsabilità.', 'Zio Ben', 'superheroes', 'it', 'medium'],
    ['Time spent with cats is never wasted.', 'Sigmund Freud', 'cats', 'en', 'easy'], ['Il tempo trascorso con i gatti non è mai sprecato.', 'Sigmund Freud', 'cats', 'it', 'easy'],
    ['Coffee is a language in itself.', 'Jackie Chan', 'coffee', 'en', 'easy'], ['Il caffè è di per sé un linguaggio.', 'Jackie Chan', 'coffee', 'it', 'easy'],
    ['What do you call a bear with no teeth? A gummy bear.', 'Anonymous', 'puns', 'en', 'easy'], ['Come si chiama un orso senza denti? Un orsetto gommoso.', 'Anonimo', 'puns', 'it', 'easy'],
    ['The truth shall set you free.', 'John', 'bible', 'en', 'easy'], ['La verità vi farà liberi.', 'Giovanni', 'bible', 'it', 'easy'],
    ['Fashion fades, only style remains the same.', 'Coco Chanel', 'fashion', 'en', 'easy'], ['La moda passa, solo lo stile resta.', 'Coco Chanel', 'fashion', 'it', 'easy'],
    ['To travel is to live.', 'Hans Christian Andersen', 'travel', 'en', 'easy'], ['Viaggiare è vivere.', 'Hans Christian Andersen', 'travel', 'it', 'easy'],
    ['Money is better than poverty, if only for financial reasons.', 'Woody Allen', 'money', 'en', 'easy'], ['Il denaro è meglio della povertà, se non altro per ragioni finanziarie.', 'Woody Allen', 'money', 'it', 'easy'],
    ['Adults are just obsolete children.', 'Dr. Seuss', 'childhood', 'en', 'easy'], ['Gli adulti sono solo bambini superati.', 'Dr. Seuss', 'childhood', 'it', 'easy'],
  ];

  function toDB(raw) {
    const version = raw && typeof raw.version === 'number' ? raw.version : 3;
    return { VERSION: version, QUOTES: (raw && Array.isArray(raw.quotes)) ? raw.quotes : (raw || []) };
  }

  function seedDB() {
    return { VERSION: 3, OFFLINE_SEED: true, QUOTES: SEED.map(function (q) {
      return { text: q[0], author: q[1], category: q[2], lang: q[3], difficulty: q[4] };
    }) };
  }

  root.QUOTESMITH_READY = fetch('quotes.json', { cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) throw new Error('quotes.json HTTP ' + response.status);
      return response.json();
    })
    .then(toDB)
    .catch(function () {
      // Network failed: try the service-worker cache, then the embedded seed.
      if (root.caches && root.caches.match) {
        return root.caches.match('quotes.json').then(function (cached) {
          if (cached) return cached.json().then(toDB);
          throw new Error('no cache');
        });
      }
      throw new Error('offline');
    })
    .catch(function () {
      return seedDB();
    })
    .then(function (db) {
      root.QUOTESMITH_DB = db; // keep the old synchronous surface working too
      return db;
    });
}(typeof self !== 'undefined' ? self : this, function () {}));
