/* Shake Me — what Tobia and the customers say. IT + EN, pure. */

export const LINES = {
  it: {
    hello: ['Il bancone è tuo. Io assaggio.', 'Mani pulite, ghiaccio freddo, testa fresca.', 'Un cliente alla volta. Il primo è sempre il più importante.', 'Il segreto? Misurare. Il resto è teatro.'],
    stars3: ['Questo lo servirei io. Anzi, lo rubo.', 'Pulito, freddo, preciso. Mi hai commosso.', 'Quarant’anni dietro il banco e non ho niente da dire.', 'Perfetto. Adesso rifallo uguale cento volte.'],
    stars2: ['Buono. Un dettaglio e sarebbe da manuale.', 'Ci siamo quasi: il cliente torna.', 'Bevibile con piacere. Sistemiamo una cosa.', 'Bene, ma io l’avrei fatto un filo meglio.'],
    stars1: ['Si beve. Non si ricorda.', 'Il cliente non si lamenta, ma nemmeno sorride.', 'C’è l’idea. Manca il mestiere.', 'Passabile. Riprova e lo battiamo.'],
    stars0: ['Questo lo offriamo alle piante.', 'Ragazzo mio, il cliente ha chiesto un’altra cosa.', 'Ricominciamo dal bicchiere, con calma.', 'Respira. Rileggi la ricetta. Riprova.'],
    missing: ['Manca {i}. E si sente.', 'Dov’è finito {i}?'],
    extra: ['{i} qui non c’entra niente.', 'Chi ti ha detto di mettere {i}?'],
    doseHigh: ['Troppo {i}: {got} invece di {want}.', '{i} abbondante, la ricetta è un’altra.'],
    doseLow: ['Poco {i}: {got} invece di {want}.', '{i} col contagocce: ne serviva di più.'],
    tool: ['Attrezzo sbagliato: questo si fa con {want}.', 'Con {got}? No, qui serve {want}.'],
    noAction: ['Te lo sei dimenticato: {a}!', 'Gli ingredienti ci sono, ma {a} no.'],
    actionShort: ['Troppo poco: {a} più a lungo, deve diventare freddo.', 'Hai avuto fretta. {a} ancora un po’.'],
    actionLong: ['Troppo: si è annacquato.', 'Ancora un po’ e diventava acqua.'],
    noIce: ['Senza ghiaccio non si raffredda niente.', 'Il ghiaccio nell’attrezzo, ragazzo mio.'],
    muddle: ['Andava pestato prima, per tirare fuori i profumi.', 'Il pestello è lì per qualcosa.'],
    place: ['{i} è finito nel posto sbagliato.', '{i} andava insieme agli altri, non lì.'],
    top: ['{i} va per ultimo, nel bicchiere.', 'Le bollicine ({i}) si aggiungono alla fine.'],
    float: ['{i} va versato per ultimo, piano, senza mescolare.', '{i} doveva restare a parte, in cima o sul fondo.'],
    rinse: ['{i} serve solo a profumare il bicchiere, prima di tutto.', 'Il bicchiere andava profumato con {i} all’inizio.'],
    glass: ['Il bicchiere giusto è {want}.', 'In {got}? Questo va in {want}.'],
    ice: ['Ghiaccio nel bicchiere: serviva {want}.', 'Il ghiaccio non è quello giusto: {want}.'],
    garnishMissing: ['Manca la guarnizione: {g}.', 'E {g}? L’occhio vuole la sua parte.'],
    garnishExtra: ['{g} qui non serve.', 'Troppa roba sul bordo: via {g}.'],
    rimMissing: ['Il bordo di {r}: dimenticato.', 'Questo vuole il bordo di {r}.'],
    rimWrong: ['Bordo sbagliato: serviva {r}.', 'Il bordo è di {r}, non quello.'],
    rimExtra: ['Il bordo qui non va.', 'Niente bordo su questo, per favore.'],
    customer: {
      ada: ['Leggero, per favore, che domani ho lezione alle sette.', 'Il mio drink preferito è quello fatto con calma.'],
      bruno: ['Quarant’anni di taxi e mai un incidente. Anche lei, eh.', 'Quello di una volta, come lo faceva Tobia.'],
      cleo: ['Dopo il concerto ho bisogno di qualcosa di intonato.', 'Mi piace quando il ghiaccio suona nel bicchiere.'],
      dario: ['Proporzioni, ecco cosa conta. Come nei palazzi.', 'Lo guardo prima di berlo. Deve essere bello.'],
      elsa: ['Scrivo un pezzo sui bar di quartiere. Faccia bella figura.', 'Mi racconti com’è fatto, mentre lo prepara.'],
      farid: ['Io in cucina misuro tutto. Spero anche lei.', 'Il segreto è l’equilibrio. Dolce, acido, amaro.'],
      greta: ['Ci siamo sposati ieri! Due, per favore. Anzi, uno alla volta.', 'Ugo dice che lo vuole uguale al mio.'],
      hiro: ['Ho letto di questo cocktail in un libro. Esiste davvero?', 'Posso fare una foto prima di berlo?'],
      irma: ['Alla mia età si beve poco, ma si beve bene.', 'Tobia me lo faceva nel sessantotto.'],
      luca: ['Guido io stasera: qualcosa senza alcol, ma fatto bene.', 'Analcolico non vuol dire triste.'],
    },
  },
  en: {
    hello: ['The counter is yours. I taste.', 'Clean hands, cold ice, cool head.', 'One customer at a time. The first is always the most important.', 'The secret? Measure. The rest is theatre.'],
    stars3: ['I would serve this myself. In fact, I am stealing it.', 'Clean, cold, precise. You moved me.', 'Forty years behind the bar and I have nothing to add.', 'Perfect. Now make it the same a hundred times.'],
    stars2: ['Good. One detail and it is textbook.', 'Nearly there: the customer comes back.', 'A pleasure to drink. Let us fix one thing.', 'Fine, but I would have done it a touch better.'],
    stars1: ['Drinkable. Not memorable.', 'The customer does not complain, but does not smile either.', 'The idea is there. The craft is not yet.', 'Passable. Try again and we beat it.'],
    stars0: ['This one goes to the plants.', 'My friend, the customer asked for something else.', 'Let us start again from the glass, slowly.', 'Breathe. Read the recipe again. Try again.'],
    missing: ['No {i}. And you can taste it.', 'Where did the {i} go?'],
    extra: ['{i} has no business in here.', 'Who told you to add {i}?'],
    doseHigh: ['Too much {i}: {got} instead of {want}.', 'Generous with {i}; the recipe is not.'],
    doseLow: ['Not enough {i}: {got} instead of {want}.', '{i} by the drop: it needed more.'],
    tool: ['Wrong tool: this is made with the {want}.', 'With the {got}? No, this needs the {want}.'],
    noAction: ['You forgot to {a}!', 'The ingredients are there, but you did not {a}.'],
    actionShort: ['Too short: {a} longer, it has to get cold.', 'You were in a hurry. {a} a bit more.'],
    actionLong: ['Too long: it went watery.', 'A little more and it was water.'],
    noIce: ['Without ice nothing gets cold.', 'Ice in the tool, my friend.'],
    muddle: ['It needed muddling first, to wake the aromas.', 'The muddler is there for a reason.'],
    place: ['The {i} ended up in the wrong place.', '{i} went in with the others, not there.'],
    top: ['{i} goes in last, in the glass.', 'The bubbles ({i}) go in at the end.'],
    float: ['{i} goes in last, slowly, without stirring.', '{i} had to stay apart, on top or at the bottom.'],
    rinse: ['{i} only perfumes the glass, before anything else.', 'The glass needed a rinse of {i} at the start.'],
    glass: ['The right glass is the {want}.', 'In the {got}? This goes in the {want}.'],
    ice: ['Ice in the glass: it needed {want}.', 'Wrong ice: {want}.'],
    garnishMissing: ['Missing garnish: {g}.', 'And the {g}? The eye drinks first.'],
    garnishExtra: ['{g} is not needed here.', 'Too much on the rim: lose the {g}.'],
    rimMissing: ['The {r} rim: forgotten.', 'This one wants a {r} rim.'],
    rimWrong: ['Wrong rim: it needed {r}.', 'The rim is {r}, not that.'],
    rimExtra: ['No rim on this one.', 'No rim here, please.'],
    customer: {
      ada: ['Light, please, I teach at seven tomorrow.', 'My favourite drink is the one made calmly.'],
      bruno: ['Forty years of taxi and never an accident. You too, eh.', 'The old one, the way Tobia made it.'],
      cleo: ['After the concert I need something in tune.', 'I like it when the ice sings in the glass.'],
      dario: ['Proportions, that is what matters. Like buildings.', 'I look at it before I drink it. It must be beautiful.'],
      elsa: ['I am writing a piece on neighbourhood bars. Look good.', 'Tell me how it is made while you make it.'],
      farid: ['In my kitchen I measure everything. I hope you do too.', 'The secret is balance. Sweet, sour, bitter.'],
      greta: ['We got married yesterday! Two, please. Well, one at a time.', 'Ugo says he wants it the same as mine.'],
      hiro: ['I read about this cocktail in a book. Does it really exist?', 'May I take a photo before I drink it?'],
      irma: ['At my age you drink little, but you drink well.', 'Tobia made me this in sixty-eight.'],
      luca: ['I am driving tonight: no alcohol, but made properly.', 'Alcohol-free does not mean sad.'],
    },
  },
};

const pick = (list, rng) => list[Math.floor(rng() * list.length)];

/** Tobia's comment: the worst defect if any, otherwise praise. */
export function verdictLine(lang, result, names, rng = Math.random) {
  const L = LINES[lang] || LINES.it;
  const praise = pick(L[`stars${result.stars}`], rng);
  const d = result.defects[0];
  if (!d || result.stars === 3) return praise;
  const tpl = L[d.key];
  if (!tpl) return praise;
  return pick(tpl, rng)
    .replace('{i}', names.ing(d.ing))
    .replace('{got}', names.dose(d.got, d.unit)).replace('{want}', d.key.startsWith('dose') ? names.dose(d.want, d.unit) : names.thing(d.want, d.key))
    .replace('{got}', names.thing(d.got, d.key))
    .replace('{a}', names.action(d.action))
    .replace('{g}', names.garnish(d.garnish))
    .replace('{r}', names.rim(d.rim));
}

export function customerLine(lang, id, rng = Math.random) {
  const L = LINES[lang] || LINES.it;
  return pick(L.customer[id] || L.hello, rng);
}
