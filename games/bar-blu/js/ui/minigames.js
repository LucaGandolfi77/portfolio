/* ============================================================
   Bar Blu — the two small games inside the story
   ------------------------------------------------------------
   · rush: a few regulars order in a hurry; serve the right drink
     and they leave a tip
   · saletta: the three sisters. Tips only, never real money.
     They pay back about nine euros out of ten, they love to show
     you a near miss, and they talk.
   ============================================================ */
import { REGULARS, DRINKS } from '../cast.js';

const $ = (sel, root = document) => root.querySelector(sel);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- rush ---------------- */

const THANKS = ['Grazie, Blu!', 'Perfetto. Tieni il resto.', 'Ecco, così si comincia bene.', 'Sei una benedizione.', 'Mi hai salvato la giornata.'];
const OOPS = ['Ehm... non era proprio questo. Ma va bene, lo bevo.', 'Questo? Va be’, oggi è così.', 'No... vabbè. È la settimana degli errori.'];

export async function rush({ count, stage, box, vars, sfx, used }) {
  const pool = REGULARS.filter((r) => !used.has(r.name));
  const list = [];
  while (list.length < count && pool.length) list.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  let earned = 0;
  for (const r of list) {
    used.add(r.name);
    sfx('porta');
    stage.showLook(r.name, r.look, '#c9d2e3');
    const choice = await box.ask({ who: r.name, color: '#c9d2e3', text: r.line, drinks: Object.entries(DRINKS).map(([k, d]) => ({ key: k, label: `${d.icon} ${d.name}` })) });
    sfx('tazzina');
    if (choice === r.drink) {
      const tip = 1 + (Math.random() < 0.4 ? 1 : 0);
      vars.mance = (vars.mance || 0) + tip;
      earned += tip;
      sfx('moneta');
      await box.say({ who: r.name, color: '#c9d2e3', text: `${THANKS[Math.floor(Math.random() * THANKS.length)]}  (+${tip} €)` });
    } else {
      await box.say({ who: r.name, color: '#c9d2e3', text: OOPS[Math.floor(Math.random() * OOPS.length)] });
    }
    stage.hide('_guest');
    await wait(250);
  }
  return earned;
}

/* ---------------- saletta ---------------- */

const SYMBOLS = ['福', '禄', '寿', '🍒', '7', '★'];
const VOICE = [
  'Ancora uno.', 'Il prossimo è quello buono.', 'Ci sei quasi!', 'Hai quasi vinto. Quasi.', 'Lo senti? Stasera sono generose.',
  'Non andare via. Ti stavo aspettando.', 'Tuo padre lo sapeva. No, scusa. Il padre di qualcun altro.', 'Che bello averti qui.',
  'Gioca con me!', 'Recupera. Si recupera sempre.', 'Un euro non è niente. Uno solo.', 'Domani è troppo tardi. Adesso.',
];

/** Outcome first, then the reels that show it: ~91 % returned, many near misses. */
export function spinOutcome(rnd = Math.random) {
  const r = rnd();
  let pay = 0, kind = 'none';
  if (r < 0.01) { pay = 20; kind = 'fu'; }
  else if (r < 0.03) { pay = 10; kind = 'seven'; }
  else if (r < 0.07) { pay = 5; kind = 'cherry3'; }
  else if (r < 0.15) { pay = 2; kind = 'cherry2'; }
  else if (r < 0.30) { pay = 1; kind = 'cherry1'; }
  const pick = (exclude) => { let s; do { s = SYMBOLS[Math.floor(rnd() * SYMBOLS.length)]; } while (exclude.includes(s)); return s; };
  let reels;
  switch (kind) {
    case 'fu': reels = ['福', '福', '福']; break;
    case 'seven': reels = ['7', '7', '7']; break;
    case 'cherry3': reels = ['🍒', '🍒', '🍒']; break;
    case 'cherry2': reels = ['🍒', '🍒', pick(['🍒'])]; break;
    case 'cherry1': reels = ['🍒', pick(['🍒']), pick(['🍒'])]; break;
    default: {
      if (rnd() < 0.45) { const s = pick(['🍒']); reels = [s, s, pick([s, '🍒'])]; }   // the near miss
      else reels = [pick(['🍒']), pick(['🍒']), pick(['🍒'])];
      if (reels[0] === reels[1] && reels[1] === reels[2]) reels[2] = pick([reels[0], '🍒']);
    }
  }
  return { reels, pay, near: kind === 'none' && reels[0] === reels[1] };
}

export async function saletta({ root, vars, sfx, music, onLine, onChange = () => {} }) {
  const el = $('#saletta', root);
  const reels = [...el.querySelectorAll('.reel')];
  const money = $('.sal-money', el);
  const voice = $('.sal-voice', el);
  const btn = $('.sal-spin', el);
  const leave = $('.sal-leave', el);
  const sessionStart = vars.spins || 0;
  music('macchina');
  el.classList.remove('hidden');
  const update = () => {
    onChange();
    money.textContent = `Mance: ${vars.mance || 0} €`;
    btn.disabled = (vars.mance || 0) < 1;
  };
  update();
  voice.textContent = 'Ciao! Gioca con me! La fortuna è dietro l’angolo!';
  return new Promise((resolve) => {
    let busy = false;
    const done = () => {
      btn.onclick = null;
      leave.onclick = null;
      el.classList.add('hidden');
      resolve({ spins: (vars.spins || 0) - sessionStart });
    };
    leave.onclick = done;
    btn.onclick = async () => {
      if (busy || (vars.mance || 0) < 1) return;
      busy = true;
      btn.disabled = true;
      vars.mance -= 1;
      vars.spins = (vars.spins || 0) + 1;
      update();
      sfx('reel');
      const out = spinOutcome();
      for (const r of reels) r.classList.add('spin');
      for (let i = 0; i < 3; i++) {
        await wait(380 + i * 260);
        reels[i].classList.remove('spin');
        reels[i].textContent = out.reels[i];
        sfx('reel');
      }
      if (out.pay) {
        vars.mance += out.pay;
        sfx(out.pay >= 5 ? 'vinci' : 'moneta');
        el.classList.add('win');
        setTimeout(() => el.classList.remove('win'), 900);
        voice.textContent = out.pay >= 10 ? `HAI VINTO ${out.pay} €! Lo sapevo. Lo sapevo che eri speciale.` : `Hai vinto ${out.pay} €! Visto? Visto?`;
      } else {
        voice.textContent = out.near ? 'Ci sei quasi! Ancora uno.' : VOICE[Math.floor(Math.random() * VOICE.length)];
      }
      update();
      const total = vars.spins;
      if (total === 12 || total === 30) onLine(total);
      busy = false;
      btn.disabled = (vars.mance || 0) < 1;
    };
  });
}
