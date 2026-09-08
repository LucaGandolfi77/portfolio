const gid = id => document.getElementById(id);
let currentCard = null, currentDeck = [];

async function loadDue() {
  await Deck.init();
  currentDeck = await Deck.getDue();
  if (currentDeck.length) { currentCard = currentDeck[0]; gid('card-front').textContent = currentCard.q; }
  else { gid('card-front').textContent = 'Nessuna card dovuta ora — crea nel tab Crea'; }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => { document.querySelectorAll('.tab').forEach(x => x.classList.remove('active')); t.classList.add('active'); document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active')); gid('tab-' + t.dataset.tab).classList.add('active'); }));
  gid('btn-flip').addEventListener('click', () => { if (currentCard) gid('card-front').textContent = currentCard.a; });
  gid('btn-audio').addEventListener('click', () => { if (currentCard) Audio.speak(currentCard.q); });
  gid('btn-again').addEventListener('click', () => rate(0));
  gid('btn-good').addEventListener('click', () => rate(4));
  gid('btn-easy').addEventListener('click', () => rate(5));
  Editor.init();
  loadDue();
});

async function rate(q) {
  if (!currentCard || !Deck.db) return;
  SM2.calcInterval(currentCard, q);
  await Deck.init();
  await Deck.save(currentCard);
  currentDeck = currentDeck.filter(c => c.id !== currentCard.id);
  if (currentDeck.length) { currentCard = currentDeck[0]; gid('card-front').textContent = currentCard.q; gid('sm2-info').textContent = 'Intervallo: ' + currentCard.interval + ' giorni — EF: ' + currentCard.ef.toFixed(2); }
  else { gid('card-front').textContent = 'Completato!'; gid('sm2-info').textContent = 'Tutte le card dovute completate.'; }
}
