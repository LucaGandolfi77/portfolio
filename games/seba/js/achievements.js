/* ============================================================
   Seba — forty ironic medals, all computed from the state
   ============================================================ */
import { levelOf } from './state.js';

const st = (s, k) => s.stats[k] || 0;
/** [id, icon, test, IT name, IT text, EN name, EN text] */
const A = [
  ['first-sip', '🍺', (s) => st(s, 'kind.drink') >= 1, 'Primo sorso', 'Hai dato da bere a Seba.', 'First sip', 'You gave Seba a drink.'],
  ['regular', '🍻', (s) => st(s, 'kind.drink') >= 50, 'Cliente fisso', '50 bicchieri serviti a Seba.', 'Regular', '50 glasses served to Seba.'],
  ['hydrated', '💧', (s) => st(s, 'use.acqua') >= 15, 'Idratato', '15 bicchieri d’acqua. Un adulto responsabile.', 'Hydrated', '15 glasses of water. A responsible adult.'],
  ['first-puff', '🚬', (s) => st(s, 'kind.smoke') >= 1, 'Pausa fuori', 'La prima pausa sul balcone.', 'Smoke break', 'The first break on the balcony.'],
  ['almost-quit', '🍬', (s) => st(s, 'use.menta') >= 20, 'Quasi quasi smetto', '20 cicche alla menta.', 'Almost quitting', '20 mint gums.'],
  ['new-lungs', '🫁', (s) => s.lungs >= 98 && st(s, 'kind.smoke') >= 8, 'Polmoni nuovi', 'Polmoni quasi perfetti dopo tutto quel fumo.', 'Fresh lungs', 'Near-perfect lungs after all that smoke.'],
  ['cougher', '😮‍💨', (s) => st(s, 'coughs') >= 3, 'Colpo di tosse', 'Tre attacchi di tosse. Forse è un segnale.', 'Hack', 'Three coughing fits. Possibly a sign.'],
  ['kebab', '🥙', (s) => st(s, 'use.kebab') >= 10, 'Il kebabbaro ti saluta', '10 kebab.', 'Kebab regular', '10 kebabs.'],
  ['night-bite', '🌙', (s) => st(s, 'nightBite') >= 1, 'Spuntino delle quattro', 'Hai mangiato tra le 3 e le 6.', '4 a.m. snack', 'You ate between 3 and 6.'],
  ['balanced', '🍉', (s) => st(s, 'use.frutta') >= 10, 'Cinque al giorno', '10 porzioni di frutta.', 'Five a day', '10 helpings of fruit.'],
  ['clean', '🚿', (s) => st(s, 'showers') >= 1, 'Profumo di civiltà', 'La prima doccia completa.', 'Civilised', 'The first full shower.'],
  ['squeaky', '🧼', (s) => st(s, 'showers') >= 10, 'Lindo e pinto', '10 docce.', 'Squeaky', '10 showers.'],
  ['sleeper', '🛌', (s) => st(s, 'fullNights') >= 3, 'Otto ore vere', 'Tre dormite complete.', 'Eight real hours', 'Three full nights of sleep.'],
  ['counter-nap', '💤', (s) => st(s, 'dozed') >= 1, 'Pisolino sul bancone', 'Si è addormentato da solo.', 'Counter nap', 'He fell asleep on his own.'],
  ['first-shift', '🍸', (s) => st(s, 'shifts') >= 1, 'Primo turno', 'Hai lavorato al bancone.', 'First shift', 'You worked the counter.'],
  ['veteran', '🧾', (s) => st(s, 'shifts') >= 15, 'Veterano del bancone', '15 turni.', 'Counter veteran', '15 shifts.'],
  ['flawless-shift', '✨', (s) => st(s, 'flawless.shift') >= 1, 'Mano ferma', 'Un turno senza errori.', 'Steady hand', 'A shift without mistakes.'],
  ['flawless-dj', '🎛️', (s) => st(s, 'flawless.dj') >= 1, 'Resident', 'Un set senza una nota persa.', 'Resident DJ', 'A set without a missed note.'],
  ['flawless-dance', '🕺', (s) => st(s, 'flawless.dance') >= 1, 'Anguilla', 'Pista finita senza un urto.', 'Eel', 'Finished the floor without a bump.'],
  ['flawless-run', '🌅', (s) => st(s, 'flawless.runner') >= 1, 'Dritto a casa', 'La strada dell’alba senza inciampi.', 'Straight home', 'The dawn walk without a stumble.'],
  ['flame', '🔥', (s) => st(s, 'flawless.lighter') >= 1, 'Mani di pietra', 'Accendino al primo colpo.', 'Stone hands', 'Lit on the first go.'],
  ['poet', '🙈', (s) => st(s, 'flawless.quiz') >= 1, 'Faccia di bronzo', 'Tutte le figuracce gestite alla grande.', 'Brass face', 'Every blunder handled brilliantly.'],
  ['first-blunder', '🤦', (s) => st(s, 'figuracce') >= 1, 'La prima figuraccia', 'Non ne parliamo.', 'First blunder', 'We don’t talk about it.'],
  ['floor', '🪣', (s) => st(s, 'passouts') >= 1, 'Il pavimento è comodo', 'Letargo alcolico. Bevi acqua.', 'Comfy floor', 'Out cold. Drink water.'],
  ['survivor', '🤕', (s) => st(s, 'hangovers') >= 5, 'Sopravvissuto', 'Cinque sbornie smaltite.', 'Survivor', 'Five hangovers survived.'],
  ['first-rave', '🔊', (s) => st(s, 'raves') >= 1, 'Primo rave', 'Le orecchie fischiano.', 'First rave', 'Ears ringing.'],
  ['raver', '🪩', (s) => st(s, 'raves') >= 10, 'Cassa dritta', '10 rave.', 'Four to the floor', '10 raves.'],
  ['first-after', '🌤️', (s) => st(s, 'afters') >= 1, 'Si fa after', 'Il primo after.', 'After hours', 'Your first after.'],
  ['after-king', '👑', (s) => st(s, 'afters') >= 10, 'Re dell’after', '10 after.', 'After king', '10 afters.'],
  ['passport', '✈️', (s) => s.visited.length >= 3, 'Passaporto stropicciato', 'Tre città.', 'Creased passport', 'Three cities.'],
  ['globetrotter', '🌍', (s) => s.visited.length >= 8, 'Giramondo', 'Otto città.', 'Globetrotter', 'Eight cities.'],
  ['everywhere', '🗺️', (s) => s.visited.length >= 13, 'Ovunque', 'Tutte le città fuori casa.', 'Everywhere', 'Every city away from home.'],
  ['level5', '⭐', (s) => levelOf(s.xp) >= 5, 'Mezza leggenda', 'Livello 5.', 'Half legend', 'Level 5.'],
  ['level10', '🌟', (s) => levelOf(s.xp) >= 10, 'Leggenda', 'Livello 10.', 'Legend', 'Level 10.'],
  ['rich', '💶', (s) => st(s, 'earned') >= 500, 'Mance generose', '500 mance guadagnate.', 'Big tipper’s darling', '500 tips earned.'],
  ['tycoon', '💰', (s) => st(s, 'earned') >= 2000, 'Cassetto pieno', '2000 mance guadagnate.', 'Full drawer', '2000 tips earned.'],
  ['stylish', '🕶️', (s) => st(s, 'bought') >= 1, 'Primo acquisto', 'Seba ha un look nuovo.', 'First purchase', 'Seba has a new look.'],
  ['wardrobe', '👔', (s) => s.owned.length >= 12, 'Armadio pieno', '12 capi posseduti.', 'Stuffed closet', '12 pieces owned.'],
  ['full-look', '💃', (s) => Object.values(s.outfit).filter(Boolean).length >= 6, 'Tutto addosso', 'Un capo in ogni posto.', 'Everything on', 'A piece in every slot.'],
  ['friend', '❤️', (s) => st(s, 'pets') >= 100, 'Amicizia vera', '100 coccole.', 'True friends', '100 cuddles.'],
  ['night-owl', '🦉', (s) => st(s, 'nightOwl') >= 1, 'Gufo', 'Hai giocato tra le 3 e le 5.', 'Night owl', 'You played between 3 and 5.'],
];

export const ACHIEVEMENTS = A.map(([id, icon, test, it, itText, en, enText]) =>
  ({ id, icon, test, name: { it, en }, text: { it: itText, en: enText } }));

/** Unlocks whatever is newly true and returns it. */
export function checkAchievements(s) {
  const fresh = ACHIEVEMENTS.filter((a) => !s.achievements.includes(a.id) && a.test(s));
  for (const a of fresh) s.achievements.push(a.id);
  return fresh;
}
