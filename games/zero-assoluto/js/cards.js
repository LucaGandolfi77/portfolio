/* ZERO ASSOLUTO — motore delle carte: applica funzioni, blocca il negativo, verifica lo zero esatto */
'use strict';

const CardEngine = (() => {
  /* Crea il mazzo base (carte sbloccate) */
  function baseDeck(unlockedIds) {
    const ids = unlockedIds && unlockedIds.length
      ? unlockedIds
      : CARDS.filter(c => c.unlock === null).map(c => c.id);
    return ids.slice();
  }

  /* Applica una carta-funzione alla vita. Ritorna { ok, value, blocked, message }
     - ok: true se applicata
     - blocked: true se il risultato sarebbe negativo (trabocco bloccato)
     - value: nuovo valore (solo se ok)
     - message: messaggio da mostrare */
  function applyFn(card, life, maxLife) {
    let v = card.fn(life);
    if (v === null) {
      return { ok: false, blocked: true, message: 'Carta bloccata: la funzione non è applicabile a questo valore.' };
    }
    if (!Number.isFinite(v)) {
      return { ok: false, blocked: true, message: 'Risultato non finito: la funzione esplode oltre ogni limite.' };
    }
    v = Math.round(v);
    if (v < 0) {
      return { ok: false, blocked: true, message: 'Trabocco bloccato: la vita non può scendere sotto zero. Devi atterrare ESATTAMENTE su 0!' };
    }
    v = Math.min(maxLife, v);
    if (v === 0) {
      return { ok: true, value: 0, zero: true, message: '🎯 ZERO ASSOLUTO! La vita è esattamente 0.' };
    }
    return { ok: true, value: v, message: life + ' → ' + v };
  }

  /* Applica una carta-abilità. Ritorna un evento da gestire nel main.
     Tipi: primo, quadperf, doppia, congela, furto, rubacarta, scudo, specchio, scambio, cura, terremoto, coniugato */
  function applyAbility(card, ctx) {
    switch (card.id) {
      case 'primo': {
        const x = ctx.targetLife;
        if (isPrime(x)) return { type: 'win', message: '🏆 Colpo del Primo: ' + x + ' è primo → 0!' };
        return { type: 'fail', message: '✖️ ' + x + ' non è primo: il colpo fallisce.' };
      }
      case 'quadperf': {
        const x = ctx.targetLife;
        if (isPerfectSquare(x)) return { type: 'win', message: '🏆 Colpo del Quadrato Perfetto: ' + x + ' = k² → 0!' };
        return { type: 'fail', message: '✖️ ' + x + ' non è un quadrato perfetto.' };
      }
      case 'doppia': return { type: 'double', message: '×2 La prossima carta si applica due volte.' };
      case 'congela': return { type: 'freeze', message: '❄️ L\'avversario salta il prossimo turno.' };
      case 'furto': return { type: 'steal', message: '⚡ +3 energia a te, −3 all\'avversario.' };
      case 'rubacarta': return { type: 'draw2', message: '🃏 Peschi 2 carte extra.' };
      case 'scudo': return { type: 'shield', message: '🛡️ Il prossimo colpo subito è dimezzato.' };
      case 'coniugato': return { type: 'shield', message: '🛡️ Coniugato: la parte immaginaria sparisce, il prossimo colpo è annullato (scudo).' };
      case 'specchio': return { type: 'mirror', message: '🪞 L\'ultima carta avversaria si applica a lui!' };
      case 'scambio': return { type: 'swap', message: '🔁 Scambio di vita!' };
      case 'cura': return { type: 'heal', message: '💚 +50 alla tua vita.' };
      case 'terremoto': return { type: 'earthquake', message: '🌋 Entrambe le vite si dimezzano.' };
      case 'rinforzo': return { type: 'reinforce', message: '🃏 Peschi fino ad avere 6 carte.' };
      case 'disarmo': return { type: 'disarm', message: '🤚 L\'avversario scarta una carta.' };
      case 'contrattacco': return { type: 'counter', message: '🪃 Contrattacco pronto: se hai subito danni, riflettili a metà.' };
      case 'vampirismo': return { type: 'vampire', message: '🧛 Vampirismo: per questo turno ogni riduzione inflitta ti cura.' };
      case 'cancellazione': return { type: 'cancel', message: '🧹 Rimuovi una carta dal campo avversario.' };
      case 'clonazione': return { type: 'clone', message: '🧬 Copia l\'ultima carta avversaria nella tua mano.' };
      case 'riciclo': return { type: 'recycle', message: '♻️ Ricicla una tua carta campo per +3 energia.' };
      case 'trasferimento': return { type: 'transfer', message: '📦 Sposta l\'ultima carta campo avversaria nel tuo campo.' };
      case 'monty': return { type: 'monty', message: '🚪 Tre porte, un premio: scegli con saggezza.' };
      case 'pascalbet': return { type: 'pascalbet', message: '⚖️ Lancia la moneta: testa dimezza la vita avversaria!' };
      case 'casino': return { type: 'casino', message: '🎰 Il banco gira: danno casuale 0–10.' };
      case 'bayes': return { type: 'bayes', message: '🔬 Bayes: rivela la prossima carta avversaria.' };
      case 'valoreatteso': return { type: 'valoreatteso', message: '📐 Valore atteso: media di 3 dadi come danno.' };
      case 'raddoppio': return { type: 'raddoppio', message: '💰 Scommetti 3 energia: testa raddoppia!' };
      default: return { type: 'unknown', message: '' };
    }
  }

  /* Applica il "tick" di una carta campo a inizio turno.
     Ritorna { type, value, blocked, message, counter } dove:
       - type: 'damage' (riduce la vita avversaria) | 'heal' | 'energy' | 'passive' | 'none'
       - value: nuovo valore della vita target (per 'damage')
       - blocked: true se il tick porterebbe la vita sotto zero
       - counter: nuovo contatore per carte incrementali (conto, ragnafib) */
  function fieldTick(card, targetLife, counter, ctx) {
    const f = card.field;
    counter = counter || 0;
    ctx = ctx || {};
    // se la vita è già zero la partita è finita: il tick non agisce
    if (targetLife <= 0 && f.kind !== 'heal' && f.kind !== 'energy' && f.kind !== 'energyScaled') {
      return { type: 'none', message: 'vita già a zero' };
    }
    switch (f.kind) {
      case 'sub': {
        let n = f.n;
        if (f.inc) n = f.n + counter; // conto alla rovescia: 1, 2, 3…
        const v = targetLife - n;
        if (v < 0) return { type: 'damage', blocked: true, message: 'Trabocco bloccato: la goccia non può scendere sotto zero.' };
        return { type: 'damage', value: v, counter: counter + 1, message: targetLife + ' → ' + v + ' (' + (f.inc ? '-' + n : '-' + f.n) + ')' };
      }
      case 'seq': {
        const n = f.seq[counter % f.seq.length];
        const v = targetLife - n;
        if (v < 0) return { type: 'damage', blocked: true, message: 'Trabocco bloccato: la ragnatela non può scendere sotto zero.' };
        return { type: 'damage', value: v, counter: counter + 1, message: targetLife + ' → ' + v + ' (−' + n + ', Fibonacci)' };
      }
      case 'pct': {
        const v = Math.floor(targetLife * (100 - f.pct) / 100);
        if (v < 0) return { type: 'damage', blocked: true, message: 'Trabocco bloccato.' };
        return { type: 'damage', value: v, message: targetLife + ' → ' + v + ' (−' + f.pct + '%)' };
      }
      case 'pctInc': {
        const pct = f.pct + counter;
        const v = Math.floor(targetLife * (100 - pct) / 100);
        if (v < 0) return { type: 'damage', blocked: true, message: 'Trabocco bloccato.' };
        return { type: 'damage', value: v, counter: counter + 1, message: targetLife + ' → ' + v + ' (−' + pct + '%)' };
      }
      case 'mod': {
        const v = targetLife % f.m;
        return { type: 'damage', value: v, message: targetLife + ' mod ' + f.m + ' = ' + v };
      }
      case 'primeSub': {
        if (!isPrime(targetLife)) return { type: 'none', message: targetLife + ' non è primo: il veleno non agisce.' };
        const v = targetLife - f.n;
        if (v < 0) return { type: 'damage', blocked: true, message: 'Trabocco bloccato.' };
        return { type: 'damage', value: v, message: targetLife + ' è primo → ' + v };
      }
      case 'zeno': {
        const v = Math.max(1, Math.floor(targetLife / 2));
        return { type: 'damage', value: v, message: targetLife + ' → ' + v + ' (tende a 1, mai a 0)' };
      }
      case 'sqrt': {
        const v = Math.floor(Math.sqrt(targetLife));
        return { type: 'damage', value: v, message: targetLife + ' → ' + v + ' (√)' };
      }
      case 'parity': {
        const v = targetLife % 2 === 0 ? targetLife / 2 : targetLife - 1;
        return { type: 'damage', value: v, message: targetLife + (targetLife % 2 === 0 ? ' pari → ' : ' dispari → ') + v };
      }
      case 'resonance': {
        const n = ctx.fieldCount || 1;
        const v = targetLife - n;
        if (v < 0) return { type: 'damage', blocked: true, message: 'Trabocco bloccato: la risonanza non può scendere sotto zero.' };
        return { type: 'damage', value: v, message: targetLife + ' → ' + v + ' (risonanza ×' + n + ')' };
      }
      case 'heal': return { type: 'heal', value: f.n, message: '+' + f.n + ' vita' };
      case 'energy': return { type: 'energy', value: f.n, message: '+' + f.n + ' energia' };
      case 'energyScaled': {
        const n = ctx.ownFieldCount || 1;
        return { type: 'energy', value: f.n * n, message: '+' + (f.n * n) + ' energia (×' + n + ' campi)' };
      }
      case 'energyOpp': {
        const n = ctx.oppFieldCount || 1;
        return { type: 'energy', value: f.n * n, message: '+' + (f.n * n) + ' energia (×' + n + ' campi avversari)' };
      }
      // ---- tipi aleatori (probabilità e statistica) ----
      case 'coin': {
        const heads = Math.random() < 0.5;
        if (heads) {
          const v = targetLife - f.heads.sub;
          if (v < 0) return { type: 'damage', blocked: true, message: 'Trabocco bloccato: la moneta non può scendere sotto zero.' };
          return { type: 'damage', value: v, message: '🪙 Testa: −' + f.heads.sub + ' (' + targetLife + ' → ' + v + ')' };
        }
        const v = Math.min(ctx.maxLife != null ? ctx.maxLife : targetLife + f.tails.add, targetLife + f.tails.add);
        return { type: 'damage', value: v, message: '🪙 Croce: +' + f.tails.add + ' al nemico (' + targetLife + ' → ' + v + ') — rischio!' };
      }
      case 'dice': {
        const n = 1 + Math.floor(Math.random() * 6);
        const v = targetLife - n;
        if (v < 0) return { type: 'damage', blocked: true, message: 'Trabocco bloccato: il dado non può scendere sotto zero.' };
        return { type: 'damage', value: v, message: '🎲 Dado: ' + n + ' (' + targetLife + ' → ' + v + ')' };
      }
      case 'coins': {
        let heads = 0;
        for (let i = 0; i < f.n; i++) if (Math.random() < 0.5) heads++;
        const v = targetLife - heads;
        if (v < 0) return { type: 'damage', blocked: true, message: 'Trabocco bloccato: le monete non possono scendere sotto zero.' };
        return { type: 'damage', value: v, message: '📈 ' + heads + ' teste su ' + f.n + ' (' + targetLife + ' → ' + v + ')' };
      }
      case 'walk': {
        const forward = Math.random() < 0.5;
        if (forward) {
          const v = targetLife - f.step;
          if (v < 0) return { type: 'damage', blocked: true, message: 'Trabocco bloccato: il gatto non può scendere sotto zero.' };
          return { type: 'damage', value: v, message: '🐾 Passo avanti: −' + f.step + ' (' + targetLife + ' → ' + v + ')' };
        }
        return { type: 'heal', value: 2, message: '🐾 Passo indietro: +2 alla TUA vita' };
      }
      case 'normal': {
        // X ≈ N(mu, sigma) approssimata: U{mu−sigma, …, mu+sigma}
        const n = f.mu - f.sigma + Math.floor(Math.random() * (2 * f.sigma + 1));
        const v = targetLife - n;
        if (v < 0) return { type: 'damage', blocked: true, message: 'Trabocco bloccato: la campana non può scendere sotto zero.' };
        return { type: 'damage', value: v, message: '🔔 N(' + f.mu + ',' + f.sigma + '): −' + n + ' (' + targetLife + ' → ' + v + ')' };
      }
      case 'entropy': {
        const n = 1 + Math.floor(Math.random() * ((ctx.fieldCount || 1) + 1));
        const v = targetLife - n;
        if (v < 0) return { type: 'damage', blocked: true, message: 'Trabocco bloccato: l\'entropia non può scendere sotto zero.' };
        return { type: 'damage', value: v, message: '🎲 Entropia (' + (ctx.fieldCount || 1) + ' campi): −' + n + ' (' + targetLife + ' → ' + v + ')' };
      }
      case 'sabotage': {
        if (Math.random() < f.p) return { type: 'sabotage', message: '💣 Sabotaggio riuscito!' };
        return { type: 'none', message: '💣 Sabotaggio fallito: la probabilità non è una promessa.' };
      }
      case 'poisson': {
        // algoritmo di Knuth: genera una variabile di Poisson(λ)
        const L = Math.exp(-f.lambda);
        let k = 0, p = 1;
        do { k++; p *= Math.random(); } while (p > L);
        const n = k - 1;
        if (n === 0) return { type: 'none', message: '📭 Poisson: 0 eventi — nessun danno (ma è il caso più probabile!)' };
        const v = targetLife - n;
        if (v < 0) return { type: 'damage', blocked: true, message: 'Trabocco bloccato: Poisson non può scendere sotto zero.' };
        return { type: 'damage', value: v, message: '📭 Poisson(λ=' + f.lambda + '): −' + n + ' (' + targetLife + ' → ' + v + ')' };
      }
      case 'passive': return { type: 'passive', message: 'passiva attiva' };
      default: return { type: 'none', message: '' };
    }
  }

  function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  }
  function isPerfectSquare(n) {
    const r = Math.floor(Math.sqrt(n));
    return r * r === n;
  }

  return { baseDeck, applyFn, applyAbility, fieldTick, isPrime, isPerfectSquare };
})();
