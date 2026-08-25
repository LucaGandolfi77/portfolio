(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.QuoteSmith = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ROUND_SIZE = 10;
  const LANGUAGES = [
    { key: 'en', label: 'English', flag: 'EN' },
    { key: 'it', label: 'Italiano', flag: 'IT' },
  ];
  const CATEGORIES = [
    { key: 'film', icon: '▣', name: { en: 'Movies', it: 'Film' } },
    { key: 'series', icon: '▤', name: { en: 'TV series', it: 'Serie TV' } },
    { key: 'animation', icon: '✦', name: { en: 'Animation', it: 'Animazione' } },
    { key: 'songs', icon: '♫', name: { en: 'Songs', it: 'Canzoni' } },
    { key: 'books', icon: '▥', name: { en: 'Books', it: 'Libri' } },
    { key: 'history', icon: '◇', name: { en: 'History', it: 'Storia' } },
    { key: 'games', icon: '⌘', name: { en: 'Video games', it: 'Videogiochi' } },
    { key: 'proverbs', icon: '↔', name: { en: 'Proverbs', it: 'Proverbi' } },
    { key: 'anime', icon: '◎', name: { en: 'Anime', it: 'Anime' } },
    { key: 'science', icon: '∑', name: { en: 'Science', it: 'Scienza' } },
    { key: 'sports', icon: '△', name: { en: 'Sports', it: 'Sport' } },
    { key: 'internet', icon: '#', name: { en: 'Internet', it: 'Internet' } },
    { key: 'philosophy', icon: '?', name: { en: 'Philosophy', it: 'Filosofia' } },
    { key: 'food', icon: '◇', name: { en: 'Food', it: 'Cucina' } },
  ];
  const DIFFICULTIES = [
    { key: 'easy', name: { en: 'Easy', it: 'Facile' }, hint: { en: 'Iconic lines', it: 'Frasi iconiche' } },
    { key: 'medium', name: { en: 'Medium', it: 'Medio' }, hint: { en: 'A little deeper', it: 'Serve memoria' } },
    { key: 'hard', name: { en: 'Hard', it: 'Difficile' }, hint: { en: 'For connoisseurs', it: 'Per intenditori' } },
  ];

  function shuffle(items, rng) {
    const result = items.slice();
    const random = typeof rng === 'function' ? rng : Math.random;
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function categoryName(key, lang) {
    const item = CATEGORIES.find((category) => category.key === key);
    return item ? item.name[lang] : key;
  }

  function difficultyName(key, lang) {
    const item = DIFFICULTIES.find((difficulty) => difficulty.key === key);
    return item ? item.name[lang] : key;
  }

  function normalizeQuote(quote) {
    if (Array.isArray(quote)) return { text: quote[0], author: quote[1], category: quote[2], lang: quote[3], difficulty: quote[4] };
    return quote;
  }

  function filterQuotes(db, options) {
    const opts = options || {};
    return db.map(normalizeQuote).filter((quote) => (
      (!opts.lang || quote.lang === opts.lang) &&
      (!opts.category || quote.category === opts.category) &&
      (!opts.difficulty || quote.difficulty === opts.difficulty)
    ));
  }

  function uniqueByText(quotes) {
    const seen = new Set();
    return quotes.filter((quote) => {
      if (seen.has(quote.text)) return false;
      seen.add(quote.text);
      return true;
    });
  }

  function getRoundQuotes(db, options) {
    const opts = options || {};
    const count = opts.count || ROUND_SIZE;
    const exact = shuffle(filterQuotes(db, opts), opts.rng);
    const category = shuffle(filterQuotes(db, { lang: opts.lang, category: opts.category }), opts.rng);
    const language = shuffle(filterQuotes(db, { lang: opts.lang }), opts.rng);
    return uniqueByText(exact.concat(category, language)).slice(0, count);
  }

  function distractors(db, quote, count, rng) {
    const sameCategory = filterQuotes(db, { lang: quote.lang, category: quote.category })
      .filter((item) => item.author !== quote.author);
    const languagePool = filterQuotes(db, { lang: quote.lang })
      .filter((item) => item.author !== quote.author);
    const authors = [];
    const used = new Set([quote.author]);
    shuffle(sameCategory.concat(languagePool), rng).forEach((item) => {
      if (authors.length >= count || used.has(item.author)) return;
      used.add(item.author);
      authors.push(item.author);
    });
    return authors;
  }

  function makeQuestion(db, quote, rng) {
    const options = shuffle([quote.author].concat(distractors(db, quote, 3, rng)), rng);
    return Object.assign({}, quote, { options, correct: options.indexOf(quote.author) });
  }

  function buildRound(db, options) {
    const opts = options || {};
    return getRoundQuotes(db, opts).map((quote) => makeQuestion(db, quote, opts.rng));
  }

  function scoreLabel(score, total, lang) {
    const ratio = total ? score / total : 0;
    if (ratio >= 0.9) return lang === 'it' ? 'Perfetto. Hai una memoria pericolosa.' : 'Perfect. Your memory is dangerous.';
    if (ratio >= 0.7) return lang === 'it' ? 'Ottimo giro. Ancora una?' : 'Great round. One more?';
    if (ratio >= 0.5) return lang === 'it' ? 'Buona base. Il prossimo record è vicino.' : 'A solid start. The next record is close.';
    return lang === 'it' ? 'Il quiz non ha ancora finito con te.' : 'The quiz is not finished with you yet.';
  }

  return { ROUND_SIZE, LANGUAGES, CATEGORIES, DIFFICULTIES, shuffle, categoryName, difficultyName, filterQuotes, getRoundQuotes, distractors, makeQuestion, buildRound, scoreLabel };
}));
