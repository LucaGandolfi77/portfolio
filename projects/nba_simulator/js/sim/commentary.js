/* Bilingual play-by-play templates */

const T = {
  shot3: ['{p} da tre! 🏀', '{p} infila la tripla', 'Tre punti di {p}'],
  shot2: ['{p} segna in area', '{p} a canestro', 'Due punti di {p}'],
  dunk: ['{p} schiaccia! 💥', 'Dunk di {p}!', '{p} vola sul canestro'],
  ft: ['{p} segna ai liberi', '{p} Realizzato dalla lunetta', 'Libero a segno di {p}'],
  miss: ['{p} sbaglia il tiro', 'Tiro fuori di {p}', '{p} non trova il canestro'],
  turnover: ['Palla persa di {p}', '{p} perde il possesso', 'Errore di {p}'],
  steal: ['{p} ruba palla!', 'Recupero di {p}', '{p} intercetta il passaggio'],
  foul: ['Fallo su {p}', '{p} subisce fallo', 'Fallo commesso su {p}'],
  block: ['{p} stoppa il tiro!', 'Blocco di {p}', '{p} respinge la conclusione'],
  rebound: ['{p} rimbalzo', '{p} prende il rimbalzo', 'Rimbalzo di {p}'],
  substitution: ['Cambio: entra {p}', '{p} entra in campo', 'Sostituzione, dentro {p}'],
  injury: ['⚠️ {p} si infortunia', 'Infortunio per {p}', '{p} è uscito per infortunio'],
  play: ['{t} gioca {play}', '{t} sceglie {play}', 'Set offensivo: {play}'],
  quarter: ['Fine {q}º quarto', 'Termina il {q}º periodo', '{q}º quarto concluso'],
  overtime: ['Overtime!', 'Si va ai tempi supplementari', 'Tempo extra'],
  end: ['Fine partita', 'Partita terminata', 'Triplice fischio'],
  milestone: ['{p} raggiunge un traguardo', '{p} fa segnare il tabellino', 'Traguardo personale di {p}'],
  clutch: ['Clutch time!', 'Finale Pointa', 'Partita Pointa']
};

const EN = {
  shot3: ['{p} drains a three!', 'Three-pointer by {p}', '{p} from downtown'],
  shot2: ['{p} scores inside', '{p} finishes at the rim', 'Two points by {p}'],
  dunk: ['{p} throws it down! 💥', 'Dunk by {p}!', '{p} flies to the hoop'],
  ft: ['{p} makes the free throw', '{p} converts from the line', 'Free throw good by {p}'],
  miss: ['{p} misses the shot', 'Shot off by {p}', '{p} cannot convert'],
  turnover: ['Turnover by {p}', '{p} loses the ball', 'Giveaway by {p}'],
  steal: ['{p} steals the ball!', 'Steal by {p}', '{p} intercepts the pass'],
  foul: ['Foul on {p}', '{p} is fouled', 'Foul committed on {p}'],
  block: ['{p} blocks the shot!', 'Block by {p}', '{p} rejects the attempt'],
  rebound: ['{p} grabs the rebound', 'Rebound by {p}', '{p} pulls it down'],
  substitution: ['Sub: {p} checks in', '{p} enters the game', 'Substitution, in comes {p}'],
  injury: ['⚠️ {p} goes down', 'Injury for {p}', '{p} is out with an injury'],
  play: ['{t} runs {play}', '{t} calls {play}', 'Offensive set: {play}'],
  quarter: ['End of Q{q}', 'Quarter {q} is over', 'Q{q} wrapped up'],
  overtime: ['Overtime!', 'We are going to overtime', 'Extra period'],
  end: ['Final buzzer', 'Game over', 'That will do it'],
  milestone: ['{p} reaches a milestone', '{p} makes history', 'Milestone for {p}'],
  clutch: ['Clutch time!', 'Down to the wire', 'This is getting tight']
};

function pick(list, rng) { return list[Math.floor((rng ? rng() : Math.random()) * list.length) % list.length]; }
function fill(text, vars) {
  let out = String(text);
  for (const [k, v] of Object.entries(vars || {})) out = out.replaceAll(`{${k}}`, String(v));
  return out;
}

export function line(lang, kind, vars, rng) {
  const dict = lang === 'en' ? EN : T;
  const variants = dict[kind] || dict.shot2;
  return fill(pick(variants, rng), vars);
}

export function pair(kind, vars, rng) {
  return { it: line('it', kind, vars, rng), en: line('en', kind, vars, rng) };
}
